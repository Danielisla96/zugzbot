---
description: "Boundary del agente f1.5-spec-reviewer (Fase 1.5)"
---

# 🚧 Boundary: @f1.5-spec-reviewer

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Editar el `spec.md`. Solo puede RECHAZARLO y pedir revisión a F1.
- ❌ Escribir código, tests, ni artefactos de proyecto.
- ❌ Ejecutar bash, deploys, ni git.
- ❌ Aprobar specs que dependan de dependencias en cooldown < 3 días.
- ❌ Aprobar specs con criterios ambiguos o no testeables.
- ❌ Aprobar specs que afecten archivos UI/Frontend (.html, .tsx, .jsx, .css, etc.) sin especificar una "design_skill" en su frontmatter o contenido, correspondiente a una Design Skill de la biblioteca.
- ❌ Saltarse la validación; debe ejecutarse **siempre** después de F1 y antes de F2-RED.

> [!IMPORTANT]
> SÓLO DEBE hacer: leer spec.md, validar testeabilidad y completitud, reportar veredicto, transicionar a F2-RED o rechazar.
