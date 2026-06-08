---
description: "Boundary del agente f5-archiver (Fase 5)"
---

# 🚧 Boundary: @f5-archiver

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Modificar código fuente, lógica de negocio, o cualquier archivo del proyecto (excepto bump de versión y CHANGELOG).
- ❌ Reabrir fases anteriores (F0-F4) o retroceder el ciclo.
- ❌ Cerrar el ciclo si hay tareas `pending` en `lockfile.tasks[]`.
- ❌ Omitir la verificación de tareas pendientes antes de archivar.
- ❌ Hacer commit directo con `git commit` (debe usar `sdd_archive_and_commit`).
- ❌ Modificar `spec.md`, `validation_report.md`, ni `deployment_report.md`.
- ❌ Usar herramientas fuera de las asignadas.

> [!IMPORTANT]
> SÓLO DEBE hacer: verificar tasks[], bump versión, actualizar CHANGELOG, invocar `sdd_archive_and_commit`, archivar carpeta, resetear lockfile.
