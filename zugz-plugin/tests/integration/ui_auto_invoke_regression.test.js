import { describe, test, expect } from "vitest"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ZUGZBOT_PATH = path.resolve(__dirname, "../../agents/zugzbot.md")
const BUILDER_PATH = path.resolve(__dirname, "../../agents/f2-green-builder.md")
const SKILL_PATH = path.resolve(__dirname, "../../skills/sdd-design-system/SKILL.md")
const FRONT_CMD_PATH = path.resolve(__dirname, "../../commands/front.md")

const UI_DETECTION_REGEX = /\b(crear|armar|hacer|haz|hazme|construir|implementar|maquetar|diseñar|generar|agrega|agregar|suma|añade|anade|hazle)\b.*\b(front|frontend|UI|landing|dashboard|componente|componentes|vista|página|pagina|formulario|modal|navbar|footer|card|bot[oó]n|tabla|hero|sección|seccion|galer[í]a)\b/i

describe("Regresión: zugzbot §1.5 auto-invoca el skill (no pide permiso)", () => {
  const raw = fs.readFileSync(ZUGZBOT_PATH, "utf-8")

  test("existe la sección §1.5 de detección de UI", () => {
    expect(raw).toMatch(/### 1\.5.*[Dd]etecci[oó]n.*UI/)
  })

  test("la sección §1.5 contiene la regex de detección de UI", () => {
    expect(raw).toMatch(/\bcrear\b.*\bfront\b|\bcrear\b.*\bcomponente\b/i)
  })

  test("la sección §1.5 indica auto-invocar el skill (sin pedir permiso)", () => {
    // Extraemos el bloque §1.5 para no contaminar con otras secciones
    const sectionStart = raw.indexOf("### 1.5")
    const sectionEnd = raw.indexOf("### 2.", sectionStart)
    const section = raw.slice(sectionStart, sectionEnd > 0 ? sectionEnd : undefined)
    expect(section).toMatch(/auto.?invoc/i)
    expect(section).toContain('skill({ name: "sdd-design-system" })')
  })

  test("la sección §1.5 NO contiene frases de pedido de permiso tipo '¿querés que lo invoque?'", () => {
    const sectionStart = raw.indexOf("### 1.5")
    const sectionEnd = raw.indexOf("### 2.", sectionStart)
    const section = raw.slice(sectionStart, sectionEnd > 0 ? sectionEnd : undefined)
    expect(section).not.toMatch(/¿querés.*invoqu|querés que lo invoque/i)
    expect(section).not.toMatch(/\[\[S\/N\]\]/i)
  })

  test("la sección §1.5 menciona el flag design_system_explicitly_skipped", () => {
    const sectionStart = raw.indexOf("### 1.5")
    const sectionEnd = raw.indexOf("### 2.", sectionStart)
    const section = raw.slice(sectionStart, sectionEnd > 0 ? sectionEnd : undefined)
    expect(section).toContain("design_system_explicitly_skipped")
  })

  test("la sección §1.5 referencia el comando /front como alias", () => {
    const sectionStart = raw.indexOf("### 1.5")
    const sectionEnd = raw.indexOf("### 2.", sectionStart)
    const section = raw.slice(sectionStart, sectionEnd > 0 ? sectionEnd : undefined)
    expect(section).toMatch(/\/front/)
  })
})

describe("Regresión: regex de detección de UI funciona contra prompts reales", () => {
  test.each([
    ["crear landing de pricing", true],
    ["armar dashboard admin", true],
    ["implementar componente Button", true],
    ["hazme un modal de confirmación", true],
    ["construir página de checkout", true],
    ["agrega un endpoint POST /api/logout", false],
    ["refactoriza el handler de auth", false],
    ["arregla el bug en el cálculo de descuentos", false],
    ["agrega una vista de perfil de usuario", true],
    ["crea un test para la función calculateDiscount", false]
  ])('prompt "%s" → UI detectada: %s', (prompt, expected) => {
    expect(UI_DETECTION_REGEX.test(prompt)).toBe(expected)
  })
})

describe("Regresión: f2-green-builder honra el flag de skip", () => {
  const raw = fs.readFileSync(BUILDER_PATH, "utf-8")

  test("el builder menciona design_system_explicitly_skipped", () => {
    expect(raw).toContain("design_system_explicitly_skipped")
  })

  test("el builder procederá (no rechaza) cuando skip=true", () => {
    const builderSection = raw.slice(raw.indexOf("### 1.5"))
    expect(builderSection).toMatch(/procede|proceder|ad-hoc/i)
    expect(builderSection).toMatch(/warning|advertencia/i)
  })

  test("el builder rechaza cuando ni set ni skip (estado uninitialized)", () => {
    const builderSection = raw.slice(raw.indexOf("### 1.5"))
    expect(builderSection).toMatch(/rechaz|RECHAZ/i)
  })
})

describe("Regresión: SKILL.md incluye la opción 'skip' en el picker", () => {
  const raw = fs.readFileSync(SKILL_PATH, "utf-8")

  test("el picker lista una opción 11 (skip) o equivalente", () => {
    expect(raw).toMatch(/\(?skip\)?/i)
  })

  test("el skill instruye usar la acción skip_design_system", () => {
    expect(raw).toContain("skip_design_system")
  })

  test("el skill NO pide permiso al Orquestador — la pregunta ES el trabajo del skill", () => {
    // El skill debe afirmar que su trabajo es preguntar (no pedir permiso para preguntar)
    expect(raw).toMatch(/el\s+prompt/i)
    expect(raw).toMatch(/la pregunta al usuario\s+es\s+tu trabajo|pregunta al usuario/i)
  })
})

describe("Regresión: /front command es alias del mismo flujo", () => {
  const raw = fs.readFileSync(FRONT_CMD_PATH, "utf-8")

  test("invoca el skill sdd-design-system", () => {
    expect(raw).toContain("sdd-design-system")
  })

  test("es coherente con el flujo del Orquestador (no contradice la auto-invocación)", () => {
    // El comando /front NO debe decir "primero corré /front y después…" — debe ser
    // un atajo al mismo skill.
    expect(raw).not.toMatch(/despu[eé]s.*\/front|primero.*\/front/i)
  })
})
