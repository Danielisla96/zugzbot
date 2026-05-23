---
description: Levantar entorno de simulación y realizar pruebas de calidad (Fase 5)
agent: sdd-launcher
subtask: true
model: opencode/deepseek-v4-flash-free
---

Ejecuta el chequeo preventivo de calidad local y simulación del entorno para el cambio activo: $ARGUMENTS
- Corre la suite de pruebas del linter y tests del proyecto.
- Si falla, reporta QUALITY_CHECKS_FAILED y guarda los fallos en diagnostics.md.
- Si pasa, levanta el servidor local de desarrollo o realiza el despliegue clasp push.
