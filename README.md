# 🤖 Zugzbot — Arnés SDD Multi-Agente para OpenCode

> [!IMPORTANT]
> **Zugzbot** es un arnés de orquestación industrial basado en **Spec-Driven Development (SDD) Simplificado** para [OpenCode](https://opencode.ai). Estructura el ciclo de vida del desarrollo de software en **4 Fases secuenciales**, garantizando que ningún modelo de IA escriba código de producción sin planificación previa, revisión humana en los puntos clave y cierre documentado en Git.

---

## 🧠 Filosofía: SDD Simplificado

**Ningún agente toca código sin un plan aprobado.** El ciclo SDD de Zugzbot se compone de 4 hitos y 4 agentes especializados que se pasan el control entre sí de forma atómica:

```mermaid
flowchart LR
    classDef phase fill:#141724,stroke:#38bdf8,color:#f8fafc,stroke-width:1.5px
    classDef user  fill:#1d1b30,stroke:#b175ff,color:#f3ebff,stroke-width:1.5px
    classDef hil   fill:#2b161d,stroke:#fbbf24,color:#fff,stroke-width:1.5px

    U1(["👤 Usuario\npide feature"]):::user
    F0["🔭 Fase 0\nDiagnóstico\n@sdd-explorer"]:::phase
    F1["📝 Fase 1\nPlanificación\n@sdd-planner"]:::phase
    HIL1{{"✋ Hito A\n¿Apruebas\nel plan?"}}:::hil
    F2["💻 Fase 2\nConstrucción\n@sdd-builder"]:::phase
    HIL2{{"✋ Hito B\n¿Conforme\ncon el deploy?"}}:::hil
    F3["📦 Fase 3\nCierre & Git\n@sdd-archiver"]:::phase
    U2(["🎉 Feature\ncerrada en Git"]):::user

    U1 --> F0 --> F1 --> HIL1
    HIL1 -- "Sí" --> F2 --> HIL2
    HIL1 -- "No" --> F1
    HIL2 -- "Sí" --> F3 --> U2
    HIL2 -- "Detalles" --> F2
```

> [!NOTE]
> La **Fase 0** se ejecuta **solo una vez por proyecto** (si `.openspec/diagnostics.md` no existe). En ciclos posteriores, `@zugzbot` salta directamente a la Fase 1.

---

## 🤖 Elenco de Agentes

### Agentes del Ciclo Core SDD

| Agente | Rol | Fase | Entregable |
|:---|:---|:---:|:---|
| **`zugzbot`** | Orquestador Maestro — coordina, delega y gestiona las pausas HIL con el usuario | Permanente | Roadmap 4 fases en cada respuesta |
| **`sdd-explorer`** | Diagnosticador — escanea el stack, ejecuta `npx autoskills` y genera el mapa técnico | **F0** | `.openspec/diagnostics.md` + `skills_manifest.md` |
| **`sdd-planner`** | Planificador — interroga al usuario (3–5 preguntas), genera la especificación BDD | **F1** | `.openspec/changes/<name>/specs/spec.md` |
| **`sdd-builder`** | Constructor — implementa el código, ejecuta linter/tests y levanta el entorno local | **F2** | Código funcional + `verification_report.md` |
| **`sdd-archiver`** | Archivador — bump de versión, CHANGELOG, commit semántico y cierre del ciclo | **F3** | `commit_message.txt` + carpeta archivada |

### Agentes Auxiliares

| Agente | Rol |
|:---|:---|
| **`aux-oracle`** | Análisis conceptual y consultas sin modificar código |
| **`aux-handyman`** | Cambios atómicos urgentes (≤ 3 archivos) sin abrir ciclo SDD completo |

---

## 📂 Estructura de Archivos Post-Instalación

```
tu-proyecto/
├── .opencode/
│   ├── agents/
│   │   ├── zugzbot.md           # Orquestador Maestro
│   │   ├── sdd-explorer.md      # Fase 0: Diagnóstico e Indexación
│   │   ├── sdd-planner.md       # Fase 1: Planificación e Interrogatorio
│   │   ├── sdd-builder.md       # Fase 2: Construcción Lógica/Estética
│   │   ├── sdd-archiver.md      # Fase 3: Documentación y Cierre
│   │   ├── aux-oracle.md        # Consultor sin side-effects
│   │   └── aux-handyman.md      # Parches rápidos < 3 archivos
│   ├── commands/                # Comandos slash de OpenCode
│   ├── skills/                  # Skills de IA (custom + autoskills)
│   ├── tools/                   # Herramientas personalizadas (sdd_transition.ts)
│   └── plugins/
│       └── plugin_tui.tsx       # Monitor SDD reactivo en el sidebar
├── .openspec/
│   ├── changes/                 # Ciclos de cambio activos/archivados
│   │   └── <change-name>/
│   │       ├── specs/spec.md    # Plano técnico BDD (output @sdd-planner)
│   │       └── verification_report.md
│   ├── diagnostics.md           # Mapa técnico del proyecto (output @sdd-explorer)
│   ├── skills_manifest.md       # Skills detectadas por autoskills
│   ├── brain.md                 # Memoria a largo plazo del proyecto
│   ├── prompt_base.md           # Personalidad global del swarm
│   └── sdd-lock.json            # Máquina de estados del ciclo activo
├── opencode.json                # Configuración LSP + permisos por agente
├── tui.json                     # Registro del plugin TUI
└── AGENTS.md                    # Reglamento global del swarm (SDD Rules)
```

---

## 🛠️ CLI Local (`sdd`)

El arnés incluye la utilidad `zugz-plugin/sdd` (script Bash portátil). Cópiala o enlázala en tu proyecto para controlar el ciclo desde terminal:

```bash
# Ver estado actual del ciclo y progreso de las 4 fases
./zugz-plugin/sdd status

# Abrir el Dashboard HTML premium en el navegador
./zugz-plugin/sdd dashboard

# Validar consistencia de artefactos del cambio activo
./zugz-plugin/sdd validate

# Ejecutar suite de linter del proyecto
./zugz-plugin/sdd lint

# Ejecutar suite de tests del proyecto
./zugz-plugin/sdd test

# Purgar logs temporales y resetear lockfile a Fase 0
./zugz-plugin/sdd clean

# Descartar cambios del ciclo actual (git reset --hard)
./zugz-plugin/sdd rollback
```

---

## 🔌 Plugin TUI — Monitor SDD en Tiempo Real

El plugin `plugin_tui.tsx` inyecta un **monitor reactivo** en el panel lateral de OpenCode (tecla **`b`**) que muestra:

- 🔶 Logo animado ZUGZ con efecto de ola naranja
- 📊 Progreso de las **4 fases** con íconos `✓ / ⚡ / ○`
- 💰 Métricas de costo y tokens por agente en tiempo real

El plugin sondea `.openspec/sdd-lock.json` cada 2 segundos para actualizar el estado sin reinicios.

---

## 📦 Instalación en tu Proyecto

### GitHub

```bash
rm -rf /tmp/zugzbot \
  && git clone --depth=1 --branch plugin_opencode_v4 https://github.com/Danielisla96/zugzbot.git /tmp/zugzbot \
  && /tmp/zugzbot/install-plugin.sh "$(pwd)" \
  && rm -rf /tmp/zugzbot
```

### GitLab (si tienes mirror del repo)

```bash
rm -rf /tmp/zugzbot \
  && git clone --depth=1 --branch plugin_opencode_v4 https://gitlab.com/TU_NAMESPACE/zugzbot.git /tmp/zugzbot \
  && /tmp/zugzbot/install-plugin.sh "$(pwd)" \
  && rm -rf /tmp/zugzbot
```

> [!TIP]
> Si tu repositorio de GitLab es privado, usa el token de acceso personal:
> ```bash
> rm -rf /tmp/zugzbot \
>   && git clone --depth=1 --branch plugin_opencode_v4 https://oauth2:TU_TOKEN@gitlab.com/TU_NAMESPACE/zugzbot.git /tmp/zugzbot \
>   && /tmp/zugzbot/install-plugin.sh "$(pwd)" \
>   && rm -rf /tmp/zugzbot
> ```

#### ¿Qué hace el instalador?
1. Clona el repositorio de forma efímera en `/tmp/`.
2. Copia `agents/`, `commands/`, `skills/`, `tools/`, `plugins/` a `.opencode/`.
3. Genera `opencode.json` (LSP + permisos) y `AGENTS.md` si no existen.
4. Crea `tui.json` para registrar el plugin TUI.
5. Instala dependencias en `.opencode/` via `bun` (o `npm` como fallback).
6. Elimina la caché temporal de clonación.

---

### Instalación en Modo Desarrollo (Enlace Simbólico)

Si estás modificando el arnés y quieres probar cambios en tiempo real:

```bash
./install-plugin.sh
```

Crea symlinks de `zugz-plugin/` → `.opencode/` para que OpenCode refleje los cambios al instante.

---

## 🚀 Uso

Una vez instalado, abre tu proyecto con OpenCode:

```bash
opencode
```

Habla con `@zugzbot` para iniciar un ciclo SDD:

> `@zugzbot` quiero agregar autenticación con JWT al backend.

`@zugzbot` responderá mostrando el roadmap de 4 fases, delegará a `@sdd-explorer` (si es el primer ciclo) y luego a `@sdd-planner` con la encuesta de 3–5 preguntas.

---

## ⚙️ Configuración LSP (`opencode.json`)

El instalador genera automáticamente la configuración de LSP para TypeScript/JavaScript y archivos `.gs` (Google Apps Script):

```json
{
  "lsp": {
    "typescript": {
      "command": ["typescript-language-server", "--stdio"],
      "extensions": [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".gs"]
    }
  }
}
```

---

## 📜 Reglamento Global (`AGENTS.md`)

Todos los agentes operan bajo `AGENTS.md`, que garantiza:

1. **No código sin plan** — ningún agente escribe código sin que `spec.md` exista y esté aprobado.
2. **Lazy Loading** — los agentes cargan solo los archivos listados en `INPUTS`, nunca rastrean el proyecto completo.
3. **Respuestas de alta densidad** — prohibida la verborrea redundante; máximo 1–2 párrafos de instrucción por delegación.
4. **Cooldown de dependencias** — cualquier paquete nuevo debe tener ≥ 3 días publicado antes de ser importado.

---

## 🤝 Contribuir

1. Haz fork del repo.
2. Crea una rama: `git checkout -b feat/mi-mejora`.
3. Abre un ciclo SDD dentro del mismo repo: habla con `@zugzbot`.
4. Haz PR con el `commit_message.txt` generado por `@sdd-archiver`.
