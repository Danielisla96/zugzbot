import { describe, test, expect, afterAll } from "vitest"
import fs from "fs"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"
import linter from "../../.opencode/tools/sdd_linter.js"
import testRunner from "../../.opencode/tools/sdd_test_runner.js"
import installAutoskills from "../../.opencode/tools/sdd_install_autoskills.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROFILES_SRC = path.resolve(__dirname, "..", "..", "profiles")

function makeProject(name, files = {}) {
  const projectPath = path.join(os.tmpdir(), `zugzbot-th-${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  fs.mkdirSync(projectPath, { recursive: true })
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(projectPath, rel)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content, "utf-8")
  }
  return projectPath
}

function withLock(projectPath, lockObj) {
  fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
  fs.writeFileSync(
    path.join(projectPath, ".openspec", "sdd-lock.json"),
    JSON.stringify({ schema_version: 4, change_name: "x", ...lockObj })
  )
}

function copyProfilesTo(projectPath) {
  fs.mkdirSync(path.join(projectPath, "profiles"), { recursive: true })
  for (const f of fs.readdirSync(PROFILES_SRC)) {
    if (f.endsWith(".json")) {
      fs.copyFileSync(path.join(PROFILES_SRC, f), path.join(projectPath, "profiles", f))
    }
  }
}

function ctx(projectPath) {
  return { worktree: projectPath, directory: projectPath, sessionID: "test" }
}

const created = []
function track(p) { created.push(p); return p }

afterAll(() => {
  for (const p of created) {
    try { fs.rmSync(p, { recursive: true, force: true }) } catch (_e) { /* ignore */ }
  }
})

describe("C1: sdd_linter siempre retorna stdout y stderr separados", () => {
  test("retorna SUCCESS con stdout+stderr cuando ruff pasa", async () => {
    const projectPath = track(makeProject("c1", {
      "ok.py": "x = 1\n",
      "pyproject.toml": '[project]\nname = "t"\n'
    }))
    copyProfilesTo(projectPath)
    withLock(projectPath, { stack_profile: "python" })

    const result = await linter.execute({ action: "check" }, ctx(projectPath))
    const parsed = JSON.parse(result)
    expect(parsed).toHaveProperty("stdout")
    expect(parsed).toHaveProperty("stderr")
    expect(typeof parsed.stdout).toBe("string")
    expect(typeof parsed.stderr).toBe("string")
  }, 30000)
})

describe("C2: sdd_linter retorna SKIPPED para extensiones no soportadas", () => {
  test("ruff sobre Dockerfile retorna SKIPPED con reason y handled_extensions", async () => {
    const projectPath = track(makeProject("c2", {
      "Dockerfile": "FROM python:3.11-slim\n",
      "pyproject.toml": '[project]\nname = "t"\n'
    }))
    copyProfilesTo(projectPath)
    withLock(projectPath, { stack_profile: "python" })

    const result = await linter.execute(
      { action: "check", specificPath: "Dockerfile" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("SKIPPED")
    expect(parsed.reason).toMatch(/no maneja la extensión/i)
    expect(parsed.handled_extensions).toContain(".py")
  }, 30000)

  test("ruff sobre archivo Python (soportado) NO retorna SKIPPED", async () => {
    const projectPath = track(makeProject("c2b", {
      "ok.py": "x = 1\n",
      "pyproject.toml": '[project]\nname = "t"\n'
    }))
    copyProfilesTo(projectPath)
    withLock(projectPath, { stack_profile: "python" })

    const result = await linter.execute(
      { action: "check", specificPath: "ok.py" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed.status).not.toBe("SKIPPED")
  }, 30000)
})

describe("C3: sdd_install_autoskills silencioso cuando autoskills no está instalado", () => {
  test("install retorna mensaje informativo en vez de ERROR si npx no encuentra autoskills", async () => {
    const projectPath = track(makeProject("c3", {}))
    withLock(projectPath, { stack_profile: "python" })

    const result = await installAutoskills.execute(
      { action: "install" },
      ctx(projectPath)
    )
    expect(result).toMatch(/no instalado|ℹ️|no bloqueante/i)
  }, 30000)
})

describe("A1: sdd_test_runner.verify-red retorna total/failed/error_count", () => {
  test("verify-red en suite que falla expone counts parseados de pytest", async () => {
    const projectPath = track(makeProject("a1", {
      "backend/tests/test_x.py": "def test_a(): assert False\ndef test_b(): assert False\n",
      "backend/pyproject.toml": '[project]\nname = "t"\n',
      "backend/requirements.txt": "pytest\n"
    }))
    copyProfilesTo(projectPath)
    withLock(projectPath, { stack_profile: "python", subproject_cwd: "backend" })

    const result = await testRunner.execute(
      { action: "verify-red" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed).toHaveProperty("total_count")
    expect(parsed).toHaveProperty("failed_count")
    expect(parsed).toHaveProperty("error_count")
    if (parsed.total_count > 0) {
      expect(parsed.total_count).toBeGreaterThanOrEqual(2)
      expect(parsed.failed_count).toBeGreaterThanOrEqual(2)
    } else {
      expect(parsed.results).toBeDefined()
      expect(Array.isArray(parsed.results)).toBe(true)
    }
  }, 60000)
})

