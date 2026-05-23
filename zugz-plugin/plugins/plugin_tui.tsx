/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup } from "solid-js"
import * as fs from "fs"
import * as path from "path"

interface SDDLock {
  change_name?: string
  active_phase: number
  active_subagent?: string
  status: string
  auto_pilot?: boolean
  iteration?: number
  last_updated?: string
}

const PluginTuiSidebar: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props: { session_id: string; children?: any }) {
        // --- Funciones Auxiliares ---

        function collectSessionIds(sessionId: string): string[] {
          return [sessionId, ...childSessionIds()]
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

        function isSubagent(name: string): boolean {
          const lower = name.toLowerCase()
          if (lower.startsWith("sesión")) return false
          const primaries = ["build", "plan", "zugzbot"]
          return !primaries.includes(lower)
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
        const [childSessionIds, setChildSessionIds] = createSignal<string[]>([])

        const updateChildren = async () => {
          try {
            const res = await api.client.session.children({ sessionID: props.session_id })
            if (res && res.data && Array.isArray(res.data)) {
              const ids = res.data.map((c: any) => c.id || c.sessionID || c).filter(Boolean)
              setChildSessionIds(ids)
            }
          } catch (e) {
            // Silently ignore
          }
        }

        const childrenInterval = setInterval(updateChildren, 2000)
        updateChildren()

        const [metrics, setMetrics] = createSignal<TotalMetrics>(getMetrics())
        const [mascotFrame, setMascotFrame] = createSignal(0)
        const [sddState, setSddState] = createSignal<SDDLock | null>(null)

        const interval = setInterval(() => {
          setMetrics(getMetrics())
        }, 1000)

        const mascotInterval = setInterval(() => {
          setMascotFrame(1)
          setTimeout(() => {
            setMascotFrame(0)
          }, 200)
        }, 3000)

        const updateSddState = () => {
          try {
            const filePath = path.join(process.cwd(), ".openspec", "sdd-lock.json");
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, "utf-8");
              const parsed = JSON.parse(data);
              setSddState(parsed);
            }
          } catch (e) {
            // Silently ignore
          }
        }

        const sddInterval = setInterval(updateSddState, 2000)
        updateSddState()

        const isSddActive = () => {
          const s = sddState();
          return s && (s.status === "in_progress" || s.status === "corrective_loop");
        }

        const getMascotLines = () => {
          const active = isSddActive();
          const frame = mascotFrame();
          const subagent = sddState()?.active_subagent || "idle";
          
          let line1 = ' (\\__/)';
          let line2 = active
            ? (frame === 0 ? '  [*_*]' : '  [-_-]')
            : (frame === 0 ? '  [o_o]' : '  [-_-]');
          let line3 = ' (") (")';

          if (active) {
            line1 += '  <-- Zugzbot';
            line2 += `  Working on:`;
            line3 += `  ${subagent.slice(0, 15)}`;
          } else {
            line2 += '  status: idle';
          }

          return `${line1}\n${line2}\n${line3}`;
        }

        const getPhaseName = (phase: number): string => {
          switch (phase) {
            case 0: return "Fase 0: Inicialización";
            case 1: return "Fase 1: Planificación";
            case 2: return "Fase 2: Arquitectura y Plan";
            case 3: return "Fase 3: Implementación";
            case 4: return "Fase 4: Diseño Visual";
            case 5: return "Fase 5: Pruebas y QA";
            case 6: return "Fase 6: Documentación";
            case 7: return "Fase 7: Despliegue";
            case 8: return "Fase 8: Mantenimiento";
            default: return `Fase ${phase}`;
          }
        }

        const getProgressBar = (phase: number): string => {
          const filled = Math.floor((phase / 8) * 10);
          const empty = 10 - filled;
          const bar = "■".repeat(filled) + "□".repeat(empty);
          const pct = Math.round((phase / 8) * 100);
          return `[${bar}] ${pct}%`;
        }

        const getPhaseColor = (phase: number): string => {
          if (phase <= 2) return api.theme.current.accent; // Violeta/Accent
          if (phase <= 4) return api.theme.current.info;   // Azul/Info
          if (phase === 5) return api.theme.current.warning; // Amarillo/Warning
          return api.theme.current.success;                // Verde/Success
        }

        onCleanup(() => {
          clearInterval(interval)
          clearInterval(mascotInterval)
          clearInterval(childrenInterval)
          clearInterval(sddInterval)
        })

        return (
          <box gap={0}>
            {/* Mascota ASCII Animada con Estado */}
            <box gap={0} paddingTop={1} paddingLeft={1}>
              <text fg={api.theme.current.accent}>
                {getMascotLines()}
              </text>
            </box>

            {/* Monitor de Fase SDD */}
            {sddState() && (
              <box gap={0} paddingTop={1} paddingLeft={1}>
                <text fg={getPhaseColor(sddState()!.active_phase)}>
                  <b>[{getPhaseName(sddState()!.active_phase)}]</b>
                </text>
                <text fg={getPhaseColor(sddState()!.active_phase)}>
                  {getProgressBar(sddState()!.active_phase)}
                </text>
                <text fg={api.theme.current.borderSubtle}>
                  ─────────────────────────────────────
                </text>
              </box>
            )}

            {/* Monitor de Agentes Compacto */}
            <box gap={0} paddingTop={1} paddingBottom={1}>
              <text fg={api.theme.current.accent}>
                <b>[Monitor de Agentes] 🤖</b>
              </text>
              <box gap={0} paddingLeft={1} paddingTop={1}>
                {metrics().agents.map((agent) => {
                  const isSub = isSubagent(agent.name)
                  const fgColor = isSub ? api.theme.current.info : api.theme.current.text
                  return (
                    <text fg={fgColor}>
                      • <b>{agent.name}</b>: ${agent.cost.toFixed(4)} (I:{formatTokens(agent.tokensInput)}/O:{formatTokens(agent.tokensOutput)})
                    </text>
                  )
                })}
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
