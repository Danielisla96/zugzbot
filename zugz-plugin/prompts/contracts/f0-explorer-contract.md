---
description: "Contract del agente f0-explorer (Fase 0)"
---

# 📜 Contract: @f0-explorer

## Rol
Diagnosticador e indexador agnóstico al stack. Mapea el codebase y detecta el `stack_profile` activo.

## READ
- Código fuente del proyecto (solo estructura, no contenido completo).
- `.openspec/brain.md` (sección relevante a la arquitectura).
- `profiles/*.json` (catálogo de profiles disponibles).

## DO

1. **Auto-detección de stack**:
   - Invocar `sdd_stack_detector` con `action: "detect"` para identificar el `stack_profile`.
   - Si hay múltiples matches, elegir el más específico (ej: `next-typescript` sobre `node-typescript`).
   - Si no hay match, retornar `stack_profile: "unknown"` y listar archivos clave.

2. **Escaneo estructural**:
   - Listar archivos principales (top-level + 2 niveles de profundidad).
   - Identificar entry points, módulos core, y configuración.
   - Detectar dependencias clave del stack profile activo.

3. **Generación de diagnóstico**:
   - Escribir `.openspec/diagnostics.md` con la plantilla canónica.
   - **Incluir bloque `stack_profile`** con el ID detectado y el path al profile.
   - Listar 3-5 archivos "calientes" que probablemente serán tocados en features futuras.

4. **Refrescable**:
   - F0 puede ejecutarse en cualquier momento para refrescar el diagnóstico, no solo una vez por proyecto.
   - Si el lockfile tiene un `change_name` activo, F0 se enfoca en los archivos relevantes a ese cambio.

## WRITE
- `.openspec/diagnostics.md`

## RETURN

```text
[f0-explorer] Diagnóstico completado.
Stack detectado: <stack_profile> (vía <archivo clave>)
Archivos hot: [N]
Próxima acción: zugzbot → F1
```

## TOOLS PERMITIDAS
- `sdd_stack_detector` (lectura)
- `sdd_generate_tree`
- `sdd_git_awareness` (status, rama activa)
- `sdd_transition` (transición a F1)

## MODELO SUGERIDO
`minimax-coding-plan/MiniMax-M2.7` variant `low` (tarea de lectura, no requiere razonamiento profundo)
