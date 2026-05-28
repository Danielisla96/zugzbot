# SDK

Cliente JS con seguridad de tipos para el servidor opencode.

El SDK opencode JS/TS proporciona un cliente con seguridad de tipos para interactuar con el servidor. Úselo para crear integraciones y controlar opencode mediante programación.

[Más información](https://opencode.ai/docs/server) sobre cómo funciona el servidor. Para ver ejemplos, consulte los [proyectos](https://opencode.ai/docs/ecosystem#projects) creados por la comunidad.

---

## [Instalar](#instalar)

Instale el SDK desde npm:

**File**: Ventana de terminal

```bash
npm install @opencode-ai/sdk
```

---

## [Crear cliente](#crear-cliente)

Cree una instancia de opencode:

**File**:

```javascript
import { createOpencode } from "@opencode-ai/sdk"

const { client } = await createOpencode()
```

Esto inicia tanto un servidor como un cliente.

#### [Opciones](#opciones)
 ``````````````````````````````

| Opción Tipo Descripción Predeterminado |
| --- |
| hostname string Nombre de host del servidor 127.0.0.1 |
| port number Puerto del servidor 4096 |
| signal AbortSignal Señal de aborto para cancelación undefined |
| timeout number Tiempo de espera en ms para inicio del servidor 5000 |
| config Config Objeto de configuración {} |


---

## [Configuración](#configuración)

Puede pasar un objeto de configuración para personalizar el comportamiento. La instancia aún recoge su `opencode.json`, pero puede anular o agregar configuración en línea:

**File**:

```javascript
import { createOpencode } from "@opencode-ai/sdk"

const opencode = await createOpencode({
  hostname: "127.0.0.1",
  port: 4096,
  config: {
    model: "anthropic/claude-3-5-sonnet-20241022",
  },
})

console.log(`Server running at ${opencode.server.url}`)

opencode.server.close()
```

## [Solo cliente](#solo-cliente)

Si ya tiene una instancia en ejecución de opencode, puede crear una instancia de cliente para conectarse a ella:

**File**:

```javascript
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
})
```

#### [Opciones](#opciones-1)
 ``````````````````````````````````

| Opción Tipo Descripción Predeterminado |
| --- |
| baseUrl string URL del servidor http://localhost:4096 |
| fetch function Implementación de recuperación personalizada globalThis.fetch |
| parseAs string Método de análisis de respuesta auto |
| responseStyle string Estilo de devolución: data o fields fields |
| throwOnError boolean Lanzar errores en lugar de devolver false |


---

## [Tipos](#tipos)

El SDK incluye definiciones TypeScript para todos los tipos API. Importarlos directamente:

**File**:

```typescript
import type { Session, Message, Part } from "@opencode-ai/sdk"
```

Todos los tipos se generan a partir de la especificación OpenAPI del servidor y están disponibles en el [archivo de tipos](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts).

---

## [Errores](#errores)

El SDK puede generar errores que puedes detectar y manejar:

**File**:

```typescript
try {
  await client.session.get({ path: { id: "invalid-id" } })
} catch (error) {
  console.error("Failed to get session:", (error as Error).message)
}
```

---

## [Salida Estructurada](#salida-estructurada)

Puede solicitar una salida JSON estructurada del modelo especificando un `format` con un esquema JSON. El modelo utilizará una herramienta `StructuredOutput` para devolver un JSON validado que coincida con su esquema.

### [Uso Básico](#uso-básico)

**File**:

```typescript
const result = await client.session.prompt({
  path: { id: sessionId },
  body: {
    parts: [{ type: "text", text: "Research Anthropic and provide company info" }],
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          company: { type: "string", description: "Company name" },
          founded: { type: "number", description: "Year founded" },
          products: {
            type: "array",
            items: { type: "string" },
            description: "Main products",
          },
        },
        required: ["company", "founded"],
      },
    },
  },
})

// Access the structured output
console.log(result.data.info.structured_output)
// { company: "Anthropic", founded: 2021, products: ["Claude", "Claude API"] }
```

### [Tipos de Formato de Salida](#tipos-de-formato-de-salida)
 ````

| Tipo Descripción |
| --- |
| text Predeterminado. Respuesta de texto estándar (sin salida estructurada) |
| json_schema Devuelve JSON validado que coincide con el esquema proporcionado |


### [Formato de Esquema JSON](#formato-de-esquema-json)

Cuando use `type: 'json_schema'`, proporcione:
 ````````````

| Campo Tipo Descripción |
| --- |
| type 'json_schema' Requerido. Especifica el modo de esquema JSON |
| schema object Requerido. Objeto JSON Schema que define la estructura de salida |
| retryCount number Opcional. Número de reintentos de validación (predeterminado: 2) |


### [Manejo de Errores](#manejo-de-errores)

Si el modelo no logra producir una salida estructurada válida después de todos los reintentos, la respuesta incluirá un `StructuredOutputError`:

**File**:

```typescript
if (result.data.info.error?.name === "StructuredOutputError") {
  console.error("Failed to produce structured output:", result.data.info.error.message)
  console.error("Attempts:", result.data.info.error.retries)
}
```

### [Mejores Prácticas](#mejores-prácticas)

1. **Proporcione descripciones claras** en las propiedades de su esquema para ayudar al modelo a entender qué datos extraer
1. **Use `required`** para especificar qué campos deben estar presentes
1. **Mantenga los esquemas enfocados** - los esquemas anidados complejos pueden ser más difíciles de completar correctamente para el modelo
1. **Establezca un `retryCount` apropiado** - aumente para esquemas complejos, disminuya para simples

---

## [API](#api)

El SDK expone todas las API del servidor a través de un cliente con seguridad de tipos.

---

### [Global](#global)
 ````

| Método Descripción Respuesta |
| --- |
| global.health() Verificar el estado y la versión del servidor { healthy: true, version: string } |


---

#### [Ejemplos](#ejemplos)

**File**:

```javascript
const health = await client.global.health()
console.log(health.data.version)
```

---

### [Aplicación](#aplicación)
 ````````[Agent[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)

| Método Descripción Respuesta |
| --- |
| app.log() Escribe una entrada de registro boolean |
| app.agents() Listar todos los agentes disponibles |


---

#### [Ejemplos](#ejemplos-1)

**File**:

```javascript
// Write a log entry
await client.app.log({
  body: {
    service: "my-app",
    level: "info",
    message: "Operation completed",
  },
})

// List available agents
const agents = await client.app.agents()
```

---

### [Proyecto](#proyecto)
 ````[Project[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Project](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)

| Método Descripción Respuesta |
| --- |
| project.list() Listar todos los proyectos |
| project.current() Obtener proyecto actual |


---

#### [Ejemplos](#ejemplos-2)

**File**:

```javascript
// List all projects
const projects = await client.project.list()

// Get current project
const currentProject = await client.project.current()
```

---

### [Ruta](#ruta)
 ````[Path](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)

| Método Descripción Respuesta |
| --- |
| path.get() Obtener ruta actual |


---

#### [Ejemplos](#ejemplos-3)

**File**:

```javascript
// Get current path information
const pathInfo = await client.path.get()
```

---

### [Configuración](#configuración-1)
 ````[Config](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)``````[Provider[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)``

| Método Descripción Respuesta |
| --- |
| config.get() Obtener información de configuración |
| config.providers() Lista de proveedores y modelos predeterminados { providers: , default: { [key: string]: string } } |


---

#### [Ejemplos](#ejemplos-4)

**File**:

```javascript
const config = await client.config.get()

const { providers, default: defaults } = await client.config.providers()
```

---

### [Sesiones](#sesiones)
 ````[Session[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Session](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Session[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Session](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````````[Session](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)``````````````[Session](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Session](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)``````````[Message](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Part[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````````[Message](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Part[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````````[AssistantMessage](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)``[salida estructurada](#salida-estructurada)``````[AssistantMessage](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Part[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)``````[AssistantMessage](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Session](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````[Session](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````

| Método Descripción Notas |
| --- |
| session.list() Listar sesiones Devuelve |
| session.get({ path }) Obtener sesión Devuelve |
| session.children({ path }) Listar sesiones secundarias Devuelve |
| session.create({ body }) Crear sesión Devuelve |
| session.delete({ path }) Eliminar sesión Devuelve boolean |
| session.update({ path, body }) Actualizar propiedades de sesión Devuelve |
| session.init({ path, body }) Analizar aplicación y crear AGENTS.md Devuelve boolean |
| session.abort({ path }) Cancelar una sesión en ejecución Devuelve boolean |
| session.share({ path }) Compartir sesión Devuelve |
| session.unshare({ path }) Dejar de compartir sesión Devuelve |
| session.summarize({ path, body }) Resumir sesión Devuelve boolean |
| session.messages({ path }) Listar mensajes en una sesión Devuelve { info: , parts: }[] |
| session.message({ path }) Obtener detalles del mensaje Devuelve { info: , parts: } |
| session.prompt({ path, body }) Enviar mensaje rápido body.noReply: true devuelve UserMessage (solo contexto). El valor predeterminado devuelve con respuesta de IA. Admite body.outputFormat para |
| session.command({ path, body }) Enviar comando a la sesión Devuelve { info: , parts: } |
| session.shell({ path, body }) Ejecute un comando de shell Devuelve |
| session.revert({ path, body }) Revertir un mensaje Devuelve |
| session.unrevert({ path }) Restaurar mensajes revertidos Devuelve |
| postSessionByIdPermissionsByPermissionId({ path, body }) Responder a una solicitud de permiso Devuelve boolean |


---

#### [Ejemplos](#ejemplos-5)

**File**:

```javascript
// Create and manage sessions
const session = await client.session.create({
  body: { title: "My session" },
})

const sessions = await client.session.list()

// Send a prompt message
const result = await client.session.prompt({
  path: { id: session.id },
  body: {
    model: { providerID: "anthropic", modelID: "claude-3-5-sonnet-20241022" },
    parts: [{ type: "text", text: "Hello!" }],
  },
})

// Inject context without triggering AI response (useful for plugins)
await client.session.prompt({
  path: { id: session.id },
  body: {
    noReply: true,
    parts: [{ type: "text", text: "You are a helpful assistant." }],
  },
})
```

---

### [Archivos](#archivos)
 ````````````````````[Symbol[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)````````[File[]](https://github.com/anomalyco/opencode/blob/dev/packages/sdk/js/src/gen/types.gen.ts)

| Método Descripción Respuesta |
| --- |
| find.text({ query }) Buscar texto en archivos Matriz de objetos coincidentes con path , lines , line_number , absolute_offset , submatches |
| find.files({ query }) Buscar archivos y directorios por nombre string[] (rutas) |
| find.symbols({ query }) Buscar símbolos del espacio de trabajo |
| file.read({ query }) Leer un archivo { type: "raw" \| "patch", content: string } |
| file.status({ query? }) Obtener el estado de los archivos rastreados |


`find.files` admite algunos campos de consulta opcionales:

- `type`: `"file"` o `"directory"`
- `directory`: anula la raíz del proyecto para la búsqueda.
- `limit`: resultados máximos (1–200)

---

#### [Ejemplos](#ejemplos-6)

**File**:

```javascript
// Search and read files
const textResults = await client.find.text({
  query: { pattern: "function.*opencode" },
})

const files = await client.find.files({
  query: { query: "*.ts", type: "file" },
})

const directories = await client.find.files({
  query: { query: "packages", type: "directory", limit: 20 },
})

const content = await client.file.read({
  query: { path: "src/index.ts" },
})
```

---

### [TUI](#tui)
 ````````````````````````````````````

| Método Descripción Respuesta |
| --- |
| tui.appendPrompt({ body }) Agregar texto al mensaje boolean |
| tui.openHelp() Abra el cuadro de diálogo de ayuda boolean |
| tui.openSessions() Abrir el selector de sesiones boolean |
| tui.openThemes() Abra el selector de temas boolean |
| tui.openModels() Abrir el selector de modelo boolean |
| tui.submitPrompt() Enviar el mensaje actual boolean |
| tui.clearPrompt() Borrar el mensaje boolean |
| tui.executeCommand({ body }) Ejecutar un comando boolean |
| tui.showToast({ body }) Mostrar notificación del brindis boolean |


---

#### [Ejemplos](#ejemplos-7)

**File**:

```javascript
// Control TUI interface
await client.tui.appendPrompt({
  body: { text: "Add this to prompt" },
})

await client.tui.showToast({
  body: { message: "Task completed", variant: "success" },
})
```

---

### [Autenticación](#autenticación)
 ````

| Método Descripción Respuesta |
| --- |
| auth.set({ ... }) Establecer credenciales de autenticación boolean |


---

#### [Ejemplos](#ejemplos-8)

**File**:

```javascript
await client.auth.set({
  path: { id: "anthropic" },
  body: { type: "api", key: "your-api-key" },
})
```

---

### [Eventos](#eventos)
 ``

| Método Descripción Respuesta |
| --- |
| event.subscribe() Transmisión de eventos enviados por el servidor Transmisión de eventos enviados por el servidor |


---

#### [Ejemplos](#ejemplos-9)

**File**:

```javascript
// Listen to real-time events
const events = await client.event.subscribe()
for await (const event of events.stream) {
  console.log("Event:", event.type, event.properties)
}
```
