# Skill: sdd-gitignore-manager

Este skill define cómo gestionar e ignorar inteligentemente archivos y carpetas temporales, de caché o de compilación en el archivo `.gitignore` del proyecto de manera interactiva.

## Cuándo activarme
- Cuando el desarrollador solicite actualizar o limpiar el `.gitignore`.
- Cuando se detecte una acumulación de archivos generados, temporales o cachés de compilación en la raíz o subcarpetas.
- El slash command `/gitignore` invoca este skill delegando en `@aux-handyman`.

---

## Flujo de Trabajo Obligatorio

### Paso 1: Escanear el Estado del Repositorio
1. Ejecuta `sdd_git_awareness` con `action: "status"` (o ejecuta `git status --porcelain` vía bash) para detectar archivos y carpetas no trackeados (líneas que inician con `??`).
2. Si no hay archivos no trackeados, detén el flujo e informa al usuario que el working tree está limpio y no hay nada que agregar al `.gitignore`.

### Paso 2: Clasificar y Discriminar
Analiza la lista de archivos/carpetas no trackeados para discriminar entre código fuente legítimo y archivos generados/temporales. Las siguientes reglas de clasificación aplican:

| Tipo de Archivo/Carpeta | Acción Sugerida | Ejemplos comunes |
|---|---|---|
| **Cachés y Temporales** | **Ignorar (Pre-seleccionar)** | `.next/`, `.nuxt/`, `.turbo/`, `node_modules/`, `.cache/`, `.eslintcache`, `tsconfig.tsbuildinfo`, `.vitest-cache/`, `npm-debug.log` |
| **Directorios de Compilación** | **Ignorar (Pre-seleccionar)** | `dist/`, `build/`, `out/`, `target/`, `bin/` (si contiene compilados) |
| **Entornos y Llaves** | **Ignorar (Pre-seleccionar)** | `.env`, `.env.local`, `.env.development`, `*.pem`, `*.key` |
| **Archivos de Sistema** | **Ignorar (Pre-seleccionar)** | `.DS_Store`, `Thumbs.db` |
| **Código Fuente y Configs** | **Trackear (No pre-seleccionar)** | `src/`, `components/`, `app/`, `package.json`, `tsconfig.json`, `next.config.js`, `*.ts`, `*.tsx`, `*.py`, `*.go` |

### Paso 3: Preguntar al Usuario (HIL)
Formula una única llamada a la herramienta `question` para que el desarrollador decida qué elementos ignorar.
- Configura `is_multi_select: true`.
- Lista las carpetas y archivos no trackeados detectados como opciones.
- Marca como **Recomendado** y preselecciona los patrones clasificados como generados, temporales, cachés o credenciales en el Paso 2.
- Permite al usuario deseleccionar o agregar patrones personalizados.

### Paso 4: Actualizar `.gitignore`
Una vez recibida la respuesta del usuario con los patrones a ignorar:
1. Lee el archivo `.gitignore` actual si existe.
2. Añade un comentario de separación claro: `# Agregado automáticamente por Zugzbot (Administración Interactiva)`.
3. Añade los patrones seleccionados por el usuario, evitando duplicar reglas existentes.
4. Escribe los cambios en el `.gitignore`.

---

## Tags
#git #gitignore #clean-code #handyman #maintenance
