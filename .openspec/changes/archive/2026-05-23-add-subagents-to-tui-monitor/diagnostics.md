# Diagnóstico Técnico: add-subagents-to-tui-monitor

## 🔍 Análisis de la Situación Actual

El archivo `zugz-plugin/plugins/plugin_tui.tsx` implementa un monitor de agentes en el TUI (Terminal User Interface). Actualmente:

1.  **Recolección de IDs**: Utiliza `collectSessionIds(sessionId)` para obtener el ID de la sesión actual y sus hijos inmediatos.
2.  **Extracción de Métricas**: La función `getMetrics()` itera sobre estos IDs y busca mensajes en el estado de OpenCode (`api.state.session.messages(sid)`).
3.  **Filtrado de Agentes**: Clasifica los costos y tokens basándose en la propiedad `agent` presente en los mensajes del asistente.
4.  **Mascota Animada**: Incluye una mascota ASCII que parpadea.

## 🎯 Problemas Identificados / Oportunidades

*   **Identificación de Subagentes**: Actualmente, los "subagentes" no están distinguidos explícitamente de los "agentes" principales en la visualización. Se asume que todo lo que no es el usuario es un "agente".
*   **Jerarquía de Sesiones**: Si un subagente abre una sesión hija, `collectSessionIds` solo captura un nivel de profundidad si no se maneja recursivamente o si el API de `session.children` tiene límites.
*   **Atribución de Costos**: La lógica actual para encontrar el `agentName` (líneas 84-98) intenta retroceder en los mensajes para encontrar quién disparó la respuesta, pero podría ser imprecisa si hay múltiples subagentes en una misma sesión.
*   **Visualización**: El TUI actual lista todos los agentes al mismo nivel. No hay distinción visual entre el "Orquestador" y los "Especialistas" (subagentes).

## 🛠️ Propuesta de Integración

1.  **Refinar `collectSessionIds`**: Asegurar que sea recursivo o que cubra todas las ramificaciones de subagentes.
2.  **Detección de Metadatos de Subagente**: Buscar en los metadatos de los mensajes o en el contexto de la sesión si existe una marca de `subagent_id` o similar proporcionada por OpenCode.
3.  **Estructura de Datos**: Actualizar `AgentMetrics` para incluir un flag `isSubagent` y quizás el `parentAgent`.
4.  **UI Recursiva/Identada**: Mostrar los subagentes con una identación (ej. `  └─ sdd-architect`) debajo de su agente padre para mejorar la claridad.

## 🛡️ Verificación de Dependencias
No se requieren nuevas dependencias externas para este cambio. Se utilizarán las APIs existentes de `@opencode-ai/plugin/tui` y `solid-js`.
