# Propuesta Técnica: Actualización Estética de Arte ASCII

**ID del Cambio:** `update-ascii-color`
**Autor:** `sdd-architect` 📐

## 1. Problema / Oportunidad
El script `install-plugin.sh` actualmente utiliza un color Cian estándar para el arte ASCII "ZUGZ". Se busca elevar la estética visual del instalador utilizando colores más vibrantes o degradados que se alineen con una estética "premium".

## 2. Diagnóstico Actual
- **Archivo:** `install-plugin.sh`
- **Variable de color actual:** `COLOR_HEADER="\033[1;36m"` (Cian Negrita).
- **Estructura:** El arte ASCII es un bloque de texto fijo impreso mediante un *here-doc*.

## 3. Propuesta de Solución
Se propone reemplazar el color monocromático Cian por un esquema de colores Magenta o un degradado bitonal.

### Opción A: Magenta Premium
Cambiar el color base a Magenta Negrita (`\033[1;35m`).

### Opción B: Degradado Bitonal (Recomendada)
Dividir la impresión del arte ASCII en dos partes:
- Líneas superiores: Cian (`\033[1;36m`).
- Líneas inferiores: Magenta (`\033[1;35m`).

Esto crea un efecto visual de transición sin requerir dependencias externas de degradado de shell complejas.

## 4. Impacto
- **Riesgo:** Nulo. Solo afecta la salida visual por consola.
- **Archivos afectados:** `install-plugin.sh`.
