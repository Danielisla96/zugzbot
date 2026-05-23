# Especificaciones Funcionales — Monitor TUI SDD Simplificado

## Formato: BDD (Given-When-Then) en español

---

### ESC-001: Monitor inactivo sin lockfile

**Given** que el archivo `sdd-lock.json` **no existe** en el directorio del proyecto
**When** el plugin `PluginTuiSidebar` se inicializa y el slot `sidebar_content` se renderiza
**Then** se muestra el texto `[SDD Monitor Inactivo]` en el panel lateral
**And** se muestra el texto `sdd-lock.json no encontrado`

**Criterio de verificación:** El componente `SDDMonitor` retorna un `<box>` con texto informativo de inactividad.

---

### ESC-002: Pipeline muestra fases correctamente

**Given** que `sdd-lock.json` existe con el contenido:
```json
{ "active_phase": 1, "change_name": "test", "status": "in_progress", "auto_pilot": false, "iteration": 0 }
```
**When** el sidebar se renderiza
**Then** se muestran 9 fases del pipeline SDD (F0 a F8)
**And** la fase 0 aparece como completada ✔
**And** la fase 1 aparece como activa (En curso) ●
**And** las fases 2 a 8 aparecen como pendientes ○

**Criterio de verificación:** Cada fase usa el ícono, nombre, y estado visual correcto.

---

### ESC-003: Cambio de nombre y modo se muestran

**Given** que `sdd-lock.json` contiene `"change_name": "mi-cambio"` y `"auto_pilot": true`
**When** el sidebar se renderiza
**Then** se muestra el texto `Cambio: mi-cambio`
**And** se muestra `Modo: Piloto Automático ⚡ (--auto)`

**Criterio de verificación:** Los valores del lockfile se reflejan textualmente en el header.

---

### ESC-004: Tarjeta de agente activo

**Given** que `sdd-lock.json` contiene:
```json
{ "active_phase": 3, "active_subagent": "sdd-implementer", "status": "in_progress", "iteration": 2 }
```
**And** que existe `phase_history.jsonl` con una entrada de fase 3
**When** el sidebar se renderiza
**Then** se muestra el nombre del subagente: `sdd-implementer 💻`
**And** se muestra la acción descriptiva de la fase 3
**And** se muestra el tiempo transcurrido desde el timestamp de la fase activa
**And** se muestra el número de iteración: `#2`
**And** se muestra el estado: `Activo 🟢`

**Criterio de verificación:** La tarjeta de agente activo contiene los 5 campos: Agente, Acción, Tiempo, Iteración, Estado.

---

### ESC-005: Estado de espera se muestra

**Given** que `sdd-lock.json` contiene `"status": "waiting"` en lugar de `"in_progress"`
**When** el sidebar se renderiza
**Then** se muestra `Espera 🟡` en el campo de estado

**Criterio de verificación:** El texto refleja el valor `waiting` con el ícono amarillo.

---

### ESC-006: Siguiente paso (fase < 8)

**Given** que `sdd-lock.json` contiene `"active_phase": 2`
**When** el sidebar se renderiza
**Then** se muestra la sección `SIGUIENTE PASO`
**And** se muestra el nombre de la fase 3 ("F3: Codificación")
**And** se muestra el agente `sdd-implementer 💻`

**Criterio de verificación:** El bloque de siguiente paso solo aparece si `active_phase < 8`.

---

### ESC-007: Ciclo completado (fase 8)

**Given** que `sdd-lock.json` contiene `"active_phase": 8`
**When** el sidebar se renderiza
**Then** se muestra el mensaje `🎉 ¡CICLO COMPLETADO!`
**And** se muestra `Todo listo para producción.`
**And** **no** se muestra la sección `SIGUIENTE PASO`

**Criterio de verificación:** Fase 8 es el estado terminal, no hay siguiente paso.

---

### ESC-008: Polling actualiza estado automáticamente

**Given** que el sidebar está renderizado mostrando `Cambio: version-1`
**When** el archivo `sdd-lock.json` se modifica cambiando `change_name` a `version-2`
**And** transcurre el intervalo de polling (1000ms)
**Then** el sidebar muestra `Cambio: version-2` sin intervención manual

**Criterio de verificación:** El `setInterval` refresca `lockState` y `currentTime` periódicamente.

---

### ESC-009: Cleanup al desmontar el componente

**Given** que el sidebar está renderizado con polling activo
**When** el componente se desmonta (cleanup)
**Then** el intervalo de polling se cancela
**And** no hay fugas de memoria ni timers residuales

**Criterio de verificación:** `clearInterval` se ejecuta correctamente en `onCleanup`.

---

### ESC-010: Sin breakdown de sesión

**Given** que el archivo `plugin_tui.tsx` ha sido simplificado
**When** se inspecciona el código resultante
**Then** **no** existen las funciones: `calculateBreakdown`, `collectSessionIds`, `extractAgentName`, `sumMetrics`, `truncateAgentName`, `hasMetricsChanged`
**And** **no** existen los componentes: `SDDUsage`, `AgentMetricsRow`
**And** **no** existe el estado: `breakdownState`, `showBreakdown`, `previousBreakdown`
**And** el archivo tiene **180 líneas o menos**

**Criterio de verificación:** Conteo de líneas y grep de funciones eliminadas retorna 0 resultados.

---

### ESC-011: Export y estructura de slots intactos

**Given** que el archivo ha sido simplificado
**When** se importa el módulo como plugin de OpenCode
**Then** el export `{ id: "plugin_tui", tui: PluginTuiSidebar }` sigue siendo funcional
**And** el slot `sidebar_content` está registrado con `order: 100`

**Criterio de verificación:** La interfaz `TuiPluginModule` sigue siendo satisfecha correctamente.

---

### ESC-012: loadLockfile sigue funcionando

**Given** que `sdd-lock.json` existe con contenido JSON válido
**When** se ejecuta `loadLockfile()`
**Then** retorna el objeto parseado del JSON
**And** si el archivo no existe o está corrupto, retorna `null`

**Criterio de verificación:** La función `loadLockfile` no se modifica en la simplificación.
