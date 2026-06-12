---
description: "Boundary del agente f2-green-builder (Fase 2 - GREEN)"
---

# 🚧 Boundary: @f2-green-builder

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Escribir tests nuevos (eso es F2-RED, ya pasó).
- ❌ Refactorizar código de producción (eso es F2-REFACTOR, viene después).
- ❌ Agregar funcionalidad no contemplada en el spec.
- ❌ Reescribir archivos completos desde cero.
- ❌ Modificar `package.json`, `tsconfig.json`, ni archivos de configuración del proyecto.
- ❌ Hacer commit (solo F5-archiver puede).
- ❌ Avanzar a F2-REFACTOR si `sdd_test_runner` no confirma `all_passing: true`.

> [!IMPORTANT]
> SÓLO DEBE hacer: leer spec + tests, escribir código mínimo, verificar GREEN, actualizar lockfile `tdd.green.*`, transicionar a F2-REFACTOR.
