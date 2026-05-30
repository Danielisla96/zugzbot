# Skill: SDD Root Cause Diagnostician

Esta habilidad dota al enjambre de Inteligencia Artificial de capacidades explicativas profundas al detectar fallas en las Fases de Calidad (F3) y Construcción (F2), impidiendo bucles correctivos infinitos mediante el aislamiento del error real y la inyección de guías de remediación inmediatas.

## Trigger

Se activa cuando:
1. `tools/sdd_regression_detector` retorna `status: "FAILED"` o `status: "FAILED_LOCAL"`.
2. Las pruebas unitarias o linters fallan de manera persistente tras un reintento.

## Proceso de Diagnóstico Semántico

Al ocurrir una falla, el `@sdd-tester` o `@sdd-builder` debe invocar este proceso cognitivo:

### 1. Extracción del Sintoma vs Causa
No asumas que el primer error en la pila de llamadas (stacktrace) es el origen real.
* **Acción:** Busca la línea superior del stacktrace que pertenezca a los archivos modificados listados en `spec.md`. Compara los tipos de parámetros esperados con los provistos.

### 2. Generación del Reporte de Causa Raíz
Crea un archivo temporal `.openspec/diagnostics/root_cause.md` detallando de forma directa y visual el origen del quiebre:

```markdown
# 🔍 Diagnóstico de Causa Raíz: [nombre-falla]

## 1. El Quiebre Detectado
- **Síntoma:** `TypeError: Cannot read properties of undefined (reading 'getName')`
- **Ubicación:** `src/components/Sidebar.tsx:L45`

## 2. El Origen Real (Causa Raíz)
El objeto `activeSheet` se consulta de forma asíncrona sin un bloque guardián. En entornos locales mockeados, esta resolución tarda 5ms más de lo esperado, haciendo que la llamada posterior se ejecute sobre un valor `null`.

## 3. Pista de Remediación (Remediation Hint)
Asegurar la validación del objeto antes de invocar propiedades:
```typescript
const sheetName = activeSheet ? activeSheet.getName() : "Sin Nombre";
```

### 3. Inyección en el Bucle de Retorno
Cuando el ciclo correctivo transicione la fase hacia atrás (Fase 2) o repita la actual, el orquestador `@zugzbot` debe inyectar este archivo `root_cause.md` como entrada prioritaria de contexto en el chat "lienzo en blanco" del `@sdd-builder`.

## Criterios de Aceptación (QA)

- `[ ]` **Precisión:** El reporte de causa raíz debe contener una pista de remediación de código lista para ser asimilada por el constructor.
- `[ ]` **Sin Bucles:** Ningún corrective loop debe superar las 3 iteraciones una vez inyectadas las pistas de causa raíz.

## Tags

#sdd #corrective-loops #debugging #diagnostics #root-cause #recovery
