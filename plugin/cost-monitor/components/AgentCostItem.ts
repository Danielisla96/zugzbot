import h from 'solid-js/h'
import { formatCurrency, formatTokens } from '../lib/format'
import type { AgentCostSummary } from '../lib/aggregator'

interface AgentCostItemProps {
  agent: AgentCostSummary
  theme: Record<string, string>
}

export function AgentCostItem(props: AgentCostItemProps) {
  const agent = () => props.agent
  const t = () => props.theme

  const getAgentColor = (name: string) => {
    if (name.includes('architect')) return t().warning || '#f59e0b' // Amber/Warm Orange
    if (name.includes('implementer')) return t().success || '#10b981' // Emerald/Sleek Green
    if (name.includes('launcher')) return t().info || '#3b82f6' // Ocean Blue
    if (name.includes('release')) return '#8b5cf6' // Violet
    if (name.includes('explore')) return '#06b6d4' // Cyan
    if (name.includes('general')) return t().text || '#ffffff'
    return t().textMuted || '#888888'
  }

  return h('box', { flexDirection: 'column', gap: 0, paddingLeft: 1, paddingBottom: 1 }, [
    h('box', { flexDirection: 'row', gap: 1 }, [
      h('text', { fg: getAgentColor(agent().agentName) }, h('b', null, agent().agentName)),
      h('text', { fg: t().textMuted || '#888888' }, '\u2014'),
      h('text', { fg: t().text || '#ffffff' }, h('b', null, formatCurrency(agent().apiCost))),
    ]),
    h('box', { flexDirection: 'row', gap: 1, paddingLeft: 1 }, [
      h('text', { fg: t().textMuted || '#888888' }, 
        `In: ${formatTokens(agent().input)} \u2022 Out: ${formatTokens(agent().output)}` + 
        (agent().cacheRead ? ` \u2022 Cache: ${formatTokens(agent().cacheRead)}` : '') +
        ` \u2022 ${agent().sessionCount} ses.`
      )
    ])
  ])
}
