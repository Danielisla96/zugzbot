# Compaction Snapshot: `session-metrics-breakdown`

> **Generado por:** sdd-implementer 💻
> **Fase:** 3 y 4 — Implementación + UX Premium
> **Fecha:** 2026-05-23

---

## Resumen Técnico

Se extendió el componente `SDDUsage` en `plugin_tui.tsx` para mostrar un desglose COMPACTO por agente/subagente con las mismas 3 métricas (costo, tokens input, tokens output), manteniendo los totales generales intactos.

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `plugins/plugin_tui.tsx` | +129 líneas netas (322 total) |

## Artefactos Generados

### 1. Constantes y Tipos (Lote 1)
```typescript
const MAX_AGENT_NAME_LENGTH = 20
const POLLING_INTERVAL_MS = 1000
const COST_DECIMALS = 5

interface AgentMetrics { agentName, sessionId, cost, tokensInput, tokensOutput, tokenTotal }
interface MetricsBreakdown { agents: AgentMetrics[], totalCost, totalTokens, agentCount }
```

### 2. Funciones Auxiliares (Lote 2)
- `collectSessionIds(sessionId)` → `[padre, ...hijos]` con try-catch y fallback
- `extractAgentName(messages, sessionInfo, sessionId)` → cascada `UserMessage.agent → session.title → fallback`
- `sumMetrics(messages)` → suma solo `AssistantMessage` (role === 'assistant')
- `truncateAgentName(name, maxLen)` → truncado a 20 chars + `…`
- `calculateBreakdown(sessionId)` → orquestador que retorna `MetricsBreakdown`

### 3. Cache y Polling (Lote 3)
- `hasMetricsChanged(prev, next)` → deep compare de cost/tokens
- Interval optimizado con `previousBreakdown` cache
- Solo re-renderiza si hay cambios reales

### 4. Componente UI (Lote 4)
- `AgentMetricsRow` → fila monospace con `padEnd`/`padStart`
- Primera fila (Build) en `accent`, subagentes en `text`
- Costo con 5 decimales, tokens con `toLocaleString()`

### 5. Integración SDDUsage (Lote 5)
- `usageState` → `breakdownState: Signal<MetricsBreakdown>`
- Totales desde breakdown: `totalCost`, `totalTokens`, `totalInput`, `totalOutput`
- Separador `borderTop` + header "📊 Desglose por Agente"
- Solo visible si `agentCount > 1`

### 6. Casos Borde (Lote 6)
- sesión null/undefined → breakdown vacío
- NaN/undefined cost → `Number.isFinite()` guard
- tokens undefined → `?.input ?? 0`
- children() error → catch silencioso, fallback sesión única

## Validación de Escenarios BDD

| # | Escenario | Estado |
|---|-----------|--------|
| 1 | 3 agentes con suma correcta | ✅ `calculateBreakdown` retorna `agents.length=3` |
| 2 | Sin hijos → 1 agente | ✅ `collectSessionIds` fallback a `[sessionId]` |
| 3 | Sesión vacía | ✅ Retorna breakdown vacío `{agents:[], totalCost:0}` |
| 4 | Hijo sin mensajes | ✅ `sumMetrics([])` retorna 0s |
| 5 | Consistencia totales | ✅ `totalCost = Σ agent.cost`, `totalTokens = Σ agent.tokenTotal` |
| 6 | Polling 1000ms | ✅ `POLLING_INTERVAL_MS` con cache |
| 7 | Nombre por defecto | ✅ Fallback `"Sesión {id}"` |
| 8 | Nombre largo truncado | ✅ `truncateAgentName` a 20 chars |
| 9 | children() no disponible | ✅ Optional chaining + try-catch |
| 10 | Precisión 5 decimales | ✅ `toFixed(COST_DECIMALS)` |

## Dependencias

No se requirieron nuevas dependencias externas.
