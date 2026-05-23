# 🧠 Brain — Base de Conocimiento Técnico

> Registro de lecciones técnicas, bugs y arquitectura del proyecto zugzbot-sdd.

---

## Arquitectura

### Plugin TUI para OpenCode
- El plugin se exporta como módulo con `{ id, tui }` satisfaciendo `TuiPluginModule & { id: string }`
- Usa `api.slots.register()` con un slot `sidebar_content` de orden 100
- El polling se implementa con `setInterval` + `onCleanup` de SolidJS

---

## Lecciones Técnicas

### session-metrics-breakdown (2026-05-23)

**Contexto:** Se necesitaba desglosar métricas de sesión por agente en el TUI plugin.

**Solución:** Se descubrió que los subagentes en opencode modelan sesiones hijas separadas. Se usó `api.state.session.children()` para obtenerlas y se agregó `UserMessage.agent` como fuente del nombre del agente.

**Aprendizaje:** La API `session.children()` puede no estar disponible en el runtime del TUI plugin; siempre implementar try-catch con fallback.

**Archivo modificado:** `plugins/plugin_tui.tsx`

---

### simplify-tui-monitor (2026-05-23)

**Contexto:** El plugin TUI tenía componentes de métricas de sesión (`SDDUsage`, `AgentMetricsRow`) que añadían ~240 líneas adicionales y complejidad innecesaria para un monitor de estado.

**Solución:** Se eliminó todo el subsistema de breakdown de sesión, dejando solo el monitor SDD puro. El código pasó de 424 → 186 líneas (−56%). Se reemplazó el flujo complejo (polling → breakdown → render anidado) por un flujo lineal directo: `loadLockfile → getActiveAgentData → SDDMonitor`.

**Aprendizaje:** No todo lo que puede medirse debe mostrarse en la UI principal. Si una feature duplica la complejidad del archivo pero no es crítica para la experiencia core, debe separarse en un plugin independiente o eliminarse. Un monitor de pipeline debe ser ligero (<200 líneas) para mantenerse sostenible.

**Archivo modificado:** `plugins/plugin_tui.tsx`

---

### Convenciones

- Los nombres de cambio siguen kebab-case
- Las carpetas de cambio se archivan en `.openspec/changes/archive/YYYY-MM-DD-<change-name>/`
- Los commits semánticos siguen conventional commits (`feat`, `fix`, `docs`, etc.)
- La versión sigue SemVer: minor bump para nuevas features, patch para fixes
