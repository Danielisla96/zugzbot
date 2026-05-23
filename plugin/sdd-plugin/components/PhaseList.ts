import h from 'solid-js/h'
import { For, Show } from 'solid-js'
import { SDD_PHASES } from '../lib/constants'
import { getPhaseIcon } from '../lib/format'
import type { SddLock, SddPhase } from '../lib/types'

interface PhaseListProps {
  lock: SddLock
  theme: { current: Record<string, string> }
}

export function PhaseList(props: PhaseListProps) {
  const t = () => props.theme.current

  return h('box', { flexDirection: 'column', gap: 0 },
    h(For, { each: SDD_PHASES }, (phase: SddPhase) => {
      const isActive = props.lock.active_phase === phase.id
      const isCompleted = props.lock.active_phase > phase.id
      const icon = getPhaseIcon(phase.id, props.lock.active_phase, props.lock.status)

      let fg = t().textMuted || '#888888'
      if (isCompleted) fg = t().success || '#00ff00'
      else if (isActive) fg = t().warning || '#ffff00'

      return h('box', { flexDirection: 'row', gap: 1, paddingBottom: 0 }, [
        h('text', { fg: fg }, h('b', null, icon)),
        h('text', { fg: isActive ? (t().text || '#ffffff') : (t().textMuted || '#888888') },
          h(Show, {
            when: isActive,
            fallback: phase.name
          }, () => [
            h('b', null, phase.name),
            h('span', { style: { fg: t().textMuted || '#888888' } },
              ' (@' + props.lock.active_subagent + ')'
            )
          ])
        )
      ])
    })
  )
}
