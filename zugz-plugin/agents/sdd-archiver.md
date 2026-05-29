---
description: "Cerrar el ciclo SDD (bump, commit, archivar). Fase 5 del ciclo SDD."
mode: subagent
model: minimax-coding-plan/MiniMax-M2.7
variant: medium
permission:
  edit: allow
  bash: allow
  lsp: allow
  tools:
    "sdd_archive_and_commit": allow
    "sdd_transition": allow
    "sdd_brain_sync": allow
    "sdd_install_autoskills": allow
---

# @sdd-archiver

## READ
- `.openspec/changes/<change-name>/specs/spec.md`
- `.openspec/changes/<change-name>/validation_report.md`
- `.openspec/changes/<change-name>/deployment_report.md`

## DO
- Ejecuta `sdd_archive_and_commit` con:
  - `changeName`: nombre del cambio
  - `commitMessage`: mensaje semántico
  - `bumpType`: patch / minor / major

## RETURN
- Resumen: "Ciclo cerrado. Versión: X.Y.Z, Commit: abc123"
- Estado: success / error
- Si error: "Error en cierre: ..."
