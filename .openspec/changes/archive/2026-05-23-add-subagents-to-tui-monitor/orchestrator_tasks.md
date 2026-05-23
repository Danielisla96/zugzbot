# Checklist de Tareas: Monitoreo de Subagentes

## Fase 3: Implementación (Preparación)

- [x] **Refactor de Recolección de Datos**
    - [x] Hacer `collectSessionIds` recursivo para capturar sub-sub-sesiones.
    - [x] Modificar `getMetrics` para identificar si un mensaje proviene de un subagente (comparando con el `sessionId` principal).
- [x] **Actualización de Tipos e Interfaces**
    - [x] Actualizar `AgentMetrics` para incluir `isSubagent: boolean`.
- [x] **Mejora de la Interfaz (UI)**
    - [x] Implementar identación visual para subagentes en el loop de renderizado.
    - [x] Añadir prefijo ASCII `└─ ` para subagentes.
    - [x] Asegurar que el `Total:` siga sumando todos los costos correctamente.

## Fase 4: Verificación

- [x] Verificar que la mascota ASCII sigue funcionando y no se rompió el layout.
- [x] Comprobar que los costos se formatean correctamente con `formatTokens`.
- [x] Validar en el TUI real (manual) la aparición de subagentes al disparar una tarea compleja.
