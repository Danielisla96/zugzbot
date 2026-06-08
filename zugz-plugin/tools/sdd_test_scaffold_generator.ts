import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Analiza el archivo spec.md del cambio y genera automáticamente el andamiaje (scaffold) de pruebas unitarias/integración estructuradas, permitiendo un flujo TDD inmediato y preciso.",
  args: {
    changeName: tool.schema.string().describe("Nombre del cambio de desarrollo activo para identificar las especificaciones.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
    const report: string[] = []
    report.push(`━━━ sdd_test_scaffold_generator: ${args.changeName} ━━━`)

    const openspecDir = path.join(projectRoot, ".openspec")
    const specFile = path.join(openspecDir, "changes", args.changeName, "spec.md")
    
    let specContent = ""
    if (fs.existsSync(specFile)) {
      specContent = fs.readFileSync(specFile, "utf-8")
    } else {
      // Fallback a buscar cualquier spec.md en openspec o raíz
      const alternativeSpec = path.join(projectRoot, "spec.md")
      if (fs.existsSync(alternativeSpec)) {
        specContent = fs.readFileSync(alternativeSpec, "utf-8")
      }
    }

    if (!specContent) {
      report.push("⚠ No se encontró ningún archivo `spec.md` activo para el cambio. Generando andamiaje básico de salud general.")
      specContent = "# Especificación General\n- [ ] El sistema debe inicializarse correctamente.\n- [ ] La interfaz debe responder a las llamadas básicas."
    }

    // Extraer requerimientos
    const requirements: string[] = []
    const lines = specContent.split("\n")
    lines.forEach(line => {
      const match = line.match(/^[-*+]\s+\[\s*\]\s+(.+)$/) || line.match(/^\d+\.\s+(.+)$/)
      if (match && match[1]) {
        requirements.push(match[1].trim())
      }
    })

    if (requirements.length === 0) {
      requirements.push("El sistema debe cumplir con el flujo principal del requerimiento.")
    }

    const testDir = path.join(projectRoot, "tests", "unit")
    fs.mkdirSync(testDir, { recursive: true })

    const testFilePath = path.join(testDir, `${args.changeName}.test.js`)
    
    // Generar el código de prueba estructurado
    const testCode = `import { describe, test, expect } from "vitest"

describe("Especificación TDD - ${args.changeName}", () => {
${requirements.map((req, idx) => `  test.todo("Requerimiento #${idx + 1}: ${req.replace(/"/g, '\\"')}", () => {
    // TODO: Implementar prueba para verificar que: ${req.replace(/"/g, '\\"')}
    expect(true).toBe(false)
  })`).join("\n\n")}
})
`

    fs.writeFileSync(testFilePath, testCode, "utf-8")
    report.push(`✓ Se detectaron ${requirements.length} requerimientos en el Spec.`)
    report.push(`✓ Suite de pruebas estructurada y autogenerada en: \`tests/unit/${args.changeName}.test.js\``)
    report.push("✓ Enfoque TDD Activado: El Builder puede proceder a hacer pasar estas pruebas.")

    return report.join("\n")
  }
})
