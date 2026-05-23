# Propuesta Técnica: Simplificación del Monitor TUI SDD

## 1. Resumen Ejecutivo

Se propone la reducción del plugin `plugin_tui.tsx` de 424 → ~180 líneas (57% de reducción) mediante la eliminación del subsistema de métricas de sesión por agente y la compresión de los componentes visuales del pipeline SDD. El resultado será un monitor enfocado exclusivamente en el estado del ciclo SDD, más legible y mantenible.

## 2. Motivación

### 2.1 Complejidad innecesaria
El plugin actual implementa un subsistema completo de contabilidad de costos y tokens (`calculateBreakdown`, `collectSessionIds`, `extractAgentName`, `sumMetrics`, `truncateAgentName`, `hasMetricsChanged`) que representa ~120 líneas de lógica. Este subsistema:
- Consume la API interna de sesiones de OpenCode de forma recursiva.
- Mantiene estado colapsable y detección de cambios.
- Requiere procesamiento en cada ciclo de polling (1s).
- No aporta valor al propósito central del monitor: visualizar el progreso del pipeline SDD.

### 2.2 Duplicación y verbosidad
- `getDefaultAction` y `getAgentForPhase` son mapeos estáticos que pueden colapsarse como constantes o inlines.
- El componente `SDDMonitor` (~138 líneas) renderiza un pipeline visual con 9 fases, una tarjeta de agente con borde doble, y previsualización del siguiente paso — todo comprimible sin pérdida semántica.
- `getActiveAgentData` puede simplificarse integrando su lógica inline en `SDDMonitor`.

### 2.3 Deuda técnica
El polling de 1 segundo realiza dos tareas: refrescar el lockfile y recalcular métricas. Separar estas responsabilidades permite un polling más liviano y enfocado.

## 3. Alcance de la simplificación

### 3.1 Eliminación total
| Elemento | Líneas | Justificación |
|----------|--------|---------------|
| `calculateBreakdown` | 37 | Lógica orquestadora del breakdown |
| `collectSessionIds` | 8 | Recursión innecesaria de sessions |
| `extractAgentName` | 10 | Solo usado por breakdown |
| `sumMetrics` | 11 | Solo usado por breakdown |
| `truncateAgentName` | 5 | Solo usado por breakdown |
| `hasMetricsChanged` | 6 | Optimización de rendimiento del breakdown |
| `AgentMetricsRow` | 12 | Componente render de breakdown |
| `SDDUsage` | 28 | Panel colapsable de breakdown |
| `getDefaultAction` | 12 | Reemplazable por constante inline |
| `getAgentForPhase` | 14 | Reemplazable por constante inline |
| Estado breakdown (`breakdownState`, `showBreakdown`, `previousBreakdown`) | 4 | Estado eliminado |

### 3.2 Compresión
| Elemento | Actual | Objetivo | Técnica |
|----------|--------|----------|---------|
| `SDDMonitor` | ~138 | ~90 | Pipeline más compacto, tarjeta simplificada |
| `getActiveAgentData` | ~19 | ~12 | Lógica inline dentro del componente |
| Polling + cleanup | ~12 | ~8 | Solo refresco de lockfile + timestamp |
| Infraestructura (imports, loadLockfile, slot, export) | ~121 | ~70 | Sin cambios funcionales |

### 3.3 Conservación
- ✅ Imports (`TuiPlugin`, `createSignal`, `onCleanup`, `fs`, `path`)
- ✅ `loadLockfile()` (lectura de sdd-lock.json)
- ✅ Estructura de slots (`api.slots.register`)
- ✅ Polling básico (refresco de lockfile y timestamp)
- ✅ Componente `SDDMonitor` (versión comprimida)
- ✅ `getActiveAgentData` (versión inline/compacta)
- ✅ Export del módulo

## 4. Arquitectura post-simplificación

```
PluginTuiSidebar (fn principal)
├── loadLockfile()
└── api.slots.register()
    └── sidebar_content()
        ├── createSignal(lockState)
        ├── createSignal(currentTime)
        ├── getActiveAgentData()  [simplificado/inline]
        ├── Polling (solo lockfile + timestamp)
        ├── onCleanup()
        └── SDDMonitor() [comprimido]
            ├── Header (cambio, modo)
            ├── Pipeline flow (9 fases)
            └── Active agent card + next step
```

## 5. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Pérdida de funcionalidad de métricas | Alta (intencional) | Las métricas de sesión no son críticas; el monitor sigue mostrando estado del pipeline |
| Rotura de API de OpenCode en `getActiveAgentData` | Baja | Se mantiene la misma API (`fs`, `path`, `JSON.parse`) |
| Regresión visual en pipeline | Media | Los escenarios BDD especifican el comportamiento visual exacto |
| Sidebar no renderiza | Baja | La estructura de slots y export se conserva intacta |

## 6. Criterios de éxito

1. El archivo resultante tiene ~180 líneas (±20).
2. Todas las funciones eliminadas no tienen dependencias externas al plugin.
3. El monitor muestra el pipeline SDD correctamente (fases, agente activo, tiempo).
4. El polling refresca el estado del lockfile en tiempo real.
5. El componente se limpia correctamente al desmontarse.
6. Los tests BDD existentes (o futuros) pasan sin errores.
