/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup } from "solid-js"
import fs from "fs"
import path from "path"

const POLLING_INTERVAL_MS = 1000

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
      sidebar_content(_ctx, props: { children?: any }) {
        const [lockState, setLockState] = createSignal(loadLockfile())
        const [currentTime, setCurrentTime] = createSignal(Date.now())

        // Constantes inline de acciones y agentes por fase
        const PHASE_ACTIONS: Record<number, string> = {
          0: "Analizando entorno y dependencias...",
          1: "Escribiendo propuesta y especificaciones BDD...",
          2: "Generando checklist de tareas y planos...",
          3: "Implementando lógica y componentes modulares...",
          4: "Refinando diseño UX/UI y micro-animaciones...",
          5: "Desplegando en caliente y corriendo tests...",
          6: "Verificando calidad final, linter y reportes...",
          7: "Actualizando README, changelog y versionamiento...",
          8: "Archivando cambio y confirmando en Git..."
        }

        const PHASE_AGENTS: Record<number, string> = {
          0: "sdd-architect 📐",
          1: "sdd-architect 📐",
          2: "sdd-architect 📐",
          3: "sdd-implementer 💻",
          4: "sdd-implementer 💻",
          5: "sdd-launcher 🚀",
          6: "sdd-release-manager 📦",
          7: "sdd-release-manager 📦",
          8: "sdd-release-manager 📦"
        }

        const PHASE_NAMES = ["Diagnóstico", "Propuesta", "Planificación", "Codificación",
          "Pulido UX/UI", "Despliegue/Test", "Control QA", "Documentación", "Cierre/Git"]

        const PHASE_ICONS = ["🔍", "📝", "📐", "🛠️", "🎨", "🚀", "🧪", "📄", "📦"]

        // Polling simple: solo refresca lockfile y timestamp
        const interval = setInterval(() => {
          setLockState(loadLockfile())
          setCurrentTime(Date.now())
        }, POLLING_INTERVAL_MS)

        onCleanup(() => {
          clearInterval(interval)
        })

        // Lee phase_history.jsonl para obtener timestamp y razón de la fase activa
        const getActiveAgentData = (state: any) => {
          if (!state || !state.change_name || state.change_name === "nuevo-cambio") {
            return { timestamp: null, action: PHASE_ACTIONS[state?.active_phase ?? 0] ?? "Trabajando en el ciclo SDD..." }
          }
          const historyPath = path.join(projectRoot, ".openspec/changes", state.change_name, "phase_history.jsonl")
          if (fs.existsSync(historyPath)) {
            try {
              const lines = fs.readFileSync(historyPath, "utf-8").trim().split("\n")
              for (let i = lines.length - 1; i >= 0; i--) {
                const entry = JSON.parse(lines[i])
                if (entry.phase === state.active_phase) {
                  return { timestamp: entry.timestamp, action: entry.reason }
                }
              }
            } catch (e) {}
          }
          return { timestamp: null, action: PHASE_ACTIONS[state.active_phase ?? 0] ?? "Trabajando en el ciclo SDD..." }
        }

        const SDDMonitor = () => {
          const state = lockState()
          if (!state) {
            return (
              <box gap={0} paddingTop={1}>
                <text fg={api.theme.current.textMuted}>
                  <i>[SDD Monitor Inactivo]</i>
                </text>
                <text fg={api.theme.current.textMuted}>sdd-lock.json no encontrado</text>
              </box>
            )
          }

          const currentPhase = typeof state.active_phase === "number"
            ? Math.max(0, Math.min(8, state.active_phase))
            : 0
          const agentData = getActiveAgentData(state)

          // Formatear elapsed time
          let elapsedStr = "0s activo"
          if (agentData.timestamp) {
            const diffMs = currentTime() - new Date(agentData.timestamp).getTime()
            if (diffMs > 0) {
              const d = Math.floor(diffMs / 1000)
              elapsedStr = d < 60 ? `${d}s activo` : `${Math.floor(d / 60)}m ${d % 60}s activo`
            }
          }

          // Emoji dinámico según subagente
          const subEmoji = state.active_subagent?.includes("architect") ? "📐"
            : state.active_subagent?.includes("implementer") ? "💻"
            : state.active_subagent?.includes("launcher") ? "🚀" : "📦"

          return (
            <box gap={0} paddingTop={1} paddingBottom={1}>
              {/* Encabezado */}
              <text fg={api.theme.current.accent}><b>🤖 ZUGZBOT SDD</b></text>
              <text fg={api.theme.current.text}>
                <b>Cambio:</b> <span fg={api.theme.current.success}>{state.change_name}</span>
              </text>
              <text fg={api.theme.current.text}>
                <b>Modo:</b> {state.auto_pilot ? "Piloto Automático ⚡" : "Manual 🛑"}
              </text>

              {/* Separador */}
              <text fg={api.theme.current.textMuted}>──────────────────────────────</text>

              {/* Fase activa destacada */}
              <text fg={api.theme.current.success}>
                <b>► Fase Activa: {PHASE_ICONS[currentPhase]} {PHASE_NAMES[currentPhase]}</b>
              </text>

              {/* Barra de progreso compacta (1 línea) */}
              <text fg={api.theme.current.textMuted}>
                {PHASE_ICONS.map((ic, i) =>
                  i < currentPhase ? `✔${ic}` : i === currentPhase ? `●${ic}` : `○${ic}`
                ).join(" ")}
              </text>

              {/* Tarjeta del agente activo */}
              <box borderStyle="double" borderColor={api.theme.current.success} padding={1} gap={0}>
                <text fg={api.theme.current.success}><b>🧠 AGENTE ACTIVO</b></text>
                <text fg={api.theme.current.text}><b>Agente:</b> {state.active_subagent} {subEmoji}</text>
                <text fg={api.theme.current.text}><b>Acción:</b> "{agentData.action}"</text>
                <text fg={api.theme.current.text}>
                  <b>Tiempo:</b> <span fg={api.theme.current.warning}><b>{elapsedStr}</b></span>
                </text>
                <text fg={api.theme.current.text}>
                  <b>Iteración:</b> #{state.iteration} | <b>Estado:</b>{" "}
                  {state.status === "in_progress" ? "Activo 🟢" : "Espera 🟡"}
                </text>
              </box>

              {/* Siguiente paso o ciclo completado */}
              {currentPhase < 8 ? (
                <text fg={api.theme.current.accent}>
                  <b>🔮 Siguiente paso:</b> {PHASE_NAMES[currentPhase + 1]} ({PHASE_AGENTS[currentPhase + 1]})
                </text>
              ) : (
                <text fg={api.theme.current.success}><b>🎉 ¡CICLO COMPLETADO!</b></text>
              )}
            </box>
          )
        }

        return (
          <box gap={0}>
            <SDDMonitor />
            {props.children}
          </box>
        )
      }
    }
  })
}

export default { id: "plugin_tui", tui: PluginTuiSidebar } satisfies TuiPluginModule & { id: string }
