# SDD Brain - Memoria Técnica

Este archivo contiene lecciones aprendidas, patrones detectados y soluciones a problemas recurrentes durante los ciclos SDD.

## Lecciones Técnicas

### 2026-05-23: Animaciones en OpenCode TUI
- **Contexto**: Implementación de la mascota animada.
- **Lección**: Para animaciones simples en la TUI, usar `setInterval` junto con un `setTimeout` interno para alternar frames de forma rápida (ej. parpadeo de 200ms) es efectivo y no genera carga perceptible si el intervalo base es razonable (3s+).
- **Importante**: Siempre registrar el `onCleanup` para limpiar los intervalos, de lo contrario, el TUI podría acumular timers si el componente se re-renderiza o el plugin se recarga.
