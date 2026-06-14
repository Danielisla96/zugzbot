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
  description: "Establece la fase activa del ciclo de desarrollo SDD (F0_DETECT, F1_CONTRACT, F2_IMPLEMENTATION, F3_VERIFICATION, F4_DEPLOYMENT)",
  args: {
    phase: tool.schema.enum(["F0_DETECT", "F1_CONTRACT", "F2_IMPLEMENTATION", "F3_VERIFICATION", "F4_DEPLOYMENT"]).describe("La fase a establecer"),
    activeContract: tool.schema.string().optional().describe("La ruta o nombre del archivo de contrato JSON activo (.openspec/specs/XXXX_TIMESTAMP_NAME/contract.json)"),
    coreStack: tool.schema.array(tool.schema.string()).optional().describe("Tecnologías base del stack detectado"),
    databases: tool.schema.array(tool.schema.string()).optional().describe("Bases de datos añadidas al stack")
  },
  async execute(args, context) {
    const root = context.worktree || context.directory || process.cwd()
    const filePath = getStateFilePath(context)
    const currentState = readState(filePath)

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

    currentState.phase = args.phase
    if (args.activeContract !== undefined) currentState.activeContract = args.activeContract
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

    return JSON.stringify({
      status: "SUCCESS",
      message: `Fase transicionada exitosamente a ${currentState.phase}`,
      state: currentState
    }, null, 2)
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
        if (match) {
          return this.execute({ brandId: match }, context)
        }
      }
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró el directorio de diseño para la marca "${brandId}" en ${sourceDir}`
      }, null, 2)
    }

    // 1. Copy DESIGN.md
    const sourceDesign = path.join(sourceDir, "DESIGN.md")
    const targetDesign = path.join(targetDir, "DESIGN.md")
    if (fs.existsSync(sourceDesign)) {
      fs.copyFileSync(sourceDesign, targetDesign)
    } else {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró el archivo DESIGN.md en la ruta origen: ${sourceDesign}`
      }, null, 2)
    }

    // 2. Copy accompanying files (HTML previews, README, etc.) to a brand subfolder in .openspec
    const targetBrandDir = path.join(targetDir, "design-assets", brandId)
    if (!fs.existsSync(targetBrandDir)) {
      fs.mkdirSync(targetBrandDir, { recursive: true })
    }

    const copiedFiles: string[] = []
    const files = fs.readdirSync(sourceDir)
    for (const file of files) {
      if (file === "DESIGN.md" || file.startsWith(".")) continue
      const srcFile = path.join(sourceDir, file)
      const dstFile = path.join(targetBrandDir, file)
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, dstFile)
        copiedFiles.push(file)
      }
    }

    return JSON.stringify({
      status: "SUCCESS",
      message: `Diseño "${brandId}" copiado exitosamente a .openspec/DESIGN.md`,
      copiedFiles,
      designAssetsDir: path.relative(root, targetBrandDir)
    }, null, 2)
  }
})



