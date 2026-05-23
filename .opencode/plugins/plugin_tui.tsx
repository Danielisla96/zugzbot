/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup } from "solid-js"
import fs from "fs"
import path from "path"

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

        // Cálculo reactivo de consumo acumulado de la sesión
        const calculateUsage = () => {
          const messages = api.state.session.messages(props.session_id) || []
          let totalCost = 0
          let totalInput = 0
          let totalOutput = 0

          for (const msg of messages) {
            // Sumar costo
            if (typeof msg.cost === "number" && Number.isFinite(msg.cost)) {
              totalCost += msg.cost
            }
            // Sumar tokens
            if (msg.tokens) {
              totalInput += msg.tokens.input || 0
              totalOutput += msg.tokens.output || 0
            }
          }

          return {
            cost: totalCost,
            input: totalInput,
            output: totalOutput
          }
        }

        const [usageState, setUsageState] = createSignal(calculateUsage())

        // Polling reactivo robusto cada 1000ms
        const interval = setInterval(() => {
          setLockState(loadLockfile())
          setUsageState(calculateUsage())
        }, 1000)

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

          const currentPhase = state.active_phase ?? 0
          const progressPercent = Math.round((currentPhase / 8) * 100)
          
          // Barra ASCII premium
          const barLength = 16
          const completedChars = Math.round((currentPhase / 8) * barLength)
          const remainingChars = barLength - completedChars
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

        const SDDUsage = () => {
          const u = usageState()
          return (
            <box gap={0} paddingTop={1} paddingBottom={1}>
              <text fg={api.theme.current.success}>
                <b>[Métricas de Sesión] 💸</b>
              </text>
              
              <box gap={0} paddingLeft={1}>
                <text fg={api.theme.current.text}>
                  <b>Costo Total:</b> ${u.cost.toFixed(5)}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Tokens Entrada:</b> {u.input.toLocaleString()}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Tokens Salida:</b> {u.output.toLocaleString()}
                </text>
                <text fg={api.theme.current.text}>
                  <b>Tokens Totales:</b> {(u.input + u.output).toLocaleString()}
                </text>
              </box>
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
