import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import sddTransition from '../../.opencode/tools/sdd_transition.js';
import lockManager from '../../.opencode/tools/sdd_lock_manager.js';
import specReviewer from '../../.opencode/tools/sdd_spec_reviewer.js';
import brainCurator from '../../.opencode/tools/sdd_brain_curator.js';
import stackDetector from '../../.opencode/tools/sdd_stack_detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_SRC = path.resolve(__dirname, '..', '..', 'profiles');

const TMP_ROOT = path.join(os.tmpdir(), `zugzbot-tdd-test-${Date.now()}`);

function makeProject(name) {
  const projectPath = path.join(TMP_ROOT, name);
  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'profiles'), { recursive: true });
  for (const f of fs.readdirSync(PROFILES_SRC)) {
    if (f.endsWith('.json')) {
      fs.copyFileSync(path.join(PROFILES_SRC, f), path.join(projectPath, 'profiles', f));
    }
  }
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

describe('TDD Cycle Enforcement (v2)', () => {
  test('full cycle: F0 → F1 → F1.5 → F2-RED → F2-GREEN → F2-REFACTOR → F3', async () => {
    const projectPath = makeProject('tdd-full-cycle');
    fs.writeFileSync(path.join(projectPath, 'package.json'), '{"name":"test","version":"1.0.0"}');
    fs.writeFileSync(path.join(projectPath, 'tsconfig.json'), '{}');
    const context = ctx(projectPath);

    // F0: Detect stack
    const detectResult = await stackDetector.execute({ action: 'detect' }, context);
    const stack = JSON.parse(detectResult);
    expect(stack.stack_profile).toBe('node-typescript');

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ stack_profile: 'node-typescript' })
    }, context);

    // F1: Crear spec
    const changeName = 'agregar-validacion-email';
    const specPath = path.join(projectPath, '.openspec/changes', changeName, 'specs/spec.md');
    fs.mkdirSync(path.dirname(specPath), { recursive: true });
    fs.writeFileSync(specPath, `# Plano Técnico de Especificación: ${changeName}

## 1. Diagnóstico y Archivos Afectados
- \`src/validators.ts\` (Líneas 1-50: agregar función validateEmail)

## 2. Consenso de Encuesta con el Usuario
- **Pregunta A**: Decisión: usar regex estándar RFC 5322 simplificado.

## 3. Propuesta de Solución y Arquitectura
Función pura validateEmail(email: string): boolean que retorna true si el email es válido sintácticamente.

## 4. Especificaciones BDD (Comportamiento)
Feature: Validación de email
  Scenario: Email válido
    Given un email "user@example.com"
    When valido con validateEmail
    Then retorna true

  Scenario: Email inválido
    Given un email "not-an-email"
    When valido con validateEmail
    Then retorna false

## 5. Criterios de Aceptación y Calidad (QA)
- [ ] Criterio 1: validateEmail retorna true para "user@example.com"
- [ ] Criterio 2: validateEmail retorna false para "not-an-email"
- [ ] Criterio 3: validateEmail retorna false para string vacío
`);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({ change_name: changeName })
    }, context);

    // F0 → F1
    let r = await sddTransition.execute({
      nextPhase: 'F1', status: 'in_progress', reason: 'Spec creado'
    }, context);
    expect(r).not.toContain('Blocked');

    // F1 → F1.5
    r = await sddTransition.execute({
      nextPhase: 'F1.5', status: 'in_progress', reason: 'Spec listo para revisión'
    }, context);
    expect(r).not.toContain('Blocked');

    // F1.5: validate spec
    const review = await specReviewer.execute({ action: 'validate' }, context);
    const reviewParsed = JSON.parse(review);
    expect(reviewParsed.status).toBe('SUCCESS');
    expect(reviewParsed.verdict).toBe('APPROVED');
    expect(reviewParsed.score).toMatch(/8\/8/);

    // F1.5 → F2-RED
    r = await sddTransition.execute({
      nextPhase: 'F2-RED', status: 'spec_approved', reason: 'Spec aprobado por F1.5'
    }, context);
    expect(r).not.toContain('Blocked');

    // F2-RED: tests fallan (simulado marcando red)
    await lockManager.execute({
      action: 'set_tdd',
      patch: JSON.stringify({ red: { completed: true, tests_added: 3, all_failing: true } })
    }, context);

    // F2-RED → F2-GREEN
    r = await sddTransition.execute({
      nextPhase: 'F2-GREEN', status: 'in_progress', reason: 'Tests rojos escritos'
    }, context);
    expect(r).not.toContain('Blocked');

    // F2-GREEN: implement mínimo
    await lockManager.execute({
      action: 'set_tdd',
      patch: JSON.stringify({ green: { completed: true, tests_passing: 3 } })
    }, context);

    // F2-GREEN → F2-REFACTOR
    r = await sddTransition.execute({
      nextPhase: 'F2-REFACTOR', status: 'in_progress', reason: 'GREEN achieved'
    }, context);
    expect(r).not.toContain('Blocked');

    // F2-REFACTOR: lint clean
    await lockManager.execute({
      action: 'set_tdd',
      patch: JSON.stringify({ refactor: { completed: true, linter_clean: true } })
    }, context);

    // F2-REFACTOR → F3
    r = await sddTransition.execute({
      nextPhase: 'F3', status: 'in_progress', reason: 'Refactor completo'
    }, context);
    expect(r).not.toContain('Blocked');

    // Verificar estado final del lockfile
    const finalLock = await lockManager.execute({ action: 'read' }, context);
    const lock = JSON.parse(finalLock).lockfile;
    expect(lock.active_phase).toBe('F3');
    expect(lock.tdd.red.completed).toBe(true);
    expect(lock.tdd.green.completed).toBe(true);
    expect(lock.tdd.refactor.completed).toBe(true);
  });

  test('REJECTS advance to F2-GREEN if tdd.red not completed', async () => {
    const projectPath = makeProject('tdd-no-red');
    const context = ctx(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({
        change_name: 'test-feature',
        stack_profile: 'node-typescript',
        active_phase: 'F1.5'
      })
    }, context);

    const r2 = await sddTransition.execute({
      nextPhase: 'F2-GREEN', status: 'in_progress', reason: 'Sin RED completo'
    }, context);
    expect(r2).toContain('Blocked');
    expect(r2).toContain('tdd.red.completed');
  });

  test('REJECTS advance to F2-REFACTOR if tdd.green not completed', async () => {
    const projectPath = makeProject('tdd-no-green');
    const context = ctx(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({
        change_name: 'test-feature',
        active_phase: 'F2-RED'
      })
    }, context);
    await lockManager.execute({
      action: 'set_tdd',
      patch: JSON.stringify({ red: { completed: true, tests_added: 2, all_failing: true } })
    }, context);

    const r = await sddTransition.execute({
      nextPhase: 'F2-REFACTOR', status: 'in_progress', reason: 'Sin GREEN'
    }, context);
    expect(r).toContain('Blocked');
    expect(r).toContain('tdd.green.completed');
  });

  test('REJECTS advance to F3 if tdd.refactor.linter_clean is false', async () => {
    const projectPath = makeProject('tdd-dirty-lint');
    const context = ctx(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({
        change_name: 'test-feature',
        active_phase: 'F2-REFACTOR'
      })
    }, context);
    await lockManager.execute({
      action: 'set_tdd',
      patch: JSON.stringify({
        red: { completed: true, tests_added: 2, all_failing: true },
        green: { completed: true, tests_passing: 2 },
        refactor: { completed: true, linter_clean: false }
      })
    }, context);

    const r = await sddTransition.execute({
      nextPhase: 'F3', status: 'in_progress', reason: 'Linter sucio'
    }, context);
    expect(r).toContain('Blocked');
    expect(r).toContain('linter_clean');
  });

  test('REJECTS advance to F2-RED from F1.5 without spec_approved status', async () => {
    const projectPath = makeProject('tdd-no-hil');
    const context = ctx(projectPath);

    await lockManager.execute({
      action: 'update',
      patch: JSON.stringify({
        change_name: 'test-feature',
        active_phase: 'F1.5',
        status: 'in_progress'
      })
    }, context);

    const r = await sddTransition.execute({
      nextPhase: 'F2-RED', status: 'in_progress', reason: 'Sin HIL-A'
    }, context);
    expect(r).toContain('Blocked');
    expect(r).toContain('HIL-A');
  });
});

describe('Spec Reviewer (v2)', () => {
  test('REJECTS spec with vague criteria', async () => {
    const projectPath = makeProject('spec-vague');
    const context = ctx(projectPath);

    const specPath = path.join(projectPath, 'specs/vague.md');
    fs.mkdirSync(path.dirname(specPath), { recursive: true });
    fs.writeFileSync(specPath, `# Plano Técnico

## 1. Diagnóstico
- \`src/foo.ts\`

## 2. Consenso
- OK

## 3. Propuesta
Mejorar un poco la experiencia del usuario y optimizar si se puede el rendimiento general.

## 4. Especificaciones BDD

## 5. Criterios
- [ ] Mejorar experiencia
`);

    const result = await specReviewer.execute({ action: 'validate', specPath }, context);
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('FAILED');
    expect(parsed.verdict).toBe('REJECTED');
    const failedNames = parsed.failed_checks.map((c) => c.name);
    expect(failedNames).toContain('bdd_scenarios');
    expect(failedNames).toContain('testability');
  });

  test('APPROVES well-formed spec', async () => {
    const projectPath = makeProject('spec-good');
    const context = ctx(projectPath);

    const specPath = path.join(projectPath, 'specs/good.md');
    fs.mkdirSync(path.dirname(specPath), { recursive: true });
    fs.writeFileSync(specPath, `# Plano Técnico de Especificación: my-feature

## 1. Diagnóstico y Archivos Afectados
- \`src/api.ts\` (Líneas 10-50: agregar handler)

## 2. Consenso de Encuesta con el Usuario
- **Pregunta A**: Decisión: usar JWT.

## 3. Propuesta de Solución y Arquitectura
Endpoint POST /login que retorna JWT.

## 4. Especificaciones BDD (Comportamiento)
Feature: Login
  Scenario: Login exitoso
    Given credenciales válidas
    When POST /login
    Then retorna 200 con JWT

## 5. Criterios de Aceptación y Calidad (QA)
- [ ] Criterio 1: POST /login con credenciales válidas retorna 200
- [ ] Criterio 2: POST /login con password incorrecto retorna 401
`);

    const result = await specReviewer.execute({ action: 'validate', specPath }, context);
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.verdict).toBe('APPROVED');
  });

  test('fixes non-standard spec to make it pass validation', async () => {
    const projectPath = makeProject('spec-to-fix');
    const context = ctx(projectPath);

    const specPath = path.join(projectPath, 'specs/bad-format.md');
    fs.mkdirSync(path.dirname(specPath), { recursive: true });
    fs.writeFileSync(specPath, `# Plano Técnico Incorrecto

## 1. Diagnóstico
- \`src/api.ts\` Líneas 10-50: agregar handler

### 3.1 Principios Arquitectónicos bajo Diagnóstico

## 2. Consenso de Encuesta con el Usuario
- **Pregunta A**: Decisión: usar JWT.

## 3. Propuesta
Endpoint POST /login que retorna JWT.

### 4.1 Detalle de Propuesta

## 4. Especificaciones
Dado un usuario registrado
Cuando hace POST
Entonces recibe token
Y status 200

### 3.1 Escenario Detallado

## 5. Criterios
- [ ] Criterio 1: POST /login con credenciales válidas retorna 200
`);

    // First, validate should fail
    const validateRes = await specReviewer.execute({ action: 'validate', specPath }, context);
    const validateParsed = JSON.parse(validateRes);
    expect(validateParsed.status).toBe('FAILED');

    // Run fix
    const fixRes = await specReviewer.execute({ action: 'fix', specPath }, context);
    const fixParsed = JSON.parse(fixRes);
    expect(fixParsed.status).toBe('SUCCESS');
    expect(fixParsed.verdict).toBe('APPROVED');

    // Verify file content was corrected
    const fixedContent = fs.readFileSync(specPath, 'utf-8');
    expect(fixedContent).toContain('# Plano Técnico');
    expect(fixedContent).toContain('## 1. Diagnóstico y Archivos Afectados');
    expect(fixedContent).toContain('(Líneas 10-50)');
    expect(fixedContent).toContain('### 1.1 Principios Arquitectónicos bajo Diagnóstico');
    expect(fixedContent).toContain('## 3. Propuesta de Solución');
    expect(fixedContent).toContain('### 3.1 Detalle de Propuesta');
    expect(fixedContent).toContain('## 4. Especificaciones BDD');
    expect(fixedContent).toContain('### 4.1 Escenario Detallado');
    expect(fixedContent).toContain('Given');
    expect(fixedContent).toContain('When');
    expect(fixedContent).toContain('Then');
    expect(fixedContent).toContain('And');
  });
});

describe('Brain Curator (v2)', () => {
  test('analyzes brain and detects low-value entries', async () => {
    const projectPath = makeProject('brain-test');
    const context = ctx(projectPath);

    const brainPath = path.join(projectPath, '.openspec/brain.md');
    fs.mkdirSync(path.dirname(brainPath), { recursive: true });
    fs.writeFileSync(brainPath, `# Cerebro

## Índice
| ID | Categoría | Tag | Problema |
|---|---|---|---|
| L001 | typo | fix-simple | Typo en README |
| L002 | backend | prisma-timezone | Workaround Prisma con timezone UTC |

## Lecciones

### L001: fix-simple
- **Tags**: #typo #fix-simple
- **Problema**: Typo en README
- **Solución**: Cambiar color a colour
- **Fecha**: 2026-01-01

### L002: prisma-timezone
- **Tags**: #backend #prisma-timezone
- **Problema**: Prisma retorna fechas con timezone incorrecto
- **Solución**: Usar .toISOString() y parsear con date-fns-tz para evitar drift de zona horaria
- **Fecha**: 2026-01-02
`);

    const result = await brainCurator.execute({ action: 'analyze' }, context);
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.total).toBe(2);
    expect(parsed.low_value).toBeGreaterThanOrEqual(1);
  });

  test('detects duplicates', async () => {
    const projectPath = makeProject('brain-dups');
    const context = ctx(projectPath);

    const brainPath = path.join(projectPath, '.openspec/brain.md');
    fs.mkdirSync(path.dirname(brainPath), { recursive: true });
    fs.writeFileSync(brainPath, `# Cerebro

## Lecciones

### L001: prisma-timezone
- **Tags**: #backend #prisma-timezone
- **Problema**: Prisma retorna fechas con timezone incorrecto en producción
- **Solución**: Usar UTC explícito en la conexión
- **Fecha**: 2026-01-01

### L002: prisma-timezone
- **Tags**: #backend #prisma-timezone
- **Problema**: Prisma retorna fechas con timezone incorrecto en producción
- **Solución**: Usar UTC explícito
- **Fecha**: 2026-01-02
`);

    const result = await brainCurator.execute({ action: 'analyze' }, context);
    const parsed = JSON.parse(result);
    expect(parsed.duplicates).toBeGreaterThanOrEqual(1);
  });
});
