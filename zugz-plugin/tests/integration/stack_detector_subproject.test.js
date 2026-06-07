import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import stackDetector from '../../.opencode/tools/sdd_stack_detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_ROOT = path.join(os.tmpdir(), `zugzbot-subproject-stack-test-${Date.now()}`);
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

describe('Stack detector matchForChange (v3)', () => {
  test('polyglot root: package.json root + backend/requirements.txt → matchForChange("backend") = python', async () => {
    const projectPath = makeProject('polyglot-matchforchange', {
      'package.json': '{"name":"frontend","version":"1.0.0"}',
      'backend/requirements.txt': 'fastapi>=0.115.0',
      'backend/pyproject.toml': '[project]\nname = "backend"'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute(
      { action: 'matchForChange', changeName: 'add-backend-foo', subprojectCwd: 'backend' },
      ctx(projectPath)
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.change_name).toBe('add-backend-foo');
    expect(parsed.subproject_cwd).toBe('backend');
    expect(parsed.resolved_at).toBe('backend');
    expect(parsed.stack_profile).toBe('python');
    expect(parsed.candidates.length).toBeGreaterThan(0);
  });

  test('polyglot root: matchForChange without subprojectCwd returns root match (node-javascript)', async () => {
    const projectPath = makeProject('polyglot-root-default', {
      'package.json': '{"name":"frontend"}',
      'backend/requirements.txt': 'fastapi'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute(
      { action: 'matchForChange', changeName: 'any-change' },
      ctx(projectPath)
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.subproject_cwd).toBe('');
    expect(parsed.resolved_at).toBe('');
    expect(parsed.stack_profile).toBe('node-javascript');
  });

  test('polyglot root: change in subdir, no subprojectCwd → falls back to subdir search (python)', async () => {
    const projectPath = makeProject('polyglot-change-subdir', {
      'package.json': '{}',
      'backend/requirements.txt': 'fastapi'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute(
      { action: 'matchForChange', changeName: 'add-fastapi-sum' },
      ctx(projectPath)
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('python');
  });

  test('non-existent subprojectCwd returns root match with a warning', async () => {
    const projectPath = makeProject('no-such-subdir', {
      'package.json': '{}'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute(
      { action: 'matchForChange', changeName: 'test', subprojectCwd: 'nonexistent' },
      ctx(projectPath)
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.subproject_cwd).toBe('nonexistent');
    expect(parsed.warning).toContain('no existe');
    expect(parsed.stack_profile).toBe('node-javascript');
  });

  test('back-compat: detect still returns root match (node-javascript) for polyglot', async () => {
    const projectPath = makeProject('polyglot-detect-legacy', {
      'package.json': '{}',
      'backend/requirements.txt': 'fastapi'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('node-javascript');
  });
});
