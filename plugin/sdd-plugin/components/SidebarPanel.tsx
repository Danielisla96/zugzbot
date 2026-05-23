/** @jsxImportSource @opentui/solid */
import { Show } from 'solid-js'
import type { TuiPluginApi } from '@opencode-ai/plugin/tui'
import { CollapsibleSection } from './CollapsibleSection'
import { PhaseList } from './PhaseList'
import { TaskChecklist } from './TaskChecklist'
import { PhaseHistory } from './PhaseHistory'
import { useSddResource } from '../lib/state'
import { getProgressBar, getHitoLabel } from '../lib/format'
import { PLUGIN_VERSION } from '../lib/constants'

interface SidebarPanelProps {
  api: TuiPluginApi
  sessionID: string
}

export function SidebarPanel(props: SidebarPanelProps) {
  const res = useSddResource(props.api, props.sessionID)
  const sidebar = res.sidebar
  const theme = () => props.api.theme?.current || {}

  return (
    <box flexDirection="column" gap={0} paddingLeft={1} paddingRight={1}>
      <text fg={theme().border || '#444444'}>────────────────────────────────────</text>

      <box flexDirection="row" gap={1} paddingTop={1}>
        <text fg={theme().success || '#00ff00'}><b>[SDD Monitor]</b></text>
        <text fg={theme().textMuted || '#888888'}>• {PLUGIN_VERSION}</text>
      </box>

      <Show
        when={sidebar().lock}
        fallback={
          <box paddingTop={1} paddingBottom={1}>
            <Show when={sidebar().status === 'loading'}>
              <text fg={theme().textMuted || '#888888'}>Cargando...</text>
            </Show>
            <Show when={sidebar().status === 'idle'}>
              <text fg={theme().textMuted || '#888888'}>⚓ Esperando inicio de ciclo SDD...</text>
            </Show>
          </box>
        }
      >
        <box flexDirection="column" gap={0} paddingTop={1}>
          {/* Overview section */}
          <CollapsibleSection id="overview" title="SDD Overview" summary={`${sidebar().lock!.change_name} • F${sidebar().lock!.active_phase}/8`} api={props.api}>
            <text fg={theme().text || '#ffffff'}>
              <b>Cambio:</b> <span style={{ fg: theme().success || '#00ff00' }}>{sidebar().lock!.change_name}</span>
            </text>
            <box flexDirection="row" gap={1}>
              <text fg={theme().textMuted || '#888888'}><b>Modo:</b></text>
              <Show when={sidebar().lock!.auto_pilot} fallback={<text fg={theme().text || '#ffffff'}>⚓ INTERACTIVO</text>}>
                <text fg={theme().warning || '#ffff00'}>✈ PILOTO AUTOMÁTICO</text>
              </Show>
            </box>
            <box flexDirection="row" gap={1}>
              <text fg={theme().textMuted || '#888888'}><b>Estado:</b></text>
              <Show when={sidebar().lock!.status === 'running'} fallback={
                <text fg={sidebar().lock!.status === 'corrective_loop' ? (theme().error || '#ff0000') : (theme().success || '#00ff00')}>
                  {sidebar().lock!.status === 'corrective_loop' ? '⟳ CORRECTIVO' : 'IDLE / WAITING'}
                </text>
              }>
                <text fg={theme().warning || '#ffff00'}>RUNNING ⚡</text>
              </Show>
            </box>
            <Show when={sidebar().lock!.iteration > 0}>
              <text fg={theme().warning || '#ffff00'}>
                <b>Iteración correctiva:</b> #{sidebar().lock!.iteration}
              </text>
            </Show>
            <text fg={theme().textMuted || '#888888'}>
              <b>Subagente:</b> @{sidebar().lock!.active_subagent}
            </text>
            <text fg={theme().textMuted || '#888888'}>
              <b>Hito:</b> {getHitoLabel(sidebar().lock!.active_phase)}
            </text>
            <text fg={theme().textMuted || '#888888'}>
              <b>Actualizado:</b> {sidebar().lock!.last_updated}
            </text>
            <box flexDirection="column" gap={0} paddingTop={1} paddingBottom={1}>
              <text fg={theme().text || '#ffffff'}><b>Hito Completo:</b></text>
              <text fg={theme().success || '#00ff00'}>{getProgressBar(sidebar().lock!.active_phase)}</text>
            </box>
          </CollapsibleSection>

          {/* Phase Progress section */}
          <CollapsibleSection
            id="phases"
            title="Phase Progress"
            summary={`F${sidebar().lock!.active_phase} activa`}
            api={props.api}
          >
            <PhaseList lock={sidebar().lock!} theme={theme() as any} />
          </CollapsibleSection>

          {/* Agent Activity section */}
          <CollapsibleSection
            id="agents"
            title="Agent Activity"
            summary={`@${sidebar().lock!.active_subagent}`}
            api={props.api}
          >
            <box flexDirection="column" gap={0}>
              <text fg={theme().text || '#ffffff'}>
                <b>Agente actual:</b> <span style={{ fg: theme().warning || '#ffff00' }}>@{sidebar().lock!.active_subagent}</span>
              </text>
              <box paddingTop={1}>
                <PhaseHistory entries={sidebar().history} theme={theme() as any} />
              </box>
            </box>
          </CollapsibleSection>

          {/* Task Checklist section */}
          <CollapsibleSection
            id="tasks"
            title="Task Checklist"
            summary={`${sidebar().tasks.filter(t => t.completed).length}/${sidebar().tasks.length} tareas`}
            api={props.api}
          >
            <TaskChecklist tasks={sidebar().tasks} theme={theme() as any} />
          </CollapsibleSection>

          <text fg={theme().border || '#444444'} paddingTop={1}>────────────────────────────────────</text>
        </box>
      </Show>
    </box>
  )
}
