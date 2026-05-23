# Diagnóstico Fase 0: `session-metrics-breakdown`

> **Arquitecto:** sdd-architect 📐
> **Fecha:** 2026-05-23
> **Estado:** COMPLETED

---

## 1. Resumen de la Arquitectura Actual

### Componente analizado: `plugin_tui.tsx` (193 líneas)

```
plugin/zugzbot-sdd/
└── plugins/
    └── plugin_tui.tsx          ← Único plugin TUI activo
```

#### Estructura del plugin:

```
PluginTuiSidebar (TuiPlugin)
├── api.slots.register()
│   └── sidebar_content(ctx, props: { session_id, children })
│       ├── lockState       ← Signal: estado del sdd-lock.json (polling 1s)
│       ├── usageState      ← Signal: métricas de sesión (polling 1s)
│       ├── SDDMonitor()    ← Componente: barra de fase SDD
│       └── SDDUsage()      ← Componente: métricas de costo/tokens
```

#### Flujo de datos actual (`SDDUsage`):

```typescript
const messages = api.state.session.messages(props.session_id)
for (const msg of messages) {
  totalCost += msg.cost        // AssistantMessage.cost
  totalInput += msg.tokens.input   // AssistantMessage.tokens.input
  totalOutput += msg.tokens.output // AssistantMessage.tokens.output
}
// Renderiza totales sin discriminación
```

#### Mecanismo de polling:
- `setInterval(() => { setLockState(loadLockfile()); setUsageState(calculateUsage()) }, 1000)`
- El polling actual **no es óptimo**: recalcula TODO cada 1s independientemente de si hay cambios
- No hay mecanismo de cache ni detección de cambios

---

## 2. Hallazgos sobre Disponibilidad de Metadatos de Agente/Subagente

### 2.1 Tipos OpenCode descubiertos (desde `@opencode-ai/sdk` types.gen.ts)

#### `UserMessage` — TIENE campo `agent`

```typescript
export type UserMessage = {
  id: string
  sessionID: string
  role: "user"
  agent: string                    // ← NOMBRE DEL AGENTE
  model: { providerID: string, modelID: string }
  summary?: { title?: string, body?: string, diffs: FileDiff[] }
  // ... sin cost/tokens (solo asistente tiene costo)
}
```

#### `AssistantMessage` — NO tiene campo `agent` pero tiene `parentID`

```typescript
export type AssistantMessage = {
  id: string
  sessionID: string
  role: "assistant"
  parentID: string                 // ← Conecta al UserMessage que lo originó
  cost: number                     // ← Costo del mensaje
  tokens: {                        // ← Tokens del mensaje
    input: number
    output: number
    reasoning: number
    cache: { read: number, write: number }
  }
  mode: string                     // ← Modo del agente
  modelID: string
  providerID: string
}
```

#### `Session` — TIENE jerarquía padre-hijo

```typescript
export type Session = {
  id: string
  parentID?: string               // ← Si tiene, es sesión hija de subagente
  title: string                    // ← Posible nombre del agente
  // ...
}
```

#### `Part` — Tipo `"subtask"` con campo `agent`

```typescript
// Dentro del union type Part:
{
  type: "subtask"
  agent: string                    // ← Agente invocado
  description: string
  prompt: string
}
```

#### Endpoint REST confirmado: `session.children`

```
GET /session/{id}/children → Array<Session>
```

### 2.2 Mapeo Agente ↔ Sesión

De la documentación `agents.md`:
> "cuando los subagentes crean sus propias sesiones secundarias"
> Atajos: `session_child_cycle` / `session_child_cycle_reverse`

**Conclusión:** OpenCode modela la relación agente/subagente a nivel de **sesiones**, no de mensajes individuales. Cada subagente invocado crea una **sesión hija** separada.

```
Sesión Principal (Build/Plan)
├── Mensajes del agente principal
├── Sesión Hija 1 (subagente: sdd-architect) ← métricas propias
├── Sesión Hija 2 (subagente: sdd-implementer) ← métricas propias
└── Sesión Hija 3 (subagente: general) ← métricas propias
```

### 2.3 Lo que NO está disponible

| Recurso | Disponible | Notas |
|---------|-----------|-------|
| `AssistantMessage.agent` | ❌ No existe | Solo UserMessage tiene `agent` |
| Campo de agente en mensajes de sesión principal | ❌ Parcial | Los mensajes de subagentes están en sesiones hijas |
| `api.state.session.children()` | ❓ No confirmado | Existe en la API REST del SDK, no verificado en state API reactiva |
| `client.session.children()` | ✅ Sí disponible | SDK asíncrono, endpoint `/session/{id}/children` |

---

## 3. Análisis de Viabilidad Técnica

### 3.1 ¿Se puede hacer solo con `api.state.session.messages()`?

**NO completamente.** Si los subagentes crean sesiones hijas separadas (como indica la documentación), sus mensajes **no están** en `messages(props.session_id)` de la sesión principal. Solo se obtendrían las métricas del agente principal.

**Alternativa parcial:** Se podría intentar inferir la actividad de subagentes analizando `Part` de tipo `"subtask"` dentro de los mensajes de la sesión principal, pero estos parts solo contienen metadatos de la *invocación* (prompt, descripción), no el costo/tokens real, que está en los `AssistantMessage` de la sesión hija.

### 3.2 ¿Necesitamos acceder a sesiones hijas?

**SÍ.** Para obtener un desglose real por agente/subagente, necesitamos:

1. Obtener la lista de sesiones hijas de la sesión actual
2. Para cada sesión (padre + hijas), obtener sus mensajes
3. Calcular métricas por sesión
4. Mostrar desglose con el nombre de cada agente

### 3.3 ¿Cómo identificar cada agente?

Dos estrategias:

| Estrategia | Fuente | Confiabilidad |
|------------|--------|--------------|
| `session.title` | Sesión hija | Alta (el título típicamente incluye el agente) |
| `UserMessage.agent` del primer mensaje | Primer mensaje de sesión hija | Muy alta |
| Mapa manual (por ID de sesión) | Configurable | Total |

### 3.4 Análisis de Rendimiento y Riesgos

#### Riesgo: Polling cada 1000ms
- **Volumen de datos:** Si hay N sesiones hijas, cada una con M mensajes, cada ciclo de polling itera N×M mensajes
- **Estimación típica:** ~3-5 sesiones hijas, ~50-200 mensajes cada una → 150-1000 mensajes totales
- **Costo computacional:** Las operaciones son sumas simples de floats e enteros → insignificante (<1ms incluso con 1000 mensajes)
- **Rendimiento:** ✅ Aceptable para el volumen esperado

#### Riesgo: Llamadas asíncronas a `client.session.children()`
- Si `api.state.session.children()` no existe y debemos usar `client.session.children()`, cada ciclo de polling haría una llamada HTTP al servidor local de OpenCode
- **Latencia:** ~1-5ms por llamada (localhost)
- **Riesgo de carrera:** Si los hijos cambian durante el cálculo
- **Mitigación:** Cachear la lista de hijos y solo actualizar si hay cambios (evento `session.created`/`session.deleted`/`session.updated`)

#### Riesgo: Overflow de precisión en costos
- `cost` se suma en float, valores típicos < $10 → sin riesgo
- `tokens.input/output` pueden ser grandes (millones) → usar `number` (JS safe hasta 2^53) es seguro

#### Riesgo: Sesiones hijas anidadas
- ¿Un subagente puede invocar otro subagente? Si es así, habría que resolver recursivamente
- **Mitigación:** Limitar profundidad a 1 nivel (padre → hijos directos) como primera iteración

---

## 4. Enfoques Propuestos

### Enfoque A: Sistema de Sesiones Anidadas (RECOMENDADO)

Acceder a sesiones hijas vía `session.children()` y calcular métricas por sesión.

#### Arquitectura:

```typescript
// Estructura de datos
interface AgentMetrics {
  agentName: string
  sessionId: string
  cost: number
  tokensInput: number
  tokensOutput: number
}

interface BreakdownResult {
  agents: AgentMetrics[]
  totalCost: number
  totalTokens: number
}
```

#### Flujo propuesto:

```
1. Obtener sesión actual: session_id (props)
2. Obtener sesiones hijas: children_ids
3. Para cada sesión (padre + hijas):
   a. Obtener mensajes: api.state.session.messages(id)
   b. Obtener nombre del agente: del título de sesión o UserMessage.agent
   c. Calcular métricas: sum(cost), sum(tokens.input), sum(tokens.output)
4. Mostrar desglose: tabla por agente + totales
```

#### ✅ Pros:
- Arquitectónicamente correcto (usa el modelo nativo de OpenCode)
- Cada sesión hija tiene métricas aisladas (sin mezcla)
- Semánticamente claro: 1 sesión = 1 agente
- Escalable a N niveles de profundidad

#### ❌ Contras:
- Depende de que `api.state.session.children()` exista en la state API reactiva
- Si solo existe `client.session.children()` (asíncrono), rompe el modelo reactivo actual
- Más complejidad de implementación

### Enfoque B: Parseo de Subtask Parts + ParentID (FALLBACK)

Usar solo `api.state.session.messages()` de la sesión actual, parseando parts de tipo `subtask` para detectar cambios de agente y usando `parentID` para asociar mensajes.

#### Flujo propuesto:

```typescript
for (const msg of messages) {
  if (isUserMessage(msg) && msg.agent) {
    // Cambio de agente activo
    activeAgent = msg.agent
    // Buscar subtask parts en los parts del mensaje
    for (const part of msg.parts) {
      if (part.type === "subtask") {
        activeAgent = part.agent  // ← subagente invocado
      }
    }
  }
  if (isAssistantMessage(msg)) {
    // Asignar cost/tokens al agente activo
    agentMetrics[activeAgent].cost += msg.cost
    agentMetrics[activeAgent].tokens += msg.tokens
  }
}
```

#### ✅ Pros:
- Usa solo `api.state.session.messages()` (API ya probada y reactiva)
- Sin dependencias externas al plugin
- Más fácil de implementar inicialmente

#### ❌ Contras:
- **Crítico:** NO captura métricas de subagentes si operan en sesiones hijas separadas
- La inferencia de agente activo es frágil y depende del orden de los mensajes
- No funciona si el subagente está en sesión separada (que es el caso normal según docs)
- Mayor complejidad lógica que el Enfoque A
- Posiblemente incorrecto para el modelo de OpenCode actual

### Enfoque C: Híbrido (RECOMENDADO OPTIMIZADO)

Combinar ambos enfoques: intentar `session.children()` primero, y si no está disponible, hacer fallback a parseo.

#### ✅ Pros:
- Robusto ante cambios de API
- Cubre todos los escenarios
- Degradación graceful

#### ❌ Contras:
- Mayor complejidad de código
- Dos rutas de ejecución que mantener

---

## 5. Recomendación Final

### **Enfoque A: Sistema de Sesiones Anidadas**

#### Justificación:

1. **Precisión arquitectónica:** OpenCode modela explícitamente subagentes como sesiones hijas. Ignorar esto llevaría a datos incorrectos.

2. **Simplicidad conceptual:** 1 sesión = 1 agente. Las métricas se calculan por sesión de forma natural.

3. **Rendimiento predecible:** El volumen de mensajes por sesión hija es moderado, y las sesiones hijas son pocas (3-5 típicamente).

4. **Preparado para el futuro:** Si OpenCode añade más niveles de anidación, el enfoque escala naturalmente.

#### Plan de implementación sugerido:

```typescript
// 1. Verificar disponibilidad de API
const hasChildrenAPI = typeof api.state.session.children === 'function'

// 2. Obtener lista de sesiones
const sessions = hasChildrenAPI
  ? [props.session_id, ...api.state.session.children(props.session_id).map(s => s.id)]
  : [props.session_id]  // Fallback a solo sesión actual (Enfoque B)

// 3. Calcular métricas por sesión
const breakdown = sessions.map(sessionId => {
  const messages = api.state.session.messages(sessionId)
  const sessionInfo = api.state.session.get(sessionId)
  return {
    agentName: sessionInfo?.title || 'Unknown',
    sessionId,
    metrics: calculateMetrics(messages)
  }
})

// 4. Mostrar desglose en UI
```

#### Mejora al polling:
- **Opción 1 (Recomendada):** Mantener polling a 1000ms pero cachear resultados previos y solo re-renderizar si hay cambio real (deep compare).
- **Opción 2 (Premium):** Suscribirse a eventos `session.updated` y `session.created` para actualizar solo cuando hay cambios reales.
- **Opción 3 (Intermedia):** Polling a 2000ms (menos frecuente) + cache.

---

## 6. Dependencias y Cooldown

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| `@opencode-ai/plugin` | Bundled con OpenCode | ✅ No requiere instalación |
| `@opencode-ai/sdk` | Bundled con OpenCode | ✅ No requiere instalación |
| `solid-js` | Bundled con OpenCode | ✅ No requiere instalación |

**No se requieren nuevas dependencias externas.** Todo se implementa con las APIs existentes de OpenCode.

---

## 7. Checklist de Riesgos Técnicos

- [ ] **Confirmar** que `api.state.session.children()` existe en la state API del TUI plugin
- [ ] **Verificar** que `api.state.session.get(id)` existe para obtener metadatos de sesión
- [ ] **Probar** con sesiones reales de trabajo multi-agente para validar el desglose
- [ ] **Evaluar** profundidad de anidación de subagentes (¿hay sub-subagentes?)
- [ ] **Medir** rendimiento con sesiones de ~500+ mensajes distribuidos en varias sesiones hijas
- [ ] **Definir** cómo mostrar visualmente el desglose (tabla, columnas, acordeón)
