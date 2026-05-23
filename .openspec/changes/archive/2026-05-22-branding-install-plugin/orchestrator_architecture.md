# Arquitectura del Cambio: Branding ASCII

## Componentes
1. **Logo Generator**: Un bloque `cat` con heredoc incrustado en el script.
2. **Color Layer**: Aplicación de variables ANSI existentes (`COLOR_HEADER`).

## Flujo de Control
```mermaid
graph TD
    A[Inicio install-plugin.sh] --> B[Definición de Colores]
    B --> C[Impresión de Logo ASCII]
    C --> D[Impresión de Encabezado Boxed]
    D --> E[Diagnóstico de Entorno]
    E --> F[...]
```

## Estructura de Datos
- `ZUGZ_LOGO`: Variable de texto (implícita en el heredoc) que contiene los caracteres del arte ASCII.
