/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup } from "solid-js"

const PluginTuiSidebar: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props: { session_id: string; children?: any }) {
        // --- Funciones Auxiliares ---

        function collectSessionIds(sessionId: string): string[] {
          try {
            const children = api.state.session.children?.(sessionId) ?? []
            return [sessionId, ...children.map((c: any) => c.id ?? c)]
          } catch {
            return [sessionId]
          }
        }

        function extractAgentName(messages: any[], sessionInfo: any, sessionId: string): string {
          const userMsg = messages.find((m) => m.role === "user")
          if (userMsg && "agent" in userMsg && userMsg.agent) {
            return userMsg.agent
          }
          if (sessionInfo?.title) {
            return sessionInfo.title
          }
          return `Sesión ${sessionId.slice(0, 4)}`
        }

        function formatTokens(num: number): string {
          if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
          if (num >= 1000) return (num / 1000).toFixed(1) + "k"
          return num.toString()
        }

        interface AgentMetrics {
          name: string
          cost: number
          tokensInput: number
          tokensOutput: number
        }

        interface TotalMetrics {
          agents: AgentMetrics[]
          totalCost: number
          totalInput: number
          totalOutput: number
        }

        function getMetrics(): TotalMetrics {
          const sessionIds = collectSessionIds(props.session_id)
          let totalCost = 0
          let totalInput = 0
          let totalOutput = 0

          const agentMap: Record<string, AgentMetrics> = {}

          for (const sid of sessionIds) {
            let messages: any[] = []
            try {
              messages = api.state.session.messages(sid) || []
            } catch {}

            let sessionInfo: any = null
            try {
              sessionInfo = api.state.session.get?.(sid)
            } catch {}

            const defaultAgentName = extractAgentName(messages, sessionInfo, sid)

            for (let i = 0; i < messages.length; i++) {
              const msg = messages[i]
              if (msg.role === "assistant" && "cost" in msg) {
                const cost = typeof msg.cost === "number" && Number.isFinite(msg.cost) ? msg.cost : 0
                const input = msg.tokens?.input ?? 0
                const output = msg.tokens?.output ?? 0

                totalCost += cost
                totalInput += input
                totalOutput += output

                let agentName = ""
                if (msg.agent) {
                  agentName = msg.agent
                } else {
                  for (let j = i; j >= 0; j--) {
                    if (messages[j]?.agent) {
                      agentName = messages[j].agent
                      break
                    }
                  }
                }

                if (!agentName) {
                  agentName = defaultAgentName
                }

                if (!agentMap[agentName]) {
                  agentMap[agentName] = {
                    name: agentName,
                    cost: 0,
                    tokensInput: 0,
                    tokensOutput: 0,
                  }
                }

                agentMap[agentName].cost += cost
                agentMap[agentName].tokensInput += input
                agentMap[agentName].tokensOutput += output
              }
            }

            if (!agentMap[defaultAgentName]) {
              agentMap[defaultAgentName] = {
                name: defaultAgentName,
                cost: 0,
                tokensInput: 0,
                tokensOutput: 0,
              }
            }
          }

          const agents = Object.values(agentMap)

          return {
            agents,
            totalCost,
            totalInput,
            totalOutput,
          }
        }

        // --- Estado reactivo y Polling ---
        const [metrics, setMetrics] = createSignal<TotalMetrics>(getMetrics())
        const [mascotFrame, setMascotFrame] = createSignal(0)

        const interval = setInterval(() => {
          setMetrics(getMetrics())
        }, 1000)

        const mascotInterval = setInterval(() => {
          setMascotFrame(1)
          setTimeout(() => {
            setMascotFrame(0)
          }, 200)
        }, 3000)

        const mascotAscii = () => {
          return mascotFrame() === 0
            ? ' (\\__/)\n  [o_o]\n (") (")'
            : ' (\\__/)\n  [-_-]\n (") (")'
        }

        onCleanup(() => {
          clearInterval(interval)
          clearInterval(mascotInterval)
        })

        return (
          <box gap={0}>
            {/* Mascota ASCII Animada */}
            <box gap={0} paddingTop={1} paddingLeft={1}>
              <text fg={api.theme.current.accent}>
                {mascotAscii()}
              </text>
            </box>

            {/* Monitor de Agentes Compacto */}
            <box gap={0} paddingTop={1} paddingBottom={1}>
              <text fg={api.theme.current.accent}>
                <b>[Monitor de Agentes] 🤖</b>
              </text>
              <box gap={0} paddingLeft={1} paddingTop={1}>
                {metrics().agents.map((agent) => (
                  <text fg={api.theme.current.text}>
                    • <b>{agent.name}</b>: ${agent.cost.toFixed(4)} (I:{formatTokens(agent.tokensInput)}/O:{formatTokens(agent.tokensOutput)})
                  </text>
                ))}
              </box>
              <text fg={api.theme.current.borderSubtle} paddingLeft={1}>
                ─────────────────────────────────────
              </text>
              <box gap={0} paddingLeft={1} paddingTop={1}>
                <text fg={api.theme.current.success}>
                  <b>Total:</b> ${metrics().totalCost.toFixed(4)} (I:{formatTokens(metrics().totalInput)}/O:{formatTokens(metrics().totalOutput)})
                </text>
              </box>
            </box>

            {/* Chat original de OpenCode */}
            {props.children}
          </box>
        )
      }
    }
  })
}

export default { id: "plugin_tui", tui: PluginTuiSidebar } satisfies TuiPluginModule & { id: string }
