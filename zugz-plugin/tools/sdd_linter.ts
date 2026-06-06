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

function isMissingCommandError(stderr: string, code: number): boolean {
  const lower = stderr.toLowerCase()
  return (
    code === 127 ||
    code === 126 ||
    lower.includes("not found") ||
    lower.includes("no such file") ||
    lower.includes("enoent") ||
    lower.includes("cannot find module") ||
    lower.includes("not recognized as an internal")
  )
}

function tryInstallLinter(linterName: string, cwd: string): boolean {
  try {
    if (["eslint", "biome", "tsc"].includes(linterName)) {
      const pkg = linterName === "tsc" ? "typescript" : (linterName === "biome" ? "@biomejs/biome" : linterName)
      let hasPackageJson = false
      let checkDir = cwd
      for (let i = 0; i < 4; i++) {
        if (fs.existsSync(path.join(checkDir, "package.json"))) {
          hasPackageJson = true
          break
        }
        const parent = path.dirname(checkDir)
        if (parent === checkDir) break
        checkDir = parent
      }
      if (hasPackageJson) {
        execSync(`npm install --save-dev ${pkg}`, { cwd: checkDir, stdio: "inherit" })
      } else {
        execSync(`npm install -g ${pkg}`, { stdio: "inherit" })
      }
      return true
    } else if (["ruff", "flake8", "pylint", "mypy", "black"].includes(linterName)) {
      let pipCmd = "pip"
      try {
        execSync("which pip3", { stdio: "ignore" })
        pipCmd = "pip3"
      } catch {}
      execSync(`${pipCmd} install ${linterName}`, { cwd, stdio: "inherit" })
      return true
    }
  } catch {
    // Silent fail if install fails
  }
  return false
}


function findDetectFile(dir: string, pattern: string, maxDepth = 3): string | null {
  if (maxDepth < 0) return null
  if (!fs.existsSync(dir)) return null
  
  let entries: string[] = []
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return null
  }
  
  const isGlob = pattern.includes("*")
  const prefix = isGlob ? pattern.split("*")[0] : pattern
  const suffix = isGlob ? pattern.split("*")[1] : ""
  
  // Try to find in the current directory first
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    let stat
    try {
      stat = fs.statSync(fullPath)
    } catch {
      continue
    }
    
    if (stat.isFile()) {
      if (isGlob) {
        if (entry.startsWith(prefix) && (suffix === "" || entry.endsWith(suffix))) {
          return dir
        }
      } else {
        if (entry === pattern) {
          return dir
        }
      }
    }
  }
  
  // Try subdirectories
  const excludeDirs = [
    "node_modules", ".git", ".openspec", ".opencode", "dist", "build", ".next", "coverage", "__pycache__", ".pytest_cache",
    "bin", "boot", "dev", "etc", "home", "lib", "lib64", "media", "mnt", "opt", "proc", "root", "run", "sbin", "srv", "sys", "tmp", "usr", "var"
  ]
  for (const entry of entries) {
    if (excludeDirs.includes(entry)) continue
    const fullPath = path.join(dir, entry)
    let stat
    try {
      stat = fs.statSync(fullPath)
    } catch {
      continue
    }
    
    if (stat.isDirectory()) {
      const foundDir = findDetectFile(fullPath, pattern, maxDepth - 1)
      if (foundDir) return foundDir
    }
  }
  
  return null
}

interface DetectedLinter {
  name: string
  cmd: string
  cwd: string
}

function detectActiveLinter(projectRoot: string, profile: StackProfile): DetectedLinter | null {
  for (const linter of profile.linters) {
    if (linter.detect === null) continue
    const detectedDir = findDetectFile(projectRoot, linter.detect)
    if (detectedDir) {
      return { name: linter.name, cmd: linter.cmd, cwd: detectedDir }
    }
  }
  if (profile.linters.length > 0) {
    return { name: profile.linters[0].name, cmd: profile.linters[0].cmd, cwd: projectRoot }
  }
  return null
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
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
    if (projectRoot === "/" || projectRoot.startsWith("/usr") || projectRoot.startsWith("/System") || projectRoot.startsWith("/private")) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No se permite escanear o ejecutar linters en directorios raíz del sistema."
      }, null, 2)
    }
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
      ? (profile.linters.find(l => l.name === args.linter) ? { name: args.linter, cmd: profile.linters.find(l => l.name === args.linter)!.cmd, cwd: projectRoot } : null)
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

    let result = safeExec(cmd, linter.cwd)

    if (!result.ok && isMissingCommandError(result.stderr, result.code)) {
      const installed = tryInstallLinter(linter.name, linter.cwd)
      if (installed) {
        result = safeExec(cmd, linter.cwd)
      }
    }

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
