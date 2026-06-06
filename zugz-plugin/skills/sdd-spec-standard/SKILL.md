---
name: sdd-spec-standard
description: Estándar rígido de formato para el archivo spec.md con auto-corrección mediante la acción fix de sdd_spec_reviewer.
---

# Skill: SDD Spec Standard

Esta skill define el estándar rígido de formato que debe cumplir todo archivo `spec.md` para ser aprobado por la fase de revisión del plano técnico.

## Trigger

- Fase de especificación/plano técnico (Fase 1 y 1.5).

## Estructura Rígida Requerida

Todo archivo `spec.md` debe respetar exactamente el siguiente formato y convenciones:

1. **Título Principal**: Debe ser exactamente `# Plano Técnico`.
2. **Nombres de Sección**:
   - `## 1. Diagnóstico y Archivos Afectados` (debe listar los archivos afectados con sus rutas completas y con sus rangos de líneas).
   - `## 3. Propuesta de Solución` (debe describir detalladamente la arquitectura y lógica propuesta).
   - `## 4. Especificaciones BDD` (debe contener escenarios de pruebas en inglés utilizando `Given`, `When`, `Then` y opcionalmente `And`).
   - `## 5. Criterios de Aceptación` (debe contener al menos una casilla de verificación `- [ ]` con criterios testeables y no vagos).
3. **Rangos de Líneas**:
   - Cada archivo afectado debe llevar su rango de líneas delimitado por paréntesis, por ejemplo: `(Líneas 10-35)` o `(Línea 42)`.
4. **Palabras Clave BDD**:
   - Los escenarios BDD deben ser redactados estrictamente en inglés: `Given`, `When`, `Then`, `And`.

## Auto-corrección (Fixing)

Si el archivo `spec.md` no cumple con la rigidez necesaria y genera errores de validación, puedes invocar la herramienta `sdd_spec_reviewer` con la acción `fix`:

```json
{
  "action": "fix"
}
```

Esta acción reescribirá y formateará automáticamente el spec al estándar correcto, traduciendo palabras clave BDD al inglés, agregando los paréntesis a los rangos de líneas y normalizando los títulos de sección.

## Tags

#spec #standard #quality #reviewer
