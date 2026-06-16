import { type Plugin } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

type AgentMetrics = {
  cost: number
  tokensIn: number
  tokensOutput: number
  messages: number
}

type SessionMetrics = {
  contractName: string
  sessionId: string
  startedAt: string
  lastUpdatedAt: string
  totals: {
    cost: number
    tokensIn: number
    tokensOutput: number
    messages: number
  }
  byAgent: Record<string, AgentMetrics>
}

const emptyMetrics = (): SessionMetrics => ({
  contractName: "",
  sessionId: "",
  startedAt: "",
  lastUpdatedAt: "",
  totals: { cost: 0, tokensIn: 0, tokensOutput: 0, messages: 0 },
  byAgent: {},
})

export const SddBridgePlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  let projectRoot = process.cwd();
  if (directory && directory !== "/") projectRoot = directory;
  else if (worktree && worktree !== "/") projectRoot = worktree;

  const stateFilePath = path.resolve(projectRoot, ".openspec/sdd_state.json")
  const metricsFilePath = path.resolve(projectRoot, ".openspec/.sdd_session_metrics.json")

  // Helper to read state
  const readState = () => {
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
      if (fs.existsSync(stateFilePath)) {
        return JSON.parse(fs.readFileSync(stateFilePath, "utf8"))
      }
    } catch (e) {
      // ignore parsing errors
    }
    return defaultState
  }

  // Helper to read session metrics
  const readMetrics = (): SessionMetrics => {
    try {
      if (fs.existsSync(metricsFilePath)) {
        const parsed = JSON.parse(fs.readFileSync(metricsFilePath, "utf8"))
        if (parsed && typeof parsed === "object") return parsed
      }
    } catch (e) {
      // ignore parsing errors
    }
    return emptyMetrics()
  }

  // Helper to atomically write session metrics
  const writeMetrics = (metrics: SessionMetrics) => {
    try {
      const dir = path.dirname(metricsFilePath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const tmp = `${metricsFilePath}.tmp`
      fs.writeFileSync(tmp, JSON.stringify(metrics, null, 2), "utf8")
      fs.renameSync(tmp, metricsFilePath)
    } catch (e) {
      // best-effort: do not crash the session on a write failure
    }
  }

  // Logs a phase transition to OpenCode
  const logPhase = async (phase: string, message: string) => {
    await client.app.log({
      body: {
        service: "sdd-bridge",
        level: "info",
        message: `[SDD STATE: ${phase}] - ${message}`
      }
    })
  }

  // Resolve the current contract folder name (e.g. "0001_1718300000_sumar-endpoint")
  const getCurrentContractFolder = (activeContract: string): string => {
    if (!activeContract) return ""
    return path.basename(path.dirname(path.resolve(projectRoot, activeContract)))
  }

  // Reset metrics when entering a new contract
  const maybeResetMetrics = () => {
    const state = readState()
    const folderName = getCurrentContractFolder(state.activeContract || "")
    const metrics = readMetrics()
    if (folderName && metrics.contractName !== folderName) {
      const fresh = emptyMetrics()
      fresh.contractName = folderName
      writeMetrics(fresh)
      return fresh
    }
    return metrics
  }

  // Extract a message + sessionID from a message.updated event payload
  // (be permissive about exact shape across opencode versions)
  const extractMessage = (props: any): { message: any; sessionId: string } | null => {
    if (!props) return null
    // common shapes:
    //  - { info: { sessionID, role, ... }, parts: [...] }
    //  - { message: { sessionID, role, ... } }
    //  - { sessionID, message: {...} }
    if (props.info && (props.info.role || props.info.sessionID)) {
      return { message: props.info, sessionId: props.info.sessionID || "" }
    }
    if (props.message) {
      return { message: props.message, sessionId: props.message.sessionID || props.sessionID || "" }
    }
    if (props.sessionID && (props.role || props.cost !== undefined || props.tokens)) {
      return { message: props, sessionId: props.sessionID }
    }
    return null
  }

  // Accumulate a single assistant message into the metrics
  const accumulateMessage = (msg: any, sessionId: string) => {
    if (!msg) return
    if (msg.role && msg.role !== "assistant") return
    if (typeof msg.cost !== "number" && !msg.tokens) return

    const metrics = readMetrics()
    const now = new Date().toISOString()

    if (!metrics.startedAt) metrics.startedAt = now
    metrics.lastUpdatedAt = now
    if (!metrics.sessionId) metrics.sessionId = sessionId

    const cost = typeof msg.cost === "number" && Number.isFinite(msg.cost) ? msg.cost : 0
    const tokensIn = msg.tokens?.input ?? 0
    const tokensOut = msg.tokens?.output ?? 0

    // Resolve agent name (same heuristic as plugin_tui.tsx)
    let agentName = msg.agent || ""
    if (!agentName) {
      const messages = (() => {
        try {
          return (client as any).state?.session?.messages?.(sessionId) || []
        } catch {
          return []
        }
      })()
      for (let j = messages.length - 1; j >= 0; j--) {
        if (messages[j]?.agent) {
          agentName = messages[j].agent
          break
        }
      }
    }
    if (!agentName) agentName = "unknown"

    if (!metrics.byAgent[agentName]) {
      metrics.byAgent[agentName] = { cost: 0, tokensIn: 0, tokensOutput: 0, messages: 0 }
    }

    metrics.byAgent[agentName].cost += cost
    metrics.byAgent[agentName].tokensIn += tokensIn
    metrics.byAgent[agentName].tokensOutput += tokensOut
    metrics.byAgent[agentName].messages += 1

    metrics.totals.cost += cost
    metrics.totals.tokensIn += tokensIn
    metrics.totals.tokensOutput += tokensOut
    metrics.totals.messages += 1

    writeMetrics(metrics)
  }

  // Ensure .openspec/active-brief.md exists physically on load to prevent OpenCode startup crash on raw workspaces
  const activeBriefPath = path.resolve(projectRoot, ".openspec/active-brief.md")
  if (!fs.existsSync(activeBriefPath)) {
    try {
      const openspecDir = path.dirname(activeBriefPath)
      if (!fs.existsSync(openspecDir)) {
        fs.mkdirSync(openspecDir, { recursive: true })
      }
      fs.writeFileSync(
        activeBriefPath,
        "# SDD Active Brief\n\nNo hay ninguna sesión activa o el spec actual no ha sido iniciado.\n",
        "utf8"
      )
    } catch (e) {
      // best-effort
    }
  }

  // Helper to synchronize models automatically from models.json
  const syncModelsFromConfig = () => {
    try {
      const modelsPath = path.resolve(projectRoot, "models.json")
      const altModelsPath = path.resolve(projectRoot, ".opencode/models.json")
      let selectedModelsPath = ""

      if (fs.existsSync(modelsPath)) {
        selectedModelsPath = modelsPath
      } else if (fs.existsSync(altModelsPath)) {
        selectedModelsPath = altModelsPath
      } else {
        return // No config file, do nothing silently
      }

      const modelsContent = fs.readFileSync(selectedModelsPath, "utf8")
      const modelsData = JSON.parse(modelsContent)
      const globalModel = modelsData.global || "deepseek/deepseek-v4-flash"

      // 1. Update opencode.json
      const opencodeJsonPath = path.resolve(projectRoot, "opencode.json")
      if (fs.existsSync(opencodeJsonPath)) {
        const opencodeContent = fs.readFileSync(opencodeJsonPath, "utf8")
        const opencodeData = JSON.parse(opencodeContent)
        let updated = false

        if (opencodeData.agent && typeof opencodeData.agent === "object") {
          for (const agentName of Object.keys(opencodeData.agent)) {
            const configModel = modelsData[agentName]
            const targetModel = configModel && configModel.trim() !== "" ? configModel : globalModel

            if (opencodeData.agent[agentName].model !== targetModel) {
              opencodeData.agent[agentName].model = targetModel
              updated = true
            }
          }
        }

        if (updated) {
          fs.writeFileSync(opencodeJsonPath, JSON.stringify(opencodeData, null, 2), "utf8")
          logPhase("MODEL_SYNC", "Sincronizados modelos en opencode.json desde models.json")
        }
      }

      // 2. Update agent markdown files (.opencode/agents/*.md)
      const agentsDir = path.resolve(projectRoot, ".opencode/agents")
      if (fs.existsSync(agentsDir)) {
        const files = fs.readdirSync(agentsDir)
        for (const file of files) {
          if (file.endsWith(".md")) {
            const agentName = file.slice(0, -3)
            const configModel = modelsData[agentName]
            const targetModel = configModel && configModel.trim() !== "" ? configModel : globalModel
            const filepath = path.join(agentsDir, file)
            const content = fs.readFileSync(filepath, "utf8")

            const frontmatterPattern = /^---$([\s\S]*?)^---$/m
            const match = frontmatterPattern.exec(content)
            if (match) {
              const frontmatter = match[1]
              if (frontmatter.includes("model:")) {
                const modelLinePattern = /^model:\s*(.*?)$/m
                const modelLineMatch = modelLinePattern.exec(frontmatter)
                if (modelLineMatch && modelLineMatch[1].trim() !== targetModel) {
                  const newFrontmatter = frontmatter.replace(modelLinePattern, `model: ${targetModel}`)
                  const newContent = content.replace(frontmatter, newFrontmatter)
                  fs.writeFileSync(filepath, newContent, "utf8")
                  logPhase("MODEL_SYNC", `Sincronizado agente ${file} a modelo: ${targetModel}`)
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // Best-effort: don't crash on model sync failures
    }
  }

  // Run model sync from models.json automatically on plugin load
  syncModelsFromConfig()

  // Ensure metrics file matches current contract on plugin load
  maybeResetMetrics()

  // Initial state log
  const initialState = readState()
  await logPhase(initialState.phase, "SDD Bridge plugin initialized and active.")

  return {
    // Intercept tool execution to guarantee strict SDD phase/contract alignment
    "tool.execute.before": async (input, output) => {
      const targetFilePath = output.args?.filePath || output.args?.targetFile || ""
      if (!targetFilePath) return

      // Skip verification for read-only tools
      const toolName = input.tool
      const writeTools = ["write", "edit", "write_to_file", "replace_file_content", "multi_replace_file_content"]
      if (!writeTools.includes(toolName)) {
        return
      }

      const isWritingCode = targetFilePath.endsWith(".ts") || targetFilePath.endsWith(".tsx") || targetFilePath.endsWith(".py")
      const currentState = readState()

      // Enforce: No code edits allowed unless we are in the implementation phase (F2_IMPLEMENTATION)
      if (isWritingCode && !targetFilePath.includes("tests") && !targetFilePath.includes("specs") && !targetFilePath.includes(".opencode") && !targetFilePath.includes(".openspec") && !targetFilePath.includes(".utils") && !targetFilePath.includes("config.ts") && !targetFilePath.includes("config.js")) {
        if (currentState.phase !== "F2_IMPLEMENTATION") {
          throw new Error(
            `[SDD Contract Violation] No se permite escribir o editar código de la aplicación. Fase actual: '${currentState.phase}'. Debe transicionar a 'F2_IMPLEMENTATION' una vez que el contrato esté aprobado.`
          )
        }
        if (!currentState.activeContract) {
          throw new Error(
            `[SDD Contract Violation] Fase F2_IMPLEMENTATION activa pero sin ningún contrato asociado en 'activeContract'. defina un contrato primero.`
          )
        }
      }

      // Enforce: Spec files can only be written or edited during F1_CONTRACT
      const isSpecFile = targetFilePath.includes(".openspec/specs/") && !targetFilePath.endsWith("contract-schema.json")
      if (isSpecFile && currentState.phase !== "F1_CONTRACT") {
        throw new Error(
          `[SDD Phase Violation] Los archivos de especificación de contrato solo se pueden modificar en la fase 'F1_CONTRACT'. Fase actual: '${currentState.phase}'.`
        )
      }
    },

    // After a tool finishes, reset metrics if the contract changed
    "tool.execute.after": async (input) => {
      try {
        if (input?.tool === "sdd_set_phase") {
          const newState = readState()
          const folderName = getCurrentContractFolder(newState.activeContract || "")
          const metrics = readMetrics()
          if (folderName && metrics.contractName !== folderName) {
            const fresh = emptyMetrics()
            fresh.contractName = folderName
            writeMetrics(fresh)
          }

          // Trigger native TUI Toast for phase transition
          if (client?.tui?.showToast) {
            await client.tui.showToast({
              body: {
                message: `🚀 SDD: Transición a Fase ${newState.phase}${newState.loopMode ? " (Autopiloto Activo)" : ""}`,
                variant: "success"
              }
            }).catch(() => {})
          }
        }

        // Trigger native TUI Toast for brain memory save
        if (input?.tool === "brain_save_memory") {
          const category = input.args?.category || "general"
          if (client?.tui?.showToast) {
            await client.tui.showToast({
              body: {
                message: `🧠 Brain: Nuevo aprendizaje registrado en '${category}'`,
                variant: "info"
              }
            }).catch(() => {})
          }
        }
        // Live-refresh the canonical _sessions.jsonl so future sessions
        // can read compact history (1 line per contract) instead of full MD exports.
        if (input?.tool === "sdd_set_phase" || input?.tool === "sdd_select_design" || input?.tool === "sdd_create_spec_folder") {
          try {
            const metrics = readMetrics()
            const state = readState()
            if (metrics.contractName && metrics.startedAt) {
              const archiveDir = path.resolve(projectRoot, ".openspec/archive")
              if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true })
              const logPath = path.join(archiveDir, "_sessions.jsonl")
              const now = new Date().toISOString()
              const line = JSON.stringify({
                contractName: metrics.contractName,
                sessionId: metrics.sessionId,
                startedAt: metrics.startedAt,
                lastUpdatedAt: now,
                phase: state.phase,
                cost: +metrics.totals.cost.toFixed(6),
                tokensIn: metrics.totals.tokensIn,
                tokensOutput: metrics.totals.tokensOutput,
                messages: metrics.totals.messages,
                inProgress: true,
              })
              let existing: string[] = []
              if (fs.existsSync(logPath)) {
                existing = fs.readFileSync(logPath, "utf8").split("\n").filter((l) => l.trim().length > 0)
              }
              const filtered = existing.filter((l) => {
                try { return JSON.parse(l).contractName !== metrics.contractName } catch { return true }
              })
              filtered.push(line)
              fs.writeFileSync(logPath, filtered.join("\n") + "\n", "utf8")
            }
          } catch (e) {
            // best-effort
          }
        }
      } catch (e) {
        // best-effort
      }
    },

    // Inject active SDD state and loopMode into the compaction context to prevent memory loss
    "experimental.session.compacting": async (input, output) => {
      try {
        const state = readState()
        const currentIter = state.loopCurrentIteration || 1
        const targetIter = state.loopTargetIterations || 1
        
        if (state.loopMode === true) {
          // Force selective amnesia to prevent context saturation and LLM loops
          output.prompt = `
You are generating a summary continuation prompt for a long-running multi-agent SDD session.
The user is running in Autopilot Loop Mode (loopMode = true).

Your goal is to perform SELECTIVE AMNESIA:
- DISCARD all previous intermediate file edits, bash execution logs, temporary errors, and past code discussions.
- PRESERVE and focus strictly on:
  1. The active SDD phase: '${state.phase}'
  2. The active contract path: '${state.activeContract || "None"}'
  3. The current iteration progress: Iteration ${currentIter} of ${targetIter}.
  4. The global stack configuration: ${JSON.stringify(state.stack || {})}
  
Formulate a highly compressed, structured summary that allows the sdd-orchestrator to immediately resume the next task or next iteration cleanly, without any historical token bloat.
`
        } else {
          output.context.push(`
## SDD HARNESS STATE (CRITICAL PERSISTENCE)

Este es el estado del arnés de desarrollo SDD activo en disco. DEBES conservarlo en tu memoria resumida tras la compactación:
- **Fase Activa de SDD**: '${state.phase}'
- **Contrato Activo**: '${state.activeContract || "Ninguno"}'
- **Modo Piloto Automático (/loop)**: ${state.loopMode === true ? "ACTIVO (Debes continuar resolviendo las tareas de forma 100% autónoma sin preguntar al usuario)" : "DESACTIVADO (Interacción estándar)"}
- **Iteración Actual**: ${currentIter} de ${targetIter}
- **Tecnologías Detectadas**: ${JSON.stringify(state.stack || {})}
`)
        }
      } catch (e) {
        // ignore
      }
    },

    // Subscribe to message.updated events to accumulate tokens/cost in vivo
    event: async ({ event }: any) => {
      try {
        if (!event) return
        if (event.type !== "message.updated") return
        const extracted = extractMessage(event.properties)
        if (!extracted) return
        accumulateMessage(extracted.message, extracted.sessionId)
      } catch (e) {
        // never let a metrics failure break the session
      }
    },
  }
}
export default SddBridgePlugin
