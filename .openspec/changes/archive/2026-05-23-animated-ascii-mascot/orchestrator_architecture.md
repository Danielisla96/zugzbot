# Arquitectura: Animated ASCII Mascot

## Flujo de Datos
```mermaid
graph TD
    TUI[Plugin TUI Sidebar] --> Signal[Frame Signal: 0 | 1]
    Signal --> MascotUI[Mascot ASCII Component]
    Timer[Interval Timer] -->|Toggle Frame| Signal
    MascotUI -->|Render| Terminal
```

## Estructura de Componentes
- **PluginTuiSidebar**: Componente principal que gestiona el estado global de la barra lateral.
- **MascotComponent**: (Opcional o inlined) Se encarga de mapear el estado del frame al string ASCII correspondiente.

## Integración
Se insertará dentro del `box` principal de `sidebar_content` en `plugin_tui.tsx`.
