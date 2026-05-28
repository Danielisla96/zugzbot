# 🚀 Guía Rápida Zugzbot SDD

> [!TIP]
> Esta es una guía rápida. Para documentación completa, consulta `README.md`.

---

## ⚡ Inicio Rápido

### 1. Abre OpenCode en tu proyecto
```bash
opencode
```

### 2. Habla con `@zugzbot`
Indícale tu requerimiento. El arnés activará automáticamente el ciclo SDD.

### 3. Flujo de 4 Fases

| Fase | Tú | Agente |
|:---|:---|:---|
| **F1** | Responde la encuesta 3-5 preguntas | `@sdd-planner` |
| **F2** | Hacer QA manual en caliente | `@sdd-builder` |
| **F3** | Observar validación estática | `@sdd-tester` |
| **F4** | Confirmar commit Git | `@sdd-archiver` |

---

## 🛠️ Comandos CLI

```bash
./sdd status      # Ver estado del ciclo
./sdd clean       # Resetear a Fase 0
./sdd lint        # Auditar linter
./sdd test        # Correr tests
```

---

## 📁 Archivos Clave

| Archivo | Propósito |
|:---|:---|
| `AGENTS.md` | Reglamento global del swarm |
| `.openspec/diagnostics.md` | Mapa técnico del proyecto (Fase 0) |
| `.openspec/sdd-lock.json` | Estado del ciclo activo (local) |
| `.openspec/brain.md` | Memoria técnica del proyecto |

---

## 🔄 Hitos de Aprobación

1. **Hito A**: Después de Fase 1 → ¿Apruebas el plano técnico?
2. **Hito B**: Después de Fase 3 → ¿Conforme con el deploy?

---

## ⚙️ Personalizar Modelos

Edita `.opencode/agents/<agente>.md` y cambia el campo `model`.

Modelos disponibles: MiniMax-M2.7 (oficial), Gemini 3.5 Flash, Claude 3.5 Sonnet, DeepSeek V4.
