import type { SddPhase } from './types'

export const SDD_PHASES: SddPhase[] = [
  { id: 0, name: "F0: Diagnóstico de Entorno", agent: "sdd-architect" },
  { id: 1, name: "F1: Propuesta y Especificación", agent: "sdd-architect" },
  { id: 2, name: "F2: Arquitectura y Planificación", agent: "sdd-architect" },
  { id: 3, name: "F3: Implementación de Código", agent: "sdd-implementer" },
  { id: 4, name: "F4: Percepción y Diseño Visual", agent: "sdd-implementer" },
  { id: 5, name: "F5: Entorno y Pruebas Manuales", agent: "sdd-launcher" },
  { id: 6, name: "F6: Calidad y Pruebas QA", agent: "sdd-release-manager" },
  { id: 7, name: "F7: Documentación Canónica", agent: "sdd-release-manager" },
  { id: 8, name: "F8: Archivación y Cierre", agent: "sdd-release-manager" },
]

export const SLOT_ORDER_SIDEBAR = 10
export const SLOT_ORDER_SESSION_PROMPT = 50
export const SLOT_ORDER_HOME_BOTTOM = 100

export const POLL_INTERVAL_MS = 2000

export const MOUNT_RECOVERY_DELAYS = [500, 1500, 4000]

export const KV_KEYS = {
  overviewCollapsed: "sdd-overview-collapsed",
  phasesCollapsed: "sdd-phases-collapsed",
  agentsCollapsed: "sdd-agents-collapsed",
  tasksCollapsed: "sdd-tasks-collapsed",
} as const

export const PLUGIN_VERSION = "v2.0"
