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

### Convenciones

- Los nombres de cambio siguen kebab-case
- Las carpetas de cambio se archivan en `.openspec/changes/archive/YYYY-MM-DD-<change-name>/`
- Los commits semánticos siguen conventional commits (`feat`, `fix`, `docs`, etc.)
- La versión sigue SemVer: minor bump para nuevas features, patch para fixes
