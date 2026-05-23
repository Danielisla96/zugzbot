# Propuesta Técnica: Actualización de Colores del Arte ASCII en install-plugin.sh

## Problema
El instalador del plugin `install-plugin.sh` utiliza actualmente colores Cyan y Magenta para el arte ASCII de cabecera ("ZUGZ"). Se requiere actualizar estos colores a Rojo y Amarillo para alinearse con la nueva identidad visual o preferencias del proyecto.

## Solución Propuesta
Modificar el script `install-plugin.sh` para reemplazar las referencias de color en la sección del arte ASCII.

### Cambios Identificados
1. **Fase de Diagnóstico**: Se identificó que el arte ASCII se imprime en dos bloques (líneas 15-20 y 21-26).
2. **Actualización de Variables**:
   - Bloque superior: Cambiar `${COLOR_HEADER}` por `${COLOR_ERROR}` (Rojo).
   - Bloque inferior: Cambiar `${COLOR_MAGENTA}` por `${COLOR_WARNING}` (Amarillo).
3. **Alternativa (Recomendada)**: Para mantener la semántica limpia, se recomienda usar las variables `COLOR_ERROR` y `COLOR_WARNING` que ya contienen los códigos ANSI para Rojo y Amarillo respectivamente, o definir nuevas variables si se desea desacoplar el arte de los estados de error/advertencia. Optaremos por usar las variables existentes para minimizar cambios en las definiciones.

## Impacto
- El cambio es puramente estético y no afecta la funcionalidad de instalación del script.
- Mejora la coherencia visual según los nuevos requerimientos.

## Riesgos
- Ninguno identificado. El cambio es en un script de shell y utiliza códigos de escape ANSI estándar.
