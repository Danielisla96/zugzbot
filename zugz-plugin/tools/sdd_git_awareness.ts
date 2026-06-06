import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

function safeExec(cmd: string, cwd: string): { ok: true; stdout: string } | { ok: false; stderr: string } {
  try {
    const stdout = execSync(cmd, { cwd, encoding: "utf-8", stdio: "pipe" }).trim()
    return { ok: true, stdout }
  } catch (err: any) {
    return { ok: false, stderr: err.stderr?.toString() || err.message || "" }
  }
}

function isGitRepo(projectRoot: string): boolean {
  return fs.existsSync(path.join(projectRoot, ".git"))
}

export default tool({
  description: `Awareness de Git para el swarm. Proporciona información del estado del repo sin ejecutar mutaciones.
  
  Acciones:
  - "status": Rama activa, SHA base, si el working tree está limpio, y archivos modificados.
  - "branch": Solo la rama activa.
  - "diff": Diff de archivos modificados vs HEAD (resumido).
  - "stash": Crea un stash temporal con un mensaje (requiere confirm=true).
  - "pop_stash": Recupera el último stash (requiere confirm=true).

  Esta herramienta NO hace commit ni push. Para commit, usar sdd_archive_and_commit.`,
  args: {
    action: tool.schema.enum(["status", "branch", "diff", "stash", "pop_stash", "checkout_branch"])
      .describe("Acción a ejecutar"),
    message: tool.schema.string().optional()
      .describe("Mensaje del stash (para action=stash)"),
    confirm: tool.schema.boolean().optional().default(false)
      .describe("Confirmación explícita para acciones mutables (stash, pop_stash, checkout_branch)"),
    branchName: tool.schema.string().optional()
      .describe("Nombre de la rama a crear o cambiar (para action=checkout_branch)")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }

    if (!isGitRepo(projectRoot)) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No es un repositorio Git (no existe .git/)."
      }, null, 2)
    }

    if (args.action === "branch") {
      const result = safeExec("git rev-parse --abbrev-ref HEAD", projectRoot)
      if (!result.ok) {
        return JSON.stringify({
          status: "FAILED",
          reason: result.stderr
        }, null, 2)
      }
      return JSON.stringify({
        status: "SUCCESS",
        branch: result.stdout
      }, null, 2)
    }

    if (args.action === "status") {
      const branch = safeExec("git rev-parse --abbrev-ref HEAD", projectRoot)
      const baseSha = safeExec("git rev-parse HEAD", projectRoot)
      const porcelain = safeExec("git status --porcelain", projectRoot)
      const clean = porcelain.ok ? porcelain.stdout === "" : true
      const files = porcelain.ok && porcelain.stdout
        ? porcelain.stdout.split("\n").filter(Boolean)
        : []
      return JSON.stringify({
        status: "SUCCESS",
        branch: branch.ok ? branch.stdout : "unknown",
        base_sha: baseSha.ok ? baseSha.stdout : "unknown",
        working_tree_clean: clean,
        modified_files: files
      }, null, 2)
    }

    if (args.action === "diff") {
      const diff = safeExec("git diff --stat HEAD", projectRoot)
      if (!diff.ok) {
        return JSON.stringify({
          status: "FAILED",
          reason: diff.stderr
        }, null, 2)
      }
      return JSON.stringify({
        status: "SUCCESS",
        diff_stat: diff.stdout || "(sin cambios)"
      }, null, 2)
    }

    if (args.action === "stash") {
      if (!args.confirm) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Se requiere confirm=true para crear un stash."
        }, null, 2)
      }
      if (!args.message) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Falta 'message' para el stash."
        }, null, 2)
      }
      const msg = args.message.replace(/"/g, '\\"')
      const result = safeExec(`git stash push -m "${msg}"`, projectRoot)
      if (!result.ok) {
        return JSON.stringify({
          status: "FAILED",
          reason: result.stderr
        }, null, 2)
      }
      return JSON.stringify({
        status: "SUCCESS",
        message: "Stash creado.",
        output: result.stdout
      }, null, 2)
    }

    if (args.action === "pop_stash") {
      if (!args.confirm) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Se requiere confirm=true para recuperar el stash."
        }, null, 2)
      }
      const result = safeExec("git stash pop", projectRoot)
      if (!result.ok) {
        return JSON.stringify({
          status: "FAILED",
          reason: result.stderr
        }, null, 2)
      }
      return JSON.stringify({
        status: "SUCCESS",
        message: "Stash recuperado.",
        output: result.stdout
      }, null, 2)
    }
    if (args.action === "checkout_branch") {
      if (!args.confirm) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Se requiere confirm=true para cambiar de rama."
        }, null, 2)
      }
      if (!args.branchName) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Falta 'branchName' para cambiar de rama."
        }, null, 2)
      }
      
      // Intentar cambiar de rama, si falla (no existe localmente), crearla con checkout -b
      let result = safeExec(`git checkout ${args.branchName}`, projectRoot)
      if (!result.ok) {
        result = safeExec(`git checkout -b ${args.branchName}`, projectRoot)
      }
      
      if (!result.ok) {
        return JSON.stringify({
          status: "FAILED",
          reason: `No se pudo cambiar ni crear la rama: ${result.stderr}`
        }, null, 2)
      }
      
      return JSON.stringify({
        status: "SUCCESS",
        message: `Rama establecida en ${args.branchName}.`,
        output: result.stdout
      }, null, 2)
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `Acción '${args.action}' no reconocida.`
    }, null, 2)
  }
})
