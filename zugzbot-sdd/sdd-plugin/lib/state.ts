import { createSignal, onCleanup } from 'solid-js'
import type { SddLock, PhaseHistoryEntry, TaskItem, SddSidebarState, SddCompactState } from './types'
import { readLockFile, readPhaseHistory, readTaskChecklist, resolveWorkspaceDir } from './reader'
import { POLL_INTERVAL_MS } from './constants'

interface SddResource {
  sidebar: () => SddSidebarState
  compact: () => SddCompactState
}

export function useSddResource(
  api: { state?: { path?: { worktree?: string; directory?: string } } },
  sessionID: string,
): SddResource {
  const workspaceDir = resolveWorkspaceDir(api)
  const [sidebar, setSidebar] = createSignal<SddSidebarState>({
    status: "loading",
    lock: null,
    history: [],
    tasks: [],
  })
  const [compact, setCompact] = createSignal<SddCompactState>({
    status: "loading",
    text: "",
  })

  let inflight = false
  let version = 0

  async function doRefresh() {
    if (inflight) return
    inflight = true
    const myVersion = ++version

    const lock = await readLockFile(workspaceDir)
    if (myVersion !== version) { inflight = false; return }

    if (!lock) {
      setSidebar({ status: "idle", lock: null, history: [], tasks: [] })
      setCompact({ status: "idle", text: "SDD: Esperando ciclo..." })
      inflight = false
      return
    }

    let history: PhaseHistoryEntry[] = []
    let tasks: TaskItem[] = []

    if (lock.change_name && lock.change_name !== "nuevo-cambio") {
      const [h, t] = await Promise.all([
        readPhaseHistory(workspaceDir, lock.change_name),
        readTaskChecklist(workspaceDir, lock.change_name),
      ])
      if (myVersion !== version) { inflight = false; return }
      history = h
      tasks = t
    }

    setSidebar({ status: "ready", lock, history, tasks })

    const modeText = lock.auto_pilot ? "✈ AUTO" : "⚓ INT"
    const phaseLabel = `F${lock.active_phase}`
    const statusIcon =
      lock.status === "running" ? "⚡"
      : lock.status === "corrective_loop" ? "⟳"
      : "●"
    setCompact({
      status: "ready",
      text: `SDD: ${lock.change_name} • ${phaseLabel} @${lock.active_subagent} • ${statusIcon} ${lock.status}`,
    })

    inflight = false
  }

  void doRefresh()
  const interval = setInterval(doRefresh, POLL_INTERVAL_MS)
  onCleanup(() => clearInterval(interval))

  return { sidebar, compact }
}
