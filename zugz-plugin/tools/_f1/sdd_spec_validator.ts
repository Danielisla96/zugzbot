import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import {
  SECTIONS,
  validateSpec,
  parseFrontmatter
} from "../_lib/sdd_spec_template.js"

export default tool({
  description: "Audita y valida el plano técnico (spec.md v4) del cambio de desarrollo activo para asegurar que cumpla con los estándares de calidad y secciones mandatorias de la metodología SDD. Validación estricta contra el template v4 unificado en español.",
  args: {
    changeName: tool.schema.string().optional().describe("Nombre del cambio en kebab-case. Por defecto se autodetectará del sdd-lock.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
    let changeName = args.changeName
    let complexity = "high"

    const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json")
    const altLockPath = path.join(projectRoot, "openspec/sdd-lock.json")
    const activeLockPath = fs.existsSync(lockfilePath) ? lockfilePath : (fs.existsSync(altLockPath) ? altLockPath : null)
    if (activeLockPath) {
      try {
        const lockObj = JSON.parse(fs.readFileSync(activeLockPath, "utf-8"))
        if (!changeName && lockObj.change_name && lockObj.change_name !== "nuevo-cambio") {
          changeName = lockObj.change_name
        }
        if (lockObj.complexity) {
          complexity = lockObj.complexity
        }
      } catch (e) {}
    }

    const changeDir = path.join(projectRoot, ".openspec/changes", changeName || "nuevo-cambio")
    let specPath = path.join(changeDir, "specs/spec.md")
    if (!fs.existsSync(specPath)) {
      specPath = path.join(changeDir, "spec.md")
    }

    if (!fs.existsSync(specPath)) {
      return JSON.stringify({
        status: "FAILED",
        reason: `No se encuentra el archivo de especificación spec.md para el cambio '${changeName || "nuevo-cambio"}'. Ruta esperada: .openspec/changes/${changeName || "nuevo-cambio"}/[specs/]spec.md`
      }, null, 2)
    }

    const specContent = fs.readFileSync(specPath, "utf-8")

    const strictResult = validateSpec(specContent)
    if (strictResult.ok) {
      return JSON.stringify({
        status: "APPROVED",
        changeName,
        complexity,
        message: `✅ VALIDACIÓN EXITOSA [Complejidad: ${complexity}]: El plano técnico 'specs/spec.md' para '${changeName}' cumple al 100% con el contrato del template v4 (unificado, en español). Está listo para ser implementado en la Fase 2.`
      }, null, 2)
    }

    const missingSections = strictResult.errors
      .filter((e) => e.rule === "R2" || e.rule === "R10")
      .map((e) => e.message)
    const otherErrors = strictResult.errors.filter((e) => e.rule !== "R2" && e.rule !== "R10")

    return JSON.stringify({
      status: "FAILED",
      changeName,
      complexity,
      reason: "El archivo spec.md no cumple con el formato mandatorio v4.",
      missingSections,
      rules_violated: strictResult.errors.map((e) => e.rule),
      errors: strictResult.errors,
      message: `❌ VALIDACIÓN FALLIDA [Complejidad: ${complexity}]: El spec.md viola ${strictResult.errors.length} reglas inmutables del template v4.\n\nReglas violadas:\n${strictResult.errors.map((e) => `  - [${e.rule}] ${e.message}`).join("\n")}\n\nPor favor, pide a @sdd-planner que ajuste el spec al formato v4 (usa sdd_spec_reviewer action=init para regenerar la plantilla).`
    }, null, 2)
  }
})
