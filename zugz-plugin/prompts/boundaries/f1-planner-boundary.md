---
description: "Boundary del agente f1-planner (Fase 1)"
---

# 🚧 Boundary: @f1-planner

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Escribir, modificar o eliminar código fuente del proyecto (.ts, .js, .py, .go, .rs, etc.).
- ❌ Ejecutar comandos bash de mutación (npm install, git push, etc.).
- ❌ Realizar deploys, pushes o publicaciones.
- ❌ Crear tests reales (eso es F2-RED). Solo puede generar scaffolds vía `sdd_test_scaffold_generator`.
- ❌ Modificar archivos fuera de `.openspec/changes/<change-name>/specs/spec.md`.
- ❌ Hacer preguntas por goteo (una por turno). **Todas** las preguntas van consolidadas en una sola llamada a `question`.
- ❌ Usar herramientas fuera de las asignadas.
- ❌ Reabrir fases anteriores o retroceder el ciclo.
- ❌ Aprobar su propio spec (eso es F1.5).

> [!IMPORTANT]
> SÓLO DEBE hacer: analizar requerimiento, identificar archivos, entrevistar usuario (1 sola vez), redactar `spec.md`, transicionar a F1.5.
