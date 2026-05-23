# Especificaciones BDD: Visual SDD Status

Este documento define el comportamiento esperado para la integración del estado del ciclo SDD en la interfaz TUI de Zugzbot.

## Característica: Indicador Visual de Estado SDD
Como desarrollador, quiero ver el progreso del ciclo SDD y el estado de los subagentes en la barra lateral del TUI para tener visibilidad inmediata del proceso de desarrollo.

### Escenario: Visualización de la Fase SDD Actual
  Dado que el archivo `.openspec/sdd-lock.json` indica que el proyecto está en la "Fase 2"
  Cuando abro el TUI de Zugzbot
  Entonces debería ver el texto "[Fase 2: Arquitectura y Planificación]" en la barra lateral
  Y debería ver una barra de progreso ASCII con 2 segmentos llenos: "[■■□□□□□□□□]"
  Y el color del texto debería ser Violeta (Accent)

### Escenario: Cambio de Expresión de la Mascota Zugz
  Dado que un subagente (ej: `sdd-architect`) está en estado `in_progress`
  Cuando el TUI refresca el estado desde el lockfile
  Entonces la expresión de la mascota Zugzbot debería cambiar de `[o_o]` a `[*_*]`
  Y debería mostrarse el mensaje "Working on: sdd-architect" al lado de la mascota

### Escenario: Retorno a Estado Inactivo
  Dado que el ciclo SDD termina o entra en estado `idle`
  Cuando el TUI detecta el cambio en el lockfile
  Entonces la expresión de la mascota Zugzbot debería volver a `[o_o]`
  Y el indicador de subagente activo debería desaparecer o mostrar "idle"

### Escenario: Restricción de Ancho de Pantalla (37 caracteres)
  Dado que la barra lateral tiene un límite de 37 caracteres
  Cuando el TUI renderiza la información del SDD
  Entonces ninguna línea del bloque de estado (incluyendo mascota, fase y barra) debe exceder los 37 caracteres de ancho
  Y el separador visual `───` debe ajustarse exactamente al ancho disponible

### Escenario: Polling del Lockfile
  Dado que el archivo `.openspec/sdd-lock.json` es actualizado por un subagente externo
  Cuando transcurren 2 segundos desde la última lectura
  Entonces el TUI debe leer el archivo y actualizar los componentes visuales de forma reactiva
