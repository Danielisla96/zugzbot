# Lista de Tareas del Orquestador: {{changeName}}

Lista maestra de tareas delegadas y estado de verificación.

## Fase 0: Diagnóstico y Contexto
- [ ] sdd-inspector realiza el diagnóstico del proyecto y sugiere herramientas seguras (`npx autoskills`).

## Fase 1: Propuesta y Especificación
- [ ] sdd-proposer interactúa con el usuario y define la propuesta (`proposal.md`).
- [ ] sdd-proposer escribe los escenarios detallados de comportamiento (`specs/spec.md`).

## Fase 2: Diseño y Arquitectura
- [ ] sdd-planner diseña el plano técnico global (`orchestrator_architecture.md`).
- [ ] sdd-planner atomiza e inicializa este checklist de tareas (`orchestrator_tasks.md`).

## Fase 3: Implementación
- [ ] sdd-implementer escribe el código fuente limpio y senior bajo mejores prácticas en `src/`.

## Fase 4: Diseño Visual y UX
- [ ] sdd-ui-designer analiza la interfaz de usuario con Puppeteer MCP y genera el reporte de percepción (`ui_review_report.md`). [CONDICIONAL - Omitido si no hay frontend]

## Fase 5: Servidor Local Interactivo
- [ ] sdd-launcher levanta el servidor de desarrollo local interactivo y verifica disponibilidad. [Omitido en `--auto`]

## Fase 6: Calidad y Pruebas QA
- [ ] sdd-verifier escribe y ejecuta la suite de pruebas unitarias y de integración.
- [ ] sdd-verifier comprueba linters y autoriza la entrega definitiva sin errores.

## Fase 7: Documentación Canónica
- [ ] sdd-documenter genera/actualiza quirúrgicamente el README, TECHNICAL.md, USER_GUIDE.md, y registra el cambio en el CHANGELOG global.

## Fase 8: Archivación y Cierre
- [ ] sdd-archiver consolida el historial, archiva las especificaciones y realiza el commit semántico automatizado en Git.

