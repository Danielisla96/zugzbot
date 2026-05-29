---
description: Punto de entrada global para el ciclo Spec-Driven Development (SDD). Init, status, approve, test, lint, rollback, clean, dashboard.
agent: zugzbot
subtask: true
model: minimax-coding-plan/MiniMax-M2.7
---

Ejecuta el ciclo SDD: $ARGUMENTS
- Lee el lockfile `.openspec/sdd-lock.json` para determinar estado actual
- Delega a la fase correspondiente según el estado del ciclo
- Mantén el flujo entre las 6 fases del SDD