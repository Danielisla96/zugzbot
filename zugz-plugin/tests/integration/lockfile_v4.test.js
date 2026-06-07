import { describe, test, expect } from "vitest"
import {
  migrateToV4,
  migrateToV5,
  migrateToV6,
  SCHEMA_VERSION
} from "../../.opencode/tools/sdd_lock_manager.js"

describe("sdd_lock_manager v6 (session_features opt-in)", () => {
  test("SCHEMA_VERSION es 7 (v6 quedó como back-compat)", () => {
    expect(SCHEMA_VERSION).toBe(7)
  })

  test("migrateToV6 preserva session_features si existían en v5", () => {
    const v5Raw = {
      schema_version: 5,
      change_name: "feat-x",
      stack_profile: "python",
      session_features: { autoskills: true, graphify: false }
    }
    const migrated = migrateToV6(v5Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.session_features).toEqual({ autoskills: true, graphify: false })
  })

  test("migrateToV6 sin session_features inicializa defaults {false, false}", () => {
    const v5Raw = {
      schema_version: 5,
      change_name: "feat-x",
      stack_profile: "python"
    }
    const migrated = migrateToV6(v5Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.session_features).toEqual({ autoskills: false, graphify: false })
  })

  test("migrateToV6 desde v4 inicializa session_features=defaults", () => {
    const v4Raw = { schema_version: 4, change_name: "feat-old", stack_profile: "node-typescript" }
    const migrated = migrateToV6(v4Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.session_features).toEqual({ autoskills: false, graphify: false })
  })

  test("migrateToV6 desde v2 inicializa session_features=defaults y conserva subproject_cwd", () => {
    const v2Raw = { schema_version: 2, change_name: "feat-old2", subproject_cwd: "apps/web" }
    const migrated = migrateToV6(v2Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.subproject_cwd).toBe("apps/web")
    expect(migrated.session_features).toEqual({ autoskills: false, graphify: false })
  })
})

describe("sdd_lock_manager v5 (workflow_tasks vs acceptance_criteria)", () => {
  test("migrateToV4 sigue siendo alias de migrateToV2 (back-compat)", () => {
    const v3Raw = { schema_version: 3, change_name: "x", qa_manual: true, stack_profile: "python" }
    const migrated = migrateToV4(v3Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.modo_qa).toBe("manual")
  })

  test("migrateToV5 migra v4 con tasks preservados e inicializa acceptance_criteria=[]", () => {
    const v4Raw = {
      schema_version: 4,
      change_name: "feat-x",
      stack_profile: "python",
      tasks: [
        { id: 1, desc: "work item 1", status: "pending" },
        { id: 2, desc: "work item 2", status: "completed" }
      ]
    }
    const migrated = migrateToV5(v4Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.tasks).toHaveLength(2)
    expect(migrated.acceptance_criteria).toEqual([])
  })

  test("migrateToV5 con v3 sin modo_qa asume automatizado", () => {
    const v3Raw = { schema_version: 3, change_name: "x", stack_profile: "python" }
    const migrated = migrateToV5(v3Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.modo_qa).toBe("automatizado")
  })

  test("migrateToV5 con lockfile v2 preserva subproject_cwd", () => {
    const v2Raw = { schema_version: 2, change_name: "x", stack_profile: "python", subproject_cwd: "backend" }
    const migrated = migrateToV5(v2Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.subproject_cwd).toBe("backend")
  })

  test("v5 lockfile con acceptance_criteria y tasks son independientes", () => {
    const v5Raw = {
      schema_version: 5,
      change_name: "feat-y",
      stack_profile: "python",
      tasks: [
        { id: 1, desc: "work item", status: "completed" }
      ],
      acceptance_criteria: [
        { id: "CA1", desc: "sum returns result", covered: true, test_refs: ["test_sum"], matched_in_file: "tests/test_sum.py" }
      ]
    }
    const migrated = migrateToV5(v5Raw)
    expect(migrated.tasks).toHaveLength(1)
    expect(migrated.acceptance_criteria).toHaveLength(1)
    expect(migrated.acceptance_criteria[0].covered).toBe(true)
    expect(migrated.tasks[0].status).toBe("completed")
  })
})

describe("sdd_lock_manager v4 (legacy migration path)", () => {
  test("migrateToV4 v3 con qa_manual:true → modo_qa: 'manual' (legacy v4 path)", () => {
    const v3Raw = { schema_version: 3, change_name: "feature-x", qa_manual: true, stack_profile: "python" }
    const migrated = migrateToV4(v3Raw)
    expect(migrated.modo_qa).toBe("manual")
    expect(migrated.change_name).toBe("feature-x")
  })

  test("migra v3 con qa_manual:true → modo_qa: 'manual' y schema_version: 7", () => {
    const v3Raw = {
      schema_version: 3,
      change_name: "feature-x",
      qa_manual: true,
      stack_profile: "python"
    }
    const migrated = migrateToV4(v3Raw)
    expect(migrated.schema_version).toBe(7)
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

  test("migra v2 con qa_manual:true → v7 con modo_qa: 'manual'", () => {
    const v2Raw = {
      schema_version: 2,
      change_name: "old-feature",
      qa_manual: true
    }
    const migrated = migrateToV4(v2Raw)
    expect(migrated.schema_version).toBe(7)
    expect(migrated.modo_qa).toBe("manual")
  })

  test("migra v1 → v7 con modo_qa default 'automatizado'", () => {
    const v1Raw = {
      schema_version: 1,
      change_name: "ancient"
    }
    const migrated = migrateToV4(v1Raw)
    expect(migrated.schema_version).toBe(7)
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
