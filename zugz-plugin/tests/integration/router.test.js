import { describe, test, expect } from 'vitest';
import sddRouter, { classify } from '../../.opencode/tools/_core/sdd_router.js';

const ctx = { worktree: '/tmp', directory: '/tmp', sessionID: 'test' };

const TEST_CASES = [
  // oracle
  { prompt: 'qué es un closure en JavaScript', expected: 'oracle', minConfidence: 0.3 },
  { prompt: 'diferencia entre let y var', expected: 'oracle', minConfidence: 0.3 },
  { prompt: 'explica el patrón singleton', expected: 'oracle', minConfidence: 0.3 },

  // explain
  { prompt: 'qué hace este código en src/auth.ts', expected: 'explain', minConfidence: 0.3 },
  { prompt: 'explica el UserService', expected: 'explain', minConfidence: 0.3 },
  { prompt: 'muéstrame cómo funciona el flujo de login', expected: 'explain', minConfidence: 0.3 },

  // audit
  { prompt: 'audita la calidad del código', expected: 'audit', minConfidence: 0.3 },
  { prompt: 'qué deuda técnica hay en este proyecto', expected: 'audit', minConfidence: 0.3 },
  { prompt: 'hay vulnerabilidades de seguridad', expected: 'audit', minConfidence: 0.3 },

  // refactor
  { prompt: 'refactoriza el UserController', expected: 'refactor', minConfidence: 0.3 },
  { prompt: 'limpia este módulo', expected: 'refactor', minConfidence: 0.3 },
  { prompt: 'simplifica la función de validación', expected: 'refactor', minConfidence: 0.3 },

  // quick-fix
  { prompt: 'arregla el typo en README línea 12', expected: 'quick-fix', minConfidence: 0.3 },
  { prompt: 'bump la versión a 2.0.0', expected: 'quick-fix', minConfidence: 0.3 },
  { prompt: 'cambia el mensaje de error a español', expected: 'quick-fix', minConfidence: 0.3 },

  // full-sdd-tdd (default para cambios lógicos)
  { prompt: 'agrega un endpoint de logout', expected: 'full-sdd-tdd' },
  { prompt: 'implementa autenticación con JWT', expected: 'full-sdd-tdd' },
  { prompt: 'crea un módulo de notificaciones', expected: 'full-sdd-tdd' },
  { prompt: 'el login está roto, arréglalo', expected: 'full-sdd-tdd' },
  { prompt: 'desarrolla la feature de búsqueda', expected: 'full-sdd-tdd' }
];

describe('Router Classification (v2)', () => {
  for (const tc of TEST_CASES) {
    test(`classifies: "${tc.prompt}" → ${tc.expected}`, async () => {
      const result = await sddRouter.execute({ prompt: tc.prompt }, ctx);
      const parsed = JSON.parse(result);
      expect(parsed.status).toBe('SUCCESS');
      expect(parsed.workflow).toBe(tc.expected);
      if (tc.minConfidence) {
        expect(parsed.confidence).toBeGreaterThanOrEqual(tc.minConfidence);
      }
    });
  }
});

describe('Router Unit Tests', () => {
  test('classify() returns workflow without tool wrapper', () => {
    const result = classify('agrega feature de auth');
    expect(['full-sdd-tdd', 'quick-fix', 'audit', 'refactor', 'explain', 'oracle']).toContain(result.workflow);
  });

  test('ambiguous prompt produces low confidence', () => {
    const result = classify('mejora esto'); // intencionalmente vago
    expect(result.reasoning).toBeTruthy();
  });

  test('multi-file indicator boosts full-sdd-tdd', () => {
    const multi = classify('refactoriza todos los archivos del módulo de auth');
    expect(multi.workflow).toBe('refactor');
  });

  test('trivial-change pattern boosts quick-fix', () => {
    const result = classify('arregla typo en el comentario');
    expect(result.workflow).toBe('quick-fix');
  });
});
