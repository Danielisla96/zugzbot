import h from 'solid-js/h'
import type {
  TuiPlugin,
  TuiPluginModule,
} from '@opencode-ai/plugin/tui'
import { CostSidebarPanel } from './components/CostSidebarPanel'
import { SummaryWidget } from './components/SummaryWidget'

const id = 'zugzbot.cost-monitor'

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 20,
    slots: {
      sidebar_content(_ctx: unknown, props: { session_id: string }) {
        return h(CostSidebarPanel, { api, sessionID: props.session_id }) as any
      },
    },
  })

  api.slots.register({
    order: 110,
    slots: {
      home_bottom() {
        return h(SummaryWidget, { api }) as any
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
