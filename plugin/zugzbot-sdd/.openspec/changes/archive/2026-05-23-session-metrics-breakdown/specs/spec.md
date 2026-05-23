# Especificaciones Funcionales: `session-metrics-breakdown`

> **Fase:** 1 — Especificaciones BDD
> **Formato:** Escenarios Given-When-Then

---

## Escenario 1: Desglose con múltiples agentes

**Dado** que existen mensajes en la sesión principal (Build) y en 2 sesiones hijas (sdd-architect, sdd-implementer),
**Cuando** el componente `SDDUsage` calcula el desglose,
**Entonces** debe devolver 3 entradas en `AgentMetrics[]`:
| agentName | cost | tokensInput | tokensOutput |
|-----------|------|-------------|--------------|
| Build | 0.0050 | 450 | 200 |
| sdd-architect | 0.0045 | 400 | 180 |
| sdd-implementer | 0.0028 | 384 | 187 |
**Y** `totalCost` debe ser 0.0123 (suma de los 3 costos),
**Y** `agentCount` debe ser 3.

---

## Escenario 2: Sesión sin hijos

**Dado** que la sesión actual **no tiene** sesiones hijas (sin subagentes),
**Cuando** el componente calcula el desglose,
**Entonces** debe devolver un `AgentMetrics[]` con una sola entrada,
**Y** el nombre del agente debe extraerse del primer `UserMessage.agent` de la sesión,
**Y** `agentCount` debe ser 1,
**Y** `totalCost` debe ser igual al costo de la única sesión.

---

## Escenario 3: Sesión vacía (sin mensajes)

**Dado** que la sesión actual no tiene mensajes,
**Cuando** el componente calcula el desglose,
**Entonces** debe devolver `{ agents: [], totalCost: 0, totalTokens: 0, agentCount: 0 }`,
**Y** no debe lanzar errores.

---

## Escenario 4: Hijo sin mensajes

**Dado** que existe una sesión hija sin mensajes,
**Cuando** el componente calcula el desglose,
**Entonces** debe incluir la sesión hija en `agents[]` con `cost: 0, tokensInput: 0, tokensOutput: 0`,
**Y** no debe lanzar errores.

---

## Escenario 5: Consistencia de totales

**Dado** que el desglose tiene N agentes,
**Cuando** se suman `cost`, `tokensInput`, `tokensOutput` de todas las entradas,
**Entonces** deben coincidir exactamente con `totalCost`, `totalInput`, `totalOutput` de la función `calculateUsage()` original.

---

## Escenario 6: Actualización en tiempo real

**Dado** que el componente está visible con polling activo (1000ms),
**Cuando** un nuevo mensaje de subagente aparece en una sesión hija,
**Entonces** el desglose debe reflejar los nuevos valores en máximo 1000ms + 100ms de latencia,
**Y** los totales generales deben actualizarse correctamente.

---

## Escenario 7: Nombre de agente por defecto

**Dado** que una sesión (padre o hija) no tiene `UserMessage.agent` ni `session.title` informativos,
**Cuando** el componente intenta identificar el agente,
**Entonces** debe usar el valor por defecto `"Agente %{sessionId}"` o simplemente `"Sesión"`,
**Y** no debe lanzar errores ni mostrar `undefined`.

---

## Escenario 8: Agente con nombre largo

**Dado** que un agente tiene un nombre de más de 20 caracteres (ej: `sdd-architect-implementer-helper`),
**Cuando** se renderiza en la fila de desglose,
**Entonces** el nombre debe truncarse a 20 caracteres con sufijo `…`,
**Y** el resto de la fila (costo, tokens) debe mantener su alineación.

---

## Escenario 9: API children() no disponible

**Dado** que `api.state.session.children()` no está disponible en el runtime,
**Cuando** el componente intenta obtener sesiones hijas,
**Entonces** debe hacer **fallback** a parsear solo la sesión actual,
**Y** mostrar una sola fila en el desglose,
**Y** no debe lanzar errores.

---

## Escenario 10: Precisión de costos

**Dado** que los costos individuales de cada agente son valores muy pequeños (ej: 0.00001234),
**Cuando** se muestran en la UI,
**Entonces** deben formatearse con al menos 5 decimales,
**Y** la suma de costos individuales debe coincidir con el total dentro de una tolerancia de 1e-10.

---

## Resumen de Escenarios

| # | Escenario | Prioridad | Dependencia |
|---|-----------|-----------|-------------|
| 1 | Desglose multi-agente | 🔴 Crítica | `session.children()` |
| 2 | Sesión sin hijos | 🔴 Crítica | Ninguna |
| 3 | Sesión vacía | 🔴 Crítica | Ninguna |
| 4 | Hijo sin mensajes | 🟡 Media | `session.children()` |
| 5 | Consistencia de totales | 🔴 Crítica | Cálculo correcto |
| 6 | Actualización en tiempo real | 🟡 Media | Polling |
| 7 | Nombre por defecto | 🟢 Baja | Fallback |
| 8 | Nombre largo truncado | 🟢 Baja | UI |
| 9 | API children() no disponible | 🟡 Media | Fallback |
| 10 | Precisión de costos | 🟡 Media | Formateo |
