import h from 'solid-js/h'
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
    return h('text', { fg: t().textMuted || '#888888' }, 'Sin historial de fases')
  }

  return h('box', { flexDirection: 'column', gap: 0 },
    h(For, { each: recent() }, (entry: PhaseHistoryEntry) => {
      const icon = entry.status === 'entered' ? '\u2192' : entry.status === 'completed' ? '\u2713' : '\u27F3'
      const fg = entry.status === 'completed' ? (t().success || '#00ff00')
        : entry.status === 'corrective' ? (t().warning || '#ffff00')
        : (t().text || '#ffffff')

      return h('box', { flexDirection: 'row', gap: 1 }, [
        h('text', { fg: fg }, icon),
        h('text', { fg: t().text || '#ffffff' },
          'F' + entry.phase + ' \u2192 @' + entry.subagent
        ),
        h('text', { fg: t().textMuted || '#888888' },
          formatTimestamp(entry.timestamp)
        ),
      ])
    })
  )
}
