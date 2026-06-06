import { tool } from "@opencode-ai/plugin"
import { execSync, exec } from "child_process"
import fs from "fs"
import path from "path"
import { readLockfile } from "./sdd_lock_manager.js"
import { getProfileById, loadAllProfiles, StackProfile } from "./sdd_stack_detector_lib.js"

function safeExec(cmd: string, cwd: string, timeoutMs = 120000): { ok: true; stdout: string; code: number } | { ok: false; stderr: string; code: number } {
  try {
    const stdout = execSync(cmd, { cwd, encoding: "utf-8", stdio: "pipe", timeout: timeoutMs })
    return { ok: true, stdout: stdout.trim(), code: 0 }
  } catch (err: any) {
    return { ok: false, stderr: err.stderr?.toString() || err.message || "", code: err.status || 1 }
  }
}

function safeExecAsync(cmd: string, cwd: string, timeoutMs = 180000): Promise<{ ok: true; stdout: string; code: number } | { ok: false; stderr: string; code: number }> {
  return new Promise((resolve) => {
    exec(cmd, { cwd, timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          ok: false,
          stderr: stderr.toString() || error.message || "",
          code: error.code || 1
        })
      } else {
        resolve({
          ok: true,
          stdout: stdout.toString().trim(),
          code: 0
        })
      }
    })
  })
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

function tryInstallTestRunner(runnerName: string, cwd: string): boolean {
  try {
    if (["vitest", "jest", "mocha"].includes(runnerName)) {
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
        execSync(`npm install --save-dev ${runnerName}`, { cwd: checkDir, stdio: "inherit" })
      } else {
        execSync(`npm install -g ${runnerName}`, { stdio: "inherit" })
      }
      return true
    } else if (["pytest", "tox"].includes(runnerName)) {
      let pipCmd = "pip"
      try {
        execSync("which pip3", { stdio: "ignore" })
        pipCmd = "pip3"
      } catch {}
      execSync(`${pipCmd} install ${runnerName}`, { cwd, stdio: "inherit" })
      return true
    }
  } catch {
    // Silent fail if install fails
  }
  return false
}


interface DetectedTestRunner {
  name: string
  cmd: string
  detect: string | null
  cwd: string
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

function fileExistsIn(projectRoot: string, rel: string, deep: boolean): boolean {
  const fullPath = path.join(projectRoot, rel)
  if (fs.existsSync(fullPath)) {
    if (!deep) return true
    try {
      return fs.statSync(fullPath).isFile()
    } catch {
      return false
    }
  }
  return false
}

function globExists(projectRoot: string, pattern: string): boolean {
  const fullPath = path.join(projectRoot, pattern)
  if (fs.existsSync(fullPath)) return true
  if (pattern.includes("*")) {
    try {
      const segs = pattern.split("/")
      let dir = projectRoot
      for (let i = 0; i < segs.length - 1; i++) {
        dir = path.join(dir, segs[i])
      }
      if (!fs.existsSync(dir)) return false
      const lastSeg = segs[segs.length - 1]
      const isGlob = lastSeg.includes("*")
      if (!isGlob) return false
      const prefix = lastSeg.split("*")[0]
      const entries = fs.readdirSync(dir)
      return entries.some(e => e.startsWith(prefix))
    } catch {
      return false
    }
  }
  return false
}

function matchProfileSubdirs(projectRoot: string, profile: StackProfile): boolean {
  for (const f of profile.detect.files_any) {
    if (fileExistsIn(projectRoot, f, false)) return true
  }
  for (const pattern of profile.detect.files_any_deep) {
    if (globExists(projectRoot, pattern)) return true
  }
  
  try {
    const entries = fs.readdirSync(projectRoot)
    const excludeDirs = ["node_modules", ".git", ".openspec", ".opencode", "dist", "build", ".next", "coverage"]
    for (const entry of entries) {
      if (excludeDirs.includes(entry)) continue
      const fullPath = path.join(projectRoot, entry)
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        for (const f of profile.detect.files_any) {
          if (fileExistsIn(fullPath, f, false)) return true
        }
        for (const pattern of profile.detect.files_any_deep) {
          if (globExists(fullPath, pattern)) return true
        }
      }
    }
  } catch {}
  
  return false
}

function detectActiveTestRunner(projectRoot: string, profile: StackProfile): DetectedTestRunner | null {
  // First pass: try to detect specific test runners
  for (const runner of profile.test_runners) {
    if (runner.detect !== null) {
      const detectedDir = findDetectFile(projectRoot, runner.detect)
      if (detectedDir) {
        return { ...runner, cwd: detectedDir }
      }
    }
  }
  // Second pass: fallback to any runner without detection criteria (detect === null)
  for (const runner of profile.test_runners) {
    if (runner.detect === null) {
      return { ...runner, cwd: projectRoot }
    }
  }
  if (profile.test_runners.length > 0) {
    return { ...profile.test_runners[0], cwd: projectRoot }
  }
  return null
}

export default tool({
  description: `Test runner agnóstico al stack. Ejecuta la suite de tests del proyecto usando el comando apropiado del stack_profile activo y otros stacks detectados.
  
  Acciones:
  - "run": Ejecuta los tests y reporta resultados (passes, failures, total).
  - "detect": Detecta qué test runner usará el profile activo.
  - "verify-red": Verifica que los tests fallen (usado en F2-RED).
  - "verify-green": Verifica que los tests pasen (usado en F2-GREEN).
  - "verify-all-passing": Verifica que TODOS los tests pasen (usado al cerrar F2-REFACTOR).

  Esta herramienta usa la convención del profile activo (vitest, jest, pytest, go test, cargo test, mvn test, etc.) sin hardcodear.`,
  args: {
    action: tool.schema.enum(["run", "detect", "verify-red", "verify-green", "verify-all-passing"])
      .describe("Acción a ejecutar"),
    specificPath: tool.schema.string().optional()
      .describe("Path específico a testear (ej: tests/unit/auth.test.ts). Si se omite, corre toda la suite."),
    testRunner: tool.schema.string().optional()
      .describe("Forzar un test runner específico (ej: 'vitest'). Si no, autodetecta.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
    const lock = readLockfile(projectRoot)
    const profileId = lock.stack_profile || "unknown"
    const profile = getProfileById(projectRoot, profileId) || loadAllProfiles(projectRoot).find(() => true)

    if (args.action === "detect") {
      if (!profile) {
        return JSON.stringify({
          status: "FAILED",
          reason: `No se pudo cargar el profile '${profileId}'.`
        }, null, 2)
      }
      const runner = detectActiveTestRunner(projectRoot, profile)
      return JSON.stringify({
        status: "SUCCESS",
        active_profile: profileId,
        test_runner: runner
      }, null, 2)
    }

    if (!profile) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No hay profile activo. Ejecuta F0-explorer primero para detectar el stack."
      }, null, 2)
    }

    const runnersToRun: DetectedTestRunner[] = []
    
    // Agregar el runner principal
    const mainRunner = args.testRunner
      ? profile.test_runners.find(r => r.name === args.testRunner) ? { ...profile.test_runners.find(r => r.name === args.testRunner)!, cwd: projectRoot } : null
      : detectActiveTestRunner(projectRoot, profile)
    
    if (mainRunner) {
      runnersToRun.push(mainRunner)
    }

    // Si no se fuerza un runner específico, detectar dinámicamente otros runners en proyectos políglotas
    if (!args.testRunner) {
      const allProfiles = loadAllProfiles(projectRoot)
      for (const p of allProfiles) {
        if (p.id === profileId) continue
        if (matchProfileSubdirs(projectRoot, p)) {
          const otherRunner = detectActiveTestRunner(projectRoot, p)
          if (otherRunner && otherRunner.detect !== null) {
            const detectedDir = findDetectFile(projectRoot, otherRunner.detect)
            if (detectedDir) {
              if (!runnersToRun.some(r => r.name === otherRunner.name && r.cwd === otherRunner.cwd)) {
                runnersToRun.push(otherRunner)
              }
            }
          }
        }
      }
    }

    if (runnersToRun.length === 0) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No hay test runner configurado ni detectado en el profile."
      }, null, 2)
    }

    const promises = runnersToRun.map(async (runner) => {
      let cmd = runner.cmd
      if (args.specificPath) {
        cmd = `${runner.cmd} ${args.specificPath}`
      }
      let result = await safeExecAsync(cmd, runner.cwd, 180000)
      if (!result.ok && isMissingCommandError(result.stderr, result.code)) {
        const installed = tryInstallTestRunner(runner.name, runner.cwd)
        if (installed) {
          result = await safeExecAsync(cmd, runner.cwd, 180000)
        }
      }
      const passed = result.ok && result.code === 0
      return {
        runner: runner.name,
        cmd,
        cwd: runner.cwd,
        passed,
        exit_code: result.code,
        output: result.ok ? result.stdout : result.stderr
      }
    })

    const results = await Promise.all(promises)
    const allPassed = results.every(r => r.passed)

    if (args.action === "verify-red") {
      // Para RED, se espera que los tests fallen (allPassed sea falso)
      return JSON.stringify({
        status: allPassed ? "FAILED" : "SUCCESS",
        check: "verify-red",
        message: allPassed
          ? "⚠️ Los tests PASAN cuando deberían FALLAR. Bug: spec mal definido o test ya implementado."
          : "✅ Tests fallan correctamente (estado RED confirmado).",
        results
      }, null, 2)
    }

    if (args.action === "verify-green" || args.action === "verify-all-passing") {
      return JSON.stringify({
        status: allPassed ? "SUCCESS" : "FAILED",
        check: args.action,
        message: allPassed
          ? "✅ Todos los tests pasan."
          : "❌ Hay tests fallando. Revisa el output.",
        results
      }, null, 2)
    }

    return JSON.stringify({
      status: allPassed ? "SUCCESS" : "FAILED",
      results
    }, null, 2)
  }
})
