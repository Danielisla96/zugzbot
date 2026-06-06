import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PKG_ROOT = path.resolve(__dirname, '..', '..');
const INSTALLER = path.join(PKG_ROOT, 'bin', 'zugzbot.js');

const SANDBOX = path.join(os.tmpdir(), `zugzbot-installer-${Date.now()}`);

function runInstaller(projectDir) {
  execFileSync('node', [INSTALLER], {
    cwd: projectDir,
    stdio: 'pipe',
    env: { ...process.env, NO_COLOR: '1' }
  });
}

function runInstallerExpectError(projectDir) {
  try {
    execFileSync('node', [INSTALLER], {
      cwd: projectDir,
      stdio: 'pipe',
      env: { ...process.env, NO_COLOR: '1' }
    });
    return null;
  } catch (e) {
    return { code: e.status, stdout: e.stdout?.toString() || '', stderr: e.stderr?.toString() || '' };
  }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

describe('installer: zugz-models.json editable + overlay', () => {
  const projectDir = path.join(SANDBOX, 'project-a');

  beforeAll(() => {
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'a', version: '0.1.0' }));
  });

  afterAll(() => {
    fs.rmSync(SANDBOX, { recursive: true, force: true });
  });

  test('primer install: copia zugz-models.json desde el paquete', () => {
    runInstaller(projectDir);
    const projectModels = readJson(path.join(projectDir, 'zugz-models.json'));
    expect(projectModels.agents).toBeTypeOf('object');
    expect(projectModels.agents.zugzbot).toBeTypeOf('string');
  });

  test('primer install: opencode.json refleja zugz-models.json', () => {
    const projectModels = readJson(path.join(projectDir, 'zugz-models.json'));
    const opencode = readJson(path.join(projectDir, 'opencode.json'));
    for (const [agentName, model] of Object.entries(projectModels.agents)) {
      expect(opencode.agent[agentName].model).toBe(model);
    }
    if (projectModels.default) {
      expect(opencode.agent.zugzbot.model).toBe(projectModels.agents.zugzbot || projectModels.default);
    }
  });

  test('segundo install (idempotente): preserva zugz-models.json del usuario', () => {
    const modelsPath = path.join(projectDir, 'zugz-models.json');
    const custom = {
      default: 'openai/gpt-5',
      agents: {
        zugzbot: 'openai/gpt-5-turbo',
        'sdd-explorer': 'anthropic/claude-sonnet-4.5'
      }
    };
    fs.writeFileSync(modelsPath, JSON.stringify(custom, null, 2));

    runInstaller(projectDir);

    const after = readJson(modelsPath);
    expect(after).toEqual(custom);
  });

  test('segundo install: opencode.json se actualiza con modelos del usuario', () => {
    const opencode = readJson(path.join(projectDir, 'opencode.json'));
    expect(opencode.agent.zugzbot.model).toBe('openai/gpt-5-turbo');
    expect(opencode.agent['sdd-explorer'].model).toBe('anthropic/claude-sonnet-4.5');
    expect(opencode.agent['sdd-builder'].model).toBe('openai/gpt-5');
    expect(opencode.agent['f2-red-test-writer'].model).toBe('openai/gpt-5');
  });

  test('segundo install: agentes custom de opencode.json NO se pierden', () => {
    const opencodePath = path.join(projectDir, 'opencode.json');
    const before = readJson(opencodePath);

    const customAgent = {
      mode: 'subagent',
      model: 'openai/gpt-5',
      prompt: '{file:./prompts/custom.md}',
      permission: { edit: 'allow', bash: 'allow' }
    };
    before.agent['mi-agente-custom'] = customAgent;
    fs.writeFileSync(opencodePath, JSON.stringify(before, null, 2));

    runInstaller(projectDir);

    const after = readJson(opencodePath);
    expect(after.agent['mi-agente-custom']).toBeDefined();
    expect(after.agent['mi-agente-custom'].prompt).toBe('{file:./prompts/custom.md}');
  });
});

describe('installer: overlay de modelos en reinstalación', () => {
  const projectDir = path.join(SANDBOX, 'project-b');

  beforeAll(() => {
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'b', version: '0.1.0' }));
  });

  afterAll(() => {
    fs.rmSync(SANDBOX, { recursive: true, force: true });
  });

  test('editar zugz-models.json entre installs propaga cambios a opencode.json', () => {
    runInstaller(projectDir);
    const opencodePath = path.join(projectDir, 'opencode.json');
    const modelsPath = path.join(projectDir, 'zugz-models.json');

    let opencode = readJson(opencodePath);
    const originalModel = opencode.agent.zugzbot.model;
    expect(originalModel).toBeTypeOf('string');

    const custom = {
      default: 'google/gemini-2.5-pro',
      agents: {
        zugzbot: 'google/gemini-2.5-pro'
      }
    };
    fs.writeFileSync(modelsPath, JSON.stringify(custom, null, 2));

    runInstaller(projectDir);

    opencode = readJson(opencodePath);
    expect(opencode.agent.zugzbot.model).toBe('google/gemini-2.5-pro');
    expect(opencode.agent['sdd-builder'].model).toBe('google/gemini-2.5-pro');
    expect(opencode.agent['f2-red-test-writer'].model).toBe('google/gemini-2.5-pro');
  });
});

describe('installer: detección de legacy v1.x', () => {
  const projectDir = path.join(SANDBOX, 'project-legacy');
  const lockPath = path.join(projectDir, '.openspec/sdd-lock.json');

  beforeAll(() => {
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'c', version: '0.1.0' }));
  });

  afterAll(() => {
    fs.rmSync(SANDBOX, { recursive: true, force: true });
  });

  test('lockfile con schema_version: 2 (número) → no es legacy, installer procede', () => {
    const lock = { schema_version: 2, active_phase: 'F0', tdd: { red: { completed: false } } };
    fs.mkdirSync(path.dirname(lockPath), { recursive: true });
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));

    runInstaller(projectDir);

    const result = readJson(lockPath);
    expect(result.schema_version).toBe(2);
  });

  test('lockfile con schema_version: "2" (string) → no es legacy, installer procede', () => {
    const lock = { schema_version: '2', active_phase: 'F0', tdd: { red: { completed: false } } };
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));

    runInstaller(projectDir);

    const result = readJson(lockPath);
    expect(result.schema_version).toBe('2');
  });

  test('lockfile sin schema_version pero con tdd + active_phase (estructura v2) → no es legacy', () => {
    const lock = { active_phase: 'F1.5', tdd: { red: { completed: true, tests_added: 3 } } };
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));

    runInstaller(projectDir);

    const result = readJson(lockPath);
    expect(result.active_phase).toBe('F1.5');
    expect(result.tdd.red.tests_added).toBe(3);
  });

  test('lockfile con JSON inválido → no bloquea, installer procede (lockfile preservado tal cual)', () => {
    fs.writeFileSync(lockPath, '{ this is not valid json');

    runInstaller(projectDir);

    const rawContent = fs.readFileSync(lockPath, 'utf-8');
    expect(rawContent).toBe('{ this is not valid json');

    const otherArtifacts = fs.readFileSync(path.join(projectDir, 'opencode.json'), 'utf-8');
    expect(otherArtifacts).toContain('"zugzbot"');
  });

  test('lockfile con schema_version: 1 → SÍ es legacy, installer bloquea', () => {
    const lock = { schema_version: 1, current_phase: 2 };
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));

    const err = runInstallerExpectError(projectDir);
    expect(err).not.toBeNull();
    expect(err.code).not.toBe(0);
    expect(err.stdout).toMatch(/INSTALACIÓN LEGACY v1\.x DETECTADA/);
  });

  test('lockfile sin schema_version ni estructura v2 → SÍ es legacy, installer bloquea', () => {
    const lock = { current_phase: 2, active_agent: 'sdd-planner' };
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));

    const err = runInstallerExpectError(projectDir);
    expect(err).not.toBeNull();
    expect(err.code).not.toBe(0);
    expect(err.stdout).toMatch(/INSTALACIÓN LEGACY v1\.x DETECTADA/);
  });

  test('header del installer muestra la versión del paquete (no hardcodeada)', () => {
    const lock = { schema_version: 2, active_phase: 'F0' };
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));

    const result = (() => {
      try {
        const out = execFileSync('node', [INSTALLER], {
          cwd: projectDir,
          encoding: 'utf-8',
          env: { ...process.env, NO_COLOR: '1' }
        });
        return { code: 0, stdout: out };
      } catch (e) {
        return { code: e.status, stdout: e.stdout?.toString() || '' };
      }
    })();

    const pkg = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf-8'));
    expect(result.stdout).toContain(`v${pkg.version}`);
  });
});
