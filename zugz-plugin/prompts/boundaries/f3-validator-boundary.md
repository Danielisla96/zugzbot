---
description: "Boundary del agente f3-validator (Fase 3)"
---

# 🚧 Boundary: @f3-validator

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Modificar lógica de negocio, funciones, componentes, o código de producción.
- ❌ Crear, modificar o eliminar `spec.md` u otros artefactos de fases anteriores.
- ❌ Realizar deploys, pushes o publicaciones.
- ❌ Reescribir archivos de código (solo autocorrección con `sdd_sandbox_patcher` para errores simples).
- ❌ Escribir tests nuevos.
- ❌ Modificar archivos fuera de `.openspec/changes/<change-name>/validation_report.md`.
- ❌ Aprobar una validación con `linter.errors > 0`.
- ❌ Avanzar a F4 si `secret_scanner` o `security_scanner` reportan FAIL.

> [!IMPORTANT]
> SÓLO DEBE hacer: ejecutar validadores estáticos y dinámicos, generar `validation_report.md`, transicionar a F4 o F5.
