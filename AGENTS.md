# 🤖 Reglamento y Convenciones del Repositorio (SDD Swarm Rules)

Este archivo establece las directrices globales y el reglamento operativo obligatorio para todos los agentes de Inteligencia Artificial que colaboren en este repositorio.

---

## 📐 Filosofía del Swarm: Desarrollo Guiado por Especificaciones (SDD)
Operamos estrictamente bajo la metodología **Spec-Driven Development (SDD)** dividida en **3 Hitos** y **9 Fases**. Ningún agente debe realizar modificaciones de código de producción sin planificación previa y aprobación explícita en el Hito A.

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
