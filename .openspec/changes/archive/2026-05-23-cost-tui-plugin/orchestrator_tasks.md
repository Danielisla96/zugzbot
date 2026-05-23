# Checklist de Implementación: CostMonitor Plugin

## 🛠️ Fase A: Preparación y Estructura
- [x] Crear el directorio del plugin: `plugin/cost-monitor/`
- [x] Crear subdirectorios: `lib/`, `components/`
- [x] Configurar el archivo `plugin.json` básico para el nuevo plugin (o integrar en el existente).

## 📊 Fase B: Lógica de Telemetría (Capa de Datos)
- [x] Implementar `plugin/cost-monitor/lib/paths.ts` para resolver rutas de `~/.local/share/opencode/`.
- [x] Implementar `plugin/cost-monitor/lib/reader.ts` para leer y parsear los archivos JSON de cuotas.
- [x] Implementar lógica de agregación en `lib/aggregator.ts` para agrupar costos por nombre de agente extraído del título de sesión.

## 🔄 Fase C: Gestión de Estado Reactivo
- [x] Crear `plugin/cost-monitor/lib/state.ts` usando SolidJS.
- [x] Implementar el hook `useCostResource` que realice la lectura inicial y se suscriba a eventos `session.updated`.

## 🎨 Fase D: Componentes TUI (Interfaz)
- [x] Crear `plugin/cost-monitor/components/AgentCostItem.ts` para mostrar la fila de cada agente.
- [x] Crear `plugin/cost-monitor/components/CostSidebarPanel.ts` como contenedor principal del sidebar.
- [x] Crear `plugin/cost-monitor/components/SummaryWidget.ts` para visualización compacta.

## 🔌 Fase E: Integración y Registro
- [x] Registrar los slots en `plugin/cost-monitor/tui.ts`:
    - Slot `sidebar_content` -> `CostSidebarPanel`
    - Slot `home_bottom` -> `SummaryWidget`
- [x] Exportar el plugin en el punto de entrada principal.

## 🧪 Fase F: Verificación
- [x] Verificar que el costo se muestra correctamente en el sidebar.
- [x] Confirmar que el costo se actualiza tras un mensaje de IA.
- [x] Validar que los costos persistentes del día anterior (o temprano en el día) se cargan correctamente.
