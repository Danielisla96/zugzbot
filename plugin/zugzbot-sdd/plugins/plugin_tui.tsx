/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const PluginTuiSidebar: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props: { session_id?: string; children?: any }) {
        return (
          <box gap={1} padding={1}>
            <box borderStyle="double" borderColor={api.theme.current.success} padding={1}>
              <text fg={api.theme.current.success}><b>👋 ¡Hola! Zugzbot TUI está activo y funcionando.</b></text>
            </box>
            {props.children}
          </box>
        )
      }
    }
  })
}

export default { id: "plugin_tui", tui: PluginTuiSidebar } satisfies TuiPluginModule & { id: string }
