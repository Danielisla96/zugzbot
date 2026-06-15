import { type Plugin } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export const LoopEnforcerPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  const projectRoot = worktree || directory || process.cwd()
  const stateFilePath = path.resolve(projectRoot, ".openspec/sdd_state.json")

  const isLoopModeActive = () => {
    try {
      if (fs.existsSync(stateFilePath)) {
        const state = JSON.parse(fs.readFileSync(stateFilePath, "utf8"))
        return state.loopMode === true
      }
    } catch (e) {
      // ignore
    }
    return false
  }

  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "question") {
        if (isLoopModeActive()) {
          throw new Error(
            "MECANISMO DE BARRERA ACTIVO: Tienes estrictamente prohibido usar la herramienta 'question' cuando loopMode=true (Modo Autopiloto). Debes tomar las decisiones recomendadas por defecto y transicionar de fase llamando a sdd_set_phase de forma 100% autónoma."
          )
        }
      }
    }
  }
}

export default LoopEnforcerPlugin
