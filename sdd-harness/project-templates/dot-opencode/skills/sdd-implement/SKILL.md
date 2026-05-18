---
name: sdd-implement
description: Ejecutar el checklist de tareas de implementación producido en sdd-plan, escribiendo código fuente limpio de calidad de producción que respete estrictamente la arquitectura diseñada. Utilizar después de aprobar el checklist de planificación.
license: MIT
compatibility: Requiere acceso de lectura y escritura a src/ y openspec/. Acceso a diagnósticos de LSP es necesario para la validación estática de calidad.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Ejecutar el checklist de tareas aprobado escribiendo código limpio y de calidad de producción.

**Entrada**: El nombre del cambio activo en kebab-case. Si se omite, infiéralo del contexto o solicítelo al usuario.

**Pasos**

1. **Consumir todo el contexto antes de escribir código**

   Lea en orden estricto:
   - `openspec/changes/<nombre>/proposal.md`
   - `openspec/changes/<nombre>/specs/spec.md`
   - `openspec/changes/<nombre>/orchestrator_architecture.md`
   - `openspec/changes/<nombre>/orchestrator_tasks.md`

   Mapee mentalmente cada tarea sin marcar (`- [ ]`) a su archivo fuente de destino antes de comenzar a escribir.

2. **Ejecutar el checklist secuencialmente**

   Reglas:
   - Complete las tareas en el orden exacto establecido en `orchestrator_tasks.md` (Fase A → B → C → D → E).
   - Inmediatamente después de completar una tarea en el código, márquela como `- [x]` en `orchestrator_tasks.md`.
   - Realice una tarea a la vez — no mezcle ediciones no relacionadas de múltiples archivos en una sola llamada de edición.

   Para cada tarea:
   1. Relea el apartado correspondiente de `orchestrator_architecture.md`.
   2. Relea el escenario de comportamiento mapeado en `specs/spec.md`.
   3. Escriba o modifique el archivo de código fuente correspondiente.
   4. Marque la tarea como completada.
   5. Deje una breve nota explicativa de lo realizado antes de pasar a la siguiente.

3. **Estándares de Excelencia de Código (No Negociables)**

   Cada bloque de código producido debe cumplir estrictamente con los siguientes estándares:

   | Criterio | Requisito de Calidad Senior |
   |---|---|
   | Nombres | Identificadores auto-descriptivos. Sin abreviaciones confusas ni variables de una letra fuera de bucles. |
   | Funciones | Única responsabilidad (SOLID). Cada función debe realizar una sola acción lógica. |
   | Control de Errores | Manejo explícito de excepciones en todos los flujos. Prohibidos los bloques catch silenciosos. |
   | Comentarios | Explicar el PORQUÉ del código, no el QUÉ, y únicamente cuando la lógica no sea evidente por sí misma. |
   | Acoplamiento | Depender de abstracciones (interfaces, protocolos) y evitar clases concretas rígidas. |
   | Duplicidad | Cero tolerancia a la duplicidad de lógica. Extraer funciones compartidas inmediatamente. |
   | Longitud | Ningún archivo debe exceder las 300 líneas de código. Divida el archivo si se supera este límite. |

4. **Puerta de Calidad Estática (LSP)**

   Una vez que todas las tareas estén marcadas como `- [x]`, y antes de entregar el control a Zugzbot:
   - Revise cada archivo modificado para asegurar que no posea ningún diagnóstico de LSP activo (errores de compilación, imports rotos, tipos incorrectos).
   - Corrija absolutamente todos los errores sintácticos o de tipado. No se acepta código con warnings o errores LSP.

5. **Modo de Auto-Curación (Si es reactivado por Zugzbot)**

   Si Zugzbot reactiva esta skill tras fallos reportados en la fase de verificación:
   - Lea con detenimiento el log de errores e incidencias provisto.
   - Localice quirúrgicamente el error en `src/` apoyándose en el stack trace.
   - Aplique la corrección específica — no realice refactorizaciones de lógica no relacionadas.
   - Deje una nota descriptiva de la corrección en `orchestrator_tasks.md`.
   - Entregue el control para una nueva ronda de verificación.

6. **Reportar a Zugzbot**

   ```
   ## Fase de Implementación Completada

   **Cambio:** <nombre-del-cambio>
   **Tareas completadas:** <n>/<n>
   **Archivos creados:** <lista>
   **Archivos modificados:** <lista>
   **Errores de LSP al entregar:** 0

   Resumen de implementaciones:
   - <tarea A1>: <breve detalle de lo construido>
   - <tarea B1>: <breve detalle de lo construido>
   - ...

   Fase 3 completada. Código fuente listo para revisión del usuario.
   ```

**Guardrails**
- Tienes prohibido ejecutar comandos bash en la terminal; eso pertenece al verificador.
- No diseñes ni escribas casos de prueba unitarios en esta fase; eso le pertenece a sdd-verify.
- No alteres los contratos de `orchestrator_architecture.md`. Si detectas que el diseño está mal, pausa la ejecución y notifícalo a Zugzbot.
- Nunca entregues código con errores de LSP o sintaxis activa en el editor.
