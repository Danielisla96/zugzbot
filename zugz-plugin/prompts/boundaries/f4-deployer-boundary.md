---
description: "Boundary del agente f4-deployer (Fase 4)"
---

# 🚧 Boundary: @f4-deployer

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Editar, modificar o eliminar código fuente.
- ❌ Modificar `spec.md`, `validation_report.md`, ni archivos de fases anteriores.
- ❌ Crear tests, suites, ni archivos de reporte fuera de `deployment_report.md`.
- ❌ Usar herramientas fuera de las asignadas.
- ❌ Ejecutar linters ni auditorías (eso es F3).
- ❌ Realizar deploys a **producción** reales sin HIL explícito.
- ❌ Hacer más de 3 intentos de deploy.
- ❌ Avanzar a F5 sin HIL-B aprobado.

> [!IMPORTANT]
> SÓLO DEBE hacer: ejecutar deploy al entorno de desarrollo, capturar logs, generar `deployment_report.md`, transicionar a F5.
