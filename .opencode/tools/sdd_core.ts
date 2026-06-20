import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { RECOMMENDED_BRANDS } from "./sdd_design"

// Helper to safely resolve root directory (avoiding OpenCode bug where worktree is '/' in non-git repos)
const getRoot = (context: any) => {
  if (context?.directory && context.directory !== "/") return context.directory;
  if (context?.worktree && context.worktree !== "/") return context.worktree;
  if (context?.cwd && context.cwd !== "/") return context.cwd;
  return process.cwd();
};

// Helper to resolve state path
const getStateFilePath = (context: any) => {
  const root = getRoot(context)
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

// Helper to get PID file path
const getPidFilePath = (root: string) => {
  return path.resolve(root, ".openspec/dev_server.pid")
}

// Tool: sdd_set_phase (file sdd_core.ts, export set_phase -> sdd_set_phase)
export const set_phase = tool({
  description: "Establece la fase activa del ciclo de desarrollo SDD.",
  args: {
    phase: tool.schema.enum(["F0_DETECT", "F1_CONTRACT", "F2_IMPLEMENTATION", "F3_VERIFICATION", "F4_DEPLOYMENT"]).describe("La fase a establecer"),
    activeContract: tool.schema.string().optional().describe("La ruta o nombre del archivo de contrato JSON activo (.openspec/specs/XXXX_TIMESTAMP_NAME/contract.json)"),
    coreStack: tool.schema.array(tool.schema.string()).optional().describe("Tecnologías base del stack detectado"),
    databases: tool.schema.array(tool.schema.string()).optional().describe("Bases de datos añadidas al stack"),
    spec_name: tool.schema.string().optional().describe("(Solo F1_CONTRACT) Nombre del spec en minúsculas y guiones. Si se pasa junto con phase=F1_CONTRACT, crea la carpeta del spec atómicamente y devuelve la ruta completa."),
    skip_lint_gate: tool.schema.boolean().default(false).describe("(Solo F3_VERIFICATION) Si true, no ejecuta el auto-lint gate."),
    loopMode: tool.schema.boolean().optional().describe("Establece si el modo piloto automático (/loop) está activado para tomar decisiones autónomas de forma acumulativa."),
    loopTargetIterations: tool.schema.number().optional().describe("Número total de iteraciones autónomas deseadas en el ciclo de mejora continua."),
    loopCurrentIteration: tool.schema.number().optional().describe("Número de la iteración autónoma actual (empieza en 1)."),
  },
  async execute(args, context) {
    const root = getRoot(context)
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
      // Wait up to 60s for Docker daemon to be ready (macOS open -a Docker fallback)
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      for (let i = 0; i < 12; i++) {
        try {
          execSync("docker info", { stdio: "ignore", timeout: 3000 })
          break // ready!
        } catch (e) {
          if (i === 0) {
            try { execSync("open -a Docker", { stdio: "ignore" }) } catch (err) {}
          }
          await sleep(5000)
        }
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
        const isCircularError = out.toLowerCase().includes("converting circular structure") || out.toLowerCase().includes("circular structure")
        if (out.toLowerCase().includes("error") || (out.trim().length > 0 && !isCircularError)) {
          lintWarning = `Lint encontró posibles errores. Considere abortar la transición a F3 y volver a F2:\n${out.slice(0, 1000)}`
        } else if (isCircularError) {
          console.log("[set_phase] Ignorado falso positivo circular de ESLint.")
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
    if (args.loopMode !== undefined) currentState.loopMode = args.loopMode
    if (args.loopTargetIterations !== undefined) currentState.loopTargetIterations = args.loopTargetIterations
    if (args.loopCurrentIteration !== undefined) currentState.loopCurrentIteration = args.loopCurrentIteration

    // If resetting to F0_DETECT, ensure everything is 100% clean
    if (args.phase === "F0_DETECT") {
      if (args.loopMode === undefined && args.loopCurrentIteration === undefined) {
        currentState.loopMode = false
        currentState.loopTargetIterations = 1
        currentState.loopCurrentIteration = 1
      }
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

      // Clean up stale screenshots from previous sessions (.openspec/ts-*.png)
      try {
        const openspecDir = path.resolve(root, ".openspec")
        if (fs.existsSync(openspecDir)) {
          const entries = fs.readdirSync(openspecDir)
          let cleanedCount = 0
          for (const entry of entries) {
            if (/^ts-.*\.(png|jpe?g|webp)$/i.test(entry)) {
              try {
                fs.unlinkSync(path.join(openspecDir, entry))
                cleanedCount++
              } catch (e) { /* ignore individual file errors */ }
            }
          }
          if (cleanedCount > 0) {
            ;(currentState as any).cleanedScreenshots = cleanedCount
          }
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

// Tool: sdd_get_state (file sdd_core.ts, export get_state -> sdd_get_state)
export const get_state = tool({
  description: "Obtiene el estado de desarrollo actual.",
  args: {},
  async execute(args, context) {
    const filePath = getStateFilePath(context)
    const currentState = readState(filePath)
    return JSON.stringify(currentState, null, 2)
  }
})

// Tool: sdd_get_initial_session_data
export const get_initial_session_data = tool({
  description: "Obtiene de forma atómica el estado actual, memorias del Brain y recomendaciones Oh My Design.",
  args: {},
  async execute(args, context) {
    const root = getRoot(context)
    const statePath = getStateFilePath(context)
    const currentState = readState(statePath)

    // Limpieza silenciosa de carpetas/screenshots transitorios al iniciar F0
    let cleanedCount = 0
    try {
      const playwrightTmpDir = path.resolve(root, ".openspec/.playwright")
      if (fs.existsSync(playwrightTmpDir)) {
        fs.rmSync(playwrightTmpDir, { recursive: true, force: true })
        cleanedCount++
      }
      const openspecDir = path.resolve(root, ".openspec")
      if (fs.existsSync(openspecDir)) {
        for (const entry of fs.readdirSync(openspecDir)) {
          if (/^ts-.*\.(png|jpe?g|webp)$/i.test(entry)) {
            try {
              fs.unlinkSync(path.join(openspecDir, entry))
              cleanedCount++
            } catch (e) { /* ignore */ }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // Read brain memory
    let brainMemory: any = { found: false }
    const brainFilePath = path.resolve(root, ".openspec/brain.md")
    if (fs.existsSync(brainFilePath)) {
      try {
        const content = fs.readFileSync(brainFilePath, "utf8") || ""
        const lines = content.split(/\r?\n/)
        const sections: Record<string, string[]> = {}
        let currentHeader = "general"
        for (const line of lines) {
          if (line.startsWith("# ")) {
            currentHeader = line.substring(2).trim().toLowerCase()
            sections[currentHeader] = []
          } else if (line.trim().length > 0) {
            if (!sections[currentHeader]) sections[currentHeader] = []
            sections[currentHeader].push(line)
          }
        }

        let prunedContent = ""
        for (const [header, bodyLines] of Object.entries(sections)) {
          const limit = 10
          const finalLines = bodyLines.slice(-limit)
          const formattedHeader = header.charAt(0).toUpperCase() + header.slice(1)
          prunedContent += `# ${formattedHeader}\n` + finalLines.join("\n") + "\n\n"
        }

        brainMemory = {
          found: true,
          content: prunedContent.trim()
        }
      } catch (e) {}
    }

    // Get design recommendations
    const recommendations = RECOMMENDED_BRANDS

    const response: any = {
      status: "SUCCESS",
      state: currentState,
      brainMemory,
      designRecommendations: recommendations,
      note: "Inicialización completada. No es necesario que llames a sdd_get_state, brain_read_memory o sdd_list_design_recommendations por separado."
    }
    if (cleanedCount > 0) {
      response.cleanedArtifacts = cleanedCount
      response.note += ` Se limpiaron ${cleanedCount} artefactos transitorios (.playwright, screenshots).`
    }
    return JSON.stringify(response, null, 2)
  }
})

// Tool: sdd_save_active_brief
export const save_active_brief = tool({
  description: "Guarda un resumen del spec activo en .openspec/active-brief.md como anclaje de contexto.",
  args: {
    brief: tool.schema.string().describe("Contenido en formato Markdown con el resumen del spec activo, componentes, diseño y dependencias.")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const openspecDir = path.resolve(root, ".openspec")
    if (!fs.existsSync(openspecDir)) {
      fs.mkdirSync(openspecDir, { recursive: true })
    }

    // Attempt to read the active contract path from sdd_state.json and extract files_affected
    let filesAffected: string[] = []
    let contract: any = null
    try {
      const statePath = path.resolve(openspecDir, "sdd_state.json")
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, "utf8"))
        if (state.activeContract) {
          const contractPath = path.resolve(root, state.activeContract)
          if (fs.existsSync(contractPath)) {
            contract = JSON.parse(fs.readFileSync(contractPath, "utf8"))
            if (contract && Array.isArray(contract.files_affected)) {
              filesAffected = contract.files_affected
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    let enrichedBrief = args.brief

    // Append structured section split if filesAffected is populated
    if (filesAffected.length > 0) {
      enrichedBrief += `\n\n## [CRITICAL] POLÍTICA DE ZERO-SEARCH Y PRUEBAS INCREMENTALES\n`
      enrichedBrief += `La lista de archivos exactos creados o modificados en este contrato es:\n`
      enrichedBrief += filesAffected.map(f => `- \`${f}\``).join("\n") + "\n\n"

      enrichedBrief += `### CODER_CONTEXT (F2)\n`
      enrichedBrief += `- Debes editar, crear y leer EXCLUSIVAMENTE estos archivos de producción: ${filesAffected.map(f => `\`${f}\``).join(", ")}.\n`
      enrichedBrief += `- PROHIBIDO utilizar glob o grep de manera exploratoria ciega.\n`
      enrichedBrief += `- **Batch extremo**: escribe/edita TODOS los archivos en una sola respuesta antes de validar.\n\n`

      enrichedBrief += `### TESTER_CONTEXT (F3)\n`
      enrichedBrief += `- Archivos de test asociados: src/__tests__/<feature_ref>.test.tsx\n`
      enrichedBrief += `- Ejecuta el linter de forma dirigida: \`npx eslint ${filesAffected.join(" ")}\`.\n`
      enrichedBrief += `- **NO explores** el código: todo lo que necesitas ya está inyectado en este brief.\n`
    }

    // Inyectar automáticamente Brain learnings + errors (regresiones)
    try {
      const brainPath = path.resolve(openspecDir, "brain.md")
      if (fs.existsSync(brainPath)) {
        const brainContent = fs.readFileSync(brainPath, "utf8") || ""
        const sections: Record<string, string[]> = {}
        let currentHeader = "general"
        for (const line of brainContent.split(/\r?\n/)) {
          if (line.startsWith("# ")) {
            currentHeader = line.substring(2).trim().toLowerCase()
            sections[currentHeader] = []
          } else if (line.trim().length > 0) {
            if (!sections[currentHeader]) sections[currentHeader] = []
            sections[currentHeader].push(line)
          }
        }
        const last = (cat: string, n: number) =>
          (sections[cat] || []).slice(-n).join("\n")

        const learnings = last("learnings", 5)
        const errors = last("errors", 5)
        const design = last("design", 3)

        if (learnings || errors || design) {
          enrichedBrief += `\n\n## [AUTO-INJECTED] Brain Memory (lecciones de sesiones previas)\n`
          if (design) {
            enrichedBrief += `\n### Design (aplicar en estilo):\n${design}\n`
          }
          if (learnings) {
            enrichedBrief += `\n### Learnings (patrones validados):\n${learnings}\n`
          }
          if (errors) {
            enrichedBrief += `\n### Errors / Regresiones (evitar repetir):\n${errors}\n`
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // Inyectar mockPatterns estándar si el stack es Next.js con React
    try {
      const isNext = contract?.stack?.core?.some((c: string) => /next\.?js/i.test(c))
      if (isNext) {
        enrichedBrief += `\n\n## [AUTO-INJECTED] Mock Patterns (Vitest + Testing Library)\n`
        enrichedBrief += `\`\`\`typescript\n`
        enrichedBrief += `// Mock dinámico de lucide-react (cualquier icono)\n`
        enrichedBrief += `vi.mock("lucide-react", () => new Proxy({}, {\n`
        enrichedBrief += `  get: (_t, prop) => {\n`
        enrichedBrief += `    const Icon = (props: any) => null;\n`
        enrichedBrief += `    Icon.displayName = String(prop);\n`
        enrichedBrief += `    return Icon;\n`
        enrichedBrief += `  },\n`
        enrichedBrief += `}));\n\n`
        enrichedBrief += `// Mock reactivo de next-themes para ThemeToggle\n`
        enrichedBrief += `let theme = "light";\n`
        enrichedBrief += `vi.mock("next-themes", () => ({\n`
        enrichedBrief += `  useTheme: () => ({\n`
        enrichedBrief += `    get theme() { return theme; },\n`
        enrichedBrief += `    setTheme: (t: string) => { theme = t; },\n`
        enrichedBrief += `    get resolvedTheme() { return theme; },\n`
        enrichedBrief += `  }),\n`
        enrichedBrief += `}));\n\n`
        enrichedBrief += `// Mock de next/navigation\n`
        enrichedBrief += `vi.mock("next/navigation", () => ({\n`
        enrichedBrief += `  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),\n`
        enrichedBrief += `  usePathname: () => "/",\n`
        enrichedBrief += `}));\n`
        enrichedBrief += `\`\`\`\n`
      }
    } catch (e) {
      // ignore
    }

    const briefPath = path.resolve(openspecDir, "active-brief.md")
    fs.writeFileSync(briefPath, enrichedBrief, "utf8")
    return JSON.stringify({
      status: "SUCCESS",
      message: `Brief de contexto de sistema guardado exitosamente en .openspec/active-brief.md`,
      filePath: briefPath,
      injectedSections: {
        brainMemory: enrichedBrief.includes("Brain Memory"),
        mockPatterns: enrichedBrief.includes("Mock Patterns"),
        filesAffected: filesAffected.length
      }
    }, null, 2)
  }
})

// Tool: sdd_create_spec_folder (file sdd_core.ts, export create_spec_folder -> sdd_create_spec_folder)
export const create_spec_folder = tool({
  description: "Crea una nueva carpeta ordenada para la especificación del cambio.",
  args: {
    name: tool.schema.string().describe("Nombre del cambio en minúsculas y separado por guiones (ej. sumar-endpoint)")
  },
  async execute(args, context) {
    const root = getRoot(context)
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

// Tool: sdd_validate_contract
export const validate_contract = tool({
  description: "Valida contract.json contra el contract-schema.json oficial.",
  args: {
    contractPath: tool.schema.string().describe("Ruta relativa al contract.json (ej. '.openspec/specs/XXXX/contract.json')")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const targetPath = path.resolve(root, args.contractPath)
    if (!fs.existsSync(targetPath)) {
      return JSON.stringify({ success: false, error: `El archivo del contrato '${args.contractPath}' no existe.` }, null, 2)
    }

    try {
      const contract = JSON.parse(fs.readFileSync(targetPath, "utf8"))
      const schemaPath = path.resolve(root, ".opencode/contract-schema.json")
      if (!fs.existsSync(schemaPath)) {
        return JSON.stringify({ success: false, error: "No se encontró el archivo contract-schema.json en .opencode/" }, null, 2)
      }
      
      const errors: string[] = []
      
      const validateField = (name: string, val: any, expectedType: string, required = false) => {
        if (val === undefined || val === null) {
          if (required) errors.push(`Campo requerido faltante: '${name}'`);
          return;
        }
        if (expectedType === "array") {
          if (!Array.isArray(val)) errors.push(`Campo '${name}' debe ser de tipo array.`);
        } else if (expectedType === "object") {
          if (typeof val !== "object" || Array.isArray(val)) errors.push(`Campo '${name}' debe ser de tipo object.`);
        } else {
          if (typeof val !== expectedType) errors.push(`Campo '${name}' debe ser de tipo ${expectedType}.`);
        }
      }

      // Check required fields
      validateField("contractName", contract.contractName, "string", true)
      validateField("description", contract.description, "string", true)
      validateField("category", contract.category, "string", true)
      validateField("stack", contract.stack, "object", true)
      validateField("test_scenarios", contract.test_scenarios, "array", true)
      validateField("files_affected", contract.files_affected, "array", true)

      if (contract.stack) {
        validateField("stack.core", contract.stack.core, "array", true)
        validateField("stack.databases", contract.stack.databases, "array", false)
      }

      if (contract.test_scenarios) {
        contract.test_scenarios.forEach((ts: any, i: number) => {
          validateField(`test_scenarios[${i}].id`, ts.id, "string", true)
          validateField(`test_scenarios[${i}].name`, ts.name, "string", true)
          validateField(`test_scenarios[${i}].type`, ts.type, "string", true)
          validateField(`test_scenarios[` + i + `].feature_ref`, ts.feature_ref, "string", true)
          validateField(`test_scenarios[` + i + `].then`, ts.then, "string", true)
        })
      }

      if (errors.length > 0) {
        return JSON.stringify({
          status: "FAIL",
          message: "El contrato tiene errores de validación contra el esquema.",
          errors
        }, null, 2)
      }

      return JSON.stringify({
        status: "SUCCESS",
        message: "¡El contrato contract.json es 100% válido y cumple estrictamente con el esquema!"
      }, null, 2)

    } catch (e: any) {
      return JSON.stringify({
        status: "FAIL",
        message: `Error al parsear o validar contract.json: ${e.message}`
      }, null, 2)
    }
  }
})
