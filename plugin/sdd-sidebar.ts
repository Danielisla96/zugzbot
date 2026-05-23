import type {
  TuiPlugin,
  TuiPluginApi,
  TuiPluginModule,
} from '@opencode-ai/plugin/tui'
import { createSignal, onCleanup, Show, For } from 'solid-js'
import h from 'solid-js/h'
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

  return h('box', { flexDirection: 'column', gap: 0, paddingLeft: 1, paddingRight: 1 },
    // Divider
    h('text', { fg: props.api.theme.current.border }, '────────────────────────────────────'),
    
    // Header
    h('box', { flexDirection: 'row', gap: 1, paddingTop: 1 },
      h('text', { fg: props.api.theme.current.success }, h('b', null, '[SDD Monitor]')),
      h('text', { fg: props.api.theme.current.textMuted }, '• v1.4.5')
    ),
    
    h(Show, {
      when: lock(),
      fallback: h('box', { paddingTop: 1, paddingBottom: 1 },
        h('text', { fg: props.api.theme.current.textMuted }, '⚓ Esperando inicio de ciclo SDD...')
      )
    }, () => {
      const currentLock = lock()!
      return h('box', { flexDirection: 'column', gap: 0, paddingTop: 1 },
        // Metadata
        h('text', { fg: props.api.theme.current.text },
          h('b', null, 'Cambio:'),
          ' ',
          h('span', { style: { fg: props.api.theme.current.success } }, currentLock.change_name)
        ),
        
        h('box', { flexDirection: 'row', gap: 1, paddingTop: 0 },
          h('text', { fg: props.api.theme.current.textMuted }, h('b', null, 'Modo:')),
          h(Show, {
            when: currentLock.auto_pilot,
            fallback: h('text', { fg: props.api.theme.current.text }, '⚓ INTERACTIVO')
          }, h('text', { fg: props.api.theme.current.warning }, '✈ PILOTO AUTOMÁTICO'))
        ),
        
        h('box', { flexDirection: 'row', gap: 1 },
          h('text', { fg: props.api.theme.current.textMuted }, h('b', null, 'Estado IA:')),
          h(Show, {
            when: currentLock.status === 'running',
            fallback: h('text', { fg: props.api.theme.current.success }, 'IDLE / WAITING')
          }, h('text', { fg: props.api.theme.current.warning }, 'RUNNING ⚡'))
        ),
        
        // Progress Bar
        h('box', { flexDirection: 'column', gap: 0, paddingTop: 1, paddingBottom: 1 },
          h('text', { fg: props.api.theme.current.text }, h('b', null, 'Hito Completo:')),
          h('text', { fg: props.api.theme.current.success }, getProgressBar(currentLock.active_phase))
        ),
        
        // Phases Checklist
        h('text', { fg: props.api.theme.current.text }, h('b', null, 'Fases de la Metodología:')),
        h('box', { flexDirection: 'column', gap: 0, paddingTop: 1 },
          h(For, { each: SDD_PHASES }, (phase: { id: number; name: string; agent: string }, idx: () => number) => {
            const isActive = () => lock()?.active_phase === idx()
            const isCompleted = () => (lock()?.active_phase ?? 0) > idx()
            
            const icon = () => {
              if (isCompleted()) return '✓'
              if (isActive()) return lock()?.status === 'running' ? '⚡' : '▶'
              return '○'
            }
            
            const fgColor = () => {
              if (isCompleted()) return props.api.theme.current.success
              if (isActive()) return props.api.theme.current.warning
              return props.api.theme.current.textMuted
            }
            
            return h('box', { flexDirection: 'row', gap: 1, paddingBottom: 0 },
              h('text', { fg: fgColor() }, h('b', null, icon())),
              h('text', { fg: () => isActive() ? props.api.theme.current.text : props.api.theme.current.textMuted },
                h(Show, {
                  when: isActive(),
                  fallback: phase.name
                }, () => [
                  h('b', null, phase.name),
                  h('span', { style: { fg: props.api.theme.current.textMuted } }, ` (@${lock()?.active_subagent})`)
                ])
              )
            )
          })
        )
      )
    }),
    
    // Divider
    h('text', { fg: props.api.theme.current.border, paddingTop: 1 }, '────────────────────────────────────')
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 10,
    slots: {
      sidebar_content(_ctx: unknown, props: { session_id: string }) {
        return h(SidebarContentView, { api })
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
