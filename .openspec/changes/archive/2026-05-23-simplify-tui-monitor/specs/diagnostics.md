# Diagnóstico Técnico — Fase 0

## Archivo objetivo
`plugin/zugzbot-sdd/plugins/plugin_tui.tsx` (424 líneas)

## Propósito del plugin
Componente TUI (Terminal User Interface) para OpenCode que despliega un panel lateral con el estado actual del pipeline SDD: fase activa, agente, tiempo transcurrido, y consumo de sesión (costo/tokens por agente).

## Arquitectura actual

### Estructura de funciones y componentes

```
PluginTuiSidebar (fn principal)
├── loadLockfile()                    → lectura de sdd-lock.json
├── getDefaultAction(phase)           → texto de acción por fase (mapeo, 12 líneas)
├── getAgentForPhase(phase)           → emoji/nombre de agente por fase (mapeo, 14 líneas)
└── api.slots.register()
    └── sidebar_content()
        ├── createSignal(lockState)
        ├── createSignal(currentTime)
        ├── collectSessionIds()        → recursión de session IDs (8 líneas)
        ├── extractAgentName()         → extrae nombre de agente de mensajes (10 líneas)
        ├── sumMetrics()               → suma cost/tokens de mensajes (11 líneas)
        ├── truncateAgentName()        → trunca nombres largos (5 líneas)
        ├── calculateBreakdown()       → orquesta breakdown de sesión (37 líneas)
        ├── hasMetricsChanged()        → detecta cambios en métricas (6 líneas)
        ├── createSignal(breakdownState)
        ├── createSignal(showBreakdown)
        ├── previousBreakdown (ref)
        ├── Polling (setInterval 1000ms)
        │   ├── setLockState()
        │   ├── setCurrentTime()
        │   ├── calculateBreakdown()
        │   └── hasMetricsChanged()
        ├── onCleanup(clearInterval)
        ├── getActiveAgentData()       → lee phase_history.jsonl (19 líneas)
        ├── SDDMonitor()               → componente visual del pipeline (~138 líneas)
        │   ├── Pipeline phases flow (9 fases)
        │   ├── Active agent card (double border)
        │   └── Next step preview
        ├── AgentMetricsRow()          → fila de agente en tabla (~12 líneas)
        └── SDDUsage()                 → panel colapsable de consumo (~28 líneas)
```

### Flujo de datos
1. `loadLockfile()` lee `.openspec/sdd-lock.json` del proyecto.
2. `SDDMonitor()` renderiza el estado del pipeline (fases, agente activo, tiempo).
3. `calculateBreakdown()` (vía `collectSessionIds` + `extractAgentName` + `sumMetrics`) calcula métricas de costo/tokens por agente desde la sesión activa.
4. `SDDUsage()` + `AgentMetricsRow()` despliegan las métricas colapsables.
5. Polling cada 1000ms refresca tanto el lockfile como el breakdown.

### Dependencias técnicas
- **Runtime**: SolidJS (`createSignal`, `onCleanup`)
- **OpenCode API**: `TuiPlugin`, `api.state.path.worktree`, `api.state.session.children/messages/get`, `api.theme.current`, `api.slots.register`
- **Node**: `fs`, `path`

## Problemas identificados

### 1. Sobreingeniería de métricas de sesión (~120 líneas)
Las funciones `calculateBreakdown`, `collectSessionIds`, `extractAgentName`, `sumMetrics`, `truncateAgentName`, `hasMetricsChanged`, `AgentMetricsRow` y `SDDUsage` conforman un subsistema completo de contabilidad de costos que:
- Consume la API de sesión de OpenCode recursivamente.
- Requiere estado adicional (`breakdownState`, `showBreakdown`, `previousBreakdown`).
- Añade complejidad de polling y detección de cambios.
- No es crítico para el propósito central del monitor (mostrar el pipeline SDD).

### 2. Duplicación de lógica de mapeo (~26 líneas)
`getDefaultAction` y `getAgentForPhase` son funciones de mapeo estático que pueden colapsarse como constantes o inlines dentro del JSX.

### 3. Verbosidad visual en SDDMonitor (~138 líneas)
El renderizado del pipeline con 9 fases, tarjeta de agente activo con borde doble, y previsualización del siguiente paso puede comprimirse sin perder claridad.

### 4. Polling doble propósito
El `setInterval` actual hace dos cosas: refrescar el lockfile y calcular breakdown. Separar o simplificar esto mejora mantenibilidad.

## Métricas de simplificación

| Concepto              | Líneas actuales | Líneas objetivo | Eliminación |
|-----------------------|-----------------|-----------------|-------------|
| Sistema de breakdown  | ~120            | 0               | 100%        |
| Mapeos estáticos      | ~26             | ~8              | ~70%        |
| SDDMonitor            | ~138            | ~90             | ~35%        |
| getActiveAgentData    | ~19             | ~12             | ~37%        |
| Infraestructura       | ~121            | ~70             | ~42%        |
| **Total**             | **~424**        | **~180**        | **~57%**    |

## Archivos de referencia
- `plugin/zugzbot-sdd/plugins/plugin_tui.tsx` (código fuente a simplificar)
- `.openspec/sdd-lock.json` (estructura de datos del estado)
- `.openspec/changes/*/phase_history.jsonl` (historial de fases activas)
