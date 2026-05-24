---
description: Ejecutar control de calidad, linter, tag balance, autocuración y despliegue de Fase 3
agent: sdd-tester
subtask: true
model: opencode/deepseek-v4-flash-free
---

Ejecuta el control de calidad, linter, balance de etiquetas HTML, autocuración de sintaxis simple y despliegue en caliente para el cambio activo: $ARGUMENTS
- Lee las especificaciones en specs/spec.md.
- Corre linter, compiladores globales y auditores estáticos de UI.
- Corrige de forma automática y autónoma errores sintácticos simples (mismatched tags, parenthesis).
- Realiza el deploy en caliente (clasp push o dev-deploy).
- Genera el informe de validación (verification_report.md) y solicita aprobación de conformidad.
