import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import sddTestRunner from '../../.opencode/tools/_f2/sdd_test_runner.js';
import lockManager from '../../.opencode/tools/_core/sdd_lock_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_ROOT = path.join(os.tmpdir(), `zugzbot-test-runner-${Date.now()}`);
const PROFILES_SRC = path.resolve(__dirname, '..', '..', 'profiles');

function makeProject(name, files) {
  const projectPath = path.join(TMP_ROOT, name);
  fs.mkdirSync(projectPath, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(projectPath, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf-8');
  }
  return projectPath;
}

function copyProfilesTo(projectPath) {
  const dest = path.join(projectPath, 'profiles');
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(PROFILES_SRC)) {
    if (f.endsWith('.json')) {
      fs.copyFileSync(path.join(PROFILES_SRC, f), path.join(dest, f));
    }
  }
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

describe('sdd_test_runner profile aliases (v3)', () => {
  test('detect action resolves python-fastapi alias to python profile', async () => {
    const projectPath = makeProject('alias-python-fastapi', {
      'package.json': '{"name":"frontend","version":"1.0.0"}',
      'backend/requirements.txt': 'fastapi>=0.115.0',
      'backend/pyproject.toml': '[project]\nname = "backend"'
    });
    copyProfilesTo(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'python-fastapi', subproject_cwd: 'backend' })
    }, ctx(projectPath));

    const result = await sddTestRunner.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.active_profile).toBe('python');
    expect(parsed.resolved_from).toBe('python-fastapi');
    expect(parsed.test_runner).toBeTruthy();
    expect(parsed.test_runner.name).toBe('pytest');
  });

  test('detect action works for plain node-typescript (no alias)', async () => {
    const projectPath = makeProject('alias-no-alias', {
      'package.json': '{}',
      'tsconfig.json': '{}'
    });
    copyProfilesTo(projectPath);

    const result = await sddTestRunner.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.active_profile).toBe('node-typescript');
    expect(parsed.resolved_from).toBe('node-typescript');
  });

  test('detect action auto-detects when lockfile is empty (root match)', async () => {
    const projectPath = makeProject('alias-unknown', {
      'package.json': '{}'
    });
    copyProfilesTo(projectPath);

    const result = await sddTestRunner.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.active_profile).toBe('node-javascript');
    expect(parsed.detected_from).toBe('auto');
  });
});

describe('sdd_test_runner subproject_cwd (v3)', () => {
  test('respects subproject_cwd from lockfile when running tests', async () => {
    const projectPath = makeProject('subproject-runner', {
      'package.json': '{}',
      'backend/requirements.txt': 'fastapi',
      'backend/pyproject.toml': '[project]\nname = "b"',
      'backend/tests/test_dummy.py': 'def test_pass():\n    assert True\n'
    });
    copyProfilesTo(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({
        subproject_cwd: 'backend',
        stack_profile: 'python-fastapi'
      })
    }, ctx(projectPath));

    const result = await sddTestRunner.execute({ action: 'run' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.cwd).toBe('backend');
    expect(parsed.results.length).toBeGreaterThan(0);
    const pyRes = parsed.results.find((r) => r.runner === 'pytest');
    expect(pyRes).toBeTruthy();
  });

  test('subproject_cwd is not set: test runs in projectRoot', async () => {
    const projectPath = makeProject('subproject-runner-default', {
      'package.json': '{}',
      'tests/test_dummy.py': 'def test_pass():\n    assert True\n'
    });
    copyProfilesTo(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'python' })
    }, ctx(projectPath));

    const result = await sddTestRunner.execute({ action: 'run' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.cwd).toBe('');
  });
});

describe('sdd_test_runner better errors (v3)', () => {
  test('returns FAILED with helpful reason when no runner is detected', async () => {
    const projectPath = makeProject('no-runner-detected', {
      'package.json': '{}'
    });
    copyProfilesTo(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'python' })
    }, ctx(projectPath));

    // No requirements.txt, no pyproject.toml, no pytest.ini, no tests/ → no runner
    const result = await sddTestRunner.execute({ action: 'run' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('FAILED');
    expect(parsed.reason).toContain('No se detectó ningún test runner');
    expect(parsed.reason).toContain('pytest.ini');
    expect(parsed.reason).toContain('pyproject.toml');
  });

  test('verify-red returns clear FAILED with reason (no false SUCCESS)', async () => {
    const projectPath = makeProject('verify-red-no-runner', {
      'package.json': '{}'
    });
    copyProfilesTo(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'python' })
    }, ctx(projectPath));

    const result = await sddTestRunner.execute({ action: 'verify-red' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('FAILED');
    expect(parsed.reason).toBeTruthy();
    expect(parsed.reason).not.toContain('Tests fallan correctamente');
  });
});
