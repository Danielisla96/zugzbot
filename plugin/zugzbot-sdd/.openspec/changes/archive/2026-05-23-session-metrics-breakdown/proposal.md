# Propuesta Técnica: `session-metrics-breakdown`

> **Fase:** 1 — Propuesta y Especificaciones
> **Arquitecto:** sdd-architect 📐
> **Prioridad:** Alta (mejora de visibilidad de costos multi-agente)

---

## 1. Problema

El componente `SDDUsage` en `plugin_tui.tsx` muestra métricas de sesión (costo, tokens de entrada/salida) **agregadas sin discriminación por agente/subagente**. En sesiones con múltiples agentes (Build + sdd-architect + sdd-implementer), es imposible saber qué proporción del costo corresponde a cada uno.

## 2. Solución Propuesta

Extender el panel de métricas para mostrar un **desglose COMPACTO por agente y subagente**, manteniendo los totales generales comocabecera.

### 2.1 Vista Actual → Vista Propuesta

```
VISTA ACTUAL:                          VISTA PROPUESTA:

[Métricas de Sesión] 💸                [Métricas de Sesión] 💸
Costo Total: $0.01234                  Costo Total: $0.01234
Tokens Entrada: 1,234                  Tokens Entrada: 1,234
Tokens Salida: 567                     Tokens Salida: 567
Tokens Totales: 1,801
                                       ─────────────────────────
                                       📊 Desglose por Agente
                                       Build          $0.0050  450/200
                                       sdd-architect  $0.0045  400/180
                                       sdd-implementer$0.0028  384/187
```

### 2.2 Formato de desglose

Cada fila muestra en una sola línea compacta:

```
<Nombre Agente>  <Costo>  <Tokens In/Out>
```

Usando ancho fijo/monospace para alineación visual.

## 3. Modelo de Datos

```typescript
interface AgentMetrics {
  agentName: string      // Nombre del agente (ej: "Build", "sdd-architect")
  sessionId: string      // ID de la sesión (padre o hija)
  cost: number           // Costo acumulado
  tokensInput: number    // Tokens de entrada
  tokensOutput: number   // Tokens de salida
  tokenTotal: number     // tokensInput + tokensOutput (derivado)
}

interface MetricsBreakdown {
  agents: AgentMetrics[]
  totalCost: number      // Suma de todos los agentes
  totalTokens: number    // Suma de todos los tokens
  agentCount: number     // Cantidad de agentes en el desglose
}
```

## 4. Estrategia de Extracción

### 4.1 Obtención de sesiones

```
Sesión Actual (props.session_id)
  ├── children() → Sesión Hija 1 (sdd-architect)
  ├── children() → Sesión Hija 2 (sdd-implementer)
  └── children() → Sesión Hija 3 (general)
```

### 4.2 Identificación del nombre del agente

Para cada sesión (padre e hijas), el nombre del agente se obtiene por:

1. **Primera opción:** `UserMessage.agent` del primer mensaje de la sesión
2. **Fallback:** `session.title` 
3. **Último recurso:** `"Unknown Agent"`

### 4.3 Cálculo de métricas

```typescript
for (const msg of session.messages(sessionId)) {
  if (isAssistantMessage(msg)) {
    cost += msg.cost
    input += msg.tokens.input
    output += msg.tokens.output
  }
}
```

## 5. Impacto en Componentes Existentes

| Componente | Cambio |
|-----------|--------|
| `SDDUsage` | Se modifica para mostrar desglose además de totales |
| `sidebar_content` | Mínimo o nulo (solo cambia el contenido del slot) |
| Polling | Se mantiene a 1000ms, con cache de resultados previos |

## 6. No Alcance (Fuera de Scope)

- ❌ Mostrar desglose por **modelo** (Antrhopic vs OpenAI)
- ❌ Mostrar desglose por **tipo de token** (razonamiento, cache) — solo input/output
- ❌ Histórico de sesiones anteriores
- ❌ Gráficos o visualizaciones avanzadas

## 7. Criterios de Aceptación

- [ ] El desglose muestra correctamente al menos 2 agentes diferentes
- [ ] Los totales individuales suman exactamente el total general
- [ ] El componente funciona sin errores cuando no hay sesiones hijas
- [ ] El polling actualiza los valores en tiempo real
- [ ] El ancho del sidebar no se rompe con nombres largos de agentes
