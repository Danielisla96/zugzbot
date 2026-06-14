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
  const projectRoot = worktree || directory || process.cwd()
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
      if (isWritingCode && !targetFilePath.includes("tests") && !targetFilePath.includes("specs") && !targetFilePath.includes(".opencode") && !targetFilePath.includes(".openspec") && !targetFilePath.includes("config.ts") && !targetFilePath.includes("config.js")) {
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
        }
      } catch (e) {
        // best-effort
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
