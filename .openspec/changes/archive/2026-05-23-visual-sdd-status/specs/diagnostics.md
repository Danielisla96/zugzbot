# Diagnóstico de Fallo: Visual SDD Status

## Síntoma
El indicador de fase en el TUI excede el ancho máximo permitido de 37 caracteres.

## Causa Raíz
La Fase 2 tiene el nombre "Fase 2: Arquitectura y Planificación".
- Longitud del nombre: 36 caracteres.
- Longitud total con corchetes `[]`: 38 caracteres.
- Límite establecido: 37 caracteres.

## Impacto
Desalineación visual en la barra lateral del TUI y posible truncado o desbordamiento dependiendo del motor de renderizado de la terminal.

## Solución Propuesta
Reducir la longitud de los nombres de las fases en la función `getPhaseName` para que ninguno exceda los 35 caracteres, permitiendo que el formato `[Nombre]` se mantenga en 37 caracteres exactos o menos.
