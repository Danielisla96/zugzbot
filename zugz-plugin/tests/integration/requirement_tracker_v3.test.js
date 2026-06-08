import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, test, expect } from 'vitest';
import requirementTracker from '../../.opencode/tools/sdd_requirement_tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_ROOT = path.join(os.tmpdir(), `zugzbot-requirement-test-${Date.now()}`);

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

function ctx(projectPath) {
  return { worktree: projectPath, directory: projectPath, sessionID: 'test' };
}

beforeAll(() => {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});

describe('sdd_requirement_tracker (v3)', () => {
  test('CA2/CA3/CA4 Spanish long criteria matched against Spanish tests', async () => {
    // Reproduce the bug from ses_160f: 4 CAs were reported uncovered
    // because the matcher threshold (45%) was too high for long criteria.
    const projectPath = makeProject('criteria-long-spanish', {
      'package.json': '{}',
      '.openspec/changes/add-fastapi-sum/specs/spec.md': `---
change_name: add-fastapi-sum
---

# Spec

## 5. Criterios de Aceptación
- [ ] **CA1**: \`POST /api/v1/sum\` con body \`{"a": <number>, "b": <number>}\` retorna 200 con \`{"result": <sum>, "operation": "sum"}\`
- [ ] **CA2**: Payload con campos faltantes (\`{"a": 5}\`) retorna 422
- [ ] **CA3**: Payload con tipos inválidos (\`{"a": "foo", "b": 3}\`) retorna 422
- [ ] **CA4**: Soporte para números negativos: \`{"a": -5, "b": -3}\` → 200, \`result: -8.0\`
- [ ] **CA9**: Cobertura de linter Ruff limpia (sin errores)
`,
      'tests/test_math.py': `"""
Tests del endpoint de suma.

Cubre los criterios CA1, CA2, CA3, CA4 del spec.md.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_sum_two_positive_integers():
    """CA1: Suma de enteros positivos retorna 200 con el resultado correcto."""
    response = client.post("/api/v1/sum", json={"a": 3, "b": 5})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 8.0


def test_sum_with_negative_numbers():
    """CA4: Suma con números negativos funciona correctamente."""
    response = client.post("/api/v1/sum", json={"a": -5, "b": -3})
    assert response.status_code == 200
    assert response.json()["result"] == -8.0


def test_sum_missing_field():
    """CA2: Payload con campos faltantes retorna 422."""
    response = client.post("/api/v1/sum", json={"a": 5})
    assert response.status_code == 422


def test_sum_invalid_type():
    """CA3: Payload con tipos inválidos retorna 422."""
    response = client.post("/api/v1/sum", json={"a": "foo", "b": 3})
    assert response.status_code == 422
`
    });

    const result = await requirementTracker.execute(
      { changeName: 'add-fastapi-sum' },
      ctx(projectPath)
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('APPROVED');
    expect(parsed.criteriaCount).toBe(5);
    expect(parsed.uncoveredCount).toBe(0);
    const covered = parsed.results.filter((r) => r.covered).map((r) => r.criterio);
    expect(covered.length).toBe(5);
  });

  test('CA1/CA5/CA6 with simpler Spanish text are matched', async () => {
    const projectPath = makeProject('criteria-spanish-simple', {
      'package.json': '{}',
      '.openspec/changes/my-change/specs/spec.md': `---
change_name: my-change
---

## 5. Criterios de Aceptación
- [ ] **CA1**: Suma de dos enteros positivos
- [ ] **CA5**: Suma con decimales
- [ ] **CA6**: Suma con cero
`,
      'tests/test_math.py': `def test_ca1_sum_positive():
    """Suma de dos enteros positivos."""
    pass

def test_ca5_sum_decimal():
    """Suma con decimales."""
    pass

def test_ca6_sum_zero():
    """Suma con cero."""
    pass
`
    });

    const result = await requirementTracker.execute(
      { changeName: 'my-change' },
      ctx(projectPath)
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('APPROVED');
    expect(parsed.uncoveredCount).toBe(0);
  });
});
