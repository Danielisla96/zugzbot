import { tool } from "@opencode-ai/plugin"
import {
  DEFAULT_SESSION_FEATURES,
  readSessionFeatures,
  writeSessionFeatures
} from "./sdd_lock_manager.js"

type FeatureKey = "autoskills" | "graphify"
const ALLOWED_FEATURES: FeatureKey[] = ["autoskills", "graphify"]

function isFeatureKey(value: string): value is FeatureKey {
  return (ALLOWED_FEATURES as string[]).includes(value)
}

export default tool({
  description: `Administra los feature flags de sesión persistidos en el lockfile.

  Permite a @zugzbot consultar y modificar qué features opcionales están activas
  en la sesión actual (autoskills, graphify). Los subagentes consultan este estado
  en lugar de invocar directamente los tools, para respetar la decisión del usuario.

  Acciones:
  - "read": Retorna el estado actual de session_features.
  - "write": Sobrescribe (parcialmente) session_features con un patch { autoskills?, graphify? }.
  - "enable": Activa una feature específica.
  - "disable": Desactiva una feature específica.`,
  args: {
    action: tool.schema.enum(["read", "write", "enable", "disable"])
      .describe("Operación a realizar"),
    feature: tool.schema.string().optional()
      .describe("Nombre de la feature: 'autoskills' o 'graphify' (requerido para enable/disable)"),
    patch: tool.schema.string().optional()
      .describe("JSON string con el patch { autoskills?: bool, graphify?: bool } (usado en write)")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }

    if (args.action === "read") {
      const features = readSessionFeatures(projectRoot)
      return JSON.stringify({
        status: "SUCCESS",
        session_features: features,
        defaults: { ...DEFAULT_SESSION_FEATURES }
      }, null, 2)
    }

    if (args.action === "write") {
      if (!args.patch) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Falta 'patch' (JSON string con { autoskills?, graphify? })."
        }, null, 2)
      }
      try {
        const parsed = JSON.parse(args.patch) as Record<string, unknown>
        const sanitized: { autoskills?: boolean; graphify?: boolean } = {}
        if (typeof parsed.autoskills === "boolean") sanitized.autoskills = parsed.autoskills
        if (typeof parsed.graphify === "boolean") sanitized.graphify = parsed.graphify
        const next = writeSessionFeatures(projectRoot, sanitized)
        return JSON.stringify({
          status: "SUCCESS",
          session_features: next
        }, null, 2)
      } catch (e: any) {
        return JSON.stringify({
          status: "FAILED",
          reason: `JSON inválido: ${e.message}`
        }, null, 2)
      }
    }

    if (args.action === "enable" || args.action === "disable") {
      if (!args.feature || !isFeatureKey(args.feature)) {
        return JSON.stringify({
          status: "FAILED",
          reason: `Falta 'feature' o valor inválido. Permitidos: ${ALLOWED_FEATURES.join(", ")}`
        }, null, 2)
      }
      const next = writeSessionFeatures(projectRoot, { [args.feature]: args.action === "enable" } as any)
      return JSON.stringify({
        status: "SUCCESS",
        session_features: next
      }, null, 2)
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `Acción '${args.action}' no reconocida.`
    }, null, 2)
  }
})
