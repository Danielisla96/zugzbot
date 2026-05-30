# Skill: SDD Semantic Context Pruning

Esta habilidad define las reglas y heurísticas de ingeniería de prompts para recortar selectivamente los cuerpos de las funciones y código irrelevante en las solicitudes al LLM. Esto reduce el consumo de tokens de entrada hasta en un 70% y mejora sustancialmente la precisión y velocidad de los agentes.

## Trigger

Se ejecuta activamente en la **Fase 0 (Explorer)**, **Fase 1 (Planner)** y al delegar tareas a subagentes de **Construcción (F2)**.

## Reglas Operativas de Poda de Contexto

El planificador u orquestador debe seguir estas directivas antes de inyectar archivos grandes en el contexto del LLM:

### 1. Poda por Dependencia Localizada (Impacto Acotado)
No inyectes archivos completos si no están listados en el `spec.md` o en las líneas directamente afectadas obtenidas por `git diff`.
* **Acción:** Si una función del archivo A llama a una función del archivo B, pero el cambio solo afecta a A, inyecta el archivo A completo y **únicamente la firma de la función** del archivo B.

### 2. Estructura de Poda de Código (Signatures Only)
Cuando debas referenciar módulos externos gigantes, reemplaza el cuerpo del método por un comentario descriptivo:

```typescript
// ANTES (Cargar todo es ruidoso y costoso):
export function processTransaction(tx: Transaction) {
  // ... 300 líneas de lógica de validación, firma, logs, db calls, etc. ...
}

// DESPUÉS (Firma limpia y tipada):
/**
 * Procesa una transacción financiera en base a reglas de negocio.
 * @param tx Objeto de transacción tipado.
 */
export function processTransaction(tx: Transaction): TransactionResult; // [Cuerpo omitido por Poda Semántica]
```

### 3. Poda Incremental de Archivos de Historial
Evita enviar historiales acumulados enteros de fallas de compilación o conversaciones previas largas.
* **Acción:** Provee únicamente el último log de error y el archivo `sdd-lock.json` actualizado para dotar al subagente de un hilo limpio (lienzo en blanco).

## Criterios de Aceptación (QA)

- `[ ]` **Eficiencia:** Las delegaciones de prompts a subagentes complejos no deben exceder el 30% del tamaño total del repositorio.
- `[ ]` **Sin Amnesia:** La información requerida de tipos, parámetros de retorno y convenciones del repositorio (`AGENTS.md`) debe preservarse de forma compacta en todo momento.

## Tags

#sdd #context-pruning #prompt-engineering #token-economy #optimization
