import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"
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

function detectActiveTestRunner(projectRoot: string, profile: StackProfile): { name: string; cmd: string } | null {
  for (const runner of profile.test_runners) {
    if (runner.detect === null) {
      return runner
    }
    if (fs.existsSync(path.join(projectRoot, runner.detect))) {
      return runner
    }
  }
  return profile.test_runners[0] || null
}

export default tool({
  description: `Test runner agnóstico al stack. Ejecuta la suite de tests del proyecto usando el comando apropiado del stack_profile activo.
  
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
    const projectRoot = context.worktree || context.directory
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

    const runner = args.testRunner
      ? profile.test_runners.find(r => r.name === args.testRunner)
      : detectActiveTestRunner(projectRoot, profile)

    if (!runner) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No hay test runner configurado en el profile."
      }, null, 2)
    }

    let cmd = runner.cmd
    if (args.specificPath) {
      cmd = `${runner.cmd} ${args.specificPath}`
    }

    const result = safeExec(cmd, projectRoot, 180000)

    if (args.action === "verify-red") {
      const passed = result.ok && result.code === 0
      return JSON.stringify({
        status: passed ? "FAILED" : "SUCCESS",
        check: "verify-red",
        message: passed
          ? "⚠️ Los tests PASAN cuando deberían FALLAR. Bug: spec mal definido o test ya implementado."
          : "✅ Tests fallan correctamente (estado RED confirmado).",
        test_runner: runner.name,
        command: cmd,
        exit_code: result.code,
        output: result.ok ? result.stdout : result.stderr
      }, null, 2)
    }

    if (args.action === "verify-green" || args.action === "verify-all-passing") {
      const passed = result.ok && result.code === 0
      return JSON.stringify({
        status: passed ? "SUCCESS" : "FAILED",
        check: args.action,
        message: passed
          ? "✅ Todos los tests pasan."
          : "❌ Hay tests fallando. Revisa el output.",
        test_runner: runner.name,
        command: cmd,
        exit_code: result.code,
        output: result.ok ? result.stdout : result.stderr
      }, null, 2)
    }

    return JSON.stringify({
      status: result.ok ? "SUCCESS" : "FAILED",
      test_runner: runner.name,
      command: cmd,
      exit_code: result.code,
      output: result.ok ? result.stdout : result.stderr
    }, null, 2)
  }
})
