import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, test, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

describe('Tool Scripts Existence (v2)', () => {
  const tools = [
    'sdd_transition.js',
    'sdd_lock_manager.js',
    'sdd_stack_detector.js',
    'sdd_git_awareness.js',
    'sdd_clasp.js',
    'sdd_generate_tree.js',
    'sdd_install_autoskills.js',
    'sdd_checkpoint.js',
    'sdd_ui_auditor.js',
    'sdd_archive_and_commit.js',
    'sdd_brain_sync.js',
    'sdd_auto_healer.js',
    'sdd_dependency_installer.js'
  ];

  tools.forEach(tool => {
    test(`${tool} should exist`, () => {
      const toolPath = path.join(rootDir, '.opencode', 'tools', tool);
      expect(fs.existsSync(toolPath), `${tool} should exist at ${toolPath}`).toBe(true);
    });
  });
});

describe('Agent Files Existence (v2)', () => {
  const agents = [
    'zugzbot.md',
    'sdd-explorer.md',
    'sdd-planner.md',
    'sdd-builder.md',
    'sdd-tester.md',
    'sdd-archiver.md',
    'sdd-deployer.md',
    'aux-handyman.md',
    'aux-oracle.md'
  ];

  agents.forEach(agent => {
    test(`${agent} should exist`, () => {
      const agentPath = path.join(rootDir, 'agents', agent);
      expect(fs.existsSync(agentPath), `${agent} should exist`).toBe(true);
    });
  });
});

describe('Config Files (v2)', () => {
  test('package.json should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'package.json'))).toBe(true);
  });

  test('eslint.config.js should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'eslint.config.js'))).toBe(true);
  });

  test('zugz-models.json should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'zugz-models.json'))).toBe(true);
  });
});

describe('v2 Prompts Structure', () => {
  test('prompts/system/orchestrator-base.md should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'prompts/system/orchestrator-base.md'))).toBe(true);
  });

  test('prompts/system/subagent-base.md should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'prompts/system/subagent-base.md'))).toBe(true);
  });

  test('prompts/system/tdd-discipline.md should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'prompts/system/tdd-discipline.md'))).toBe(true);
  });

  test('contract files should exist for all 6 phases', () => {
    const phases = ['f0-explorer', 'f1-planner', 'f2-red-test-writer', 'f2-green-implementer', 'f2-refactor-improver', 'f3-validator', 'f4-deployer', 'f5-archiver'];
    phases.forEach(phase => {
      expect(
        fs.existsSync(path.join(rootDir, `prompts/contracts/${phase}-contract.md`)),
        `${phase}-contract.md should exist`
      ).toBe(true);
    });
  });

  test('boundary files should exist for all 6 phases', () => {
    const phases = ['f0-explorer', 'f1-planner', 'f2-red-test-writer', 'f2-green-implementer', 'f2-refactor-improver', 'f3-validator', 'f4-deployer', 'f5-archiver'];
    phases.forEach(phase => {
      expect(
        fs.existsSync(path.join(rootDir, `prompts/boundaries/${phase}-boundary.md`)),
        `${phase}-boundary.md should exist`
      ).toBe(true);
    });
  });
});

describe('v2 Lockfile Schema', () => {
  test('sdd-lock.json should have schema_version 2', () => {
    const lockPath = path.join(rootDir, '.openspec/sdd-lock.json');
    if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
      expect(lock.schema_version).toBe(2);
      expect(lock.active_phase).toMatch(/^F[0-5]/);
      expect(lock.tdd).toBeDefined();
      expect(lock.tdd.red).toBeDefined();
      expect(lock.tdd.green).toBeDefined();
      expect(lock.tdd.refactor).toBeDefined();
    }
  });
});
