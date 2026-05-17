# Arquitectura del Orquestador: {{changeName}}

Este documento detalla la distribución de responsabilidades y el flujo de agentes que guiará el desarrollo de este cambio.

## 1. Subagentes y Ámbito de Trabajo
- **Zugzbot (Orquestador Maestro)**: Coordina, delega tareas de forma secuencial y supervisa la calidad.
- **Especialistas del Ciclo de Vida**:
  - `sdd-proposer` (Fase 1): Diseña la propuesta y especificaciones detalladas.
  - `sdd-planner` (Fase 2): Diseña la arquitectura y define el plan de tareas atómicas.
  - `sdd-implementer` (Fase 3): Implementa el código fuente bajo mejores prácticas en `src/`.
  - `sdd-verifier` (Fase 4): Diseña y corre la suite de pruebas locales en `tests/`.

## 2. Definición de Capas e Interfaces
- **Capa Visual y Frontend**: Lógica y componentes en `src/`.
- **Capa de Control e Integración**: Contratos de datos y pruebas automatizadas.

