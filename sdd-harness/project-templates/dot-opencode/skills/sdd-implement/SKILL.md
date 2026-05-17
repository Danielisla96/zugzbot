---
name: sdd-implement
description: Realiza la fase 3 de SDD, implementando el código fuente de forma iterativa y limpia según el checklist de tareas.
license: MIT
compatibility: Requiere openspec CLI.
metadata:
  author: sdd-orchestrator
  version: "1.0"
---

Fase 3 del Spec-Driven Development: Implementación.

**Objetivo**: Escribir código de nivel senior limpio y altamente legible, resolviendo secuencialmente cada tarea propuesta en el checklist.

**Pasos**

1. **Lectura de Arquitectura y Tareas**:
   - Revisa `proposal.md`, `specs/spec.md`, `orchestrator_architecture.md` y `orchestrator_tasks.md` para entender el alcance exacto.

2. **Implementación Enfocada**:
   - Elige la primera tarea pendiente (`- [ ]`) en `orchestrator_tasks.md`.
   - Modifica e introduce los archivos requeridos bajo `src/` aplicando principios SOLID y código autodocumentado.
   - Mantén los cambios acotados y evita mezclar objetivos de múltiples tareas.

3. **Actualización de Estado y Validación Estática**:
   - Revisa activamente que no queden marcadores de error sintáctico, tipado o diagnósticos de LSP en tus archivos modificados.
   - Una vez finalizada la codificación limpia de la tarea, marca su casilla en `orchestrator_tasks.md` (`- [ ]` -> `- [x]`).
   - Describe brevemente al orquestador los cambios e interfaces implementadas.

4. **Iteración y Auto-Curación**:
   - Repite el proceso para cada tarea del checklist hasta completarlas todas.
   - Si Zugzbot te reactiva con un reporte de error de pruebas de la Fase 4, suspende el avance, analiza el reporte de fallas de `@sdd-verifier`, corrige el código en `src/`, actualiza el checklist y vuelve a entregar.
   - Si surge un conflicto de diseño o una ambigüedad en los requerimientos, pausa e infórmale a Zugzbot.
