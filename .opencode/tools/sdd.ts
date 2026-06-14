import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync, spawn } from "child_process"


// Helper to resolve state path
const getStateFilePath = (context: any) => {
  const root = context.worktree || context.directory || process.cwd()
  return path.resolve(root, ".openspec/sdd_state.json")
}

// Helper to resolve metrics path
const getMetricsFilePath = (root: string) => {
  return path.resolve(root, ".openspec/.sdd_session_metrics.json")
}

// Helper to read state
const readState = (filePath: string) => {
  const defaultState = {
    phase: "F0_DETECT",
    activeContract: "",
    stack: {
      core: [],
      databases: []
    },
    updatedAt: new Date().toISOString()
  }
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"))
    }
  } catch (e) {
    // ignore parsing errors
  }
  return defaultState
}

// Helper to write state
const writeState = (filePath: string, state: any) => {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  state.updatedAt = new Date().toISOString()
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8")
}

// Helper to read session metrics
const readMetrics = (metricsPath: string): any => {
  try {
    if (fs.existsSync(metricsPath)) {
      return JSON.parse(fs.readFileSync(metricsPath, "utf8"))
    }
  } catch (e) {
    // ignore
  }
  return null
}

// Format duration in human-readable minutes
const formatDuration = (ms: number): string => {
  if (!ms || ms < 0) return "0 min"
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds} s`
  if (seconds === 0) return `${minutes} min`
  return `${minutes} min ${seconds} s`
}

// Format cost as USD
const formatCost = (cost: number): string => {
  if (typeof cost !== "number" || !Number.isFinite(cost)) return "$0.00"
  if (cost < 0.001) return `$${cost.toFixed(5)}`
  if (cost < 1) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(3)}`
}

// Format integer with thousands separator
const formatInt = (n: number): string => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "0"
  return Math.round(n).toLocaleString("en-US")
}

// Build the session summary object from raw metrics + state
const buildSummary = (metrics: any, contractName: string, closedAt: string) => {
  const startedAt = metrics?.startedAt || closedAt
  const startedMs = Date.parse(startedAt) || Date.parse(closedAt)
  const closedMs = Date.parse(closedAt)
  const durationMs = Math.max(0, closedMs - startedMs)
  const durationMinutes = +(durationMs / 60000).toFixed(2)

  const totals = metrics?.totals || { cost: 0, tokensIn: 0, tokensOutput: 0, messages: 0 }
  const byAgentRaw = metrics?.byAgent || {}
  const byAgent = Object.entries(byAgentRaw)
    .map(([agent, m]: [string, any]) => ({
      agent,
      cost: +(m.cost || 0).toFixed(6),
      tokensIn: m.tokensIn || 0,
      tokensOutput: m.tokensOutput || 0,
      messages: m.messages || 0,
    }))
    .sort((a, b) => b.cost - a.cost)

  return {
    contractName,
    sessionId: metrics?.sessionId || "",
    startedAt,
    closedAt,
    durationMs,
    durationMinutes,
    totals: {
      cost: +totals.cost.toFixed(6),
      tokensIn: totals.tokensIn || 0,
      tokensOutput: totals.tokensOutput || 0,
      messages: totals.messages || 0,
    },
    byAgent,
  }
}

// Render the human-readable markdown
const renderSummaryMd = (summary: any): string => {
  const lines: string[] = []
  lines.push(`# Resumen de Sesión SDD`)
  lines.push(``)
  lines.push(`* **Contrato**: \`${summary.contractName}\``)
  lines.push(`* **Cerrado**: ${summary.closedAt}`)
  lines.push(`* **Duración**: ${formatDuration(summary.durationMs)} (${summary.durationMinutes} min)`)
  lines.push(``)
  lines.push(`## Totales`)
  lines.push(``)
  lines.push(`| Métrica | Valor |`)
  lines.push(`|---|---|`)
  lines.push(`| Costo | ${formatCost(summary.totals.cost)} |`)
  lines.push(`| Tokens entrada | ${formatInt(summary.totals.tokensIn)} |`)
  lines.push(`| Tokens salida | ${formatInt(summary.totals.tokensOutput)} |`)
  lines.push(`| Mensajes asistente | ${formatInt(summary.totals.messages)} |`)
  lines.push(``)

  if (summary.byAgent.length > 0) {
    lines.push(`## Por agente`)
    lines.push(``)
    lines.push(`| Agente | Costo | Tokens in | Tokens out | Mensajes |`)
    lines.push(`|---|---|---|---|---|`)
    for (const a of summary.byAgent) {
      lines.push(`| \`${a.agent}\` | ${formatCost(a.cost)} | ${formatInt(a.tokensIn)} | ${formatInt(a.tokensOutput)} | ${a.messages} |`)
    }
    lines.push(``)
  }

  lines.push(`## Conclusión`)
  lines.push(``)
  lines.push(`> **${formatDuration(summary.durationMs)}** · **${formatCost(summary.totals.cost)}** · **${formatInt(summary.totals.tokensIn + summary.totals.tokensOutput)} tokens** totales · **${summary.byAgent.length} agentes**.`)
  lines.push(``)
  return lines.join("\n")
}

// Append (or upsert) a single line in the global _sessions.jsonl
const upsertSessionsLog = (archiveDir: string, summary: any) => {
  const logPath = path.join(archiveDir, "_sessions.jsonl")
  const line = JSON.stringify({
    contractName: summary.contractName,
    sessionId: summary.sessionId,
    startedAt: summary.startedAt,
    closedAt: summary.closedAt,
    durationMinutes: summary.durationMinutes,
    cost: summary.totals.cost,
    tokensIn: summary.totals.tokensIn,
    tokensOutput: summary.totals.tokensOutput,
    messages: summary.totals.messages,
  })

  let existing: string[] = []
  if (fs.existsSync(logPath)) {
    try {
      existing = fs.readFileSync(logPath, "utf8").split("\n").filter((l) => l.trim().length > 0)
    } catch (e) {
      existing = []
    }
  }

  // Deduplicate by contractName (replace previous entry if any)
  const filtered = existing.filter((l) => {
    try {
      const obj = JSON.parse(l)
      return obj?.contractName !== summary.contractName
    } catch {
      return true
    }
  })
  filtered.push(line)

  fs.writeFileSync(logPath, filtered.join("\n") + "\n", "utf8")
}

// Clear the metrics file once consumed
const clearMetrics = (metricsPath: string) => {
  try {
    if (fs.existsSync(metricsPath)) {
      fs.unlinkSync(metricsPath)
    }
  } catch (e) {
    // best-effort
  }
}

// Write the session summary files into the archived contract folder
const writeSessionSummary = (archiveFolder: string, root: string) => {
  try {
    if (!fs.existsSync(archiveFolder)) return null
    const metricsPath = getMetricsFilePath(root)
    const metrics = readMetrics(metricsPath)
    const folderName = path.basename(archiveFolder)
    const closedAt = new Date().toISOString()
    const summary = buildSummary(metrics, folderName, closedAt)

    const jsonPath = path.join(archiveFolder, "session_summary.json")
    const mdPath = path.join(archiveFolder, "session_summary.md")
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), "utf8")
    fs.writeFileSync(mdPath, renderSummaryMd(summary), "utf8")

    const archiveDir = path.dirname(archiveFolder)
    upsertSessionsLog(archiveDir, summary)

    // Clean up the transient metrics file once consumed
    clearMetrics(metricsPath)

    return summary
  } catch (e) {
    return null
  }
}

// Tool: sdd_set_phase (file sdd.ts, export set_phase -> sdd_set_phase)
export const set_phase = tool({
  description: "Establece la fase activa del ciclo de desarrollo SDD (F0_DETECT, F1_CONTRACT, F2_IMPLEMENTATION, F3_VERIFICATION, F4_DEPLOYMENT). Si phase=F1_CONTRACT y se pasa spec_name, crea la carpeta del spec atómicamente y devuelve la ruta absoluta. Si phase=F3_VERIFICATION, ejecuta auto-lint (no bloqueante, solo informativo) y aborta si hay errores de lint.",
  args: {
    phase: tool.schema.enum(["F0_DETECT", "F1_CONTRACT", "F2_IMPLEMENTATION", "F3_VERIFICATION", "F4_DEPLOYMENT"]).describe("La fase a establecer"),
    activeContract: tool.schema.string().optional().describe("La ruta o nombre del archivo de contrato JSON activo (.openspec/specs/XXXX_TIMESTAMP_NAME/contract.json)"),
    coreStack: tool.schema.array(tool.schema.string()).optional().describe("Tecnologías base del stack detectado"),
    databases: tool.schema.array(tool.schema.string()).optional().describe("Bases de datos añadidas al stack"),
    spec_name: tool.schema.string().optional().describe("(Solo F1_CONTRACT) Nombre del spec en minúsculas y guiones. Si se pasa junto con phase=F1_CONTRACT, crea la carpeta del spec atómicamente y devuelve la ruta completa."),
    skip_lint_gate: tool.schema.boolean().default(false).describe("(Solo F3_VERIFICATION) Si true, no ejecuta el auto-lint gate."),
  },
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()
    const filePath = getStateFilePath(context)
    const currentState = readState(filePath)

    // Auto-create spec folder atomically when entering F1_CONTRACT with spec_name
    let autoCreatedContract: string | null = null
    if (args.phase === "F1_CONTRACT" && args.spec_name) {
      const specsDir = path.resolve(root, ".openspec/specs")
      if (!fs.existsSync(specsDir)) {
        fs.mkdirSync(specsDir, { recursive: true })
      }
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, "0")
      const dd = String(now.getDate()).padStart(2, "0")
      const hh = String(now.getHours()).padStart(2, "0")
      const mi = String(now.getMinutes()).padStart(2, "0")
      const ss = String(now.getSeconds()).padStart(2, "0")
      const folderName = `${yyyy}-${mm}-${dd}__${hh}-${mi}-${ss}_${args.spec_name}`
      const targetFolder = path.join(specsDir, folderName)
      fs.mkdirSync(targetFolder, { recursive: true })
      autoCreatedContract = path.relative(root, path.join(targetFolder, "contract.json"))
    }

    // Auto-archive the active spec folder when resetting to F0_DETECT
    if (args.phase === "F0_DETECT" && currentState.activeContract) {
      const contractPath = path.resolve(root, currentState.activeContract)
      if (fs.existsSync(contractPath)) {
        const specFolder = path.dirname(contractPath)
        const archiveDir = path.resolve(root, ".openspec/archive")
        if (!fs.existsSync(archiveDir)) {
          fs.mkdirSync(archiveDir, { recursive: true })
        }
        const folderName = path.basename(specFolder)
        const targetArchiveFolder = path.join(archiveDir, folderName)

        try {
          fs.renameSync(specFolder, targetArchiveFolder)
        } catch (e) {
          // ignore or log
        }

        // Write session summary into the just-archived folder
        writeSessionSummary(targetArchiveFolder, root)
      }
    }

    if (args.phase === "F4_DEPLOYMENT") {
      try {
        execSync("docker info", { stdio: "ignore" })
      } catch (e) {
        try {
          execSync("open -a Docker", { stdio: "ignore" })
        } catch (err) {}
      }
    }

    // Auto-lint gate on transition to F3_VERIFICATION
    let lintWarning: string | null = null
    if (args.phase === "F3_VERIFICATION" && !args.skip_lint_gate) {
      try {
        const out = execSync("npx eslint src/ --quiet 2>&1 || true", {
          cwd: root,
          encoding: "utf8",
          timeout: 120_000,
        })
        if (out.toLowerCase().includes("error") || out.trim().length > 0) {
          lintWarning = `Lint encontró posibles errores. Considere abortar la transición a F3 y volver a F2:\n${out.slice(0, 1000)}`
        }
      } catch (e) {
        // best-effort, no abortamos
      }
    }

    currentState.phase = args.phase
    if (autoCreatedContract) {
      currentState.activeContract = autoCreatedContract
    } else if (args.activeContract !== undefined) {
      currentState.activeContract = args.activeContract
    }
    if (args.coreStack !== undefined) currentState.stack.core = args.coreStack
    if (args.databases !== undefined) currentState.stack.databases = args.databases

    // If resetting to F0_DETECT, ensure everything is 100% clean
    if (args.phase === "F0_DETECT") {
      // Clean up running servers
      const pidFile = getPidFilePath(root)
      if (fs.existsSync(pidFile)) {
        try {
          const pid = parseInt(fs.readFileSync(pidFile, "utf8").trim(), 10)
          if (!isNaN(pid)) {
            try { process.kill(-pid, "SIGKILL") } catch (err) {
              try { process.kill(pid, "SIGKILL") } catch (err2) {}
            }
          }
          fs.unlinkSync(pidFile)
        } catch (e) {}
      }

      currentState.activeContract = ""
      currentState.stack.core = []
      currentState.stack.databases = []

      // Clean up empty directories in .openspec/specs/
      try {
        const specsDir = path.resolve(root, ".openspec/specs")
        if (fs.existsSync(specsDir)) {
          const files = fs.readdirSync(specsDir)
          for (const f of files) {
            const fullPath = path.join(specsDir, f)
            if (fs.statSync(fullPath).isDirectory()) {
              const subfiles = fs.readdirSync(fullPath)
              if (subfiles.length === 0) {
                fs.rmdirSync(fullPath)
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }

      // Clean up transient Playwright folders
      try {
        const playwrightTmpDir = path.resolve(root, ".openspec/.playwright")
        if (fs.existsSync(playwrightTmpDir)) {
          fs.rmSync(playwrightTmpDir, { recursive: true, force: true })
        }
      } catch (e) {
        // ignore
      }
    }

    writeState(filePath, currentState)

    const response: any = {
      status: lintWarning ? "WARNING" : "SUCCESS",
      message: `Fase transicionada exitosamente a ${currentState.phase}`,
      state: currentState,
    }
    if (autoCreatedContract) {
      response.activeContract = autoCreatedContract
      response.message = `Fase F1_CONTRACT activada con spec folder creado atómicamente: ${autoCreatedContract}`
    }
    if (lintWarning) {
      response.lintWarning = lintWarning
    }
    return JSON.stringify(response, null, 2)
  }
})

// Tool: sdd_get_state (file sdd.ts, export get_state -> sdd_get_state)
export const get_state = tool({
  description: "Obtiene el estado de desarrollo actual (fase activa, contrato seleccionado, stack validado)",
  args: {},
  async execute(args, context) {
    const filePath = getStateFilePath(context)
    const currentState = readState(filePath)
    return JSON.stringify(currentState, null, 2)
  }
})

// Tool: sdd_create_spec_folder (file sdd.ts, export create_spec_folder -> sdd_create_spec_folder)
export const create_spec_folder = tool({
  description: "Crea una nueva carpeta ordenada para la especificación del cambio (formato: yyyy-mm-dd__hh-mm-ss_nombre)",
  args: {
    name: tool.schema.string().describe("Nombre del cambio en minúsculas y separado por guiones (ej. sumar-endpoint)")
  },
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()
    const specsDir = path.resolve(root, ".openspec/specs")

    if (!fs.existsSync(specsDir)) {
      fs.mkdirSync(specsDir, { recursive: true })
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}__${hours}-${minutes}-${seconds}`
    const folderName = `${formattedDate}_${args.name}`
    const targetFolder = path.join(specsDir, folderName)

    fs.mkdirSync(targetFolder, { recursive: true })

    return JSON.stringify({
      status: "SUCCESS",
      folderName,
      folderPath: path.relative(root, targetFolder)
    }, null, 2)
  }
})

// Helper to get PID file path
const getPidFilePath = (root: string) => {
  return path.resolve(root, ".openspec/dev_server.pid")
}

// Tool: sdd_free_port
export const free_port = tool({
  description: "Busca y termina de manera forzada cualquier proceso que esté escuchando en un puerto específico",
  args: {
    port: tool.schema.number().describe("El puerto a liberar (ej. 3000 o 8000)")
  },
  async execute(args, context) {
    const port = args.port
    try {
      const pid = execSync(`lsof -t -i :${port}`).toString().trim()
      if (pid) {
        execSync(`kill -9 ${pid.split('\n').join(' ')}`)
        return JSON.stringify({
          status: "SUCCESS",
          message: `Puerto ${port} liberado. Procesos terminados: ${pid.split('\n').join(', ')}`
        }, null, 2)
      }
      return JSON.stringify({
        status: "SUCCESS",
        message: `Puerto ${port} ya estaba libre (no se encontraron procesos)`
      }, null, 2)
    } catch (e) {
      return JSON.stringify({
        status: "SUCCESS",
        message: `Puerto ${port} está libre`
      }, null, 2)
    }
  }
})

// Tool: sdd_start_server
export const start_server = tool({
  description: "Inicia un servidor de desarrollo o producción en segundo plano y registra su PID para limpieza posterior",
  args: {
    command: tool.schema.string().describe("Comando para iniciar el servidor (ej. 'yarn dev' o 'npm run dev')"),
    port: tool.schema.number().optional().default(3000).describe("Puerto esperado del servidor (default: 3000)"),
    cwd: tool.schema.string().optional().describe("Directorio de trabajo para ejecutar el comando")
  },
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()
    const targetCwd = args.cwd ? path.resolve(root, args.cwd) : root
    const pidFile = getPidFilePath(root)

    try {
      const existingPid = execSync(`lsof -t -i :${args.port}`).toString().trim()
      if (existingPid) {
        execSync(`kill -9 ${existingPid.split('\n').join(' ')}`)
      }
    } catch (e) {
      // ignore
    }

    const parts = args.command.split(" ")
    const cmd = parts[0]
    const cmdArgs = parts.slice(1)

    const child = spawn(cmd, cmdArgs, {
      cwd: targetCwd,
      detached: true,
      stdio: "ignore",
      env: {
        ...process.env,
        PORT: String(args.port)
      }
    })

    child.unref()

    const pid = child.pid
    if (pid) {
      const dir = path.dirname(pidFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(pidFile, String(pid), "utf8")

      await new Promise(resolve => setTimeout(resolve, 3000))

      return JSON.stringify({
        status: "SUCCESS",
        message: `Servidor iniciado con PID ${pid} ejecutando '${args.command}' en puerto ${args.port}`,
        pid
      }, null, 2)
    }

    return JSON.stringify({
      status: "ERROR",
      message: `No se pudo obtener el PID del proceso para el comando '${args.command}'`
    }, null, 2)
  }
})

// Tool: sdd_stop_server
export const stop_server = tool({
  description: "Detiene el servidor en segundo plano usando el PID registrado",
  args: {},
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()
    const pidFile = getPidFilePath(root)

    if (fs.existsSync(pidFile)) {
      try {
        const pidStr = fs.readFileSync(pidFile, "utf8").trim()
        const pid = parseInt(pidStr, 10)
        if (!isNaN(pid)) {
          try {
            process.kill(-pid, "SIGKILL")
          } catch (err) {
            try {
              process.kill(pid, "SIGKILL")
            } catch (err2) {
              // ignore
            }
          }
          fs.unlinkSync(pidFile)
          return JSON.stringify({
            status: "SUCCESS",
            message: `Servidor con PID ${pid} terminado exitosamente`
          }, null, 2)
        }
      } catch (e) {
        return JSON.stringify({
          status: "ERROR",
          message: `Error al intentar detener el servidor: ${(e as Error).message}`
        }, null, 2)
      }
    }

    return JSON.stringify({
      status: "SUCCESS",
      message: "No hay ningún servidor registrado activo"
    }, null, 2)
  }
})

// Tool: sdd_select_design
export const select_design = tool({
  description: "Copia fielmente el archivo DESIGN.md y sus ejemplos y recursos interactivos asociados desde el catálogo original de oh-my-design a la carpeta .openspec/ del proyecto.",
  args: {
    brandId: tool.schema.string().describe("ID exacto del diseño en oh-my-design (ej: 'linear.app', 'vercel', 'stripe')")
  },
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()
    const brandId = args.brandId.trim()
    const sourceDir = path.resolve(root, ".opencode/oh-my-design/design-md", brandId)
    const targetDir = path.resolve(root, ".openspec")

    if (!fs.existsSync(sourceDir)) {
      // Try resolving with substring match if not found exactly
      const catalogDir = path.resolve(root, ".opencode/oh-my-design/design-md")
      if (fs.existsSync(catalogDir)) {
        const brands = fs.readdirSync(catalogDir)
        const match = brands.find(b => b.toLowerCase() === brandId.toLowerCase() || b.toLowerCase().includes(brandId.toLowerCase()))
        if (match && match !== brandId) {
          // Resolved to a different brandId; re-run with the exact match.
          // We delegate to a helper to avoid `this.execute` type issues.
          return selectDesignHelper(match, context)
        }
      }
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró el directorio de diseño para la marca "${brandId}" en ${sourceDir}`
      }, null, 2)
    }

    return selectDesignHelper(brandId, context)
  }
})

// Helper extracted to allow substring-match recursion without `this.execute` typing issues.
async function selectDesignHelper(brandId: string, context: any) {
    const root = context.worktree || context.directory || process.cwd()
    const sourceDir = path.resolve(root, ".opencode/oh-my-design/design-md", brandId)
    const targetDir = path.resolve(root, ".openspec")

    if (!fs.existsSync(sourceDir)) {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró el directorio de diseño para la marca "${brandId}" en ${sourceDir}`
      }, null, 2)
    }

    // Single canonical path: ONLY design-assets/<brandId>/ (no root DESIGN.md)
    // Reason: extract-design-pattern.py and the rest of the toolchain already
    // look up `preview.html` / `preview-dark.html` from this subfolder. The
    // duplicate .openspec/DESIGN.md caused three-way drift between catalog
    // and project copies. The skill sdd-quickstart points to design-assets/.

    // 1. Copy accompanying files (HTML previews, README, DESIGN.md, etc.) to a brand subfolder in .openspec
    const targetBrandDir = path.join(targetDir, "design-assets", brandId)
    if (!fs.existsSync(targetBrandDir)) {
      fs.mkdirSync(targetBrandDir, { recursive: true })
    }

    const copiedFiles: string[] = []
    const sourceDesign = path.join(sourceDir, "DESIGN.md")
    if (!fs.existsSync(sourceDesign)) {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró el archivo DESIGN.md en la ruta origen: ${sourceDesign}`
      }, null, 2)
    }

    const files = fs.readdirSync(sourceDir)
    for (const file of files) {
      if (file.startsWith(".")) continue
      const srcFile = path.join(sourceDir, file)
      const dstFile = path.join(targetBrandDir, file)
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, dstFile)
        copiedFiles.push(file)
      }
    }

    // 2. Remove the legacy .openspec/DESIGN.md if it exists to enforce single canonical path
    const legacyDesign = path.join(targetDir, "DESIGN.md")
    if (fs.existsSync(legacyDesign)) {
      try { fs.unlinkSync(legacyDesign) } catch (e) { /* ignore */ }
    }

    return JSON.stringify({
      status: "SUCCESS",
      message: `Diseño "${brandId}" copiado a la ruta canónica .openspec/design-assets/${brandId}/ (legacy .openspec/DESIGN.md eliminado si existía)`,
      copiedFiles,
      designAssetsDir: path.relative(root, targetBrandDir),
      canonicalDesignPath: path.relative(root, path.join(targetBrandDir, "DESIGN.md")),
    }, null, 2)
}

// =====================================================================
// NEW TOOLS (zugzbot-v2 optimization plan)
// =====================================================================

// Curated subset of brands with HTML+CSS interactive previews.
// These are the brands the orchestrator should recommend first because
// they have usable assets in `.opencode/oh-my-design/design-md/<brandId>/`.
const RECOMMENDED_BRANDS: Record<string, { id: string; name: string; category: string; vibe: string }[]> = {
  saas: [
    { id: "supabase", name: "Supabase", category: "saas", vibe: "Open-source Firebase alternative, dark-mode-first, dense data UI" },
    { id: "linear.app", name: "Linear", category: "saas", vibe: "Issue tracking premium, ultra-fast keyboard-first, monochrome" },
    { id: "vercel", name: "Vercel", category: "saas", vibe: "Vercel/Next.js native, mono+geist font, gradient accents" },
    { id: "raycast", name: "Raycast", category: "saas", vibe: "Productivity launcher, sharp corners, command-bar UX" },
    { id: "posthog", name: "PostHog", category: "saas", vibe: "Product analytics, orange accent, fun playful tone" },
  ],
  fintech: [
    { id: "stripe", name: "Stripe", category: "fintech", vibe: "Premium payments, gradient brand, dense docs" },
    { id: "revolut", name: "Revolut", category: "fintech", vibe: "Neobank, dark+violet, large numbers" },
    { id: "wise", name: "Wise", category: "fintech", vibe: "Cross-border money, bright green, friendly tone" },
    { id: "toss", name: "Toss", category: "fintech", vibe: "Korean super-app, blue primary, imperative microcopy" },
  ],
  ecommerce: [
    { id: "airbnb", name: "Airbnb", category: "ecommerce", vibe: "Travel marketplace, coral accent, photographic" },
    { id: "apple", name: "Apple", category: "ecommerce", vibe: "Hardware store, ultra-minimal, SF Pro typography" },
    { id: "nike", name: "Nike", category: "ecommerce", vibe: "Athletic brand, black+volt, UPPERCASE bold, flat" },
    { id: "shopify", name: "Shopify", category: "ecommerce", vibe: "E-commerce platform, green primary, merchant-focused" },
  ],
  consumer: [
    { id: "spotify", name: "Spotify", category: "consumer", vibe: "Music streaming, green+dark, immersive cards" },
    { id: "figma", name: "Figma", category: "consumer", vibe: "Design tool, multi-color, playful professional" },
    { id: "notion", name: "Notion", category: "consumer", vibe: "Productivity, minimal, document-first" },
  ],
}

// Tool: sdd_list_design_recommendations
// Returns a curated short-list of design brands grouped by category.
// Saves the orchestrator from 3-4 separate `oh-my-design_list_references` calls.
export const list_design_recommendations = tool({
  description: "Devuelve una lista curada y corta de marcas de diseño recomendadas (con assets HTML+CSS interactivos), filtrada por categoría de uso. Reemplaza 3-4 llamadas a oh-my-design_list_references en F0.",
  args: {
    use_case: tool.schema.enum(["saas", "fintech", "ecommerce", "consumer", "all"]).default("all").describe("Categoría del proyecto para filtrar marcas relevantes"),
    max_per_category: tool.schema.number().default(3).describe("Máximo de marcas a devolver por categoría"),
  },
  async execute(args, context) {
    const useCase = args.use_case
    const maxPer = Math.max(1, Math.min(args.max_per_category || 3, 6))

    if (useCase === "all") {
      const result: Record<string, any[]> = {}
      for (const cat of Object.keys(RECOMMENDED_BRANDS)) {
        result[cat] = RECOMMENDED_BRANDS[cat].slice(0, maxPer)
      }
      return JSON.stringify({
        status: "SUCCESS",
        message: `Recomendaciones de diseño curadas (top ${maxPer} por categoría)`,
        recommendations: result,
        note: "Estas marcas tienen preview.html/preview-dark.html en .opencode/oh-my-design/design-md/. Para marcas adicionales usa oh-my-design_list_references.",
      }, null, 2)
    }

    const list = RECOMMENDED_BRANDS[useCase] || []
    return JSON.stringify({
      status: "SUCCESS",
      message: `Recomendaciones de diseño para use_case="${useCase}"`,
      recommendations: { [useCase]: list.slice(0, maxPer) },
      note: "Estas marcas tienen preview.html/preview-dark.html en .opencode/oh-my-design/design-md/.",
    }, null, 2)
  }
})

// Tool: sdd_apply_brand_tokens
// Injects brand-specific CSS custom properties into the project's globals.css
// without removing the shadcn theme variables. Prevents the recurring
// "Cannot apply unknown utility class `border-border`" build error.
export const apply_brand_tokens = tool({
  description: "Inyecta tokens de diseño de marca (colores, tipografía, radius) en src/app/globals.css preservando las variables shadcn (--color-border, --color-background, etc.). Usar en F2 cuando se necesite aplicar el tema de marca.",
  args: {
    tokens: tool.schema.string().describe("JSON stringificado con {colors: {...}, typography: {...}, radius: {...}} extraído de contract.json design.tokens"),
  },
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()
    const globalsPath = path.resolve(root, "src/app/globals.css")

    if (!fs.existsSync(globalsPath)) {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró src/app/globals.css. Ejecuta primero el bootstrap de nextjs-shadcn.`,
      }, null, 2)
    }

    let brandTokens: any
    try {
      brandTokens = JSON.parse(args.tokens)
    } catch (e) {
      return JSON.stringify({
        status: "ERROR",
        message: `tokens no es JSON válido: ${(e as Error).message}`,
      }, null, 2)
    }

    const colors = brandTokens.colors || {}
    const typography = brandTokens.typography?.family || {}
    const radius = brandTokens.radius || {}

    // Build the brand CSS variables block. Preserves shadcn vars.
    const brandVarLines: string[] = []
    for (const [k, v] of Object.entries(colors)) {
      const safeName = String(k).replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()
      brandVarLines.push(`  --color-brand-${safeName}: ${v};`)
    }
    if (typography.sans) {
      brandVarLines.push(`  --font-sans: ${typography.sans};`)
      brandVarLines.push(`  --font-heading: ${typography.sans};`)
    }
    for (const [k, v] of Object.entries(radius)) {
      brandVarLines.push(`  --radius-${k}: ${v}px;`)
    }

    const brandBlock = `/* Brand tokens (injected by sdd_apply_brand_tokens) */
@theme inline {
${brandVarLines.join("\n")}
}
`

    let css = fs.readFileSync(globalsPath, "utf8")

    // Remove any previous brand block to keep this idempotent.
    css = css.replace(/\/\* Brand tokens[\s\S]*?\}\s*\n/g, "")

    // Append at the end. Existing shadcn @theme inline block remains untouched.
    css = css.trimEnd() + "\n\n" + brandBlock

    fs.writeFileSync(globalsPath, css, "utf8")

    return JSON.stringify({
      status: "SUCCESS",
      message: `Inyectados ${brandVarLines.length} tokens de marca en src/app/globals.css (preservando variables shadcn)`,
      globalsPath: path.relative(root, globalsPath),
      brandVariables: brandVarLines.length,
    }, null, 2)
  }
})

// Tool: sdd_generate_dockerfile
// Generates a production-ready multi-stage Dockerfile + .dockerignore +
// docker-compose.yml from the project stack in ~1 call. Replaces ~5 read
// + 3 write operations the deployer does manually.
export const generate_dockerfile = tool({
  description: "Genera Dockerfile multi-stage, .dockerignore y docker-compose.yml optimizados a partir del stack del proyecto (nextjs|fastapi). Detecta package manager desde package.json.",
  args: {
    stack: tool.schema.enum(["nextjs", "fastapi"]).describe("Stack del proyecto"),
    port: tool.schema.number().default(3000).describe("Puerto de la aplicación"),
  },
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()

    if (args.stack === "nextjs") {
      // Detect package manager
      let pm = "npm"
      let installCmd = "npm ci --frozen-lockfile"
      let buildCmd = "npm run build"
      if (fs.existsSync(path.resolve(root, "pnpm-lock.yaml"))) {
        pm = "pnpm"
        installCmd = "pnpm install --frozen-lockfile"
        buildCmd = "pnpm build"
      } else if (fs.existsSync(path.resolve(root, "yarn.lock"))) {
        pm = "yarn"
        installCmd = "yarn install --frozen-lockfile"
        buildCmd = "yarn build"
      }

      // Pin to node 20-alpine (most common, Next 16 compatible)
      const nodeImage = "node:20-alpine"

      const dockerfile = `# Stage 1: Dependencias
FROM ${nodeImage} AS deps
WORKDIR /app
COPY package.json ${pm === "npm" ? "package-lock.json* " : pm === "pnpm" ? "pnpm-lock.yaml* " : "yarn.lock* "}./
RUN ${installCmd}

# Stage 2: Constructor
FROM ${nodeImage} AS builder
WORKDIR /app
RUN corepack enable || true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${buildCmd}

# Stage 3: Ejecutor
FROM ${nodeImage} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \\
 && adduser --system --uid 1001 nextjs \\
 && mkdir -p public

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE ${args.port}
ENV PORT=${args.port}
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${args.port}', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
`

      const dockerignore = `node_modules
.next
.git
.opencode
.openspec
.env*
*.md
vitest.config.ts
*.test.ts
*.spec.ts
coverage
playwright-report
test-results
`

      const compose = `services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${args.port}:${args.port}"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:${args.port}', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
`

      const filesWritten: string[] = []
      for (const [name, content] of [
        ["Dockerfile", dockerfile],
        [".dockerignore", dockerignore],
        ["docker-compose.yml", compose],
      ] as const) {
        const fullPath = path.resolve(root, name)
        fs.writeFileSync(fullPath, content, "utf8")
        filesWritten.push(path.relative(root, fullPath))
      }

      return JSON.stringify({
        status: "SUCCESS",
        message: `Docker artifacts generados (${pm}, ${nodeImage}, puerto ${args.port})`,
        filesWritten,
        packageManager: pm,
        nodeImage,
      }, null, 2)
    }

    // fastapi path
    const dockerfilePy = `FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
EXPOSE ${args.port}
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "${args.port}"]
`
    const dockerignorePy = `__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
.git
.opencode
.openspec
.pytest_cache/
tests/
`
    const composePy = `services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${args.port}:${args.port}"
    environment:
      - ENV=production
    restart: unless-stopped
`
    const filesWritten: string[] = []
    for (const [name, content] of [
      ["Dockerfile", dockerfilePy],
      [".dockerignore", dockerignorePy],
      ["docker-compose.yml", composePy],
    ] as const) {
      const fullPath = path.resolve(root, name)
      fs.writeFileSync(fullPath, content, "utf8")
      filesWritten.push(path.relative(root, fullPath))
    }

    return JSON.stringify({
      status: "SUCCESS",
      message: `Docker artifacts generados para FastAPI (puerto ${args.port})`,
      filesWritten,
    }, null, 2)
  }
})

// Tool: sdd_quick_lint
// Runs the project linter against src/ only (avoiding the harness dir).
// Used by sdd_set_phase as a gate before transitioning to F3_VERIFICATION.
export const quick_lint = tool({
  description: "Ejecuta el linter del proyecto (eslint) restringido a src/. Devuelve exit code y warnings. Usado como gate automático antes de transicionar a F3.",
  args: {},
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()

    // Detect package manager scripts
    const pkgPath = path.resolve(root, "package.json")
    if (!fs.existsSync(pkgPath)) {
      return JSON.stringify({
        status: "ERROR",
        message: "No se encontró package.json. ¿Estás en un proyecto Next.js?",
      }, null, 2)
    }

    try {
      const out = execSync("npx eslint src/ --quiet --max-warnings 0 2>&1 || true", {
        cwd: root,
        encoding: "utf8",
        timeout: 120_000,
      })
      const hasErrors = out.toLowerCase().includes("error") || out.trim().length > 0
      return JSON.stringify({
        status: hasErrors ? "FAIL" : "SUCCESS",
        message: hasErrors ? "Lint encontró errores. Corrígelos antes de transicionar a F3." : "Lint limpio.",
        output: out.slice(0, 2000),
      }, null, 2)
    } catch (e: any) {
      return JSON.stringify({
        status: "FAIL",
        message: `Lint falló: ${e.message?.slice(0, 500) || "unknown error"}`,
      }, null, 2)
    }
  }
})


