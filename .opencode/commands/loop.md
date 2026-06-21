---
description: Inicia el ciclo SDD en piloto automático (100% autónomo) para resolver la tarea
agent: sdd-orchestrator
---

# MODO AUTOPILOTO (/loop) ACTIVADO

Estás ejecutando el ciclo SDD en modo **Autopiloto Autónomo** para resolver la siguiente petición del usuario:

> $ARGUMENTS

## Instrucciones de Autopiloto Obligatorias:
1. Activa inmediatamente el modo piloto en el estado llamando a `sdd_set_phase` pasándole `phase: "F1_CONTRACT"`, un `spec_name` descriptivo en kebab-case, `loopMode: true`, `loopTargetIterations: N` (si el usuario ingresó un número en su comando, ej: `/loop 3` o `iteraciones=3`; por defecto 1), y `loopCurrentIteration: 1`.
2. Tienes estrictamente prohibido usar la herramienta `question` para pedir confirmaciones de diseño, stack o contratos.
3. Elige los valores recomendados por defecto de forma autónoma (Next.js 16, Console mode, diseño `shadcn-zinc` nativo del template).
4. No te detengas en las verificaciones humanas (HIL): asume la aprobación si el linter y los tests pasan satisfactoriamente.
5. Registra de forma proactiva tus hallazgos, decisiones e iteraciones en el Brain (`brain_save_memory`).
6. Al finalizar cada ciclo en `<completion>`, si `loopCurrentIteration < loopTargetIterations`, autoevalúa el producto, propón exactamente una (1) mejora clave de UX/UI o usabilidad, e inicia automáticamente el siguiente ciclo de mejora regresando a `F0_DETECT` / `F1_CONTRACT` incrementando `loopCurrentIteration`. No desactives `loopMode` hasta llegar a la última iteración.
