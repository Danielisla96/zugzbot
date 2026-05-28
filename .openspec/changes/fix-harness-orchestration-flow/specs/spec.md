# Plano Técnico de Especificación: fix-harness-orchestration-flow

## 1. Diagnóstico y Archivos Afectados (Rangos de Líneas Específicos)
- `zugz-plugin/agents/zugzbot.md` (Líneas 26-42: reglas de orquestación y prohibición de trabajo técnico)
- `zugz-plugin/tools/sdd_transition.ts` (Líneas 1-322: lógica completa de transición de fases)
- `zugz-plugin/agents/sdd-builder.md` (Líneas 1-51: perfil de builder)
- `zugz-plugin/agents/sdd-planner.md` (Líneas 1-73: perfil de planner)
- `zugz-plugin/agents/sdd-tester.md` (Líneas 1-79: perfil de tester)
- `zugz-plugin/agents/sdd-archiver.md` (Líneas 1-46: perfil de archiver)
- `zugz-plugin/agents/sdd-explorer.md` (Líneas 1-297: perfil de explorer)

## 2. Consenso de Encuesta con el Usuario
- **Decisión A**: El orquestador SOLO delega - cualquier análisis técnico debe delegarse. Confirmado.
- **Decisión B**: Cada subagente debe declarar su rol explícitamente al iniciar su turno. Confirmado.
- **Decisión C**: El lockfile debe soportar transiciones backward/repeat para permitir reiteración. Confirmado.
- **Decisión D**: Se implementará checkpoint/recovery para restaurar estado ante fallos. Confirmado.
- **Decisión E**: Complejidad ALTA - requiere nuevos archivos TypeScript y modificación de prompts existentes.

## 3. Propuesta de Solución y Arquitectura

### 3.1 Nuevos Archivos a Crear
- `zugz-plugin/tools/sdd_checkpoint.ts` - Sistema de checkpoints y recuperación de estado
- `zugz-plugin/tools/sdd_role_assertion.ts` - Herramienta para validar y forzar roles de subagentes

### 3.2 Modificaciones Estructurales

**A. Nuevo campo en sdd-lock.json**:
```json
{
  "orchestrator_mode": "delegation_only",
  "direction": "forward",
  "last_successful_phase": 0,
  "retry_count": 0,
  "corrective_loop_active": false,
  "checkpoints": []
}
```

**B. Extensión de sdd_transition.ts**:
- Agregar parámetro `direction: "forward" | "backward" | "repeat"`
- Cuando `direction === "backward"` o `"repeat"`: no ejecutar validaciones de fase superior
- Guardar checkpoint antes de cada transición
- Restaurar desde checkpoint si el usuario pide "volver a Fase X"

**C. Modificación de prompts de subagentes**:
- Cada subagente debe iniciar con declaración de rol: "Yo soy [@sdd-X], especializado en [rol]. Mi objetivo en esta fase es [objetivo]."
- Agregar validación de `expected_role` contra `active_subagent` del lockfile

## 4. Especificaciones BDD (Comportamiento)

Feature: Orquestador puramente delegativo
  Scenario: Usuario pide feature y orquestador recibe contexto técnico
    Given el orquestador @zugzbot recibe un requerimiento del usuario
    When el lockfile tiene `orchestrator_mode: "delegation_only"`
    Then @zugzbot NO puede leer archivos de código fuente directamente
    And debe delegar inmediatamente a @sdd-explorer o @sdd-planner segun corresponda

Feature: Subagente mantiene su rol consistentemente
  Scenario: Subagente recibe delegacion y debe declarar su rol
    Given un subagente recibe una tarea via tool `task`
    When inicia su ejecucion
    Then debe declarar "Yo soy [@sdd-X], especializado en [rol]"
    And el lockfile debe tener `active_subagent` coincidente con el rol declarado

Feature: Reiteracion y rollback de fases
  Scenario: Usuario rechaza plano tecnico en Hito A
    Given el usuario rechaza el spec.md en Hito A
    When @zugzbot recibe la decision
    Then debe invocar sdd_transition con `direction: "backward"` y `nextPhase: 1`
    And el lockfile debe guardar `last_successful_phase: 0`
    And debe limpiar el lockfile de la fase fallida y re-delegar a @sdd-planner

Feature: Checkpoint y recuperacion ante fallos
  Scenario: Builder falla en Fase 2 y se pide restauracion
    Given @sdd-builder falla en implementar cambios
    When @zugzbot detecta el fallo o el usuario pide "volver a Fase 2"
    Then se puede restaurar desde el ultimo checkpoint
    And se re-delega a @sdd-builder con el contexto original intacto

## 5. Criterios de Aceptación y Calidad (QA)

- [ ] El orquestador @zugzbot NO puede usar `read` en archivos `.ts`, `.js`, `.css`, `.py` directamente
- [ ] Cada subagente inicia con declaracion de rol en sus primeros 3 mensajes
- [ ] `sdd_transition` acepta parametro `direction` con valores `forward`, `backward`, `repeat`
- [ ] `sdd_checkpoint.ts` guarda estado antes de cada transicion y permite restaurar
- [ ] El lockfile tiene los nuevos campos: `orchestrator_mode`, `direction`, `last_successful_phase`, `retry_count`, `checkpoints`
- [ ] Cuando `direction: "backward"` se limpian las fases superiores y se restaura el checkpoint
- [ ] El orquestador puede manejar ciclos correctivos (corrective_loop) sin perder contexto
- [ ] El lockfile permite hasta 3 reintentos (`retry_count`) antes de escalar error