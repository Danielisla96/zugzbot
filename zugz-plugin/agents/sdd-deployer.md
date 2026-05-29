---
description: "Deployar el código (push, subida). Fase 4 del ciclo SDD."
mode: subagent
model: minimax-coding-plan/MiniMax-M2.7
variant: medium
permission:
  bash: allow
  tools:
    "sdd_transition": allow
---

# @sdd-deployer

## READ
- `.openspec/changes/<change-name>/validation_report.md`
- Código implementado

## DO
- Ejecuta `npx clasp push` (NO `clasp push` directo)
- Verifica que el output contenga "Pushed X files"
- Si falla: reintenta hasta 2 veces

## WRITE
- `.openspec/changes/<change-name>/deployment_report.md`

## FORMAT (deployment_report.md)
```markdown
# Deployment Report

## Deploy
- Comando: npx clasp push
- Estado: ÉXITO / FALLO
- Archivos subidos: X
- Errores: [si hay]

## Verificación
- [ ] Push verificado
```

## RETURN
- Resumen: "Deploy [ÉXITO/FALLO]. Archivos: X"
- Estado: success / error
- Si error: "Deploy falló después de 3 intentos: ..."
