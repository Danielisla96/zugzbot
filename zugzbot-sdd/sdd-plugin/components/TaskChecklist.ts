import h from 'solid-js/h'
import { For, Show } from 'solid-js'
import type { TaskItem } from '../lib/types'

interface TaskChecklistProps {
  tasks: TaskItem[]
  theme: { current: Record<string, string> }
}

export function TaskChecklist(props: TaskChecklistProps) {
  const t = () => props.theme.current
  const completed = () => props.tasks.filter(t => t.completed).length
  const total = () => props.tasks.length

  if (total() === 0) {
    return h('text', { fg: t().textMuted || '#888888' }, 'No hay tareas definidas')
  }

  const sections = new Map<string, TaskItem[]>()
  for (const task of props.tasks) {
    const list = sections.get(task.section) || []
    list.push(task)
    sections.set(task.section, list)
  }

  return h('box', { flexDirection: 'column', gap: 0 }, [
    h('text', { fg: t().text || '#ffffff' },
      h('b', null, 'Progreso: ' + completed() + '/' + total() + ' completadas')
    ),
    h('box', { flexDirection: 'column', gap: 0, paddingTop: 1 },
      h(For, { each: [...sections.entries()] }, ([section, items]: [string, TaskItem[]]) =>
        h('box', { flexDirection: 'column', gap: 0 }, [
          h('text', { fg: t().textMuted || '#888888' }, section),
          h(For, { each: items }, (item: TaskItem) =>
            h('box', { flexDirection: 'row', gap: 1, paddingLeft: 1 }, [
              h('text', { fg: item.completed ? (t().success || '#00ff00') : (t().textMuted || '#888888') },
                item.completed ? '[x]' : '[ ]'
              ),
              h('text', { fg: item.completed ? (t().textMuted || '#888888') : (t().text || '#ffffff') },
                item.text
              ),
            ])
          ),
        ])
      )
    ),
  ])
}
