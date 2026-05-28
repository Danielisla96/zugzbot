# 🚀 Desarrollo Guiado por Especificaciones (SDD) con Zugzbot

Este repositorio utiliza **Zugzbot**, un arnés de desarrollo basado en un enjambre de 5 agentes autónomos de Inteligencia Artificial que operan bajo la metodología **Spec-Driven Development (SDD)** Simplificada.

Esto garantiza cambios de código quirúrgicos, sin errores, con especificaciones técnicas claras y validación manual obligatoria antes de consolidar cambios.

---

## ⚡ Instalación Rápida (One-Step Setup)

Si acabas de clonar este repositorio y quieres activar el arnés en tu máquina, sigue estos sencillos pasos:

### 1. Requisitos Previos
Debes tener instalado **OpenCode** (la terminal interactiva de IA). Si no la tienes, instálala ejecutando:
```bash
npm install -g @opencode-ai/cli
```

### 2. Hidratar el Arnés
Ejecuta el instalador apuntando a la raíz de este proyecto. Puedes hacerlo de dos formas:

* **Opción A (Desde tu repositorio local de Zugzbot):**
  ```bash
  /ruta/a/tu/zugzbot/install-plugin.sh .
  ```
* **Opción B (Mediante descarga directa rápida desde GitHub):**
  Puedes descargar y ejecutar el instalador directamente desde la rama principal (`main`):
  ```bash
  rm -rf /tmp/zugzbot \
    && git clone --depth=1 --branch main https://github.com/Danielisla96/zugzbot.git /tmp/zugzbot \
    && /tmp/zugzbot/install-plugin.sh "$(pwd)" \
    && rm -rf /tmp/zugzbot
  ```

Este comando:
1. Creará tu directorio local oculto `.opencode/` con todo el motor de agentes y herramientas.
2. Configurará tu cargador local de interfaz `tui.json`.
3. Configurará automáticamente tu archivo `.gitignore` local para no subir archivos basura a Git.
4. Instalará las dependencias necesarias de forma totalmente aislada.

---

## 🔄 Flujo de Trabajo Diario (Ciclo SDD de 4 Fases)

Para realizar cualquier modificación de código, arreglo de bug o agregar una nueva característica:

1. **Abre OpenCode en la raíz del proyecto:**
   ```bash
   opencode
   ```
2. **Habla con `@zugzbot`** indicándole tu requerimiento.
3. **Sigue las fases automatizadas del Swarm:**

| Fase | Agente Activo | Tu Rol (Compañero Humano) |
| :--- | :--- | :--- |
| **F1: Planificación** | `@sdd-planner` | **Responder la encuesta consolidada** de 3-5 preguntas concretas. Dar el visto bueno a la especificación técnica en `.openspec/changes/.../specs/spec.md`. |
| **F2: Construcción** | `@sdd-builder` | Esperar el despliegue automático del código. **Hacer QA manual** en caliente y dar tu feedback o visto bueno definitivo. |
| **F3: Calidad** | `@sdd-tester` | Observar el reporte de validación estática y auditoría visual de DOM (`verification_report.md`). |
| **F4: Cierre** | `@sdd-archiver` | Revisar el mensaje de Git sugerido, confirmar el bump de versión y consolidar el cambio a tu rama Git. |

---

## 📂 Anatomía de Archivos (Compartidos vs Locales)

Para mantener el repositorio host impecable y evitar subir archivos temporales de tu espacio de trabajo local, la estructura está dividida estrictamente:

### 🟢 Archivos de Equipo (Se suben a Git - Versión Controlada)
* `AGENTS.md`: Las directrices globales de IA y las convenciones del repositorio.
* `opencode.json`: Declaración de agentes y permisos generales del equipo.
* `.openspec/changes/`: El registro histórico de todas las especificaciones y reportes técnicos creados.
* `.openspec/brain.md`: La base de conocimiento técnico acumulado del proyecto.

### 🔴 Archivos Personales (Ignorados por `.gitignore` - Locales)
* `.opencode/`: Todo el código motor del arnés de agentes, herramientas y node_modules locales.
* `tui.json`: Archivo de configuración visual que enlaza el plugin TUI del desarrollador.
* `.openspec/sdd-lock.json`: El archivo candado que bloquea y registra la fase activa del ciclo actual en tu máquina.

---

## 🛠️ Personalización de Modelos

Por defecto, el swarm viene preconfigurado con un modelo ultra-rápido y eficiente (`gemini-3.5-flash`). Si necesitas cambiar los modelos para tu sesión local (por ejemplo, para usar Claude Sonnet o GPT-5 en tareas complejas):

1. **Abre `.opencode/agents/[agente].md`** correspondiente.
2. Modifica el campo `model` en el encabezado (frontmatter):
   ```markdown
   ---
   model: anthropic/claude-sonnet-4.5
   ---
   ```
Al estar `.opencode/` en el `.gitignore`, **esta personalización de modelos se mantendrá local en tu máquina** y no afectará el presupuesto ni la configuración del resto del equipo.
