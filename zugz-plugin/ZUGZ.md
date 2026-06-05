# 🚀 Guía Rápida Zugzbot v2.0.0

> [!TIP]
> Esta es una guía rápida. Para documentación completa, consulta `README.md`.

---

## ⚡ Inicio Rápido

### 1. Abre OpenCode en tu proyecto

```bash
opencode
```

### 2. Habla con `@zugzbot`

Indícale tu requerimiento. El router cognitivo lo clasificará automáticamente.

```text
"agrega un endpoint de logout que invalide el JWT"
"arregla el typo en README línea 12"
"audita la calidad del código"
"qué es un closure en JavaScript"
"refactoriza el UserService"
```

El router detecta el workflow apropiado y delega al subagente correcto.

---

## 🧭 6 Workflows Disponibles

| Workflow | Trigger típico | Agente |
| :--- | :--- | :--- |
| `full-sdd-tdd` | "agrega", "implementa", "crea módulo", "el bug es" | `@sdd-explorer` → F0 |
| `quick-fix` | "arregla typo", "renombra", "bump", "cambia formato" | `@aux-handyman` |
| `audit` | "audita", "revisa calidad", "qué deuda técnica" | `@aux-auditor` |
| `refactor` | "refactoriza", "limpia", "simplifica" | `@aux-refactor` |
| `explain` | "qué hace", "explica", "muéstrame cómo" | `@aux-explainer` |
| `oracle` | "qué es X", "diferencia entre A y B" | `@aux-oracle` |

---

## 🔄 Flujo Completo (full-sdd-tdd)

| Fase | Tú | Agente |
| :--- | :--- | :--- |
| **F0** | Esperar | `@sdd-explorer` detecta stack y mapea |
| **F1** | Responder encuesta (3-5 preguntas) | `@sdd-planner` redacta `spec.md` |
| **F1.5** | (automático) | `@f1.5-spec-reviewer` valida testeabilidad |
| **HIL-A** | **Aprobar spec** | – |
| **F2-RED** | Esperar | `@f2-red-test-writer` escribe tests fallidos |
| **F2-GREEN** | Esperar | `@sdd-builder` implementa mínimo código |
| **F2-REFACTOR** | Esperar | `@f2-refactor-improver` limpia |
| **F3** | Observar | `@sdd-tester` valida linter, security, spec |
| **F4** | (opcional) | `@sdd-deployer` deploya a dev/staging |
| **HIL-B** | **Validar QA** | – |
| **F5** | Confirmar | `@sdd-archiver` bump + commit + archive |

---

## 🛠️ Comandos CLI

```bash
npx tsc         # Verificar compilación TS
npx eslint .    # Linter
npx vitest run  # Tests (81/81)
```

---

## 📁 Archivos Clave

| Archivo | Propósito |
| :--- | :--- |
| `opencode.json` | Configuración de 14 agentes |
| `.openspec/sdd-lock.json` | Estado del ciclo (schema v2) |
| `.openspec/brain.md` | Memoria técnica del proyecto |
| `.openspec/diagnostics.md` | Mapa del stack detectado |
| `.openspec/changes/<name>/specs/spec.md` | Spec BDD del cambio activo |
| `.opencode/profiles/*.json` | 8 profiles de stack |
| `prompts/system/router-rules.md` | Tabla de decisión del router |

---

## 🚦 Hitos HIL

| Hito | Cuándo | Acción |
| :--- | :--- | :--- |
| **HIL-A** | Post-F1.5 | Responder: "¿Apruebas el spec?" |
| **HIL-B** | Post-F4 | Responder: "¿Apruebas el QA?" |

> Las preguntas se hacen en **una sola llamada consolidada** (no por goteo).

---

## ⚙️ Personalizar Modelos

Edita `zugz-models.json`:

```json
{
  "agents": {
    "zugzbot": "minimax-coding-plan/MiniMax-M2.7",
    "sdd-builder": "minimax-coding-plan/MiniMax-M2.7",
    "aux-oracle": "minimax-coding-plan/MiniMax-M2.7"
  },
  "default": "minimax-coding-plan/MiniMax-M2.7"
}
```

---

## 🌐 Stacks Soportados (auto-detección)

Zugzbot detecta automáticamente tu stack:

- **Node/TypeScript** (Next, React, Vue, Svelte, Express, Fastify, Nest)
- **Python** (Django, FastAPI, Flask, Click)
- **Go** (módulos estándar)
- **Rust** (Cargo)
- **Java** (Maven, Gradle)
- **Google Apps Script** (clasp)
- **Static Site** (Astro, Hugo, Jekyll, Next SSG)

Para verificar la detección:

```bash
# (vía herramienta) action: "detect"
# o pregunta al zugzbot: "¿qué stack detectó?"
```

---

## 🧠 TDD Discipline (lo más importante)

> **No se puede escribir código de producción sin un test que lo exija.**

```
1. RED     → Test escrito que FALLA
2. GREEN   → Mínimo código que PASA el test
3. REFACTOR → Limpiar código, tests siguen VERDES
```

El lockfile rechaza transiciones inválidas. Si intentas saltar de F1 a F2-GREEN sin F2-RED, recibes un error.

---

## 📚 Anti-patrones (evítalos)

- 🚫 "Implementar primero, tests después" — NO es TDD.
- 🚫 "Mega-test" (1 test que prueba 10 cosas).
- 🚫 "Test de implementación" (probar funciones internas, no comportamiento).
- 🚫 "Refactor oportunista" (mejorar código no tocado por el cambio).
- 🚫 "Skip RED" (asumir que el test es trivial sin hacerlo fallar primero).

---

## 🤝 Contribuir al Arnés

1. Fork el repo.
2. Clona tu fork y ejecuta `./zugz-plugin/install-plugin.sh` (modo dev con symlinks).
3. Corre `bun install` o `npm install` en la raíz.
4. Envía un Pull Request con la especificación del cambio.

---

## 📄 Licencia

MIT © Danielisla96
