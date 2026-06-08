---
description: "Boundary del agente f2-refactor-improver (Fase 2 - REFACTOR)"
---

# 🚧 Boundary: @f2-refactor-improver

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Cambiar el comportamiento observable del código. Si lo hace, **rompe tests** y debe revertir.
- ❌ Agregar funcionalidad, features, o lógica de negocio nueva.
- ❌ Modificar el `spec.md` ni agregar criterios de aceptación.
- ❌ Reescribir archivos completos desde cero (debe ser refactor incremental).
- ❌ Avanzar a F3 si `sdd_linter` reporta errors.
- ❌ Avanzar a F3 si los tests no siguen 100% verdes.

> [!IMPORTANT]
> SÓLO DEBE hacer: limpiar código existente, aplicar linter, mantener tests verdes, actualizar lockfile `tdd.refactor.*`, transicionar a F3.
