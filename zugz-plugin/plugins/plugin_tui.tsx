/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup } from "solid-js"

const PluginTuiSidebar: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props: { session_id: string; children?: any }) {
        // --- Estado reactivo y Polling de IDs de Sesión ---
        const [sessionIds, setSessionIds] = createSignal<string[]>([props.session_id])

        // Función para actualizar recursivamente la lista de sesión IDs usando api.client
        const updateSessionIds = async () => {
          try {
            const results: string[] = []
            const visited = new Set<string>()

            async function traverse(sid: string) {
              if (!sid || visited.has(sid)) return
              visited.add(sid)
              results.push(sid)

              try {
                const response = await api.client.session.children({ sessionID: sid })
                const children = Array.isArray(response) ? response : (response?.data || [])
                for (const child of children) {
                  const childId = child?.id
                  if (childId) {
                    await traverse(childId)
                  }
                }
              } catch {}
            }

            await traverse(props.session_id)
            
            // Solo actualizamos el signal si el conjunto de IDs cambió, para evitar re-renderizados innecesarios
            if (JSON.stringify(results) !== JSON.stringify(sessionIds())) {
              setSessionIds(results)
            }
          } catch {}
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

        function formatCost(cost: number): string {
          if (cost === 0) return "$0"
          if (cost < 0.001) return "$" + cost.toFixed(4)
          return "$" + cost.toFixed(3)
        }

        function formatTokens(num: number): string {
          if (num >= 1000000) return Math.round(num / 1000000) + "M"
          if (num >= 1000) return Math.round(num / 1000) + "k"
          return num.toString()
        }

        interface AgentMetrics {
          name: string
          cost: number
          tokensInput: number
          tokensOutput: number
          isSubagent: boolean
        }

        interface TotalMetrics {
          agents: AgentMetrics[]
          totalCost: number
          totalInput: number
          totalOutput: number
        }

        function getMetrics(currentSessionIds: string[]): TotalMetrics {
          let totalCost = 0
          let totalInput = 0
          let totalOutput = 0

          const agentMap: Record<string, AgentMetrics> = {}

          for (const sid of currentSessionIds) {
            const isSubagent = sid !== props.session_id
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
                    isSubagent: isSubagent,
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
                isSubagent: isSubagent,
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
        const [metrics, setMetrics] = createSignal<TotalMetrics>(getMetrics([props.session_id]))
        const [mascotFrame, setMascotFrame] = createSignal(0)

        // Actualizamos los IDs de las sesiones cada 2 segundos
        const idsInterval = setInterval(() => {
          updateSessionIds()
        }, 2000)

        // Actualizamos las métricas cada segundo basadas en el signal de sesión IDs
        const metricsInterval = setInterval(() => {
          setMetrics(getMetrics(sessionIds()))
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

        // Ejecutar inmediatamente al inicio
        updateSessionIds()

        onCleanup(() => {
          clearInterval(idsInterval)
          clearInterval(metricsInterval)
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
                  <text fg={agent.isSubagent ? api.theme.current.textMuted : api.theme.current.text}>
                    {agent.isSubagent ? "  " : ""}<b>{agent.name}</b>: {formatCost(agent.cost)} ({formatTokens(agent.tokensInput)}/{formatTokens(agent.tokensOutput)})
                  </text>
                ))}
              </box>
              <text fg={api.theme.current.borderSubtle} paddingLeft={1}>
                ─────────────────────────────────────
              </text>
              <box gap={0} paddingLeft={1} paddingTop={1}>
                <text fg={api.theme.current.success}>
                  <b>Total:</b> {formatCost(metrics().totalCost)} ({formatTokens(metrics().totalInput)}/{formatTokens(metrics().totalOutput)})
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
