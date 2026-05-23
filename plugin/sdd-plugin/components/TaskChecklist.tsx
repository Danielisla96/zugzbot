/** @jsxImportSource @opentui/solid */
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
    return <text fg={t().textMuted || '#888888'}>No hay tareas definidas</text>
  }

  // Group by section
  const sections = new Map<string, TaskItem[]>()
  for (const task of props.tasks) {
    const list = sections.get(task.section) || []
    list.push(task)
    sections.set(task.section, list)
  }

  return (
    <box flexDirection="column" gap={0}>
      <text fg={t().text || '#ffffff'}>
        <b>Progreso: {completed()}/{total()} completadas</b>
      </text>
      <box flexDirection="column" gap={0} paddingTop={1}>
        <For each={[...sections.entries()]}>
          {([section, items]) => (
            <box flexDirection="column" gap={0}>
              <text fg={t().textMuted || '#888888'}>{section}</text>
              <For each={items}>
                {(item) => (
                  <box flexDirection="row" gap={1} paddingLeft={1}>
                    <text fg={item.completed ? (t().success || '#00ff00') : (t().textMuted || '#888888')}>
                      {item.completed ? '[x]' : '[ ]'}
                    </text>
                    <text fg={item.completed ? (t().textMuted || '#888888') : (t().text || '#ffffff')}>
                      {item.text}
                    </text>
                  </box>
                )}
              </For>
            </box>
          )}
        </For>
      </box>
    </box>
  )
}
