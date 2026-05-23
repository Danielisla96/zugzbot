export interface SddLock {
  change_name: string
  active_phase: number
  active_subagent: string
  status: string
  auto_pilot: boolean
  iteration: number
  last_updated: string
}

export interface PhaseHistoryEntry {
  timestamp: string
  phase: number
  subagent: string
  reason: string
  status: "entered" | "completed" | "corrective"
}

export interface TaskItem {
  text: string
  completed: boolean
  section: string
}

export interface SddPhase {
  id: number
  name: string
  agent: string
}

export type SddPanelStatus = "loading" | "ready" | "idle"

export interface SddSidebarState {
  status: SddPanelStatus
  lock: SddLock | null
  history: PhaseHistoryEntry[]
  tasks: TaskItem[]
}

export interface SddCompactState {
  status: SddPanelStatus
  text: string
}
