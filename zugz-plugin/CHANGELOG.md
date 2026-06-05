# Changelog

Todas las versiones notables del proyecto Zugzbot SDD se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.0.0] - 2026-06-05 — Arnés Genérico Modular con TDD Puro

### 🔥 Breaking Changes

- **Lockfile schema v2** (v1 → v2):
  - `active_phase`: número (0-5) → string ("F0" | "F1" | "F1.5" | "F2-RED" | "F2-GREEN" | "F2-REFACTOR" | "F3" | "F4" | "F5" | "DONE")
  - Eliminado: `change_name: "nuevo-cambio"` por defecto (ahora `""` vacío)
  - Nuevos bloques: `tdd`, `git`, `workflow`, `stack_profile`
  - `schema_version: 2` obligatorio
- **TDD discipline enforced**: no se puede transicionar a F2-GREEN sin F2-RED completo, ni a F2-REFACTOR sin F2-GREEN, etc.
- **Sin migrador automático**: instalaciones v1.5.x deben limpiar `.openspec/sdd-lock.json` antes de instalar v2.
- **`gas_clasp_tools` renombrado** a `sdd_clasp` (carga condicional si `stack_profile === "gas"`).
- **AGENTS.md movido** a `prompts/system/orchestrator-base.md` (modular).
- **14 agentes** registrados en lugar de 9 (nuevos: `f2-red-test-writer`, `f2-refactor-improver`, `aux-auditor`, `aux-refactor`, `aux-explainer`).

### ✨ Nuevas Herramientas SRP (9)

- **`sdd_lock_manager`**: I/O centralizada del lockfile v2 con 9 acciones (`read | write | update | validate | set_tdd | set_git | add_task | mark_task | reset`).
- **`sdd_stack_detector`**: auto-detección de stack profile.
- **`sdd_stack_detector_lib`**: helpers compartidos.
- **`sdd_git_awareness`**: estado de Git (rama, SHA, working tree, stash) sin mutaciones.
- **`sdd_router`**: clasificador de intent del router cognitivo.
- **`sdd_test_runner`**: runner agnóstico con `verify-red | verify-green | verify-all-passing`.
- **`sdd_linter`**: linter agnóstico con `check | fix | detect`.
- **`sdd_spec_reviewer`**: F1.5 con 8 checks objetivos de testeabilidad.
- **`sdd_brain_curator`**: detecta duplicados y entradas de bajo valor en brain.md.

### 🏗️ Nueva Arquitectura de Prompts (modular)

- `prompts/system/orchestrator-base.md` — base regulatoria.
- `prompts/system/subagent-base.md` — protocolo común transversal.
- `prompts/system/tdd-discipline.md` — disciplina Red→Green→Refactor.
- `prompts/system/router-rules.md` — tabla de decisión del router cognitivo.
- `prompts/contracts/<fase>-contract.md` — QUÉ hace cada fase (9 archivos).
- `prompts/boundaries/<fase>-boundary.md` — QUÉ NO hace cada fase (9 archivos).

### 🌍 Agnosticismo al Stack

- **8 profiles JSON** declarativos: `node-typescript`, `node-javascript`, `python`, `go`, `rust`, `java`, `gas`, `static-site`.
- Cada profile define: detectores, test runners, linters, formatters, deploy kind, tools requeridas, convenciones de directorios.
- Cero referencias hardcoded a Google Apps Script, React, Next.js, etc. en prompts base.

### 🧭 Router Cognitivo (Sprint 4)

- 6 workflows: `full-sdd-tdd | quick-fix | audit | refactor | explain | oracle`.
- `sdd_router` con clasificador determinista (keyword scoring + heurísticas).
- `aux-auditor` (read-only, linter + security + secret scan).
- `aux-refactor` (refactor atómico con tests verdes).
- `aux-explainer` (read-only, walkthrough didáctico).

### 🧪 Tests (81/81 pasando)

- **Unit** (30): estructura de harness v2, schema v2, prompts completos.
- **Integration** (51):
  - `stack_detection` (16): auto-detecta 8 stacks.
  - `tdd_cycle` (9): ciclo completo RED→GREEN→REFACTOR con gates enforced.
  - `router` (24): clasificación de 20 prompts + 4 unit tests.
  - Suite ampliada con 8 escenarios de TDD enforcement (bloqueos indebidos, transiciones válidas).

### 🔧 Cambios Internos

- `package.json`: `version: 1.5.40 → 2.0.0`.
- `bin/zugzbot.js` (instalador): reescrito para v2 (sin migrador, valida schema, 14 agentes, 8 profiles).
- `opencode.json`: 14 agentes, permisos por herramienta con `edit: deny` para aux-auditor/explainer.
- `tsconfig.json` y `.opencode/tools/index.js`: actualizados con nuevas tools.

### 📚 Documentación

- `README.md` v2 (completo, con diagramas Mermaid).
- `ZUGZ.md` v2 (guía rápida con 6 workflows).
- `CHANGELOG.md` v2 (este archivo).
- `AGENTS.md` → `prompts/system/orchestrator-base.md` (modular).

---

## [1.5.40] - 2026-05-29 — Versión Legacy

- 6 fases SDD con boundaries claros.
- 9 agentes (8 core + 2 aux).
- 30 herramientas.
- 10 skills premium.
- Google Apps Script como stack implícito (refs hardcoded).
- Lockfile v1 con `change_name: "nuevo-cambio"` por defecto.
- Plugin TUI reactivo.
- Soporte de corrective loops, checkpoints, auto-pilot.
