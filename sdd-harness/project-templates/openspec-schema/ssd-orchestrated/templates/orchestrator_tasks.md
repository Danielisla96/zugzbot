# Lista de Tareas del Orquestador: {{changeName}}

Lista maestra de tareas delegadas y estado de verificación.

## Fase 0: Diagnóstico y Contexto
- [ ] @sdd-architect realiza el diagnóstico del stack del proyecto y sugiere herramientas seguras (`npx autoskills`).

## Fase 1: Propuesta y Especificación
- [ ] @sdd-architect interactúa con el usuario para definir la propuesta (`proposal.md`).
- [ ] @sdd-architect escribe los escenarios de comportamiento estructurados (`specs/spec.md`).

## Fase 2: Diseño y Arquitectura
- [ ] @sdd-architect diseña el plano técnico global (`orchestrator_architecture.md`).
- [ ] @sdd-architect atomiza e inicializa este checklist de tareas (`orchestrator_tasks.md`).

## Fase 3: Implementación
- [ ] @sdd-implementer escribe el código fuente limpio y modular bajo mejores prácticas en `src/`.

## Fase 4: Diseño Visual y UX
- [ ] @sdd-implementer analiza la interfaz de usuario con Puppeteer MCP y genera el reporte de consistencia (`ui_review_report.md`). [CONDICIONAL - Omitido si no hay frontend]

## Fase 5: Entorno y Pruebas Manuales
- [ ] @sdd-launcher levanta el entorno de simulación local o realiza el despliegue/sincronización (ej: clasp push) para permitir validación humana. [Omitido en `--auto`]

## Fase 6: Calidad y Pruebas QA
- [ ] @sdd-release-manager ejecuta linters nativos (`sdd lint`) y tests unitarios/integración (`sdd test`) en bucle de auto-curación.

## Fase 7: Documentación Canónica
- [ ] @sdd-release-manager actualiza quirúrgicamente el README.md consolidado de la raíz, registra cambios en `.openspec/CHANGELOG.md` y actualiza el Cerebro del Proyecto (`.openspec/brain.md`).

## Fase 8: Archivación y Cierre
- [ ] @sdd-release-manager consolida el historial, limpia el lockfile a idle y realiza el commit semántico automatizado en Git.


