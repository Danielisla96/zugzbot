import { describe, test, expect } from "vitest"
import fs from "fs"
import path from "path"
import os from "os"
import bddTester from "../../.opencode/tools/sdd_bdd_tester.js"
import { SPEC_TEMPLATE_V1 } from "../../.opencode/tools/sdd_spec_template.js"

const TMP = path.join(os.tmpdir(), `zugzbot-bdd-tester-v4-${Date.now()}`)

function setup(name) {
  const projectPath = path.join(TMP, name)
  fs.mkdirSync(projectPath, { recursive: true })
  return { projectPath, context: { worktree: projectPath, directory: projectPath } }
}

function writeLock(projectPath, changeName) {
  fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
  fs.writeFileSync(
    path.join(projectPath, ".openspec/sdd-lock.json"),
    JSON.stringify({ schema_version: 3, change_name: changeName, stack_profile: "node-typescript" })
  )
}

describe("sdd_bdd_tester v4 (BDD en español)", () => {
  test("genera esqueletos de test a partir de un spec v4 con BDD español", async () => {
    const { projectPath, context } = setup("happy-path")
    const changeName = "agregar-validacion"
    writeLock(projectPath, changeName)
    fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify({
      name: "test", version: "0.0.0", dependencies: { vitest: "^1.0.0" }
    }))

    const spec = SPEC_TEMPLATE_V1
      .replace("<kebab-case>", changeName)
      .replace("Escenario: <título descriptivo>", "Escenario: Email válido")
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.mkdirSync(path.dirname(specPath), { recursive: true })
    fs.writeFileSync(specPath, spec)

    const result = await bddTester.execute({ changeName, runTests: false }, context)
    expect(result).toContain("[BDD Tester Complete]")
    const generatedFile = path.join(projectPath, "tests", `sdd_${changeName.replace(/-/g, "_")}.test.js`)
    expect(fs.existsSync(generatedFile)).toBe(true)
    const content = fs.readFileSync(generatedFile, "utf-8")
    expect(content).toContain("Email válido")
    expect(content).toContain("Dado")
  })

  test("rechaza spec sin escenarios BDD (formato v4 con sección 4 vacía)", async () => {
    const { projectPath, context } = setup("no-bdd")
    const changeName = "feature-sin-bdd"
    writeLock(projectPath, changeName)
    fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify({ name: "x" }))

    const spec = SPEC_TEMPLATE_V1
      .replace("<kebab-case>", changeName)
      .replace(/Escenario:[\s\S]*?Y <continuación opcional>/, "")
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.mkdirSync(path.dirname(specPath), { recursive: true })
    fs.writeFileSync(specPath, spec)

    const result = await bddTester.execute({ changeName, runTests: false }, context)
    expect(result).toContain("[BDD Tester Complete]")
    expect(result).toContain("No se encontraron bloques estructurados")
  })
})
