# Especificación: Actualización de Colores ASCII

Este documento describe el comportamiento esperado del arte ASCII en el script de instalación tras la actualización de colores.

## Escenario: Visualización de Arte ASCII con nuevos colores
**Given** que el usuario ejecuta el script `install-plugin.sh`
**When** el script muestra la cabecera de bienvenida
**Then** la primera parte del arte ASCII ("ZUGZ" superior) debe mostrarse en color Rojo (`\033[1;31m`)
**And** la segunda parte del arte ASCII ("ZUGZ" inferior) debe mostrarse en color Amarillo (`\033[1;33m`)

## Verificación Técnica
- La línea 15 debe usar la variable `${COLOR_ERROR}`.
- La línea 21 debe usar la variable `${COLOR_WARNING}`.
- No deben alterarse las variables de color originales en las definiciones (líneas 6-13) para no afectar otros mensajes del script.
