# Checklist Técnico: Visual SDD Status

Este documento detalla las tareas necesarias para implementar el monitor visual del ciclo SDD en el TUI.

## Hito B: Integración de Datos y Estado (Fase 3)
- [ ] **B.1: Tipado de Datos SDD**
    - Definir `interface SDDLock` en `plugin_tui.tsx` coincidente con el esquema de `.openspec/sdd-lock.json`.
- [ ] **B.2: Señal y Polling Reactivo**
    - Implementar `createSignal<SDDLock | null>` para el estado del ciclo.
    - Implementar `setInterval` (2000ms) para lectura del archivo `.openspec/sdd-lock.json`.
    - *Nota*: Usar `fs.readFileSync` si está disponible o la API de archivos de OpenCode si el plugin corre en un entorno restringido.

## Hito C: Componentes Visuales y UI (Fase 4)
- [ ] **C.1: Refactor de Mascota "Zugz"**
    - Modificar la función `mascotAscii` para reaccionar al `active_subagent` y `status`.
    - Implementar ojos `[*_*]` cuando el subagente está trabajando.
    - Mostrar el texto "Working on: {subagent}" truncado si es necesario.
- [ ] **C.2: Monitor de Fase SDD**
    - Crear componente `SDDMiniMonitor` que renderice:
        - Nombre de la fase actual.
        - Barra de progreso ASCII de 10 segmentos: `[■■□□□□□□□□]`.
    - Implementar lógica de color dinámico por fase (Violeta, Azul, Amarillo, Verde).
- [ ] **C.3: Ajuste de Layout y Limites (37 chars)**
    - Integrar el nuevo bloque en el sidebar por encima del Monitor de Agentes.
    - Validar que ninguna línea exceda los 37 caracteres.
    - Ajustar separadores visuales `───`.

## Hito D: Verificación y QA (Fase 5)
- [ ] **D.1: Test de Reactividad**
    - Verificar que el TUI se actualiza automáticamente al cambiar el `sdd-lock.json`.
- [ ] **D.2: Auditoría Visual (sdd-ux-premium)**
    - Ejecutar `sdd_ui_auditor` para asegurar consistencia estética y espaciado.
