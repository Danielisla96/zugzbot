# Reglas Globales de Desarrollo SDD - Brain y Autopilot

Estas reglas son mandatorias para todos los agentes de la sesión (Orchestrator, Coder, Tester, Spec-Writer).

## 1. Sistema de Memoria Compartida (Brain)
El proyecto utiliza un sistema de memoria centralizado en `.openspec/brain.md` gestionado por las herramientas `brain_save_memory` y `brain_read_memory`.

- **Orquestador (F0/F1 y Finalización)**:
  - Al iniciar, debe invocar `brain_read_memory` para extraer aprendizajes de diseño, ruteo o errores históricos.
  - Al completar una sesión, debe sintetizar las lecciones valiosas aprendidas y registrarlas mediante `brain_save_memory`.
- **Coder (F2)**:
  - Antes de empezar a codificar, debe consultar la categoría `design` y `learnings` en el Brain.
  - Si soluciona un bug complejo, debe reportarlo registrándolo en la categoría `errors` o `learnings`.
- **Tester (F3)**:
  - Debe consultar la categoría `errors` para asegurar que los nuevos casos de prueba cubran regresiones históricas.

## 2. Modo Autopiloto (/loop)
Cuando el estado del sistema tiene `loopMode === true` (activado mediante el comando `/loop` o llamando a `sdd_set_phase`):

- **Prohibición de Preguntas**: Está estrictamente prohibido usar la herramienta `question` o pausar esperando aprobación del usuario. Los agentes deben decidir por sí mismos usando las recomendaciones por defecto (Next.js 16, Console mode, primer diseño recomendado de la marca).
- **Intercepción de Barrera**: Si algún agente intenta llamar a la herramienta `question` en este modo, el sistema abortará la llamada mecánicamente a través del plugin enforcer.
- **Specs Incrementales**: Si la petición es grande, el orquestador debe dividirla secuencialmente en contratos incrementales. Completa un spec por completo (F0->F4) y arranca el siguiente de inmediato de forma autónoma hasta finalizar todo el plan.
- **Rollback de Emergencia**: Si una misma fase falla de forma continua (más de 2 rollbacks), desactiva `loopMode` usando `sdd_set_phase` y solicita asistencia humana en el chat.
