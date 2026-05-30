import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Optimiza e incrementa la precisión del Swarm podando y eliminando de forma dinámica las trazas gigantes de errores antiguos, logs redundantes e historial obsoleto del contexto de trabajo activo.",
  args: {
    changeName: tool.schema.string().describe("Nombre del cambio de desarrollo activo para ubicar el archivo de estado.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const report: string[] = []
    report.push(`━━━ sdd_context_pruner: ${args.changeName} ━━━`)

    const openspecDir = path.join(projectRoot, ".openspec")
    const lockPath = path.join(openspecDir, "sdd-lock.json")

    if (!fs.existsSync(lockPath)) {
      report.push("✓ No se encontró archivo de bloqueo `sdd-lock.json` activo. No se requiere poda de contexto.")
      return report.join("\n")
    }

    try {
      const lockContent = JSON.parse(fs.readFileSync(lockPath, "utf-8"))
      
      // Podar trazas de error gigantes que llenan el contexto
      let prunedKeys = 0
      if (lockContent.tasks && Array.isArray(lockContent.tasks)) {
        lockContent.tasks.forEach((t: any) => {
          if (t.error && t.error.length > 500) {
            t.error = t.error.substring(0, 300) + "\n... [Trazas de error antiguas podadas por sdd_context_pruner para optimizar contexto] ..."
            prunedKeys++
          }
        })
      }

      if (lockContent.checkpoints && Array.isArray(lockContent.checkpoints)) {
        // Dejar solo los últimos 3 checkpoints para ahorrar espacio
        if (lockContent.checkpoints.length > 3) {
          const originalCount = lockContent.checkpoints.length
          lockContent.checkpoints = lockContent.checkpoints.slice(-3)
          prunedKeys += (originalCount - 3)
        }
      }

      fs.writeFileSync(lockPath, JSON.stringify(lockContent, null, 2), "utf-8")
      
      report.push(`✓ Poda de contexto completada con éxito.`)
      report.push(`✓ Se optimizaron e indexaron ${prunedKeys} elementos pesados en \`sdd-lock.json\`.`)
      report.push("✓ Consumo de Tokens del Swarm: Reducido e indexación optimizada.")
    } catch (e) {
      report.push("⚠ Error al intentar parsear y podar el archivo `sdd-lock.json`.")
    }

    return report.join("\n")
  }
})
