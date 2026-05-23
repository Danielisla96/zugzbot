# Checklist Técnico: Implementación de Agent Monitor

## Fase Correctiva (Simplificación Extrema) 🧪 (Prioridad Crítica)
- [x] **Limpieza de Componente TUI**: Simplificar `SidebarPanel.ts` para renderizar únicamente un saludo dinámico "¡Hola desde Zugzbot SDD!".
- [x] **Verificación de Reactividad**: Usar un `createSignal` o similar para asegurar que el contenido puede cambiar.
- [x] **Ajuste de Posicionamiento**: Cambiar `SLOT_ORDER_SIDEBAR` a un valor que garantice visibilidad prioritaria (ej: `50` o `10`).
- [x] **Sincronización de Identidad**: Asegurar que `package.json` y `tui.ts` usen consistentemente el ID `zugzbot-sdd`.
- [x] **Corrección de Lockfile**: Actualizar `change_name` en `.openspec/sdd-lock.json` a `agent-monitor-sidebar-plugin` para habilitar la carga de metadatos reales.

## Fase Correctiva: Identidad y Visibilidad 🕵️‍♂️ (Prioridad Alta)
- [x] **Estandarización de Directorio**: Renombrar el directorio `./plugin` a `./zugzbot-sdd` para evitar ambigüedades y conflictos con nombres genéricos.
- [x] **Corrección de Metadatos en `package.json`**:
    - [x] Agregar `"displayName": "Zugzbot SDD Monitor"`.
    - [x] Integrar campos de `plugin.json` (publisher, version) y eliminar `plugin.json`.
- [x] **Ajuste de Carga y Registro**:
    - [x] Actualizar `opencode.json` con el nuevo path: `"plugin": ["./zugzbot-sdd"]`.
- [x] **Reparación de Entry Points y Exports**:
    - [x] Definir explícitamente `"./server": "./index.js"` en los `exports` de `package.json`.
    - [x] Asegurar que `oc-plugin` contenga `["server", "tui"]` en ese orden.
- [x] **Sincronización de TUI**:
    - [x] Cambiar el `id` interno en `tui.ts` a `zugzbot-sdd`.
    - [x] Ajustar `SLOT_ORDER_SIDEBAR` a `150` para consistencia con el estándar de la plataforma.
- [x] **Validación Final**:
    - [x] Confirmar que el plugin carga con su nombre real en el log de inicio.
    - [x] Verificar visualmente la presencia del panel en el sidebar.

## Fase 1: Configuración y Registro 🛠️
- [x] Registrar el plugin en `opencode.json` usando `"plugin": ["./plugin"]`. (Completado: plugin registrado con éxito)
- [x] Actualizar `plugin/package.json` para incluir el punto de entrada `"server"`. (Completado: server agregado a oc-plugin)
- [x] Asegurar que las dependencias de `solid-js` y `@opentui` coincidan con versiones estables (auditoría de cooldown). (Completado: versiones 0.2.14 aprobadas por cooldown)

## Fase 2: Lógica de Servidor (Hooks) 🧠
- [x] Implementar la función `Plugin` en `plugin/index.ts`. (Completado: implementada en plugin/index.js)
- [x] Suscribirse al hook `session.status` para trackear estados (idle, busy, thinking). (Completado: hook suscrito y registrado)
- [x] Suscribirse al hook `session.updated` para capturar metadatos del agente activo. (Completado: hook suscrito y registrado)
- [x] Suscribirse al hook `todo.updated` para sincronizar el checklist de tareas. (Completado: hook suscrito y registrado)

## Fase 3: Interfaz de Usuario (TUI) 🎨
- [x] Refactorizar `plugin/sdd-plugin/tui.ts` para consumir datos dinámicos en lugar de placeholders. (Completado: consume useSddResource de forma reactiva)
- [x] Implementar el componente `SidebarPanel` para mostrar la lista de agentes activos. (Completado: panel modular interactivo implementado)
- [x] Implementar `TaskChecklist` con soporte para actualizaciones en tiempo real. (Completado: renderiza secciones colapsables y checklist en tiempo real)
- [x] Aplicar estilos premium siguiendo `sdd-ux-premium` (colores, bordes y espaciado). (Completado: refinado con iconos Unicode, colores fluidos del tema de OpenCode y layouts colapsables consistentes)

## Fase 4: Pruebas y Validación 🧪
- [x] Verificar la carga del plugin en una sesión real de OpenCode.
- [x] Validar que los cambios de estado del agente se reflejen en < 100ms en el sidebar.
- [x] Probar el comportamiento con múltiples subagentes corriendo en paralelo.
