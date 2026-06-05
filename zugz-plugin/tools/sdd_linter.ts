import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { readLockfile } from "./sdd_lock_manager.js"
import { getProfileById, loadAllProfiles, StackProfile } from "./sdd_stack_detector_lib.js"

function safeExec(cmd: string, cwd: string, timeoutMs = 60000): { ok: true; stdout: string; code: number } | { ok: false; stderr: string; code: number } {
  try {
    const stdout = execSync(cmd, { cwd, encoding: "utf-8", stdio: "pipe", timeout: timeoutMs })
    return { ok: true, stdout: stdout.trim(), code: 0 }
  } catch (err: any) {
    return { ok: false, stderr: err.stderr?.toString() || err.message || "", code: err.status || 1 }
  }
}

function detectActiveLinter(projectRoot: string, profile: StackProfile): { name: string; cmd: string } | null {
  for (const linter of profile.linters) {
    if (linter.detect === null) continue
    if (fs.existsSync(path.join(projectRoot, linter.detect))) {
      return linter
    }
  }
  return profile.linters[0] || null
}

export default tool({
  description: `Linter agnóstico al stack. Ejecuta el linter configurado en el stack_profile activo.
  
  Acciones:
  - "check": Corre el linter y reporta errores/warnings.
  - "fix": Aplica autofix cuando el linter lo soporta (eslint --fix, biome --write, ruff --fix).
  - "detect": Muestra qué linter se usará según el profile activo.

  Linters soportados: eslint, biome, tsc, ruff, flake8, mypy, go vet, clippy, golangci-lint, etc.`,
  args: {
    action: tool.schema.enum(["check", "fix", "detect"])
      .describe("Acción a ejecutar"),
    specificPath: tool.schema.string().optional()
      .describe("Path específico a lintear (archivo o directorio)"),
    linter: tool.schema.string().optional()
      .describe("Forzar un linter específico (ej: 'eslint').")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const lock = readLockfile(projectRoot)
    const profileId = lock.stack_profile || "unknown"
    const profile = getProfileById(projectRoot, profileId) || loadAllProfiles(projectRoot).find(() => true)

    if (!profile) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No hay profile activo. Ejecuta F0-explorer primero."
      }, null, 2)
    }

    if (args.action === "detect") {
      const linter = detectActiveLinter(projectRoot, profile)
      return JSON.stringify({
        status: "SUCCESS",
        active_profile: profileId,
        linter
      }, null, 2)
    }

    const linter = args.linter
      ? profile.linters.find(l => l.name === args.linter)
      : detectActiveLinter(projectRoot, profile)

    if (!linter) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No hay linter configurado en el profile."
      }, null, 2)
    }

    let cmd = linter.cmd
    if (args.specificPath) {
      cmd = `${linter.cmd} ${args.specificPath}`
    } else if (args.action === "fix") {
      if (linter.name === "eslint") cmd = `npx eslint --fix ${args.specificPath || "."}`
      else if (linter.name === "biome") cmd = `npx biome check --write ${args.specificPath || "."}`
      else if (linter.name === "ruff") cmd = `ruff check --fix ${args.specificPath || "."}`
      else if (linter.name === "black") cmd = `black ${args.specificPath || "."}`
      else if (linter.name === "gofmt") cmd = `gofmt -w ${args.specificPath || "."}`
      else if (linter.name === "rustfmt") cmd = `cargo fmt ${args.specificPath || ""}`
    }

    const result = safeExec(cmd, projectRoot)

    return JSON.stringify({
      status: result.ok ? "SUCCESS" : "FAILED",
      linter: linter.name,
      action: args.action,
      command: cmd,
      exit_code: result.code,
      errors_found: !result.ok,
      output: result.ok ? result.stdout : result.stderr
    }, null, 2)
  }
})
