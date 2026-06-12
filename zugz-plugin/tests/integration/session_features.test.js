import { describe, test, expect, afterAll } from "vitest"
import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"
import sessionFeatures from "../../.opencode/tools/_core/sdd_session_features.js"
import {
  readSessionFeatures,
  writeSessionFeatures,
  readLockfile,
  SCHEMA_VERSION
} from "../../.opencode/tools/_core/sdd_lock_manager.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SANDBOX = path.join(os.tmpdir(), `zugzbot-sf-${Date.now()}`)
const created = []

function makeProject() {
  const projectPath = path.join(SANDBOX, `p-${created.length}-${Math.random().toString(36).slice(2, 6)}`)
  fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
  created.push(projectPath)
  return projectPath
}

function writeRawLock(projectPath, raw) {
  const lockfilePath = path.join(projectPath, ".openspec/sdd-lock.json")
  fs.writeFileSync(lockfilePath, JSON.stringify(raw, null, 2), "utf-8")
}

function ctx(projectPath) {
  return { worktree: projectPath, directory: projectPath, sessionID: "test" }
}

afterAll(() => {
  try { fs.rmSync(SANDBOX, { recursive: true, force: true }) } catch (_e) { /* ignore */ }
})

describe("sdd_session_features (tool, schema v6)", () => {
  test("read sin lockfile retorna defaults {false, false}", async () => {
    const projectPath = makeProject()
    const result = await sessionFeatures.execute({ action: "read" }, ctx(projectPath))
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("SUCCESS")
    expect(parsed.session_features).toEqual({ autoskills: false, graphify: false })
  })

  test("read en lockfile v5 migrado a v6 con session_features defaults", async () => {
    const projectPath = makeProject()
    writeRawLock(projectPath, { schema_version: 5, change_name: "feat-x", stack_profile: "python" })
    const result = await sessionFeatures.execute({ action: "read" }, ctx(projectPath))
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("SUCCESS")
    expect(parsed.session_features).toEqual({ autoskills: false, graphify: false })
    const lock = readLockfile(projectPath)
    expect(lock.schema_version).toBe(SCHEMA_VERSION)
    expect(lock.session_features).toEqual({ autoskills: false, graphify: false })
  })

  test("write parcial: solo autoskills=true no pisa graphify existente", async () => {
    const projectPath = makeProject()
    await sessionFeatures.execute({ action: "write", patch: JSON.stringify({ autoskills: true, graphify: true }) }, ctx(projectPath))
    await sessionFeatures.execute({ action: "write", patch: JSON.stringify({ autoskills: true }) }, ctx(projectPath))
    const result = await sessionFeatures.execute({ action: "read" }, ctx(projectPath))
    const parsed = JSON.parse(result)
    expect(parsed.session_features).toEqual({ autoskills: true, graphify: true })
  })

  test("enable(feature) activa un único flag sin afectar al otro", async () => {
    const projectPath = makeProject()
    await sessionFeatures.execute({ action: "enable", feature: "graphify" }, ctx(projectPath))
    const r1 = JSON.parse(await sessionFeatures.execute({ action: "read" }, ctx(projectPath)))
    expect(r1.session_features).toEqual({ autoskills: false, graphify: true })
  })

  test("disable(feature) desactiva un único flag", async () => {
    const projectPath = makeProject()
    await sessionFeatures.execute({ action: "write", patch: JSON.stringify({ autoskills: true, graphify: true }) }, ctx(projectPath))
    await sessionFeatures.execute({ action: "disable", feature: "autoskills" }, ctx(projectPath))
    const r1 = JSON.parse(await sessionFeatures.execute({ action: "read" }, ctx(projectPath)))
    expect(r1.session_features).toEqual({ autoskills: false, graphify: true })
  })

  test("enable con feature inválida retorna FAILED", async () => {
    const projectPath = makeProject()
    const result = await sessionFeatures.execute({ action: "enable", feature: "nope" }, ctx(projectPath))
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
  })

  test("write con patch inválido retorna FAILED", async () => {
    const projectPath = makeProject()
    const result = await sessionFeatures.execute({ action: "write", patch: "no es json" }, ctx(projectPath))
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
  })

  test("write con patch vacío omite el campo (sin cambios)", async () => {
    const projectPath = makeProject()
    await sessionFeatures.execute({ action: "enable", feature: "autoskills" }, ctx(projectPath))
    await sessionFeatures.execute({ action: "write", patch: "{}" }, ctx(projectPath))
    const r1 = JSON.parse(await sessionFeatures.execute({ action: "read" }, ctx(projectPath)))
    expect(r1.session_features).toEqual({ autoskills: true, graphify: false })
  })

  test("write preserva otros campos del lockfile (merge, no clobber)", async () => {
    const projectPath = makeProject()
    writeRawLock(projectPath, {
      schema_version: 6,
      change_name: "feat-merge",
      stack_profile: "node-typescript",
      modo_qa: "manual",
      subproject_cwd: "packages/web"
    })
    await sessionFeatures.execute({ action: "enable", feature: "graphify" }, ctx(projectPath))
    const lock = readLockfile(projectPath)
    expect(lock.change_name).toBe("feat-merge")
    expect(lock.stack_profile).toBe("node-typescript")
    expect(lock.modo_qa).toBe("manual")
    expect(lock.subproject_cwd).toBe("packages/web")
    expect(lock.session_features).toEqual({ autoskills: false, graphify: true })
  })

  test("readSessionFeatures/writeSessionFeatures helpers (funciones exportadas)", () => {
    const projectPath = makeProject()
    expect(readSessionFeatures(projectPath)).toEqual({ autoskills: false, graphify: false })
    const next1 = writeSessionFeatures(projectPath, { autoskills: true })
    expect(next1).toEqual({ autoskills: true, graphify: false })
    const next2 = writeSessionFeatures(projectPath, { graphify: true })
    expect(next2).toEqual({ autoskills: true, graphify: true })
    expect(readSessionFeatures(projectPath)).toEqual({ autoskills: true, graphify: true })
  })

  test("SCHEMA_VERSION runtime es 8", () => {
    expect(SCHEMA_VERSION).toBe(8)
  })
})
