import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import {
  SPEC_TEMPLATE_V1,
  SECTIONS,
  SPEC_TITLE,
  parseFrontmatter as parseFrontmatterV4,
  parseCriterios as parseCriteriosV4,
  matchBddScenarios,
  validateSpec,
  type SpecFrontmatter
} from "../_lib/sdd_spec_template.js"

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

function parseLegacyFrontmatter(spec: string): { frontmatter: any; markdown: string } {
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

function isV4Spec(frontmatter: any): boolean {
  return frontmatter && frontmatter.spec_version === "1.0"
}

function checkHasTitle(markdown: string): SpecCheck {
  const hasTitle = markdown.includes(`# ${SPEC_TITLE}`)
  return {
    name: "title",
    description: `El spec debe tener un título '# ${SPEC_TITLE}'`,
    pass: hasTitle,
    details: hasTitle ? "Título presente" : `Falta el título '# ${SPEC_TITLE}'`
  }
}

function checkStrictTitlesV4(markdown: string): SpecCheck {
  const failed: string[] = []
  for (const section of SECTIONS) {
    const headerRegex = new RegExp(`^##\\s*${section.n}\\.\\s*${section.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m")
    if (!headerRegex.test(markdown)) {
      failed.push(`## ${section.n}. ${section.title}`)
    }
  }
  return {
    name: "strict_titles_v4",
    description: "Los títulos de las 5 secciones deben ser exactos (sin sufijos como 'y Calidad (QA)').",
    pass: failed.length === 0,
    details: failed.length === 0
      ? "Títulos de sección exactos"
      : `Títulos mutados o faltantes: ${failed.join(", ")}`
  }
}

function checkBddSpanishOnly(markdown: string): SpecCheck {
  const scenarios = matchBddScenarios(`dummy\n---\n${markdown}`)
  if (scenarios.length === 0) {
    return {
      name: "bdd_scenarios",
      description: "El spec debe tener escenarios BDD con cláusulas Dado/Cuando/Entonces",
      pass: false,
      details: "No se encontraron escenarios 'Escenario:' en la sección 4."
    }
  }
  for (const sc of scenarios) {
    if (sc.pasos.length === 0) {
      return {
        name: "bdd_scenarios",
        description: "El spec debe tener escenarios BDD con cláusulas Dado/Cuando/Entonces",
        pass: false,
        details: `El escenario '${sc.titulo}' no tiene pasos Dado/Cuando/Entonces.`
      }
    }
  }
  const hasEnglish = /^\s*(Given|When|Then|And)\s+/m.test(markdown)
  return {
    name: "bdd_scenarios",
    description: "El spec debe tener escenarios BDD con cláusulas Dado/Cuando/Entonces en español",
    pass: !hasEnglish,
    details: hasEnglish
      ? "Se detectaron keywords BDD en inglés (Given/When/Then/And). El spec v4 requiere español: Dado/Cuando/Entonces/Y."
      : "BDD en español correcto"
  }
}

function checkAcceptanceCriteria(frontmatter: any, markdown: string): SpecCheck {
  const declared: any[] = Array.isArray(frontmatter?.criterios_aceptacion) ? frontmatter.criterios_aceptacion : []
  if (declared.length === 0) {
    const checkboxMatches = markdown.match(/-\s*\[\s*[xX ]\s*\]\s*\*\*CA\d+\*\*:/g)
    if (!checkboxMatches || checkboxMatches.length === 0) {
      return {
        name: "acceptance_criteria",
        description: "El spec debe tener al menos 1 criterio de aceptación con checkbox '**CA<n>**'",
        pass: false,
        details: "Falta frontmatter.criterios_aceptacion y no hay criterios con formato - [ ] **CA<n>** en sección 5."
      }
    }
    return {
      name: "acceptance_criteria",
      description: "El spec debe tener al menos 1 criterio de aceptación con checkbox '**CA<n>**'",
      pass: true,
      details: `OK (${checkboxMatches.length} criterios en sección 5, sin frontmatter)`
    }
  }
  const parsed = parseCriteriosV4(`dummy\n---\n${markdown}`)
  const declaredIds = new Set(declared.map((c: any) => c.id))
  const parsedIds = new Set(parsed.map((p) => p.id))
  const missing = [...declaredIds].filter((id) => !parsedIds.has(id))
  if (missing.length > 0) {
    return {
      name: "acceptance_criteria",
      description: "Los criterios del frontmatter deben aparecer en la sección 5 con formato '- [ ] **CA<n>**: ...'",
      pass: false,
      details: `Faltan en sección 5: ${missing.join(", ")}`
    }
  }
  return {
    name: "acceptance_criteria",
    description: "El spec debe tener al menos 1 criterio de aceptación con checkbox '**CA<n>**'",
    pass: true,
    details: `OK (${declared.length} criterios, declarados en frontmatter y presentes en sección 5)`
  }
}

function checkTestability(markdown: string): SpecCheck {
  const vagueWords = /\b(mejorar\s+un\s+poco|optimizar\s+si\s+se\s+puede|limpiar\s+en\s+general|mejor\s+experiencia)\b/gi
  const hasVague = vagueWords.test(markdown)
  return {
    name: "testability",
    description: "Los criterios deben ser objetivos y testeables (sin vaguedades)",
    pass: !hasVague,
    details: hasVague
      ? "Hay criterios vagos que no son testeables. Reformular como aserciones concretas."
      : "Criterios parecen testeables"
  }
}

function checkChangeNameInSpec(frontmatter: any): SpecCheck {
  const name = frontmatter?.change_name || ""
  const isGeneric = !name || /nuevo[-_]cambio/i.test(name)
  return {
    name: "change_name_specific",
    description: "El change_name no debe ser genérico",
    pass: !isGeneric,
    details: isGeneric
      ? "El spec usa 'nuevo-cambio' como nombre. Renombrar a algo descriptivo en kebab-case."
      : "Nombre del cambio parece descriptivo"
  }
}

function checkArchitectureDescription(markdown: string): SpecCheck {
  const section3 = SECTIONS.find((s) => s.n === 3)!
  const headerRegex = new RegExp(`^##\\s*3\\.\\s*${section3.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m")
  const match = markdown.match(headerRegex)
  if (!match) {
    return {
      name: "architecture",
      description: "El spec debe describir la arquitectura propuesta con suficiente detalle",
      pass: false,
      details: "Falta la sección 3 (Propuesta de Solución)"
    }
  }
  const after = markdown.split(headerRegex)[1] || ""
  const beforeNext = after.split(/^##\s*\d/m)[0] || ""
  const hasText = beforeNext.trim().length > 50
  return {
    name: "architecture",
    description: "El spec debe describir la arquitectura propuesta con suficiente detalle",
    pass: hasText,
    details: hasText ? "Sección 3 con suficiente detalle" : "Sección 3 demasiado corta (mínimo 50 caracteres)"
  }
}

function checkModoQaValid(frontmatter: any): SpecCheck {
  const modo = frontmatter?.modo_qa
  if (!modo) {
    return {
      name: "modo_qa_valid",
      description: "El frontmatter debe declarar modo_qa ∈ {automatizado, manual}",
      pass: false,
      details: "Falta el campo modo_qa en el frontmatter"
    }
  }
  const valid = modo === "automatizado" || modo === "manual"
  return {
    name: "modo_qa_valid",
    description: "El frontmatter debe declarar modo_qa ∈ {automatizado, manual}",
    pass: valid,
    details: valid ? `modo_qa: ${modo}` : `modo_qa inválido: ${modo}. Solo se permite 'automatizado' o 'manual'.`
  }
}

export default tool({
  description: `Validador de testeabilidad del spec (Fase 1.5). Lee el spec.md y verifica que cumpla las condiciones mínimas para que pueda derivarse en tests ejecutables. v4 unificado en español.
  
  Acciones:
  - "validate": Valida el spec y retorna lista de checks pass/fail.
  - "summary": Retorna un resumen ejecutivo del estado del spec.
  - "fix": Formatea y re-estructura automáticamente el spec al formato v4.
  - "init": Inicializa el spec usando la plantilla oficial v4.`,
  args: {
    action: tool.schema.enum(["validate", "summary", "fix", "init"])
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
    const { readLockfile } = await import("../_core/sdd_lock_manager.js")
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

    if (args.action === "init") {
      const dir = path.dirname(specPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const content = SPEC_TEMPLATE_V1
        .replace("<kebab-case>", changeName)
      fs.writeFileSync(specPath, content, "utf-8")
      return JSON.stringify({
        status: "SUCCESS",
        message: `✅ Spec inicializado con la plantilla v4 (unificada, en español) en: ${specPath}`,
        specPath,
        templateVersion: "v4"
      }, null, 2)
    }

    let spec = readSpec(specPath)
    if (!spec) {
      return JSON.stringify({
        status: "FAILED",
        reason: `No se encontró el spec en ${specPath}`
      }, null, 2)
    }

    const legacyParsed = parseLegacyFrontmatter(spec)
    const v4Parsed = parseFrontmatterV4(spec)
    const isV4 = isV4Spec(v4Parsed.frontmatter) || isV4Spec(legacyParsed.frontmatter)
    const frontmatter = (v4Parsed.frontmatter || legacyParsed.frontmatter) as SpecFrontmatter | any
    const markdown = v4Parsed.markdown || legacyParsed.markdown

    if (args.action === "fix") {
      let content = spec
      const usingV4 = isV4Spec(v4Parsed.frontmatter)
      const legacy = !usingV4 ? legacyParsed : { frontmatter: null, markdown }

      if (!usingV4) {
        const files: string[] = []
        const fileMatches = [...legacy.markdown.matchAll(/`([^`]+\.\w+)`\s*(?:\(?L[ií]neas?\s*\d+(?:-\d+)?\)?)?/gi)]
        for (const m of fileMatches) {
          const file = m[1]
          const linesMatch = m[0].match(/L[ií]neas?\s*(\d+(?:-\d+)?)/i)
          files.push(linesMatch ? `${file} (Líneas ${linesMatch[1]})` : file)
        }
        const criteriaMatches = [...legacy.markdown.matchAll(/-\s*\[\s*[xX ]\s*\]\s*\*\*(CA\d+)\*\*:\s*(.+)/g)]
        const criterios = criteriaMatches.map((m) => ({ id: m[1], descripcion: m[2].trim() }))
        if (criterios.length === 0) {
          const plainCheckboxes = [...legacy.markdown.matchAll(/-\s*\[\s*[xX ]\s*\]\s*(.+)/g)]
          plainCheckboxes.forEach((m, idx) => {
            criterios.push({ id: `CA${idx + 1}`, descripcion: m[1].trim() })
          })
        }
        const yamlHeader = [
          "---",
          `spec_version: "1.0"`,
          `change_name: "${frontmatter?.change_name || changeName}"`,
          `modo_qa: "automatizado"`,
          `design_skill: "${frontmatter?.design_skill || "ninguna"}"`,
          `base_framework: "${frontmatter?.base_framework || "ninguno"}"`,
          `ui_framework: "${frontmatter?.ui_framework || "ninguno"}"`,
          "archivos_afectados:",
          ...(files.length > 0 ? files.map((f) => `  - "${f}"`) : ["  - \"src/\""]),
          "criterios_aceptacion:",
          ...(criterios.length > 0
            ? criterios.map((c) => `  - id: "${c.id}"\n    descripcion: "${c.descripcion.replace(/"/g, "'")}"`)
            : ["  - id: \"CA1\"\n    descripcion: \"Criterio de aceptación\""]),
          "---",
          ""
        ].join("\n")
        content = yamlHeader + legacy.markdown
      }

      const reparsed = parseFrontmatterV4(content)
      let fm = reparsed.frontmatter
      let md = reparsed.markdown

      if (!fm?.modo_qa) {
        content = content.replace(/^(---\n[\s\S]*?)(---)/m, `$1modo_qa: "automatizado"\n$2`)
      }

      if (!md.includes(`# ${SPEC_TITLE}`)) {
        const cleaned = md.replace(/^#\s+.+?\n/, "")
        md = `# ${SPEC_TITLE}\n` + cleaned
      }

      const sectionsPresent = new Set<number>()
      for (const sec of SECTIONS) {
        const re = new RegExp(`^##\\s*${sec.n}\\.\\s*`, "m")
        if (re.test(md)) sectionsPresent.add(sec.n)
      }
      const missing = SECTIONS.filter((s) => !sectionsPresent.has(s.n))
      if (missing.length > 0) {
        for (const sec of missing) {
          const headerRegex = new RegExp(`^##\\s*${sec.n}\\.\\s*.*$`, "m")
          if (headerRegex.test(md)) {
            md = md.replace(headerRegex, `## ${sec.n}. ${sec.title}`)
          }
        }
      }

      const strictTitleRe = (n: number, t: string) =>
        new RegExp(`^##\\s*${n}\\.\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m")
      for (const sec of SECTIONS) {
        const re = new RegExp(`^##\\s*${sec.n}\\.\\s*.+$`, "gm")
        md = md.replace(re, (match) => {
          if (strictTitleRe(sec.n, sec.title).test(match)) return match
          return `## ${sec.n}. ${sec.title}`
        })
      }

      md = md.replace(/(?<![\(\w])(L[ií]neas?\s+\d+(?:-\d+)?|L\d+-\d+|L\d+)(?![\w\)])/gi, "($1)") // eslint-disable-line no-useless-escape

      md = md.replace(/(?<=^|\n)\s*Given\s+/g, "Dado ")
      md = md.replace(/(?<=^|\n)\s*When\s+/g, "Cuando ")
      md = md.replace(/(?<=^|\n)\s*Then\s+/g, "Entonces ")
      md = md.replace(/(?<=^|\n)\s*And\s+/g, "Y ")

      const finalFmMatch = content.match(/^---\r?\n[\s\S]*?\r?\n---/)
      const yamlHeaderFinal = finalFmMatch ? finalFmMatch[0] + "\n" : ""
      content = yamlHeaderFinal + md
      fs.writeFileSync(specPath, content, "utf-8")
      spec = content
      const postFixValidation = validateSpec(spec)
      const fixVerdict = postFixValidation.ok ? "APPROVED" : "REJECTED"
      const fixStatus = postFixValidation.ok ? "SUCCESS" : "FAILED"
      return JSON.stringify({
        status: fixStatus,
        verdict: fixVerdict,
        message: postFixValidation.ok
          ? `✅ Spec migrado al formato v4 (español unificado) y validado en: ${specPath}`
          : `⚠️ Spec migrado al formato v4 pero aún tiene ${postFixValidation.errors.length} errores. Revisar manualmente en: ${specPath}`,
        specPath,
        remaining_errors: postFixValidation.ok ? [] : postFixValidation.errors
      }, null, 2)
    }

    if (isV4) {
      const strictResult = validateSpec(spec)
      if (!strictResult.ok) {
        const failedNames = strictResult.errors.map((e) => e.rule).filter((v, i, a) => a.indexOf(v) === i)
        return JSON.stringify({
          status: "FAILED",
          verdict: "REJECTED",
          score: `0/1`,
          spec_path: specPath,
          message: `❌ Spec v4 rechazado: ${strictResult.errors.length} reglas inmutables violadas.`,
          errors: strictResult.errors,
          failed_rules: failedNames,
          failed_checks: strictResult.errors.map((e) => ({ name: e.rule, details: e.message }))
        }, null, 2)
      }
    }

    const checks: SpecCheck[] = [
      checkHasTitle(markdown),
      checkStrictTitlesV4(markdown),
      checkBddSpanishOnly(markdown),
      checkAcceptanceCriteria(frontmatter, markdown),
      checkTestability(markdown),
      checkChangeNameInSpec(frontmatter),
      checkArchitectureDescription(markdown),
      checkModoQaValid(frontmatter)
    ]

    const passed = checks.filter((c) => c.pass).length
    const failed = checks.filter((c) => !c.pass)
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
        ? "✅ Spec aprobado. Cumple todos los requisitos del template v4 (unificado, en español)."
        : `❌ Spec rechazado. ${failed.length} checks fallaron. Volver a F1.`,
      failed_checks: failed.map((c) => ({ name: c.name, details: c.details }))
    }, null, 2)
  }
})
