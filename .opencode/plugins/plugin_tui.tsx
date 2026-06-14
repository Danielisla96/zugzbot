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
          } catch { }
          return fallback
        }
        const ZUGBOT_VERSION = getZugzbotVersion()

        const PHASE_ORDER = [
          "F0_DETECT",
          "F1_CONTRACT",
          "F2_IMPLEMENTATION",
          "F3_VERIFICATION",
          "F4_DEPLOYMENT"
        ] as const

        const PHASE_LABELS: Record<string, string> = {
          "F0_DETECT": "F0: Detectar",
          "F1_CONTRACT": "F1: Contrato",
          "F2_IMPLEMENTATION": "F2: Coder & HIL Local",
          "F3_VERIFICATION": "F3: Tester & Linters",
          "F4_DEPLOYMENT": "F4: Docker & HIL Final"
        }

        const SUBAGENT_FOR_PHASE: Record<string, string> = {
          "F0_DETECT": "@orchestrator",
          "F1_CONTRACT": "@spec-writer",
          "F2_IMPLEMENTATION": "@coder",
          "F3_VERIFICATION": "@tester",
          "F4_DEPLOYMENT": "@deployer"
        }

        interface SddState {
          phase: "F0_DETECT" | "F1_CONTRACT" | "F2_IMPLEMENTATION" | "F3_VERIFICATION" | "F4_DEPLOYMENT"
          activeContract: string
          stack: {
            core: string[]
            databases: string[]
          }
          updatedAt: string
          git?: {
            branch: string
            clean: boolean
          }
        }

        const getSddState = (): SddState => {
          let state = {
            phase: "F0_DETECT" as const,
            activeContract: "",
            stack: {
              core: [],
              databases: []
            },
            updatedAt: new Date().toISOString()
          }

          try {
            const statePath = path.join(process.cwd(), ".openspec/sdd_state.json")
            if (fs.existsSync(statePath)) {
              const data = JSON.parse(fs.readFileSync(statePath, "utf-8"))
              state = {
                phase: data.phase || "F0_DETECT",
                activeContract: data.activeContract || "",
                stack: {
                  core: Array.isArray(data.stack?.core) ? data.stack.core : [],
                  databases: Array.isArray(data.stack?.databases) ? data.stack.databases : []
                },
                updatedAt: data.updatedAt || new Date().toISOString()
              }
            }
          } catch { }

          // Safely read git info
          let gitInfo = { branch: "—", clean: true }
          try {
            const { execSync } = require("child_process")
            const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", stdio: "pipe" }).trim()
            const status = execSync("git status --porcelain", { encoding: "utf-8", stdio: "pipe" }).trim()
            gitInfo = { branch, clean: status === "" }
          } catch { }

          return {
            ...state,
            git: gitInfo
          }
        }

        const setSddPhase = (phase: string) => {
          try {
            const statePath = path.join(process.cwd(), ".openspec/sdd_state.json")
            const state = fs.existsSync(statePath)
              ? JSON.parse(fs.readFileSync(statePath, "utf-8"))
              : { phase: "F0_DETECT", activeContract: "", stack: { core: [], databases: [] } }

            state.phase = phase
            if (phase === "F0_DETECT") {
              state.activeContract = ""
              state.stack = { core: [], databases: [] }
            }
            state.updatedAt = new Date().toISOString()

            const dir = path.dirname(statePath)
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true })
            }
            fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8")
            setSddState(getSddState())
            api.ui.toast({ variant: "success", message: `Fase cambiada a: ${phase}` })
          } catch (e: any) {
            api.ui.toast({ variant: "error", message: `Error al cambiar fase: ${e.message}` })
          }
        }

        const getContractName = (filePath: string): string => {
          if (!filePath) return "Ninguno";
          const parts = filePath.split("/");
          const folder = parts[parts.length - 2] || "";
          const match = folder.match(/^\d{4}_\d+_(.+)$/);
          return match ? match[1] : (folder || filePath);
        }

        const truncate = (str: string, max: number): string => {
          return str.length > max ? str.slice(0, max - 3) + "..." : str;
        }

        const getMinimalStackLine = (core: string[], dbs: string[]): string => {
          const all = [...(core || []), ...(dbs || [])]
          if (all.length === 0) return ""

          const cleanName = (name: string) => {
            const lower = name.toLowerCase()
            if (lower === "typescript") return "TS"
            if (lower === "javascript") return "JS"
            if (lower === "postgresql") return "Postgres"
            if (lower === "localstorage") return "local"
            return name
          }

          const cleaned = all.map(cleanName)
          let line = cleaned[0]

          for (let i = 1; i < cleaned.length; i++) {
            const suffix = ` · ${cleaned[i]}`
            const countSuffix = ` (+${cleaned.length - (i + 1)})`
            const projectedLen = line.length + suffix.length + (i < cleaned.length - 1 ? countSuffix.length : 0)
            if (projectedLen > 34) {
              line += ` (+${cleaned.length - i})`
              break
            } else {
              line += suffix
            }
          }
          return truncate(line, 34)
        }

        const runEnvDoctor = async () => {
          try {
            api.ui.toast({ variant: "info", message: "Running environment doctor checks..." })
            const { execSync } = await import("child_process")

            const safeExec = (cmd: string): { ok: boolean; stdout: string } => {
              try {
                const stdout = execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim()
                return { ok: true, stdout }
              } catch (err: any) {
                return { ok: false, stdout: err.message || "" }
              }
            }

            const reportLines: string[] = []
            reportLines.push("# SDD Environment Diagnostics Report")
            reportLines.push(`*Generated from TUI at: ${new Date().toISOString()}*`)
            reportLines.push("")

            // 1. Node.js version check
            const nodeVer = process.version
            const nodeVerMatch = nodeVer.match(/^v(\d+)\.(\d+)\.(\d+)/)
            let isNodeOk = false
            if (nodeVerMatch) {
              const major = parseInt(nodeVerMatch[1], 10)
              const minor = parseInt(nodeVerMatch[2], 10)
              isNodeOk = (major > 22) || (major === 22 && minor >= 6)
            }
            reportLines.push(`## Node.js Version`)
            reportLines.push(`- **Current**: ${nodeVer}`)
            reportLines.push(`- **Required**: >= v22.6.0`)
            reportLines.push(`- **Status**: ${isNodeOk ? "✅ OK" : "⚠️ Warning: Node version is below v22.6.0"}`)
            reportLines.push("")

            // 2. API Keys check
            const geminiKey = process.env.GEMINI_API_KEY ? "Present (Hidden)" : "Missing"
            const googleKey = process.env.GOOGLE_API_KEY ? "Present (Hidden)" : "Missing"
            const isApiKeyOk = geminiKey !== "Missing" || googleKey !== "Missing"
            reportLines.push(`## AI API Credentials`)
            reportLines.push(`- **GEMINI_API_KEY**: ${geminiKey}`)
            reportLines.push(`- **GOOGLE_API_KEY**: ${googleKey}`)
            reportLines.push(`- **Status**: ${isApiKeyOk ? "✅ OK" : "❌ Error: Both GEMINI_API_KEY and GOOGLE_API_KEY are missing"}`)
            reportLines.push("")

            // 3. Graphify check
            const graphifyCheck = safeExec("graphify --version")
            const extractCheck = safeExec("extract --version")
            const isGraphifyInstalled = graphifyCheck.ok || extractCheck.ok
            reportLines.push(`## Graphify CLI`)
            if (isGraphifyInstalled) {
              reportLines.push(`- **Version**: ${graphifyCheck.ok ? graphifyCheck.stdout : extractCheck.stdout}`)
              reportLines.push(`- **Status**: ✅ Installed`)
            } else {
              reportLines.push(`- **Status**: ⚠️ Warning: Graphify CLI is not installed or not in PATH`)
            }
            reportLines.push("")

            // 4. Git check
            const gitCheck = safeExec("git --version")
            const insideGit = safeExec("git rev-parse --is-inside-work-tree")
            const isGitOk = gitCheck.ok && insideGit.stdout === "true"
            reportLines.push(`## Git Repository`)
            reportLines.push(`- **Git Version**: ${gitCheck.ok ? gitCheck.stdout : "Not found"}`)
            reportLines.push(`- **Inside Work Tree**: ${insideGit.ok ? insideGit.stdout : "No"}`)
            reportLines.push(`- **Status**: ${isGitOk ? "✅ OK" : "❌ Error: Git is not installed or not running inside a work tree"}`)
            reportLines.push("")

            // 5. Docker check
            const dockerCheck = safeExec("docker --version")
            reportLines.push(`## Docker`)
            reportLines.push(`- **Docker Version**: ${dockerCheck.ok ? dockerCheck.stdout : "Not running or not installed"}`)
            reportLines.push(`- **Status**: ${dockerCheck.ok ? "✅ OK" : "⚠️ Warning: Docker is not running or not installed"}`)
            reportLines.push("")

            const reportPath = path.join(process.cwd(), ".openspec/env_report.md")
            const reportDir = path.dirname(reportPath)
            if (!fs.existsSync(reportDir)) {
              fs.mkdirSync(reportDir, { recursive: true })
            }
            fs.writeFileSync(reportPath, reportLines.join("\n"), "utf-8")
            api.ui.toast({ variant: "success", message: "Environment Diagnostics written to .openspec/env_report.md!" })
          } catch (e: any) {
            api.ui.toast({ variant: "error", message: `Env doctor failed: ${e.message}` })
          }
        }

        if (api.command?.register) {
          api.command.register(() => [
            {
              title: "SDD: Ir a Fase F0: Detectar",
              value: "sdd.set_phase_f0",
              description: "Cambiar fase activa a F0_DETECT y limpiar contrato",
              slash: { name: "sdd-f0" },
              onSelect: () => {
                setSddPhase("F0_DETECT")
              }
            },
            {
              title: "SDD: Ir a Fase F1: Contrato",
              value: "sdd.set_phase_f1",
              description: "Cambiar fase activa a F1_CONTRACT",
              slash: { name: "sdd-f1" },
              onSelect: () => {
                setSddPhase("F1_CONTRACT")
              }
            },
            {
              title: "SDD: Ir a Fase F2: Coder & HIL Local",
              value: "sdd.set_phase_f2",
              description: "Cambiar fase activa a F2_IMPLEMENTATION (Desarrollo y primer HIL)",
              slash: { name: "sdd-f2" },
              onSelect: () => {
                setSddPhase("F2_IMPLEMENTATION")
              }
            },
            {
              title: "SDD: Ir a Fase F3: Tester & Linters",
              value: "sdd.set_phase_f3",
              description: "Cambiar fase activa a F3_VERIFICATION (Auditoría, linter y tests)",
              slash: { name: "sdd-f3" },
              onSelect: () => {
                setSddPhase("F3_VERIFICATION")
              }
            },
            {
              title: "SDD: Ir a Fase F4: Docker & HIL Final",
              value: "sdd.set_phase_f4",
              description: "Cambiar fase activa a F4_DEPLOYMENT (Limpieza de puertos/Docker y despliegue final)",
              slash: { name: "sdd-f4" },
              onSelect: () => {
                setSddPhase("F4_DEPLOYMENT")
              }
            },
            {
              title: "SDD: Ejecutar Diagnóstico Doctor",
              value: "sdd.run_env_doctor",
              description: "Correr diagnóstico del entorno de desarrollo",
              slash: { name: "sdd-doctor" },
              onSelect: async () => {
                await runEnvDoctor()
              }
            }
          ])
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
        const [sddState, setSddState] = createSignal<SddState>(getSddState())
        const [colorIndex, setColorIndex] = createSignal(0)

        const idsInterval = setInterval(() => {
          updateSessionIds()
          setSddState(getSddState())
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
        setSddState(getSddState())

        onCleanup(() => {
          clearInterval(idsInterval)
          clearInterval(metricsInterval)
          clearInterval(colorInterval)
        })

        return (
          <box gap={0}>
            <box gap={0} paddingTop={0} paddingLeft={1}>
              {logoLines.map((line, idx) => (
                <text fg={getLineColor(idx)}>
                  {line}
                </text>
              ))}
              <text fg={api.theme.current.textMuted} paddingTop={0}>
                {`zugzbot-sdd v${ZUGBOT_VERSION}`}
              </text>
            </box>

            {sddState() ? (
              <box gap={0} paddingLeft={1} paddingTop={0} paddingBottom={0}>
                {/* Active Contract */}
                <text fg="#FF7300" paddingTop={0}>
                  {`📄 ${truncate(getContractName(sddState()?.activeContract || ""), 30)}`}
                </text>

                {/* Stack Info */}
                {(() => {
                  const stackLine = getMinimalStackLine(sddState()?.stack.core || [], sddState()?.stack.databases || [])
                  return stackLine ? (
                    <text fg="#5AC8FA" paddingTop={0}>
                      {stackLine}
                    </text>
                  ) : null
                })()}

                {/* Vertical roadmap list */}
                <box gap={0} paddingTop={0}>
                  {PHASE_ORDER.map((phase) => {
                    const current = sddState()?.phase ?? "F0_DETECT"
                    const curIdx = PHASE_ORDER.indexOf(current)
                    const myIdx = PHASE_ORDER.indexOf(phase)

                    const isActive = current === phase
                    const isCompleted = curIdx > myIdx

                    let prefix = "[ ]"
                    let color = api.theme.current.textMuted
                    if (isCompleted) {
                      prefix = "[✓]"
                      color = api.theme.current.success
                    } else if (isActive) {
                      prefix = "[O]"
                      color = "#FF7300"
                    }

                    const agentSuffix = isActive ? ` (${SUBAGENT_FOR_PHASE[phase]})` : ""
                    const lineText = `${prefix} ${PHASE_LABELS[phase]}${agentSuffix}`

                    return (
                      <text fg={color} paddingTop={0}>
                        {truncate(lineText, 34)}
                      </text>
                    )
                  })}
                </box>

                {/* Git branch info */}
                {(sddState()?.git?.branch && sddState()?.git?.branch !== "—") ? (
                  <text fg={sddState()?.git?.clean ? api.theme.current.success : "#FF7300"} paddingTop={0}>
                    {`⌥ Git: ${truncate(sddState()?.git?.branch ?? "—", 18)}${sddState()?.git?.clean ? " (clean)" : " (dirty)"}`}
                  </text>
                ) : null}

                <text fg={api.theme.current.borderSubtle} paddingTop={0}>
                  {"──────────────────────────────────"}
                </text>
              </box>
            ) : null}

            <box gap={0} paddingLeft={1} paddingTop={0} paddingBottom={0}>
              {metrics().agents.map((agent) => {
                const lineText = `${agent.isSubagent ? "  " : ""}${agent.name.replace("sdd-", "")}: ${formatCost(agent.cost)} (${formatTokens(agent.tokensInput)}/${formatTokens(agent.tokensOutput)})`
                return (
                  <text fg={agent.isSubagent ? api.theme.current.textMuted : api.theme.current.text} paddingTop={0}>
                    {truncate(lineText, 34)}
                  </text>
                )
              })}
              <text fg={api.theme.current.borderSubtle} paddingTop={0}>
                {"──────────────────────────────────"}
              </text>
              <text fg={api.theme.current.success} paddingTop={0}>
                {truncate(`Total: ${formatCost(metrics().totalCost)} (${formatTokens(metrics().totalInput)}/${formatTokens(metrics().totalOutput)})`, 34)}
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
