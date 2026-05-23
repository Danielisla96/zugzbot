# Documentación Técnica: Visual SDD Status Monitor

## Descripción
Este componente proporciona una interfaz visual en el TUI (Terminal User Interface) para monitorear el progreso del ciclo Spec-Driven Development (SDD) en tiempo real. 

## Componentes Clave

### 1. `SDDMiniMonitor`
Componente reactivo de SolidJS que renderiza:
- **Phase Display**: El número y nombre acortado de la fase actual.
- **Agent Badge**: El subagente que tiene el control en el momento.
- **Status Indicator**: Colorización según el estado (in_progress, success, corrective_loop).

### 2. `Mascot Refactor`
La mascota "Zugz" ha sido actualizada para ser el punto de anclaje visual del estado. Su comportamiento (animaciones o indicadores adyacentes) ahora está vinculado a la señal global de SDD.

### 3. Mecanismo de Sincronización
- **Polling**: Se ejecuta un `setInterval` cada 2000ms.
- **Fuente de Verdad**: Lee directamente el archivo `.openspec/sdd-lock.json`.
- **Reactividad**: Utiliza una señal `createSignal` de SolidJS para propagar cambios a través de la UI sin necesidad de renderizados pesados.

## Especificaciones de Diseño
- **Ancho Máximo**: 37 caracteres (optimizado para el Sidebar del TUI).
- **Tipado**: Interfaz `SDDState` definida para asegurar la integridad de los datos leídos del JSON.

## Archivos Involucrados
- `zugz-plugin/plugins/plugin_tui.tsx`: Implementación de los componentes y la lógica de polling.
- `.openspec/sdd-lock.json`: Archivo de estado observado.
