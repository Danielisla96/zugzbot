# Especificaciones BDD: Monitoreo de Agentes en Sidebar

## Escenario 5: Simplificación de depuración (Hello World)
  **Given** que el sistema presenta dificultades para renderizar componentes complejos
  **When** se implementa el "Modo Simplificado" en el Sidebar
  **Then** el panel debe mostrar el mensaje "¡Hola desde Zugzbot SDD!"
  **And** el texto debe usar el color `success` del tema actual

## Background
Como desarrollador que utiliza OpenCode, quiero ver qué agentes están trabajando en mi sesión actual y su estado en tiempo real, para tener visibilidad total del proceso de desarrollo orquestado.

## Escenario 1: El plugin se carga correctamente
  **Given** que el plugin está registrado en `opencode.json`
  **And** el punto de entrada `tui` está correctamente definido
  **When** inicio una sesión de OpenCode
  **Then** debo ver un panel de "Agent Monitor" en el sidebar derecho

## Escenario 2: Visualización de estado del agente
  **Given** que el sidebar está visible
  **When** un subagente (ej: @explore) es invocado y comienza a trabajar
  **Then** el sidebar debe mostrar al agente "@explore" con estado "Thinking"
  **And** debe mostrar una animación de carga premium

## Escenario 3: Actualización de tareas en tiempo real
  **Given** que un agente tiene tareas asignadas
  **When** el agente completa una tarea (todo.updated)
  **Then** el checklist en el sidebar debe marcar la tarea como completada automáticamente
  **And** el progreso general debe actualizarse

## Escenario 4: Cambio de fase SDD
  **Given** que el plugin detecta un cambio de fase (vía metadata de sesión)
  **When** se transiciona de Fase 0 a Fase 1
  **Then** el Sidebar debe actualizar el encabezado de fase actual y mostrar el historial de fases previas
