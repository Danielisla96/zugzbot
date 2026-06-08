---
description: "Reglas de decisión del router cognitivo de @zugzbot. Define cómo clasificar el intent del usuario."
---

# 🧭 Router Rules — Zugzbot v2.0.0

> [!IMPORTANT]
> Este archivo es la **tabla de decisión canónica** que `@zugzbot` consulta para clasificar el prompt del usuario y delegar al subagente correcto. Es agnóstico al stack y al tipo de proyecto.

---

## 🎯 Workflows Soportados (6)

| ID | Nombre | Cuándo se activa | Agente inicial |
| :--- | :--- | :--- | :--- |
| `full-sdd-tdd` | Ciclo SDD completo con TDD | Features, bug fixes, cambios lógicos | `@sdd-explorer` (F0) |
| `quick-fix` | Patch atómico ≤3 archivos | Typos, renames, bumps, fixes triviales | `@aux-handyman` |
| `audit` | Auditoría de calidad sin editar | "audita", "revisa deuda", "qué problemas hay" | `@aux-auditor` |
| `refactor` | Refactor seguro con tests | "refactoriza", "limpia", "reorganiza" | `@aux-refactor` |
| `explain` | Walkthrough del código | "qué hace", "explica", "cómo funciona" | `@aux-explainer` |
| `oracle` | Conocimiento general | Dudas teóricas no relacionadas al código | `@aux-oracle` |

---

## 🔍 Heurística de Clasificación

Aplica este orden de matching al prompt del usuario. **El primer match gana**.

### 1. ¿Es consulta conceptual/teórica pura?
**Señales**: "qué es X", "cómo funciona Y en general", "diferencia entre A y B", "explica el patrón Z", NO menciona archivos ni código del proyecto.

→ **`oracle`**

### 2. ¿Pide explicación de código específico?
**Señales**: "qué hace esta función", "explica este archivo", "por qué hace X este código", "muéstrame el flujo de Y", menciona paths, funciones o clases concretas.

→ **`explain`**

### 3. ¿Pide auditoría de calidad?
**Señales**: "audita", "revisa la calidad", "qué deuda técnica hay", "hay code smells", "pasa el linter", "security audit", "vulnerabilidades".

→ **`audit`**

### 4. ¿Pide refactor de código existente?
**Señales**: "refactoriza", "limpia", "reorganiza", "extrae función", "aplica el patrón X", "mejora la legibilidad", "simplifica este módulo".

→ **`refactor`**

### 5. ¿Es un cambio trivial de bajo riesgo?
**Señales**: "arregla typo", "renombra X a Y", "bump versión", "actualiza una constante", "cambia un mensaje de error", "agrega un comment", "cambia formato de un archivo único".

**Test de 3 archivos**: ¿afecta más de 3 archivos? Si sí → NO es quick-fix.

→ **`quick-fix`**

### 6. ¿Es un cambio lógico/feature/bug?
**Señales**: "agrega feature", "implementa", "crea módulo", "desarrolla", "el bug es que...", "no funciona X", "necesito Y", cualquier cambio que afecte lógica de negocio.

→ **`full-sdd-tdd`**

---

## 🆘 Ambigüedad

Si **2+ workflows** matchean con fuerza similar, hacer **1 pregunta consolidada** con la herramienta `question` ofreciendo 2-3 opciones. NO preguntar por goteo.

**Formato de la pregunta**:
```text
"Detecté que tu pedido podría resolverse de N formas. ¿Cuál prefieres?"

Opciones:
  A) [workflow 1]: [descripción de 1 línea]
  B) [workflow 2]: [descripción de 1 línea]
  C) workflow completo SDD-TDD (si no estás seguro)
```

---

## 🚦 Reglas de Decisión para el HIL-A (post-F1.5)

Después de F1.5-spec-reviewer, el orquestador presenta el spec al usuario y pregunta:

```text
"¿Apruebas este spec? Si Sí, paso a F2-RED (escribir tests que fallen)."

Opciones:
  A) Aprobar y continuar
  B) Rechazar y volver a F1
  C) Pausar para revisar manualmente
```

Si el usuario responde **A** (o afirmación equivalente), transicionar a `nextPhase: "F2-RED", status: "spec_approved"`.

Si responde **B** (o "no"/"rechazar"), transicionar a `nextPhase: "F1", direction: "backward"`.

Si responde **C** (o "espera"/"pause"), NO transicionar. Mantener fase actual y esperar.

---

## 🚦 Reglas de Decisión para el HIL-B (post-F4)

Después de F4-deployer, el orquestador pregunta:

```text
"¿Apruebas el resultado del deploy? Si Sí, paso a F5 (commit + archivado)."

Opciones:
  A) Aprobar y cerrar ciclo
  B) Reportar issues (vuelve a F3 para re-validar)
  C) Rollback (vuelve a F1)
```

---

## 🤖 Detección de Intent para Mensajes Cortos

| Mensaje del usuario | Workflow | Razonamiento |
| :--- | :--- | :--- |
| "agrega login con Google" | full-sdd-tdd | Feature nueva, multi-archivo |
| "qué es un closure" | oracle | Teoría sin código |
| "explica el UserService" | explain | Código específico mencionado |
| "hay deuda técnica?" | audit | Pide evaluación de calidad |
| "arregla el typo en README" | quick-fix | Trivial, 1 archivo |
| "refactoriza el controller" | refactor | Pide mejora de código existente |
| "implementa el endpoint /logout" | full-sdd-tdd | Feature nueva |
| "el login está roto" | full-sdd-tdd | Bug fix, requiere spec+test+impl |
| "por qué la app está lenta" | audit | Diagnóstico de calidad/performance |
| "muéstrame la estructura del proyecto" | explain | Pide walkthrough |
| "ayuda" | (preguntar) | Ambiguo, pedir clarificación |

---

## 🚫 Lo que NO es responsabilidad del Router

- **Decisiones de modelo por fase**: lo hace el perfil del agente, no el router.
- **Planear el contenido del spec**: lo hace `@sdd-planner` en F1.
- **Escribir código de cualquier tipo**: lo hace F2.
- **Validar resultado técnico**: lo hace F3.

El router **solo clasifica y delega**. Punto.
