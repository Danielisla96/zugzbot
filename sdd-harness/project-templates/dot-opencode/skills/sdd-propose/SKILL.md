---
name: sdd-propose
description: Realiza la fase 1 de SDD, entrevistando al usuario y generando la propuesta y especificaciones.
license: MIT
compatibility: Requiere openspec CLI.
metadata:
  author: sdd-orchestrator
  version: "1.0"
---

Fase 1 del Spec-Driven Development: Propuesta y Especificación.

**Objetivo**: Obtener una especificación perfecta basada en el diálogo técnico interactivo con el usuario.

**Pasos**

1. **Presentación**:
   Preséntate como el subagente de propuesta e indica que vas a iniciar la fase de especificación para el cambio activo.

2. **Entrevista Técnica**:
   - Realiza preguntas clave y precisas (stack de desarrollo, objetivos, casos de uso, restricciones de diseño, base de datos).
   - **MANDATORIO**: No supongas el stack ni los requerimientos. Haz preguntas explícitas y espera la respuesta del usuario.

3. **Creación del Proposal**:
   - Escribe el archivo `openspec/changes/<change-name>/proposal.md` completando todas las secciones de la plantilla (Motivación, Requerimientos de Alto Nivel y Fuera de Alcance).

4. **Creación de Especificación de Comportamiento**:
   - Escribe el archivo `openspec/changes/<change-name>/specs/spec.md` detallando escenarios Dado / Cuando / Entonces y casos límites validados en la entrevista.

5. **Notificación**:
   - Avisa a Zugzbot que los artefactos de la Fase 1 han sido completados y están listos para validación y diseño técnico.
