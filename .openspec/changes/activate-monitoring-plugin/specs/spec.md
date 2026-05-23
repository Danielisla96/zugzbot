# Especificación BDD: Plugin de Monitoreo SDD

Feature: Monitoreo del Ciclo SDD en Sidebar
  Como arquitecto del sistema
  Quiero disponer de un sidebar de monitoreo
  Para visualizar el estado del proceso SDD en tiempo real

  Background:
    Given el plugin "zugzbot-sdd" está correctamente instalado en ".opencode/plugins/zugzbot-sdd"
    And el plugin está listado en la sección "plugin" de "opencode.json"
    And OpenCode se ejecuta con "OPENCODE_EXPERIMENTAL=true"

  Scenario: Activación del sidebar con la tecla 'b'
    Given que la terminal de OpenCode está activa
    When el usuario presiona la tecla "b"
    Then el sidebar de monitoreo debe alternar su visibilidad (abrirse si está cerrado, cerrarse si está abierto)

  Scenario: Visualización de información de monitoreo
    Given que el sidebar de monitoreo está visible
    Then debe mostrar el estado actual del ciclo SDD (Fase activa)
    And debe listar las tareas pendientes y completadas del checklist actual
    And debe mostrar los logs recientes del subagente en ejecución
