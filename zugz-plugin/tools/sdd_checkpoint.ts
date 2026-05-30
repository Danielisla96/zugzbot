import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

interface Checkpoint {
  id: number
  timestamp: string
  phase: number
  active_subagent: string
  change_name: string
  status: string
  iteration: number
  lock_snapshot: any
}

export default tool({
  description: "Guarda checkpoint del estado actual del ciclo SDD antes de transiciones, o restaura desde un checkpoint anterior. Permite repetir o retroceder fases sin perder contexto.",
  args: {
    action: tool.schema.enum(["save", "restore", "list", "clear"]).describe("Accion a realizar: save (guardar checkpoint), restore (restaurar desde checkpoint), list (ver checkpoints guardados), clear (limpiar checkpoints antiguos)"),
    phase: tool.schema.number().optional().describe("Fase desde la cual guardar checkpoint o a la cual restaurar"),
    checkpointId: tool.schema.number().optional().describe("ID especifico del checkpoint a restaurar (para action=restore)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    let lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json")

    if (!fs.existsSync(lockfilePath)) {
      const altLockPath = path.join(projectRoot, "openspec/sdd-lock.json")
      if (fs.existsSync(altLockPath)) {
        lockfilePath = altLockPath
      } else {
        return "[SDD Checkpoint] ERROR: No existe sdd-lock.json. No se puede crear checkpoint."
      }
    }

    let lockfile: any = {}
    try {
      lockfile = JSON.parse(fs.readFileSync(lockfilePath, "utf-8"))
    } catch (e) {
      return "[SDD Checkpoint] ERROR: No se pudo leer el lockfile."
    }

    const checkpointsDir = path.join(projectRoot, ".openspec/checkpoints")
    if (!fs.existsSync(checkpointsDir)) {
      fs.mkdirSync(checkpointsDir, { recursive: true })
    }

    if (args.action === "save") {
      const checkpoint: Checkpoint = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        phase: lockfile.active_phase || 0,
        active_subagent: lockfile.active_subagent || "sdd-planner",
        change_name: lockfile.change_name || "nuevo-cambio",
        status: lockfile.status || "idle",
        iteration: lockfile.iteration || 0,
        lock_snapshot: { ...lockfile }
      }

      const historyPath = path.join(checkpointsDir, "checkpoint_history.jsonl")
      fs.appendFileSync(historyPath, JSON.stringify(checkpoint) + "\n", "utf-8")

      const lockWithCheckpoint = { ...lockfile, last_checkpoint_id: checkpoint.id }
      fs.writeFileSync(lockfilePath, JSON.stringify(lockWithCheckpoint, null, 2), "utf-8")

      return `[SDD Checkpoint] Guardado checkpoint #${checkpoint.id} para fase ${checkpoint.phase} (${checkpoint.active_subagent}). Timestamp: ${checkpoint.timestamp}`
    }

    if (args.action === "list") {
      const historyPath = path.join(checkpointsDir, "checkpoint_history.jsonl")
      if (!fs.existsSync(historyPath)) {
        return "[SDD Checkpoint] No hay checkpoints guardados."
      }

      const lines = fs.readFileSync(historyPath, "utf-8").split("\n").filter(l => l.trim())
      const checkpoints: Checkpoint[] = lines.map(line => {
        try { return JSON.parse(line) } catch { return null }
      }).filter(Boolean)

      if (checkpoints.length === 0) {
        return "[SDD Checkpoint] No hay checkpoints guardados."
      }

      const list = checkpoints.slice(-10).reverse().map((cp: Checkpoint) =>
        `  [${cp.id}] Fase ${cp.phase} (${cp.active_subagent}) - ${cp.change_name} @ ${cp.timestamp}`
      ).join("\n")

      return `[SDD Checkpoint] Ultimos ${checkpoints.length} checkpoints:\n${list}`
    }

    if (args.action === "restore") {
      const historyPath = path.join(checkpointsDir, "checkpoint_history.jsonl")
      if (!fs.existsSync(historyPath)) {
        return "[SDD Checkpoint] ERROR: No hay checkpoints para restaurar."
      }

      const lines = fs.readFileSync(historyPath, "utf-8").split("\n").filter(l => l.trim())
      const checkpoints: Checkpoint[] = lines.map(line => {
        try { return JSON.parse(line) } catch { return null }
      }).filter(Boolean)

      let targetCheckpoint: Checkpoint | null = null

      if (args.checkpointId !== undefined) {
        targetCheckpoint = checkpoints.find(cp => cp.id === args.checkpointId) || null
      } else if (args.phase !== undefined) {
        const candidates = checkpoints.filter(cp => cp.phase === args.phase)
        targetCheckpoint = candidates[candidates.length - 1] || null
      } else {
        targetCheckpoint = checkpoints[checkpoints.length - 1] || null
      }

      if (!targetCheckpoint) {
        return `[SDD Checkpoint] ERROR: No se encontro checkpoint para los parametros dados.`
      }

      const restoredLock = {
        ...targetCheckpoint.lock_snapshot,
        active_phase: args.phase ?? targetCheckpoint.phase,
        status: "restored_from_checkpoint",
        last_restored_from: targetCheckpoint.id
      }

      fs.writeFileSync(lockfilePath, JSON.stringify(restoredLock, null, 2), "utf-8")

      return `[SDD Checkpoint] Restaurado checkpoint #${targetCheckpoint.id} (Fase ${targetCheckpoint.phase}). Estado del lockfile restaurado.`
    }

    if (args.action === "clear") {
      const historyPath = path.join(checkpointsDir, "checkpoint_history.jsonl")
      if (fs.existsSync(historyPath)) {
        const lines = fs.readFileSync(historyPath, "utf-8").split("\n").filter(l => l.trim())
        const checkpoints: Checkpoint[] = lines.map(line => {
          try { return JSON.parse(line) } catch { return null }
        }).filter(Boolean)

        const lastPhase = checkpoints.length > 0 ? checkpoints[checkpoints.length - 1].phase : 0
        const recentCheckpoints = checkpoints.filter(cp => cp.phase >= lastPhase - 1)

        fs.writeFileSync(historyPath, recentCheckpoints.map(cp => JSON.stringify(cp)).join("\n") + "\n", "utf-8")
      }
      return "[SDD Checkpoint] Checkpoints antiguos limpiados. Se conservaron los 2 mas recientes por fase."
    }

    return "[SDD Checkpoint] Accion no reconocida. Use: save, restore, list, o clear."
  }
})