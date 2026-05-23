# Especificación Funcional: Monitor de Costos TUI

Como usuario de OpenCode
Quiero monitorear el costo y uso de tokens de mis agentes
Para tener control sobre mi presupuesto de API.

## Escenario 1: Visualización del costo acumulado del día
  Given que he realizado varias consultas con diferentes agentes hoy
  When abro el panel lateral de OpenCode
  Then debería ver una sección llamada "Monitor de Costos"
  And debería mostrar el "Costo Total del Día" en formato USD (ej: $1.25)

## Escenario 2: Desglose por agente
  Given que he usado los agentes @general y @sdd-architect
  When inspecciono el desglose por agente en el Monitor de Costos
  Then debería ver una lista con "@general" y "@sdd-architect"
  And cada agente debería mostrar sus tokens de entrada (IN) y salida (OUT)
  And cada agente debería mostrar su costo individual acumulado

## Escenario 3: Actualización en tiempo real
  Given que el Monitor de Costos está visible
  When envío un nuevo mensaje y recibo una respuesta de la IA
  Then los valores de tokens y costo en el panel deberían actualizarse automáticamente sin necesidad de reiniciar el TUI

## Escenario 4: Persistencia entre sesiones
  Given que cierro y vuelvo a abrir OpenCode
  When consulto el Monitor de Costos
  Then los datos de costo y tokens del día actual deben mantenerse persistentes y no reiniciarse a cero
