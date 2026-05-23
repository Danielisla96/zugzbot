# Especificaciones: Logo ASCII "zugz"

Este documento define el comportamiento esperado tras la inclusión del branding visual en el instalador.

## Escenario: Mostrar el logo al iniciar la instalación
**Given** que el usuario ejecuta el script `./install-plugin.sh`
**When** el script comienza su ejecución
**Then** se debe imprimir el arte ASCII de "zugz" en la terminal
**And** el color del logo debe ser cian brillante (`COLOR_HEADER`)
**And** el logo debe aparecer antes del recuadro de "Zugzbot SDD Plugin Installer"

## Escenario: Compatibilidad de caracteres
**Given** una terminal estándar (xterm o similar)
**When** se visualiza el logo
**Then** las líneas deben estar alineadas correctamente
**And** no deben aparecer caracteres de escape rotos o secuencias sin interpretar
