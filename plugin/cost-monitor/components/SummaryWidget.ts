import h from 'solid-js/h'
import type { TuiPluginApi } from '@opencode-ai/plugin/tui'
import { useCostResource } from '../lib/state'
import { formatCurrency, formatTokens } from '../lib/format'

interface SummaryWidgetProps {
  api: TuiPluginApi
}

export function SummaryWidget(props: SummaryWidgetProps) {
  const res = useCostResource(props.api)
  const monitorState = res.state
  const t = () => props.api.theme?.current || {}

  const today = () => monitorState().todaySummary

  return h('box', { flexDirection: 'row', gap: 1 }, [
    h('text', { fg: t().textMuted || '#888888' }, 'Costo Total Hoy:'),
    h('text', { fg: t().success || '#00ff00', style: { bold: true } }, 
      today() ? formatCurrency(today()!.totalApiCost) : '$0.00'
    ),
    h('text', { fg: t().textMuted || '#888888' }, 
      today() ? `(${formatTokens(today()!.totalInput + today()!.totalOutput)} tokens)` : '(0 tokens)'
    )
  ])
}
export function CompactStatusLine(props: SummaryWidgetProps) {
  const res = useCostResource(props.api)
  const monitorState = res.state
  const t = () => props.api.theme?.current || {}
  const today = () => monitorState().todaySummary

  const costText = () => today() ? formatCurrency(today()!.totalApiCost) : '$0.00'

  return h('text', { fg: t().textMuted || '#888888' },
    `Costo: ${costText()}`
  )
}
