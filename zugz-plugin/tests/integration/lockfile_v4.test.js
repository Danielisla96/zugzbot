import { describe, test, expect } from "vitest"
import {
  migrateToV4,
  SCHEMA_VERSION
} from "../../.opencode/tools/sdd_lock_manager.js"

describe("sdd_lock_manager v4 (modo_qa + migración silenciosa)", () => {
  test("SCHEMA_VERSION es 4", () => {
    expect(SCHEMA_VERSION).toBe(4)
  })

  test("migra v3 con qa_manual:true → modo_qa: 'manual' y schema_version: 4", () => {
    const v3Raw = {
      schema_version: 3,
      change_name: "feature-x",
      qa_manual: true,
      stack_profile: "python"
    }
    const migrated = migrateToV4(v3Raw)
    expect(migrated.schema_version).toBe(4)
    expect(migrated.modo_qa).toBe("manual")
    expect(migrated.change_name).toBe("feature-x")
    expect(migrated.stack_profile).toBe("python")
  })

  test("migra v3 con manual_qa:true → modo_qa: 'manual'", () => {
    const v3Raw = {
      schema_version: 3,
      change_name: "feature-y",
      manual_qa: true
    }
    const migrated = migrateToV4(v3Raw)
    expect(migrated.modo_qa).toBe("manual")
  })

  test("migra v3 sin qa_manual → modo_qa: 'automatizado' (default)", () => {
    const v3Raw = {
      schema_version: 3,
      change_name: "feature-z"
    }
    const migrated = migrateToV4(v3Raw)
    expect(migrated.modo_qa).toBe("automatizado")
  })

  test("migra v2 con qa_manual:true → v4 con modo_qa: 'manual'", () => {
    const v2Raw = {
      schema_version: 2,
      change_name: "old-feature",
      qa_manual: true
    }
    const migrated = migrateToV4(v2Raw)
    expect(migrated.schema_version).toBe(4)
    expect(migrated.modo_qa).toBe("manual")
  })

  test("migra v1 → v4 con modo_qa default 'automatizado'", () => {
    const v1Raw = {
      schema_version: 1,
      change_name: "ancient"
    }
    const migrated = migrateToV4(v1Raw)
    expect(migrated.schema_version).toBe(4)
    expect(migrated.modo_qa).toBe("automatizado")
  })

  test("preserva modo_qa explícito si ya estaba en v3", () => {
    const v3Raw = {
      schema_version: 3,
      change_name: "x",
      modo_qa: "manual"
    }
    const migrated = migrateToV4(v3Raw)
    expect(migrated.modo_qa).toBe("manual")
  })

  test("modo_qa del spec NO se ve afectado (es campo del frontmatter, no del lockfile)", () => {
    const v3Raw = {
      schema_version: 3,
      change_name: "x",
      qa_manual: true
    }
    const migrated = migrateToV4(v3Raw)
    expect(migrated).not.toHaveProperty("qa_manual")
    expect(migrated).not.toHaveProperty("manual_qa")
  })
})
