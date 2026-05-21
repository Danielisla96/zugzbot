# Zugzbot SDD Harness

> [!IMPORTANT]
> **Zugzbot** es un entorno de orquestación de desarrollo guiado por especificaciones (Spec-Driven Development - SDD) multi-agente y reutilizable para [OpenCode](https://opencode.ai) y [Cursor](https://cursor.sh). Instala un ciclo de vida de desarrollo de IA de grado de producción completo en cualquier proyecto con un solo comando — totalmente acotado al proyecto, sin escribir nada en tu configuración global.

---

## 🚀 Conceptos Clave y Arquitectura

Este arnés implementa un ciclo de vida estricto de **Desarrollo Guiado por Especificaciones (SDD)** orquestado por **Zugzbot**, un agente primario que delega cada fase a un subagente especializado. Ningún agente escribe código sin una especificación aprobada, un plan de arquitectura y un checklist de tareas atómicas.

```mermaid
graph TD
    A["Fase 1: Especificación\n(sdd-proposer)"] --> B["Fase 2: Planificación y Arquitectura\n(sdd-planner)"]
    B --> C["Fase 3: Implementación\n(sdd-implementer)"]
    C --> D{"¿Se detecta\nFrontend?"}
    D -- Sí --> E["Fase 3.5: Percepción Visual\n(sdd-ui-designer + Puppeteer MCP)"]
    D -- No --> HIL{"¿Modo Auto?"}
    E --> HIL
    HIL -- No --> I["Fase 3.8: Servidor Interactivo\n(Human-in-the-Loop)"]
    HIL -- Sí --> F["Fase 4: Verificación y QA\n(sdd-verifier)"]
    I --> F
    F --> G["Fase 5: Documentación y Versionado\n(sdd-documenter)"]
    G --> H["Archivado del Cambio\n(openspec-archive-change)"]
```

---

## 🤖 Elenco de Agentes

### Agentes del Ciclo SDD

| Agente | Rol | Fase |
|---|---|---|
| `zugzbot` | Orquestador primario — rutea, delega y controla los límites de cada fase. | Siempre activo |
| `sdd-proposer` | Conduce la entrevista técnica, genera `proposal.md` y `spec.md` con escenarios BDD. | Fase 1 |
| `sdd-planner` | Diseña la arquitectura técnica, genera diagramas Mermaid y el checklist de tareas. | Fase 2 |
| `sdd-implementer` | Escribe código de producción siguiendo de forma estricta el checklist de tareas. | Fase 3 |
| `sdd-ui-designer` | Levanta el servidor local, captura la UI mediante Puppeteer MCP y aplica mejoras UX/UI. | Fase 3.5 *(frontend)* |
| `sdd-verifier` | Ejecuta linters, pruebas unitarias y realiza reportes reales de integración mediante `curl`. | Fase 4 |
| `sdd-documenter` | Generates los documentos canónicos, crea el mensaje de commit semántico y actualiza CHANGELOG.md. | Fase 5 |

### Agentes Auxiliares

| Agente | Rol | Permisos |
|---|---|---|
| `aux-oracle` | Responde consultas de conocimiento general **sin relación directa con el proyecto**. | Solo lectura |
| `aux-handyman` | Ejecuta tareas pequeñas e inmediatas que no ameritan iniciar un ciclo de vida SDD completo. | Lectura + Escritura |

---

## 📋 El Ciclo de Vida SDD Completo

Cada cambio significativo progresa de forma secuencial a través de estas fases gobernadas:

1. **Fase 1 — Especificación (`sdd-proposer`)**
   - Entrevista técnica guiada con el usuario.
   - Generación de `openspec/changes/<nombre>/proposal.md` (alcance y negocio).
   - Generación de `openspec/changes/<nombre>/specs/spec.md` con escenarios BDD (`Dado / Cuando / Entonces`).

2. **Fase 2 — Planificación y Arquitectura (`sdd-planner`)**
   - Diseño modular siguiendo principios SOLID y Arquitectura Limpia.
   - Creación de `orchestrator_architecture.md` (diagramas Mermaid) y `orchestrator_tasks.md` (checklist).

3. **Fase 3 — Implementación (`sdd-implementer`)**
   - Escritura de código incremental quirúrgico siguiendo el checklist de tareas.
   - Valida el código con el compilador/LSP del entorno antes de entregar.

4. **Fase 3.5 — Percepción Visual y UX (`sdd-ui-designer`) — *Frontend***
   - **Integración Puppeteer MCP (Cero-Configuración):** Levanta automáticamente un navegador Chrome headless local.
   - Navega, interactúa, detecta problemas de escala, jerarquía y WCAG AA, y genera capturas del "Antes / Después".
   - Produce el reporte visual `ui_review_report.md`.

5. **Fase 3.8 — Servidor Local Interactivo (Human-in-the-Loop)**
   - Levanta el servidor local o entorno automáticamente basándose en las tecnologías detectadas (ej: `npm run dev`, `python manage.py runserver`, etc.).
   - Verifica la disponibilidad local y ofrece un enlace de verificación premium e interactivo (ej: `http://localhost:3000`) para que el desarrollador interactúe y verifique visual y manualmente la implementación antes de las pruebas formales.
   - **Nota**: Este paso se ignora/salta de manera inteligente si se activa el modo Piloto Automático (`--auto`).

6. **Fase 4 — Verificación y QA (`sdd-verifier`)**
   - Ejecuta análisis estático de código, linters y la suite de pruebas unitarias.
   - Levanta el backend local y realiza peticiones `curl` reales documentando respuestas exactas en `verification_report.md`.
   - **Bucle de Auto-curación:** Si un test falla, reactiva al implementador entregándole el log de error exacto.

7. **Fase 5 — Documentación y Control de Versiones (`sdd-documenter`)**
   - Escribe o actualiza los tres documentos canónicos del proyecto:
     - `README.md` — inicio rápido y descripción
     - `docs/TECHNICAL.md` — detalles técnicos, arquitectura y catálogo de APIs
     - `docs/USER_GUIDE.md` — instalación, consumo real y troubleshooting
   - **Commit Semántico Automatizado:** Genera el mensaje impecable en `commit_message.txt` bajo *Conventional Commits* (cero atribuciones de IA).
   - **Keep a Changelog Quirúrgico:** Inyecta de forma quirúrgica la entrada del cambio en el archivo `CHANGELOG.md` global bajo la sección `## [Unreleased]`.

8. **Archivado y Commit Automatizado**
   - Una vez firmado por el usuario, el cambio se archiva en `openspec/changes/archive/YYYY-MM-DD-<name>/` y se realiza automáticamente un `git commit` semántico utilizando el archivo `commit_message.txt` si hay cambios locales listos para confirmar.

---

## ✨ Experiencia de Usuario (UX) Premium

El arnés SDD está optimizado para ofrecer una experiencia fluida, interactiva y de alto rendimiento:

1. **Fase 0 — Diagnóstico Inteligente de Entrada**: El instalador analiza el stack local (TypeScript/JS, Python, Go, Rust, Ruby, PHP) y detecta dependencias, frameworks (Next.js, React, Django, etc.), bases de datos y frameworks de testeo, adaptando dinámicamente la activación del diseñador visual (`sdd-ui-designer`). **Además, sugiere el uso de `npx autoskills` para la autogeneración extremadamente segura de habilidades adaptadas a las tecnologías del proyecto.**
2. **Cuestionarios de Selección Estructurados**: Zugzbot y `@sdd-proposer` aprovechan la herramienta interactiva de selección `AskUserQuestion` en OpenCode. En lugar de responder largas preguntas de texto abierto, el desarrollador responde completando formularios de opción múltiple ágilmente.
3. **Piloto Automático (`--auto`)**: Los usuarios avanzados pueden pasar la bandera o parámetro `--auto` en sus comandos. Esto desactiva todas las pausas de confirmación entre fases, delegando y ejecutando de forma 100% autónoma el ciclo completo de SDD hasta finalizar el cambio.
4. **Commits Git Automatizados y Convencionales**: Al finalizar el ciclo en la etapa de archivado, el sistema comprueba los cambios de código locales y realiza automáticamente un `git commit` semántico utilizando el mensaje impecable del archivo `commit_message.txt` sin dejar firmas de IA.

---

## 📦 Instalación

> [!NOTE]
> El instalador del arnés está diseñado para ser **100% local y aislado**. No altera configuraciones globales de tu sistema ni de OpenCode; todo se instala dentro del directorio destino de tu proyecto.

### Requisitos Previos

- [OpenCode](https://opencode.ai) o [Cursor](https://cursor.sh) instalado.
- Git 2.28+ configurado localmente.

### Opción A — Instalación en un Solo Comando (Recomendado)

Navega a la raíz de tu proyecto destino y ejecuta:

```bash
git clone --depth 1 https://github.com/Danielisla96/zugzbot.git /tmp/zugzbot-harness \
  && /tmp/zugzbot-harness/sdd-harness/bootstrap-sdd.sh \
  && rm -rf /tmp/zugzbot-harness
```

Clona de forma efímera el arnés, inyecta los agentes y configuraciones locales de forma silenciosa, y limpia los residuos temporales sin dejar huella global.

### Opción B — Instalación Local

Si ya tienes el repositorio clonado localmente:

```bash
cd /ruta/a/tu/proyecto-destino
/ruta/a/zugzbot/sdd-harness/bootstrap-sdd.sh
```

---

### Lo que hace el Instalador

El script de instalación ejecuta 9 pasos de forma silenciosa y elegante:

```
[0/8] Diagnóstico de Proyecto...             — Analiza dependencias y frameworks locales.
[1/8] Verificando repositorio Git...         — Inicializa git e inyecta el .gitignore base.
[2/8] Creando estructura de carpetas...       — Crea directorios .agent/, .opencode/ y openspec/.
[3/8] Instalando perfiles de subagentes...     — Inyecta los prompts de sistema en español técnico.
[4/8] Generando registro de agentes...        — Escribe el opencode.jsonc de proyecto.
[5/8] Copiando habilidades y configs MCP...   — Configura habilidades de fase y Puppeteer MCP.
[6/8] Escribiendo marcador de versión...       — Setea la versión del arnés en .agent/.
[7/8] Creando checkpoint de Git...            — Realiza un commit con la instalación limpia.
[8/8] Sincronizando reglamento (AGENTS.md)... — Instala la constitución base de comportamiento.
```

---

## 📂 Estructura del Proyecto Post-Bootstrap

```
tu-proyecto/
├── .agent/
│   ├── mcp-config.json      # Configuración del servidor Puppeteer MCP
│   ├── skills/              # Definiciones de habilidades sdd-* y openspec-*
│   └── workflows/           # Archivos de workflows declarativos opsx-*
├── .opencode/
│   ├── agents/              # Prompts de sistema de todos los subagentes
│   ├── commands/            # Mapeos de comandos slash
│   ├── mcp-config.json      # Configuración MCP para OpenCode
│   └── skills/              # Habilidades del runtime
├── openspec/
│   ├── changes/             # Cambios activos y archivados
│   └── schemas/
│       └── ssd-orchestrated/ # Esquemas y plantillas de documentos del ciclo
├── docs/                    # Generado en Fase 5 por sdd-documenter
│   ├── TECHNICAL.md
│   └── USER_GUIDE.md
├── opencode.jsonc           # Registro local de agentes del proyecto
├── AGENTS.md                # Reglamento de conducta obligatorio para los modelos
└── README.md                # Actualizado automáticamente al final de cada ciclo
```

---

## ⚡ Referencia de Comandos Slash

| Comando | Descripción |
|---|---|
| `/opsx-propose <descripcion>` | Inicia la Fase 1 — entrevista guiada y especificación |
| `/opsx-explore <query>` | Entra en modo de exploración técnica y diseño mental profundo |
| `/opsx-apply` | Inicia la Fase 3 — codificación incremental basada en el checklist aprobado |
| `/opsx-archive` | Archiva un cambio completamente verificado y aprobado |

---

## 📜 Reglamento de Conducta (AGENTS.md)

Todos los agentes están severamente limitados por `AGENTS.md`, el cual garantiza:
- **Cero Código "Al Vuelo":** No se escribe una sola línea de código sin especificación aprobada, arquitectura de componentes trazada y checklist de tareas atómicas.
- **Límites de Fase Rígidos:** Ningún subagente puede avanzar a la siguiente fase sin la firma explícita del desarrollador humano en el prompt.
- **SOLID y Clean Architecture:** Es obligatorio seguir patrones limpios de diseño y la inyección de dependencias.
- **Historial Limpio:** No se permiten commits genéricos; toda entrega debe estar descrita semánticamente sin marcas de IA.
