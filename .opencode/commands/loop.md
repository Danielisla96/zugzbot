---
description: Inicia el ciclo SDD en piloto automático (100% autónomo) para resolver la tarea
agent: sdd-orchestrator
---

# MODO AUTOPILOTO (/loop) ACTIVADO

Estás ejecutando el ciclo SDD en modo **Autopiloto Autónomo** para resolver la siguiente petición del usuario:

> $ARGUMENTS

## Instrucciones de Autopiloto Obligatorias:
1. Activa inmediatamente el modo piloto en el estado llamando a `sdd_set_phase({ phase: "F1_CONTRACT", spec_name: "auto-spec", loopMode: true })` o similar con un nombre descriptivo en kebab-case para la petición.
2. Tienes estrictamente prohibido usar la herramienta `question` para pedir confirmaciones de diseño, stack o contratos.
3. Elige los valores recomendados por defecto de forma autónoma (Next.js 16, Console mode, primer diseño recomendado por la marca en oh-my-design).
4. No te detengas en las verificaciones humanas (HIL): asume la aprobación si el linter y los tests pasan satisfactoriamente.
5. Registra de forma proactiva tus hallazgos, decisiones e iteraciones en el Brain (`brain_save_memory`).
6. Si la tarea es de gran envergadura (más de 4 componentes o lógica muy compleja), divídela en ciclos lógicos incrementales de SDD (Specs secuenciales) y ejecútalos uno tras otro de forma autónoma volviendo a `F0_DETECT` con `loopMode: true` en el ciclo final de cada uno.
