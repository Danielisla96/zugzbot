import { describe, test, expect } from "vitest"
import {
  SPEC_TEMPLATE_V1,
  SECTIONS,
  parseFrontmatter,
  parseCriterios,
  matchBddScenarios,
  validateSpec
} from "../../.opencode/tools/sdd_spec_template.js"

const VALID_SPEC = `---
spec_version: "1.0"
change_name: "agregar-validacion-email"
modo_qa: "automatizado"
design_skill: "ninguna"
archivos_afectados:
  - "src/validators.ts (Líneas 10-35)"
criterios_aceptacion:
  - id: "CA1"
    descripcion: "validateEmail retorna true para user@example.com"
  - id: "CA2"
    descripcion: "validateEmail retorna false para not-an-email"
---

# Especificación Técnica del Cambio

## 1. Diagnóstico y Archivos Afectados
- \`src/validators.ts\` (Líneas 10-35): agregar función validateEmail

## 2. Consenso con el Usuario
- **Pregunta A**: Decisión: usar regex RFC 5322 simplificado.

## 3. Propuesta de Solución
Función pura validateEmail(email: string): boolean que retorna true si el email es válido sintácticamente.

## 4. Especificaciones de Comportamiento (BDD)
Escenario: Email válido
  Dado un email "user@example.com"
  Cuando valido con validateEmail
  Entonces retorna true

Escenario: Email inválido
  Dado un email "not-an-email"
  Cuando valido con validateEmail
  Entonces retorna false

## 5. Criterios de Aceptación
- [ ] **CA1**: validateEmail retorna true para "user@example.com"
- [ ] **CA2**: validateEmail retorna false para "not-an-email"
`

describe("sdd_spec_template v4", () => {
  describe("SPEC_TEMPLATE_V1", () => {
    test("R0: exporta exactamente el template v4 con frontmatter v1.0", () => {
      expect(SPEC_TEMPLATE_V1).toContain('spec_version: "1.0"')
      expect(SPEC_TEMPLATE_V1).toContain('modo_qa: "automatizado"')
      expect(SPEC_TEMPLATE_V1).toContain("# Especificación Técnica del Cambio")
      expect(SPEC_TEMPLATE_V1).toContain("## 1. Diagnóstico y Archivos Afectados")
      expect(SPEC_TEMPLATE_V1).toContain("## 5. Criterios de Aceptación")
      expect(SPEC_TEMPLATE_V1).toContain("Dado")
      expect(SPEC_TEMPLATE_V1).toContain("Cuando")
      expect(SPEC_TEMPLATE_V1).toContain("Entonces")
    })
  })

  describe("SECTIONS", () => {
    test("R10: exporta exactamente 5 secciones, ninguna más", () => {
      expect(SECTIONS.length).toBe(5)
      expect(SECTIONS.map(s => s.n)).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe("parseFrontmatter", () => {
    test("extrae YAML del bloque ---", () => {
      const { frontmatter, markdown } = parseFrontmatter(VALID_SPEC)
      expect(frontmatter).toBeTruthy()
      expect(frontmatter.change_name).toBe("agregar-validacion-email")
      expect(frontmatter.modo_qa).toBe("automatizado")
      expect(markdown).toContain("# Especificación Técnica del Cambio")
      expect(markdown).not.toContain("---")
    })

    test("retorna frontmatter=null si no hay bloque ---", () => {
      const noFM = "# Especificación\n\n## 1. Diagnóstico\nfoo"
      const { frontmatter, markdown } = parseFrontmatter(noFM)
      expect(frontmatter).toBeNull()
      expect(markdown).toBe(noFM)
    })
  })

  describe("validateSpec — reglas inmutables", () => {
    test("R1: rechaza spec sin frontmatter", () => {
      const noFM = "# Especificación Técnica del Cambio\n\n## 1. Diagnóstico y Archivos Afectados\nfoo"
      const result = validateSpec(noFM)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.rule === "R1")).toBe(true)
    })

    test("R2: rechaza títulos de sección modificados (sufijo 'y Calidad (QA)')", () => {
      const mutated = VALID_SPEC.replace(
        "## 5. Criterios de Aceptación",
        "## 5. Criterios de Aceptación y Calidad (QA)"
      )
      const result = validateSpec(mutated)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.rule === "R2")).toBe(true)
    })

    test("R3: rechaza BDD en inglés (Given/When/Then)", () => {
      const englishBdd = VALID_SPEC
        .replace("Dado un email", "Given an email")
        .replace("Cuando valido", "When I validate")
        .replace("Entonces retorna", "Then it returns")
      const result = validateSpec(englishBdd)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.rule === "R3")).toBe(true)
    })

    test("R3b: acepta BDD en español (Dado/Cuando/Entonces)", () => {
      const result = validateSpec(VALID_SPEC)
      expect(result.ok).toBe(true)
    })

    test("R4: rechaza IDs de criterio duplicados", () => {
      const dup = `---
spec_version: "1.0"
change_name: "test"
modo_qa: "automatizado"
design_skill: "ninguna"
archivos_afectados:
  - "src/foo.ts"
criterios_aceptacion:
  - id: "CA1"
    descripcion: "primero"
  - id: "CA1"
    descripcion: "duplicado"
---

# Especificación Técnica del Cambio

## 1. Diagnóstico y Archivos Afectados
x

## 2. Consenso con el Usuario
x

## 3. Propuesta de Solución
x

## 4. Especificaciones de Comportamiento (BDD)
Escenario: foo
  Dado x
  Cuando y
  Entonces z

## 5. Criterios de Aceptación
- [ ] **CA1**: primero
- [ ] **CA1**: duplicado
`
      const result = validateSpec(dup)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.rule === "R4")).toBe(true)
    })

    test("R5: rechaza criterios huérfanos (sección 5 con item no declarado en frontmatter)", () => {
      const orphan = VALID_SPEC.replace(
        "- [ ] **CA2**: validateEmail retorna false",
    "- [ ] **CA99**: criterio inventado no declarado"
      )
      const result = validateSpec(orphan)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.rule === "R5")).toBe(true)
    })

    test("R6: rechaza modo_qa con valor inválido", () => {
      const bad = VALID_SPEC.replace('modo_qa: "automatizado"', 'modo_qa: "raro"')
      const result = validateSpec(bad)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.rule === "R6")).toBe(true)
    })

    test("R7: rechaza flags desconocidos en criterios (ej [e2e], [QA Manual])", () => {
      const withE2E = VALID_SPEC.replace(
        "- [ ] **CA2**: validateEmail retorna false para \"not-an-email\"",
        "- [ ] **CA2**: [e2e] validateEmail retorna false para \"not-an-email\""
      )
      const result = validateSpec(withE2E)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.rule === "R7")).toBe(true)
    })

    test("R7b: acepta flag [manual] por criterio", () => {
      const withManual = VALID_SPEC.replace(
        "- [ ] **CA2**: validateEmail retorna false para \"not-an-email\"",
        "- [ ] **CA2**: [manual] Validar visualmente emails con caracteres Unicode"
      )
      const result = validateSpec(withManual)
      expect(result.ok).toBe(true)
    })

    test("R10: rechaza secciones top-level extra (## 6. ...) ", () => {
      const extra = VALID_SPEC.replace(
        "## 5. Criterios de Aceptación",
        "## 5. Criterios de Aceptación\n\n## 6. Anexo"
      )
      const result = validateSpec(extra)
      expect(result.ok).toBe(false)
      expect(result.errors.some(e => e.rule === "R10")).toBe(true)
    })

    test("acepta spec válido completo", () => {
      const result = validateSpec(VALID_SPEC)
      expect(result.ok).toBe(true)
      expect(result.errors).toEqual([])
    })
  })

  describe("parseCriterios", () => {
    test("extrae CA1/CA2/CA3 con descripciones limpias", () => {
      const criterios = parseCriterios(VALID_SPEC)
      expect(criterios.length).toBe(2)
      expect(criterios[0].id).toBe("CA1")
      expect(criterios[0].descripcion).toContain("validateEmail retorna true")
      expect(criterios[0].manual).toBe(false)
    })

    test("detecta flag [manual] en descripción", () => {
      const manualSpec = VALID_SPEC.replace(
        "- [ ] **CA2**: validateEmail retorna false para \"not-an-email\"",
        "- [ ] **CA2**: [manual] Validar en navegador real"
      )
      const criterios = parseCriterios(manualSpec)
      expect(criterios[1].manual).toBe(true)
    })
  })

  describe("matchBddScenarios", () => {
    test("extrae escenarios con pasos Dado/Cuando/Entonces", () => {
      const scenarios = matchBddScenarios(VALID_SPEC)
      expect(scenarios.length).toBe(2)
      expect(scenarios[0].titulo).toBe("Email válido")
      expect(scenarios[0].pasos).toContain("Dado un email \"user@example.com\"")
      expect(scenarios[0].pasos).toContain("Cuando valido con validateEmail")
      expect(scenarios[0].pasos).toContain("Entonces retorna true")
    })

    test("retorna [] si no hay escenarios", () => {
      const noBdd = VALID_SPEC.replace(/Escenario:[\s\S]*?(?=## 5|$)/, "")
      const scenarios = matchBddScenarios(noBdd)
      expect(scenarios).toEqual([])
    })
  })
})
