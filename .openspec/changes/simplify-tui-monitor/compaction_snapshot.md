# 🧠 Consolidado de Contexto de Alta Densidad (SDD Compaction)
**Fecha:** 2026-05-23
**Cambio:** `simplify-tui-monitor`
**Fase completada:** Fase 2 — Arquitectura y Planificación
**Subagente:** sdd-architect 📐

---

## 📋 Resumen del cambio

Simplificar `plugin/zugzbot-sdd/plugins/plugin_tui.tsx` de 424 → ~180 líneas:
- **Eliminar** subsistema de breakdown de costos/tokens (~120 líneas)
- **Reemplazar** funciones de mapeo por constantes inline
- **Comprimir** SDDMonitor con pipeline compacto de 1 línea
- **Simplificar** polling y getActiveAgentData

---

## 🏛️ Arquitectura post-simplificación

```
PluginTuiSidebar
├── loadLockfile()                  [sin cambios]
├── api.slots.register()
│   └── sidebar_content()
│       ├── lockState (signal)
│       ├── currentTime (signal)
│       ├── PHASE_ACTIONS (const)    [nuevo, reemplaza getDefaultAction]
│       ├── PHASE_AGENTS (const)     [nuevo, reemplaza getAgentForPhase]
│       ├── PHASE_NAMES/ICONS (const) [nuevo]
│       ├── getActiveAgentData()     [simplificado, usa PHASE_ACTIONS]
│       ├── Polling (solo lock+time) [simplificado]
│       ├── SDDMonitor()            [comprimido ~80 líneas]
│       └── Return (SDDMonitor + children)

🗑️ ELIMINADO: calculateBreakdown, collectSessionIds, extractAgentName,
   sumMetrics, truncateAgentName, hasMetricsChanged, SDDUsage,
   AgentMetricsRow, getDefaultAction, getAgentForPhase
```

---

## 📐 Especificaciones BDD (12 escenarios)

| ESC | Descripción | Archivo |
|-----|-------------|---------|
| 001 | Monitor inactivo sin lockfile | specs/spec.md |
| 002 | Pipeline muestra fases ✔/●/○ | specs/spec.md |
| 003 | Cambio de nombre y modo | specs/spec.md |
| 004 | Tarjeta agente activo (5 campos) | specs/spec.md |
| 005 | Estado de espera 🟡 | specs/spec.md |
| 006 | Siguiente paso (fase < 8) | specs/spec.md |
| 007 | Ciclo completado (fase 8) | specs/spec.md |
| 008 | Polling actualiza automáticamente | specs/spec.md |
| 009 | Cleanup al desmontar | specs/spec.md |
| 010 | Sin breakdown de sesión | specs/spec.md |
| 011 | Export y slots intactos | specs/spec.md |
| 012 | loadLockfile sigue funcionando | specs/spec.md |

---

## 📋 Checklist de tareas (13 tasks atómicas)

**Ubicación:** `orchestrator_tasks.md`

**Fase 1 — Poda (T1–T5):** Eliminar constantes, tipos, funciones de breakdown, estado
**Fase 2 — Compresión (T6–T10):** Simplificar polling, getActiveAgentData, SDDMonitor, return JSX
**Fase 3 — Verificación (T11–T13):** Export, line count, BDD validation

**Archivos de referencia:**
- Código fuente: `plugin/zugzbot-sdd/plugins/plugin_tui.tsx`
- Arquitectura: `orchestrator_architecture.md`
- Checklist: `orchestrator_tasks.md`
- Especificaciones: `specs/spec.md`

---

## 📊 Métricas

| Concepto | Original | Objetivo | % |
|----------|----------|----------|---|
| Líneas totales | 424 | ~180 | -57% |
| Funciones eliminadas | — | 10 | 100% |
| Componentes eliminados | — | 2 | 100% |
| Estado eliminado | — | 3 señales | 100% |
| SDDMonitor | ~138 líneas | ~80 líneas | -42% |

---

> [!TIP]
> **Para sdd-implementer 💻:** Lee `orchestrator_tasks.md` para la secuencia exacta de ediciones.
> Cada task referencia las líneas exactas del archivo original y los escenarios BDD que cubre.
> Orden sugerido: T1→T5 (una gran poda), T6→T7 (simplificaciones), T8 (corazón), T9→T10 (limpieza).
