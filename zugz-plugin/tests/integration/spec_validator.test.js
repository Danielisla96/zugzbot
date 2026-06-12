import { describe, test, expect } from "vitest"
import fs from "fs"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"
import specValidator from "../../.opencode/tools/sdd_spec_validator.js"
import { SPEC_TEMPLATE_V1 } from "../../.opencode/tools/sdd_spec_template.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TMP = path.join(os.tmpdir(), `zugzbot-validator-v4-${Date.now()}`)

function setup(name) {
  const projectPath = path.join(TMP, name)
  fs.mkdirSync(projectPath, { recursive: true })
  return {
    projectPath,
    context: { worktree: projectPath, directory: projectRoot(projectPath) }
  }
}
function projectRoot(p) { return p }

describe("sdd_spec_validator v4", () => {
  test("aprueba spec v4 válido", async () => {
    const { projectPath, context } = setup("ok")
    const changeName = "feature-ok"
    fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
    fs.writeFileSync(
      path.join(projectPath, ".openspec/sdd-lock.json"),
      JSON.stringify({ schema_version: 3, change_name: changeName, complexity: "low" })
    )
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.mkdirSync(path.dirname(specPath), { recursive: true })
    const spec = SPEC_TEMPLATE_V1
      .replace("<kebab-case>", changeName)
      .replace("- id: \"CA1\"\n    descripcion: \"Descripción testeable del criterio\"",
               "- id: \"CA1\"\n    descripcion: \"La función retorna 200 cuando el input es válido\"")
      .replace("- id: \"CA2\"\n    descripcion: \"Otra condición verificable\"",
               "- id: \"CA2\"\n    descripcion: \"La función retorna 400 cuando el input es inválido\"")
      .replace("[Arquitectura y diseño técnico de la solución]",
               "Función pura validate(input: string): boolean que retorna true si el input es válido según las reglas de negocio. La implementación usa regex RFC 5322 simplificado y manejo de errores explícito en cada caso borde.")
    fs.writeFileSync(specPath, spec)

    const result = await specValidator.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("APPROVED")
  })

  test("rechaza spec con BDD en inglés", async () => {
    const { projectPath, context } = setup("english-bdd")
    const changeName = "feature-en"
    fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
    fs.writeFileSync(
      path.join(projectPath, ".openspec/sdd-lock.json"),
      JSON.stringify({ schema_version: 3, change_name: changeName })
    )
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.mkdirSync(path.dirname(specPath), { recursive: true })
    const spec = SPEC_TEMPLATE_V1
      .replace("<kebab-case>", changeName)
      .replace("Dado", "Given")
      .replace("Cuando", "When")
      .replace("Entonces", "Then")
    fs.writeFileSync(specPath, spec)

    const result = await specValidator.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
    const rules = parsed.rules_violated || []
    expect(rules).toContain("R3")
  })

  test("rechaza título de sección mutado", async () => {
    const { projectPath, context } = setup("mutated-title")
    const changeName = "feature-mut"
    fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
    fs.writeFileSync(
      path.join(projectPath, ".openspec/sdd-lock.json"),
      JSON.stringify({ schema_version: 3, change_name: changeName })
    )
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.mkdirSync(path.dirname(specPath), { recursive: true })
    const spec = SPEC_TEMPLATE_V1
      .replace("<kebab-case>", changeName)
      .replace("## 5. Criterios de Aceptación", "## 5. Criterios de Aceptación y Calidad (QA)")
    fs.writeFileSync(specPath, spec)

    const result = await specValidator.execute({ changeName }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
    const rules = parsed.rules_violated || []
    expect(rules).toContain("R2")
  })
})
