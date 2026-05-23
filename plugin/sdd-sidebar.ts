import type { TuiPlugin } from '@opencode-ai/plugin/tui'
import tuiPlugin from './sdd-plugin/tui'

const id = 'zugzbot.sdd-sidebar'

const tui: TuiPlugin = tuiPlugin.tui

const plugin = {
  id,
  tui,
}

export default plugin
