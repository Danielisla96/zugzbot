---
name: sdd-methodology
description: Metodología SDD basada en contratos de software para garantizar calidad e integridad
license: MIT
compatibility: opencode
---

## Qué hace esta habilidad

Guía a los agentes a través de las fases estrictas de SDD (Spec-Driven Development):

- **F0 (Detectar & Preguntar)**: Identifica el stack y pregunta al usuario sobre bases de datos/servicios adicionales del stack.
- **F1 (Especificar/Contrato)**: Escribe una especificación en `.openspec/specs/` antes de tocar código de desarrollo. Obtiene la aprobación del usuario.
- **F2 (Programar)**: Implementa el código ajustándose estrictamente a la especificación.
- **F3 (Verificar)**: Crea y corre pruebas automatizadas que validen que el comportamiento cumple la especificación al 100%.

## Cuándo usarme

Úsala siempre al iniciar cualquier desarrollo para asegurar el cumplimiento del ciclo de contratos y evitar codificación reactiva.
