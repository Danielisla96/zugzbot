import { describe, test, expect } from "vitest"
import {
  migrateToV2,
  migrateToV4,
  migrateToV5,
  migrateToV6,
  migrateToV7,
  migrateToV8,
  SCHEMA_VERSION,
  DESIGN_SYSTEM_SLUGS,
  isValidDesignSystemSlug,
  normalizeDesignSystemSlug,
  isDesignSystemReady
} from "../../.opencode/tools/_core/sdd_lock_manager.js"

describe("sdd_lock_manager general & design system metadata", () => {
  test("SCHEMA_VERSION es 8", () => {
    expect(SCHEMA_VERSION).toBe(8)
  })

  test("DESIGN_SYSTEM_SLUGS contiene los 11 esperados", () => {
    expect(DESIGN_SYSTEM_SLUGS).toEqual([
      "airbnb",
      "apple",
      "heroui",
      "meta",
      "nike",
      "notion",
      "renault",
      "theverge",
      "uber",
      "voltagent",
      "x.ai"
    ])
  })

  test("isValidDesignSystemSlug acepta slugs válidos", () => {
    for (const slug of DESIGN_SYSTEM_SLUGS) {
      expect(isValidDesignSystemSlug(slug)).toBe(true)
    }
  })

  test("isValidDesignSystemSlug rechaza slugs inválidos", () => {
    expect(isValidDesignSystemSlug("google")).toBe(false)
    expect(isValidDesignSystemSlug("")).toBe(false)
    expect(isValidDesignSystemSlug(null)).toBe(false)
    expect(isValidDesignSystemSlug(undefined)).toBe(false)
    expect(isValidDesignSystemSlug(42)).toBe(false)
  })

  test("normalizeDesignSystemSlug pasa through slug válido", () => {
    expect(normalizeDesignSystemSlug("airbnb")).toBe("airbnb")
    expect(normalizeDesignSystemSlug("x.ai")).toBe("x.ai")
    expect(normalizeDesignSystemSlug("theverge")).toBe("theverge")
  })

  test("normalizeDesignSystemSlug lowercase y trim", () => {
    expect(normalizeDesignSystemSlug("  AIRBNB  ")).toBe("airbnb")
    expect(normalizeDesignSystemSlug("Apple")).toBe("apple")
  })

  test("normalizeDesignSystemSlug lowercase 'X.AI' → 'x.ai'", () => {
    expect(normalizeDesignSystemSlug("X.AI")).toBe("x.ai")
  })

  test("normalizeDesignSystemSlug null/undefined/empty → null", () => {
    expect(normalizeDesignSystemSlug(null)).toBe(null)
    expect(normalizeDesignSystemSlug(undefined)).toBe(null)
    expect(normalizeDesignSystemSlug("")).toBe(null)
    expect(normalizeDesignSystemSlug("   ")).toBe(null)
    expect(normalizeDesignSystemSlug("none")).toBe(null)
    expect(normalizeDesignSystemSlug("null")).toBe(null)
  })

  test("normalizeDesignSystemSlug inválido → null (no throw)", () => {
    expect(normalizeDesignSystemSlug("foobar")).toBe(null)
    expect(normalizeDesignSystemSlug(123)).toBe(null)
  })
})

describe("sdd_lock_manager back-compat migrations (v1 to v8)", () => {
  test("migrateToV8 desde v7 con campos vacíos por default", () => {
    const v7Raw = {
      schema_version: 7,
      change_name: "feat-x",
      stack_profile: "python"
    }
    const migrated = migrateToV8(v7Raw)
    expect(migrated.schema_version).toBe(SCHEMA_VERSION)
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
    expect(migrated.schema_version).toBe(SCHEMA_VERSION)
    expect(migrated.recommended_skills).toEqual(["notebook-guidance"])
    expect(migrated.autopilot_decisions).toEqual([{ phase: "F1", decision: "Use Vitest", justification: "Node stack" }])
  })

  test("migrateToV7 desde v6 con active_design_system lo preserva", () => {
    const v6Raw = {
      schema_version: 6,
      change_name: "feat-x",
      active_design_system: "theverge"
    }
    const migrated = migrateToV7(v6Raw)
    expect(migrated.schema_version).toBe(SCHEMA_VERSION)
    expect(migrated.active_design_system).toBe("theverge")
  })

  test("migrateToV6 preserva session_features si existían en v5", () => {
    const v5Raw = {
      schema_version: 5,
      change_name: "feat-x",
      stack_profile: "python",
      session_features: { autoskills: true, graphify: false }
    }
    const migrated = migrateToV6(v5Raw)
    expect(migrated.schema_version).toBe(SCHEMA_VERSION)
    expect(migrated.session_features).toEqual({ autoskills: true, graphify: false })
  })

  test("migrateToV5 migra v4 con tasks e inicializa acceptance_criteria=[]", () => {
    const v4Raw = {
      schema_version: 4,
      change_name: "feat-x",
      stack_profile: "python",
      tasks: [
        { id: 1, desc: "work item 1", status: "pending" }
      ]
    }
    const migrated = migrateToV5(v4Raw)
    expect(migrated.schema_version).toBe(SCHEMA_VERSION)
    expect(migrated.tasks).toHaveLength(1)
    expect(migrated.acceptance_criteria).toEqual([])
  })

  test("migrateToV4 con v3 con qa_manual:true → modo_qa: 'manual'", () => {
    const v3Raw = { schema_version: 3, change_name: "feature-x", qa_manual: true, stack_profile: "python" }
    const migrated = migrateToV4(v3Raw)
    expect(migrated.schema_version).toBe(SCHEMA_VERSION)
    expect(migrated.modo_qa).toBe("manual")
  })

  test("migra v1 → v8 con modo_qa default 'automatizado'", () => {
    const v1Raw = {
      schema_version: 1,
      change_name: "ancient"
    }
    const migrated = migrateToV4(v1Raw)
    expect(migrated.schema_version).toBe(SCHEMA_VERSION)
    expect(migrated.modo_qa).toBe("automatizado")
  })
})

describe("isDesignSystemReady — gate de Fase 2", () => {
  test("ready: 'set' cuando active_design_system está seteado", () => {
    expect(isDesignSystemReady({ active_design_system: "airbnb", design_system_explicitly_skipped: false })).toEqual({
      ready: true,
      reason: "set"
    })
  })

  test("ready: 'skipped' cuando el usuario eligió explícitamente skip", () => {
    expect(isDesignSystemReady({ active_design_system: null, design_system_explicitly_skipped: true })).toEqual({
      ready: true,
      reason: "skipped"
    })
  })

  test("ready: false 'uninitialized' cuando ni set ni skip", () => {
    expect(isDesignSystemReady({ active_design_system: null, design_system_explicitly_skipped: false })).toEqual({
      ready: false,
      reason: "uninitialized"
    })
  })
})
