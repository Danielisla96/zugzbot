/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const PluginTuiSidebar: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(_ctx, props: { session_id: string; children?: any }) {
        return (
          <box gap={0}>
            {/* Custom Greeting Widget */}
            <box gap={0} paddingTop={1} paddingBottom={1}>
              <text fg={api.theme.current.accent}>
                <b>[Mi Complemento TUI] 🌟</b>
              </text>
              <box gap={0} paddingLeft={1}>
                <text fg={api.theme.current.success}>
                  <b>¡Hola de parte de Zugzbot! 👋</b>
                </text>
                <text fg={api.theme.current.text}>
                  ¡Que tengas una excelente sesión de programación! 💻
                </text>
              </box>
            </box>

            {/* Separador */}
            <box paddingTop={1} borderTop={1} borderStyle="single" borderColor={api.theme.current.borderSubtle} />

            {/* Chat original de OpenCode */}
            {props.children}
          </box>
        )
      }
    }
  })
}

export default { id: "plugin_tui", tui: PluginTuiSidebar } satisfies TuiPluginModule & { id: string }
