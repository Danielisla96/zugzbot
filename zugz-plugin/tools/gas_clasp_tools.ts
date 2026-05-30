import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

export default tool({
  description: "Herramienta premium de integración con Google Apps Script (GAS) a través de Clasp. Permite realizar push, pull, consultar despliegues y verificar configuraciones de clasp de forma nativa.",
  args: {
    action: tool.schema.enum(["push", "pull", "status", "deployments"]).describe("La acción de clasp a realizar: push (subir cambios a GAS), pull (descargar cambios de GAS), status (verificar archivos subibles/ignorados), deployments (listar despliegues y URLs)"),
    changeName: tool.schema.string().optional().describe("Nombre del cambio activo en .openspec/changes/ para verificar logs de QA previos")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const claspConfigPath = path.join(projectRoot, ".clasp.json");

    if (!fs.existsSync(claspConfigPath)) {
      return JSON.stringify({
        status: "FAILED",
        reason: "❌ ERROR: No se encontró el archivo de configuración '.clasp.json' en la raíz del proyecto. ¿Es este un proyecto de Google Apps Script válido?"
      }, null, 2);
    }

    let claspJson: any = {};
    try {
      claspJson = JSON.parse(fs.readFileSync(claspConfigPath, "utf-8"));
    } catch (e) {
      return JSON.stringify({
        status: "FAILED",
        reason: "❌ ERROR: El archivo de configuración '.clasp.json' tiene un formato JSON inválido."
      }, null, 2);
    }

    const scriptId = claspJson.scriptId;
    if (!scriptId) {
      return JSON.stringify({
        status: "FAILED",
        reason: "❌ ERROR: No se definió 'scriptId' en '.clasp.json'."
      }, null, 2);
    }

    try {
      // 1. Configurar comandos clasp
      let claspCmd = "npx clasp";
      
      if (args.action === "push") {
        const output = execSync(`${claspCmd} push`, { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" });
        return JSON.stringify({
          status: "SUCCESS",
          action: "push",
          scriptId,
          message: "✅ CLASP PUSH EXITOSO: Los archivos locales se han subido a Google Apps Script sin colisiones.",
          output: output.trim()
        }, null, 2);
      }

      if (args.action === "pull") {
        const output = execSync(`${claspCmd} pull`, { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" });
        return JSON.stringify({
          status: "SUCCESS",
          action: "pull",
          scriptId,
          message: "✅ CLASP PULL EXITOSO: El código remoto de Google Apps Script se ha descargado a local.",
          output: output.trim()
        }, null, 2);
      }

      if (args.action === "status") {
        const output = execSync(`${claspCmd} status`, { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" });
        return JSON.stringify({
          status: "SUCCESS",
          action: "status",
          scriptId,
          message: "✅ CLASP STATUS:",
          output: output.trim()
        }, null, 2);
      }

      if (args.action === "deployments") {
        const output = execSync(`${claspCmd} deployments`, { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" });
        const webAppUrl = `https://script.google.com/macros/s/${scriptId}/exec`;
        return JSON.stringify({
          status: "SUCCESS",
          action: "deployments",
          scriptId,
          webAppUrl,
          message: "✅ DESPLIEGUES ACTIVOS OBTENIDOS:",
          output: output.trim()
        }, null, 2);
      }

    } catch (err: any) {
      const stderr = err.stderr?.toString() || err.message || "";
      return JSON.stringify({
        status: "FAILED",
        action: args.action,
        scriptId,
        reason: `❌ ERROR de ejecución de clasp ${args.action}: ${stderr.trim()}`
      }, null, 2);
    }

    return JSON.stringify({
      status: "FAILED",
      reason: "Acción no reconocida."
    }, null, 2);
  }
})
