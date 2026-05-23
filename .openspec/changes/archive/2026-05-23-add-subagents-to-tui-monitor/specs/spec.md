# Especificaciones BDD: Monitoreo de Subagentes

Feature: Monitoreo de Subagentes en TUI
  Como usuario del TUI de Zugzbot
  Quiero ver el desglose de costos de los subagentes
  Para entender mejor dónde se está consumiendo el presupuesto de la sesión.

  Scenario: Visualización de un subagente activo
    Given que el agente principal ha invocado a un subagente "sdd-architect"
    And el subagente ha generado mensajes con costo $0.05
    When abro el Monitor de Agentes en el TUI
    Then debería ver al agente principal en la lista
    And debería ver al subagente "sdd-architect" identado debajo del principal
    And el costo total debería incluir los $0.05 del subagente

  Scenario: Acumulación de costos de múltiples subagentes
    Given que existen dos subagentes: "sdd-architect" ($0.02) y "sdd-implementer" ($0.03)
    When consulto el total del monitor
    Then el total acumulado debe mostrar $0.05
    And ambos subagentes deben aparecer listados con sus respectivos costos individuales
