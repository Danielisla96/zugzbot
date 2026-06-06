---
name: sdd-spec-standard
description: Estándar híbrido (YAML Frontmatter + Markdown) para el archivo spec.md con auto-corrección mediante la acción fix de sdd_spec_reviewer.
---

# Skill: SDD Spec Standard (YAML + Markdown Hybrid)

Esta skill define el estándar estructurado que debe cumplir todo archivo `spec.md` para ser aprobado en la revisión del plano técnico (Fase 1.5). Combina un bloque YAML al inicio (Frontmatter) para campos de datos estructurados rígidos y Markdown clásico abajo para explicaciones detalladas y escenarios BDD de texto libre.

## Trigger

- Fase de especificación/plano técnico (Fase 1 y 1.5).

## Estructura Híbrida Requerida

Todo archivo `spec.md` debe respetar exactamente la siguiente estructura:

```markdown
---
change_name: "fastapi-sum-endpoint"
design_skill: "none"
affected_files:
  - "src/server.ts (Líneas 10-35)"
  - "src/validators.ts (Líneas 1-15)"
acceptance_criteria:
  - "[ ] El endpoint GET /sum debe retornar la suma de dos números"
  - "[ ] Debe retornar 400 si los parámetros no son válidos"
---

# Plano Técnico

## 1. Diagnóstico y Archivos Afectados
El diagnóstico detallado del cambio y la justificación técnica de la afectación.

## 2. Consenso de Encuesta con el Usuario
Breve resumen de las aclaraciones y decisiones tomadas en consenso con el usuario.

## 3. Propuesta de Solución
Detalle preciso de la arquitectura propuesta, cambios lógicos y diseño técnico (debe tener al menos 50 caracteres).

## 4. Especificaciones BDD (Comportamiento)
Casos de prueba BDD escritos estrictamente en inglés usando las cláusulas:
- Given
- When
- Then
- And (opcional)

## 5. Criterios de Aceptación
Breve listado que repite los criterios del frontmatter para referencia del usuario.
- [ ] Criterio 1
- [ ] Criterio 2
```

## Reglas Clave de Validación

1. **Frontmatter YAML**: Debe estar delimitado por líneas con tres guiones `---`.
2. **change_name**: Debe ser el slug en kebab-case exacto definido en el lockfile. No puede ser genérico ni usar "nuevo-cambio".
3. **affected_files**: Lista de rutas de archivos relativas al proyecto. Cada elemento debe llevar su rango de líneas especificado (ej: `(Líneas 10-35)`).
4. **acceptance_criteria**: Lista de oraciones objetivas y testeables. Deben incluir el checkbox vacío `[ ]`.
5. **Palabras Clave BDD**: Los escenarios BDD deben ser redactados en inglés (`Given`, `When`, `Then`).

## Auto-corrección (Fixing)

Si el archivo `spec.md` no cumple con la rigidez necesaria, tiene inconsistencias de traducción o le falta el bloque YAML Frontmatter, puedes ejecutar la acción `fix` de la herramienta `sdd_spec_reviewer` para estructurarlo automáticamente de forma correcta:

```json
{
  "action": "fix"
}
```

Esta herramienta programática creará el frontmatter basándose en el contenido existente, traducirá palabras clave BDD al inglés, normalizará encabezados y corregirá la numeración de sub-secciones automáticamente.

## Tags

#spec #standard #yaml #markdown #quality #reviewer
