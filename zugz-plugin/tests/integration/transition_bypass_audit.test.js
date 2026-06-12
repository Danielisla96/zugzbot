import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import sddTransition from '../../.opencode/tools/_core/sdd_transition.js';
import lockManager from '../../.opencode/tools/_core/sdd_lock_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_ROOT = path.join(os.tmpdir(), `zugzbot-bypass-audit-${Date.now()}`);
const PROFILES_SRC = path.resolve(__dirname, '..', '..', 'profiles');

function makeProject(name) {
  const projectPath = path.join(TMP_ROOT, name);
  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'profiles'), { recursive: true });
  for (const f of fs.readdirSync(PROFILES_SRC)) {
    if (f.endsWith('.json')) {
      fs.copyFileSync(path.join(PROFILES_SRC, f), path.join(projectPath, 'profiles', f));
    }
  }
  fs.writeFileSync(path.join(projectPath, 'package.json'), '{"name":"test","version":"1.0.0"}');
  fs.writeFileSync(path.join(projectPath, 'tsconfig.json'), '{}');
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

describe('sdd_transition bypassAudit (v3)', () => {
  test('F5 transition blocked without bypassAudit when audit fails', async () => {
    const projectPath = makeProject('bypass-blocked');
    const context = ctx(projectPath);
    
    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({
        change_name: 'bypass-test',
        stack_profile: 'node-typescript'
      })
    }, context);

    // Spec con criterios
    const specPath = path.join(projectPath, '.openspec/changes/bypass-test/specs/spec.md');
    fs.mkdirSync(path.dirname(specPath), { recursive: true });
    fs.writeFileSync(specPath, `---
change_name: bypass-test
---

## 5. Criterios de Aceptación
- [ ] **CA1**: Funcionalidad X implementada con algoritmo cuántico de teleportación
- [ ] **CA2**: Validación Y agregada con protocolo de sincronización interestelar
`);

    // Test file con contenido NO relacionado (para forzar FAILED en el auditor)
    const testPath = path.join(projectPath, 'tests/test_unrelated.js');
    fs.mkdirSync(path.dirname(testPath), { recursive: true });
    fs.writeFileSync(testPath, `describe('something else', () => {
  test('foo', () => { expect(1).toBe(1); });
});
`);

    // Mover lockfile a F5 (transición rápida por todas las fases)
    await sddTransition.execute({
      nextPhase: 'F1',
      status: 'in_progress',
      reason: 'init',
      changeName: 'bypass-test',
      workflow: 'full-sdd-tdd'
    }, context);
    await sddTransition.execute({
      nextPhase: 'F1.5',
      status: 'in_progress',
      reason: 'spec created',
      changeName: 'bypass-test'
    }, context);
    await sddTransition.execute({
      nextPhase: 'F2-RED',
      status: 'in_progress',
      reason: 'spec approved',
      changeName: 'bypass-test'
    }, context);
    await sddTransition.execute({
      nextPhase: 'F2-GREEN',
      status: 'in_progress',
      reason: 'red done',
      changeName: 'bypass-test'
    }, context);
    await sddTransition.execute({
      nextPhase: 'F2-REFACTOR',
      status: 'in_progress',
      reason: 'green done',
      changeName: 'bypass-test'
    }, context);
    await sddTransition.execute({
      nextPhase: 'F3',
      status: 'in_progress',
      reason: 'refactor done',
      changeName: 'bypass-test'
    }, context);
    await sddTransition.execute({
      nextPhase: 'F4',
      status: 'in_progress',
      reason: 'validated',
      changeName: 'bypass-test'
    }, context);

    // F5 sin bypassAudit: debe ser bloqueado por requirement_tracker
    const result = await sddTransition.execute({
      nextPhase: 'F5',
      status: 'in_progress',
      reason: 'deploying',
      changeName: 'bypass-test'
    }, context);
    const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
    expect(resultStr).toContain('SDD Transition Blocked');
  });

  test('F5 transition allowed WITH bypassAudit, audit entry written to phase_history.jsonl', async () => {
    const projectPath = makeProject('bypass-allowed');
    const context = ctx(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({
        change_name: 'bypass-allowed',
        stack_profile: 'node-typescript'
      })
    }, context);

    const specPath = path.join(projectPath, '.openspec/changes/bypass-allowed/specs/spec.md');
    fs.mkdirSync(path.dirname(specPath), { recursive: true });
    fs.writeFileSync(specPath, `---
change_name: bypass-allowed
---

## 5. Criterios de Aceptación
- [ ] **CA1**: Funcionalidad X implementada con algoritmo cuántico de teleportación
`);

    // Test file NO relacionado (auditor fallaría)
    const testPath = path.join(projectPath, 'tests/test_unrelated.js');
    fs.mkdirSync(path.dirname(testPath), { recursive: true });
    fs.writeFileSync(testPath, `describe('other', () => { test('x', () => {}); });`);

    // Atravesar fases rápidamente
    const phases = ['F1', 'F1.5', 'F2-RED', 'F2-GREEN', 'F2-REFACTOR', 'F3', 'F4'];
    for (const phase of phases) {
      await sddTransition.execute({
        nextPhase: phase,
        status: 'in_progress',
        reason: 'fast-forward',
        changeName: 'bypass-allowed'
      }, context);
    }

    // F5 CON bypassAudit
    const result = await sddTransition.execute({
      nextPhase: 'F5',
      status: 'in_progress',
      reason: 'manual approval of QA',
      changeName: 'bypass-allowed',
      bypassAudit: { reason: 'CA1 verificado manualmente en staging; el matcher no detectó el test por cambio de nombre' }
    }, context);
    const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
    expect(resultStr).not.toContain('SDD Transition Blocked');

    // Verificar que el audit entry se escribió a phase_history.jsonl
    const historyPath = path.join(projectPath, '.openspec/changes/bypass-allowed/phase_history.jsonl');
    expect(fs.existsSync(historyPath)).toBe(true);
    const history = fs.readFileSync(historyPath, 'utf-8').split('\n').filter(Boolean);
    const lastEntry = JSON.parse(history[history.length - 1]);
    expect(lastEntry.phase).toBe('F5');
    expect(lastEntry.bypass_audit).toBeTruthy();
    expect(lastEntry.bypass_audit.reason).toContain('verificado manualmente');
  });
});
