# SDD Brain - Memoria Técnica

Este archivo contiene lecciones aprendidas, patrones detectados y soluciones a problemas recurrentes durante los ciclos SDD.

## Lecciones Técnicas

### 2026-05-23: Animaciones en OpenCode TUI
- **Contexto**: Implementación de la mascota animada.
- **Lección**: Para animaciones simples en la TUI, usar `setInterval` junto con un `setTimeout` interno para alternar frames de forma rápida (ej. parpadeo de 200ms) es efectivo y no genera carga perceptible si el intervalo base es razonable (3s+).
- **Importante**: Siempre registrar el `onCleanup` para limpiar los intervalos, de lo contrario, el TUI podría acumular timers si el componente se re-renderiza o el plugin se recarga.

### 2026-05-23: Monitoreo Recursivo de Subagentes
- **Contexto**: Seguimiento de costos en arquitecturas multi-agente.
- **Lección**: El API de sesión de OpenCode organiza sub-sesiones en una estructura de árbol. Para obtener el costo total real de una tarea compleja, es imperativo realizar una búsqueda recursiva (`DFS`) sobre los IDs de sesión hijos, ya que los subagentes pueden invocar a sus propios subagentes (sub-sub-sesiones).
- **Patrón**: `api.state.session.children(sid)` devuelve los hijos directos. Una función recursiva con un `Set` para evitar ciclos es el patrón recomendado.

