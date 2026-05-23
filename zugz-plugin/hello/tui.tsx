/** @jsxImportSource @opentui/solid */
import type { TuiPlugin } from '@opencode-ai/plugin/tui'

export const tui: TuiPlugin = async (api) => {
  api.slots.register({
    slots: {
      sidebar_content: (_ctx, _props) => (
        <box
          width="100%"
          paddingTop={1}
          paddingLeft={2}
          paddingRight={2}
          flexDirection="column"
          gap={1}
        >
          <text fg="#7c3aed">╔════════════════════════╗</text>
          <text fg="#7c3aed">
            ║ <b>👋 Hola, Zugzbot!</b> ║
          </text>
          <text fg="#7c3aed">╚════════════════════════╝</text>
          <text fg="#6b7280">
            <i>Plugin TUI activo · SDD</i>
          </text>
        </box>
      ),
    },
  })
}

export default { tui }
