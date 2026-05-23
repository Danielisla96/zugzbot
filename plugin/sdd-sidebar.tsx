/** @jsxImportSource @opentui/solid */
import type {
  TuiPlugin,
  TuiPluginApi,
  TuiPluginModule,
} from '@opencode-ai/plugin/tui'
import { createSignal, onCleanup, Show, For } from 'solid-js'
import fs from 'node:fs/promises'
import path from 'node:path'

interface SddLock {
  change_name: string
  active_phase: number
  active_subagent: string
  status: string
  auto_pilot: boolean
  iteration: number
  last_updated: string
}

const id = 'zugzbot.sdd-sidebar'

const SDD_PHASES = [
  { id: 0, name: "F0: Diagnóstico de Entorno", agent: "sdd-architect" },
  { id: 1, name: "F1: Propuesta y Especificación", agent: "sdd-architect" },
  { id: 2, name: "F2: Arquitectura y Planificación", agent: "sdd-architect" },
  { id: 3, name: "F3: Implementación de Código", agent: "sdd-implementer" },
  { id: 4, name: "F4: Percepción y Diseño Visual", agent: "sdd-implementer" },
  { id: 5, name: "F5: Entorno y Pruebas Manuales", agent: "sdd-launcher" },
  { id: 6, name: "F6: Calidad y Pruebas QA", agent: "sdd-release-manager" },
  { id: 7, name: "F7: Documentación Canónica", agent: "sdd-release-manager" },
  { id: 8, name: "F8: Archivación y Cierre", agent: "sdd-release-manager" }
]

function getProgressBar(phaseNum: number) {
  const percentage = Math.min(100, Math.round((phaseNum / 8) * 100))
  const width = 16
  const filledLength = Math.round((percentage / 100) * width)
  const emptyLength = width - filledLength
  const filled = "█".repeat(filledLength)
  const empty = "░".repeat(emptyLength)
  return `[${filled}${empty}] ${percentage}%`
}

function SidebarContentView(props: { api: TuiPluginApi }) {
  const [lock, setLock] = createSignal<SddLock | null>(null)
  
  const dir = props.api.state.path.directory || process.cwd()
  const lockFilePath = path.join(dir, '.openspec', 'sdd-lock.json')
  
  const checkLockFile = async () => {
    try {
      const content = await fs.readFile(lockFilePath, 'utf8')
      const parsed = JSON.parse(content) as SddLock
      setLock(parsed)
    } catch {
      setLock(null)
    }
  }

  // Check immediately
  void checkLockFile()
  
  // Set up periodic check (750ms)
  const interval = setInterval(() => {
    void checkLockFile()
  }, 750)
  
  onCleanup(() => {
    clearInterval(interval)
  })

  return (
    <box flexDirection="column" gap={0} paddingLeft={1} paddingRight={1}>
      {/* Divider */}
      <text fg={props.api.theme.current.border}>────────────────────────────────────</text>
      
      {/* Header */}
      <box flexDirection="row" gap={1} paddingTop={1}>
        <text fg={props.api.theme.current.success}><b>[SDD Monitor]</b></text>
        <text fg={props.api.theme.current.textMuted}>• v1.4.5</text>
      </box>
      
      <Show 
        when={lock()} 
        fallback={
          <box paddingTop={1} paddingBottom={1}>
            <text fg={props.api.theme.current.textMuted}>⚓ Esperando inicio de ciclo SDD...</text>
          </box>
        }
      >
        <box flexDirection="column" gap={0} paddingTop={1}>
          {/* Metadata */}
          <text fg={props.api.theme.current.text}>
            <b>Cambio:</b> <span style={{ fg: props.api.theme.current.success }}>{lock()!.change_name}</span>
          </text>
          
          <box flexDirection="row" gap={1} paddingTop={0}>
            <text fg={props.api.theme.current.textMuted}><b>Modo:</b></text>
            <Show when={lock()!.auto_pilot} fallback={<text fg={props.api.theme.current.text}>⚓ INTERACTIVO</text>}>
              <text fg={props.api.theme.current.warning}>✈ PILOTO AUTOMÁTICO</text>
            </Show>
          </box>
          
          <box flexDirection="row" gap={1}>
            <text fg={props.api.theme.current.textMuted}><b>Estado IA:</b></text>
            <Show when={lock()!.status === 'running'} fallback={<text fg={props.api.theme.current.success}>IDLE / WAITING</text>}>
              <text fg={props.api.theme.current.warning}>RUNNING ⚡</text>
            </Show>
          </box>
          
          {/* Progress Bar */}
          <box flexDirection="column" gap={0} paddingTop={1} paddingBottom={1}>
            <text fg={props.api.theme.current.text}><b>Hito Completo:</b></text>
            <text fg={props.api.theme.current.success}>{getProgressBar(lock()!.active_phase)}</text>
          </box>
          
          {/* Phases Checklist */}
          <text fg={props.api.theme.current.text}><b>Fases de la Metodología:</b></text>
          <box flexDirection="column" gap={0} paddingTop={1}>
            <For each={SDD_PHASES}>
              {(phase, idx) => {
                const isActive = lock()!.active_phase === idx()
                const isCompleted = lock()!.active_phase > idx()
                
                let icon = '○'
                let fgColor = props.api.theme.current.textMuted
                
                if (isCompleted) {
                  icon = '✓'
                  fgColor = props.api.theme.current.success
                } else if (isActive) {
                  icon = lock()!.status === 'running' ? '⚡' : '▶'
                  fgColor = props.api.theme.current.warning
                }
                
                return (
                  <box flexDirection="row" gap={1} paddingBottom={0}>
                    <text fg={fgColor}><b>{icon}</b></text>
                    <text fg={isActive ? props.api.theme.current.text : props.api.theme.current.textMuted}>
                      <Show when={isActive} fallback={phase.name}>
                        <b>{phase.name}</b>
                        <span style={{ fg: props.api.theme.current.textMuted }}> (@{lock()!.active_subagent})</span>
                      </Show>
                    </text>
                  </box>
                )
              }}
            </For>
          </box>
        </box>
      </Show>
      
      {/* Divider */}
      <text fg={props.api.theme.current.border} paddingTop={1}>────────────────────────────────────</text>
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 10,
    slots: {
      sidebar_content(_ctx: unknown, props: { session_id: string }) {
        return <SidebarContentView api={api} />
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
