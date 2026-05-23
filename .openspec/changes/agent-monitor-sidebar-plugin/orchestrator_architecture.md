# Arquitectura del Orquestador: Agent Monitor Plugin

## Visión General
El plugin utiliza una arquitectura desacoplada donde el `Server Hook` actúa como el observador del sistema y el `TUI Component` como el consumidor reactivo.

## Diagrama de Arquitectura (Mermaid)

```mermaid
graph LR
    subgraph OpenCode Core
        Events[Event Bus]
        Session[Session State]
    end

    subgraph Plugin Backend (index.ts)
        Hook[Plugin Hook]
        Store[Local State Manager]
    end

    subgraph Plugin Frontend (tui.ts)
        Sidebar[Sidebar Component]
        Status[Status Bar Component]
    end

    Events -->|session.status / session.updated| Hook
    Hook --> Store
    Store -->|Reactive Update| Sidebar
    Store -->|Reactive Update| Status
    Session -->|Context| Sidebar
```

## Flujo de Datos
1. **Captura**: El hook de servidor escucha eventos de `session` y `todo`.
2. **Procesamiento**: Los datos crudos se normalizan para ajustarse a la interfaz de usuario (ej: mapear IDs de modelos a nombres legibles).
3. **Distribución**: Se utiliza el bus de datos interno de OpenCode (o un store compartido en memoria si es local) para notificar a los componentes de SolidJS.
4. **Renderizado**: Los componentes en `sdd-plugin/components/` reaccionan al cambio de estado y actualizan el DOM de la terminal.
