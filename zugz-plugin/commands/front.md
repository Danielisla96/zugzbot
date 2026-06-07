---
description: Crear frontend siguiendo un design system (Airbnb, Apple, Meta, Nike, Notion, Renault, The Verge, Uber, Voltagent, x.ai) con ciclo SDD-TDD completo. Carga el skill sdd-design-system antes de codear.
agent: zugzbot
subtask: false
model: minimax-coding-plan/MiniMax-M2.7
---

El usuario quiere construir UI: $ARGUMENTS

## Pasos estrictos:

1. **Cargar design system (OBLIGATORIO antes de Fase 2):**
   - Invocar `skill({ name: "sdd-design-system" })`.
   - Si el lockfile ya tiene `active_design_system`, usar ese sin re-preguntar.
   - Si no, dejar que el skill pregunte al usuario (ver SKILL.md → Paso 1).
   - NO continuar hasta que `active_design_system` esté persistido en el
     lockfile.

2. **Generar spec enriquecido (Fase 1):**
   - Lanzar el workflow `full-sdd-tdd` con `$ARGUMENTS` como spec semilla.
   - En el `spec.md`, añadir una sección **"Design Constraints"** que cite
     literalmente:
     - `colors.primary`, `colors.on-primary` (con hex).
     - `typography.display-lg` y `typography.body-md` (con font-family,
       size, weight).
     - `rounded.md`, `spacing.lg`.
     - 3 componentes clave del `components.*` que se usarán.
   - Referenciar el path `.opencode/design/DESIGN-<slug>.md` en la sección "Sources".

3. **Pasar a Fase 2 con contexto del design system:**
   - Delegar a `@sdd-builder` con el `spec.md` enriquecido.
   - El subagente DEBE haber cargado `.opencode/design/DESIGN-<slug>.md` en su
     contexto (verificado por el router).
   - Aplicar SANTUARIO del skill: cero valores hardcoded.

4. **Gate de compliance (Fase 3):**
   - `sdd_spec_compliance_linter` debe validar:
     - Todos los hex colors matchean el YAML.
     - Todos los `font-family` matchean `typography.*.fontFamily`.
     - Todos los `border-radius` están en la escala `rounded.*`.
     - Todos los `padding`/`margin` están en la escala `spacing.*`.
   - Si falla → volver a Fase 2 con el reporte.

5. **Commit semántico:**
   - Al cerrar (Fase 5), el commit message incluye el slug del design
     system:
     `feat(front-<slug>): <descripción>`.

## Argumentos

$ARGUMENTS — descripción libre de la UI a construir. Ejemplos válidos:

- "crear landing de pricing estilo The Verge"
- "armar dashboard admin como Notion"
- "implementar checkout mobile-first estilo Uber"
- "maquetar perfil de usuario vibe Voltagent"

Si el usuario no menciona design system en `$ARGUMENTS`, el skill se encarga
de preguntar.

## Salida esperada

```
🎨 Design System: <slug> activo en lockfile
📋 Spec: <path>/spec.md (con sección Design Constraints)
🧪 Tests: <count> acceptance criteria derivados
✅ Compliance: 0 desviaciones
📦 Commit: feat(front-<slug>): <descripción>
```
