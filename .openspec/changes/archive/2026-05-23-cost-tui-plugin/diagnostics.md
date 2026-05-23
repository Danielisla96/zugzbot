# Diagnóstico Inicial: Plugin TUI de Monitor de Costos

## 🎯 Objetivo
Desarrollar un plugin para el TUI de OpenCode que proporcione visibilidad en tiempo real sobre el consumo de tokens y los costos asociados, desglosados por agente y sesión.

## 🔍 Hallazgos de Integración

### 1. Fuentes de Datos (Telemetría)
Se han identificado los siguientes puntos críticos de integración en el sistema:

| Fuente | Ubicación / Endpoint | Propósito |
| --- | --- | --- |
| **Persistencia de Cuotas** | `~/.local/share/opencode/quota-sidebar-sessions/` | Archivos JSON diarios con desglose detallado de tokens (IN, OUT, Cache) y costo por sesión. |
| **Estado de Cuotas** | `~/.local/share/opencode/quota-sidebar.state.json` | Mapeo global de sesiones a fechas para localización rápida de datos. |
| **SDK de OpenCode** | `/session/:id` | Obtención de metadatos de sesión para vincular IDs con nombres de agentes amigables. |
| **Eventos SSE** | `/global/event` | Suscripción a `session.updated` para actualizaciones de costo en vivo sin polling excesivo. |

### 2. Estructura de Datos (Esquema Detectado)
El objeto de telemetría detectado en el core de OpenCode sigue este patrón:
```json
"usage": {
  "input": number,
  "output": number,
  "cacheRead": number,
  "cost": number,
  "apiCost": number,
  "assistantMessages": number,
  "providers": {
    "google": { ... }
  }
}
```

## 🏗️ Propuesta Arquitectónica TUI

### Componentes Visuales
1. **CostSummaryPanel**: Widget en el sidebar que muestra el costo total acumulado del día.
2. **AgentCostList**: Desglose detallado:
   - **Nombre**: @agente (ej: @sdd-architect)
   - **Tokens**: In: XX / Out: XX
   - **Costo**: $X.XXXX
3. **SessionDetailView**: (Opcional) Al seleccionar una sesión, mostrar el historial de consumo.

### Flujo de Datos
1. El plugin se inicializa y carga el estado inicial desde `quota-sidebar-sessions`.
2. Se registra un listener en `session.updated`.
3. Al recibir un evento, se re-escanea el archivo de cuota del día actual.
4. La señal de SolidJS se actualiza, refrescando la interfaz TUI de forma reactiva.

## 🛠️ Requerimientos Técnicos
- **Ecosistema**: SolidJS + OpenTUI.
- **Permisos**: Acceso de lectura a `~/.local/share/opencode/`.
- **Integración**: Registro de slot en `sidebar_content`.

## ⚠️ Riesgos Identificados
- **Acoplamiento**: El formato de los archivos JSON en `~/.local/share/opencode/` es interno. Se recomienda envolver el acceso en una capa de abstracción (`lib/reader.ts`).
- **Performance**: El parseo frecuente de archivos JSON grandes (si hay cientos de sesiones) podría causar lag en el TUI. Se requiere una estrategia de caché eficiente.
