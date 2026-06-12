import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, test, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const EXPECTED_AGENTS = [
  // Core SDD cycle (9 fases)
  'zugzbot.md',
  'f0-explorer.md',
  'f1-planner.md',
  'f15-spec-reviewer.md',
  'f2-red-test-writer.md',
  'f2-green-builder.md',
  'f2-refactor-improver.md',
  'f3-validator.md',
  'f4-deployer.md',
  'f5-archiver.md',
  // Auxiliares (5 workflows rápidos)
  'aux-quick-fix.md',
  'aux-audit.md',
  'aux-refactor.md',
  'aux-explain.md',
  'aux-oracle.md',
];

const EXPECTED_CONTRACTS = [
  'f0-explorer-contract.md',
  'f1-planner-contract.md',
  'f15-spec-reviewer-contract.md',
  'f2-red-test-writer-contract.md',
  'f2-green-builder-contract.md',
  'f2-refactor-improver-contract.md',
  'f3-validator-contract.md',
  'f4-deployer-contract.md',
  'f5-archiver-contract.md',
];

const EXPECTED_BOUNDARIES = [
  'f0-explorer-boundary.md',
  'f1-planner-boundary.md',
  'f15-spec-reviewer-boundary.md',
  'f2-red-test-writer-boundary.md',
  'f2-green-builder-boundary.md',
  'f2-refactor-improver-boundary.md',
  'f3-validator-boundary.md',
  'f4-deployer-boundary.md',
  'f5-archiver-boundary.md',
];

const EXPECTED_TOOLS = [
  { path: '_core/sdd_transition.js' },
  { path: '_core/sdd_lock_manager.js' },
  { path: '_core/sdd_router.js' },
  { path: '_core/sdd_checkpoint.js' },
  { path: '_core/sdd_compact_context.js' },
  { path: '_core/sdd_context_pruner.js' },
  { path: '_core/sdd_session_features.js' },
  { path: '_core/sdd_clasp.js' },
  { path: '_f0/sdd_stack_detector.js' },
  { path: '_f0/sdd_git_awareness.js' },
  { path: '_f0/sdd_generate_tree.js' },
  { path: '_f0/sdd_graphify.js' },
  { path: '_f0/sdd_install_autoskills.js' },
  { path: '_f1/sdd_requirement_tracker.js' },
  { path: '_f1/sdd_diff_impact_analyzer.js' },
  { path: '_f1/sdd_test_scaffold_generator.js' },
  { path: '_f1/sdd_auto_api_mocker.js' },
  { path: '_f1/sdd_spec_reviewer.js' },
  { path: '_f1/sdd_spec_validator.js' },
  { path: '_f1/sdd_dependency_installer.js' },
  { path: '_f1/check_dependency_cooldown.js' },
  { path: '_f1/sdd_heroui_lookup.js' },
  { path: '_f2/sdd_test_runner.js' },
  { path: '_f2/sdd_linter.js' },
  { path: '_f2/sdd_auto_healer.js' },
  { path: '_f2/sdd_brain_sync.js' },
  { path: '_f2/sdd_brain_curator.js' },
  { path: '_f2/sdd_bdd_tester.js' },
  { path: '_f2/sdd_regression_detector.js' },
  { path: '_f3/sdd_secret_scanner.js' },
  { path: '_f3/sdd_security_vulnerability_scanner.js' },
  { path: '_f3/sdd_spec_compliance_linter.js' },
  { path: '_f3/sdd_sandbox_patcher.js' },
  { path: '_f3/sdd_visual_regression_diff.js' },
  { path: '_f3/sdd_performance_regress_profiler.js' },
  { path: '_f3/sdd_ui_auditor.js' },
  { path: '_f4/sdd_destructive_guard.js' },
  { path: '_f4/sdd_free_port_finder.js' },
  { path: '_f5/sdd_archive_and_commit.js' },
];

describe('Agent Files Existence (v3)', () => {
  EXPECTED_AGENTS.forEach(agent => {
    test(`${agent} should exist`, () => {
      const agentPath = path.join(rootDir, 'agents', agent);
      expect(fs.existsSync(agentPath), `${agent} should exist`).toBe(true);
    });
  });
});

describe('Contract Files (9 fases)', () => {
  EXPECTED_CONTRACTS.forEach(contract => {
    test(`${contract} should exist`, () => {
      const contractPath = path.join(rootDir, 'prompts/contracts', contract);
      expect(fs.existsSync(contractPath), `${contract} should exist`).toBe(true);
    });
  });
});

describe('Boundary Files (9 fases)', () => {
  EXPECTED_BOUNDARIES.forEach(boundary => {
    test(`${boundary} should exist`, () => {
      const boundaryPath = path.join(rootDir, 'prompts/boundaries', boundary);
      expect(fs.existsSync(boundaryPath), `${boundary} should exist`).toBe(true);
    });
  });
});

describe('Tool Scripts Existence (v3)', () => {
  EXPECTED_TOOLS.forEach(tool => {
    test(`${tool.path} should exist`, () => {
      const toolPath = path.join(rootDir, '.opencode', 'tools', tool.path);
      expect(fs.existsSync(toolPath), `${tool.path} should exist at ${toolPath}`).toBe(true);
    });
  });
});

describe('Config Files (v3)', () => {
  test('package.json should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'package.json'))).toBe(true);
  });

  test('eslint.config.js should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'eslint.config.js'))).toBe(true);
  });

  test('zugz-models.json should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'zugz-models.json'))).toBe(true);
  });

  test('agents/manifest.json should exist (v3)', () => {
    expect(fs.existsSync(path.join(rootDir, 'agents/manifest.json'))).toBe(true);
  });
});

describe('v3 Prompts Structure', () => {
  test('prompts/system/orchestrator-base.md should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'prompts/system/orchestrator-base.md'))).toBe(true);
  });

  test('prompts/system/subagent-base.md should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'prompts/system/subagent-base.md'))).toBe(true);
  });

  test('prompts/system/tdd-discipline.md should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'prompts/system/tdd-discipline.md'))).toBe(true);
  });

  test('prompts/system/router-rules.md should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'prompts/system/router-rules.md'))).toBe(true);
  });
});

describe('Skills (v3: only active ones ship)', () => {
  const activeSkills = [
    'sdd-design-system',
    'sdd-tdd-coach',
    'sdd-dependency-cooldown',
    'sdd-gitignore-manager',
  ];
  activeSkills.forEach(skill => {
    test(`${skill}/SKILL.md should exist`, () => {
      const skillPath = path.join(rootDir, 'skills', skill, 'SKILL.md');
      expect(fs.existsSync(skillPath), `${skill}/SKILL.md should exist`).toBe(true);
    });
  });
});

describe('Tool Hallucination Guard (v3)', () => {
  test('sdd_test_writer should NOT be referenced (hallucinated tool removed)', () => {
    const files = [
      path.join(rootDir, 'agents', 'f2-red-test-writer.md'),
      path.join(rootDir, 'prompts/contracts', 'f2-red-test-writer-contract.md'),
    ];
    files.forEach(f => {
      if (fs.existsSync(f)) {
        const content = fs.readFileSync(f, 'utf-8');
        expect(content).not.toMatch(/sdd_test_writer/);
      }
    });
  });
});

describe('v3 Lockfile Schema', () => {
  test('sdd-lock.json should have schema_version and session_features', () => {
    const lockPath = path.join(rootDir, '.openspec/sdd-lock.json');
    if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
      expect(lock.schema_version).toBeGreaterThanOrEqual(6);
      expect(lock.active_phase).toMatch(/^F[0-5]/);
      expect(lock.tdd).toBeDefined();
      expect(lock.tdd.red).toBeDefined();
      expect(lock.tdd.green).toBeDefined();
      expect(lock.tdd.refactor).toBeDefined();
      expect(lock.session_features).toBeDefined();
    }
  });
});
