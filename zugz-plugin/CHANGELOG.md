# Changelog

Todas las versiones notables del proyecto Zugzbot SDD se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.1.0] - 2026-06-07 — Design systems persistidos en el lockfile (schema v7)

### ✨ Features
- **`design/` ahora vive DENTRO del paquete** (`zugz-plugin/design/`) y se copia al proyecto del usuario en `<INSTALL_DIR>/design/` durante `npx zugzbot`. Listado explícito en `package.json#files` para shippear con npm. Antes vivía en la raíz del repo y el skill era inútil out-of-the-box.
- **Schema v7 + `active_design_system` + `design_system_explicitly_skipped`**: dos campos nuevos en `.openspec/sdd-lock.json` que controlan el flujo de design systems.
  - `active_design_system`: `airbnb` | `apple` | `meta` | `nike` | `notion` | `renault` | `theverge` | `uber` | `voltagent` | `x.ai` | `null`.
  - `design_system_explicitly_skipped`: `boolean`. `true` cuando el usuario eligió "skip" en el picker.
- **Auto-invocación del skill `sdd-design-system`** desde `@zugzbot` §1.5: cuando un prompt matchea la regex de UI, `@zugzbot` **invoca directamente el skill sin pedir permiso**. El picker del skill ES la única pregunta al usuario.
- **Nuevo skill `sdd-design-system`** (`skills/sdd-design-system/SKILL.md` + `catalog.md`): carga design tokens del catálogo, persiste la elección, soporta opción "skip".
- **Nuevo comando `/front <descripción>`** (`commands/front.md`): atajo explícito al mismo flujo.
- **Nuevas acciones en `sdd_lock_manager`**: `set_design_system`, `read_design_system`, `skip_design_system`. Helper `isDesignSystemReady(lock)` retorna `{ready, reason: "set"|"skipped"|"uninitialized"}`.
- **Gate de 3 estados en `@sdd-builder`**: set / skipped / uninitialized.
- **Detección de UI más robusta**: regex con conjugaciones informales (haz, hazme, agrega, sumar, añade).
- **Migración automática v6→v7**: backward compatible.

### 🧪 Tests
- `tests/integration/lockfile_v7.test.js` (23 tests).
- `tests/integration/design_system_skill.test.js` (12 tests, +2 nuevos: ubicación de `design/` y presencia en `package.json#files`).
- `tests/integration/front_command.test.js` (6 tests).
- `tests/integration/ui_auto_invoke_regression.test.js` (24 tests).
- `tests/integration/installer.test.js` (+3 tests: copia de `design/`, no sobreescritura de customizaciones, schema_version=7 con `active_design_system` defaults).
- Tests existentes actualizados: `lockfile_v4.test.js`, `stack_detection.test.js`, `session_features.test.js`, `subproject_cwd.test.js` ahora esperan `schema_version: 7`.

Total: **289 tests pasando**.

### 🧪 Tests
- `tests/integration/lockfile_v7.test.js` (23 tests): normalización, validación, migración desde v1-v6, `isDesignSystemReady` con 4 combinaciones de estado.
- `tests/integration/design_system_skill.test.js` (10 tests): estructura del skill.
- `tests/integration/front_command.test.js` (6 tests): estructura del comando.
- `tests/integration/ui_auto_invoke_regression.test.js` (24 tests, **nuevo**): regression que verifica:
  - Que `@zugzbot` §1.5 auto-invoca el skill (no pide permiso).
  - Que la regex matchea 10 prompts reales (verdes y falsos positivos).
  - Que `@sdd-builder` honra los 3 estados (set / skipped / uninitialized).
  - Que el SKILL.md incluye la opción "skip" y afirma que la pregunta ES su trabajo.
  - Que `/front` es coherente con el flujo de auto-invocación (no contradice).
- Tests existentes actualizados: `lockfile_v4.test.js`, `stack_detection.test.js`, `session_features.test.js`, `subproject_cwd.test.js` ahora esperan `schema_version: 7`.

Total: **285 tests pasando**.

## [2.0.63] - 2026-06-07 — Opt-in de autoskills y graphify por sesión

### ✨ Features
- **Schema v6 + `session_features`**: nuevo campo en `.openspec/sdd-lock.json` que persiste qué features opcionales están activas por sesión (`autoskills`, `graphify`). Defaults `false` para opt-in seguro.
- **Preguntas de inicio en `@zugzbot`**: en el primer turno (lockfile fresco), `@zugzbot` ahora lanza una sola llamada a `question` con 2 preguntas (autoskills + graphify) antes del menú de 6 workflows. La decisión se persiste vía el nuevo tool `sdd_session_features`. El usuario puede reconfigurar en cualquier momento diciendo "configurar features".
- **Nuevo tool `sdd_session_features`**: acciones `read`, `write`, `enable`, `disable` para gestionar los flags desde el orquestador o los subagentes.
- **Gates en subagentes**:
  - `@sdd-explorer` consulta `sdd_session_features` antes de invocar `sdd_install_autoskills` (§3.5) y `sdd_graphify` (§3.7). Si están deshabilitados, omite la invocación y registra una línea `ℹ️ …: deshabilitado por sesión` en `diagnostics.md`.
  - `@sdd-planner` consulta el gate de `graphify` antes de usarlo en `sdd_graphify(query)` (§2.5).
  - `@sdd-archiver` y `sdd_archive_and_commit` consultan `autoskills` antes de sincronizar skills en F5.
- **Acción `install` en `sdd_graphify`**: si la CLI no está instalada y `graphify=true`, `@sdd-explorer` puede invocar `sdd_graphify` con `action: "install"` que propone `uv tool install graphifyy` (preferido) o fallback a `pipx/pip3/pip`. Requiere `confirm=true` para ejecutarse; sin confirmación retorna `AWAITING_CONFIRMATION` con la lista de candidatos.
- **Migración automática v5→v6**: `migrateToV2` inyecta `session_features: { autoskills: false, graphify: false }` al leer lockfiles antiguos. Backward compatible.

### 🐛 Fixes
- **Sin regresiones de autoskills**: `sdd_install_autoskills` sigue escribiendo/migrando skills a `.opencode/skills/` (nunca quedan en `.agents/skills/`), solo que ahora la ejecución está gated por el opt-in del usuario.

### ✅ Tests
- 11 tests nuevos en `tests/integration/session_features.test.js` (read, write, enable, disable, defaults, migración, merge con otros campos).
- 5 tests actualizados en `tests/integration/lockfile_v4.test.js` (schema_version 5→6, migración preserva `session_features` si existen).
- 1 test en `tests/unit/harness_structure.test.js` (nuevo tool en whitelist).
- 2 tests en `tests/integration/installer.test.js` (lockfile generado contiene `session_features`; zugzbot tiene permiso `sdd_session_features`).

---

## [2.0.37] - 2026-06-06 — Actualización de Paleta de Colores TDD

### ✨ Features
- **Colores TDD Claros**: Se actualizó el coloreado visual de la barra de progreso TDD en `plugin_tui.tsx`. El color de la línea de estado cambiará dinámicamente a **Rojo** (`#FF3B30`) en la etapa RED, **Verde** (`#34C759`) en la etapa GREEN y **Azul** (`#0A84FF`) en la etapa REFACTOR, haciendo mucho más intuitiva la identificación de la fase actual.

---

## [2.0.36] - 2026-06-06 — Fix Estabilidad de Solid TUI en plantilla

### 🐛 Fixes
- **`plugins/plugin_tui.tsx`**: Migración de expresiones condicionales de renderizado lógico (`&&`) hacia ternarios puros `? : null` en la plantilla de origen. Esto previene que Solid retorne `false` al renderizador de opentui y erradica permanentemente el error fatal `Orphan text error: "" must have a <text> as a parent` en cualquier nueva instalación.

---

## [2.0.35] - 2026-06-06 — Validación de Calidad obligatoria en F1.5

### ✨ Features
- **Gate de especificación en F1.5**: Modificación de la máquina de estados en `sdd_transition.ts`. Ahora, al intentar transicionar desde F1 (Planner) a F1.5 (Review), se ejecuta automáticamente la validación de `sdd_spec_reviewer` (incluyendo la nueva regla de Design Skills de Frontend). Si la especificación técnica no cumple las reglas, la transición se bloquea impidiendo que los agentes sigan adelante hasta que el Spec se corrija.

---

## [2.0.34] - 2026-06-06 — Fix transiciones HIL-B y Git en Repos Vacíos

### 🐛 Fixes
- **`plugins/plugin_tui.tsx`**: Corrección de la validación del estado `isCompleted` en HIL-A y HIL-B. Se comparaba contra fases previas (`F1.5` y `F4`) impidiendo que el sidebar se actualizara visualmente al avanzar a `F5` o `DONE`. Ahora compara correctamente contra sus propios índices en `PHASE_ORDER`.
- **`tools/sdd_transition.ts`**: Prevención del error visual de `HEAD` en repositorios vacíos (recién inicializados sin commits) al evaluar cambios staged. Si no hay commits iniciales en el repositorio Git, la transición asume cambios iniciales para estructurar el primer commit y crear la rama `sdd/change-<name>` sin fallar.

---

## [2.0.33] - 2026-06-06 — Distribución de Design Skills en Plantilla

### 🐛 Fixes
- **Distribución de Skills**: Se migraron las 67 design skills del directorio temporal de desarrollo `skills/` hacia el directorio de distribución `.opencode/skills/` para asegurar que el instalador `npx zugzbot` las copie en el workspace del usuario destino de forma exitosa.

---

## [2.0.32] - 2026-06-06 — Git Init, Autoskills, Design Skills & Corrective Loops

### ✨ Features
- **Auto-Setup Git en F0**: Se implementó la acción `init` en `sdd_git_awareness.ts` para inicializar el repositorio y estructurar el `.gitignore` por defecto.
- **Autoskills Integrado**: El agente `sdd-explorer` ahora corre `npx autoskills` al inicializarse el proyecto y en fases intermedias si las dependencias cambian.
- **Enforcer de Design Skills**: `sdd_spec_reviewer.ts` y el boundary de F1.5 ahora exigen e invalidan specs UI que no definan una `design_skill` para guías consistentes de diseño.
- **Persistencia de Corrective Loops**: Regla en `subagent-base.md` para obligar a los subagentes a guardar aprendizajes del proceso de depuración en `brain.md` usando `sdd_brain_sync`.

---

## [2.0.31] - 2026-06-06 — Fix Orphan Text en plugin_tui.tsx

### 🐛 Fixes

- **`plugins/plugin_tui.tsx`**: corrección del error fatal `Orphan text error: "" must have a <text> as a parent` en opentui. El patrón `{condition && <jsx>}` retorna `false` cuando la condición falla, y opentui intenta renderizarlo como nodo de texto huérfano. Los tres renders condicionales afectados fueron reemplazados por ternarios `condition ? <jsx> : null`:
  - `{sddProgress() && (...)}` → `{sddProgress() ? (...) : null}`
  - `{isActive && agent && (...)}` → `{(isActive && agent) ? (...) : null}`
  - `{branch && branch !== "—" && (...)}` → `{(branch && branch !== "—") ? (...) : null}`

---

## [2.0.10] - 2026-06-05 — Fix detección legacy y versión dinámica

### 🐛 Fixes

- **`bin/zugzbot.js` → `detectLegacyInstallation()`**: la detección era demasiado estricta. Usaba `lock.schema_version === 2` con `===` estricto, así que un lockfile con `schema_version: "2"` (string) o sin el campo era clasificado erróneamente como legacy v1. Ahora detecta v2 por:
  - `schema_version === 2` (número) o `=== "2"` (string)
  - O por estructura: presencia de `tdd` block + `active_phase` como string
  - Solo bloquea si hay indicadores claros de v1: `schema_version: 1` o lockfile sin schema_version ni estructura v2.
  - JSON inválido: NO bloquea (el installer preserva el archivo y deja que el usuario lo arregle).
- **Versión hardcodeada en el header**: el header, mensaje de error legacy, y mensaje de éxito mostraban `v2.0.0` literal sin importar qué versión del paquete se ejecutaba. Ahora se lee `version` de `package.json` del paquete en runtime.
- **`BRAIN_TEMPLATE`**: el comentario "inicializado con Zugzbot SDD v2.0.0" ahora usa la versión real del paquete.

### ✅ Tests

- 7 tests nuevos en `tests/integration/installer.test.js` para `detectLegacyInstallation()`:
  - `schema_version: 2` (número) → no legacy ✓
  - `schema_version: "2"` (string) → no legacy ✓
  - estructura v2 (tdd + active_phase) sin schema_version → no legacy ✓
  - JSON inválido → no bloquea ✓
  - `schema_version: 1` → SÍ legacy ✓
  - sin schema_version ni estructura v2 → SÍ legacy ✓
  - header muestra la versión del paquete (no hardcodeada) ✓

**104/104 tests** pasando (97 anteriores + 7 nuevos).

---

## [2.0.9] - 2026-06-05 — Versión visible en el TUI

### ✨ Nuevas visualizaciones

- **`plugins/plugin_tui.tsx`**: muestra `zugzbot-sdd v<version>` en el sidebar, debajo del logo, en color muted para no competir con el progreso SDD. Utiliza la constante `ZUGBOT_VERSION` que se actualiza con cada bump.

---

## [2.0.8] - 2026-06-05 — TUI actualizado a v2

### 🐛 Fixes

- **`plugins/plugin_tui.tsx`**: el sidebar leía `active_phase` como número (schema v1 legacy). Ahora lee correctamente como string.
- Las 6 fases del sidebar (F0-F5) han sido reemplazadas por las **12 estaciones v2**: F0, F1, F1.5, HIL-A, F2-RED, F2-GREEN, F2-REFACTOR, F3, F4, HIL-B, F5, DONE.
- Los HIL-A y HIL-B ahora se renderizan con prefijo `⚠` y color ámbar para señalarlos como puntos de aprobación humana.
- Mapeo de fases a subagentes actualizado a v2 (`@f1.5-spec-reviewer`, `@f2-red-test-writer`, `@f2-refactor-improver`, etc.).

### ✨ Nuevas visualizaciones

- **`stack_profile`**: muestra el stack auto-detectado (`node-typescript`, `python`, `go`, etc.).
- **`workflow`**: muestra el workflow activo (`full-sdd-tdd`, `quick-fix`, etc.).
- **`status`**: muestra el status del lockfile (`idle`, `in_progress`, `spec_approved`, `qa_validated`).
- **`auto_pilot`**: indicador visual si el modo auto-pilot está activo.
- **TDD progress**: línea con `✓ RED (N) · ✓ GREEN (N) · ✓ REFACTOR(lint)` mostrando el avance de las 3 etapas TDD.
- **Git branch**: muestra la rama actual (`sdd/change-<name>`) y si el working tree está limpio.
- **Subagente activo**: mapea la fase actual al subagente que la ejecuta.

---

## [2.0.7] - 2026-06-05 — Documentación "Cómo Funciona"

### 📚 Documentación

- **`README.md`**: nueva sección "🧠 Cómo funciona (la mecánica)" que explica los 4 componentes clave (router, subagentes, lockfile, tools SRP) y el ciclo de un turno.
- Diagrama ASCII del flujo router → subagentes → lockfile.
- Tabla "El ciclo de un turno" con 9 pasos numerados.
- Explicación detallada de por qué el lockfile es el corazón del sistema (amnesia-cero).
- Reorganización de "Las 33 herramientas SRP" por categoría funcional con énfasis en `sdd_transition` como única vía de cambio de fase.
- Sección "Las reglas de delegación" explicando por qué solo `@zugzbot` puede delegar.

---

## [2.0.6] - 2026-06-05 — Guion de Interacción Guiada

### ✨ Mejoras de UX para el Usuario Final

- **`agents/zugzbot.md`**: nueva sección "Primer Turno (Lockfile Vacío)" que muestra el menú de 6 workflows con ejemplos antes de esperar input.
- **Plantilla de Reanudación**: cada turno imprime el estado del lockfile en formato legible con roadmap `[x]/[➡️]/[ ]` (nunca JSON crudo).
- **Plantilla HIL A/B/C**: refuerzo explícito de que los HIL-A y HIL-B siempre usan 3 opciones cerradas idénticas y predecibles.
- **Plantilla de Cierre F5**: banner "🎉 CICLO SDD FINALIZADO" con versión, archivos, commit y lecciones.

### 📚 Documentación Reescrita

- **`README.md`**: nueva sección "🚀 Quickstart (3 pasos)" al inicio para onboarding inmediato.
- **Sección "🎬 Tu primera conversación"**: tabla de 6 turnos mostrando el ciclo `full-sdd-tdd` realista (agregar endpoint logout) con quién habla y qué hace.
- **Sección "🔁 Reanudar una sesión"**: explicación del comportamiento "amnesia cero" del lockfile.
- **Sección "🚦 Cuándo me preguntará @zugzbot"**: formato A/B/C de los 2 HIL con ejemplos visuales.
- **Tabla de workflows mejorada**: añade frases-ejemplo concretas en lugar de solo keywords.
- **`ZUGZ.md`**: compactado a cheat sheet de una pantalla (~100 líneas vs 171).
- **Instalación actualizada**: de git clone a `npm install zugzbot-sdd@latest && npx zugzbot`.
- **Sección "Personalizar modelos por agente"** con ejemplo de `zugz-models.json`.

### 🔧 Cambios Internos

- `package.json`: `version: 2.0.5 → 2.0.6`.

---

## [2.0.5] - 2026-06-05 — zugz-models.json Editable

### ✨ Features

- **zugz-models.json editable**: el archivo se preserva entre re-instalaciones y sus modelos se aplican al `opencode.json` en cada `npx zugzbot`.
- **Overlay de modelos**: edita `zugz-models.json` con modelos custom por agente y re-ejecuta el installer para aplicarlos.
- **Agentes custom preservados**: si el usuario añade agentes adicionales a `opencode.json`, no se pierden al re-instalar.

### 🧪 Tests (97/97 pasando)

- `installer.test.js` (6 nuevos): primer install copia `zugz-models.json`, segundo install preserva, custom agents sobreviven, edicion entre installs propaga cambios.

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
