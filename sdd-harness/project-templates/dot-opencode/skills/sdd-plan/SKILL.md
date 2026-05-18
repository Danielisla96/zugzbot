---
name: sdd-plan
description: Traducir una propuesta y especificación de comportamiento aprobadas en un diseño técnico de arquitectura limpia y un checklist atómico de tareas de implementación. Utilizar después de aprobar sdd-propose y antes de escribir cualquier código.
license: MIT
compatibility: No requiere herramientas externas. Acceso de lectura y escritura a openspec/ es suficiente.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Diseñar la arquitectura y producir el checklist de tareas para un cambio aprobado.

**Entrada**: El nombre del cambio activo en kebab-case. Si se omite, infiéralo del contexto o solicítelo al usuario.

**Pasos**

1. **Leer todo el contexto antes de realizar cualquier acción**

   Lea en orden estricto:
   - `openspec/changes/<nombre>/proposal.md`
   - `openspec/changes/<nombre>/specs/spec.md`
   - El árbol actual del directorio `src/` (para entender la arquitectura existente)
   - `openspec/changes/schemas/ssd-orchestrated/` (si existe, para comprender contratos de esquema)

   No comience a escribir hasta haber consumido y comprendido estas cuatro fuentes.

2. **Diseñar la arquitectura**

   Aplique los siguientes principios a cada decisión de diseño:
   - **SOLID**: Cada módulo/clase debe tener una única responsabilidad bien definida.
   - **Arquitectura Limpia**: Separe rigurosamente la lógica de dominio de los detalles de entrega e infraestructura.
   - **DRY (Don't Repeat Yourself)**: Identifique y extraiga lógica compartida en utilitarios o servicios comunes.
   - **Inversión de Dependencias**: Dependa de abstracciones, no de implementaciones concretas.

   Defina con precisión:
   - Layout de archivos y carpetas bajo `src/`, detallando la responsabilidad exacta de cada archivo nuevo o modificado.
   - Límites y contratos de cada módulo (qué expone y qué consume cada parte).
   - Flujo de datos: cómo viaja la petición desde el punto de entrada hasta la persistencia y viceversa.
   - Dependencias externas añadidas y justificación técnica para cada una.

3. **Escribir `orchestrator_architecture.md`**

   Escriba en el archivo `openspec/changes/<nombre>/orchestrator_architecture.md`:

   ```markdown
   # Diseño de Arquitectura — <nombre-del-cambio>

   ## Principios de Diseño Aplicados
   <Lista y explicación de decisiones de arquitectura limpia / SOLID aplicadas.>

   ## Layout del Directorio

   ```
   src/
   ├── <modulo>/
   │   ├── <archivo>.py     # <responsabilidad>
   │   └── ...
   └── ...
   ```

   ## Descripción de Módulos

   | Módulo | Archivo(s) | Responsabilidad / Contrato |
   |---|---|---|
   | ... | ... | ... |

   ## Flujo de Datos

   ```mermaid
   sequenceDiagram
       participant Client
       participant Router
       participant Service
       participant Repository
       Client->>Router: petición HTTP
       Router->>Service: invoca lógica
       Service->>Repository: consulta/guarda datos
       Repository-->>Service: retorna entidad
       Service-->>Router: retorna resultado/DTO
       Router-->>Client: respuesta HTTP
   ```

   ## Dependencias Externas

   | Paquete | Versión | Propósito / Justificación |
   |---|---|---|
   | ... | ... | ... |

   ## Decisiones de Diseño Clave
   - **<Decisión>**: <Justificación técnica senior>

   ## Riesgos e Incertidumbres
   - <cualquier riesgo de integración o limitación técnica detectada>
   ```

4. **Escribir `orchestrator_tasks.md`**

   Escriba en el archivo `openspec/changes/<nombre>/orchestrator_tasks.md`:

   Reglas para la descomposición de tareas:
   - Cada tarea debe ser resoluble de forma independiente (sin dependencias cíclicas en tareas no iniciadas).
   - Granularidad máxima: una única tarea debe modificar como máximo de 2 a 3 archivos.
   - Secuencia lógica: dependencias primero (base/modelos → servicios → routers/endpoints → tests → UI frontend).
   - Cada tarea debe indicar explícitamente el archivo que modifica o crea.

   ```markdown
   # Checklist de Implementación — <nombre-del-cambio>

   ## Fase A — Cimientos e Infraestructura
   - [ ] A1. Crear `src/<modulo>/<archivo>` — <comportamiento y responsabilidad básica>
   - [ ] A2. ...

   ## Fase B — Lógica de Dominio y Servicios
   - [ ] B1. Implementar `<función/clase>` en `src/<archivo>` — <comportamiento detallado>
   - [ ] B2. ...

   ## Fase C — Capa de Entrega (Routers / Controladores)
   - [ ] C1. Conectar `<ruta/endpoint>` en `src/<archivo>` — <firma de entrada/salida>
   - [ ] C2. ...

   ## Fase D — Pruebas Automatizadas (QA)
   - [ ] D1. Redactar `tests/<archivo>` para Scenario 1 (flujo feliz)
   - [ ] D2. Redactar tests de caso límite para <comportamiento frontera de spec.md>
   - [ ] D3. ...

   ## Fase E — Integración y Frontend (si aplica)
   - [ ] E1. ...
   ```

5. **Auto-Revisión del Checklist**

   Antes de notificar la entrega, verifique:
   - [ ] Que cada archivo del layout tenga una única responsabilidad clara.
   - [ ] Que el diagrama Mermaid compile perfectamente sin fallos sintácticos.
   - [ ] Que cada escenario definido en `specs/spec.md` esté cubierto por al menos una tarea en la Fase D.
   - [ ] Que ninguna tarea sea excesivamente grande.

6. **Reportar a Zugzbot**

   ```
   ## Fase de Planificación Completada

   **Cambio:** <nombre-del-cambio>
   **Artefactos escritos:**
   - openspec/changes/<nombre>/orchestrator_architecture.md
   - openspec/changes/<nombre>/orchestrator_tasks.md

   **Total de tareas planificadas:** <n>
   **Nuevos archivos a crear:** <n>
   **Dependencias externas agregadas:** <lista o "ninguna">

   Fase 2 completada. Arquitectura y checklist de tareas listos para revisión de usuario.
   ```

**Guardrails**
- Jamás escriba código de producción bajo `src/` o de testing bajo `tests/`; eso pertenece a las fases posteriores.
- El diagrama Mermaid de flujo es estrictamente obligatorio para asegurar la correcta comunicación de la arquitectura.
- Si existen preguntas sin responder en la propuesta, documéntelas explícitamente como riesgos técnicos en la arquitectura.
- Ordene las tareas de modo que el implementador pueda resolverlas secuencialmente de arriba a abajo.
