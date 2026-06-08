import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import stackDetector from '../../.opencode/tools/sdd_stack_detector.js';
import lockManager from '../../.opencode/tools/sdd_lock_manager.js';
import sddTransition from '../../.opencode/tools/sdd_transition.js';
import specReviewer from '../../.opencode/tools/sdd_spec_reviewer.js';
import router from '../../.opencode/tools/sdd_router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_SRC = path.resolve(__dirname, '..', '..', 'profiles');

const DEMO_ROOT = path.join(os.tmpdir(), `zugzbot-demo-e2e-${Date.now()}`);

function setupNodeTsProject() {
  const projectPath = path.join(DEMO_ROOT, 'node-ts-demo');
  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'tests/unit'), { recursive: true });

  fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify({
    name: 'node-ts-demo',
    version: '0.1.0',
    scripts: {
      test: 'vitest run',
      lint: 'echo "lint passed"'
    }
  }, null, 2));

  fs.writeFileSync(path.join(projectPath, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', module: 'ESNext' }
  }, null, 2));

  fs.writeFileSync(path.join(projectPath, 'vitest.config.js'), `export default { test: { include: ['tests/**/*.test.ts'] } };`);

  fs.mkdirSync(path.join(projectPath, 'profiles'), { recursive: true });
  for (const f of fs.readdirSync(PROFILES_SRC)) {
    if (f.endsWith('.json')) {
      fs.copyFileSync(path.join(PROFILES_SRC, f), path.join(projectPath, 'profiles', f));
    }
  }

  fs.mkdirSync(path.join(projectPath, '.openspec'), { recursive: true });

  return projectPath;
}

function ctx(projectPath) {
  return { worktree: projectPath, directory: projectPath, sessionID: 'test' };
}

beforeAll(() => {
  fs.mkdirSync(DEMO_ROOT, { recursive: true });
});

afterAll(() => {
  fs.rmSync(DEMO_ROOT, { recursive: true, force: true });
});

describe('E2E: Zugzbot v2.0.0 Demo Flow', () => {
  test('Demo: "agrega función validateEmail" → full-sdd-tdd → TDD cycle → commit-ready', async () => {
    const projectPath = setupNodeTsProject();
    const context = ctx(projectPath);

    // === STEP 1: Router classifies the intent ===
    const userPrompt = 'agrega una función validateEmail que valide formato de emails';
    const classification = JSON.parse(
      await router.execute({ prompt: userPrompt }, context)
    );
    expect(classification.workflow).toBe('full-sdd-tdd');
    expect(classification.confidence).toBeGreaterThan(0.3);

    // === STEP 2: F0 — Stack detection ===
    const stackResult = JSON.parse(
      await stackDetector.execute({ action: 'detect' }, context)
    );
    expect(stackResult.stack_profile).toBe('node-typescript');

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'node-typescript' })
    }, context);

    // === STEP 3: F1 — Planner creates spec ===
    const changeName = 'agregar-validate-email';
    const specPath = path.join(projectPath, '.openspec/changes', changeName, 'specs/spec.md');
    fs.mkdirSync(path.dirname(specPath), { recursive: true });

    const specContent = `---
spec_version: "1.0"
change_name: "${changeName}"
modo_qa: "automatizado"
design_skill: "ninguna"
archivos_afectados:
  - "src/validators.ts (Líneas 1-50)"
  - "tests/unit/validators.test.ts (Líneas 1-1)"
criterios_aceptacion:
  - id: "CA1"
    descripcion: 'validateEmail("user@example.com") retorna true'
  - id: "CA2"
    descripcion: 'validateEmail("not-an-email") retorna false'
  - id: "CA3"
    descripcion: 'validateEmail("") retorna false'
  - id: "CA4"
    descripcion: "validateEmail(null) retorna false sin throw"
---

# Especificación Técnica del Cambio

## 1. Diagnóstico y Archivos Afectados
- \`src/validators.ts\` (Líneas 1-50: nueva función validateEmail)
- \`tests/unit/validators.test.ts\` (Líneas 1-1: nuevo test file)

## 2. Consenso con el Usuario
- **Pregunta A**: Decisión adoptada: regex simplificado (no RFC 5322 completo).

## 3. Propuesta de Solución
Función pura \`validateEmail(email: string): boolean\` que retorna true si el email tiene formato válido.
Estrategia: regex estándar para casos comunes (user@domain.tld), rechaza strings vacíos y formatos sin @.

## 4. Especificaciones de Comportamiento (BDD)
Escenario: Email válido estándar
  Dado un email "user@example.com"
  Cuando valido con validateEmail
  Entonces retorna true

Escenario: Email inválido sin @
  Dado un email "not-an-email"
  Cuando valido con validateEmail
  Entonces retorna false

Escenario: String vacío
  Dado un email ""
  Cuando valido con validateEmail
  Entonces retorna false

## 5. Criterios de Aceptación
- [ ] **CA1**: validateEmail("user@example.com") retorna true
- [ ] **CA2**: validateEmail("not-an-email") retorna false
- [ ] **CA3**: validateEmail("") retorna false
- [ ] **CA4**: validateEmail(null) retorna false sin throw
`;
    fs.writeFileSync(specPath, specContent);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ change_name: changeName })
    }, context);

    await sddTransition.execute({
      nextPhase: 'F1', status: 'in_progress', reason: 'Spec creado'
    }, context);

    // === STEP 4: F1.5 — Spec reviewer validates testability ===
    const review = JSON.parse(
      await specReviewer.execute({ action: 'validate' }, context)
    );
    expect(review.verdict).toBe('APPROVED');
    expect(review.score).toMatch(/8\/8/);

    await sddTransition.execute({
      nextPhase: 'F1.5', status: 'in_progress', reason: 'Spec listo para revisión'
    }, context);

    // === STEP 5: HIL-A (user approves spec) ===
    await sddTransition.execute({
      nextPhase: 'F2-RED', status: 'spec_approved', reason: 'Spec aprobado por HIL-A'
    }, context);

    // === STEP 6: F2-RED — Tests written (failing) ===
    const testPath = path.join(projectPath, 'tests/unit/validators.test.ts');
    fs.writeFileSync(testPath, `import { describe, it, expect } from 'vitest';
import { validateEmail } from '../../src/validators';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should return false for invalid email without @', () => {
    expect(validateEmail('not-an-email')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('should return false for null without throwing', () => {
    expect(validateEmail(null as any)).toBe(false);
  });
});
`);

    await lockManager.execute({
      action: 'set_tdd',
      patch: JSON.stringify({ red: { completed: true, tests_added: 4, all_failing: true } })
    }, context);

    // === STEP 7: F2-GREEN — Minimal code that passes tests ===
    const validatorsPath = path.join(projectPath, 'src/validators.ts');
    fs.writeFileSync(validatorsPath, `export function validateEmail(email: string | null): boolean {
  if (email === null || email === undefined) return false;
  if (typeof email !== 'string') return false;
  if (email.trim() === '') return false;
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}
`);

    await lockManager.execute({
      action: 'set_tdd',
      patch: JSON.stringify({ green: { completed: true, tests_passing: 4 } })
    }, context);

    // === STEP 8: F2-REFACTOR — Linter clean ===
    await lockManager.execute({
      action: 'set_tdd',
      patch: JSON.stringify({ refactor: { completed: true, linter_clean: true } })
    }, context);

    // === STEP 9: F3 — Validator runs ===
    const f3 = await sddTransition.execute({
      nextPhase: 'F3', status: 'in_progress', reason: 'Refactor completo, linter limpio'
    }, context);
    expect(f3).not.toContain('Blocked');

    // === STEP 10: Verify final state ===
    const finalLock = JSON.parse(
      await lockManager.execute({ action: 'read' }, context)
    ).lockfile;

    expect(finalLock.active_phase).toBe('F3');
    expect(finalLock.change_name).toBe(changeName);
    expect(finalLock.stack_profile).toBe('node-typescript');
    expect(finalLock.tdd.red.completed).toBe(true);
    expect(finalLock.tdd.green.completed).toBe(true);
    expect(finalLock.tdd.refactor.completed).toBe(true);
    expect(finalLock.tdd.refactor.linter_clean).toBe(true);

    // === STEP 11: Verify files exist on disk ===
    expect(fs.existsSync(validatorsPath)).toBe(true);
    expect(fs.existsSync(testPath)).toBe(true);
    expect(fs.existsSync(specPath)).toBe(true);

    // === STEP 12: Verify spec content quality (template v4) ===
    const savedSpec = fs.readFileSync(specPath, 'utf-8');
    expect(savedSpec).toContain('validateEmail');
    expect(savedSpec).toContain('Dado');
    expect(savedSpec).toContain('Cuando');
    expect(savedSpec).toContain('Entonces');
  });

  test('Demo: "arregla typo en README" → quick-fix workflow', async () => {
    const projectPath = setupNodeTsProject();
    const context = ctx(projectPath);

    const userPrompt = 'arregla el typo en README línea 5';
    const classification = JSON.parse(
      await router.execute({ prompt: userPrompt }, context)
    );
    expect(classification.workflow).toBe('quick-fix');
  });

  test('Demo: "audita la calidad" → audit workflow', async () => {
    const classification = JSON.parse(
      await router.execute({ prompt: 'audita la calidad del código' }, ctx('/tmp'))
    );
    expect(classification.workflow).toBe('audit');
  });

  test('Demo: "explica este código" → explain workflow', async () => {
    const classification = JSON.parse(
      await router.execute({ prompt: 'explica el UserController' }, ctx('/tmp'))
    );
    expect(classification.workflow).toBe('explain');
  });

  test('Demo: "qué es un closure" → oracle workflow', async () => {
    const classification = JSON.parse(
      await router.execute({ prompt: 'qué es un closure en JavaScript' }, ctx('/tmp'))
    );
    expect(classification.workflow).toBe('oracle');
  });

  test('Demo: "refactoriza" → refactor workflow', async () => {
    const classification = JSON.parse(
      await router.execute({ prompt: 'refactoriza el UserService' }, ctx('/tmp'))
    );
    expect(classification.workflow).toBe('refactor');
  });
});
