---
description: "Disciplina TDD estricta para subagentes de Fase 2 (RED/GREEN/REFACTOR)"
---

# 🔴🟢🔵 TDD Discipline — Zugzbot v2.0.0

> [!CRITICAL]
> Todo cambio de código en Zugzbot v2.0.0 sigue el ciclo **Red → Green → Refactor** sin excepciones. Los agentes de Fase 2 son los guardianes de este ciclo.

---

## 🎯 Principio

> **Ningún código de producción se escribe sin un test que lo exija.**

Invertimos la secuencia histórica de "spec → código → tests al final" por la disciplina TDD:

1. **RED** — Escribir el test que describe el comportamiento esperado. **El test debe fallar**.
2. **GREEN** — Escribir el **mínimo código** que hace pasar el test. Nada más.
3. **REFACTOR** — Limpiar el código, aplicar patrones, eliminar duplicación. **Los tests deben seguir pasando**.

---

## 🔴 F2-RED: Test Writer

### Responsabilidad
Leer `specs/spec.md`, extraer los criterios de aceptación BDD, y traducirlos a **tests ejecutables reales** en el framework de testing del stack (vitest/jest/pytest/go test/cargo test/junit).

### Reglas

- **PROHIBIDO** escribir código de producción. Solo tests.
- Cada criterio de aceptación BDD → al menos un test.
- Los tests deben ser **fáciles de fallar primero**: usar aserciones claras, no mocks innecesarios.
- Confirmar con `sdd_test_runner` que **todos los tests nuevos fallen** antes de transicionar a GREEN.
- Si un test pasa a la primera (no falla), **es un bug**: reportar a F1.5 para revisar el spec.

### Lockfile
Antes de transicionar a F2-GREEN, el lockfile debe registrar:
```json
"tdd": {
  "red": {
    "completed": true,
    "tests_added": <N>,
    "all_failing": true
  }
}
```

### Entregable
- `tests/unit/` o `tests/integration/` (según el spec) con tests reales.
- Entrada en lockfile: `tdd.red.completed = true`.

---

## 🟢 F2-GREEN: Implementer

### Responsabilidad
Implementar el **mínimo código de producción** que hace pasar los tests escritos en F2-RED.

### Reglas

- **PROHIBIDO** escribir tests nuevos (eso es F2-RED, ya pasó).
- **PROHIBIDO** refactorizar código (eso es F2-REFACTOR, viene después).
- Solo escribe el código necesario para que `sdd_test_runner` reporte `all_passing: true`.
- Si un test sigue fallando tras varios intentos (3), **bloquea** y vuelve a F1.5 (puede ser un spec mal definido).
- **PROHIBIDO** agregar funcionalidad extra, "de paso", no contemplada en el spec.

### Lockfile
```json
"tdd": {
  "green": {
    "completed": true,
    "tests_passing": <N>
  }
}
```

### Entregable
- Archivos de producción modificados quirúrgicamente.
- `sdd_test_runner` → `all_passing: true`.

---

## 🔵 F2-REFACTOR: Improver

### Responsabilidad
Limpiar el código de producción **sin cambiar comportamiento**. Aplicar linter, formatear, extraer duplicación, mejorar nombres, aplicar patrones.

### Reglas

- **PROHIBIDO** cambiar el comportamiento observable. Los tests deben seguir **100% verdes** durante todo el refactor.
- Corre linter (`sdd_linter`) y formateador del stack después de cada cambio mayor.
- **PROHIBIDO** agregar features nuevas. Si descubres que falta algo, vuelve a F1.5.
- Si algún test falla durante el refactor → **rollback** del último cambio y reintentar.
- Limita el refactor a **2-3 pasadas**. Si sigue habiendo mejoras posibles, anótalas en `brain.md` y termina la fase.

### Lockfile
```json
"tdd": {
  "refactor": {
    "completed": true,
    "linter_clean": true
  }
}
```

### Entregable
- Código limpio y formateado.
- `sdd_linter` → `0 errors`.
- `sdd_test_runner` → `all_passing: true`.

---

## 🚦 Enforcement en `sdd_transition`

La herramienta `sdd_transition` rechaza transiciones inválidas:

| Transición | Pre-requisito en lockfile |
| :--- | :--- |
| F1.5 → F2-RED | `workflow === "full-sdd-tdd"`, HIL-A aprobado |
| F2-RED → F2-GREEN | `tdd.red.completed === true` |
| F2-GREEN → F2-REFACTOR | `tdd.green.completed === true` |
| F2-REFACTOR → F3 | `tdd.refactor.completed === true` Y `sdd_test_runner` reporta `all_passing` |
| F3 → F4 | `validation_report.md` aprobado |
| F4 → F5 | HIL-B aprobado Y `tasks[].status !== "pending"` |

Si un subagente intenta invocar `sdd_transition` sin cumplir el pre-requisito, recibe un error `[SDD Transition Blocked]` y debe esperar.

---

## 🔁 Corrective Loops en TDD

Si en cualquier sub-fase de F2 algo sale mal:

- F2-RED detecta spec mal definido → `direction: "backward"` a F1.5.
- F2-GREEN no logra pasar tests en 3 intentos → `direction: "backward"` a F1.5.
- F2-REFACTOR rompe tests → `direction: "backward"` a F2-GREEN, re-implementar sin el refactor.

Cada corrective loop incrementa `lockfile.retry_count`. Si llega a 3 → escalar a humano.
