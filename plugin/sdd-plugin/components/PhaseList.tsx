/** @jsxImportSource @opentui/solid */
import { For, Show } from 'solid-js'
import { SDD_PHASES } from '../lib/constants'
import { getPhaseIcon } from '../lib/format'
import type { SddLock } from '../lib/types'

interface PhaseListProps {
  lock: SddLock
  theme: { current: Record<string, string> }
}

export function PhaseList(props: PhaseListProps) {
  const t = () => props.theme.current

  return (
    <box flexDirection="column" gap={0}>
      <For each={SDD_PHASES}>
        {(phase) => {
          const isActive = props.lock.active_phase === phase.id
          const isCompleted = props.lock.active_phase > phase.id
          const icon = getPhaseIcon(phase.id, props.lock.active_phase, props.lock.status)

          let fg = t().textMuted || '#888888'
          if (isCompleted) fg = t().success || '#00ff00'
          else if (isActive) fg = t().warning || '#ffff00'

          return (
            <box flexDirection="row" gap={1} paddingBottom={0}>
              <text fg={fg}><b>{icon}</b></text>
              <text fg={isActive ? (t().text || '#ffffff') : (t().textMuted || '#888888')}>
                <Show when={isActive} fallback={phase.name}>
                  <b>{phase.name}</b>
                  <span style={{ fg: t().textMuted || '#888888' }}>
                    {' '}(@{props.lock.active_subagent})
                  </span>
                </Show>
              </text>
            </box>
          )
        }}
      </For>
    </box>
  )
}
