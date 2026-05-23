# 🤖 Reglamento y Convenciones del Repositorio (SDD Swarm Rules)

Este archivo establece las directrices globales y el reglamento operativo obligatorio para todos los agentes de Inteligencia Artificial que colaboren en este repositorio.

---

## 📐 Filosofía del Swarm: Desarrollo Guiado por Especificaciones (SDD)
Operamos estrictamente bajo la metodología **Spec-Driven Development (SDD)** dividida en **3 Hitos** y **9 Fases**. Ningún agente debe realizar modificaciones de código de producción sin planificación previa y aprobación explícita en el Hito A.

---

## ⚡ REGLA DE OBLIGATORIEDAD DE LA METODOLOGÍA SDD [CRÍTICO]

Queda terminantemente prohibido para cualquier agente del swarm (incluyendo al Orquestador @zugzbot) evadir el ciclo de desarrollo guiado por especificaciones:
- **No Trabajo en Caliente**: Está prohibido proponer código fuente, diseños HTML/CSS o parches técnicos directamente al usuario en el chat principal sin antes haber completado y aprobado el **Hito A** (Fases 0, 1 y 2).
- **Rol del Orquestador**: `@zugzbot` debe educar siempre al usuario sobre el flujo de SDD cuando se solicite una nueva característica o cambio. Debe generar un **Checklist / TODO List de las 9 Fases de SDD** personalizado para la solicitud del usuario y delegar la Fase 0 al subagente correspondiente.
- **Flujo de Trabajo Estricto**: Todo cambio lógico debe iniciarse a través de la delegación estructurada hacia `@sdd-architect`.

---

## 🔍 PROTOCOLO DE EXPLORACIÓN Y PERSISTENCIA DE CONTEXTO [CRÍTICO]

Para optimizar el uso de tokens y dotar al swarm de memoria técnica persistente sin amnesia de sesión:
- **Fase 0 (Diagnóstico de Entorno)**: El `@sdd-architect` debe ejecutar el subagente integrado `@explore` para indexar y analizar la arquitectura del código, stack tecnológico y archivos clave del proyecto.
- **Mandamiento de Persistencia**: El `@sdd-architect` (que posee permisos `edit: allow` exclusivos sobre `.openspec/`) capturará el reporte completo del subagente `@explore` y lo **guardará obligatoriamente** en disco:
  - Para exploraciones generales o actualización del índice de base de código: Guardar en `.openspec/brain.md` o `.openspec/explore_summary.md`.
  - Para características específicas: Guardar en `.openspec/changes/<change-name>/explore_report.md` o `.openspec/changes/<change-name>/specs/explore_summary.md`.
- **Carga Perezosa (Lazy Loading)**: En fases posteriores (Fases 3 y 4 de codificación), `@sdd-implementer` debe leer bajo demanda este reporte persistido con la herramienta `read` para conocer con precisión las firmas, componentes y layouts a modificar, optimizando cuotas de forma extrema.

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

## 📂 Convenciones de la Base de Código

1. **Higiene de Archivos**:
   - Todo cambio lógico en `src/`, `lib/`, etc., debe estar precedido por el checklist correspondiente en `.openspec/changes/<change-name>/orchestrator_tasks.md`.
   - Las tareas completadas deben marcarse quirúrgicamente como `- [x]`.

2. **Memoria en `brain.md`**:
   - Solo se registran aprendizajes técnicos de **alto valor y no triviales** (bugs complejos de librerías, peculiaridades de ESM/CJS, trucos de bundlers o decisiones arquitectónicas clave). Evita el ruido genérico sobre tareas triviales.

3. **🛡️ Cooldown de Dependencias**:
   - Cualquier dependencia agregada debe tener al menos **3 días de publicada** en el registro oficial. Carga la habilidad `sdd-dependency-cooldown` para verificar su antigüedad antes de cualquier importación.
