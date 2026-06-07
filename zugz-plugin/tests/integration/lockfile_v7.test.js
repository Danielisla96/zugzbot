import { describe, test, expect } from "vitest"
import {
  migrateToV7,
  SCHEMA_VERSION,
  DESIGN_SYSTEM_SLUGS,
  isValidDesignSystemSlug,
  normalizeDesignSystemSlug,
  isDesignSystemReady
} from "../../.opencode/tools/sdd_lock_manager.js"

describe("sdd_lock_manager v7 (active_design_system)", () => {
  test("SCHEMA_VERSION es 7", () => {
    expect(SCHEMA_VERSION).toBe(7)
  })

  test("DESIGN_SYSTEM_SLUGS contiene los 10 esperados", () => {
    expect(DESIGN_SYSTEM_SLUGS).toEqual([
      "airbnb",
      "apple",
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

describe("migrateToV7 — back-compat", () => {
  test("migrateToV7 desde v6 → v7 con active_design_system: null", () => {
    const v6Raw = {
      schema_version: 6,
      change_name: "feat-x",
      stack_profile: "python"
    }
    const migrated = migrateToV7(v6Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.active_design_system).toBe(null)
  })

  test("migrateToV7 desde v6 con active_design_system válido lo preserva", () => {
    const v6Raw = {
      schema_version: 6,
      change_name: "feat-x",
      active_design_system: "theverge"
    }
    const migrated = migrateToV7(v6Raw)
    expect(migrated.active_design_system).toBe("theverge")
  })

  test("migrateToV7 desde v6 con active_design_system inválido → null", () => {
    const v6Raw = {
      schema_version: 6,
      change_name: "feat-x",
      active_design_system: "google"
    }
    const migrated = migrateToV7(v6Raw)
    expect(migrated.active_design_system).toBe(null)
  })

  test("migrateToV7 desde v4 (proyecto legacy) → v7 con active_design_system: null", () => {
    const v4Raw = {
      schema_version: 4,
      change_name: "old-feat",
      stack_profile: "node-typescript",
      tasks: [{ id: 1, desc: "task 1", status: "completed" }]
    }
    const migrated = migrateToV7(v4Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.active_design_system).toBe(null)
    expect(migrated.tasks).toHaveLength(1)
  })

  test("migrateToV7 desde v2 (proyecto muy legacy) → v7 con active_design_system: null", () => {
    const v2Raw = {
      schema_version: 2,
      change_name: "ancient",
      subproject_cwd: "apps/web"
    }
    const migrated = migrateToV7(v2Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.subproject_cwd).toBe("apps/web")
    expect(migrated.active_design_system).toBe(null)
  })

  test("migrateToV7 desde v1 → v7 con active_design_system: null", () => {
    const v1Raw = { schema_version: 1, change_name: "x" }
    const migrated = migrateToV7(v1Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.active_design_system).toBe(null)
  })

  test("migrateToV7 preserva session_features y modo_qa de v6", () => {
    const v6Raw = {
      schema_version: 6,
      change_name: "feat-x",
      session_features: { autoskills: true, graphify: true },
      modo_qa: "manual"
    }
    const migrated = migrateToV7(v6Raw)
    expect(migrated.session_features).toEqual({ autoskills: true, graphify: true })
    expect(migrated.modo_qa).toBe("manual")
    expect(migrated.active_design_system).toBe(null)
  })

  test("migrateToV7 normalize slug 'X.AI' (uppercase + dot)", () => {
    const v6Raw = {
      schema_version: 6,
      change_name: "feat-x",
      active_design_system: "X.AI"
    }
    const migrated = migrateToV7(v6Raw)
    expect(migrated.active_design_system).toBe("x.ai")
  })

  test("migrateToV7 inicializa design_system_explicitly_skipped: false por default", () => {
    const v6Raw = { schema_version: 6, change_name: "feat-x" }
    const migrated = migrateToV7(v6Raw)
    expect(migrated.design_system_explicitly_skipped).toBe(false)
  })

  test("migrateToV7 preserva design_system_explicitly_skipped: true si ya estaba", () => {
    const v6Raw = {
      schema_version: 6,
      change_name: "feat-x",
      active_design_system: null,
      design_system_explicitly_skipped: true
    }
    const migrated = migrateToV7(v6Raw)
    expect(migrated.active_design_system).toBe(null)
    expect(migrated.design_system_explicitly_skipped).toBe(true)
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

  test("set tiene prioridad sobre skip (no se pueden tener ambos)", () => {
    expect(isDesignSystemReady({ active_design_system: "uber", design_system_explicitly_skipped: true })).toEqual({
      ready: true,
      reason: "set"
    })
  })
})
