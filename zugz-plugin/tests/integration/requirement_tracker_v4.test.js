import { describe, test, expect } from "vitest"
import fs from "fs"
import path from "path"
import os from "os"
import requirementTracker from "../../.opencode/tools/sdd_requirement_tracker.js"
import { SPEC_TEMPLATE_V1 } from "../../.opencode/tools/sdd_spec_template.js"

const TMP = path.join(os.tmpdir(), `zugzbot-requirement-v4-${Date.now()}`)

function setup(name) {
  const projectPath = path.join(TMP, name)
  fs.mkdirSync(projectPath, { recursive: true })
  fs.mkdirSync(path.join(projectPath, "tests"), { recursive: true })
  return { projectPath, context: { worktree: projectPath, directory: projectPath } }
}

function writeLock(projectPath, changeName, extras = {}) {
  fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
  fs.writeFileSync(
    path.join(projectPath, ".openspec/sdd-lock.json"),
    JSON.stringify({ schema_version: 3, change_name: changeName, stack_profile: "node-typescript", ...extras })
  )
}

function writeSpec(projectPath, changeName, criterios, opts = {}) {
  const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
  fs.mkdirSync(path.dirname(specPath), { recursive: true })
  let spec = SPEC_TEMPLATE_V1
    .replace("<kebab-case>", changeName)
    .replace("[Arquitectura y diseño técnico de la solución]",
             "Función pura validate(input): boolean que retorna true si el input es válido según las reglas de negocio. La implementación usa regex RFC 5322 simplificado.")
  let criteriosYaml = ""
  let criteriosList = ""
  criterios.forEach((c, i) => {
    criteriosYaml += `  - id: "${c.id}"\n    descripcion: "${c.desc}"\n`
    criteriosList += `- [ ] **${c.id}**: ${c.desc}\n`
  })
  spec = spec.replace(/- id: "CA1"\n {4}descripcion: "Descripción testeable del criterio"\n {2}- id: "CA2"\n {4}descripcion: "Otra condición verificable"\n/, criteriosYaml) // eslint-disable-line no-regex-spaces
  spec = spec.replace(/- \[ {1}\] \*\*CA1\*\*: Descripción testeable del criterio\n- \[ {1}\] \*\*CA2\*\*: Otra condición verificable\n/, criteriosList)

  if (opts.modo_qa) {
    spec = spec.replace('modo_qa: "automatizado"', `modo_qa: "${opts.modo_qa}"`)
  }
  if (opts.manualMarc) {
    const manualCrit = criterios.find((c) => c.manual)
    if (manualCrit) {
      const re = new RegExp(`- \\[ \\] \\*\\*${manualCrit.id}\\*\\*: ${manualCrit.desc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
      spec = spec.replace(re, `- [ ] **${manualCrit.id}**: [manual] ${manualCrit.desc}`)
    }
  }
  fs.writeFileSync(specPath, spec)
  return specPath
}

function writeTests(projectPath, tests) {
  for (const t of tests) {
    const testPath = path.join(projectPath, "tests", t.file)
    fs.mkdirSync(path.dirname(testPath), { recursive: true })
    fs.writeFileSync(testPath, t.content)
  }
}

describe("sdd_requirement_tracker v4 (modo_qa unificado)", () => {
  test("modo_qa=manual global en spec aprueba sin tests", async () => {
    const { projectPath, context } = setup("qa-manual-spec")
    const changeName = "feature-x"
    writeLock(projectPath, changeName, { stack_profile: "node-typescript" })
    writeSpec(projectPath, changeName, [
      { id: "CA1", desc: "Función retorna 200 si input válido" },
      { id: "CA2", desc: "Función retorna 400 si input inválido" }
    ], { modo_qa: "manual" })

    const result = await requirementTracker.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("APPROVED")
    expect(parsed.message).toContain("MANUAL")
  })

  test("modo_qa=manual global en lockfile (no en spec) aprueba sin tests", async () => {
    const { projectPath, context } = setup("qa-manual-lockfile")
    const changeName = "feature-y"
    writeLock(projectPath, changeName, { stack_profile: "node-typescript", modo_qa: "manual" })
    writeSpec(projectPath, changeName, [
      { id: "CA1", desc: "Algo testeable" }
    ])

    const result = await requirementTracker.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("APPROVED")
    expect(parsed.message).toContain("MANUAL")
  })

  test("[manual] por criterio aprueba ese criterio individual sin cobertura", async () => {
    const { projectPath, context } = setup("criterio-manual")
    const changeName = "feature-z"
    writeLock(projectPath, changeName, { stack_profile: "node-typescript" })
    writeSpec(projectPath, changeName, [
      { id: "CA1", desc: "Función retorna 200 si input válido" },
      { id: "CA2", desc: "Verificar visualmente en navegador", manual: true }
    ], { manualMarc: true })
    writeTests(projectPath, [
      { file: "validate.test.ts", content: `describe("CA1", () => { test("ok", () => { expect(validate("a")).toBe(200); }); });` }
    ])

    const result = await requirementTracker.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("APPROVED")
  })

  test("rechaza [e2e] como flag (ya no válido)", async () => {
    const { projectPath, context } = setup("e2e-flag")
    const changeName = "feature-e2e"
    writeLock(projectPath, changeName, { stack_profile: "node-typescript" })
    writeSpec(projectPath, changeName, [
      { id: "CA1", desc: "Test normal" }
    ])
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.writeFileSync(specPath, fs.readFileSync(specPath, "utf-8").replace(
      "- [ ] **CA1**: Test normal",
      "- [ ] **CA1**: [e2e] Test normal"
    ))
    writeTests(projectPath, [
      { file: "validate.test.ts", content: `describe("x", () => { test("y", () => { expect(1).toBe(1); }); });` }
    ])

    const result = await requirementTracker.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
  })

  test("rechaza [QA Manual] como flag global (ya no válido)", async () => {
    const { projectPath, context } = setup("qa-manual-flag")
    const changeName = "feature-qa"
    writeLock(projectPath, changeName, { stack_profile: "node-typescript" })
    writeSpec(projectPath, changeName, [
      { id: "CA1", desc: "Test normal" }
    ])
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.writeFileSync(specPath, fs.readFileSync(specPath, "utf-8").replace(
      "- [ ] **CA1**: Test normal",
      "- [ ] **CA1**: [QA Manual] Test normal"
    ))
    writeTests(projectPath, [
      { file: "validate.test.ts", content: `describe("x", () => { test("y", () => { expect(1).toBe(1); }); });` }
    ])

    const result = await requirementTracker.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
  })

  test("modo_qa en spec sobrescribe modo_qa del lockfile", async () => {
    const { projectPath, context } = setup("spec-overrides-lockfile")
    const changeName = "feature-override"
    writeLock(projectPath, changeName, { stack_profile: "node-typescript", modo_qa: "automatizado" })
    writeSpec(projectPath, changeName, [
      { id: "CA1", desc: "Función retorna 200 si input válido" }
    ], { modo_qa: "manual" })

    const result = await requirementTracker.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("APPROVED")
    expect(parsed.message).toContain("MANUAL")
  })
})
