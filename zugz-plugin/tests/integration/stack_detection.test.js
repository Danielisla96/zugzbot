import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import stackDetector from '../../.opencode/tools/sdd_stack_detector.js';
import lockManager from '../../.opencode/tools/sdd_lock_manager.js';
import sddInstallAutoskills from '../../.opencode/tools/sdd_install_autoskills.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_ROOT = path.join(os.tmpdir(), `zugzbot-stack-test-${Date.now()}`);
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

beforeAll(() => {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});

function ctx(projectPath) {
  return { worktree: projectPath, directory: projectPath, sessionID: 'test' };
}

describe('Stack Detection (v2)', () => {
  test('detects node-typescript when package.json + tsconfig.json present', async () => {
    const projectPath = makeProject('node-ts', {
      'package.json': '{"name":"test","version":"1.0.0"}',
      'tsconfig.json': '{}',
      'src/index.ts': 'export {};'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('node-typescript');
  });

  test('detects node-javascript when only package.json', async () => {
    const projectPath = makeProject('node-js', {
      'package.json': '{"name":"test","version":"1.0.0"}',
      'index.js': 'module.exports = {};'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(['node-javascript', 'node-typescript']).toContain(parsed.stack_profile);
  });

  test('detects python when pyproject.toml present', async () => {
    const projectPath = makeProject('py-app', {
      'pyproject.toml': '[project]\nname = "test"',
      'src/main.py': 'print("hi")'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('python');
  });

  test('detects go when go.mod present', async () => {
    const projectPath = makeProject('go-app', {
      'go.mod': 'module test\n\ngo 1.21',
      'main.go': 'package main'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('go');
  });

  test('detects rust when Cargo.toml present', async () => {
    const projectPath = makeProject('rust-app', {
      'Cargo.toml': '[package]\nname = "test"\nversion = "0.1.0"',
      'src/main.rs': 'fn main() {}'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('rust');
  });

  test('detects java when pom.xml present', async () => {
    const projectPath = makeProject('java-app', {
      'pom.xml': '<project></project>',
      'src/main/java/App.java': 'class App {}'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('java');
  });

  test('detects gas when .clasp.json present', async () => {
    const projectPath = makeProject('gas-app', {
      '.clasp.json': '{"scriptId":"abc123","rootDir":"./src"}',
      'appsscript.json': '{"timeZone":"America/New_York"}',
      'src/Code.gs': 'function myFn() {}'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('gas');
  });

  test('returns "unknown" when no profiles match', async () => {
    const projectPath = makeProject('unknown', {
      'README.md': '# nothing'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'detect' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.stack_profile).toBe('unknown');
  });

  test('returns multiple candidates when ambiguous', async () => {
    const projectPath = makeProject('multi', {
      'package.json': '{}',
      'tsconfig.json': '{}',
      'pyproject.toml': '[project]'
    });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'match' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.matches.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Profile metadata (v2)', () => {
  test('node-typescript profile has required fields', async () => {
    const projectPath = makeProject('meta', { 'package.json': '{}' });
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'get', profileId: 'node-typescript' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.profile.id).toBe('node-typescript');
    expect(parsed.profile.test_runners.length).toBeGreaterThan(0);
    expect(parsed.profile.linters.length).toBeGreaterThan(0);
    expect(parsed.profile.conventions.test_dir).toBeTruthy();
    expect(parsed.profile.conventions.version_file).toBe('package.json');
  });

  test('gas profile requires sdd_clasp', async () => {
    const projectPath = makeProject('meta-gas', {});
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'get', profileId: 'gas' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.profile.required_tools).toContain('sdd_clasp');
    expect(parsed.profile.deploy.kind).toBe('clasp');
  });

  test('python profile supports multiple linters', async () => {
    const projectPath = makeProject('meta-py', {});
    copyProfilesTo(projectPath);

    const result = await stackDetector.execute({ action: 'get', profileId: 'python' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    const linterNames = parsed.profile.linters.map((l) => l.name);
    expect(linterNames).toContain('ruff');
    expect(linterNames).toContain('mypy');
  });
});

describe('Lockfile with stack_profile (v2)', () => {
  test('lock_manager can update stack_profile field', async () => {
    const projectPath = makeProject('lock-test', { 'package.json': '{}' });
    copyProfilesTo(projectPath);

    const updateResult = await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'node-typescript' })
    }, ctx(projectPath));
    const parsed = JSON.parse(updateResult);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.updated_fields).toContain('stack_profile');

    const readResult = await lockManager.execute({ action: 'read' }, ctx(projectPath));
    const lock = JSON.parse(readResult).lockfile;
    expect(lock.stack_profile).toBe('node-typescript');
    expect(lock.schema_version).toBe(5);
  });

  test('lock_manager validates v2 schema correctly', async () => {
    const projectPath = makeProject('lock-validate', {});
    copyProfilesTo(projectPath);

    const result = await lockManager.execute({ action: 'validate' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.valid).toBe(true);
  });
});

describe('Skill resolution by profile (v2)', () => {
  test('resolve-by-profile returns applicable skills for node-typescript', async () => {
    const projectPath = makeProject('skills', { 'package.json': '{}', 'tsconfig.json': '{}' });
    copyProfilesTo(projectPath);

    fs.mkdirSync(path.join(projectPath, '.opencode/skills/sdd-clean-architecture'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, '.opencode/skills/sdd-auto-api-mocker'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, '.opencode/skills/sdd-root-cause-diagnostician'), { recursive: true });
    fs.writeFileSync(path.join(projectPath, '.opencode/skills/sdd-clean-architecture/SKILL.md'), '# test');
    fs.writeFileSync(path.join(projectPath, '.opencode/skills/sdd-auto-api-mocker/SKILL.md'), '# test');
    fs.writeFileSync(path.join(projectPath, '.opencode/skills/sdd-root-cause-diagnostician/SKILL.md'), '# test');

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'node-typescript' })
    }, ctx(projectPath));

    const result = await sddInstallAutoskills.execute({ action: 'resolve-by-profile' }, ctx(projectPath));
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.active_profile).toBe('node-typescript');
    expect(parsed.applicable_skills).toContain('sdd-clean-architecture');
    expect(parsed.applicable_skills).toContain('sdd-root-cause-diagnostician');
  });

  test('sync action returns human-readable report', async () => {
    const projectPath = makeProject('sync-test', { 'package.json': '{}' });
    copyProfilesTo(projectPath);

    fs.mkdirSync(path.join(projectPath, '.opencode/skills/sdd-clean-architecture'), { recursive: true });
    fs.writeFileSync(path.join(projectPath, '.opencode/skills/sdd-clean-architecture/SKILL.md'), '# test');

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'node-typescript' })
    }, ctx(projectPath));

    const result = await sddInstallAutoskills.execute({ action: 'sync' }, ctx(projectPath));
    expect(result).toContain('Stack profile activo: node-typescript');
    expect(result).toContain('sdd-clean-architecture');
  });
});
