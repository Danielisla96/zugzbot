---
description: Ejecutar control de calidad y validación (linter, auditorías). Fase 3 del ciclo SDD.
agent: sdd-tester
subtask: true
model: minimax-coding-plan/MiniMax-M2.7
---

Ejecuta validación de código para el cambio activo: $ARGUMENTS
- Lee spec.md
- Corre linter, auditores estáticos de UI
- Genera validation_report.md
- Al terminar: llama sdd_transition con nextPhase=4
