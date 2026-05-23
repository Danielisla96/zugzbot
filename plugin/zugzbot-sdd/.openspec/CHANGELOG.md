# CHANGELOG — zugzbot-sdd

## [1.4.0] - 2026-05-23

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
