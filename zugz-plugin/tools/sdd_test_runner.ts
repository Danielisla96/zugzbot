import { tool } from "@opencode-ai/plugin"
import { execSync, exec } from "child_process"
import fs from "fs"
import path from "path"
import { readLockfile } from "./sdd_lock_manager.js"
import { getProfileById, loadAllProfiles, StackProfile, fileExistsIn, globExists } from "./sdd_stack_detector_lib.js"

const STACK_PROFILE_ALIASES: Record<string, string> = {
  "python-fastapi": "python",
  "python-django": "python",
  "python-flask": "python",
  "node-react": "node-typescript",
  "node-next": "node-typescript",
  "node-express": "node-javascript"
}

function resolveStackProfile(profileId: string): { resolved: string; wasAlias: boolean } {
  if (STACK_PROFILE_ALIASES[profileId]) {
    return { resolved: STACK_PROFILE_ALIASES[profileId], wasAlias: true }
  }
  return { resolved: profileId, wasAlias: false }
}

function bestMatchAtRoot(targetRoot: string, profiles: StackProfile[]): { id: string; score: number } {
  const allMatches: Array<{ id: string; score: number }> = []
  for (const p of profiles) {
    let score = 0
    for (const f of p.detect.files_any) {
      if (fileExistsIn(targetRoot, f, false)) score++
    }
    for (const pattern of p.detect.files_any_deep) {
      if (globExists(targetRoot, pattern)) score++
    }
    if (score > 0) {
      allMatches.push({ id: p.id, score })
    }
  }
  if (allMatches.length === 0) return { id: "unknown", score: 0 }
  allMatches.sort((a, b) => b.score - a.score)
  return allMatches[0]
}

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

function parseTestCounts(runnerName: string, output: string): { total: number; failed: number; errors: number } {
  if (!output) return { total: 0, failed: 0, errors: 0 }
  let total = 0
  let failed = 0
  let errors = 0

  if (runnerName === "pytest" || runnerName === "tox") {
    const summary = output.match(/=+\s*(?:.+?)?\s*(\d+)\s*(?:failed|passed|error)/i)
    const collected = output.match(/collected\s+(\d+)\s+item/i)
    if (collected) total = parseInt(collected[1], 10)
    const failedMatch = output.match(/(\d+)\s+failed/i)
    const passedMatch = output.match(/(\d+)\s+passed/i)
    const errorMatch = output.match(/(\d+)\s+error/i)
    if (failedMatch) failed = parseInt(failedMatch[1], 10)
    if (errorMatch) errors = parseInt(errorMatch[1], 10)
    if (!total && (passedMatch || failedMatch || errorMatch)) {
      total = (passedMatch ? parseInt(passedMatch[1], 10) : 0) + failed + errors
    }
    return { total, failed, errors }
  }

  if (runnerName === "jest" || runnerName === "vitest" || runnerName === "mocha") {
    const testsMatch = output.match(/Tests:\s+(\d+)\s+passed.*?(?:(\d+)\s+failed)?/i)
    const testsTotal = output.match(/Tests:\s+(?:(\d+)\s+passed,?\s*)?(?:(\d+)\s+failed,?\s*)?(?:(\d+)\s+total)?/i)
    if (testsTotal) {
      const passed = testsTotal[1] ? parseInt(testsTotal[1], 10) : 0
      const f = testsTotal[2] ? parseInt(testsTotal[2], 10) : 0
      const t = testsTotal[3] ? parseInt(testsTotal[3], 10) : 0
      if (t) total = t
      else if (passed || f) total = passed + f
      failed = f
    }
    return { total, failed, errors }
  }

  return { total, failed, errors }
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
  // First pass: try to detect specific test runners via their detect file
  for (const runner of profile.test_runners) {
    if (runner.detect !== null) {
      const detectedDir = findDetectFile(projectRoot, runner.detect)
      if (detectedDir) {
        return { ...runner, cwd: detectedDir }
      }
    }
  }
  // Second pass: si el profile tiene manifests requeridos, fallback a runner sin detect
  if (hasProfileManifest(projectRoot, profile)) {
    for (const runner of profile.test_runners) {
      if (runner.detect === null) {
        return { ...runner, cwd: projectRoot }
      }
    }
  }
  // No hay manifests del profile en el proyecto → retornar null para que el caller
  // reporte un error claro en lugar de ejecutar un runner genérico (mvn test fantasma).
  return null
}

function hasProfileManifest(projectRoot: string, profile: StackProfile): boolean {
  // Buscar cualquiera de los archivos de detección del profile
  for (const f of profile.detect.files_any) {
    if (fs.existsSync(path.join(projectRoot, f))) return true
  }
  for (const pattern of profile.detect.files_any_deep) {
    const segs = pattern.split("/")
    const lastSeg = segs[segs.length - 1]
    if (!lastSeg.includes("*")) {
      if (fs.existsSync(path.join(projectRoot, pattern))) return true
    }
  }
  // Heurística adicional: si el profile es Python y existe al menos un archivo .py
  // bajo un directorio tests/ o test/, considerarlo un proyecto Python válido
  // (puede no tener pyproject.toml pero sí tests).
  if (profile.id === "python") {
    const testDirs = ["tests", "test"]
    for (const td of testDirs) {
      const fullPath = path.join(projectRoot, td)
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        try {
          const entries = fs.readdirSync(fullPath)
          if (entries.some(e => e.endsWith(".py"))) return true
        } catch {}
      }
    }
  }
  return false
}

export default tool({
  description: `Test runner agnóstico al stack. Ejecuta la suite de tests del proyecto usando el comando apropiado del stack_profile activo y otros stacks detectados.
  
  Acciones:
  - "run": Ejecuta los tests y reporta resultados (passes, failures, total).
  - "detect": Detecta qué test runner usará el profile activo (resuelve aliases como python-fastapi → python).
  - "verify-red": Verifica que los tests fallen (usado en F2-RED). Falla con razón clara si no hay runner.
  - "verify-green": Verifica que los tests pasen (usado en F2-GREEN).
  - "verify-all-passing": Verifica que TODOS los tests pasen (usado al cerrar F2-REFACTOR).

  Esta herramienta usa la convención del profile activo (vitest, jest, pytest, go test, cargo test, mvn test, etc.) sin hardcodear.
  Si el lockfile tiene subproject_cwd, los tests se ejecutan en esa subcarpeta.`,
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
    const subprojectCwd = lock.subproject_cwd || ""
    const effectiveCwd = subprojectCwd
      ? path.join(projectRoot, subprojectCwd)
      : projectRoot
    const profileId = lock.stack_profile || "unknown"
    const { resolved: resolvedProfileId, wasAlias } = resolveStackProfile(profileId)
    let profile = getProfileById(projectRoot, resolvedProfileId)
    if (!profile && resolvedProfileId.includes("-")) {
      const baseProfileId = resolvedProfileId.split("-")[0]
      profile = getProfileById(projectRoot, baseProfileId)
    }

    if (args.action === "detect") {
      // Si el lockfile no tiene stack_profile (o es "unknown"), auto-detectar
      let actualProfile = profile
      let actualProfileId = resolvedProfileId
      let actualWasAlias = wasAlias
      let detectedFrom: string | undefined

      if (!actualProfile || actualProfileId === "unknown") {
        const allProfiles = loadAllProfiles(projectRoot)
        const rootBest = bestMatchAtRoot(effectiveCwd, allProfiles)
        if (rootBest.id !== "unknown") {
          actualProfile = getProfileById(projectRoot, rootBest.id) || actualProfile
          actualProfileId = rootBest.id
          actualWasAlias = false
          detectedFrom = "auto"
        }
      }

      if (!actualProfile) {
        return JSON.stringify({
          status: "FAILED",
          reason: `No se pudo cargar el profile '${profileId}' (resolved: '${actualProfileId}'). Si es un alias (e.g., python-fastapi), verifica que esté en STACK_PROFILE_ALIASES.`
        }, null, 2)
      }
      const runner = detectActiveTestRunner(effectiveCwd, actualProfile)
      return JSON.stringify({
        status: "SUCCESS",
        active_profile: actualProfileId,
        resolved_from: actualWasAlias ? profileId : actualProfileId,
        detected_from: detectedFrom,
        test_runner: runner
      }, null, 2)
    }

    if (!profile) {
      return JSON.stringify({
        status: "FAILED",
        reason: `No hay profile activo. Lockfile stack_profile='${profileId}' (resolved: '${resolvedProfileId}'). Ejecuta F0-explorer primero.`
      }, null, 2)
    }

    const runnersToRun: DetectedTestRunner[] = []

    // Agregar el runner principal
    const mainRunner = args.testRunner
      ? profile.test_runners.find(r => r.name === args.testRunner) ? { ...profile.test_runners.find(r => r.name === args.testRunner)!, cwd: effectiveCwd } : null
      : detectActiveTestRunner(effectiveCwd, profile)

    if (mainRunner) {
      runnersToRun.push(mainRunner)
    }

    // Si no se fuerza un runner específico, detectar dinámicamente otros runners en proyectos políglotas
    if (!args.testRunner) {
      const allProfiles = loadAllProfiles(projectRoot)
      for (const p of allProfiles) {
        if (p.id === resolvedProfileId) continue
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
      // Mejor error: explica por qué no se detectó runner y qué hacer
      const firstRunner = profile.test_runners[0]
      const detectHints = firstRunner?.detect
        ? ` (busca '${firstRunner.detect}' en el proyecto)`
        : ""
      return JSON.stringify({
        status: "FAILED",
        reason: `No se detectó ningún test runner para el profile '${resolvedProfileId}'${detectHints}. Verifica que existan archivos como pytest.ini, pyproject.toml, package.json, go.mod, Cargo.toml, etc. en '${subprojectCwd || "."}'.`
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
      const outputText = result.ok ? result.stdout : result.stderr
      const counts = parseTestCounts(runner.name, outputText)
      return {
        runner: runner.name,
        cmd,
        cwd: runner.cwd,
        passed,
        exit_code: result.code,
        output: outputText,
        total_count: counts.total,
        failed_count: counts.failed,
        error_count: counts.errors
      }
    })

    const results = await Promise.all(promises)
    const allPassed = results.every(r => r.passed)

    if (args.action === "verify-red") {
      // Para RED, se espera que los tests fallen (allPassed sea falso)
      const totalTests = results.reduce((s, r: any) => s + (r.total_count || 0), 0)
      const failedTests = results.reduce((s, r: any) => s + (r.failed_count || 0), 0)
      const errorTests = results.reduce((s, r: any) => s + (r.error_count || 0), 0)
      return JSON.stringify({
        status: allPassed ? "FAILED" : "SUCCESS",
        check: "verify-red",
        reason: allPassed
          ? "Los tests PASAN cuando deberían FALLAR. Bug: spec mal definido o test ya implementado."
          : undefined,
        message: allPassed
          ? "⚠️ Los tests PASAN cuando deberían FALLAR. Bug: spec mal definido o test ya implementado."
          : "✅ Tests fallan correctamente (estado RED confirmado).",
        total_count: totalTests,
        failed_count: failedTests,
        error_count: errorTests,
        results,
        cwd: subprojectCwd
      }, null, 2)
    }

    if (args.action === "verify-green" || args.action === "verify-all-passing") {
      return JSON.stringify({
        status: allPassed ? "SUCCESS" : "FAILED",
        check: args.action,
        reason: allPassed ? undefined : "Hay tests fallando. Revisa el output.",
        message: allPassed
          ? "✅ Todos los tests pasan."
          : "❌ Hay tests fallando. Revisa el output.",
        results,
        cwd: subprojectCwd
      }, null, 2)
    }

    return JSON.stringify({
      status: allPassed ? "SUCCESS" : "FAILED",
      results,
      cwd: subprojectCwd
    }, null, 2)
  }
})
