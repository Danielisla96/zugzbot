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
        const [sessionIds, setSessionIds] = createSignal<string[]>([props.session_id])

        const getZugzbotVersion = (): string => {
          const fallback = "2.0.18"
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
          "F0": "F0 Explorar",
          "F1": "F1 Spec Plan",
          "F1.5": "F1.5 Review",
          "HIL-A": "HIL-A Spec OK?",
          "F2-RED": "F2-RED Tests",
          "F2-GREEN": "F2-GREEN Build",
          "F2-REFACTOR": "F2-REFACTOR Clean",
          "F3": "F3 Test Validate",
          "F4": "F4 Dev Deploy",
          "HIL-B": "HIL-B QA OK?",
          "F5": "F5 Archive",
          "DONE": "DONE Completado",
        }

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

        const [metrics, setMetrics] = createSignal<TotalMetrics>(getMetrics([props.session_id]))
        const [sddProgress, setSddProgress] = createSignal<SddProgress | null>(getSddProgress())
        const [colorIndex, setColorIndex] = createSignal(0)

        const idsInterval = setInterval(() => {
          updateSessionIds()
          setSddProgress(getSddProgress())
        }, 2000)

        const metricsInterval = setInterval(() => {
          setMetrics(getMetrics(sessionIds()))
        }, 1000)

        const colorInterval = setInterval(() => {
          setColorIndex((prev) => (prev + 1) % 100)
        }, 500)

        const orangePalette = [
          "#E04F00",
          "#FF7300",
          "#B33600",
          "#FF8C00",
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

        updateSessionIds()
        setSddProgress(getSddProgress())

        onCleanup(() => {
          clearInterval(idsInterval)
          clearInterval(metricsInterval)
          clearInterval(colorInterval)
        })

        const phaseIndex = (phase: string): number => {
          const idx = PHASE_ORDER.indexOf(phase as any)
          return idx === -1 ? 0 : idx
        }

        return (
          <box gap={0}>
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

            {sddProgress() ? (
              <box gap={0} paddingLeft={1} paddingTop={1} paddingBottom={0}>
                <text fg="#FF7300">
                  {`SDD: ${sddProgress()?.changeName ?? "—"}`}
                </text>
                 <text fg={api.theme.current.textMuted}>
                  {`Stack: ${sddProgress()?.stackProfile ?? "unknown"}`}
                </text>
                <text fg={api.theme.current.textMuted}>
                  {`Workflow: ${sddProgress()?.workflow ?? "—"}`}
                </text>
                <text fg={sddProgress()?.status === "idle" ? api.theme.current.textMuted : "#FFAA00"}>
                  {`Status: ${sddProgress()?.status ?? "idle"}${sddProgress()?.autoPilot ? " (auto)" : ""}`}
                </text>
                <box gap={0} paddingTop={1}>
                  {PHASE_ORDER.map((phase) => {
                    const current = sddProgress()?.activePhase ?? "F0"
                    const status = sddProgress()?.status ?? "idle"
                    const curIdx = phaseIndex(current)
                    const myIdx = phaseIndex(phase)

                    let isActive = current === phase
                    let isCompleted = curIdx > myIdx

                    if (phase === "F1.5" && status === "awaiting_hil") {
                      isActive = false
                      isCompleted = true
                    }
                    if (phase === "HIL-A") {
                      isActive = (current === "F1.5" && status === "awaiting_hil")
                      isCompleted = curIdx > phaseIndex("F1.5") || (current === "F1.5" && status === "spec_approved")
                    }
                    if (phase === "F4" && status === "awaiting_hil") {
                      isActive = false
                      isCompleted = true
                    }
                    if (phase === "HIL-B") {
                      isActive = (current === "F4" && status === "awaiting_hil")
                      isCompleted = curIdx > phaseIndex("F4") || (current === "F4" && status === "qa_validated")
                    }

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
                      <box gap={0}>
                        <text fg={fgColor}>
                          {`${prefix}${label}`}
                        </text>
                        {isActive && agent ? (
                          <text fg="#FFAA00">
                            {`   └─ ${agent}`}
                          </text>
                        ) : null}
                      </box>
                    )
                  })}
                </box>

                {(() => {
                  const tdd = sddProgress()?.tdd
                  if (!tdd) return null
                  const redMark = tdd.red.completed ? "✓" : "○"
                  const greenMark = tdd.green.completed ? "✓" : "○"
                  const refactorMark = tdd.refactor.completed || tdd.refactor.linterClean ? "✓" : "○"

                  let tddColor = api.theme.current.textMuted
                  if (tdd.refactor.completed || tdd.refactor.linterClean) {
                    tddColor = api.theme.current.success
                  } else if (tdd.green.completed) {
                    tddColor = "#5AC8FA"
                  } else if (tdd.red.completed) {
                    tddColor = "#FF3B30"
                  }

                  return (
                    <text fg={tddColor} paddingTop={1}>
                      {`TDD: RED[${redMark}] GRN[${greenMark}] REF[${refactorMark}]`}
                    </text>
                  )
                })()}

                {(sddProgress()?.git?.branch && sddProgress()?.git?.branch !== "—") ? (
                  <text fg={sddProgress()?.git?.workingTreeClean ? api.theme.current.success : "#FF7300"}>
                    {`Git: ${sddProgress()?.git?.branch ?? "—"}${sddProgress()?.git?.workingTreeClean ? " (clean)" : " (dirty)"}`}
                  </text>
                ) : null}

                <text fg={api.theme.current.borderSubtle} paddingTop={1}>
                  {"────────────────────────────────────"}
                </text>
              </box>
            ) : null}

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

            {props.children}
          </box>
        )
      }
    }
  })
}

export default { id: "plugin_tui", tui: PluginTuiSidebar } satisfies TuiPluginModule & { id: string }
