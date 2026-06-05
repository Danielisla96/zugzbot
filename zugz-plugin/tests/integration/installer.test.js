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
