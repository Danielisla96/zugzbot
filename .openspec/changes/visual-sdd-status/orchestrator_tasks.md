# Checklist Técnico: Visual SDD Status

Este documento detalla las tareas necesarias para implementar el monitor visual del ciclo SDD en el TUI.

## Hito B: Integración de Datos y Estado (Fase 3)
- [x] **B.1: Tipado de Datos SDD**
    - Definir `interface SDDLock` en `plugin_tui.tsx` coincidente con el esquema de `.openspec/sdd-lock.json`.
- [x] **B.2: Señal y Polling Reactivo**
    - Implementar `createSignal<SDDLock | null>` para el estado del ciclo.
    - Implementar `setInterval` (2000ms) para lectura del archivo `.openspec/sdd-lock.json`.
    - *Nota*: Usar `fs.readFileSync` si está disponible o la API de archivos de OpenCode si el plugin corre en un entorno restringido.

## Hito C: Componentes Visuales y UI (Fase 4)
- [x] **C.1: Refactor de Mascota "Zugz"**
    - Modificar la función `mascotAscii` para reaccionar al `active_subagent` y `status`.
    - Implementar ojos `[*_*]` cuando el subagente está trabajando.
    - Mostrar el texto "Working on: {subagent}" truncado si es necesario.
- [x] **C.2: Monitor de Fase SDD**
    - Crear componente `SDDMiniMonitor` que renderice:
        - Nombre de la fase actual.
        - Barra de progreso ASCII de 10 segmentos: `[■■□□□□□□□□]`.
    - Implementar lógica de color dinámico por fase (Violeta, Azul, Amarillo, Verde).
- [x] **C.3: Ajuste de Layout y Limites (37 chars)**
    - Integrar el nuevo bloque en el sidebar por encima del Monitor de Agentes.
    - Validar que ninguna línea exceda los 37 caracteres.
    - Ajustar separadores visuales `───`.

## Hito D: Verificación y QA (Fase 5)
- [x] **D.1: Test de Reactividad**
    - Verificar que el TUI se actualiza automáticamente al cambiar el `sdd-lock.json`.
- [x] **D.2: Auditoría Visual (sdd-ux-premium)**
    - Ejecutar `sdd_ui_auditor` para asegurar consistencia estética y espaciado.

## Hito E: Corrección de Límites Visuales (Bucle Correctivo)
- [x] **E.1: Acortar Nombres de Fases**
    - Modificar `getPhaseName` en `plugin_tui.tsx`.
    - Asegurar que ningún nombre exceda los 35 caracteres (37 con corchetes).
    - Nuevos nombres propuestos:
        - 0: "Fase 0: Inicialización"
        - 1: "Fase 1: Planificación"
        - 2: "Fase 2: Arquitectura y Plan"
        - 3: "Fase 3: Implementación"
        - 4: "Fase 4: Diseño Visual"
        - 5: "Fase 5: Pruebas y QA"
        - 6: "Fase 6: Documentación"
        - 7: "Fase 7: Despliegue"
        - 8: "Fase 8: Mantenimiento"
- [x] **E.2: Validación Final de Ancho**
    - Verificar manualmente o vía script que la Fase 2 (la más larga anteriormente) ahora mide <= 37 chars con corchetes.
