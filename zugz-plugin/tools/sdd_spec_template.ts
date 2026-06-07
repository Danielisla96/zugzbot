import { SECTIONS, SPEC_TITLE, type SpecSection } from "./sdd_spec_sections.js"

export { SECTIONS, SPEC_TITLE }
export type { SpecSection }

export interface SpecFrontmatter {
  spec_version: string
  change_name: string
  modo_qa: "automatizado" | "manual"
  design_skill: string
  archivos_afectados: string[]
  criterios_aceptacion: Array<{
    id: string
    descripcion: string
  }>
}

export interface BddScenario {
  titulo: string
  pasos: string[]
}

export interface CriterioParsed {
  id: string
  descripcion: string
  manual: boolean
  original: string
}

export interface ValidationError {
  rule: string
  message: string
  line?: number
}

export interface ValidationResult {
  ok: boolean
  errors: ValidationError[]
}

const BDD_KEYWORDS_ES = ["Dado", "Cuando", "Entonces", "Y"]
const BDD_KEYWORDS_EN = ["Given", "When", "Then", "And"]
const VALID_BYPASS_FLAGS = ["[manual]"]
const VALID_MODOS_QA = ["automatizado", "manual"]

export const SPEC_TEMPLATE_V1 = `---
spec_version: "1.0"
change_name: "<kebab-case>"
modo_qa: "automatizado"
design_skill: "ninguna"
archivos_afectados:
  - "ruta/archivo.ext (Líneas 10-35)"
criterios_aceptacion:
  - id: "CA1"
    descripcion: "Descripción testeable del criterio"
  - id: "CA2"
    descripcion: "Otra condición verificable"
---

# ${SPEC_TITLE}

## 1. ${SECTIONS[0].title}
[Diagnóstico del problema y lista de archivos afectados con rangos de líneas]

## 2. ${SECTIONS[1].title}
[Decisiones y aclaraciones con el usuario]

## 3. ${SECTIONS[2].title}
[Arquitectura y diseño técnico de la solución]

## 4. ${SECTIONS[3].title}
Escenario: <título descriptivo>
  Dado <contexto inicial>
  Cuando <acción que realiza el usuario o sistema>
  Entonces <resultado observable>
  Y <continuación opcional>

## 5. ${SECTIONS[4].title}
- [ ] **CA1**: Descripción testeable del criterio
- [ ] **CA2**: Otra condición verificable
`

export function parseFrontmatter(spec: string): { frontmatter: SpecFrontmatter | null; markdown: string } {
  const match = spec.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { frontmatter: null, markdown: spec }

  const yamlText = match[1]
  const markdown = match[2]

  const lines = yamlText.split(/\r?\n/)
  const frontmatter: any = {}
  let currentKey = ""
  let inArrayItem = false
  let currentObject: any = null

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "")
    if (!line.trim() || line.trim().startsWith("#")) continue

    const objItemMatch = line.match(/^\s+-\s+id:\s*"?([^"]+)"?\s*$/)
    if (objItemMatch) {
      if (currentObject && Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey].push(currentObject)
      }
      currentKey = "criterios_aceptacion"
      currentObject = { id: objItemMatch[1] }
      inArrayItem = true
      if (!Array.isArray(frontmatter[currentKey])) frontmatter[currentKey] = []
      continue
    }

    const objFieldMatch = line.match(/^\s+(id|descripcion):\s*"?([^"]*)"?\s*$/)
    if (objFieldMatch && inArrayItem && currentObject) {
      currentObject[objFieldMatch[1]] = objFieldMatch[2]
      continue
    }

    const arrItemMatch = line.match(/^\s+-\s+"?([^"]+)"?\s*$/)
    if (arrItemMatch) {
      if (currentObject) {
        if (Array.isArray(frontmatter[currentKey])) {
          frontmatter[currentKey].push(currentObject)
        }
        currentObject = null
        inArrayItem = false
      }
      if (!Array.isArray(frontmatter[currentKey])) frontmatter[currentKey] = []
      frontmatter[currentKey].push(arrItemMatch[1])
      continue
    }

    const colonIdx = line.indexOf(":")
    if (colonIdx !== -1) {
      if (currentObject) {
        if (Array.isArray(frontmatter[currentKey])) {
          frontmatter[currentKey].push(currentObject)
        }
        currentObject = null
        inArrayItem = false
      }
      const key = line.slice(0, colonIdx).trim()
      let val: any = line.slice(colonIdx + 1).trim()
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1)
      }
      currentKey = key
      if (val === "" || val === "[]") {
        frontmatter[key] = []
      } else {
        frontmatter[key] = val
      }
    }
  }

  if (currentObject && Array.isArray(frontmatter[currentKey])) {
    frontmatter[currentKey].push(currentObject)
  }

  return { frontmatter: frontmatter as SpecFrontmatter, markdown }
}

export function parseCriterios(spec: string): CriterioParsed[] {
  const { markdown } = parseFrontmatter(spec)
  const out: CriterioParsed[] = []
  let inSection = false
  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (new RegExp(`^##\\s*5\\.\\s*${SECTIONS[4].title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(trimmed)) {
      inSection = true
      continue
    }
    if (inSection && trimmed.startsWith("##")) break
    if (!inSection) continue

    const m = trimmed.match(/^-\s*\[\s*[xX ]\s*\]\s*\*\*(CA\d+)\*\*:\s*(.+)$/)
    if (!m) continue
    const id = m[1]
    let desc = m[2].trim()
    let manual = false
    for (const flag of VALID_BYPASS_FLAGS) {
      const flagRegex = new RegExp(`${flag.replace(/[[\]]/g, "\\$&")}\\s*`, "i") // eslint-disable-line no-useless-escape
      if (flagRegex.test(desc)) {
        manual = true
        desc = desc.replace(flagRegex, "").trim()
        break
      }
    }
    out.push({ id, descripcion: desc, manual, original: trimmed })
  }
  return out
}

export function matchBddScenarios(spec: string): BddScenario[] {
  const { markdown } = parseFrontmatter(spec)
  const out: BddScenario[] = []
  let currentTitulo = ""
  let currentPasos: string[] = []
  const sectionRegex = new RegExp(`^##\\s*4\\.\\s*${SECTIONS[3].title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
  let inSection = false

  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (sectionRegex.test(trimmed)) {
      inSection = true
      continue
    }
    if (inSection && trimmed.startsWith("##")) break
    if (!inSection) continue

    const escenarioMatch = trimmed.match(/^Escenario:\s*(.+)$/i)
    if (escenarioMatch) {
      if (currentTitulo) {
        out.push({ titulo: currentTitulo, pasos: currentPasos })
      }
      currentTitulo = escenarioMatch[1].trim()
      currentPasos = []
      continue
    }

    if (currentTitulo) {
      for (const kw of BDD_KEYWORDS_ES) {
        if (trimmed.startsWith(kw + " ")) {
          currentPasos.push(trimmed)
          break
        }
      }
    }
  }

  if (currentTitulo) {
    out.push({ titulo: currentTitulo, pasos: currentPasos })
  }
  return out
}

export function validateSpec(spec: string): ValidationResult {
  const errors: ValidationError[] = []

  const { frontmatter, markdown } = parseFrontmatter(spec)
  if (!frontmatter) {
    errors.push({
      rule: "R1",
      message: "Falta el frontmatter YAML (delimitado por ---). El spec debe iniciar con un bloque YAML con spec_version, change_name, modo_qa, design_skill, archivos_afectados y criterios_aceptacion."
    })
    return { ok: false, errors }
  }

  if (!markdown.includes(`# ${SPEC_TITLE}`)) {
    errors.push({
      rule: "R2",
      message: `Falta el título exacto '# ${SPEC_TITLE}'.`
    })
  }

  for (const section of SECTIONS) {
    const sectionHeaderRegex = new RegExp(`^##\\s*${section.n}\\.\\s*${section.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m")
    if (!sectionHeaderRegex.test(markdown)) {
      errors.push({
        rule: "R2",
        message: `Falta la sección ${section.n}: '## ${section.n}. ${section.title}' (título exacto, sin sufijos).`
      })
    }
  }

  const extraSectionMatch = markdown.match(/^##\s*(\d+)\.\s+(.+)$/gm)
  if (extraSectionMatch) {
    for (const line of extraSectionMatch) {
      const m = line.match(/^##\s*(\d+)\.\s+(.+)$/)
      if (!m) continue
      const n = parseInt(m[1], 10)
      const title = m[2].trim()
      const isValid = SECTIONS.some(s => s.n === n && s.title === title)
      if (!isValid) {
        errors.push({
          rule: "R10",
          message: `Sección inválida detectada: '## ${n}. ${title}'. Solo se permiten las 5 secciones oficiales del template v4.`
        })
        break
      }
    }
  }

  const criterios = parseCriterios(spec)
  const declaredIds = new Set<string>()
  if (Array.isArray(frontmatter.criterios_aceptacion)) {
    for (const c of frontmatter.criterios_aceptacion) {
      if (declaredIds.has(c.id)) {
        errors.push({
          rule: "R4",
          message: `ID de criterio duplicado en frontmatter: '${c.id}'. Los IDs deben ser únicos.`
        })
      }
      declaredIds.add(c.id)
    }
  }

  for (const crit of criterios) {
    if (!declaredIds.has(crit.id)) {
      errors.push({
        rule: "R5",
        message: `Criterio '${crit.id}' en la sección 5 no está declarado en frontmatter.criterios_aceptacion.`
      })
    }
    const lowerDesc = crit.descripcion.toLowerCase()
    for (const flag of ["[e2e]", "[qa manual]"]) {
      if (lowerDesc.includes(flag)) {
        errors.push({
          rule: "R7",
          message: `Criterio '${crit.id}' usa el flag '${flag}' que ya no es válido. Solo se permite '[manual]' por criterio.`
        })
      }
    }
  }

  if (Array.isArray(frontmatter.criterios_aceptacion)) {
    for (const c of frontmatter.criterios_aceptacion) {
      const seccion5 = criterios.find(x => x.id === c.id)
      if (!seccion5) {
        errors.push({
          rule: "R5",
          message: `Criterio '${c.id}' declarado en frontmatter pero no presente en la sección 5 con formato '- [ ] **${c.id}**: ...'.`
        })
      }
    }
  }

  if (frontmatter.modo_qa && !VALID_MODOS_QA.includes(frontmatter.modo_qa)) {
    errors.push({
      rule: "R6",
      message: `modo_qa inválido: '${frontmatter.modo_qa}'. Valores permitidos: ${VALID_MODOS_QA.join(", ")}.`
    })
  }

  const scenarios = matchBddScenarios(spec)
  const section4Regex = new RegExp(`^##\\s*4\\.\\s*${SECTIONS[3].title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([\\s\\S]*?)(?=^##\\s*5\\.)`, "m")
  const section4Match = markdown.match(section4Regex)
  const section4Content = section4Match ? section4Match[1] : ""

  const hasEnglishInBdd = BDD_KEYWORDS_EN.some((kw) => {
    const re = new RegExp(`^\\s*${kw}\\s+`, "im")
    return re.test(section4Content)
  })

  if (scenarios.length === 0) {
    errors.push({
      rule: "R3",
      message: "No se encontraron escenarios BDD con la cláusula 'Escenario:' en la sección 4."
    })
  } else {
    for (const sc of scenarios) {
      if (sc.pasos.length === 0) {
        errors.push({
          rule: "R3",
          message: `El escenario '${sc.titulo}' no tiene pasos Dado/Cuando/Entonces.`
        })
        continue
      }
      const allEnglish = sc.pasos.every(p =>
        BDD_KEYWORDS_EN.some(kw => p.startsWith(kw + " "))
      )
      const anyEnglish = sc.pasos.some(p =>
        BDD_KEYWORDS_EN.some(kw => p.startsWith(kw + " "))
      )
      if (anyEnglish && !allEnglish) {
        errors.push({
          rule: "R3",
          message: `Mezcla de keywords ES/EN en escenario '${sc.titulo}'. Solo se permiten: ${BDD_KEYWORDS_ES.join(", ")}.`
        })
      } else if (allEnglish || hasEnglishInBdd) {
        errors.push({
          rule: "R3",
          message: `Se detectaron keywords BDD en inglés (Given/When/Then/And) en la sección 4. El spec v4 requiere español: ${BDD_KEYWORDS_ES.join(", ")}.`
        })
        break
      }
    }
  }

  return { ok: errors.length === 0, errors }
}
