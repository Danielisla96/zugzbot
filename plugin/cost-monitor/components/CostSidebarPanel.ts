import h from 'solid-js/h'
import { Show, For, createSignal } from 'solid-js'
import type { TuiPluginApi } from '@opencode-ai/plugin/tui'
import { useCostResource } from '../lib/state'
import { AgentCostItem } from './AgentCostItem'
import { formatCurrency, formatTokens } from '../lib/format'
import type { AgentCostSummary, DayCostSummary } from '../lib/aggregator'

interface CostSidebarPanelProps {
  api: TuiPluginApi
  sessionID: string
}

interface CostCollapsibleProps {
  title: string
  summary?: string
  theme: Record<string, string>
  children: any
}

function CostCollapsible(props: CostCollapsibleProps) {
  const [collapsed, setCollapsed] = createSignal(false)
  
  return h('box', { flexDirection: 'column', gap: 0, paddingTop: 1 }, [
    h('box', { flexDirection: 'row', gap: 1, onMouseDown: () => setCollapsed(!collapsed()) }, [
      h('text', { fg: props.theme.text || '#ffffff' },
        h('b', null, (collapsed() ? '▶' : '▼') + ' ' + props.title)
      ),
      h(Show, { when: collapsed() && props.summary }, () =>
        h('text', { fg: props.theme.textMuted || '#888888' }, '— ' + props.summary)
      )
    ]),
    h(Show, { when: !collapsed() }, () =>
      h('box', { flexDirection: 'column', gap: 0, paddingLeft: 1, paddingTop: 1 }, props.children)
    )
  ])
}

export function CostSidebarPanel(props: CostSidebarPanelProps) {
  const res = useCostResource(props.api)
  const monitorState = res.state
  const theme = () => props.api.theme?.current || {}

  const today = () => monitorState().todaySummary
  const history = () => monitorState().historySummaries

  return h('box', { flexDirection: 'column', gap: 0, paddingLeft: 1, paddingRight: 1 }, [
    // Header line
    h('text', { fg: theme().border || '#444444' }, '\u2500'.repeat(36)),

    h('box', { flexDirection: 'row', gap: 1, paddingTop: 1 }, [
      h('text', { fg: theme().success || '#00ff00' }, h('b', null, '[Cost Monitor]')),
      h('text', { fg: theme().textMuted || '#888888' }, '\u2022 v1.0.0'),
    ]),

    h(Show, {
      when: () => monitorState().status !== 'loading',
      fallback: h('box', { paddingTop: 1 }, [
        h('text', { fg: theme().textMuted || '#888888' }, 'Cargando costos...')
      ])
    }, [
      // Section for Today
      h(CostCollapsible, {
        title: 'Gastos de Hoy',
        summary: today() ? formatCurrency(today()!.totalApiCost) : '$0.00',
        theme: theme(),
      }, [
        h(Show, {
          when: () => today() && today()!.agents.length > 0,
          fallback: h('box', { paddingLeft: 1, paddingBottom: 1 }, [
            h('text', { fg: theme().textMuted || '#888888' }, 'No hay consumos registrados hoy.')
          ])
        }, [
          // Total breakdown header for today
          h('box', { flexDirection: 'column', gap: 0, paddingBottom: 1, paddingLeft: 1 }, [
            h('box', { flexDirection: 'row', gap: 1 }, [
              h('text', { fg: theme().textMuted || '#888888' }, 'Total:'),
              h('text', { fg: theme().success || '#00ff00' }, h('b', null, formatCurrency(today()!.totalApiCost))),
            ]),
            h('box', { flexDirection: 'row', gap: 1 }, [
              h('text', { fg: theme().textMuted || '#888888' }, 'Tokens:'),
              h('text', { fg: theme().text || '#ffffff' }, 
                `In: ${formatTokens(today()!.totalInput)} \u2022 Out: ${formatTokens(today()!.totalOutput)}`
              )
            ])
          ]),
          // Divider
          h('text', { fg: theme().borderSubtle || '#222222', paddingLeft: 1 }, '\u2500'.repeat(32)),
          
          // List of agents today
          h('box', { flexDirection: 'column', gap: 0, paddingTop: 1 }, 
            h(For, { each: today()?.agents }, (agent: AgentCostSummary) => 
              h(AgentCostItem, { agent, theme: theme() })
            )
          )
        ])
      ]),

      // Section for History
      h(CostCollapsible, {
        title: 'Historial Reciente',
        summary: history().length > 0 ? `${history().length} días` : 'vacío',
        theme: theme(),
      }, [
        h(Show, {
          when: () => history().length > 0,
          fallback: h('box', { paddingLeft: 1, paddingBottom: 1 }, [
            h('text', { fg: theme().textMuted || '#888888' }, 'No hay historial previo.')
          ])
        }, [
          h(For, { each: history() }, (day: DayCostSummary) => 
            h('box', { flexDirection: 'column', gap: 0, paddingBottom: 1 }, [
              h('box', { flexDirection: 'row', justifyContent: 'spaceBetween', paddingLeft: 1 }, [
                h('text', { fg: theme().secondary || '#888888' }, h('b', null, day.dateStr)),
                h('text', { fg: theme().textMuted || '#888888' }, formatCurrency(day.totalApiCost)),
              ]),
              h('box', { flexDirection: 'column', gap: 0, paddingTop: 1 }, 
                h(For, { each: day.agents }, (agent: AgentCostSummary) => 
                  h(AgentCostItem, { agent, theme: theme() })
                )
              ),
              h('text', { fg: theme().borderSubtle || '#222222', paddingLeft: 1 }, '\u2500'.repeat(32)),
            ])
          )
        ])
      ]),

      // Manual Refresh tip
      h('box', { paddingTop: 1, paddingLeft: 1 }, [
        h('text', { fg: theme().textMuted || '#888888', style: { italic: true } }, 
          'Se actualiza automáticamente al cambiar cuota'
        )
      ]),

      h('text', { fg: theme().border || '#444444', paddingTop: 1 }, '\u2500'.repeat(36)),
    ])
  ])
}
