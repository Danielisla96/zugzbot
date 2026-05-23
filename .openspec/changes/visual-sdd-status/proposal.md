# Propuesta Técnica: Visual SDD Status en TUI

## 1. Objetivo
Mejorar la visibilidad del ciclo SDD integrando indicadores visuales de fase y subagentes directamente en la barra lateral del TUI. Esto permitirá al desarrollador conocer el estado del proceso sin necesidad de consultar archivos manuales.

## 2. Diagnóstico Actual
- **Mascota**: Actualmente implementada en `plugin_tui.tsx` con un parpadeo básico cada 3 segundos.
- **Estado SDD**: Se almacena en `.openspec/sdd-lock.json`. No hay comunicación reactiva entre este archivo y la UI.
- **Layout**: El sidebar tiene un ancho de 37 caracteres. El espacio superior (encima del Monitor de Agentes) es ideal para esta información.

## 3. Solución Propuesta

### A. Integración de Datos
- Se implementará un mecanismo de polling en `plugin_tui.tsx` que lea `.openspec/sdd-lock.json` cada 2 segundos (desacoplado del refresco de métricas).
- Se utilizará un `createSignal` para almacenar el estado del lockfile.

### B. Componentes Visuales
1.  **Monitor de Fase SDD**:
    - Nombre de la fase actual (ej: "Fase 2: Arquitectura").
    - Barra de progreso ASCII de 10 segmentos: `[■■□□□□□□□□]`.
    - Color dinámico según la fase:
        - Planning (0-2): Violeta/Accent.
        - Building (3-4): Azul/Info.
        - Testing (5): Amarillo/Warning.
        - Release (6-8): Verde/Success.

2.  **Estado del Subagente**:
    - Nombre del subagente activo en negrita.
    - Indicador de estado (ej: `idle`, `working...`, `looping`).

3.  **Mascota Reactiva**:
    - La mascota "Zugz" cambiará sus ojos o añadirá un símbolo cuando un subagent esté en estado `in_progress`.
    - Ejemplo: `[o_o]` -> `[*_*]`.

### C. Layout Sugerido (37 caracteres)
```text
 (\__/)  <-- Zugzbot [*_*]
  [o_o]      Working on: sdd-architect
 (") (")

[Fase 2: Arquitectura]
[■■□□□□□□□□] 25%
─────────────────────────────────────
```

## 4. Riesgos y Mitigaciones
- **Lectura de Archivos**: Si el entorno TUI restringe `fs`, se buscará exponer el estado a través de la API de OpenCode o un archivo temporal compartido.
- **Rendimiento**: El polling de un archivo pequeño de <1KB no debería impactar el rendimiento.
