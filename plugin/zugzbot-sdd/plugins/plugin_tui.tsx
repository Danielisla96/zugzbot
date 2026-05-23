/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup } from "solid-js"
import fs from "fs"
import path from "path"

// ─── Constantes ───────────────────────────────────────
const MAX_AGENT_NAME_LENGTH = 20
const POLLING_INTERVAL_MS = 1000
const COST_DECIMALS = 5

// ─── Tipos de datos ───────────────────────────────────
interface AgentMetrics {
  agentName: string
  sessionId: string
  cost: number
  tokensInput: number
  tokensOutput: number
  tokenTotal: number
}

interface MetricsBreakdown {
  agents: AgentMetrics[]
  totalCost: number
  totalTokens: number
  agentCount: number
}

const PluginTuiSidebar: TuiPlugin = async (api) => {
  const projectRoot = api.state.path.worktree || process.cwd()
  const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json")

  const loadLockfile = () => {
    if (fs.existsSync(lockfilePath)) {
      try {
        const raw = fs.readFileSync(lockfilePath, "utf-8")
        return JSON.parse(raw)
      } catch (e) {}
    }
    return null
  }

  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props: { session_id: string; children?: any }) {
        const [lockState, setLockState] = createSignal(loadLockfile())

        // ─── Funciones auxiliares para desglose por agente ───

        /** Obtiene [sessionId padre, ...sessionIds hijas] con try-catch */
        function collectSessionIds(sessionId: string): string[] {
          try {
            const children = api.state.session.children?.(sessionId) ?? []
            return [sessionId, ...children.map((c: any) => c.id ?? c)]
          } catch {
            return [sessionId] // Fallback seguro
          }
        }

        /** Extrae nombre del agente: UserMessage.agent → session.title → fallback */
        function extractAgentName(
          messages: any[],
          sessionInfo: any,
          sessionId: string
        ): string {
          const userMsg = messages.find(m => m.role === 'user')
          if (userMsg && 'agent' in userMsg && userMsg.agent) {
            return userMsg.agent
          }
          if (sessionInfo?.title) {
            return sessionInfo.title
          }
          return `Sesión ${sessionId.slice(0, 8)}`
        }

        /** Suma cost y tokens solo de mensajes assistant */
        function sumMetrics(messages: any[]) {
          let cost = 0, input = 0, output = 0
          for (const msg of messages) {
            if (msg.role === 'assistant' && 'cost' in msg) {
              cost += typeof msg.cost === 'number' && Number.isFinite(msg.cost) ? msg.cost : 0
              input += msg.tokens?.input ?? 0
              output += msg.tokens?.output ?? 0
            }
          }
          return { cost, tokensInput: input, tokensOutput: output, tokenTotal: input + output }
        }

        /** Trunca nombre de agente a maxLen chars con sufijo … */
        function truncateAgentName(name: string, maxLen: number): string {
          if (!name) return "Unknown Agent"
          if (name.length <= maxLen) return name
          return name.slice(0, maxLen - 1) + '…'
        }

        /** Orquesta recolección y cálculo del desglose completo */
        function calculateBreakdown(sessionId: string): MetricsBreakdown {
          if (!sessionId) {
            return { agents: [], totalCost: 0, totalTokens: 0, agentCount: 0 }
          }
          try {
            const sessionIds = collectSessionIds(sessionId)
            
            const agents: AgentMetrics[] = sessionIds.map(sid => {
              let messages: any[] = []
              try {
                messages = api.state.session.messages(sid) || []
              } catch (e) {
                messages = []
              }
              let sessionInfo: any = null
              try {
                sessionInfo = api.state.session.get?.(sid)
              } catch (e) {}
              const agentName = extractAgentName(messages, sessionInfo, sid)
              
              return {
                agentName: truncateAgentName(agentName, MAX_AGENT_NAME_LENGTH),
                sessionId: sid,
                ...sumMetrics(messages)
              }
            })
            
            return {
              agents,
              totalCost: agents.reduce((sum, a) => sum + a.cost, 0),
              totalTokens: agents.reduce((sum, a) => sum + a.tokenTotal, 0),
              agentCount: agents.length
            }
          } catch (e) {
            return { agents: [], totalCost: 0, totalTokens: 0, agentCount: 0 }
          }
        }

        // ─── Cache y deep compare ─────────────────────────
        function hasMetricsChanged(prev: MetricsBreakdown | null, next: MetricsBreakdown): boolean {
          if (!prev) return true
          if (prev.agentCount !== next.agentCount) return true
          return prev.agents.some((a, i) => {
            const b = next.agents[i]
            return !b || a.cost !== b.cost || a.tokensInput !== b.tokensInput || a.tokensOutput !== b.tokensOutput
          })
        }

        const emptyBreakdown: MetricsBreakdown = {
          agents: [],
          totalCost: 0,
          totalTokens: 0,
          agentCount: 0
        }

        const [breakdownState, setBreakdownState] = createSignal<MetricsBreakdown>(emptyBreakdown)
        let previousBreakdown: MetricsBreakdown | null = null

        // Polling reactivo robusto cada 1000ms con cache
        const interval = setInterval(() => {
          setLockState(loadLockfile())
          
          const newBreakdown = calculateBreakdown(props.session_id)
          if (hasMetricsChanged(previousBreakdown, newBreakdown)) {
            setBreakdownState(newBreakdown)
            previousBreakdown = newBreakdown
          }
        }, POLLING_INTERVAL_MS)

        onCleanup(() => {
          clearInterval(interval)
        })

        const SDDMonitor = () => {
          const state = lockState()
          if (!state) {
            return (
              <box gap={0} paddingTop={1}>
                <text fg={api.theme.current.textMuted}>
                  <i>[SDD Monitor Inactivo]</i>
                </text>
                <text fg={api.theme.current.textMuted}>
                  sdd-lock.json no encontrado
                </text>
              </box>
            )
          }

          const phaseNames = [
            "F0: Diagnóstico",
            "F1: Propuesta",
            "F2: Planificación",
            "F3: Implementación",
            "F4: Percepción UX",
            "F5: Validación",
            "F6: Pruebas QA",
            "F7: Documentación",
            "F8: Cierre Canónico"
          ]

          const currentPhase = typeof state.active_phase === "number" ? state.active_phase : 0
          const validPhase = Math.max(0, Math.min(8, currentPhase))
          const progressPercent = Math.round((validPhase / 8) * 100)
          
          // Barra ASCII premium
          const barLength = 16
          const completedChars = Math.max(0, Math.min(barLength, Math.round((validPhase / 8) * barLength)))
          const remainingChars = Math.max(0, barLength - completedChars)
          const progressBar = "█".repeat(completedChars) + "░".repeat(remainingChars)

          const subagentEmoji = state.active_subagent?.includes("architect") ? "📐" : 
                               state.active_subagent?.includes("implementer") ? "💻" : 
                               state.active_subagent?.includes("launcher") ? "🚀" : "📦"

          return (
            <box gap={0} paddingTop={1} paddingBottom={1}>
              <text fg={api.theme.current.accent}>
                <b>[SDD Monitor] 📊</b>
              </text>
              
              <box gap={0} paddingLeft={1}>
                <text fg={api.theme.current.text}>
                  <b>Cambio:</b> {state.change_name}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Fase:</b> {phaseNames[currentPhase] || `Fase ${currentPhase}`}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Agente:</b> {state.active_subagent} {subagentEmoji}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Estado:</b> {state.status === "in_progress" ? "Activo 🟢" : "En espera 🟡"}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Iteración:</b> #{state.iteration} 🔄
                </text>
                
                <box gap={0} paddingTop={1}>
                  <text fg={api.theme.current.success}>
                    <b>{progressBar} {progressPercent}%</b>
                  </text>
                </box>
              </box>
            </box>
          )
        }

        // ─── Componente de fila individual para el desglose ───
        const AgentMetricsRow = (props: { agent: AgentMetrics; index: number }) => {
          const { agent } = props
          const paddedName = agent.agentName.padEnd(MAX_AGENT_NAME_LENGTH)
          const paddedCost = `$${agent.cost.toFixed(COST_DECIMALS)}`.padStart(12)
          const paddedTokens = `${agent.tokensInput.toLocaleString()} / ${agent.tokensOutput.toLocaleString()}`.padStart(16)
          
          return (
            <text fg={props.index === 0 ? api.theme.current.accent : api.theme.current.text}>
              {paddedName} {paddedCost} {paddedTokens}
            </text>
          )
        }

        const SDDUsage = () => {
          const bd = breakdownState()
          const totalInput = bd.agents.reduce((sum, a) => sum + a.tokensInput, 0)
          const totalOutput = bd.agents.reduce((sum, a) => sum + a.tokensOutput, 0)
          return (
            <box gap={0} paddingTop={1} paddingBottom={1}>
              <text fg={api.theme.current.success}>
                <b>[Métricas de Sesión] 💸</b>
              </text>
              
              <box gap={0} paddingLeft={1}>
                <text fg={api.theme.current.text}>
                  <b>Costo Total:</b> ${bd.totalCost.toFixed(COST_DECIMALS)}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Tokens Entrada:</b> {totalInput.toLocaleString()}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Tokens Salida:</b> {totalOutput.toLocaleString()}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Tokens Totales:</b> {bd.totalTokens.toLocaleString()}
                </text>
              </box>

              {bd.agentCount > 1 && (
                <>
                  <box paddingTop={1} borderTop={1} borderStyle="single" borderColor={api.theme.current.borderSubtle} />
                  <box gap={0} paddingLeft={1}>
                    <text fg={api.theme.current.textMuted}>
                      <b>📊 Desglose por Agente</b>
                    </text>
                    {bd.agents.map((agent, i) => (
                      <AgentMetricsRow agent={agent} index={i} />
                    ))}
                  </box>
                </>
              )}
            </box>
          )
        }

        return (
          <box gap={0}>
            {/* Monitor SDD en tiempo real */}
            <SDDMonitor />

            <box paddingTop={1} borderTop={1} borderStyle="single" borderColor={api.theme.current.borderSubtle} />

            {/* Métricas de consumo y costo acumuladas de todos los agentes */}
            <SDDUsage />

            <box paddingTop={1} borderTop={1} borderStyle="single" borderColor={api.theme.current.borderSubtle} />

            {/* Chat original de OpenCode */}
            {props.children}
          </box>
        )
      }
    }
  })
}

export default { id: "plugin_tui", tui: PluginTuiSidebar } satisfies TuiPluginModule & { id: string }
