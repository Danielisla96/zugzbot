# 🤖 Reglamento de Desarrollo del Arnés Zugzbot v3.0.0

> [!IMPORTANT]
> Este archivo es la **guía regulatoria para contribuidores** del paquete `zugzbot-sdd`. NO es la guía para usuarios finales (esa está en `README.md`).

---

## 📦 Estructura Interna (v3)

```
zugz-plugin/
├── agents/                # 15 agentes (1 primary + 9 fases + 5 aux)
│   └── manifest.json      # Fuente de verdad canónica: workflows, agentes, skills, tools, MCPs
├── tools/                 # 39 herramientas activas + 5 librerías internas
│   ├── _lib/              # Helpers internos (no son tools registrables)
│   ├── _core/             # Orquestación (transición, lockfile, router, contexto)
│   ├── _f0/               # Fase 0: discovery y setup
│   ├── _f1/               # Fase 1: planning
│   ├── _f2/               # Fase 2: TDD
│   ├── _f3/               # Fase 3: validación
│   ├── _f4/               # Fase 4: deploy
│   ├── _f5/               # Fase 5: archivado
│   ├── _utils/            # Utilidades
│   └── index.ts           # Re-exports
├── design/                # 11 design systems (Airbnb, Apple, HeroUI, Meta, Nike, etc.)
├── skills/                # 4 skills activas (design-system, tdd-coach, dependency-cooldown, gitignore-manager)
├── profiles/              # 8 profiles de stack
├── prompts/               # Prompts modulares
│   ├── system/            # Base regulatoria (orchestrator, subagent, tdd, router)
│   ├── contracts/         # QUÉ hace cada fase (9 contracts)
│   └── boundaries/        # QUÉ NO hace cada fase (9 boundaries)
├── tests/                 # Vitest
├── opencode.json          # Config dev
├── package.json
├── bin/zugzbot.js         # Instalador v3
└── CHANGELOG.md
```

---

## 🧭 Convención de Naming (v3)

Adoptar el prefijo `f<n>-<rol>` para agentes del ciclo SDD y `aux-<rol>` para workflows rápidos:

| Fase | Agente | Rol |
|------|--------|-----|
| F0 | `@f0-explorer` | Diagnosticar el codebase (agnóstico al stack) |
| F1 | `@f1-planner` | Redactar spec.md con criterios BDD |
| F1.5 | `@f15-spec-reviewer` | Validar de forma independiente la testeabilidad del spec |
| F2-RED | `@f2-red-test-writer` | Escribir tests que fallan (TDD) |
| F2-GREEN | `@f2-green-builder` | Implementar el mínimo código que pasa los tests |
| F2-REFACTOR | `@f2-refactor-improver` | Limpiar código sin cambiar comportamiento |
| F3 | `@f3-validator` | Linter, security, secret-scan, spec-compliance |
| F4 | `@f4-deployer` | Deployar a dev/sandbox |
| F5 | `@f5-archiver` | Bump SemVer, commit semántico, archivado |
| — | `@aux-quick-fix` | Quick-fixes atómicos (≤3 archivos) |
| — | `@aux-audit` | Auditoría de calidad (read-only) |
| — | `@aux-refactor` | Refactor seguro manteniendo tests |
| — | `@aux-explain` | Walkthrough didáctico (read-only) |
| — | `@aux-oracle` | Conocimiento general teórico |

El primary (router) sigue llamándose `@zugzbot` (es el nombre de marca).

---

## 🔧 Reglas de Contribución

### 1. Un agente = una responsabilidad (SRP)

- Cada agente tiene **un único rol**.
- Boundaries absolutas (qué NO puede hacer) están en `prompts/boundaries/`.
- Si un agente necesita lógica mixta, divídelo en 2.
- El primary (`@zugzbot`) **NO** debe ejecutar tools de validación/escritura — sólo `sdd_transition` y `sdd_lock_manager`.

### 2. Una herramienta = un trabajo (SRP estricto)

- Tools se organizan por fase en `tools/_f<n>/` (excepto `tools/_core/` que son transversales).
- `tools/_lib/` son librerías internas — **NO** se registran como tools ni aparecen en `opencode.json`.
- Si una tool ejecuta 2 cosas no relacionadas, divídela.

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

Cualquier cambio al schema del lockfile debe:
- Incrementar `SCHEMA_VERSION` en `tools/_core/sdd_lock_manager.ts`.
- Actualizar `migrateToV*` con la lógica de migración.
- Actualizar tests en `tests/integration/`.

### 6. Prompts modulares (Sprint 1+)

Cualquier agente nuevo debe usar la estructura:
- `agents/<name>.md` — solo encadena system + contract + boundary.
- `prompts/contracts/<name>-contract.md` — QUÉ hace.
- `prompts/boundaries/<name>-boundary.md` — QUÉ NO hace.

NO escribir prompts monolíticos.

### 7. Manifiesto canónico (v3)

Cualquier **elemento nuevo** (agente, skill, tool, MCP) debe declararse en `agents/manifest.json` ANTES de ser creado. Esto permite que el instalador y los tests validen la integridad.

---

## 🧪 Testing

```bash
npx tsc --noEmit -p tsconfig.build.json   # TypeScript compile
npx eslint .                              # Linter
npx vitest run                            # Tests
```

- **Unit** (estructura, schema): `tests/unit/<name>.test.js`
- **Integration** (lógica de tools): `tests/integration/<name>.test.js`

Usa `vitest` (no jest). Tests deben ser **independientes** (cada test crea sus propios fixtures).

---

## 🔁 Workflow de Contribución

1. Fork el repo.
2. Crea una rama: `git checkout -b feature/<descriptive-name>`.
3. Lee `agents/manifest.json` para entender la estructura actual.
4. Si añades un elemento nuevo, decláralo primero en el manifest.
5. Implementa con TDD discipline.
6. Verifica: `npx tsc && npx eslint . && npx vitest run`.
7. Commit con Conventional Commits en español.
8. Push y abre PR.

### Convención de commits

```text
feat(agents): añadir f6-post-deploy-monitor
fix(transition): corregir gate de HIL-A
refactor(lock_manager): separar update y validate
docs(readme): documentar f15-spec-reviewer
test(cycle): añadir test de F2-REFACTOR sin GREEN
chore(manifest): declarar nueva skill
```

---

## 🛡️ Permisos de Agentes (jerarquía v3)

```
Primary (mode: primary)
└── zugzbot (router cognitivo)

Subagents (mode: subagent)
├── Core SDD cycle: f0-explorer, f1-planner, f15-spec-reviewer,
│                   f2-red-test-writer, f2-green-builder, f2-refactor-improver,
│                   f3-validator, f4-deployer, f5-archiver
└── Auxiliares: aux-quick-fix, aux-audit, aux-refactor, aux-explain, aux-oracle
```

**Permisos clave**:
- `aux-audit`: `edit: deny` (read-only).
- `aux-explain`: `edit: deny, bash: deny` (sólo lectura).
- `aux-oracle`: `edit/bash/lsp: deny` (sólo knowledge). Tiene `question: allow` y `skill: { "*": "allow" }`.
- `f15-spec-reviewer`: `edit: deny, bash: deny` (sólo valida, no modifica).

---

## 🆕 Cómo añadir un nuevo agente (v3)

1. **Decide su fase/rol**: ¿es para una fase existente (crear `f<n>-<rol>`) o es auxiliar (crear `aux-<rol>`)?
2. **Crea el archivo**: `agents/<nombre>.md` con frontmatter (mode, model, variant, permission).
3. **Crea los prompts modulares** (si es fase): `prompts/contracts/<nombre>-contract.md` y `prompts/boundaries/<nombre>-boundary.md`.
4. **Declara en el manifest**: `agents/manifest.json` bajo `agents` y `workflows`.
5. **Registra en `opencode.json`**: bajo la clave `agent`.
6. **Registra en el instalador**: `bin/zugzbot.js` en la sección de generación de `opencode.json`.
7. **Añade el test de existencia**: `tests/unit/harness_structure.test.js` en `EXPECTED_AGENTS` (y `EXPECTED_CONTRACTS`/`EXPECTED_BOUNDARIES` si es fase).
8. **Bump version**: `package.json` (semver patch si es fix, minor si es nuevo agente).

---

## 🆕 Cómo añadir una nueva skill

1. **Crea la carpeta**: `skills/<nombre>/SKILL.md` con frontmatter (name, description).
2. **Declara en el manifest**: `agents/manifest.json` bajo `skills.active`.
3. **Documenta los triggers**: en `AGENTS.md` (esta sección).
4. **Si es una skill crítica del ciclo, referénciala** desde el agente apropiado (e.g. `sdd-tdd-coach` desde los F2).

---

## 🆕 Cómo añadir una nueva tool

1. **Decide su ubicación**: `tools/_f<n>/` (si es de fase) o `tools/_core/` (si es transversal) o `tools/_lib/` (si es librería interna).
2. **Crea el archivo**: `<ubicación>/<nombre>.ts`.
3. **Exporta en el registry**: `tools/index.ts`.
4. **Compila**: `npx tsc -p tsconfig.build.json`.
5. **Añade permiso en el agente apropiado**: `opencode.json`.
6. **Declara en el manifest**: `agents/manifest.json` bajo `tools._f<n>` o `tools._core`.

---

## 🆕 Cómo añadir un nuevo MCP

1. **Declara en el manifest**: `agents/manifest.json` bajo `mcps.active`.
2. **Registra en `opencode.json`**: bajo `mcp` con `type: "local"` y el comando.
3. **Añade permisos wildcard** (e.g. `playwright_*`) en los agentes que deban usarlo.

---

## ⚙️ Build y Release

```bash
# Compilar TS
npx tsc -p tsconfig.build.json

# Tests completos
npx tsc --noEmit -p tsconfig.build.json && npx eslint . && npx vitest run

# Tag
git tag v3.0.0
```

El instalador `bin/zugzbot.js` corre con `node bin/zugzbot.js` (no requiere build para ejecutarse).

---

## 📋 Checklist antes de Merge

- [ ] `agents/manifest.json` actualizado con cualquier elemento nuevo
- [ ] Tests pasan: `npx vitest run`
- [ ] TypeScript compila: `npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- [ ] Linter limpio: `npx eslint .` → 0 errores
- [ ] Si cambiaste `tools/`: actualizaste `tools/index.ts` y `.opencode/tools/`
- [ ] Si añadiste agente: actualizaste `opencode.json` y `bin/zugzbot.js`
- [ ] Si cambiaste schema: actualizaste `migrateToV*` y tests
- [ ] Si añadiste profile: documentaste en `README.md`
- [ ] CHANGELOG.md actualizado

---

## 🤝 Código de Conducta

- Cambios pequeños y verificables > cambios grandes y arriesgados.
- Documenta en el commit message QUÉ y POR QUÉ.
- Si dudas, pregunta en el PR antes de mergear.
- Mantén los tests pasando en todo momento.

---

**Mantenido por**: Danielisla96
**Versión actual**: 3.0.0
