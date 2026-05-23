# Propuesta Técnica: Monitor de Costos TUI (CostMonitor)

## 📋 Resumen
Este plugin añade una capa de observabilidad económica al TUI de OpenCode, permitiendo a los usuarios monitorear el gasto de tokens y el costo monetario de sus interacciones con IA de forma detallada y por agente.

## 🛠️ Detalles de Implementación

### 1. Integración con el Sistema de Slots
Se registrarán los siguientes slots:
- `sidebar_content`: Para el panel principal de costos.
- `home_bottom`: Para mostrar un resumen rápido (Costo Total Hoy) en la pantalla de inicio.

### 2. Gestión de Estado
Se creará un `useCostResource` similar al `useSddResource` existente:
- **Polling/Watcher**: Observará cambios en `~/.local/share/opencode/quota-sidebar-sessions/`.
- **Agregación**: Sumará los costos de todas las sesiones activas del día.
- **Filtrado por Agente**: Analizará los títulos de las sesiones para agrupar costos por nombre de agente (ej: `@sdd-architect`, `@general`).

### 3. Interfaz de Usuario (TUI)
Utilizando `@opentui/solid`:
- **Estética**: Diseño minimalista alineado con el tema de OpenCode.
- **Interactividad**: Secciones colapsables para "Hoy", "Por Agente" y "Sesiones Recientes".
- **Colores**: Uso de colores semánticos (warning para costos altos, success para consumos bajos).

## 📊 Especificaciones Técnicas
- **Lenguaje**: TypeScript.
- **Framework UI**: SolidJS (renderizado en TUI).
- **Librería TUI**: `@opentui/core`.

## 🚀 Plan de Despliegue
1. Creación de la estructura de archivos en `plugin/cost-monitor/`.
2. Implementación de los lectores de telemetría (`lib/telemetry-reader.ts`).
3. Creación de los componentes de UI (`components/CostPanel.ts`).
4. Registro del plugin en `plugin/index.js` (o similar).
