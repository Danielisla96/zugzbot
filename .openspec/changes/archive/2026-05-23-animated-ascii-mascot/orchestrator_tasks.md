# Checklist de Implementación: Animated ASCII Mascot

- [x] **Fase 3: Configuración e Importaciones**
    - [x] Verificar disponibilidad de `createSignal` y `onCleanup` en `plugin_tui.tsx`.

- [x] **Fase 4: Lógica de Animación**
    - [x] Crear signal `mascotFrame` con valor inicial 0.
    - [x] Implementar un `setInterval` que cambie `mascotFrame` a 1 y, tras un breve `setTimeout` de 200ms, lo devuelva a 0.
    - [x] Limpiar el intervalo en `onCleanup`.

- [x] **Fase 5: Interfaz de Usuario (UI)**
    - [x] Definir el string ASCII dinámico basado en `mascotFrame`.
    - [x] Insertar un componente `<box>` o `<text>` con el ASCII antes del "Monitor de Agentes".
    - [x] Aplicar color `api.theme.current.accent` a la mascota.

- [x] **Fase 6: Validación**
    - [x] Verificar visualmente la animación en el TUI.
    - [x] Confirmar que no hay errores de renderizado en la consola si estuviera disponible.
