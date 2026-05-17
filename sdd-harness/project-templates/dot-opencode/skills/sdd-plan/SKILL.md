---
name: sdd-plan
description: Realiza la fase 2 de SDD, diseñando la arquitectura técnica y definiendo el checklist de tareas de implementación.
license: MIT
compatibility: Requiere openspec CLI.
metadata:
  author: sdd-orchestrator
  version: "1.0"
---

Fase 2 del Spec-Driven Development: Diseño y Planificación.

**Objetivo**: Generar un plano técnico perfecto de arquitectura y un checklist maestro de tareas atómicas e independientes.

**Pasos**

1. **Análisis de Requerimientos**:
   - Analiza en profundidad el `proposal.md` y `specs/spec.md` generados en la fase de especificación.

2. **Diseño Técnico**:
   - Estructura y escribe el archivo `openspec/changes/<change-name>/orchestrator_architecture.md`.
   - Detalla la arquitectura por capas, la estructura de directorios en `src/`, y las interfaces o contratos entre módulos.

3. **Checklist de Tareas**:
   - Estructura y escribe el archivo `openspec/changes/<change-name>/orchestrator_tasks.md`.
   - Detalla tareas de implementación atómicas (granulares), secuenciadas lógicamente de menor a mayor dependencia.

4. **Entrega**:
   - Reporta al orquestador DaniBot y al usuario el diseño técnico finalizado y el plan de tareas listo para ser delegado.
