import { describe, test, expect } from "vitest"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COMMANDS_DIR = path.resolve(__dirname, "../../commands")
const FRONT_CMD_PATH = path.join(COMMANDS_DIR, "front.md")

describe("commands/front.md — estructura", () => {
  test("el archivo existe", () => {
    expect(fs.existsSync(FRONT_CMD_PATH)).toBe(true)
  })

  test("tiene frontmatter con description, agent y subtask", () => {
    const raw = fs.readFileSync(FRONT_CMD_PATH, "utf-8")
    expect(raw.startsWith("---")).toBe(true)
    const fmEnd = raw.indexOf("\n---", 3)
    const fm = raw.slice(0, fmEnd)
    expect(fm).toMatch(/^description:\s*.+/m)
    expect(fm).toMatch(/^agent:\s*\w+/m)
  })

  test("invoca el skill sdd-design-system", () => {
    const raw = fs.readFileSync(FRONT_CMD_PATH, "utf-8")
    expect(raw).toContain("sdd-design-system")
  })

  test("referencia $ARGUMENTS para descripción libre", () => {
    const raw = fs.readFileSync(FRONT_CMD_PATH, "utf-8")
    expect(raw).toContain("$ARGUMENTS")
  })

  test("instruye persistir active_design_system en el lockfile", () => {
    const raw = fs.readFileSync(FRONT_CMD_PATH, "utf-8")
    expect(raw).toContain("active_design_system")
  })

  test("define el flujo post-diseño (spec enriquecido, Fase 2, compliance, commit)", () => {
    const raw = fs.readFileSync(FRONT_CMD_PATH, "utf-8")
    expect(raw).toMatch(/Fase 2|F2|GREEN/i)
    expect(raw).toMatch(/compliance|spec_compliance/i)
    expect(raw).toMatch(/commit/i)
  })
})
