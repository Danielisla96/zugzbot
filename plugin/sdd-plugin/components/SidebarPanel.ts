import h from 'solid-js/h'
import { Show } from 'solid-js'
import type { TuiPluginApi } from '@opencode-ai/plugin/tui'
import { CollapsibleSection } from './CollapsibleSection'
import { PhaseList } from './PhaseList'
import { TaskChecklist } from './TaskChecklist'
import { PhaseHistory } from './PhaseHistory'
import { useSddResource } from '../lib/state'
import { getProgressBar, getHitoLabel } from '../lib/format'
import { PLUGIN_VERSION } from '../lib/constants'

interface SidebarPanelProps {
  api: TuiPluginApi
  sessionID: string
}

export function SidebarPanel(props: SidebarPanelProps) {
  const res = useSddResource(props.api, props.sessionID)
  const sidebar = res.sidebar
  const theme = () => props.api.theme?.current || {}

  return h('box', { flexDirection: 'column', gap: 0, paddingLeft: 1, paddingRight: 1 }, [
    h('text', { fg: theme().border || '#444444' }, '\u2500'.repeat(36)),

    h('box', { flexDirection: 'row', gap: 1, paddingTop: 1 }, [
      h('text', { fg: theme().success || '#00ff00' }, h('b', null, '[SDD Monitor]')),
      h('text', { fg: theme().textMuted || '#888888' }, '\u2022 ' + PLUGIN_VERSION),
    ]),

    h(Show, {
      when: sidebar().lock,
      fallback: h('box', { paddingTop: 1, paddingBottom: 1 }, [
        h(Show, { when: () => sidebar().status === 'loading' },
          h('text', { fg: theme().textMuted || '#888888' }, 'Cargando...')
        ),
        h(Show, { when: () => sidebar().status === 'idle' },
          h('text', { fg: theme().textMuted || '#888888' }, '\u2693 Esperando inicio de ciclo SDD...')
        ),
      ])
    }, () => h('box', { flexDirection: 'column', gap: 0, paddingTop: 1 }, [
      // Overview section
      h(CollapsibleSection, {
        id: 'overview',
        title: 'SDD Overview',
        summary: sidebar().lock!.change_name + ' \u2022 F' + sidebar().lock!.active_phase + '/8',
        api: props.api,
      }, [
        h('text', { fg: theme().text || '#ffffff' }, [
          h('b', null, 'Cambio:'),
          ' ',
          h('span', { style: { fg: theme().success || '#00ff00' } }, sidebar().lock!.change_name),
        ]),
        h('box', { flexDirection: 'row', gap: 1 }, [
          h('text', { fg: theme().textMuted || '#888888' }, h('b', null, 'Modo:')),
          h(Show, {
            when: () => sidebar().lock!.auto_pilot,
            fallback: h('text', { fg: theme().text || '#ffffff' }, '\u2693 INTERACTIVO')
          }, h('text', { fg: theme().warning || '#ffff00' }, '\u2708 PILOTO AUTOM\u00C1TICO')),
        ]),
        h('box', { flexDirection: 'row', gap: 1 }, [
          h('text', { fg: theme().textMuted || '#888888' }, h('b', null, 'Estado:')),
          h(Show, {
            when: () => sidebar().lock!.status === 'running',
            fallback: h('text', {
              fg: sidebar().lock!.status === 'corrective_loop'
                ? (theme().error || '#ff0000')
                : (theme().success || '#00ff00')
            }, sidebar().lock!.status === 'corrective_loop' ? '\u27F3 CORRECTIVO' : 'IDLE / WAITING')
          }, h('text', { fg: theme().warning || '#ffff00' }, 'RUNNING \u26A1')),
        ]),
        h(Show, { when: () => sidebar().lock!.iteration > 0 },
          h('text', { fg: theme().warning || '#ffff00' },
            h('b', null, 'Iteraci\u00F3n correctiva: #' + sidebar().lock!.iteration)
          )
        ),
        h('text', { fg: theme().textMuted || '#888888' },
          h('b', null, 'Subagente:'), ' @' + sidebar().lock!.active_subagent
        ),
        h('text', { fg: theme().textMuted || '#888888' },
          h('b', null, 'Hito:'), ' ' + getHitoLabel(sidebar().lock!.active_phase)
        ),
        h('text', { fg: theme().textMuted || '#888888' },
          h('b', null, 'Actualizado:'), ' ' + sidebar().lock!.last_updated
        ),
        h('box', { flexDirection: 'column', gap: 0, paddingTop: 1, paddingBottom: 1 }, [
          h('text', { fg: theme().text || '#ffffff' }, h('b', null, 'Hito Completo:')),
          h('text', { fg: theme().success || '#00ff00' }, getProgressBar(sidebar().lock!.active_phase)),
        ]),
      ]),

      // Phase Progress section
      h(CollapsibleSection, {
        id: 'phases',
        title: 'Phase Progress',
        summary: 'F' + sidebar().lock!.active_phase + ' activa',
        api: props.api,
      }, h(PhaseList, { lock: sidebar().lock!, theme: theme() })),

      // Agent Activity section
      h(CollapsibleSection, {
        id: 'agents',
        title: 'Agent Activity',
        summary: '@' + sidebar().lock!.active_subagent,
        api: props.api,
      }, h('box', { flexDirection: 'column', gap: 0 }, [
        h('text', { fg: theme().text || '#ffffff' }, [
          h('b', null, 'Agente actual:'),
          ' ',
          h('span', { style: { fg: theme().warning || '#ffff00' } }, '@' + sidebar().lock!.active_subagent),
        ]),
        h('box', { paddingTop: 1 },
          h(PhaseHistory, { entries: sidebar().history, theme: theme() })
        ),
      ])),

      // Task Checklist section
      h(CollapsibleSection, {
        id: 'tasks',
        title: 'Task Checklist',
        summary: sidebar().tasks.filter(t => t.completed).length + '/' + sidebar().tasks.length + ' tareas',
        api: props.api,
      }, h(TaskChecklist, { tasks: sidebar().tasks, theme: theme() })),

      h('text', { fg: theme().border || '#444444', paddingTop: 1 }, '\u2500'.repeat(36)),
    ])),
  ])
}
