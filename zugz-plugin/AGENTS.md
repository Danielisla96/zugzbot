# 🤖 Reglamento de Desarrollo del Arnés Zugzbot v2.0.0

> [!IMPORTANT]
> Este archivo es la **guía regulatoria para contribuidores** del paquete `zugzbot-sdd`. NO es la guía para usuarios finales (esa está en `README.md`).

---

## 📦 Estructura Interna

```
zugz-plugin/
├── agents/                # 14 agentes (prompt files)
├── tools/                 # 33 herramientas SRP (TypeScript)
├── skills/                # 11 skills premium
├── profiles/              # 8 profiles de stack
├── prompts/               # Prompts modulares
│   ├── system/            # Base regulatoria (orchestrator, subagent, tdd, router)
│   ├── contracts/         # QUÉ hace cada fase
│   └── boundaries/        # QUÉ NO hace cada fase
├── tests/                 # Vitest (87 tests)
├── opencode.json          # Config dev
├── package.json
├── bin/zugzbot.js         # Instalador v2
└── CHANGELOG.md
```

---

## 🔧 Reglas de Contribución

### 1. Un agente = una responsabilidad

- Cada agente tiene **un único rol**.
- Boundaries absolutas (qué NO puede hacer) están en `prompts/boundaries/`.
- Si un agente necesita lógica mixta, divídelo en 2.

### 2. Una herramienta = un trabajo (SRP estricto)

- `sdd_*_tools` mezcladas en v1 → separadas en v2.
- Si una herramienta ejecuta 2 cosas no relacionadas, divídela.
- Ejemplo correcto: `sdd_linter` (solo lint) vs `sdd_linter fix` (autofix) — **diferentes métodos del mismo tool**.

### 3. Stack-agnosticismo en el core

- **Cero** referencias hardcoded a Google Apps Script, React, Next.js, Django, etc. en `prompts/` y `agents/`.
- Lógica de stack se delega a `profiles/*.json`.
- Excepción permitida: tests que verifiquen comportamiento de un profile específico.

### 4. TDD discipline en cambios al arnés

Cualquier cambio en el código del arnés (en `tools/`, `agents/`, `bin/`) debe seguir TDD:
1. **Test rojo** describiendo el comportamiento esperado.
2. **Implementación mínima** que lo hace pasar.
3. **Refactor atómico** manteniendo tests verdes.

### 5. Lockfile schema versionado

Cualquier cambio al schema del lockfile v2 debe:
- Incrementar `SCHEMA_VERSION` en `tools/sdd_lock_manager.ts`.
- Actualizar `migrateToV2` con la lógica de migración.
- Actualizar tests en `tests/integration/`.

### 6. Prompts modulares (Sprint 1+)

Cualquier agente nuevo debe usar la estructura:
- `agents/<name>.md` — solo encadena system + contract + boundary.
- `prompts/contracts/<name>-contract.md` — QUÉ hace.
- `prompts/boundaries/<name>-boundary.md` — QUÉ NO hace.

NO escribir prompts monolíticos.

---

## 🧪 Testing

```bash
npx tsc         # TypeScript compilation
npx eslint .    # Linter
npx vitest run  # 87 tests
```

- **Unit** (30): estructura, schema, contratos.
- **Integration** (57):
  - `stack_detection.test.js` (16): auto-detección.
  - `tdd_cycle.test.js` (9): ciclo TDD con gates.
  - `router.test.js` (24): clasificación de prompts.
  - `e2e_demo.test.js` (6): demo end-to-end con proyecto Node/TS sintético.
  - `harness_structure.test.js` (30): estructura y schema v2.

### Cómo añadir un test

1. **Unit** (estructura, schema): `tests/unit/<name>.test.js`
2. **Integration** (lógica de tools): `tests/integration/<name>.test.js`

Usa `vitest` (no jest). Tests deben ser **independientes** (cada test crea sus propios fixtures).

---

## 🔁 Workflow de Contribución

1. Fork el repo.
2. Crea una rama: `git checkout -b feature/<descriptive-name>`.
3. Implementa con TDD discipline.
4. Verifica: `npx tsc && npx eslint . && npx vitest run`.
5. Commit con Conventional Commits en español (mantenemos coherencia con la v1).
6. Push y abre PR.

### Convención de commits

```text
feat(tools): añadir sdd_test_runner agnóstico
fix(transition): corregir gate de HIL-A
refactor(lock_manager): separar update y validate
docs(readme): documentar router cognitivo
test(cycle): añadir test de F2-REFACTOR sin GREEN
```

---

## 🛡️ Permisos de Agentes (jerarquía)

```
Primary (mode: primary)
└── zugzbot (router)

Subagents (mode: subagent)
├── Core SDD: sdd-explorer, sdd-planner, sdd-builder, sdd-tester,
│             sdd-deployer, sdd-archiver,
│             f2-red-test-writer, f2-refactor-improver
└── Auxiliares: aux-handyman, aux-oracle, aux-auditor, aux-refactor, aux-explainer
```

**Permisos clave**:
- `aux-auditor`: `edit: deny` (read-only).
- `aux-explainer`: `edit: deny, bash: deny` (solo lectura).
- `aux-oracle`: `edit/bash/lsp: deny` (solo knowledge).

---

## ⚙️ Build y Release

```bash
# Compilar TS
npx tsc

# Tests completos
npx tsc && npx eslint . && npx vitest run

# Tag
git tag v2.0.0
```

El instalador `bin/zugzbot.js` corre con `node bin/zugzbot.js` (no requiere build para ejecutarse).

---

## 📋 Checklist antes de Merge

- [ ] Tests pasan: `npx vitest run` → 87/87
- [ ] TypeScript compila: `npx tsc` → 0 errores
- [ ] Linter limpio: `npx eslint .` → 0 errores
- [ ] Si cambiaste `tools/`: actualizaste `tools/index.ts` y `.opencode/tools/index.js`
- [ ] Si añadiste agente: actualizaste `opencode.json` y `bin/zugzbot.js`
- [ ] Si cambiaste schema: actualizaste `migrateToV2` y tests
- [ ] Si añadiste profile: documentaste en `README.md` y `ZUGZ.md`
- [ ] CHANGELOG.md actualizado con el cambio

---

## 🤝 Código de Conducta

- Cambios pequeños y verificables > cambios grandes y arriesgados.
- Documenta en el commit message QUÉ y POR QUÉ.
- Si dudas, pregunta en el PR antes de mergear.
- Mantén los tests pasando en todo momento.

---

**Mantenido por**: Danielisla96
**Versión actual**: 2.0.0
