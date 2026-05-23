# Propuesta Técnica: Branding ASCII Art para `install-plugin.sh`

## 1. Motivación
Mejorar la identidad visual del instalador de plugins de Zugzbot mediante la inclusión de un logo en arte ASCII al inicio de la ejecución.

## 2. Diagnóstico
- **Archivo destino**: `install-plugin.sh`
- **Lenguaje**: Bash (`set -euo pipefail`)
- **Estética actual**: Usa bordes ANSI y colores premium.

## 3. Propuesta
- Insertar un bloque ASCII art de "zugz" antes del encabezado actual.
- Utilizar `cat << "EOF"` (heredoc) para facilitar la edición y mantenimiento del arte.
- Aplicar el color `COLOR_HEADER` (Cian) al logo.
- Asegurar que la indentación sea consistente con el resto del script.

## 4. Diseño del Logo (Borrador)
```text
  ______  _    _  _____  ______ 
 |___  / | |  | |/ ____||___  / 
    / /  | |  | | |  __    / /  
   / /   | |  | | | |_ |  / /   
  / /__  | |__| | |__| | / /__  
 /_____|  \____/ \_____|/_____| 
```

## 5. Riesgos y Mitigaciones
- **Compatibilidad**: Algunos shells no manejan bien ciertos caracteres. Se usará un heredoc con comillas para evitar expansiones no deseadas.
- **Ruido visual**: El logo debe ser lo suficientemente compacto para no desplazar la información importante fuera de la pantalla inicial.
