# Checklist de Tareas: Actualización de Colores ASCII

## Hito B: Implementación
- [x] Modificar `install-plugin.sh` para cambiar el color del primer bloque ASCII.
    - Cambiar `${COLOR_HEADER}` por `${COLOR_ERROR}` en la línea 15.
- [x] Modificar `install-plugin.sh` para cambiar el color del segundo bloque ASCII.
    - Cambiar `${COLOR_MAGENTA}` por `${COLOR_WARNING}` en la línea 21.

## Hito C: Verificación y QA
- [x] Ejecutar el script localmente para verificar visualmente los colores: `./install-plugin.sh` (Nota: Se puede interrumpir tras ver el arte ASCII).
- [x] Validar que el resto de los mensajes (Éxito, Error, Advertencia) sigan usando sus colores respectivos correctamente.
