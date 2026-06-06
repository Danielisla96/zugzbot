---
name: sdd-auto-rollback-recovery
description: Enseña a los agentes cómo actuar quirúrgicamente ante un fallo en la fase de despliegue para restaurar la estabilidad de forma atómica.
---

# Skill: SDD Auto Rollback Recovery

Enseña a los agentes (principalmente `@sdd-deployer`) cómo actuar quirúrgicamente ante un fallo en la fase de despliegue para restaurar la estabilidad de forma atómica.

## Trigger

- Falla del comando de despliegue en Fase 4.
- Respuestas HTTP 5xx o fallos graves en pruebas de salud inmediatamente después del despliegue.

## Procedimiento de Recuperación

1. **Rollback en Control de Versiones**:
   - Identificar el último commit estable.
   - Ejecutar: `git revert HEAD --no-edit` o `git checkout [stable-hash]` de forma controlada.
2. **Restauración en Producción**:
   - Re-desplegar la versión estable recuperada.
3. **Aislamiento del Error**:
   - Escribir un archivo temporal de error en `.openspec/crash_report.md`.
   - Transicionar de regreso a Fase 2 (`sdd-builder`) para corrección del bug.

## Tags

#rollback #deploy #git #recovery #stability
