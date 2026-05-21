---
name: sdd-propose
description: Realizar una entrevista técnica estructurada de requerimientos con el usuario y producir los dos artefactos canónicos de especificación (proposal.md y specs/spec.md) para el cambio nombrado. Utilizar al inicio de cada ciclo SDD antes de cualquier diseño o desarrollo.
license: MIT
compatibility: No requiere herramientas externas. Acceso de lectura y escritura a openspec/ es suficiente.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Reunir los requerimientos del usuario y producir los artefactos canónicos de propuesta para este cambio.

**Entrada**: El nombre del cambio en formato kebab-case (ej: `user-auth`, `payment-gateway`). Si se omite, solicítelo al usuario antes de continuar.

**Pasos**

1. **Resolver el nombre del cambio y preparar el entorno de trabajo**

   - Confirme el nombre del cambio con el usuario si no fue proporcionado.
   - Cree el directorio `openspec/changes/<nombre>/specs/` si no existe.
   - Verifique si `openspec/changes/<nombre>/proposal.md` ya existe.
     - Si existe: léalo, informe al usuario y pregunte si debe sobrescribirse o extenderse antes de continuar.

2. **Realizar la entrevista de requerimientos**

   Para agilizar el proceso y evitar preguntas abiertas en la consola, **utilice de forma prioritaria la herramienta AskUserQuestion (`default_api:ask_question`)** para presentar cuestionarios estructurados al usuario.

   **Grupo A — Contexto y Propósito (Interactivo)**
   - Formule preguntas sobre el problema a resolver y los objetivos esperados. 
   - Proporcione opciones predefinidas o permita al usuario detallar sus respuestas.

   **Grupo B — Alcance Técnico (Formulario de Selección)**
   - Utilice la herramienta AskUserQuestion para presentar opciones de selección sobre el stack de desarrollo:
     - Lenguaje: `Node.js (JavaScript)`, `Node.js (TypeScript)`, `Python`, `Go`, `Rust`, `PHP`, `Ruby`
     - Framework / Entorno: `Next.js`, `React`, `Express`, `FastAPI`, `Django`, `Flask`, `Laravel`, `Rails`, `Genérico / Ninguno`
     - Base de Datos: `SQLite`, `PostgreSQL`, `MySQL`, `MongoDB`, `Redis`, `Ninguna`
     - Pruebas / QA: `Jest`, `Vitest`, `Pytest`, `Mocha`, `Ninguno`

   **Grupo C — Escenarios de Comportamiento**
   - Pregunte interactivamente por el happy-path principal y los casos límite o de error más probables.

   **Grupo D — Criterios de Aceptación**
   - Pregunte interactivamente qué define el éxito y si existen requisitos específicos de seguridad o accesibilidad.

   Mantenga un tono sumamente consultivo, profesional y educado durante el diálogo. No proceda al Paso 3 hasta que todas las respuestas de los grupos estén consolidadas.

3. **Escribir `proposal.md`**

   Escriba en el archivo `openspec/changes/<nombre>/proposal.md`:

   ```markdown
   # Propuesta — <nombre-del-cambio>

   ## Resumen
   <Un párrafo descriptivo sobre qué se está construyendo y el motivo.>

   ## Objetivos
   - <objetivo 1>
   - <objetivo 2>

   ## Stack Tecnológico
   | Capa | Tecnología |
   |---|---|
   | Lenguaje | ... |
   | Framework | ... |
   | Base de Datos | ... |
   | Entorno | ... |

   ## Alcance

   ### Dentro del Alcance
   - <item>

   ### Fuera del Alcance
   - <item>

   ## Criterios de Aceptación
   - <criterio>

   ## Preguntas Abiertas
   - <cualquier duda técnica no resuelta que afecte el diseño>
   ```

4. **Escribir `specs/spec.md`**

   Escriba en el archivo `openspec/changes/<nombre>/specs/spec.md`:

   ```markdown
   # Especificación de Comportamiento — <nombre-del-cambio>

   ## Descripción General
   <Breve resumen del comportamiento del sistema especificado.>

   ## Escenarios

   ### Escenario 1 — <Título del happy path>
   **Dado** <precondición>
   **Cuando** <acción>
   **Entonces** <resultado esperado>

   ### Escenario 2 — <Título del caso límite o de error>
   **Dado** <precondición>
   **Cuando** <acción>
   **Entonces** <resultado esperado>

   <!-- Agregue tantos escenarios como sea necesario. Mínimo: happy path + 2 casos límites/error. -->

   ## Restricciones
   - <restricción o requerimiento no funcional>
   ```

   Reglas:
   - Cada escenario debe ser completamente trazable a al menos un criterio de aceptación en `proposal.md`.
   - Incluya al menos: un escenario de flujo feliz, un escenario de error o fallo y un escenario de caso límite o valores frontera.
   - Los escenarios deben ser concretos y testeables — evite ambigüedades como "debe funcionar correctamente".

5. **Reportar a Zugzbot**

   ```
   ## Fase de Propuesta Completada

   **Cambio:** <nombre-del-cambio>
   **Artefactos escritos:**
   - openspec/changes/<nombre>/proposal.md
   - openspec/changes/<nombre>/specs/spec.md

   **Escenarios definidos:** <n>
   **Preguntas abiertas:** <n — lístelas si existen>

   Fase 1 completada. Propuesta y especificación listas para revisión de usuario.
   ```

**Guardrails**
- Jamás escriba código fuente ni estructure diseños arquitectónicos; eso pertenece exclusivamente a las fases de planificación e implementación.
- Nunca se salte la entrevista interactiva; asumir requerimientos genera especificaciones erróneas.
- No proceda a escribir los artefactos hasta consolidar las respuestas de los cuatro grupos de preguntas.
- Si el usuario es vago o contradictorio, formule UNA pregunta de aclaración enfocada antes de continuar.
