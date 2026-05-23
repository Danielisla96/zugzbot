# CHANGELOG — zugzbot-sdd

## [1.5.0] — 2026-05-23

### Changed
- Simplificación masiva del monitor TUI: reducción de 424 → 186 líneas (**−56%**)
- Eliminación completa del tracker de costos: `SDDUsage`, `AgentMetricsRow`, `breakdownState`, y funciones de métricas de sesión eliminadas
- Pipeline compacto: flujo directo `loadLockfile → getActiveAgentData → SDDMonitor`
- Código más legible y mantenible: eliminación de deep-compare, truncado, cómputos agregados

### Removed
- Componente `SDDUsage` con breakdown de sesión por agente
- Componente `AgentMetricsRow` con alineación monospace
- Estado `breakdownState`, `showBreakdown`, `previousBreakdown`
- Funciones: `calculateBreakdown`, `collectSessionIds`, `extractAgentName`, `sumMetrics`, `truncateAgentName`, `hasMetricsChanged`
- Cache de polling con deep-compare
- Dependencia `@opencode-ai/plugin/tui` para utilerías de métricas (solo queda el tipo base)

## [1.4.0] — 2026-05-23

### Added
- Desglose de métricas de sesión por agente/subagente (costo, tokens in/out)
- Componente AgentMetricsRow con alineación monospace premium
- Cache de polling con deep compare para evitar re-renders innecesarios
- Truncado inteligente de nombres de agente (20 chars + …)
- Fallback seguro cuando API children() no está disponible

### Changed
- SDDUsage ahora usa breakdownState en lugar de usageState
- Polling optimizado con hasMetricsChanged()

## [1.3.2] - 2026-05-23

### Added
- Versión inicial del plugin TUI con monitor SDD y métricas de sesión
