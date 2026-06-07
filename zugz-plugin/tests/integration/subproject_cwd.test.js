import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import lockManager from '../../.opencode/tools/sdd_lock_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_ROOT = path.join(os.tmpdir(), `zugzbot-subproject-test-${Date.now()}`);

function makeProject(name) {
  const projectPath = path.join(TMP_ROOT, name);
  fs.mkdirSync(projectPath, { recursive: true });
  return projectPath;
}

function ctx(projectPath) {
  return { worktree: projectPath, directory: projectPath, sessionID: 'test' };
}

beforeAll(() => {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});

describe('Lockfile subproject_cwd (v3)', () => {
  test('update accepts subproject_cwd and persists it', async () => {
    const projectPath = makeProject('subproject-update');
    const context = ctx(projectPath);

    const updateResult = await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ subproject_cwd: 'backend' })
    }, context);
    const parsed = JSON.parse(updateResult);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.updated_fields).toContain('subproject_cwd');

    const readResult = await lockManager.execute({ action: 'read' }, context);
    const lock = JSON.parse(readResult).lockfile;
    expect(lock.subproject_cwd).toBe('backend');
  });

  test('schema_version is 4 after update with subproject_cwd', async () => {
    const projectPath = makeProject('subproject-schema');
    const context = ctx(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ subproject_cwd: 'apps/api' })
    }, context);

    const readResult = await lockManager.execute({ action: 'read' }, context);
    const lock = JSON.parse(readResult).lockfile;
    expect(lock.schema_version).toBe(7);
  });

  test('default lockfile has schema_version 4 and subproject_cwd empty', async () => {
    const projectPath = makeProject('subproject-default');
    const context = ctx(projectPath);

    const readResult = await lockManager.execute({ action: 'read' }, context);
    const lock = JSON.parse(readResult).lockfile;
    expect(lock.schema_version).toBe(7);
    expect(lock.subproject_cwd).toBe('');
  });

  test('migrate v2 lockfile adds subproject_cwd empty', async () => {
    const projectPath = makeProject('subproject-migrate-v2');
    const lockDir = path.join(projectPath, '.openspec');
    fs.mkdirSync(lockDir, { recursive: true });
    const v2Lock = {
      schema_version: 2,
      change_name: 'legacy-change',
      workflow: 'full-sdd-tdd',
      stack_profile: 'python',
      active_phase: 'F0',
      active_subagent: 'f0-explorer',
      status: 'idle',
      auto_pilot: false,
      iteration: 0,
      last_updated: '2026-01-01T00:00:00.000Z',
      orchestrator_mode: 'router',
      direction: 'forward',
      last_successful_phase: 'F0',
      retry_count: 0,
      corrective_loop_active: false,
      fresh_task: true,
      tasks: [],
      tdd: {
        red: { completed: false, tests_added: 0, all_failing: false },
        green: { completed: false, tests_passing: 0 },
        refactor: { completed: false, linter_clean: false }
      },
      git: { branch: '', base_sha: '', working_tree_clean: true },
      checkpoints: [],
      last_checkpoint_id: null,
      last_restored_from: null,
      complexity: 'medium'
    };
    fs.writeFileSync(
      path.join(lockDir, 'sdd-lock.json'),
      JSON.stringify(v2Lock, null, 2)
    );
    const context = ctx(projectPath);

    const readResult = await lockManager.execute({ action: 'read' }, context);
    const lock = JSON.parse(readResult).lockfile;
    expect(lock.schema_version).toBe(7);
    expect(lock.subproject_cwd).toBe('');
    expect(lock.change_name).toBe('legacy-change');
    expect(lock.stack_profile).toBe('python');
  });

  test('subproject_cwd can be cleared by setting empty string', async () => {
    const projectPath = makeProject('subproject-clear');
    const context = ctx(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ subproject_cwd: 'backend' })
    }, context);
    let readResult = await lockManager.execute({ action: 'read' }, context);
    expect(JSON.parse(readResult).lockfile.subproject_cwd).toBe('backend');

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ subproject_cwd: '' })
    }, context);
    readResult = await lockManager.execute({ action: 'read' }, context);
    expect(JSON.parse(readResult).lockfile.subproject_cwd).toBe('');
  });
});
