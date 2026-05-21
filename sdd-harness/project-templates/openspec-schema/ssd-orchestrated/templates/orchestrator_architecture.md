# Arquitectura del Orquestador: {{changeName}}

Este documento detalla la distribución de responsabilidades y el flujo de agentes que guiará el desarrollo de este cambio.

## 1. Subagentes y Ámbito de Trabajo
- **Zugzbot (Orquestador Maestro)**: Coordina, delega tareas de forma secuencial y supervisa la calidad global del ciclo SDD.
- **Especialistas del Ciclo de Vida (Fases 0 a 8)**:
  - `sdd-inspector` (Fase 0): Diagnostica el entorno de desarrollo, detecta el stack tecnológico y las directivas de seguridad.
  - `sdd-proposer` (Fase 1): Conduce las entrevistas técnicas y define la propuesta (`proposal.md`) y especificación (`spec.md`).
  - `sdd-planner` (Fase 2): Diseña la arquitectura técnica de este cambio y genera el checklist atómico de tareas.
  - `sdd-implementer` (Fase 3): Implementa la lógica de código de producción senior bajo `src/` respetando el checklist.
  - `sdd-ui-designer` (Fase 4): Refina, audita y optimiza visualmente la UI si hay frontend empleando Puppeteer headless.
  - `sdd-launcher` (Fase 5): Gestiona el entorno de desarrollo (servidor local o despliegue en la nube/GAS) y las pruebas manuales humanas de forma interactiva (HIL).
  - `sdd-verifier` (Fase 6): Valida sintaxis, corre tests unitarios/funcionales BDD y realiza pruebas de integración real con curl.
  - `sdd-documenter` (Fase 7): Redacta y actualiza de forma quirúrgica el documento de referencia consolidado en `README.md` (incluyendo manual de uso y arquitectura técnica).
  - `sdd-archiver` (Fase 8): Archiva los cambios finalizados en el histórico y realiza la confirmación Git semántica automática.

## 2. Definición de Capas e Interfaces
- **Capa de Diagnóstico y Configuración**: Fase 0 y Fase 1.
- **Capa de Diseño Técnico y Planificación**: Fase 2.
- **Capa de Construcción e Implementación**: Fase 3.
- **Capa Visual y UI/UX**: Fase 4 (condicional).
- **Capa de Entorno de Pruebas**: Fase 5 (interactivo).
- **Capa de Calidad y Pruebas QA**: Fase 6 (con auto-curación).
- **Capa de Documentación y Cierre**: Fase 7 y Fase 8.

