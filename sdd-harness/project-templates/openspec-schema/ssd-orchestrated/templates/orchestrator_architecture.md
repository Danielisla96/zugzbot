# Arquitectura del Orquestador: {{changeName}}

Este documento detalla la distribución de responsabilidades y el flujo de agentes que guiará el desarrollo de este cambio.

## 1. Subagentes y Ámbito de Trabajo
- **Zugzbot (Orquestador Maestro)**: Coordina, delega tareas de forma secuencial y supervisa la calidad global del ciclo SDD.
- **Especialistas Consolidados del Ciclo de Vida (Fases 0 a 8)**:
  - `@sdd-architect` (Fases 0, 1 y 2): Diagnostica el entorno (F0), define la propuesta y especificación BDD (F1) y diseña el plano de arquitectura y checklist (F2).
  - `@sdd-implementer` (Fases 3 y 4): Implementa la lógica de código de producción (F3) y refina la consistencia UX/UI del frontend si existe (F4).
  - `@sdd-launcher` (Fase 5): Levanta servidores de simulación o ejecuta la sincronización en nube (`clasp push`) para las pruebas manuales (HIL).
  - `@sdd-release-manager` (Fases 6, 7 y 8): Valida tests (`sdd test`) y linters (`sdd lint`) en bucle de auto-curación (F6), escribe la documentación técnica y SemVer (F7) y ejecuta el archivado y git commit semántico (F8).

## 2. Definición de Capas e Interfaces
- **Hito A: Planificación y Diseño (Fases 0, 1 y 2)**: Diagnóstico de dependencias, especificación de contratos BDD, diseño modular y checklist de tareas.
- **Hito B: Construcción y Simulación (Fases 3, 4 y 5)**: Codificación quirúrgica, refinamiento visual y pruebas del desarrollador en entorno real (local o nube).
- **Hito C: Aseguramiento de Calidad y Cierre (Fases 6, 7 y 8)**: Calidad automatizada de código, reportes de pruebas, manuales canónicos, bitácoras de aprendizaje en el Cerebro y confirmación Git semántica.
