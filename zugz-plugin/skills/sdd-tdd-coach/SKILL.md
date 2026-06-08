---
name: sdd-tdd-coach
description: Coach de disciplina TDD para guiar a los subagentes F2-RED, F2-GREEN y F2-REFACTOR en el ciclo Red-Green-Refactor.
---

# 🔴🟢🔵 TDD Coach

> [!IMPORTANT]
> Esta skill es invocada por los agentes de Fase 2 (RED/GREEN/REFACTOR) cuando necesitan refuerzo sobre la disciplina TDD. NO es un agente, es una guía conceptual que el LLM consulta para tomar mejores decisiones.

---

## 🎯 Cuándo Invocar Esta Skill

| Fase | Cuándo consultar |
| :--- | :--- |
| **F2-RED** | Antes de escribir el primer test, para confirmar que el test describe un comportamiento testeable y no duplica código existente. |
| **F2-GREEN** | Cuando un test sigue fallando tras 2 intentos: ¿es el spec, el test, o el código? Esta skill ayuda a diagnosticar. |
| **F2-REFACTOR** | Antes de refactorizar, para confirmar que NO se está cambiando comportamiento. |

---

## 🔴 Disciplina F2-RED

### ✅ Hacer
- Mapear 1 criterio BDD → 1 test concreto y ejecutable.
- Usar el test runner del stack (vitest, jest, pytest, go test, cargo test, mvn test).
- Escribir tests que **fallen** y reportar el error con claridad.
- Cubrir al menos el caso principal y 1-2 edge cases.
- Tests deben ser **independientes** entre sí.

### ❌ No hacer
- No escribas código de producción (ni una línea, ni siquiera "lo obvio").
- No escribas tests que pasen a la primera (eso es GREEN, no RED).
- No copies tests existentes solo para tener más cantidad.
- No pruebes implementación interna (mock functions vs. lo que retorna la API real).

### Señales de que vas bien
- `sdd_test_runner verify-red` reporta `all_failing: true`.
- Los errores son legibles y apuntan a la funcionalidad esperada.
- Cobertura BDD: 1 escenario → al menos 1 test.

### Señales de alarma 🚨
- Tests pasan sin código → bug, vuelve a F1.5.
- Tests fallan por errores de import/sintaxis → fix el test, NO la implementación.
- Tests son demasiado complejos → divide en 2-3 tests más simples.

---

## 🟢 Disciplina F2-GREEN

### ✅ Hacer
- Escribir el **mínimo código** que hace pasar los tests.
- Si el primer intento pasa 5/5 tests pero no escribiste el código, es bug.
- Mantener el código lo más simple posible. Resistir la tentación de "mejorarlo".
- Si necesitas helpers, ponlos privados al módulo.

### ❌ No hacer
- No refactorices (eso es F2-REFACTOR).
- No agregues features no pedidas en el spec.
- No optimices performance prematuramente.
- No agregues logging/configuración "por si acaso".

### Estrategia del mínimo viable
1. **Identifica el test más simple** y hazlo pasar.
2. **Luego el siguiente**, y así.
3. Si un test requiere cambios grandes, considera si tu test es correcto.

### Señales de alarma 🚨
- Más de 100 líneas de código nuevo por test → vuelve a revisar el spec.
- Estás creando 3+ archivos para hacer pasar 1 test → over-engineering.
- El código tiene duplicación evidente → anota para F2-REFACTOR, NO refactorices ahora.

---

## 🔵 Disciplina F2-REFACTOR

### ✅ Hacer
- Cambiar nombres para mayor claridad.
- Extraer funciones duplicadas.
- Aplicar patrones del stack (early return, composition, immutability).
- Formatear (prettier, black, gofmt, rustfmt).
- Aplicar linter y verificar 0 errors.

### ❌ No hacer
- **NO cambies comportamiento**. Los tests deben seguir 100% verdes.
- NO agregues features nuevas (vuelve a F1.5 si las necesitas).
- NO reescribas archivos completos. Refactor incremental.
- NO toques el `spec.md` ni reportes de otras fases.

### Regla de oro: refactor atómico
- 1 cambio → 1 corrida de tests.
- Si un test falla → **rollback** del último cambio.
- 2-3 pasadas de refactor es suficiente. El resto, anótalo en `brain.md`.

### Linter estricto
- `sdd_linter verify-clean` debe retornar `errors: 0` antes de cerrar F2.
- Warnings son aceptables, errors no.
- Si hay autofix disponible (eslint --fix), aplícalo.

---

## 🔁 Corrective Loops

| Situación | Acción |
| :--- | :--- |
| F2-RED no logra hacer fallar tests | `direction: "backward"` a F1.5 (spec mal definido) |
| F2-GREEN no pasa tests en 3 intentos | `direction: "backward"` a F1.5 |
| F2-REFACTOR rompe tests | `direction: "backward"` a F2-GREEN, reimplementar sin el refactor |
| Tests no compilan (errores de sintaxis) | Fix el test primero, luego reintentar |

Cada corrective loop incrementa `lockfile.retry_count`. Si llega a 3, **escalar a humano** vía el Orquestador.

---

## 📚 Anti-patrones Comunes

### 🚫 "Test-after"
Escribir código primero y luego tests "para cubrirlos". Esto NO es TDD. El código dicta el test, no al revés.

### 🚫 "Mega-test"
Un solo test que prueba 10 cosas. Mejor 10 tests pequeños y específicos.

### 🚫 "Test de implementación"
Probar que internamente se llamó a `functionX()` con `argsY`. Mejor probar el **comportamiento observable**: que la API retorna lo esperado, no cómo lo hace internamente.

### 🚫 "Refactor oportunista"
"Ya que estoy aquí, voy a mejorar este otro módulo". NO. Refactoriza SOLO lo tocado por este change.

### 🚫 "Skip RED"
"Si el test es trivial, no necesito hacerlo fallar primero". SÍ LO NECESITAS. Si no falla, no sabes si está testeando lo correcto.

---

## 🧠 Mentalidad TDD

> **TDD no es testing. TDD es diseño.**
>
> Cuando escribes el test primero, te ves forzado a pensar en la **interfaz** antes que en la **implementación**. Esto produce APIs más limpias, código más desacoplado, y tests más útiles.
>
> El "test primero" no es un dogma: es una herramienta cognitiva que te obliga a clarificar el **qué** antes de saltar al **cómo**.
