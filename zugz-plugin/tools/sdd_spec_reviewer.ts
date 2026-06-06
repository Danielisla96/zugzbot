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

function parseFrontmatter(spec: string): { frontmatter: any; markdown: string } {
  const match = spec.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { frontmatter: null, markdown: spec }
  
  const yamlText = match[1]
  const markdown = match[2]
  const frontmatter: any = {}
  
  const lines = yamlText.split(/\r?\n/)
  let currentKey = ""
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    
    if (trimmed.startsWith("-")) {
      const val = trimmed.replace(/^-\s*/, "").replace(/^['"](.*)['"]$/, "$1")
      if (currentKey) {
        if (!Array.isArray(frontmatter[currentKey])) {
          frontmatter[currentKey] = []
        }
        frontmatter[currentKey].push(val)
      }
    } else {
      const colonIdx = line.indexOf(":")
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim()
        const val = line.slice(colonIdx + 1).trim().replace(/^['"](.*)['"]$/, "$1")
        currentKey = key
        if (val === "" || val === "[]") {
          frontmatter[key] = []
        } else {
          frontmatter[key] = val
        }
      }
    }
  }
  return { frontmatter, markdown }
}

function checkHasTitle(spec: string, markdown: string): SpecCheck {
  const hasTitle = /^#\s+Plano Técnico/m.test(markdown)
  return {
    name: "title",
    description: "El spec debe tener un título '# Plano Técnico'",
    pass: hasTitle,
    details: hasTitle ? "Título presente" : "Falta el título '# Plano Técnico'"
  }
}

function checkHasAffectedFiles(spec: string, frontmatter: any, markdown: string): SpecCheck {
  let hasFiles = false
  if (frontmatter && Array.isArray(frontmatter.affected_files) && frontmatter.affected_files.length > 0) {
    hasFiles = true
  } else {
    hasFiles = /##\s*1\s*[.\s-]?\s*Diagn[oó]stico/i.test(markdown) &&
      /`[^`]+\.\w+`/.test(markdown)
  }
  return {
    name: "affected_files",
    description: "El spec debe listar archivos afectados con paths concretos",
    pass: hasFiles,
    details: hasFiles ? "Archivos listados" : "Falta la sección de archivos afectados o no hay paths concretos"
  }
}

function checkHasBDDScenarios(spec: string, markdown: string): SpecCheck {
  const hasBddSection = /##\s*4\s*[.\s-]?\s*Especificaciones\s+BDD/i.test(markdown)
  const hasGiven = /Given\s+/i.test(markdown)
  const hasWhen = /When\s+/i.test(markdown)
  const hasThen = /Then\s+/i.test(markdown)
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

function checkAcceptanceCriteria(spec: string, frontmatter: any, markdown: string): SpecCheck {
  let pass = false
  let count = 0
  if (frontmatter && Array.isArray(frontmatter.acceptance_criteria) && frontmatter.acceptance_criteria.length > 0) {
    pass = true
    count = frontmatter.acceptance_criteria.length
  } else {
    const hasSection = /##\s*5\s*[.\s-]?\s*Criterios/i.test(markdown)
    const hasCheckboxes = /-\s*\[\s*\]/m.test(markdown)
    count = (markdown.match(/-\s*\[\s*\]/g) || []).length
    pass = hasSection && hasCheckboxes && count >= 1
  }
  return {
    name: "acceptance_criteria",
    description: "El spec debe tener al menos 1 criterio de aceptación con checkbox",
    pass,
    details: pass ? `OK (${count} criterios)` : "Falta la sección de Criterios de Aceptación o checkboxes"
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

function checkFilesHaveLineRanges(spec: string, frontmatter: any, markdown: string): SpecCheck {
  let hasLines = false
  // Check markdown first to see if ranges are present anywhere in the document
  hasLines = /\(L[ií]neas?\s+\d+/i.test(markdown) || /\(L\d+-?\d*\)/i.test(markdown) || /L[ií]neas?\s+\d+/i.test(markdown)
  
  if (!hasLines && frontmatter && Array.isArray(frontmatter.affected_files)) {
    hasLines = frontmatter.affected_files.some((f: string) => /\(L[ií]neas?\s+\d+/i.test(f) || /\(L\d+-?\d*\)/i.test(f) || /lines:/i.test(f) || /:\s*\d+/i.test(f))
    if (!hasLines) {
      const yamlPart = spec.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      if (yamlPart && (/\d+-\d+/.test(yamlPart[1]) || /lines:/i.test(yamlPart[1]))) {
        hasLines = true
      }
    }
  }
  return {
    name: "line_ranges",
    description: "Los archivos afectados deben especificar rangos de líneas",
    pass: hasLines,
    details: hasLines
      ? "Rangos de líneas presentes"
      : "Considera agregar rangos de líneas a los archivos afectados (ej: 'Líneas 10-35')"
  }
}

function checkChangeNameInSpec(spec: string, frontmatter: any, markdown: string): SpecCheck {
  let isGeneric = false
  if (frontmatter && frontmatter.change_name) {
    isGeneric = /nuevo[-_]cambio/i.test(frontmatter.change_name)
  } else {
    isGeneric = /nuevo[-_]cambio/i.test(markdown)
  }
  return {
    name: "change_name_specific",
    description: "El change_name no debe ser genérico",
    pass: !isGeneric,
    details: isGeneric
      ? "El spec usa 'nuevo-cambio' como nombre. Renombrar a algo descriptivo en kebab-case."
      : "Nombre del cambio parece descriptivo"
  }
}

function checkArchitectureDescription(spec: string, markdown: string): SpecCheck {
  const hasSection = /##\s*3\s*[.\s-]?\s*Propuesta/i.test(markdown)
  const hasText = hasSection && markdown.split(/##\s*3/i)[1]?.split("##")[0]?.trim().length > 50
  return {
    name: "architecture",
    description: "El spec debe describir la arquitectura propuesta con suficiente detalle",
    pass: !!hasText,
    details: !hasSection
      ? "Falta la sección de Propuesta de Solución"
      : "Sección presente"
  }
}

function checkUIDesignSkill(spec: string, frontmatter: any, markdown: string): SpecCheck {
  let isUI = false
  let files: string[] = []
  if (frontmatter && Array.isArray(frontmatter.affected_files)) {
    files = frontmatter.affected_files
  } else {
    const fileMatches = [...markdown.matchAll(/`([^`]+\.\w+)`/g)]
    files = fileMatches.map(m => m[1])
  }

  const uiExtensions = /\.(tsx|jsx|css|html|svelte|vue)$/i
  isUI = files.some(f => uiExtensions.test(f))

  if (!isUI) {
    return {
      name: "ui_design_skill",
      description: "Si el cambio es backend/no-UI, no se requiere Design Skill",
      pass: true,
      details: "No se detectaron archivos de Frontend o estilos"
    }
  }

  // Verificar si menciona alguna Design Skill en el frontmatter o en el cuerpo del Markdown
  // Comprobamos si hay una propiedad "design_skill" o si el texto menciona "Design Skill: <nombre>"
  let hasDesignSkill = false
  let skillName = ""
  if (frontmatter && frontmatter.design_skill) {
    hasDesignSkill = true
    skillName = frontmatter.design_skill
  } else {
    const match = markdown.match(/design[-_]skill:\s*(\w+)/i) || markdown.match(/design\s+skill:\s*(\w+)/i)
    if (match) {
      hasDesignSkill = true
      skillName = match[1]
    }
  }

  return {
    name: "ui_design_skill",
    description: "Si el cambio involucra UI, debe especificar una Design Skill (ej: glassmorphism, neobrutalism, bento)",
    pass: hasDesignSkill,
    details: hasDesignSkill 
      ? `Diseño consistente usando la skill: ${skillName}`
      : "❌ Se detectaron archivos UI pero no se especificó ninguna 'design_skill' en el Spec para asegurar un diseño consistente."
  }
}

export default tool({
  description: `Validador de testeabilidad del spec (Fase 1.5). Lee el spec.md y verifica que cumpla las condiciones mínimas para que pueda derivarse en tests ejecutables. Supports YAML frontmatter and Markdown fallback.
  
  Acciones:
  - "validate": Valida el spec y retorna lista de checks pass/fail.
  - "summary": Retorna un resumen ejecutivo del estado del spec.
  - "fix": Formatea y re-estructura automáticamente el spec en el formato híbrido YAML Frontmatter + Markdown.`,
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
    let changeName = ""
    const { readLockfile } = await import("./sdd_lock_manager.js")
    const lock = readLockfile(projectRoot)
    changeName = lock.change_name || "cambio-sdd"

    if (!specPath) {
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

    let { frontmatter, markdown } = parseFrontmatter(spec)

    if (args.action === "fix") {
      let content = spec

      // Extract details to generate Frontmatter if missing
      if (!frontmatter) {
        const affectedFilesMatches = [...markdown.matchAll(/`([^`]+\.\w+)`\s*(?:\(?L[ií]neas?\s*\d+(?:-\d+)?\)?)?/gi)]
        const filesList = affectedFilesMatches.map(m => {
          const file = m[1]
          const linesMatch = m[0].match(/L[ií]neas?\s*(\d+(?:-\d+)?)/i)
          const range = linesMatch ? linesMatch[1] : ""
          return range ? `${file} (Líneas ${range})` : file
        })

        const criteriaMatches = [...markdown.matchAll(/-\s*\[\s*\]\s*(.+)/g)]
        const criteriaList = criteriaMatches.map(m => `"[ ] ${m[1].trim()}"`)

        const yamlHeader = [
          "---",
          `change_name: "${changeName}"`,
          "affected_files:",
          ...(filesList.length > 0 ? filesList.map(f => `  - "${f}"`) : ["  - \"src/\""]),
          "acceptance_criteria:",
          ...(criteriaList.length > 0 ? criteriaList.map(c => `  - ${c}`) : ["  - \"[ ] Criterio de aceptación inicial\""]),
          "---",
          ""
        ].join("\n")

        content = yamlHeader + markdown
      }

      // Re-parse with newly generated frontmatter if needed
      const parsed = parseFrontmatter(content)
      frontmatter = parsed.frontmatter
      markdown = parsed.markdown

      // 1. Title Normalization
      const hasTitle = /^#\s+Plano Técnico/m.test(markdown)
      if (!hasTitle) {
        const firstHeader = markdown.match(/^#\s+(.+)$/m)
        if (firstHeader) {
          markdown = markdown.replace(/^#\s+(.+)$/m, "# Plano Técnico")
        } else {
          markdown = "# Plano Técnico\n\n" + markdown
        }
      }

      // 2. Section Headings Normalization
      markdown = markdown.replace(/##\s*1\s*[.\s-]?\s*Diagn[oó]stico.*/gi, "## 1. Diagnóstico y Archivos Afectados")
      markdown = markdown.replace(/##\s*3\s*[.\s-]?\s*Propuesta.*/gi, "## 3. Propuesta de Solución")
      markdown = markdown.replace(/##\s*4\s*[.\s-]?\s*Especificaciones.*/gi, "## 4. Especificaciones BDD")
      markdown = markdown.replace(/##\s*5\s*[.\s-]?\s*Criterios.*/gi, "## 5. Criterios de Aceptación")

      // 3. Translate BDD Keywords
      markdown = markdown.replace(/^(?<indent>\s*)(?:Dado|Dada)(?:\s+que)?\b/gim, "$1Given")
      markdown = markdown.replace(/^(?<indent>\s*)Cuando\b/gim, "$1When")
      markdown = markdown.replace(/^(?<indent>\s*)Entonces\b/gim, "$1Then")
      markdown = markdown.replace(/^(?<indent>\s*)Y\b/gim, "$1And")

      // 4. Line Ranges Auto-parenthesizing
      markdown = markdown.replace(/(?<!\()\b(L[ií]neas?\s+\d+(?:-\d+)?|L\d+-\d+|L\d+)\b(?!\))/gi, "($1)")

      // 5. Auto-renumber subheadings to match their parent section number
      const lines = markdown.split("\n")
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
      markdown = lines.join("\n")

      // Write everything back
      const yamlPart = [
        "---",
        `change_name: "${frontmatter?.change_name || changeName}"`,
        `design_skill: "${frontmatter?.design_skill || ""}"`,
        "affected_files:",
        ...(Array.isArray(frontmatter?.affected_files) ? frontmatter.affected_files.map((f: string) => `  - "${f}"`) : ["  - \"src/\""]),
        "acceptance_criteria:",
        ...(Array.isArray(frontmatter?.acceptance_criteria) ? frontmatter.acceptance_criteria.map((c: string) => `  - "${c}"`) : ["  - \"[ ] Criterio de aceptación\""]),
        "---",
        ""
      ].join("\n")

      content = yamlPart + markdown
      fs.writeFileSync(specPath, content, "utf-8")
      spec = content
      const reparsed = parseFrontmatter(spec)
      frontmatter = reparsed.frontmatter
      markdown = reparsed.markdown
    }

    const checks: SpecCheck[] = [
      checkHasTitle(spec, markdown),
      checkHasAffectedFiles(spec, frontmatter, markdown),
      checkHasBDDScenarios(spec, markdown),
      checkAcceptanceCriteria(spec, frontmatter, markdown),
      checkTestability(spec),
      checkFilesHaveLineRanges(spec, frontmatter, markdown),
      checkChangeNameInSpec(spec, frontmatter, markdown),
      checkArchitectureDescription(spec, markdown),
      checkUIDesignSkill(spec, frontmatter, markdown)
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
