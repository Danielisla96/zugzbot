import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

export default tool({
  description: `Integración con Google Apps Script (GAS) vía Clasp. SOLO se carga cuando stack_profile === "gas".
  Acciones:
  - "push": Sube archivos locales a GAS.
  - "pull": Descarga cambios remotos de GAS.
  - "status": Verifica archivos subibles/ignorados.
  - "deployments": Lista despliegues activos y URLs.

  Esta herramienta NO se invoca directamente desde el core; f4-deployer la usa solo si el profile activo es "gas".`,
  args: {
    action: tool.schema.enum(["push", "pull", "status", "deployments"])
      .describe("Acción de clasp a realizar"),
    changeName: tool.schema.string().optional()
      .describe("Nombre del cambio activo en .openspec/changes/ (referencia, no afecta ejecución)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const claspConfigPath = path.join(projectRoot, ".clasp.json")

    if (!fs.existsSync(claspConfigPath)) {
      return JSON.stringify({
        status: "FAILED",
        reason: "❌ No se encontró '.clasp.json' en la raíz. ¿Es este un proyecto GAS válido?"
      }, null, 2)
    }

    let claspJson: any = {}
    try {
      claspJson = JSON.parse(fs.readFileSync(claspConfigPath, "utf-8"))
    } catch {
      return JSON.stringify({
        status: "FAILED",
        reason: "❌ '.clasp.json' tiene formato JSON inválido."
      }, null, 2)
    }

    const scriptId = claspJson.scriptId
    if (!scriptId) {
      return JSON.stringify({
        status: "FAILED",
        reason: "❌ No se definió 'scriptId' en '.clasp.json'."
      }, null, 2)
    }

    try {
      const claspCmd = "npx clasp"

      if (args.action === "push") {
        const output = execSync(`${claspCmd} push`, { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" })
        return JSON.stringify({
          status: "SUCCESS",
          action: "push",
          scriptId,
          message: "✅ CLASP PUSH exitoso.",
          output: output.trim()
        }, null, 2)
      }

      if (args.action === "pull") {
        const output = execSync(`${claspCmd} pull`, { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" })
        return JSON.stringify({
          status: "SUCCESS",
          action: "pull",
          scriptId,
          message: "✅ CLASP PULL exitoso.",
          output: output.trim()
        }, null, 2)
      }

      if (args.action === "status") {
        const output = execSync(`${claspCmd} status`, { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" })
        return JSON.stringify({
          status: "SUCCESS",
          action: "status",
          scriptId,
          message: "✅ CLASP STATUS:",
          output: output.trim()
        }, null, 2)
      }

      if (args.action === "deployments") {
        const output = execSync(`${claspCmd} deployments`, { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" })
        const webAppUrl = `https://script.google.com/macros/s/${scriptId}/exec`
        return JSON.stringify({
          status: "SUCCESS",
          action: "deployments",
          scriptId,
          webAppUrl,
          message: "✅ DESPLIEGUES ACTIVOS:",
          output: output.trim()
        }, null, 2)
      }

    } catch (err: any) {
      const stderr = err.stderr?.toString() || err.message || ""
      return JSON.stringify({
        status: "FAILED",
        action: args.action,
        scriptId,
        reason: `❌ Error de clasp ${args.action}: ${stderr.trim()}`
      }, null, 2)
    }

    return JSON.stringify({
      status: "FAILED",
      reason: "Acción no reconocida."
    }, null, 2)
  }
})
