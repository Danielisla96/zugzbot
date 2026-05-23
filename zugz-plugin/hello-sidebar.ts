import type { TuiPlugin } from '@opencode-ai/plugin/tui'
import helloPlugin from './hello/tui'

const id = 'zugzbot.hello'

const tui: TuiPlugin = helloPlugin.tui

const plugin = {
  id,
  tui,
}

export default plugin
