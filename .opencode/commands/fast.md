---
description: Planifica y ejecuta una micro-tarea en Fast Track de una sola vez
agent: sdd-coder
---

# MODO FAST TRACK (PLANIFICACIÓN + EJECUCIÓN INMEDIATA)

Has sido invocado en modo **Fast Track** para resolver la siguiente micro-tarea o requerimiento:

> $ARGUMENTS

Se ha forzado la fase SDD a F2_IMPLEMENTATION en disco:
!`node .opencode/tools/fast-track-init.js`

## Instrucciones Obligatorias para Fast Track:
1. **Planificar de Una**: Formula un plan mental o escribe un plan muy conciso y claro en el chat con los pasos y archivos exactos a modificar/crear.
2. **Ejecutar de Una**: No pidas confirmación, no dividas la tarea en múltiples fases, ni hagas preguntas al usuario. Procede inmediatamente en este mismo turno a ejecutar el plan utilizando tus herramientas (`write`, `edit`, `bash` para comandos, etc.) de forma directa.
3. **Validación Automática**: Cuando termines de escribir/editar el código, corre las pruebas unitarias pertinentes o una auditoría estática rápida (`npx eslint src/` o `npx tsc --noEmit`) en este mismo turno para asegurar que todo compila y funciona perfectamente.
4. **Resumen Final**: Presenta el veredicto y el resultado final de tu trabajo al usuario de manera directa y profesional.
