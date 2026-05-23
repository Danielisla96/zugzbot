# Propuesta Técnica: Monitoreo de Subagentes y Costos en TUI

## Resumen
Mejorar el `Monitor de Agentes` en el plugin TUI para que identifique, agrupe y visualice de forma jerárquica a los subagentes, desglosando sus costos y consumo de tokens de manera independiente del agente orquestador.

## Objetivos
- Identificar subagentes de forma unívoca en el flujo de mensajes.
- Visualizar la jerarquía "Padre > Subagente" mediante identación en el TUI.
- Calcular costos acumulados por subagente y totales globales.

## Cambios Propuestos

### 1. Modelo de Datos
Actualizar la interfaz `AgentMetrics` para soportar jerarquía:
```typescript
interface AgentMetrics {
  name: string;
  cost: number;
  tokensInput: number;
  tokensOutput: number;
  isSubagent: boolean;
  parentId?: string;
}
```

### 2. Lógica de Recolección (`getMetrics`)
- Implementar una búsqueda recursiva de mensajes en todas las sub-sesiones vinculadas.
- Detectar si un mensaje pertenece a un subagente analizando la propiedad `agent` y comparándola con el nombre del agente principal de la sesión raíz.

### 3. Interfaz de Usuario
- Utilizar caracteres ASCII (`└─`, `├─`) para mostrar la relación jerárquica.
- Mantener el estilo compacto actual para no saturar el sidebar.

## Riesgos y Mitigaciones
- **Riesgo**: El TUI tiene ancho limitado.
- **Mitigación**: Truncar nombres de agentes muy largos y usar abreviaturas para tokens (k, M).
