# Arquitectura de la Solución: update-ascii-color

## Diagrama de Flujo de Impresión

```mermaid
graph TD
    A[Inicio install-plugin.sh] --> B[Definir Variables de Color]
    B --> C[Definir COLOR_MAGENTA]
    C --> D[Imprimir Líneas 1-3 del ASCII en COLOR_HEADER]
    D --> E[Imprimir Líneas 4-6 del ASCII en COLOR_MAGENTA]
    E --> F[Restaurar Color NC]
    F --> G[Continuar con el resto del script]
```

## Cambios Técnicos
1. **Definiciones:** Añadir `COLOR_MAGENTA="\033[1;35m"`.
2. **Lógica de Impresión:** Reemplazar el bloque `cat << "EOF"` por dos bloques separados o comandos `echo` individuales para controlar el color por línea.
