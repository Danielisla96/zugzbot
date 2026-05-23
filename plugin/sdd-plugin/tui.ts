import h from 'solid-js/h'
import type {
  TuiPlugin,
  TuiPluginModule,
} from '@opencode-ai/plugin/tui'
import { SidebarPanel } from './components/SidebarPanel'
import { CompactStatusLine, HomeBottomView } from './components/CompactStatus'
import { useSddResource } from './lib/state'
import { SLOT_ORDER_SIDEBAR, SLOT_ORDER_SESSION_PROMPT, SLOT_ORDER_HOME_BOTTOM } from './lib/constants'

const id = 'zugzbot.sdd-sidebar'

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: SLOT_ORDER_SIDEBAR,
    slots: {
      sidebar_content(_ctx: unknown, props: { session_id: string }) {
        return h(SidebarPanel, { api: api, sessionID: props.session_id })
      },
    },
  })

  api.slots.register({
    order: SLOT_ORDER_SESSION_PROMPT,
    slots: {
      session_prompt(_ctx: unknown, props: { session_id: string }) {
        const res = useSddResource(api, props.session_id)
        return h(CompactStatusLine, { compact: res.compact, theme: api.theme })
      },
    },
  })

  api.slots.register({
    order: SLOT_ORDER_HOME_BOTTOM,
    slots: {
      home_bottom() {
        // Create a minimal session context for home_bottom
        const res = useSddResource(api, '__home__')
        return h(HomeBottomView, { compact: res.compact, theme: api.theme })
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
