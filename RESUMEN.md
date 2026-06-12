# 🤖 Resumen Completo de la Arquitectura de Zugzbot (v2.0.0)

**Zugzbot** es un arnés de desarrollo y orquestación multi-agente para [OpenCode](https://opencode.ai) agnóstico al stack tecnológico. Su objetivo principal es automatizar de manera determinista y segura el ciclo completo de desarrollo de software utilizando **Specification-Driven Development (SDD)** acoplado a un flujo riguroso de **Test-Driven Development (TDD)** en bucle cerrado (Red → Green → Refactor).

---

## 🗺️ Mapa Arquitectural y Flujo de Trabajo (Diagrama ASCII)

```text
                               👤 USUARIO (Prompt en Lenguaje Natural)
                                               │
                                               ▼
                              ┌──────────────────────────────────┐
                              │    @zugzbot (Router Cognitivo)   │ ◄─── Lee/Escribe
                              │   Clasifica el Intent del Prompt  │      sdd-lock.json (v7)
                              └────────────────┬─────────────────┘
                                               │
                        ┌──────────────────────┴──────────────────────┐
            [Workflows Auxiliares]                                 [Workflow Core]
                    │                                                     │
    ┌───────────────┼───────────────┐                             ┌───────▼───────┐
    ▼               ▼               ▼                             │ full-sdd-tdd  │
@aux-oracle    @aux-auditor    @aux-handyman                      └───────┬───────┘
 (Teoría)        (Auditoría)     (Quick-Fix)                              │
 (Read-only)     (Read-only)     (≤ 3 archivos)                           ▼
                                                                     ( Fases SDD )
                                                                          │
 ┌────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┐
 │                                                                                                                                                 │
 ▼                                                                                                                                                 ▼
[F0] @sdd-explorer ──► [F1] @sdd-planner ──► [F1.5] Reviewer ──►  🚨 HIL-A  ──► [F2-RED] Test Writer ──► [F2-GREEN] @sdd-builder ──► [F2-REFACTOR] Improver
(Detecta Stack)        (Crea Spec.md BDD)    (Testeabilidad)    (Aprobación     (Escribe Test Rojo)      (Mínimo Código)            (Limpia y Refactoriza)
                                                                 Usuario)                                                                  │
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
 │
 ▼
[F3] @sdd-tester ──► [F4] @sdd-deployer ──►  🚨 HIL-B  ──► [F5] @sdd-archiver
(15 Validadores)      (Deploy Dev Opt)      (Aprobación    (Commit semántico
                                             Usuario)       y Cierre Ciclo)
```

---

## 🧠 SDD vs TDD: ¿Qué son y cómo cooperan en Zugzbot?

El arnés separa conceptual y técnicamente el diseño lógico y funcional de la implementación real mediante dos fases diferenciadas:

### 1. SDD (Specification-Driven Development)
* **Cuándo ocurre**: Fases **F0 a F1.5** (antes de escribir una sola línea de código funcional).
* **Qué hace**: Se enfoca en el **QUÉ**. Recibe tu prompt, analiza el stack tecnológico existente y define el comportamiento esperado del sistema mediante especificaciones formalizadas en Markdown (`spec.md`) utilizando lenguaje de estilo BDD (Behavior-Driven Development / Gherkin).
* **Propósito**: Garantizar que el agente y el usuario estén de acuerdo con el alcance antes de programar. Termina en el **HIL-A**, donde tú apruebas la especificación.

### 2. TDD (Test-Driven Development)
* **Cuándo ocurre**: Fases **F2-RED → F2-GREEN → F2-REFACTOR** (después de aprobar el HIL-A).
* **Qué hace**: Se enfoca en el **CÓMO** a nivel de código.
  1. **RED**: `@f2-red-test-writer` crea tests automatizados basados en la especificación que **deben fallar** inicialmente.
  2. **GREEN**: `@sdd-builder` escribe la implementación mínima necesaria para que los tests pasen.
  3. **REFACTOR**: `@f2-refactor-improver` limpia la implementación (estructura, legibilidad, optimización) sin alterar el comportamiento de los tests (deben seguir en verde).
* **Propósito**: Asegurar código funcional, testeable y libre de regresiones de manera automática.

---

## 👥 Catálogo de Agentes y Subagentes

El sistema se compone de **14 agentes** especializados bajo el principio de responsabilidad única (SRP).

### A. El Agente Principal (Router)

| Agente | Tipo | Rol / Comportamiento | Triggers de Activación |
| :--- | :--- | :--- | :--- |
| **`@zugzbot`** | `primary` | **El orquestador central**. Lee la entrada del usuario, valida el estado del lockfile (`sdd-lock.json`), clasifica la solicitud en uno de los 6 workflows y delega las tareas a los subagentes correctos. | Se activa automáticamente al mencionarlo: `@zugzbot "..."` |

### B. Subagentes Core del Ciclo SDD/TDD (`full-sdd-tdd`)

Estos subagentes operan de forma secuencial controlados por las transiciones del lockfile:

1. **`@sdd-explorer` (F0)**: Analiza la estructura del proyecto y detecta el stack tecnológico, dependencias y linter/tests configurados.
2. **`@sdd-planner` (F1)**: Redacta el documento de especificación funcional BDD (`spec.md`). Puede hacer de 3 a 5 preguntas aclaratorias al usuario si hay ambigüedad.
3. **`spec reviewer` (F1.5)**: Revisa internamente que el `spec.md` sea técnicamente viable y testeable antes de solicitar la firma del usuario.
4. **`@f2-red-test-writer` (F2-RED)**: Escribe los tests unitarios o de integración que fallan (rojo) basándose exactamente en el `spec.md`.
5. **`@sdd-builder` (F2-GREEN)**: Genera el código mínimo para hacer pasar los tests. También es responsable de integrar estilos visuales si se solicita frontend.
6. **`@f2-refactor-improver` (F2-REFACTOR)**: Refactoriza la implementación del Builder para cumplir con mejores prácticas, manteniendo los tests verdes.
7. **`@sdd-tester` (F3)**: Ejecuta una batería exhaustiva de validaciones (lint, formateo, vulnerabilidades de seguridad, pruebas de regresión).
8. **`@sdd-deployer` (F4)**: (Opcional) Realiza el despliegue automático del código verificado a un entorno local o de desarrollo.
9. **`@sdd-archiver` (F5)**: Empaqueta los cambios, genera el reporte de uso de tokens (`token_usage.md`), realiza el commit semántico en git y limpia el lockfile para el siguiente ciclo.

### C. Agentes Auxiliares (Tareas Específicas / Fuera del Ciclo Core)

Diseñados para consultas o cambios menores rápidos sin necesidad de iniciar todo el flujo SDD/TDD. Cuentan con restricciones estrictas de seguridad (sandboxing de permisos en OpenCode):

| Agente | Rol / Responsabilidad | Permisos Clave | Caso de Uso Ejemplo |
| :--- | :--- | :--- | :--- |
| **`@aux-handyman`** | Realiza cambios ultra-rápidos (Quick-Fixes) que involucren un máximo de 3 archivos (e.g. corregir typos, renombrar variables, bump de versiones). | `edit: allow`<br>`bash: allow` | "arregla el typo en el título del navbar" |
| **`@aux-auditor`** | Analiza la calidad del código, busca vulnerabilidades o calcula deuda técnica. **No puede modificar código**. | `edit: deny` 🚫 (Read-only) | "audita la seguridad de esta conexión de base de datos" |
| **`@aux-refactor`** | Realiza refactorizaciones menores sobre código existente, siempre garantizando que los tests existentes sigan pasando. | `edit: allow`<br>`bash: allow` | "simplifica esta función usando async/await" |
| **`@aux-explainer`** | Explica detalladamente el comportamiento de archivos, módulos o lógicas complejas del código de forma didáctica. | `edit: deny` 🚫 (Read-only)<br>`bash: deny` 🚫 | "explícame cómo funciona el archivo de rutas" |
| **`@aux-oracle`** | Responde dudas conceptuales, teóricas, patrones de diseño u optimizaciones genéricas. No inspecciona el código local a menos que se le provea. | `edit: deny` 🚫<br>`bash: deny` 🚫<br>`lsp: deny` 🚫 | "¿cuál es la diferencia entre JWT y cookies?" |

---

## 🎯 Casos de Uso y Selección de Workflows

Zugzbot clasifica de manera inteligente tu prompt. A continuación se detallan los workflows y sus disparadores típicos:

### 1. `full-sdd-tdd`
* **Cuándo usar**: Para desarrollo de nuevas características, endpoints de APIs, componentes UI complejos o resolución de bugs lógicos difíciles.
* **Ejemplo**: *"agrega un endpoint POST /api/login con validación de JWT"* o *"crea un panel de control de usuarios con Next.js y HeroUI"*.

### 2. `quick-fix`
* **Cuándo usar**: Cambios estéticos mínimos, documentación, renombrado trivial o corrección de sintaxis simple.
* **Ejemplo**: *"corrige el error ortográfico en el botón de submit"* o *"actualiza la versión del package.json a 2.0.1"*.

### 3. `audit`
* **Cuándo usar**: Revisar cumplimiento de estándares, análisis de seguridad estático, o sugerencias de optimización sin tocar archivos.
* **Ejemplo**: *"dime qué vulnerabilidades de seguridad tengo en este módulo"* o *"dame ideas para mejorar el rendimiento de la DB"*.

### 4. `refactor`
* **Cuándo usar**: Limpieza de código heredado o desordenado que ya cuenta con una suite de tests establecida.
* **Ejemplo**: *"refactoriza el helper de fechas para reducir la complejidad cognitiva"*.

### 5. `explain`
* **Cuándo usar**: Onboarding en un proyecto nuevo, entender código escrito por otros o documentar lógicas oscuras.
* **Ejemplo**: *"explica paso a paso qué hace el archivo sdd_archive_and_commit.ts"*.

### 6. `oracle`
* **Cuándo usar**: Consultas teóricas rápidas sin contexto del repositorio actual.
* **Ejemplo**: *"¿cómo se implementa el patrón de diseño Singleton en TypeScript?"*.

---

## 🚦 Mecánica HIL (Human-In-The-Loop)

Para garantizar que el agente autónomo no tome decisiones destructivas, el ciclo `full-sdd-tdd` requiere tu aprobación en únicamente dos momentos críticos:

1. **HIL-A (Validación del Diseño)**: Ocurre tras redactar la especificación y validar su testeabilidad (F1.5).
   * **Tus opciones**: 
     * `[A] ✅ Aprobar`: Inicia la fase de programación (F2-RED).
     * `[B] ❌ Rechazar`: Cancela el ciclo actual.
     * `[C] ⏸ Pausar`: Guarda el progreso para reanudar luego.
2. **HIL-B (Validación de QA)**: Ocurre tras programar, refactorizar y verificar la integridad en dev (F4).
   * **Tus opciones**:
     * `[A] ✅ Aprobar`: Procede a archivar, subir cambios y cerrar ciclo (F5).
     * `[B] 🐛 Issues`: Elige esta opción para reportar bugs detectados en la verificación. El builder volverá a F2 para corregirlos.
     * `[C] ⏪ Rollback`: Revierte todos los cambios locales generados en el ciclo.

---

## ⚙️ Persistencia y Estado: El Lockfile (`sdd-lock.json`)
Cualquier interrupción, recarga del IDE o cambio de día no afecta el desarrollo. El estado actual (fase, stack, rama git, progreso de los tests, sistema de diseño seleccionado, etc.) se guarda continuamente en `.openspec/sdd-lock.json` (versión de esquema v7). Cuando escribes de nuevo a `@zugzbot`, este lee el lockfile y continúa exactamente donde se quedó.
