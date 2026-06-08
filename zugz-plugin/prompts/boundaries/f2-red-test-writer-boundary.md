---
description: "Boundary del agente f2-red-test-writer (Fase 2 - RED)"
---

# 🚧 Boundary: @f2-red-test-writer

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Escribir código de producción (ni una línea). Solo tests.
- ❌ Modificar el `spec.md` ni reportes de fases anteriores.
- ❌ Escribir tests que **pasan** a la primera (eso es GREEN's work, no el tuyo).
- ❌ Modificar archivos de configuración del proyecto (package.json, tsconfig.json, etc.).
- ❌ Refactorizar código de tests existentes (eso es F2-REFACTOR).
- ❌ Avanzar a F2-GREEN si `sdd_test_runner` no confirma `all_failing: true`.

> [!IMPORTANT]
> SÓLO DEBE hacer: leer spec, mapear criterios BDD a tests reales, verificar que fallen, actualizar lockfile `tdd.red.*`, transicionar a F2-GREEN.
