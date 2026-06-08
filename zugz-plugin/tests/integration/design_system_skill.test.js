import { describe, test, expect } from "vitest"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { DESIGN_SYSTEM_SLUGS } from "../../.opencode/tools/sdd_lock_manager.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SKILL_DIR = path.resolve(__dirname, "../../skills/sdd-design-system")
const CATALOG_PATH = path.join(SKILL_DIR, "catalog.md")
const SKILL_MD_PATH = path.join(SKILL_DIR, "SKILL.md")

describe("sdd-design-system skill — estructura", () => {
  test("existe la carpeta del skill", () => {
    expect(fs.existsSync(SKILL_DIR)).toBe(true)
  })

  test("existe SKILL.md con frontmatter válido", () => {
    expect(fs.existsSync(SKILL_MD_PATH)).toBe(true)
    const raw = fs.readFileSync(SKILL_MD_PATH, "utf-8")
    expect(raw.startsWith("---")).toBe(true)
    const fmEnd = raw.indexOf("\n---", 3)
    expect(fmEnd).toBeGreaterThan(3)
    const frontmatter = raw.slice(0, fmEnd)
    expect(frontmatter).toMatch(/^name:\s*sdd-design-system\s*$/m)
    expect(frontmatter).toMatch(/^description:\s*.+/m)
  })

  test("existe catalog.md con tabla de los 11 design systems", () => {
    expect(fs.existsSync(CATALOG_PATH)).toBe(true)
    const raw = fs.readFileSync(CATALOG_PATH, "utf-8")
    for (const slug of DESIGN_SYSTEM_SLUGS) {
      expect(raw).toContain(slug)
    }
  })

  test("SKILL.md referencia el catálogo", () => {
    const raw = fs.readFileSync(SKILL_MD_PATH, "utf-8")
    expect(raw).toContain("catalog.md")
  })

  test("SKILL.md menciona todos los slugs en el flujo de selección", () => {
    const raw = fs.readFileSync(SKILL_MD_PATH, "utf-8")
    for (const slug of DESIGN_SYSTEM_SLUGS) {
      expect(raw).toContain(slug)
    }
  })

  test("SKILL.md instruye persistir active_design_system en lockfile", () => {
    const raw = fs.readFileSync(SKILL_MD_PATH, "utf-8")
    expect(raw).toContain("active_design_system")
    expect(raw).toContain("sdd_lock_manager")
  })

  test("SKILL.md tiene sección SANTUARIO con reglas estrictas", () => {
    const raw = fs.readFileSync(SKILL_MD_PATH, "utf-8")
    expect(raw).toMatch(/SANTUARIO/i)
    expect(raw).toMatch(/hardcoded|hard-coded/i)
  })
})

describe("sdd-design-system skill — coherencia con DESIGN-*.md reales", () => {
  // design/ ahora vive DENTRO de zugz-plugin/ (movido en v2.1.0 para shippear
  // con el paquete npm y ser copiado al proyecto del usuario por el instalador).
  const designDir = path.resolve(__dirname, "../../design")
  const designFiles = fs.existsSync(designDir)
    ? fs.readdirSync(designDir).filter(f => f.startsWith("DESIGN-") && f.endsWith(".md"))
    : []

  test("la carpeta design/ existe DENTRO de zugz-plugin/ (para shippear con npm)", () => {
    expect(fs.existsSync(designDir)).toBe(true)
  })

  test("hay al menos 11 archivos DESIGN-*.md (uno por slug del catálogo)", () => {
    expect(designFiles.length).toBeGreaterThanOrEqual(11)
  })

  test("los 11 slugs del catálogo tienen un DESIGN-<slug>.md correspondiente", () => {
    if (designFiles.length === 0) return
    for (const slug of DESIGN_SYSTEM_SLUGS) {
      const candidates = [
        `DESIGN-${slug}.md`,
        `DESIGN-${slug.replace(/\./g, "-")}.md`
      ]
      const found = candidates.some(c => designFiles.includes(c))
      expect(found, `falta DESIGN-${slug}.md en zugz-plugin/design/`).toBe(true)
    }
  })
})

describe("design/ — está dentro de zugz-plugin/ y listada en package.json", () => {
  const pluginRoot = path.resolve(__dirname, "../..")
  const designInside = path.join(pluginRoot, "design")
  const packageJson = JSON.parse(fs.readFileSync(path.join(pluginRoot, "package.json"), "utf-8"))

  test("design/ está físicamente en zugz-plugin/", () => {
    expect(fs.existsSync(designInside)).toBe(true)
  })

  test("design/ está incluida en el campo 'files' de package.json (para npm)", () => {
    expect(packageJson.files).toBeDefined()
    expect(packageJson.files).toContain("design/")
  })
})
