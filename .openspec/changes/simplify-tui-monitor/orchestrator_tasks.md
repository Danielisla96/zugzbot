# Checklist de Implementación — Simplificación Monitor TUI SDD

## Archivo destino
`plugin/zugzbot-sdd/plugins/plugin_tui.tsx` (424 → ~180 líneas)

## Convenciones
- Cada tarea es **atómica**: puede ejecutarse y verificarse por separado
- Las tareas deben ejecutarse en **orden secuencial**
- `[ESC-NNN]` = escenario BDD cubierto en `specs/spec.md`
- Las líneas referidas son del **archivo original** (pre-simplificación)

---

## 📦 Fase 1: Poda de código muerto (Tasks 1–5)

### Task 1 — Eliminar constantes y tipos obsoletos

**Objetivo:** Remover constantes e interfaces que solo usaba el subsistema de breakdown.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:** Eliminar estas secciones del archivo:

1. Línea 8: `const MAX_AGENT_NAME_LENGTH = 20`
2. Línea 10: `const COST_DECIMALS = 5`
3. Líneas 12–20: La interfaz `AgentMetrics`
4. Líneas 22–27: La interfaz `MetricsBreakdown`

**Código a eliminar:**
```typescript
const MAX_AGENT_NAME_LENGTH = 20
// ...
const COST_DECIMALS = 5

// ─── Tipos de datos ───────────────────────────────────
interface AgentMetrics {
  agentName: string
  sessionId: string
  cost: number
  tokensInput: number
  tokensOutput: number
  tokenTotal: number
}

interface MetricsBreakdown {
  agents: AgentMetrics[]
  totalCost: number
  totalTokens: number
  agentCount: number
}
```

**Verificación:** El archivo inicia con imports, luego `POLLING_INTERVAL_MS` y luego `PluginTuiSidebar`.

**BDD:** ESC-010

---

### Task 2 — Reemplazar `getDefaultAction()` por constante inline

**Objetivo:** Eliminar la función `getDefaultAction()` y reemplazarla por una constante `PHASE_ACTIONS` declarada en el scope del slot `sidebar_content` (o inline en `getActiveAgentData`).

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:**

1. **Eliminar** líneas 43–57 (función `getDefaultAction` completa):
   ```typescript
   const getDefaultAction = (phase: number): string => {
     const actions: { [key: number]: string } = {
       0: "Analizando entorno y dependencias...",
       1: "Escribiendo propuesta y especificaciones BDD...",
       2: "Generando checklist de tareas y planos...",
       3: "Implementando lógica y componentes modulares...",
       4: "Refinando diseño UX/UI y micro-animaciones...",
       5: "Desplegando en caliente y corriendo tests...",
       6: "Verificando calidad final, linter y reportes...",
       7: "Actualizando README, changelog y versionamiento...",
       8: "Archivando cambio y confirmando en Git..."
     }
     return actions[phase] || "Trabajando en el ciclo SDD..."
   }
   ```

2. **Agregar** esta constante en el scope del slot `sidebar_content` (después de `const [currentTime, setCurrentTime] = createSignal(Date.now())`):
   ```typescript
   const PHASE_ACTIONS: Record<number, string> = {
     0: "Analizando entorno y dependencias...",
     1: "Escribiendo propuesta y especificaciones BDD...",
     2: "Generando checklist de tareas y planos...",
     3: "Implementando lógica y componentes modulares...",
     4: "Refinando diseño UX/UI y micro-animaciones...",
     5: "Desplegando en caliente y corriendo tests...",
     6: "Verificando calidad final, linter y reportes...",
     7: "Actualizando README, changelog y versionamiento...",
     8: "Archivando cambio y confirmando en Git..."
   }
   ```

**Verificación:** `grep "getDefaultAction" plugin_tui.tsx` retorna 0 resultados. La nueva constante existe con las mismas strings.

**BDD:** ESC-010

---

### Task 3 — Reemplazar `getAgentForPhase()` por constante inline

**Objetivo:** Eliminar la función `getAgentForPhase()` y reemplazarla por una constante `PHASE_AGENTS`.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:**

1. **Eliminar** líneas 59–73 (función `getAgentForPhase` completa):
   ```typescript
   const getAgentForPhase = (phase: number): string => {
     const agents: { [key: number]: string } = {
       0: "sdd-architect 📐",
       1: "sdd-architect 📐",
       2: "sdd-architect 📐",
       3: "sdd-implementer 💻",
       4: "sdd-implementer 💻",
       5: "sdd-launcher 🚀",
       6: "sdd-release-manager 📦",
       7: "sdd-release-manager 📦",
       8: "sdd-release-manager 📦"
     }
     return agents[phase] || "sdd-architect 📐"
   }
   ```

2. **Agregar** esta constante junto a `PHASE_ACTIONS`:
   ```typescript
   const PHASE_AGENTS: Record<number, string> = {
     0: "sdd-architect 📐",
     1: "sdd-architect 📐",
     2: "sdd-architect 📐",
     3: "sdd-implementer 💻",
     4: "sdd-implementer 💻",
     5: "sdd-launcher 🚀",
     6: "sdd-release-manager 📦",
     7: "sdd-release-manager 📦",
     8: "sdd-release-manager 📦"
   }
   ```

**Verificación:** `grep "getAgentForPhase" plugin_tui.tsx` retorna 0 resultados. `PHASE_AGENTS` existe y es accesible desde `SDDMonitor`.

**BDD:** ESC-010, ESC-006

---

### Task 4 — Eliminar funciones auxiliares de breakdown

**Objetivo:** Remover las 6 funciones que conforman el subsistema de cálculo de métricas de sesión.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:** Eliminar las siguientes líneas:

| Función | Líneas a eliminar | Tamaño |
|---------|-------------------|--------|
| `collectSessionIds` | 82–90 | 8 líneas |
| `extractAgentName` | 92–105 | 10 líneas |
| `sumMetrics` | 107–117 | 11 líneas |
| `truncateAgentName` | 119–123 | 5 líneas |
| `calculateBreakdown` | 125–161 | 37 líneas |
| `hasMetricsChanged` | 163–170 | 6 líneas |

**Bloque completo a eliminar** (líneas 82–170, desde `// ─── Funciones auxiliares` hasta el cierre de `hasMetricsChanged`):
```typescript
        // ─── Funciones auxiliares para desglose por agente ───
        function collectSessionIds(sessionId: string): string[] {
          // ... (todo el bloque de 6 funciones)
        }
```

**Nota:** Asegurarse de no dejar líneas comentadas sueltas. El bloque completo debe desaparecer.

**Verificación:** `grep -E "(calculateBreakdown|collectSessionIds|extractAgentName|sumMetrics|truncateAgentName|hasMetricsChanged)" plugin_tui.tsx` retorna 0 resultados.

**BDD:** ESC-010

---

### Task 5 — Eliminar estado del subsistema de breakdown

**Objetivo:** Remover las variables de estado que gestionaban el breakdown colapsable.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:** Eliminar las líneas 172–181:

```typescript
        const emptyBreakdown: MetricsBreakdown = {
          agents: [],
          totalCost: 0,
          totalTokens: 0,
          agentCount: 0
        }

        const [breakdownState, setBreakdownState] = createSignal<MetricsBreakdown>(emptyBreakdown)
        const [showBreakdown, setShowBreakdown] = createSignal(false)
        let previousBreakdown: MetricsBreakdown | null = null
```

**Nota:** Tras la Task 1, la interfaz `MetricsBreakdown` ya no existe, por lo que este código causaría error de compilación si no se elimina.

**Verificación:** `grep -E "(breakdownState|showBreakdown|previousBreakdown|emptyBreakdown)" plugin_tui.tsx` retorna 0 resultados.

**BDD:** ESC-010

---

## 🔧 Fase 2: Compresión y simplificación (Tasks 6–10)

### Task 6 — Simplificar el polling

**Objetivo:** El `setInterval` actual hace 4 cosas (lockfile + timestamp + breakdown + diff). Reducir a solo 2 (lockfile + timestamp).

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:** Reemplazar las líneas 183–193:

**Código ACTUAL a eliminar:**
```typescript
        // Polling reactivo robusto cada 1000ms
        const interval = setInterval(() => {
          setLockState(loadLockfile())
          setCurrentTime(Date.now())
          
          const newBreakdown = calculateBreakdown(props.session_id)
          if (hasMetricsChanged(previousBreakdown, newBreakdown)) {
            setBreakdownState(newBreakdown)
            previousBreakdown = newBreakdown
          }
        }, POLLING_INTERVAL_MS)
```

**Código NUEVO a insertar:**
```typescript
        // Polling simple: solo refresca lockfile y timestamp
        const interval = setInterval(() => {
          setLockState(loadLockfile())
          setCurrentTime(Date.now())
        }, POLLING_INTERVAL_MS)
```

**Verificación:** El callback del `setInterval` solo contiene 2 líneas de código (setLockState + setCurrentTime). No hay referencias a `calculateBreakdown`, `hasMetricsChanged`, `breakdownState`, ni `props.session_id`.

**BDD:** ESC-008, ESC-009

---

### Task 7 — Simplificar `getActiveAgentData()`

**Objetivo:** Eliminar la dependencia de `getDefaultAction()` (eliminada en Task 2) y usar la constante `PHASE_ACTIONS` como fallback.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:** Reemplazar las líneas 199–217:

**Código ACTUAL a eliminar:**
```typescript
        // Leer datos del agente activo y elapsed time de phase_history.jsonl
        const getActiveAgentData = (state: any) => {
          if (!state || !state.change_name || state.change_name === "nuevo-cambio") {
            return { timestamp: null, action: getDefaultAction(state?.active_phase ?? 0) }
          }
          const historyPath = path.join(projectRoot, ".openspec/changes", state.change_name, "phase_history.jsonl")
          if (fs.existsSync(historyPath)) {
            try {
              const lines = fs.readFileSync(historyPath, "utf-8").trim().split("\n")
              for (let i = lines.length - 1; i >= 0; i--) {
                const entry = JSON.parse(lines[i])
                if (entry.phase === state.active_phase) {
                  return { timestamp: entry.timestamp, action: entry.reason }
                }
              }
            } catch (e) {}
          }
          return { timestamp: null, action: getDefaultAction(state.active_phase ?? 0) }
        }
```

**Código NUEVO a insertar (misma posición):**
```typescript
        // Lee phase_history.jsonl para obtener timestamp y razón de la fase activa
        const getActiveAgentData = (state: any) => {
          if (!state || !state.change_name || state.change_name === "nuevo-cambio") {
            return { timestamp: null, action: PHASE_ACTIONS[state?.active_phase ?? 0] ?? "Trabajando en el ciclo SDD..." }
          }
          const historyPath = path.join(projectRoot, ".openspec/changes", state.change_name, "phase_history.jsonl")
          if (fs.existsSync(historyPath)) {
            try {
              const lines = fs.readFileSync(historyPath, "utf-8").trim().split("\n")
              for (let i = lines.length - 1; i >= 0; i--) {
                const entry = JSON.parse(lines[i])
                if (entry.phase === state.active_phase) {
                  return { timestamp: entry.timestamp, action: entry.reason }
                }
              }
            } catch (e) {}
          }
          return { timestamp: null, action: PHASE_ACTIONS[state.active_phase ?? 0] ?? "Trabajando en el ciclo SDD..." }
        }
```

**Verificación:** `grep "getDefaultAction" plugin_tui.tsx` retorna 0 resultados. `getActiveAgentData` usa `PHASE_ACTIONS` como fallback.

**BDD:** ESC-004

---

### Task 8 — Comprimir componente `SDDMonitor`

**Objetivo:** Reemplazar el componente `SDDMonitor` actual (~138 líneas, líneas 219–357) por una versión comprimida (~80 líneas) con pipeline compacto.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Requisitos del nuevo diseño:**
1. ✅ Encabezado con nombre del cambio y modo
2. ✅ Fase activa destacada (con emoji y nombre en una línea resaltada)
3. ✅ Barra de progreso compacta (una sola línea con todas las fases: ✔icon para completadas, ●icon para activa, ○icon para pendientes)
4. ✅ Tarjeta del agente activo con borde doble (Agente, Acción, Tiempo, Iteración, Estado)
5. ✅ Indicador del siguiente paso (compacto, 1 línea con nombre de fase + agente)
6. ✅ Mensaje de "ciclo completado" cuando phase === 8
7. ✅ Estado inactivo cuando lockState es null

**Acción:** Reemplazar líneas 218–357 (desde `const SDDMonitor = () => {` hasta el cierre de la función y su parent) con la nueva versión comprimida.

El slot `sidebar_content` tendrá las siguientes constantes inline (agregar después de `PHASE_AGENTS`):
```typescript
        const PHASE_NAMES = [
          "Diagnóstico", "Propuesta", "Planificación", "Codificación",
          "Pulido UX/UI", "Despliegue/Test", "Control QA", "Documentación", "Cierre/Git"
        ]
        const PHASE_ICONS = ["🔍", "📝", "📐", "🛠️", "🎨", "🚀", "🧪", "📄", "📦"]
```

**Nuevo `SDDMonitor` (código a insertar):**
```typescript
        const SDDMonitor = () => {
          const state = lockState()
          if (!state) {
            return (
              <box gap={0} paddingTop={1}>
                <text fg={api.theme.current.textMuted}>
                  <i>[SDD Monitor Inactivo]</i>
                </text>
                <text fg={api.theme.current.textMuted}>sdd-lock.json no encontrado</text>
              </box>
            )
          }

          const currentPhase = typeof state.active_phase === "number"
            ? Math.max(0, Math.min(8, state.active_phase))
            : 0
          const agentData = getActiveAgentData(state)

          // Formatear elapsed time
          let elapsedStr = "0s activo"
          if (agentData.timestamp) {
            const diffMs = currentTime() - new Date(agentData.timestamp).getTime()
            if (diffMs > 0) {
              const d = Math.floor(diffMs / 1000)
              elapsedStr = d < 60 ? `${d}s activo` : `${Math.floor(d / 60)}m ${d % 60}s activo`
            }
          }

          // Emoji dinámico según subagente
          const subEmoji = state.active_subagent?.includes("architect") ? "📐"
            : state.active_subagent?.includes("implementer") ? "💻"
            : state.active_subagent?.includes("launcher") ? "🚀" : "📦"

          return (
            <box gap={0} paddingTop={1} paddingBottom={1}>
              {/* Encabezado */}
              <text fg={api.theme.current.accent}><b>🤖 ZUGZBOT SDD</b></text>
              <text fg={api.theme.current.text}>
                <b>Cambio:</b> <span fg={api.theme.current.success}>{state.change_name}</span>
              </text>
              <text fg={api.theme.current.text}>
                <b>Modo:</b> {state.auto_pilot ? "Piloto Automático ⚡" : "Manual 🛑"}
              </text>

              {/* Separador */}
              <text fg={api.theme.current.textMuted}>──────────────────────────────</text>

              {/* Fase activa destacada */}
              <text fg={api.theme.current.success}>
                <b>► Fase Activa: {PHASE_ICONS[currentPhase]} {PHASE_NAMES[currentPhase]}</b>
              </text>

              {/* Barra de progreso compacta (1 línea) */}
              <text fg={api.theme.current.textMuted}>
                {PHASE_ICONS.map((ic, i) =>
                  i < currentPhase ? `✔${ic}` : i === currentPhase ? `●${ic}` : `○${ic}`
                ).join(" ")}
              </text>

              {/* Tarjeta del agente activo */}
              <box borderStyle="double" borderColor={api.theme.current.success} padding={1} gap={0}>
                <text fg={api.theme.current.success}><b>🧠 AGENTE ACTIVO</b></text>
                <text fg={api.theme.current.text}><b>Agente:</b> {state.active_subagent} {subEmoji}</text>
                <text fg={api.theme.current.text}><b>Acción:</b> "{agentData.action}"</text>
                <text fg={api.theme.current.text}>
                  <b>Tiempo:</b> <span fg={api.theme.current.warning}><b>{elapsedStr}</b></span>
                </text>
                <text fg={api.theme.current.text}>
                  <b>Iteración:</b> #{state.iteration} | <b>Estado:</b>{" "}
                  {state.status === "in_progress" ? "Activo 🟢" : "Espera 🟡"}
                </text>
              </box>

              {/* Siguiente paso o ciclo completado */}
              {currentPhase < 8 ? (
                <text fg={api.theme.current.accent}>
                  <b>🔮 Siguiente paso:</b> {PHASE_NAMES[currentPhase + 1]} ({PHASE_AGENTS[currentPhase + 1]})
                </text>
              ) : (
                <text fg={api.theme.current.success}><b>🎉 ¡CICLO COMPLETADO!</b></text>
              )}
            </box>
          )
        }
```

**Verificación visual:** El componente renderiza:
- Header con 🤖 ZUGZBOT SDD, cambio y modo
- Fase activa con ► y emoji
- Barra con 9 iconos en 1 línea (✔, ●, ○)
- Tarjeta con borde doble y 5 campos
- Siguiente paso en 1 línea

**BDD:** ESC-001, ESC-002, ESC-003, ESC-004, ESC-005, ESC-006, ESC-007

---

### Task 9 — Eliminar componentes `AgentMetricsRow` y `SDDUsage`

**Objetivo:** Remover los dos componentes de visualización del breakdown.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:** Eliminar líneas 359–401:

```typescript
        // Fila individual de desglose
        const AgentMetricsRow = (props: { agent: AgentMetrics; index: number }) => {
          // ... (componente completo)
        }

        // Métricas compactas y colapsables al fondo
        const SDDUsage = () => {
          // ... (componente completo)
        }
```

**Verificación:** `grep -E "(AgentMetricsRow|SDDUsage)" plugin_tui.tsx` retorna 0 resultados.

**BDD:** ESC-010

---

### Task 10 — Simplificar el JSX de retorno del slot

**Objetivo:** Remover `<SDDUsage />` y los separadores del return, quedando solo `<SDDMonitor />` seguido de `{props.children}`.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Acción:** Reemplazar líneas 403–418:

**Código ACTUAL a eliminar:**
```tsx
        return (
          <box gap={0}>
            {/* Monitor SDD Rediseñado */}
            <SDDMonitor />

            <box paddingTop={1} borderTop={1} borderStyle="single" borderColor={api.theme.current.borderSubtle} />

            {/* Consumo y desglose de sesión */}
            <SDDUsage />

            <box paddingTop={1} borderTop={1} borderStyle="single" borderColor={api.theme.current.borderSubtle} />

            {/* Chat original de OpenCode */}
            {props.children}
          </box>
        )
```

**Código NUEVO a insertar:**
```tsx
        return (
          <box gap={0}>
            <SDDMonitor />
            {props.children}
          </box>
        )
```

**Verificación:** El return solo contiene `<SDDMonitor />` y `{props.children}`. No hay referencias a `SDDUsage`.

**BDD:** ESC-010, ESC-011

---

## ✅ Fase 3: Verificación final (Tasks 11–13)

### Task 11 — Verificar export y estructura de slots intactos

**Objetivo:** Confirmar que la estructura de integración con OpenCode no se ha visto afectada.

**Archivo:** `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`

**Verificar que existe:**

1. `export default { id: "plugin_tui", tui: PluginTuiSidebar } satisfies TuiPluginModule & { id: string }` — sin cambios
2. `api.slots.register({ order: 100, ... })` — sin cambios
3. El slot `sidebar_content` recibe `(_ctx, props)` — sin cambios
4. `onCleanup` sigue cancelando el intervalo — sin cambios

**Acción:** No modificar nada. Solo verificar que estas estructuras están intactas.

**BDD:** ESC-011

---

### Task 12 — Contar líneas finales

**Objetivo:** Verificar que el archivo resultante tiene 180 líneas (±20).

**Comando:**
```bash
wc -l plugin/zugzbot-sdd/plugins/plugin_tui.tsx
```

**Criterio de aceptación:** El resultado debe estar entre 160 y 200 líneas.

**BDD:** ESC-010

---

### Task 13 — Verificación completa de BDD

**Objetivo:** Ejecutar una verificación manual de todos los escenarios BDD.

| ESC | Escenario | Cómo verificar |
|-----|-----------|----------------|
| ESC-001 | Monitor inactivo sin lockfile | Renombrar sdd-lock.json temporalmente, recargar sidebar, ver "[SDD Monitor Inactivo]" |
| ESC-002 | Pipeline muestra fases | Verificar que las 9 fases aparecen con iconos ✔/●/○ correctos |
| ESC-003 | Cambio y modo | Verificar que `change_name` y `auto_pilot` se reflejan textualmente |
| ESC-004 | Tarjeta agente activo | Verificar 5 campos: Agente, Acción, Tiempo, Iteración, Estado |
| ESC-005 | Estado de espera | Setear `status: "waiting"` en lockfile, ver "Espera 🟡" |
| ESC-006 | Siguiente paso | Verificar que aparece solo si phase < 8, con nombre y agente |
| ESC-007 | Ciclo completado | Setear `active_phase: 8`, ver "🎉 ¡CICLO COMPLETADO!" |
| ESC-008 | Polling automático | Modificar lockfile, esperar 1s, ver cambio reflejado |
| ESC-009 | Cleanup | Verificar `onCleanup` con `clearInterval` en el código |
| ESC-010 | Sin breakdown | `grep` de todas las funciones eliminadas debe retornar 0 |
| ESC-011 | Export intacto | Verificar `export default` y `api.slots.register` |
| ESC-012 | loadLockfile | Verificar que la función retorna null si no existe archivo |

---

## Resumen de líneas afectadas

| Task | Líneas originales | Tipo de cambio |
|------|-------------------|----------------|
| T1 | 8, 10, 12–27 | ❌ Eliminar |
| T2 | 43–57 | ❌ Eliminar + ➕ Insertar constante |
| T3 | 59–73 | ❌ Eliminar + ➕ Insertar constante |
| T4 | 82–170 | ❌ Eliminar |
| T5 | 172–181 | ❌ Eliminar |
| T6 | 183–193 | ❌ Reemplazar (simplificar) |
| T7 | 199–217 | ❌ Reemplazar (simplificar) |
| T8 | 218–357 | ❌ Reemplazar (comprimir) |
| T9 | 359–401 | ❌ Eliminar |
| T10 | 403–418 | ❌ Reemplazar (simplificar) |
| T11 | — | ✅ Verificar |
| T12 | — | ✅ Contar |
| T13 | — | ✅ Validar |

## Orden de ejecución sugerido

1. Tasks 1→5 (poda, se pueden hacer en una sola edición grande)
2. Tasks 6→7 (simplificación de lógica de polling y datos)
3. Task 8 (corazón del cambio, componente comprimido)
4. Tasks 9→10 (limpieza final del JSX)
5. Tasks 11→13 (verificación)
