import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

interface SpecCheck {
  name: string
  description: string
  pass: boolean
  details: string
}

function readSpec(specPath: string): string {
  if (!fs.existsSync(specPath)) return ""
  return fs.readFileSync(specPath, "utf-8")
}

function checkHasTitle(spec: string): SpecCheck {
  const hasTitle = /^#\s+Plano Técnico/m.test(spec)
  return {
    name: "title",
    description: "El spec debe tener un título '# Plano Técnico'",
    pass: hasTitle,
    details: hasTitle ? "Título presente" : "Falta el título '# Plano Técnico'"
  }
}

function checkHasAffectedFiles(spec: string): SpecCheck {
  const hasFiles = /##\s*1\s*[.\s-]?\s*Diagn[oó]stico/i.test(spec) &&
    /`[^`]+\.\w+`/.test(spec)
  return {
    name: "affected_files",
    description: "El spec debe listar archivos afectados con paths concretos",
    pass: hasFiles,
    details: hasFiles ? "Archivos listados" : "Falta la sección de archivos afectados o no hay paths concretos"
  }
}

function checkHasBDDScenarios(spec: string): SpecCheck {
  const hasBddSection = /##\s*4\s*[.\s-]?\s*Especificaciones\s+BDD/i.test(spec)
  const hasGiven = /Given\s+/i.test(spec)
  const hasWhen = /When\s+/i.test(spec)
  const hasThen = /Then\s+/i.test(spec)
  const pass = hasBddSection && hasGiven && hasWhen && hasThen
  return {
    name: "bdd_scenarios",
    description: "El spec debe tener escenarios BDD con Given/When/Then",
    pass,
    details: !hasBddSection
      ? "Falta la sección de Especificaciones BDD"
      : (!hasGiven ? "Faltan cláusulas Given" : !hasWhen ? "Faltan cláusulas When" : !hasThen ? "Faltan cláusulas Then" : "BDD presente")
  }
}

function checkAcceptanceCriteria(spec: string): SpecCheck {
  const hasSection = /##\s*5\s*[.\s-]?\s*Criterios/i.test(spec)
  const hasCheckboxes = /-\s*\[\s*\]/m.test(spec)
  const count = (spec.match(/-\s*\[\s*\]/g) || []).length
  const pass = hasSection && hasCheckboxes && count >= 1
  return {
    name: "acceptance_criteria",
    description: "El spec debe tener al menos 1 criterio de aceptación con checkbox",
    pass,
    details: !hasSection
      ? "Falta la sección de Criterios de Aceptación"
      : !hasCheckboxes
        ? "No hay checkboxes '- [ ]' en los criterios"
        : `OK (${count} criterios)`
  }
}

function checkTestability(spec: string): SpecCheck {
  const vagueWords = /\b(mejorar\s+un\s+poco|optimizar\s+si\s+se\s+puede|limpiar\s+en\s+general|mejor\s+experiencia)\b/gi
  const hasVague = vagueWords.test(spec)
  return {
    name: "testability",
    description: "Los criterios deben ser objetivos y testeables (sin vaguedades)",
    pass: !hasVague,
    details: hasVague
      ? "Hay criterios vagos que no son testeables. Reformular como aserciones concretas."
      : "Criterios parecen testeables"
  }
}

function checkFilesHaveLineRanges(spec: string): SpecCheck {
  const hasLines = /\(L[ií]neas?\s+\d+/i.test(spec) || /\(L\d+-?\d*\)/i.test(spec)
  return {
    name: "line_ranges",
    description: "Los archivos afectados deben especificar rangos de líneas",
    pass: hasLines,
    details: hasLines
      ? "Rangos de líneas presentes"
      : "Considera agregar rangos de líneas a los archivos afectados (ej: 'Líneas 10-35')"
  }
}

function checkChangeNameInSpec(spec: string): SpecCheck {
  const isGeneric = /nuevo[-_]cambio/i.test(spec)
  return {
    name: "change_name_specific",
    description: "El change_name no debe ser genérico",
    pass: !isGeneric,
    details: isGeneric
      ? "El spec usa 'nuevo-cambio' como nombre. Renombrar a algo descriptivo en kebab-case."
      : "Nombre del cambio parece descriptivo"
  }
}

function checkArchitectureDescription(spec: string): SpecCheck {
  const hasSection = /##\s*3\s*[.\s-]?\s*Propuesta/i.test(spec)
  const hasText = hasSection && spec.split("## 3")[1]?.split("##")[0]?.trim().length > 50
  return {
    name: "architecture",
    description: "El spec debe describir la arquitectura propuesta con suficiente detalle",
    pass: !!hasText,
    details: !hasSection
      ? "Falta la sección de Propuesta de Solución"
      : "Sección presente"
  }
}

export default tool({
  description: `Validador de testeabilidad del spec (Fase 1.5). Lee el spec.md y verifica que cumpla las condiciones mínimas para que pueda derivarse en tests ejecutables.
  
  Acciones:
  - "validate": Valida el spec y retorna lista de checks pass/fail.
  - "summary": Retorna un resumen ejecutivo del estado del spec.

  Esta herramienta NO modifica el spec; solo lo lee y emite un veredicto.`,
  args: {
    action: tool.schema.enum(["validate", "summary", "fix"])
      .describe("Acción a ejecutar"),
    specPath: tool.schema.string().optional()
      .describe("Path al spec.md (default: .openspec/changes/<change>/specs/spec.md)")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }

    let specPath = args.specPath
    if (!specPath) {
      const { readLockfile } = await import("./sdd_lock_manager.js")
      const lock = readLockfile(projectRoot)
      if (!lock.change_name) {
        return JSON.stringify({
          status: "FAILED",
          reason: "No hay change_name en el lockfile. Ejecuta F1-planner primero."
        }, null, 2)
      }
      specPath = path.join(projectRoot, ".openspec/changes", lock.change_name, "specs/spec.md")
    }

    let spec = readSpec(specPath)
    if (!spec) {
      return JSON.stringify({
        status: "FAILED",
        reason: `No se encontró el spec en ${specPath}`
      }, null, 2)
    }

    if (args.action === "fix") {
      let content = spec

      // 1. Title Normalization
      const hasTitle = /^#\s+Plano Técnico/m.test(content)
      if (!hasTitle) {
        const firstHeader = content.match(/^#\s+(.+)$/m)
        if (firstHeader) {
          content = content.replace(/^#\s+(.+)$/m, "# Plano Técnico")
        } else {
          content = "# Plano Técnico\n\n" + content
        }
      }

      // 2. Section Headings Normalization
      content = content.replace(/##\s*1\s*[.\s-]?\s*Diagn[oó]stico.*/gi, "## 1. Diagnóstico y Archivos Afectados")
      content = content.replace(/##\s*3\s*[.\s-]?\s*Propuesta.*/gi, "## 3. Propuesta de Solución")
      content = content.replace(/##\s*4\s*[.\s-]?\s*Especificaciones.*/gi, "## 4. Especificaciones BDD")
      content = content.replace(/##\s*5\s*[.\s-]?\s*Criterios.*/gi, "## 5. Criterios de Aceptación")

      // 3. Translate BDD Keywords
      content = content.replace(/^(?<indent>\s*)(?:Dado|Dada)(?:\s+que)?\b/gim, "$1Given")
      content = content.replace(/^(?<indent>\s*)Cuando\b/gim, "$1When")
      content = content.replace(/^(?<indent>\s*)Entonces\b/gim, "$1Then")
      content = content.replace(/^(?<indent>\s*)Y\b/gim, "$1And")

      // 4. Line Ranges Auto-parenthesizing
      content = content.replace(/(?<!\()\b(L[ií]neas?\s+\d+(?:-\d+)?|L\d+-\d+|L\d+)\b(?!\))/gi, "($1)")

      // 5. Auto-renumber subheadings to match their parent section number
      const lines = content.split("\n")
      let currentSectionNumber: string | null = null
      for (let i = 0; i < lines.length; i++) {
        const sectionMatch = lines[i].match(/^##\s*(\d+)\./)
        if (sectionMatch) {
          currentSectionNumber = sectionMatch[1]
        } else if (currentSectionNumber) {
          const subMatch = lines[i].match(/^(###\s*)(\d+)(\.\d+\s+.*)$/)
          if (subMatch && subMatch[2] !== currentSectionNumber) {
            lines[i] = `${subMatch[1]}${currentSectionNumber}${subMatch[3]}`
          }
        }
      }
      content = lines.join("\n")

      fs.writeFileSync(specPath, content, "utf-8")
      spec = content
    }

    const checks: SpecCheck[] = [
      checkHasTitle(spec),
      checkHasAffectedFiles(spec),
      checkHasBDDScenarios(spec),
      checkAcceptanceCriteria(spec),
      checkTestability(spec),
      checkFilesHaveLineRanges(spec),
      checkChangeNameInSpec(spec),
      checkArchitectureDescription(spec)
    ]

    const passed = checks.filter(c => c.pass).length
    const failed = checks.filter(c => !c.pass)
    const verdict = failed.length === 0 ? "APPROVED" : "REJECTED"

    if (args.action === "summary") {
      return JSON.stringify({
        status: "SUCCESS",
        verdict,
        score: `${passed}/${checks.length}`,
        failed_count: failed.length,
        spec_path: specPath
      }, null, 2)
    }

    return JSON.stringify({
      status: verdict === "APPROVED" ? "SUCCESS" : "FAILED",
      verdict,
      score: `${passed}/${checks.length}`,
      spec_path: specPath,
      checks,
      message: verdict === "APPROVED"
        ? "✅ Spec aprobado. Cumple todos los requisitos de testeabilidad."
        : `❌ Spec rechazado. ${failed.length} checks fallaron. Volver a F1.`,
      failed_checks: failed.map(c => ({ name: c.name, details: c.details }))
    }, null, 2)
  }
})
