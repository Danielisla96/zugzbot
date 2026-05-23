import h from 'solid-js/h'
import { createSignal, Show, type JSX } from 'solid-js'
import { KV_KEYS } from '../lib/constants'

interface CollapsibleSectionProps {
  id: string
  title: string
  summary?: string
  children: JSX.Element
  api: {
    theme?: { current: Record<string, string> }
    kv?: { get: (key: string, defaultVal?: boolean) => boolean | undefined; set: (key: string, val: boolean) => void }
  }
}

export function CollapsibleSection(props: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = createSignal(
    props.api.kv?.get(KV_KEYS[props.id as keyof typeof KV_KEYS] || `sdd-${props.id}-collapsed`, true) ?? true,
  )

  function toggle() {
    const next = !collapsed()
    setCollapsed(next)
    const kvKey = KV_KEYS[props.id as keyof typeof KV_KEYS]
    if (kvKey) props.api.kv?.set(kvKey, next)
  }

  return h('box', { flexDirection: 'column', gap: 0 }, [
    h('box', { flexDirection: 'row', gap: 1, onMouseDown: toggle }, [
      h('text', { fg: props.api.theme?.current?.text || '#ffffff' },
        h('b', null, (collapsed() ? '▶' : '▼') + ' ' + props.title)
      ),
      h(Show, { when: collapsed() && props.summary }, () =>
        h('text', { fg: props.api.theme?.current?.textMuted || '#888888' }, '— ' + props.summary)
      )
    ]),
    h(Show, { when: !collapsed() }, () =>
      h('box', { flexDirection: 'column', gap: 0, paddingLeft: 1 }, props.children)
    )
  ])
}
