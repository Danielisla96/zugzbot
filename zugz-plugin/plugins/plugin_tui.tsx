/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup } from "solid-js"
import fs from "fs"
import path from "path"

const PluginTuiSidebar: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props: { session_id: string; children?: any }) {
        // --- Estado reactivo y Polling de IDs de Sesión ---
        const [sessionIds, setSessionIds] = createSignal<string[]>([props.session_id])

        // --- Constantes del lockfile v2 (deben coincidir con tools/sdd_transition.ts) ---
        const getZugzbotVersion = (): string => {
          const fallback = "2.0.12"
          try {
            const localPkgPath = path.join(process.cwd(), "package.json")
            if (fs.existsSync(localPkgPath)) {
              const pkg = JSON.parse(fs.readFileSync(localPkgPath, "utf-8"))
              if (pkg.name === "zugzbot-sdd") return pkg.version
            }
            const depPkgPath = path.join(process.cwd(), "node_modules/zugzbot-sdd/package.json")
            if (fs.existsSync(depPkgPath)) {
              const pkg = JSON.parse(fs.readFileSync(depPkgPath, "utf-8"))
              return pkg.version || fallback
            }
          } catch {}
          return fallback
        }
        const ZUGBOT_VERSION = getZugzbotVersion()

        const PHASE_ORDER = [
          "F0",
          "F1",
          "F1.5",
          "HIL-A",
          "F2-RED",
          "F2-GREEN",
          "F2-REFACTOR",
          "F3",
          "F4",
          "HIL-B",
          "F5",
          "DONE",
        ] as const

        const SUBAGENT_FOR_PHASE: Record<string, string> = {
          "F0": "@sdd-explorer",
          "F1": "@sdd-planner",
          "F1.5": "@f1.5-spec-reviewer",
          "F2-RED": "@f2-red-test-writer",
          "F2-GREEN": "@sdd-builder",
          "F2-REFACTOR": "@f2-refactor-improver",
          "F3": "@sdd-tester",
          "F4": "@sdd-deployer",
          "F5": "@sdd-archiver",
          "DONE": "",
        }

        const PHASE_LABELS: Record<string, string> = {
          "F0": "F0 Exploración",
          "F1": "F1 Spec",
          "F1.5": "F1.5 Review",
          "HIL-A": "HIL-A Aprobar spec",
          "F2-RED": "F2-RED Tests rojos",
          "F2-GREEN": "F2-GREEN Mínimo viable",
          "F2-REFACTOR": "F2-REFACTOR Limpieza",
          "F3": "F3 Validación",
          "F4": "F4 Deploy dev",
          "HIL-B": "HIL-B Aprobar QA",
          "F5": "F5 Archive",
          "DONE": "DONE Ciclo cerrado",
        }

        // --- Helper para leer el progreso SDD (lockfile v2) ---
        interface SddProgress {
          changeName: string
          workflow: string
          stackProfile: string
          activePhase: string
          activeSubagent: string
          status: string
          autoPilot: boolean
          tasksPending: number
          tdd: {
            red: { completed: boolean; testsAdded: number; allFailing: boolean }
            green: { completed: boolean; testsPassing: number }
            refactor: { completed: boolean; linterClean: boolean }
          }
          git: { branch: string; workingTreeClean: boolean }
        }

        const getSddProgress = (): SddProgress | null => {
          try {
            const lockPath = path.join(process.cwd(), ".openspec/sdd-lock.json")
            const altPath = path.join(process.cwd(), "openspec/sdd-lock.json")
            const actualPath = fs.existsSync(lockPath)
              ? lockPath
              : fs.existsSync(altPath)
                ? altPath
                : null

            if (actualPath) {
              const data = JSON.parse(fs.readFileSync(actualPath, "utf-8"))
              return {
                changeName: data.change_name || "—",
                workflow: data.workflow || "—",
                stackProfile: data.stack_profile || "unknown",
                activePhase: typeof data.active_phase === "string" ? data.active_phase : "F0",
                activeSubagent: data.active_subagent || "",
                status: data.status || "idle",
                autoPilot: Boolean(data.auto_pilot),
                tasksPending: Array.isArray(data.tasks)
                  ? data.tasks.filter((t: any) => t.status === "pending").length
                  : 0,
                tdd: {
                  red: {
                    completed: Boolean(data.tdd?.red?.completed),
                    testsAdded: Number(data.tdd?.red?.tests_added) || 0,
                    allFailing: Boolean(data.tdd?.red?.all_failing),
                  },
                  green: {
                    completed: Boolean(data.tdd?.green?.completed),
                    testsPassing: Number(data.tdd?.green?.tests_passing) || 0,
                  },
                  refactor: {
                    completed: Boolean(data.tdd?.refactor?.completed),
                    linterClean: Boolean(data.tdd?.refactor?.linter_clean),
                  },
                },
                git: {
                  branch: data.git?.branch || "—",
                  workingTreeClean: data.git?.working_tree_clean !== false,
                },
              }
            }
          } catch { }
          return null
        }

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
              } catch { }
            }

            await traverse(props.session_id)

            // Solo actualizamos el signal si el conjunto de IDs cambió, para evitar re-renderizados innecesarios
            if (JSON.stringify(results) !== JSON.stringify(sessionIds())) {
              setSessionIds(results)
            }
          } catch { }
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
            } catch { }

            let sessionInfo: any = null
            try {
              sessionInfo = api.state.session.get?.(sid)
            } catch { }

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
        const [sddProgress, setSddProgress] = createSignal<SddProgress | null>(getSddProgress())
        const [colorIndex, setColorIndex] = createSignal(0)

        // Actualizamos los IDs de las sesiones cada 2 segundos
        const idsInterval = setInterval(() => {
          updateSessionIds()
          setSddProgress(getSddProgress())
        }, 2000)

        // Actualizamos las métricas cada segundo basadas en el signal de sesión IDs
        const metricsInterval = setInterval(() => {
          setMetrics(getMetrics(sessionIds()))
        }, 1000)

        // Ticker lento para una animación de ola vertical suave
        const colorInterval = setInterval(() => {
          setColorIndex((prev) => (prev + 1) % 100)
        }, 500)

        // Paleta premium de naranjas fuertes, ámbar y cobrizos
        const orangePalette = [
          "#E04F00", // Naranjo oscuro / Fuego
          "#FF7300", // Naranjo brillante / Ámbar
          "#B33600", // Siena tostado / Óxido
          "#FF8C00", // Ámbar oscuro
        ]

        const getLineColor = (lineIdx: number) => {
          const targetIndex = (colorIndex() + lineIdx) % orangePalette.length
          return orangePalette[targetIndex]
        }

        const logoLines = [
          "███████╗██╗   ██╗ ██████╗ ███████╗",
          "╚══███╔╝██║   ██║██╔════╝ ╚══███╔╝",
          "  ███╔╝ ██║   ██║██║  ███╗  ███╔╝ ",
          " ███╔╝  ██║   ██║██║   ██║ ███╔╝  ",
          "███████╗╚██████╔╝╚██████╔╝███████╗",
          "╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝"
        ]

        // Ejecutar inmediatamente al inicio
        updateSessionIds()
        setSddProgress(getSddProgress())

        onCleanup(() => {
          clearInterval(idsInterval)
          clearInterval(metricsInterval)
          clearInterval(colorInterval)
        })

        // Helper: índice numérico de la fase actual para comparar con PHASE_ORDER
        const phaseIndex = (phase: string): number => {
          const idx = PHASE_ORDER.indexOf(phase as any)
          return idx === -1 ? 0 : idx
        }

        return (
          <box gap={0}>
            {/* Cabecera Logo ZUGZ con Efecto Ola Vertical Naranja */}
            <box gap={0} paddingTop={1} paddingLeft={1}>
              {logoLines.map((line, idx) => (
                <text fg={getLineColor(idx)}>
                  {line}
                </text>
              ))}
              <text fg={api.theme.current.textMuted} paddingTop={0}>
                {`zugzbot-sdd v${ZUGBOT_VERSION}`}
              </text>
            </box>

            {/* Progreso SDD v2: 12 estaciones (F0, F1, F1.5, HIL-A, F2-RED/GREEN/REFACTOR, F3, F4, HIL-B, F5, DONE) */}
            {sddProgress() && (
              <box gap={0} paddingLeft={1} paddingTop={1} paddingBottom={0}>
                <text fg="#FF7300">
                  {`SDD: ${sddProgress()?.changeName ?? "—"}`}
                </text>
                <text fg={api.theme.current.textMuted}>
                  {`Stack: ${sddProgress()?.stackProfile ?? "unknown"} · Workflow: ${sddProgress()?.workflow ?? "—"} · Status: ${sddProgress()?.status ?? "idle"}${sddProgress()?.autoPilot ? " · auto-pilot" : ""}`}
                </text>
                <box gap={0} paddingTop={1}>
                  {PHASE_ORDER.map((phase) => {
                    const current = sddProgress()?.activePhase ?? "F0"
                    const curIdx = phaseIndex(current)
                    const myIdx = phaseIndex(phase)
                    const isActive = current === phase
                    const isCompleted = curIdx > myIdx
                    const isHil = phase === "HIL-A" || phase === "HIL-B"

                    let prefix = "  ○ "
                    let fgColor = api.theme.current.textMuted

                    if (isCompleted) {
                      prefix = "  ✓ "
                      fgColor = api.theme.current.success
                    } else if (isActive) {
                      prefix = isHil ? "  ⚠ " : "  ⚡ "
                      fgColor = isHil ? "#FFAA00" : "#FF7300"
                    }

                    const label = PHASE_LABELS[phase] || phase
                    const agent = SUBAGENT_FOR_PHASE[phase] || ""
                    return (
                      <text fg={fgColor}>
                        {`${prefix}${label} ${agent}`}
                      </text>
                    )
                  })}
                </box>

                {/* TDD progress */}
                {(() => {
                  const tdd = sddProgress()?.tdd
                  if (!tdd) return null
                  const redMark = tdd.red.completed ? "✓" : "○"
                  const redCount = tdd.red.testsAdded > 0 ? ` (${tdd.red.testsAdded})` : ""
                  const greenMark = tdd.green.completed ? "✓" : "○"
                  const greenCount = tdd.green.testsPassing > 0 ? ` (${tdd.green.testsPassing})` : ""
                  const refactorMark = tdd.refactor.linterClean ? "✓" : "○"
                  return (
                    <text fg={api.theme.current.textMuted} paddingTop={1}>
                      {`TDD: ${redMark} RED${redCount} · ${greenMark} GREEN${greenCount} · ${refactorMark} REFACTOR(lint)`}
                    </text>
                  )
                })()}

                {/* Git branch */}
                {sddProgress()?.git?.branch && sddProgress()?.git?.branch !== "—" && (
                  <text fg={api.theme.current.textMuted}>
                    {`Git: ${sddProgress()?.git?.branch ?? "—"}${sddProgress()?.git?.workingTreeClean ? "" : " (dirty)"}`}
                  </text>
                )}

                <text fg={api.theme.current.borderSubtle} paddingTop={1}>
                  {"────────────────────────────────────"}
                </text>
              </box>
            )}

            {/* Monitor de Agentes Compacto y Plano (Efecto Sándwich) */}
            <box gap={0} paddingLeft={1} paddingTop={1} paddingBottom={0}>
              {metrics().agents.map((agent) => (
                <text fg={agent.isSubagent ? api.theme.current.textMuted : api.theme.current.text}>
                  {`${agent.isSubagent ? "  " : ""}${agent.name}: ${formatCost(agent.cost)} (${formatTokens(agent.tokensInput)}/${formatTokens(agent.tokensOutput)})`}
                </text>
              ))}
              <text fg={api.theme.current.borderSubtle}>
                {"────────────────────────────────────"}
              </text>
              <text fg={api.theme.current.success}>
                {`Total: ${formatCost(metrics().totalCost)} (${formatTokens(metrics().totalInput)}/${formatTokens(metrics().totalOutput)})`}
              </text>
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
