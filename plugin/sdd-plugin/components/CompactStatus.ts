import h from 'solid-js/h'
import type { SddCompactState } from '../lib/types'

interface CompactStatusProps {
  compact: () => SddCompactState
  theme: { current: Record<string, string> }
}

export function CompactStatusLine(props: CompactStatusProps) {
  const t = () => props.theme.current
  const s = () => props.compact()

  return h('text', { fg: t().textMuted || '#888888' },
    s().text || 'SDD: Esperando...'
  )
}

export function HomeBottomView(props: CompactStatusProps) {
  const t = () => props.theme.current
  const s = () => props.compact()

  if (s().status === 'idle') return null

  return h('text', { fg: t().textMuted || '#888888' },
    s().text || ''
  )
}
