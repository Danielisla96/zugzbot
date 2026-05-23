# Compaction Snapshot - Agent Monitor Sidebar Plugin (Fase 2: Simplificación)

## Contexto Actual
- **Problema**: El plugin carga pero muestra "Saludo inicial" (placeholder desconocido) en lugar de la UI real.
- **Estado**: `change_name` sincronizado a `agent-monitor-sidebar-plugin` en `sdd-lock.json`.
- **Decisión Arquitectónica**: Implementar un "Hello World" dinámico para validar la cadena de renderizado y reactividad antes de restaurar la lógica compleja.

## Decisiones Técnicas
1. **Slot**: Mantener `sidebar_content`.
2. **Prioridad**: Bajar `SLOT_ORDER_SIDEBAR` de 150 a 50 para asegurar que aparezca en la parte superior.
3. **Simplificación**: Reducir `SidebarPanel.ts` a un saludo básico reactivo.
4. **ID**: Forzar el uso de `zugzbot-sdd` en toda la configuración.

## Checklist Resumido (Fase 2)
- Simplificar componente TUI.
- Ajustar orden de slot.
- Validar reactividad con señal de SolidJS.
- Confirmar visibilidad en sidebar.
