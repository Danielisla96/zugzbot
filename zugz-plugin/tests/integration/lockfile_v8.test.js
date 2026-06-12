import { describe, test, expect } from "vitest"
import {
  migrateToV8,
  SCHEMA_VERSION,
  DESIGN_SYSTEM_SLUGS,
  isValidDesignSystemSlug,
  normalizeDesignSystemSlug,
  isDesignSystemReady
} from "../../.opencode/tools/sdd_lock_manager.js"

describe("sdd_lock_manager v8 (recommended_skills, autopilot_decisions)", () => {
  test("SCHEMA_VERSION es 8", () => {
    expect(SCHEMA_VERSION).toBe(8)
  })

  test("migrateToV8 desde v7 → v8 con campos vacíos por default", () => {
    const v7Raw = {
      schema_version: 7,
      change_name: "feat-x",
      stack_profile: "python"
    }
    const migrated = migrateToV8(v7Raw)
    expect(migrated.schema_version).toBe(8)
    expect(migrated.recommended_skills).toEqual([])
    expect(migrated.autopilot_decisions).toEqual([])
  })

  test("migrateToV8 preserva recommended_skills y autopilot_decisions", () => {
    const v7Raw = {
      schema_version: 7,
      change_name: "feat-x",
      recommended_skills: ["notebook-guidance"],
      autopilot_decisions: [{ phase: "F1", decision: "Use Vitest", justification: "Node stack" }]
    }
    const migrated = migrateToV8(v7Raw)
    expect(migrated.schema_version).toBe(8)
    expect(migrated.recommended_skills).toEqual(["notebook-guidance"])
    expect(migrated.autopilot_decisions).toEqual([{ phase: "F1", decision: "Use Vitest", justification: "Node stack" }])
  })
})
