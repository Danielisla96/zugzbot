import { describe, test, expect } from "vitest"
import fs from "fs"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"
import specReviewer from "../../.opencode/tools/sdd_spec_reviewer.js"
import { SPEC_TEMPLATE_V1 } from "../../.opencode/tools/sdd_spec_template.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TMP = path.join(os.tmpdir(), `zugzbot-spec-reviewer-v4-${Date.now()}`)

function setup(name) {
  const projectPath = path.join(TMP, name)
  fs.mkdirSync(projectPath, { recursive: true })
  return {
    projectPath,
    context: { worktree: projectPath, directory: projectPath }
  }
}

describe("sdd_spec_reviewer v4 integration", () => {
  test("action=init genera un spec en formato v4 (frontmatter ES + secciones exactas)", async () => {
    const { projectPath, context } = setup("init-v4")
    const changeName = "agregar-feature"
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")

    fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
    fs.writeFileSync(
      path.join(projectPath, ".openspec/sdd-lock.json"),
      JSON.stringify({ change_name: changeName })
    )

    const result = await specReviewer.execute({ action: "init", specPath }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("SUCCESS")

    const content = fs.readFileSync(specPath, "utf-8")
    expect(content).toContain('spec_version: "1.0"')
    expect(content).toContain('modo_qa: "automatizado"')
    expect(content).toContain("# Especificación Técnica del Cambio")
    expect(content).toContain("## 1. Diagnóstico y Archivos Afectados")
    expect(content).toContain("## 5. Criterios de Aceptación")
    expect(content).toContain("Dado")
    expect(content).toContain("Cuando")
    expect(content).toContain("Entonces")
  })

  test("action=init usa el SPEC_TEMPLATE_V1 como base (estructura completa)", async () => {
    const { projectPath, context } = setup("init-template")
    const changeName = "feature-x"
    fs.mkdirSync(path.join(projectPath, ".openspec"), { recursive: true })
    fs.writeFileSync(
      path.join(projectPath, ".openspec/sdd-lock.json"),
      JSON.stringify({ schema_version: 3, change_name: changeName })
    )
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.mkdirSync(path.dirname(specPath), { recursive: true })

    await specReviewer.execute({ action: "init", specPath }, context)
    const content = fs.readFileSync(specPath, "utf-8")
    expect(content).toContain(`change_name: "${changeName}"`)
    expect(content).toContain('spec_version: "1.0"')
    expect(content).toContain('modo_qa: "automatizado"')
    expect(content).toContain("# Especificación Técnica del Cambio")
    for (const sec of ["1. Diagnóstico y Archivos Afectados", "2. Consenso con el Usuario", "3. Propuesta de Solución", "4. Especificaciones de Comportamiento (BDD)", "5. Criterios de Aceptación"]) {
      expect(content).toContain(`## ${sec}`)
    }
  })

  test("action=validate aprueba un spec v4 válido", async () => {
    const { projectPath, context } = setup("validate-ok")
    const specPath = path.join(projectPath, "spec.md")
    const validSpec = SPEC_TEMPLATE_V1
      .replace("<kebab-case>", "feature-ok")
      .replace("- id: \"CA1\"\n    descripcion: \"Descripción testeable del criterio\"",
               "- id: \"CA1\"\n    descripcion: \"La función retorna 200 cuando el input es válido\"")
      .replace("- id: \"CA2\"\n    descripcion: \"Otra condición verificable\"",
               "- id: \"CA2\"\n    descripcion: \"La función retorna 400 cuando el input es inválido\"")
      .replace("[Arquitectura y diseño técnico de la solución]",
               "Función pura validate(input: string): boolean que retorna true si el input es válido según las reglas de negocio definidas. La implementación usa regex RFC 5322 simplificado y manejo de errores explícito.")
    fs.writeFileSync(specPath, validSpec)

    const result = await specReviewer.execute({ action: "validate", specPath }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("SUCCESS")
    expect(parsed.verdict).toBe("APPROVED")
  })

  test("action=validate rechaza título mutado en formato v4", async () => {
    const { projectPath, context } = setup("validate-mutated")
    const changeName = "feature-mut"
    const specPath = path.join(projectPath, ".openspec/changes", changeName, "specs/spec.md")
    fs.mkdirSync(path.dirname(specPath), { recursive: true })
    const mutated = SPEC_TEMPLATE_V1.replace(
      "## 5. Criterios de Aceptación",
      "## 5. Criterios de Aceptación y Calidad (QA)"
    )
    fs.writeFileSync(specPath, mutated)

    const result = await specReviewer.execute({ action: "validate", specPath }, context)
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
    expect(parsed.verdict).toBe("REJECTED")
    const failed = parsed.failed_checks || parsed.failed_rules || []
    const names = failed.map((c) => c.name || c)
    const hasStrictTitle = names.includes("strict_titles_v4") || names.includes("R2") || names.includes("R10")
    expect(hasStrictTitle).toBe(true)
  })
})
