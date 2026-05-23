/** @jsxImportSource @opentui/solid */
import { For, Show } from 'solid-js'
import type { PhaseHistoryEntry } from '../lib/types'
import { formatTimestamp } from '../lib/format'

interface PhaseHistoryProps {
  entries: PhaseHistoryEntry[]
  theme: { current: Record<string, string> }
}

export function PhaseHistory(props: PhaseHistoryProps) {
  const t = () => props.theme.current
  const recent = () => props.entries.slice(-10)

  if (recent().length === 0) {
    return <text fg={t().textMuted || '#888888'}>Sin historial de fases</text>
  }

  return (
    <box flexDirection="column" gap={0}>
      <For each={recent()}>
        {(entry) => {
          const icon = entry.status === 'entered' ? '→' : entry.status === 'completed' ? '✓' : '⟳'
          const fg = entry.status === 'completed' ? (t().success || '#00ff00')
            : entry.status === 'corrective' ? (t().warning || '#ffff00')
            : (t().text || '#ffffff')

          return (
            <box flexDirection="row" gap={1}>
              <text fg={fg}>{icon}</text>
              <text fg={t().text || '#ffffff'}>
                F{entry.phase} → @{entry.subagent}
              </text>
              <text fg={t().textMuted || '#888888'}>
                {formatTimestamp(entry.timestamp)}
              </text>
            </box>
          )
        }}
      </For>
    </box>
  )
}
