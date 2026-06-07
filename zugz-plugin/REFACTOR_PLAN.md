# Plan de Refinamiento Zugzbot-SDD v2.0.x

> Análisis post-mortem de la sesión `ses_160f_FastAPI_escalable_para_suma_de_dos_números`
> que cerró el ciclo SDD con 3 bypasses manuales y múltiples falsos positivos.

---

## 📋 Resumen Ejecutivo

La sesión funcionó end-to-end (F0→F5) pero el cierre requirió:
- 1 `bypassPendingTasks: true` en `sdd_archive_and_commit` (auditor semántico F5 bloqueó falsos negativos).
- 1 parcheo manual del lockfile (`sdd_lock_manager set_tdd` con `all_failing: false`) para saltar la gate TDD.
- 1 re-delegación manual cuando `sdd_test_runner verify-red` retornó `SUCCESS` por ejecutar `mvn test` (Maven inexistente) en un proyecto Python.

Esto revela problemas estructurales en el arnés que necesitan corrección antes de confiar en el ciclo SDD para producción.

---

## 🔴 Bugs Detectados

### B1. `sdd_test_runner` no respeta `stack_profile` cuando el root tiene otro stack
**Síntoma**: En F0 y F2-RED ejecutó `mvn test` (inexistente) y reportó `SUCCESS` con "Tests fallan correctamente". Falso positivo.  
**Causa raíz** (`tools/sdd_test_runner.ts:267-268`):
- Lee `lock.stack_profile = "python-fastapi"`.
- `getProfileById` busca `python-fastapi.json` (no existe) → fallback a `loadAllProfiles` (toma el primer profile disponible).
- Sin `pytest.ini` en el cwd correcto, el primer runner con `detect: null` puede ser `maven` o cualquier otro.

### B2. `sdd_stack_detector` no busca stacks en subcarpetas cuando el root ya matchea
**Síntoma**: El root tiene `package.json` → retorna `node-javascript` aunque el backend Python esté en `backend/`.  
**Causa raíz** (`tools/sdd_stack_detector.ts:43-56`):
- `matchProfile` solo busca en `projectRoot`.
- `matchProfileSubdirs` existe en `sdd_test_runner.ts:192-218` pero NO se invoca desde `sdd_stack_detector.match/detect`.

### B3. `sdd_requirement_tracker` (auditor F5) tiene matching débil
**Síntoma**: 4 CA sin cobertura reportados (CA2, CA3, CA4, CA9) que SÍ estaban cubiertas.  
**Causa raíz** (`tools/sdd_requirement_tracker.ts:217-340`):
- Threshold 45% + ventana de 8 líneas.
- Falla para criterios largos con valores hardcodeados (`{"a": 5}`) que no aparecen en los tests.
- Sin opción de bypass formal con audit trail.

### B4. F0-explorer viola su propio boundary: crea código de producción y tests
**Síntoma**: F0 creó `math.py` con `result = payload.a + payload.b` y `test_math.py` con 4 tests.  
**Causa raíz** (`agents/sdd-explorer.md`):
- Boundary ambiguo: "El main.py puede tener un esqueleto mínimo con la app factory."
- Subagente interpretó "esqueleto mínimo" como "incluye un endpoint que ya funciona".
- Sin checklist de boundary enforcement.

### B5. Schema del lockfile no soporta `subproject_cwd`
**Síntoma**: Cada subagente repite `cd backend && .venv/bin/pytest ...` porque las herramientas asumen root.  
**Causa raíz** (`tools/sdd_lock_manager.ts:5`):
- `SCHEMA_VERSION = 2` no tiene `subproject_cwd`.
- Ninguna herramienta lo conoce.

### B6. F3 (validator) ejecutó `sdd_transition` por su cuenta
**Síntoma**: "Transición a F4 ejecutada — zugzbot continuará con el deploy".  
**Causa raíz**: El boundary de F3 no prohíbe explícitamente llamar `sdd_transition`.

### B7. F2-RED no respeta boundary "solo tests, no implementación"
**Síntoma**: Cuando RED no se puede confirmar, devuelve control al orchestrator en vez de ejecutar corrective loop.  
**Causa raíz**: El boundary no define acción obligatoria ante "tests pasan sin código".

---

## 🟠 Problemas de Diseño (no son bugs, son mejoras)

### D1. Spec ≠ Task briefs
El spec de F1 define CA4 con `-5, -3` pero el task de F2-RED pidió `-3, 5`. Dos fuentes de verdad.

### D2. Zugzbot mezcla decisiones técnicas con HIL
Aceptó pasar a F2-GREEN sin HIL cuando RED no se confirmó.

### D3. Reasoning verboso en zugzbot
3.967 tokens de "pensamiento" para decisiones simples.

### D4. F2-RED reescribe tests cambiando async→sync sin justificación
Inconsistencia de estilo.

---

## ✅ Plan de Refinamiento (3 sprints)

### Sprint 1 — Bugs Críticos (P1) [EN PROGRESO]

| # | Archivo | Cambio | Tests TDD |
|---|---|---|---|
| **P1.1** | `tools/sdd_test_runner.ts` | Mapear `python-fastapi`→`python`; respetar `subproject_cwd`; error claro si no hay runner | polyglot root+`backend/` → runner=`pytest` |
| **P1.2** | `tools/sdd_stack_detector.ts` | Nueva acción `matchForChange(change, subprojectPath)` | change en `backend/` → `python`, no `node` |
| **P1.3** | `tools/sdd_requirement_tracker.ts` | Threshold 0.30 + ventana 20 líneas + bypass formal con audit | 4 CAs antes false-neg → ahora `covered` |
| **P1.4** | `tools/sdd_transition.ts` | Parámetro `bypassAudit{reason}` con audit trail en `phase_history.jsonl` | entry con `bypass:true,reason` |
| **P1.5** | `tools/sdd_lock_manager.ts` | Schema v3 con `subproject_cwd` opcional; migración v2→v3 | retrocompat tests |

### Sprint 2 — Boundaries (P2)

| # | Cambio |
|---|---|
| P2.1 | `agents/sdd-explorer.md` — PROHIBIDO en F0: tests, endpoints, schemas de negocio |
| P2.2 | `agents/sdd-planner.md` — Spec es la única fuente de verdad |
| P2.3 | `agents/sdd-tester.md` — NO llames a `sdd_transition` |
| P2.4 | `agents/zugzbot.md` — Log `human_decisions[]` en lockfile; HIL obligatorio en bypasses |

### Sprint 3 — Polish (P3)

| # | Cambio |
|---|---|
| P3.1 | `sdd_linter`/`sdd_test_runner`/`sdd_deployer` respetan `subproject_cwd` |
| P3.2 | Convención sync `TestClient` siempre |
| P3.3 | Zugzbot: máximo 5 líneas de reasoning explícito |
| P3.4 | `sdd_checkpoint` automático al cerrar F0/F2-GREEN/F3/F4 |
| P3.5 | Deploy usa PID file en vez de `pkill -f` |
| P3.6 | `sdd_dependency_installer` con quoting correcto |

---

## 🎯 Criterios de Validación

Re-correr la sesión `ses_160f` desde cero con el mismo prompt inicial. Debe cumplir:
- ✅ F0 NO crea `math.py` ni `test_math.py` (solo estructura + factory vacío + diagnostics.md)
- ✅ F2-RED tiene tests que **fallan** contra cero implementación
- ✅ `verify-red` retorna `SUCCESS` solo cuando pytest realmente corre y falla
- ✅ F5 cierra sin `bypassAudit`; auditor pasa limpio
- ✅ `sdd_test_runner` retorna `FAILED` claro cuando no detecta runner (no fallback a maven)
- ✅ Costo en tokens ≤ original (~$0.037)

---

## 📊 Estado de Implementación

| Sprint | Estado | Tests añadidos | Tests totales |
|---|---|---|---|
| Baseline | ✅ | — | 107/107 ✓ |
| **Sprint 1 (P1.1-P1.5)** | ✅ **Completado** | **+21 (128 total)** | 128/128 ✓ |
| **Sprint 2 (P2.1-P2.9)** | ✅ **Completado** | **+44 (172 total)** | 172/172 ✓ |
| Sprint 3 (P3) | ⏳ Pendiente | — | — |

### Sprint 1 — Detalle de Tests Añadidos

| Archivo | Tests | Cobertura |
|---|---|---|
| `tests/integration/subproject_cwd.test.js` | 5 | P1.5: schema v3 + subproject_cwd + migración v2→v3 |
| `tests/integration/stack_detector_subproject.test.js` | 5 | P1.2: matchForChange + deducción + fallback |
| `tests/integration/test_runner_aliases.test.js` | 7 | P1.1: aliases python-fastapi→python, subproject_cwd en tests, better errors |
| `tests/integration/requirement_tracker_v3.test.js` | 2 | P1.3: threshold 0.30 + ventana 20 + CA IDs |
| `tests/integration/transition_bypass_audit.test.js` | 2 | P1.4: bypassAudit con audit trail |

### Sprint 2 — Detalle de Tests Añadidos (Spec Unificado v4)

| Archivo | Tests | Cobertura |
|---|---|---|
| `tests/integration/spec_template_v4.test.js` | 19 | P2.1: SPEC_TEMPLATE_V1, SECTIONS, parseFrontmatter, parseCriterios, matchBddScenarios, validateSpec (R1–R10) |
| `tests/integration/spec_reviewer_v4.test.js` | 4 | P2.2: init genera v4, validate aprueba, validate rechaza título mutado |
| `tests/integration/spec_validator_v4.test.js` | 3 | P2.3: aprueba v4, rechaza BDD en inglés, rechaza título mutado |
| `tests/integration/requirement_tracker_v4.test.js` | 6 | P2.4: modo_qa manual global/lockfile/spec, [manual] por criterio, rechaza [e2e]/[QA Manual], spec overrides lockfile |
| `tests/integration/bdd_tester_v4.test.js` | 2 | P2.5: genera esqueletos con BDD ES, rechaza spec sin BDD |
| `tests/integration/lockfile_v4.test.js` | 8 | P2.6: SCHEMA_VERSION=4, migración v1/v2/v3→v4 con qa_manual→modo_qa, strip de campos legacy |
| Migración fixtures | 2 | P2.8: 4 fixtures actualizados al template v4 (tdd_cycle, e2e_demo) |

---

## 📚 Anti-patrones Identificados en la Sesión

1. **"Test-after"**: F0 escribió código antes de los tests, F2-RED intentó hacer TDD retroactivamente.
2. **"Mega-tool":** `sdd_test_runner` ejecuta detección + ejecución + validación de RED/GREEN.
3. **"Bypass silencioso"**: `bypassPendingTasks: true` cierra el ciclo sin audit trail.
4. **"Stack ambiguity"**: Un proyecto puede tener N stacks; el detector no desambigua por subproyecto.
5. **"Falsa verificación"**: `mvn test` inexistente se reporta como "tests fallan" → GREEN fantasma.

---

**Mantenido por**: Danielisla96
**Versión del plan**: 1.0
**Fecha**: 2026-06-06
