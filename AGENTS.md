# 🤖 Reglamento y Convenciones del Repositorio (SDD Swarm Rules)

Este archivo establece las directrices globales y el reglamento operativo obligatorio para todos los agentes de Inteligencia Artificial que colaboren en este repositorio.

---

## 📐 Filosofía del Swarm: Desarrollo Guiado por Especificaciones (SDD)
Operamos estrictamente bajo la metodología **Spec-Driven Development (SDD)** dividida en **3 Hitos** y **9 Fases**. Ningún agente debe realizar modificaciones de código de producción sin planificación previa y aprobación explícita en el Hito A.

---

## ⚡ REGLA DE OBLIGATORIEDAD DE LA METODOLOGÍA SDD [CRÍTICO]

Queda terminantemente prohibido para cualquier agente del swarm (incluyendo al Orquestador @zugzbot) evadir el ciclo de desarrollo guiado por especificaciones:
- **No Trabajo en Caliente**: Está prohibido proponer código fuente, diseños HTML/CSS o parches técnicos directamente al usuario en el chat principal sin antes haber completado y aprobado el **Hito A** (Fases 0, 1 y 2).
- **Rol del Orquestador**: `@zugzbot` debe educar siempre al usuario sobre el flujo de SDD cuando se solicite una nueva característica o cambio. Debe generar un **Checklist de las 9 Fases de SDD de una línea por fase** y delegar la Fase 0 de inmediato.
- **Flujo de Trabajo Estricto**: Todo cambio lógico debe iniciarse a través de la delegación estructurada hacia `@sdd-explorer`.

---

## 🔍 PROTOCOLO DE EXPLORACIÓN E INDEXACIÓN INTEGRAL [CRÍTICO]

Para optimizar el uso de tokens y dotar al swarm de memoria técnica persistente sin amnesia de sesión:
- **Fase 0 (Exploración Completa)**: El `@sdd-explorer` realiza una exploración completa del repositorio para mapear la arquitectura, APIs y layouts.
- **Regla de Exploración Incremental**: Si ya existe un reporte `explore_report.md` en disco, `@sdd-explorer` **no re-escribirá todo el archivo**. Detectará su presencia y realizará exclusivamente un **barrido diferencial incremental** para indexar únicamente nuevos archivos, funciones modificadas o dependencias actualizadas, guardando los cambios de forma modular. Sirve como la documentación viva del proyecto.
- **Carga Perezosa (Lazy Loading)**: En fases posteriores, los agentes tienen estrictamente prohibido volver a barrer el proyecto completo. Deben leer con la herramienta `read` únicamente los archivos indicados en los `INPUTS` de la delegación (como `explore_report.md` o `spec.md`).

---

## ⚡ REGLA DE CARGA PEREZOSA (LAZY LOADING) [CRÍTICO]

Para optimizar al máximo el consumo de cuotas y tokens en todas las sesiones, se establece la siguiente regla de lectura obligatoria:

> [!IMPORTANT]
> **Carga Perezosa de Referencias**:
> Cuando encuentres referencias a archivos grandes de la metodología (como especificaciones `@.openspec/changes/*/specs/spec.md`, reportes de lanzamiento o el cerebro del proyecto `@.openspec/brain.md`), **tienes estrictamente PROHIBIDO cargarlos todos de forma preventiva**.
> 
> - **Acción**: Utiliza tu herramienta `read` para cargar estos archivos **únicamente bajo demanda** (on a need-to-know basis), basándote estrictamente en el archivo que requiere la fase en curso.
> - **Firmas y LSP**: Utiliza preferentemente las herramientas del Servidor de Lenguaje experimental (`goToDefinition`, `hover`) para inspeccionar firmas en caliente en lugar de leer el contenido completo de archivos grandes de código.

---

## ⚡ PROTOCOLO DE CONCISIÓN Y PRECISIÓN OPERATIVA [CRÍTICO]

Para optimizar los tiempos de ejecución, evitar la dispersión mental del swarm y reducir drásticamente el consumo de tokens:
- **Respuesta de Alta Densidad**: Todos los agentes deben redactar respuestas cortas, directas y enfocadas únicamente en el valor técnico. Queda prohibida la verborrea redundante, los saludos largos o la repetición de contextos y directrices ya expresados en archivos.
- **Orquestación Basada en Referencias**: `@zugzbot` no debe replicar el código de la aplicación o las instrucciones largas en los prompts de delegación. Su mensaje de delegación debe ser ultra-corto, limitándose a:
  1. Mapear las rutas exactas de los archivos de `.openspec/` a leer.
  2. Dictar la tarea específica y concreta sin rodeos.
- **Artefactos "Justo y Necesario"**: Las especificaciones técnicas en `.openspec/` deben ser concisas, apoyándose en tablas, bullet points y escenarios BDD de pocas líneas. Los subagentes no deben generar documentación o reportes extensivos e innecesarios. Su misión es ejecutar, no escribir de más.
- **Handoff Eficiente**: Cuando un agente transicione de fase, su mensaje final debe resumir su logro en no más de un párrafo corto e indicar explícitamente cuál es la siguiente acción.

---

## 🏛️ Estructura Granular del Swarm de 9 Agentes y Flujo de Datos

Cada fase cuenta con un agente único ultra-especializado con inputs y outputs rígidos y bien definidos:

| Fase | Agente | Rol | Inputs Obligatorios de Entrada | Entregable (Output) Producido |
| :--- | :--- | :--- | :--- | :--- |
| **F0** | **`@sdd-explorer`** | Diagnóstico | Requerimiento de usuario + codebase actual | `explore_report.md` (Exploración técnica general) |
| **F1** | **`@sdd-architect`** | Diseñador Conceptual | `explore_report.md` | `proposal.md` (Solución) + `specs/spec.md` (BDD) |
| **F2** | **`@sdd-planner`** | Planificador Técnico | `explore_report.md` + `proposal.md` + `specs/spec.md` | `orchestrator_architecture.md` + `orchestrator_tasks.md` |
| **F3** | **`@sdd-implementer`**| Programador Lógico | `proposal.md` + `specs/spec.md` + `orchestrator_architecture.md` + `orchestrator_tasks.md` | Lógica implementada + checklist marcado `- [x]` |
| **F4** | **`@sdd-designer`** | Diseñador Estético | Código de F3 + `orchestrator_tasks.md` (tareas de UX) | Refinamiento de CSS, tipografía, micro-animaciones en UI |
| **F5** | **`@sdd-launcher`** | Desplegador local | Código final (F3+F4) + `specs/spec.md` | Entorno en caliente (`dev server` / `clasp push`) + `launcher_report.md` |
| **F6** | **`@sdd-verifier`** | QA Auditor | Código final + `specs/spec.md` + `launcher_report.md` | `verification_report.md` (Logs de linter y resultados de tests) |
| **F7** | **`@sdd-documenter`**| Documentador Técnico | Cambios en código + `verification_report.md` | Versión bumps en `package.json`, `CHANGELOG.md` y `commit_message.txt` |
| **F8** | **`@sdd-archiver`** | Archivador Git | `commit_message.txt` + `orchestrator_tasks.md` (verificada) | Rama de Git commiteada con éxito + carpeta archivada en `archive/` |

---

## 📋 Contratos de Formatos de Entregables de `.openspec/`

Todos los entregables creados por los agentes en `.openspec/changes/<change-name>/` deben respetar obligatoriamente las siguientes plantillas rígidas de alta densidad:

### 1. `explore_report.md`
```markdown
# Diagnóstico: [nombre-cambio]
## 1. Archivos Directamente Afectados
- `ruta/archivo_a.js` (Líneas 10-35: descripción)
## 2. API e Interacciones Existentes
- Función `onclick="funcionA()"` en `archivo_a.js`.
## 3. Estado y Comportamiento Responsive
- Detalle de quirks de viewport o estilos existentes.
```

### 2. `proposal.md`
```markdown
# Propuesta Técnica: [nombre-cambio]
## 1. Solución Propuesta
- [Un solo párrafo conciso con el enfoque técnico]
## 2. Arquitectura de Cambios
- **Componente A**: Reestructuración de estructura, clases CSS.
## 3. Estructura Visual
```[Diagrama ASCII o Mermaid]```
```

### 3. `specs/spec.md`
```markdown
# Especificaciones BDD: [nombre-cambio]
Feature: [Descripción]
  Scenario: [Caso de prueba principal]
    Given [Contexto inicial]
    When [Acción]
    Then [Resultado esperado]
```

### 4. `orchestrator_tasks.md`
```markdown
# Checklist de Orquestación: [nombre-cambio]
## Hito B - Construcción
### Fase 3: Implementación
- [ ] Tarea 1: Lógica principal
### Fase 4: UX Premium
- [ ] Tarea 2: Animaciones y refinamiento visual
## Hito C - Cierre
### Fase 7-8: Cierre
- [ ] Tarea 3: Documentar y archivar
```

### 5. `launcher_report.md`
```markdown
# Reporte de Entorno: [nombre-cambio]
- **Estado de Carga**: [EXITOSO | CON ERRORES]
- **Dirección Local/GAS**: `https://...`
- **Watch logs**: [ logs mínimos ]
```

### 6. `verification_report.md`
```markdown
# Reporte de Verificación QA: [nombre-cambio]
- **Tests Automatizados**: [PASARON | NO CONFIGURADOS | FALLARON]
- **Auditoría de Linter**: [SIN ERRORES | ADVERTENCIAS]
- **Logs de Error / Fallos**: [Línea exacta]
```

### 7. `commit_message.txt`
```text
[tipo]([scope]): [breve descripción en minúscula y presente]

- [cambio clave 1 en 50 chars]
- [cambio clave 2 en 50 chars]
```

---

## 📂 Convenciones de la Base de Código

1. **Higiene de Archivos**:
   - Todo cambio lógico en `src/`, `lib/`, etc., debe estar precedido por el checklist correspondiente en `.openspec/changes/<change-name>/orchestrator_tasks.md`.
   - Las tareas completadas deben marcarse quirúrgicamente como `- [x]`.

2. **Memoria en `brain.md`**:
   - Solo se registran aprendizajes técnicos de **alto valor y no triviales** (bugs complejos de librerías, peculiaridades de ESM/CJS, trucos de bundlers o decisiones arquitectónicas clave). Evita el ruido genérico sobre tareas triviales.

3. **🛡️ Cooldown de Dependencias**:
   - Cualquier dependencia agregada debe tener al menos **3 días de publicada** en el registro oficial. Carga la habilidad `sdd-dependency-cooldown` para verificar su antigüedad antes de cualquier importación.
