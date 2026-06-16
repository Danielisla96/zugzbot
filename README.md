# 🤖 Zugzbot Harness

> El instalador definitivo de arneses **SDD (Spec-Driven Development)** para proyectos potenciados por OpenCode.

**Zugzbot Harness** es un ecosistema autónomo de agentes de inteligencia artificial y herramientas diseñados para programar de forma rigurosa, segura y 100% autodirigida. El corazón de este arnés es la metodología **SDD**, un flujo de trabajo estructurado en el que ningún agente escribe una sola línea de código sin antes validar un contrato estricto de especificación.

Este repositorio ha sido empaquetado como un instalador interactivo global de NPM para que puedas inyectar este poderoso entorno de desarrollo en cualquier proyecto nuevo o existente en cuestión de segundos.

---

## 🚀 Instalación y Uso Rápido

Para inyectar el arnés de Zugzbot en cualquier directorio o proyecto de tu computadora, simplemente abre una terminal en la carpeta raíz de tu proyecto de destino y ejecuta:

```bash
npx zugzbot
```

¡Eso es todo! El instalador automatizado copiará de forma no destructiva y fusionará los siguientes recursos en tu proyecto:

*   📁 **`.opencode/`** — El núcleo del sistema: agentes, comandos, skills y herramientas personalizadas (incluyendo el catálogo offline de **Oh My Design** con 246 marcas).
*   ⚙️ **`opencode.json`** — La configuración maestra de seguridad, variables de entorno, plugins y servidores MCP de tu bot.
*   🖥️ **`tui.json`** — Configuración personalizada para la interfaz interactiva de terminal (TUI).

---

## 🏗️ ¿Cómo Funciona el Arnés? (Arquitectura bajo el capó)

El arnés se compone de tres pilares fundamentales que garantizan un desarrollo libre de errores, regresiones o improvisaciones:

### 1. Las 5 Fases del Ciclo SDD (Spec-Driven Development)
El desarrollo se ejecuta secuencialmente a través de cinco fases estrictas, controladas por el estado global de la sesión (`sdd_get_state` y `sdd_set_phase`):

```
 ┌──────────────┐      ┌────────────────┐      ┌────────────────────┐      ┌─────────────────┐      ┌───────────────┐
 │  F0_DETECT   │ ───> │  F1_CONTRACT   │ ───> │ F2_IMPLEMENTATION  │ ───> │ F3_VERIFICATION │ ───> │ F4_DEPLOYMENT │
 └──────────────┘      └────────────────┘      └────────────────────┘      └─────────────────┘      └───────────────┘
  Descubrimiento         Especificación             Codificación                Validación              Despliegue
  Stack & Diseño         Crear contrato         Fuerza de Coder & UI         Unit/Visual tests         Docker/Build
```

*   **`F0_DETECT` (Descubrimiento)**: Se analiza el código actual, se detecta el stack base (ej. Next.js 16 + Tailwind v4 o FastAPI + Pydantic) y se busca la marca visual deseada (Toss, Stripe, Vercel, etc.) usando el catálogo de diseño.
*   **`F1_CONTRACT` (Especificación)**: El agente redactor genera un archivo estricto de contrato en `.openspec/specs/XXXX_contract.json` (OpenAPI, esquemas de entrada/salida, requerimientos de UI exactos y casos de prueba detallados). El desarrollo no avanza hasta que este contrato esté validado y sellado.
*   **`F2_IMPLEMENTATION` (Codificación)**: El programador arranca la infraestructura y codifica los archivos ajustándose estrictamente a los tipos, rutas y componentes del contrato aprobado en la fase F1.
*   **`F3_VERIFICATION` (Validación)**: Se corren pruebas unitarias, de integración y visuales (utilizando Playwright). El compilador de TypeScript (`tsc`) y el linter (`eslint`) actúan como gates de control Shift-Left automáticos.
*   **`F4_DEPLOYMENT` (Despliegue)**: Se genera la build de producción, se limpia el entorno de Docker de forma agresiva y se levanta la aplicación localmente en contenedores optimizados.

---

### 2. El Ecosistema de Sub-Agentes Autónomos

`opencode.json` registra y configura un equipo especializado de agentes, cada uno con prompts personalizados, temperaturas específicas y permisos de seguridad acotados para evitar efectos colaterales no deseados:

*   👤 **`sdd-orchestrator` (El Director)**: Es el coordinador de alto nivel del flujo completo. Lee el Brain, coordina las transiciones de fases y delega las tareas técnicas a los sub-agentes correspondientes. No tiene permisos de escritura o ejecución de comandos directos para garantizar la seguridad.
*   ✍️ **`sdd-spec-writer` (El Arquitecto)**: Redacta y valida de forma matemática las especificaciones OpenAPI y los escenarios de prueba en `.openspec/specs/`.
*   💻 **`sdd-coder` (El Desarrollador)**: Implementa la lógica de backend y los componentes de frontend (Shadcn/Tailwind) respetando al 100% los contratos de F1. Tiene permisos controlados para ejecutar linters y comandos de compilación.
*   🧪 **`sdd-tester` (El Auditor de Calidad)**: Diseña las suites de pruebas y las ejecuta de forma concurrente, recopilando evidencias visuales, reportes y traces.
*   🚢 **`sdd-deployer` (El DevOps)**: Gestiona la infraestructura, empaquetado multi-stage, configuraciones de red y levantamiento local mediante contenedores Docker.

---

### 3. Servidores MCP (Model Context Protocol) de Clase Mundial

El arnés inyecta y habilita automáticamente varios servidores MCP avanzados en tu espacio de trabajo para dar soporte contextual al bot:

*   📚 **`oh-my-design` (MCP de Diseño Offline)**:
    Servidor oficial que empaqueta **246 marcas de diseño icónicas** (Toss, Stripe, Supabase, Linear, etc.). Permite buscar especificaciones estéticas (`DESIGN.md`), paletas de colores exactas, tipografía y plantillas HTML interactivas de previsualización 100% offline (sin llamadas a APIs ni coste de tokens).
*   🎨 **`shadcn` (MCP de Interfaz de Usuario)**:
    Permite explorar, buscar e instalar de forma instantánea componentes del registro oficial de Shadcn UI (botones, inputs, cards, dashboards completos) directamente desde la terminal.
*   🔍 **`context7` (MCP de Consultas de Documentación)**:
    Realiza búsquedas contextuales de APIs actualizadas para librerías y frameworks directamente en la nube, previniendo que los agentes utilicen sintaxis obsoletas o inventadas.
*   🎭 **`playwright` (MCP de Navegador y Automatización)**:
    Ejecuta pruebas visuales de extremo a extremo, realiza capturas de pantalla, toma videos de interacciones y genera traces de auditoría visuales para guardarlos ordenadamente en `.openspec/`.
*   ✨ **`lucide-icons` (MCP de Iconos)**:
    Valida de forma exacta nombres de iconos de Lucide React y obtiene ejemplos de código JSX listos para copiar y pegar.

---

## 🧠 Sistema de Memoria Compartida (Shared Brain)

Para evitar la pérdida de contexto entre turnos y agentes, el arnés implementa un sistema de memoria centralizado en `.openspec/brain.md` (o archivo similar configurado), gestionado por las herramientas `brain_save_memory` y `brain_read_memory`.

*   **Guardar Lecciones**: Cuando un agente soluciona un bug complejo de ruteo, un error visual en Tailwind, o define una decisión clave de arquitectura, la registra de forma concisa y acumulativa con marca de tiempo en categorías como `learnings`, `design`, `routing`, o `errors`.
*   **Lectura al Inicio**: Al arrancar una nueva sesión, el orquestador lee selectivamente las categorías de memoria activa para absorber aprendizajes previos y evitar cometer el mismo error dos veces.

---

## 🎯 Configuración Rápida de Modelos de IA

El arnés de Zugzbot incluye un sistema de asignación de modelos centralizado, ágil e interactivo. La configuración se almacena en el archivo `models.json` en la raíz de tu proyecto.

### 1. El Archivo `models.json`
El formato de este archivo es muy simple e intuitivo:
```json
{
  "global": "deepseek/deepseek-v4-flash",
  "sdd-orchestrator": "",
  "sdd-spec-writer": "",
  "sdd-coder": "google/gemini-2.5-pro",
  "sdd-tester": "",
  "sdd-deployer": ""
}
```
*   **Modelo Global**: Define el modelo predeterminado (`"global"`) que usarán los agentes por defecto.
*   **Heredar del Global**: Si dejas el modelo de un agente vacío (`""`), el sistema le asignará automáticamente el modelo `"global"`.
*   **Personalización**: Si quieres que un agente en particular use un modelo diferente (ej. un modelo de razonamiento o de programación más potente), escribe el identificador del modelo directamente en su clave.

### 2. Sincronización Automática
¡No tienes que hacer nada manual! Al abrir la interfaz de **OpenCode**, el plugin integrado detecta y lee de forma automática tu `models.json`, actualizando instantáneamente `opencode.json` y los markdown de tus agentes en disco con total transparencia.

### 3. Interfaz Visual en Terminal (TUI)
Para cambiar de modelos de forma cómoda y sin riesgo de cometer errores tipográficos en los identificadores de IA, puedes abrir la **interfaz visual interactiva** en tu terminal.

Ejecuta el script sin argumentos:
```bash
python3 .utils/toggle_model.py
```

*   **Menú Principal**: Muévete con las flechas `[↑/↓]` y presiona `[Enter]` para editar el modelo global o el de un agente específico.
*   **Selector con Buscador**: Dentro del selector de modelos, puedes empezar a escribir para filtrar la lista en tiempo real por palabra clave (ej. *"gemini"* o *"deepseek"*).
*   **Guardar y Aplicar**: Selecciona `[✓ GUARDAR Y APLICAR CAMBIOS]` o pulsa la tecla `[G]` para persistir la configuración e inyectarla en todos tus agentes al instante.

*Nota: Sigue siendo compatible con la CLI tradicional rápida. Por ejemplo, `python3 .utils/toggle_model.py google/gemini-3.5-flash` actualizará de inmediato tu modelo global en modo lote no interactivo.*

---

## 🔄 Modo Autopiloto (/loop)

El arnés de Zugzbot viene preparado de forma nativa para soportar el **Modo Autopiloto** mediante el comando `/loop` en OpenCode.

Cuando `loopMode === true`:
1.  **Cero Preguntas**: Los agentes tienen estrictamente prohibido usar la herramienta `question` para interrumpir el flujo. Toman decisiones óptimas por defecto de forma autónoma.
2.  **Enforcer de Barrera**: Cualquier intento de lanzar preguntas al usuario es cancelado mecánicamente por el plugin de OpenCode.
3.  **Bucle de Corrección Continua**: Si una fase de pruebas o compilación falla, el arnés realiza rollbacks incrementales, autodiagnostica el error con las herramientas de validación, corrige el código y vuelve a probar de forma recursiva hasta lograr la estabilidad.

---

## 🛠️ Desarrollo Local (Para Desarrolladores del Arnés)

Si deseas realizar modificaciones en este instalador o probar el código localmente:

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/Danielisla96/zugzbot.git
    cd zugzbot
    ```
2.  Instala las dependencias y crea el enlace local global:
    ```bash
    npm install
    npm link
    ```
3.  Prueba el instalador en cualquier directorio ejecutando directamente:
    ```bash
    zugzbot
    ```

---

## 📦 Publicación de Actualizaciones en NPM

Para publicar una nueva versión de Zugzbot en el registro público de NPM:

1.  Incrementa la versión en el `package.json` de la raíz (ej. `1.0.1`).
2.  Compila el servidor standalone de `oh-my-design` (si modificaste código TypeScript del MCP) ejecutando en la carpeta `.opencode/oh-my-design/packages/mcp`:
    ```bash
    npm run build
    ```
3.  Inicia sesión y publica desde la raíz de tu proyecto:
    ```bash
    npm login
    npm publish --access public
    ```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Siéntete libre de clonarlo, modificarlo y adaptarlo para construir tus propios equipos de agentes automatizados.
