# 🚀 ZUGZ — Cheat Sheet v2.0.0

> Una pantalla. Para detalles, ver `README.md`.

---

## ⚡ 3 pasos para empezar

```bash
cd tu-proyecto
npm install zugzbot-sdd@latest && npx zugzbot
opencode .
```

---

## 🎯 6 workflows (dile a @zugzbot)

| Di... | Workflow | Agente |
|---|---|---|
| "agrega X", "implementa Y", "el bug es Z" | `full-sdd-tdd` | F0→F5 (ciclo completo) |
| "arregla typo", "renombra", "bump versión" | `quick-fix` | `@aux-handyman` (≤3 archivos) |
| "audita", "qué deuda técnica hay" | `audit` | `@aux-auditor` (read-only) |
| "refactoriza", "limpia", "simplifica" | `refactor` | `@aux-refactor` (con tests) |
| "explícame qué hace este archivo" | `explain` | `@aux-explainer` (read-only) |
| "qué es un closure", "diferencia X vs Y" | `oracle` | `@aux-oracle` (teoría) |

---

## 🔄 Ciclo `full-sdd-tdd` (las 11 estaciones)

```
F0 → F1 → F1.5 → HIL-A → F2-RED → F2-GREEN → F2-REFACTOR → F3 → F4(opt) → HIL-B → F5
                            ↑                                          ↑
                       Tú apruebas                              Tú validas QA
```

| Fase | Quién hace | Tú |
|---|---|---|
| F0 | `@sdd-explorer` detecta stack | – |
| F1 | `@sdd-planner` redacta `spec.md` (BDD) | Respondes 3-5 preguntas |
| F1.5 | Spec reviewer valida testeabilidad | – |
| **HIL-A** | – | **Aprobar / Rechazar / Pausar** |
| F2-RED | `@f2-red-test-writer` escribe tests rojos | – |
| F2-GREEN | `@sdd-builder` mínimo viable | – |
| F2-REFACTOR | `@f2-refactor-improver` limpia | – |
| F3 | `@sdd-tester` 15 validadores | – |
| F4 | `@sdd-deployer` deploy a dev (opt) | – |
| **HIL-B** | – | **Aprobar / Issues / Rollback** |
| F5 | `@sdd-archiver` bump + commit + archive | – |

---

## 🚦 HIL (formato A/B/C siempre)

**HIL-A** (post-F1.5): `[A] ✅ Aprobar` / `[B] ❌ Rechazar` / `[C] ⏸ Pausar`
**HIL-B** (post-F4): `[A] ✅ Aprobar` / `[B] 🐛 Issues` / `[C] ⏪ Rollback`

---

## 🔁 Reanudar (amnesia cero)

Cierra OpenCode. Vuelve otro día. Di lo que sea. `@zugzbot` lee `.openspec/sdd-lock.json` y continúa donde quedaste.

---

## ⚙️ Cambiar modelos por agente

Edita `zugz-models.json` y re-ejecuta `npx zugzbot`:

```json
{
  "default": "google/gemini-2.5-pro",
  "agents": {
    "zugzbot": "anthropic/claude-sonnet-4.5",
    "sdd-explorer": "openai/gpt-5"
  }
}
```

---

## 🌍 8 stacks auto-detectados

Node/TS · Node/JS · Python · Go · Rust · Java · Google Apps Script · Static Site

---

## 🧠 TDD en 3 pasos

```
1. RED     → test que FALLA
2. GREEN   → mínimo código que PASA
3. REFACTOR → limpiar, tests siguen VERDES
```

El lockfile rechaza transiciones inválidas. **No hay atajos**.

---

## 🛠️ Validar el arnés (dev)

```bash
npx tsc         # 0 errores
npx eslint .    # 0 errores
npx vitest run  # 97/97 tests
```

---

## 📄 MIT © Danielisla96
