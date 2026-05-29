---
description: Ejecutar despliegue (push, subida). Fase 4 del ciclo SDD.
agent: sdd-deployer
subtask: true
model: minimax-coding-plan/MiniMax-M2.7
---

Ejecuta deploy para el cambio activo: $ARGUMENTS
- Lee validation_report.md
- Ejecuta npx clasp push
- Genera deployment_report.md
- Al terminar: llama sdd_transition con nextPhase=5
