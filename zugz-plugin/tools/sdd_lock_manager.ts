import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export const SCHEMA_VERSION = 2

export interface SddLockfile {
  schema_version: number
  change_name: string
  workflow: "full-sdd-tdd" | "quick-fix" | "audit" | "refactor" | "explain" | "oracle"
  stack_profile: string
  active_phase: string
  active_subagent: string
  status: "idle" | "in_progress" | "blocked" | "awaiting_hil" | "corrective_loop" | "spec_approved" | "qa_validated" | "archived"
  auto_pilot: boolean
  iteration: number
  last_updated: string
  orchestrator_mode: string
  direction: "forward" | "backward" | "repeat"
  last_successful_phase: string
  retry_count: number
  corrective_loop_active: boolean
  fresh_task: boolean
  tasks: Array<{ id: number; desc: string; status: "pending" | "completed" | "blocked" }>
  tdd: {
    red: { completed: boolean; tests_added: number; all_failing: boolean }
    green: { completed: boolean; tests_passing: number }
    refactor: { completed: boolean; linter_clean: boolean }
  }
  git: {
    branch: string
    base_sha: string
    working_tree_clean: boolean
  }
  checkpoints: Array<{ id: string; phase: string; timestamp: string; reason: string }>
  last_checkpoint_id: string | null
  last_restored_from: string | null
  complexity: "low" | "medium" | "high"
}

export const DEFAULT_LOCKFILE: SddLockfile = {
  schema_version: SCHEMA_VERSION,
  change_name: "",
  workflow: "full-sdd-tdd",
  stack_profile: "unknown",
  active_phase: "F0",
  active_subagent: "f0-explorer",
  status: "idle",
  auto_pilot: false,
  iteration: 0,
  last_updated: "",
  orchestrator_mode: "router",
  direction: "forward",
  last_successful_phase: "F0",
  retry_count: 0,
  corrective_loop_active: false,
  fresh_task: true,
  tasks: [],
  tdd: {
    red: { completed: false, tests_added: 0, all_failing: false },
    green: { completed: false, tests_passing: 0 },
    refactor: { completed: false, linter_clean: false }
  },
  git: {
    branch: "",
    base_sha: "",
    working_tree_clean: true
  },
  checkpoints: [],
  last_checkpoint_id: null,
  last_restored_from: null,
  complexity: "medium"
}

export function resolveLockfilePath(projectRoot: string): string {
  const v2Path = path.join(projectRoot, ".openspec/sdd-lock.json")
  return v2Path
}

export function readLockfile(projectRoot: string): SddLockfile {
  const lockfilePath = resolveLockfilePath(projectRoot)
  if (!fs.existsSync(lockfilePath)) {
    return { ...DEFAULT_LOCKFILE }
  }
  try {
    const raw = JSON.parse(fs.readFileSync(lockfilePath, "utf-8"))
    return migrateToV2(raw)
  } catch {
    return { ...DEFAULT_LOCKFILE }
  }
}

export function writeLockfile(projectRoot: string, lock: SddLockfile): void {
  const lockfilePath = resolveLockfilePath(projectRoot)
  const dir = path.dirname(lockfilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  lock.last_updated = new Date().toISOString()
  lock.schema_version = SCHEMA_VERSION
  fs.writeFileSync(lockfilePath, JSON.stringify(lock, null, 2), "utf-8")
}

export function migrateToV2(raw: any): SddLockfile {
  if (raw.schema_version === SCHEMA_VERSION) {
    return { ...DEFAULT_LOCKFILE, ...raw }
  }
  return { ...DEFAULT_LOCKFILE }
}

export function isValidChangeName(name: string): boolean {
  if (!name) return false
  if (name === "nuevo-cambio" || name === "nuevo_cambio") return false
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) return false
  return true
}

export default tool({
  description: `Gestor centralizado del lockfile SDD v2 (SddLockfile).
  Encapsula TODA la I/O del archivo .openspec/sdd-lock.json y proporciona operaciones SRP:
  - "read": Lee el lockfile actual.
  - "write": Escribe un lockfile completo (usar con cuidado, preferir "update").
  - "update": Aplica un patch parcial a un campo del lockfile.
  - "validate": Valida la integridad del lockfile (incluyendo change_name y schema_version).
  - "set_tdd": Actualiza el bloque tdd (red/green/refactor) de forma atómica.
  - "set_git": Actualiza el bloque git (branch, base_sha, working_tree_clean).
  - "add_task": Agrega una tarea a tasks[].
  - "mark_task": Marca una tarea como completed/blocked.
  - "reset": Resetea el lockfile al estado inicial (usar con aprobación del Orquestador).

  Esta herramienta es la ÚNICA autorizada a leer/escribir .openspec/sdd-lock.json. Los subagentes NO deben usar write/edit directamente sobre el lockfile.`,
  args: {
    action: tool.schema.enum([
      "read",
      "write",
      "update",
      "validate",
      "set_tdd",
      "set_git",
      "add_task",
      "mark_task",
      "reset"
    ]).describe("Operación a realizar sobre el lockfile"),
    patch: tool.schema.string().optional()
      .describe("JSON string con el patch a aplicar (para update, set_tdd, set_git)"),
    taskDesc: tool.schema.string().optional()
      .describe("Descripción de la tarea (para add_task)"),
    taskId: tool.schema.number().optional()
      .describe("ID de la tarea (para mark_task)"),
    taskStatus: tool.schema.enum(["pending", "completed", "blocked"]).optional()
      .describe("Nuevo estado de la tarea (para mark_task)"),
    fullLockfile: tool.schema.string().optional()
      .describe("JSON string del lockfile completo (para write)"),
    confirm: tool.schema.boolean().optional().default(false)
      .describe("Confirmación explícita requerida para acciones destructivas (reset, write)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory

    switch (args.action) {
      case "read": {
        const lock = readLockfile(projectRoot)
        return JSON.stringify({
          status: "SUCCESS",
          lockfile: lock
        }, null, 2)
      }

      case "write": {
        if (!args.confirm) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Se requiere confirm=true para sobrescribir el lockfile completo. Preferir 'update' o 'set_*'."
          }, null, 2)
        }
        if (!args.fullLockfile) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Falta 'fullLockfile' (JSON string con el lockfile completo)."
          }, null, 2)
        }
        try {
          const parsed = JSON.parse(args.fullLockfile) as SddLockfile
          parsed.schema_version = SCHEMA_VERSION
          writeLockfile(projectRoot, parsed)
          return JSON.stringify({
            status: "SUCCESS",
            message: "Lockfile sobrescrito."
          }, null, 2)
        } catch (e: any) {
          return JSON.stringify({
            status: "FAILED",
            reason: `JSON inválido: ${e.message}`
          }, null, 2)
        }
      }

      case "update": {
        if (!args.patch) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Falta 'patch' (JSON string con los campos a actualizar)."
          }, null, 2)
        }
        try {
          const lock = readLockfile(projectRoot)
          const patch = JSON.parse(args.patch)
          Object.assign(lock, patch)
          writeLockfile(projectRoot, lock)
          return JSON.stringify({
            status: "SUCCESS",
            updated_fields: Object.keys(patch),
            lockfile: lock
          }, null, 2)
        } catch (e: any) {
          return JSON.stringify({
            status: "FAILED",
            reason: `Error aplicando patch: ${e.message}`
          }, null, 2)
        }
      }

      case "validate": {
        const lock = readLockfile(projectRoot)
        const issues: string[] = []
        if (lock.schema_version !== SCHEMA_VERSION) {
          issues.push(`schema_version esperado ${SCHEMA_VERSION}, encontrado ${lock.schema_version}`)
        }
        if (lock.active_phase !== "F0" && !isValidChangeName(lock.change_name)) {
          issues.push(`change_name inválido o genérico: "${lock.change_name}"`)
        }
        if (issues.length === 0) {
          return JSON.stringify({
            status: "SUCCESS",
            valid: true,
            message: "Lockfile válido."
          }, null, 2)
        }
        return JSON.stringify({
          status: "FAILED",
          valid: false,
          issues
        }, null, 2)
      }

      case "set_tdd": {
        if (!args.patch) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Falta 'patch' con { red?, green?, refactor? }"
          }, null, 2)
        }
        try {
          const lock = readLockfile(projectRoot)
          const tddPatch = JSON.parse(args.patch)
          if (tddPatch.red) Object.assign(lock.tdd.red, tddPatch.red)
          if (tddPatch.green) Object.assign(lock.tdd.green, tddPatch.green)
          if (tddPatch.refactor) Object.assign(lock.tdd.refactor, tddPatch.refactor)
          writeLockfile(projectRoot, lock)
          return JSON.stringify({
            status: "SUCCESS",
            tdd: lock.tdd
          }, null, 2)
        } catch (e: any) {
          return JSON.stringify({
            status: "FAILED",
            reason: `Error: ${e.message}`
          }, null, 2)
        }
      }

      case "set_git": {
        if (!args.patch) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Falta 'patch' con { branch?, base_sha?, working_tree_clean? }"
          }, null, 2)
        }
        try {
          const lock = readLockfile(projectRoot)
          const gitPatch = JSON.parse(args.patch)
          Object.assign(lock.git, gitPatch)
          writeLockfile(projectRoot, lock)
          return JSON.stringify({
            status: "SUCCESS",
            git: lock.git
          }, null, 2)
        } catch (e: any) {
          return JSON.stringify({
            status: "FAILED",
            reason: `Error: ${e.message}`
          }, null, 2)
        }
      }

      case "add_task": {
        if (!args.taskDesc) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Falta 'taskDesc'."
          }, null, 2)
        }
        const lock = readLockfile(projectRoot)
        const newId = lock.tasks.length > 0
          ? Math.max(...lock.tasks.map(t => t.id)) + 1
          : 1
        lock.tasks.push({
          id: newId,
          desc: args.taskDesc,
          status: "pending"
        })
        writeLockfile(projectRoot, lock)
        return JSON.stringify({
          status: "SUCCESS",
          task: lock.tasks[lock.tasks.length - 1]
        }, null, 2)
      }

      case "mark_task": {
        if (args.taskId === undefined || !args.taskStatus) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Falta 'taskId' o 'taskStatus'."
          }, null, 2)
        }
        const lock = readLockfile(projectRoot)
        const task = lock.tasks.find(t => t.id === args.taskId)
        if (!task) {
          return JSON.stringify({
            status: "FAILED",
            reason: `No existe tarea con id ${args.taskId}`
          }, null, 2)
        }
        task.status = args.taskStatus
        writeLockfile(projectRoot, lock)
        return JSON.stringify({
          status: "SUCCESS",
          task
        }, null, 2)
      }

      case "reset": {
        if (!args.confirm) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Se requiere confirm=true para resetear el lockfile."
          }, null, 2)
        }
        writeLockfile(projectRoot, { ...DEFAULT_LOCKFILE })
        return JSON.stringify({
          status: "SUCCESS",
          message: "Lockfile reseteado al estado inicial."
        }, null, 2)
      }

      default:
        return JSON.stringify({
          status: "FAILED",
          reason: `Acción '${args.action}' no reconocida.`
        }, null, 2)
    }
  }
})
