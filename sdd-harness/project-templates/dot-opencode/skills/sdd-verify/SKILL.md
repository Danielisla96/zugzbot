---
name: sdd-verify
description: Realiza la fase 4 de SDD, diseñando y ejecutando pruebas unitarias/integración, verificando lints y casos límite.
license: MIT
compatibility: Requiere openspec CLI.
metadata:
  author: sdd-orchestrator
  version: "1.0"
---

Fase 4 del Spec-Driven Development: Verificación y Pruebas.

**Objetivo**: Validar el 100% del código fuente implementado frente a las especificaciones mediante pruebas automatizadas y estáticas.

**Pasos**

1. **Diseño de Pruebas y Mapeo BDD**:
   - Analiza el `proposal.md`, `specs/spec.md` y el código fuente.
   - Crea archivos de prueba bajo `tests/` respetando el stack tecnológico (ej. `pytest`).
   - **Mapeo BDD 1:1**: Estructura el archivo de pruebas para que cada escenario de comportamiento definido en `specs/spec.md` tenga su correspondiente función de prueba unitaria/integración con un comentario indicando la especificación exacta.

2. **Puerta Estática y Ejecución Técnica**:
   - Corre chequeos de sintaxis estática previos (`ruff check`, `python -m py_compile`) usando la terminal (`bash`).
   - Ejecuta la suite de pruebas locales (ej. `pytest`).

3. **Corrección Continua y Auto-Curación**:
   - Si alguna prueba falla o se detectan problemas estáticos, **genera un archivo de logs de fallo detallado** en la carpeta del cambio y repórtaselo a DaniBot de forma clara para disparar la auto-curación de `@sdd-implementer`.
   - Vuelve a ejecutar las pruebas una vez devuelta la tarea corregida hasta lograr 100% de éxito.

4. **Validación del Servidor y Reporte Curl (`verification_report.md`)**:
   - Levanta el servidor local en segundo plano en la terminal (`bash`).
   - Realiza llamadas reales con `curl` simulando los escenarios felices y casos bordes de la especificación.
   - Genera el reporte de verificación formal con las peticiones y respuestas JSON obtenidas bajo `openspec/changes/<change-name>/verification_report.md`.
   - Apaga el servidor limpiamente una vez concluido el reporte.

5. **Aprobación**:
   - Una vez comprobada la calidad impecable, la cobertura total de specs en el código y el reporte curl generado, notifica a DaniBot que el cambio está validado y listo para producción.
