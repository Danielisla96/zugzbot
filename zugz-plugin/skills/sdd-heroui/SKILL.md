---
name: sdd-heroui
description: Instrucciones y guías para integrar y construir interfaces con HeroUI v3 (React Aria + Tailwind CSS v4, open-source). Usar cuando el usuario haya elegido 'heroui' como biblioteca de componentes UI o cuando se requieran componentes accesibles de React 19+. NO usar para HeroUI Pro (@heroui-pro/react) — esa skill queda deprecada.
---

# SDD HeroUI Skill (v3 OSS)

Este skill define cómo configurar, estructurar e implementar componentes utilizando **HeroUI v3** — la librería open-source de UI para React construida sobre [React Aria Components](https://react-spectrum.adobe.com/react-aria/) y [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4).

> [!IMPORTANT]
> **Alcance**: HeroUI v3 OSS (`@heroui/react` + `@heroui/styles`). **NO incluye** HeroUI Pro (`@heroui-pro/react`) — los charts, chat-*, data-grid, kanban, kpi, command, etc. NO están en este skill. Si el usuario necesita esos, o (a) tiene licencia Pro y debe pedir explícitamente Pro, o (b) se construye un equivalente sobre v3 OSS + libs estándar (Recharts, dnd-kit, etc.).

## 0. Skills oficiales de HeroUI (incluso mejores que este)

Este plugin **incluye empaquetados los 3 skills oficiales** que `npx skills add heroui-inc/heroui` instala. **Usar estos en lugar de este skill cuando sea posible** — siempre están actualizados y vienen con scripts de Node.js que fetchean docs/source/styles de HeroUI en vivo:

| Skill oficial | Ubicación en plugin | Cuándo usar |
|---|---|---|
| **`heroui-react`** | `skills/heroui-react/` | **(Principal)** Cualquier trabajo con HeroUI v3 React. Incluye `scripts/list_components.mjs`, `get_component_docs.mjs`, `get_source.mjs`, `get_styles.mjs`, `get_theme.mjs`, `get_docs.mjs`. |
| **`heroui-migration`** | `skills/heroui-migration/` | Solo si el proyecto existente usa HeroUI v2 y hay que migrar a v3. |
| **`heroui-native`** | `skills/heroui-native/` | Solo si el target es **React Native** (móvil), NO web. |

Estos 3 skills se instalan también globalmente con:

```bash
npx skills add heroui-inc/heroui -y -g
```

El instalador `bin/zugzbot.js` ejecuta esto automáticamente al instalar `zugzbot-sdd`.

## 1. Detección de entorno (antes de instalar)

Antes de aplicar cualquier cambio, el agente **DEBE** analizar el proyecto:

1. **Framework base**: ¿`nextjs`, `vite-react`, `remix`, `astro`? (ver `docs/frameworks.md`).
2. **Package manager**: ¿`npm`, `pnpm`, `yarn`, `bun`? Detectar por presencia de `pnpm-lock.yaml` / `yarn.lock` / `bun.lockb` / `package-lock.json`.
3. **Versión de React**: leer `package.json` → `dependencies.react` / `devDependencies.react`. **DEBE ser >= 19.0.0** (HeroUI v3 requiere React 19+).
4. **Versión de Tailwind**: leer `package.json` o `tailwind.config.*` para v4 (v3 NO funciona — HeroUI v3 está construido sobre Tailwind v4).
5. **Entry CSS**: localizar `app/globals.css` (Next.js App Router), `pages/_app.tsx` + `styles/globals.css` (Pages), `src/index.css` o `src/App.css` (Vite), etc.

Si React < 19 o Tailwind no es v4, **detenerse** y reportar al usuario antes de instalar HeroUI.

## 2. Instalación rápida

```bash
npm i @heroui/styles @heroui/react
```

(equivalentes `pnpm add`, `yarn add`, `bun add` — usar el detectado en el paso 1).

### Importar los estilos (OBLIGATORIO, ORDEN IMPORTA)

En el archivo CSS principal detectado en el paso 1:

```css
@import "tailwindcss";
@import "@heroui/styles";
```

> **El orden es estricto**: `tailwindcss` PRIMERO, luego `@heroui/styles`. Si se invierte, las clases no se aplican.

### Verificar

Renderizar un `<Button>` desde `@heroui/react` en cualquier página visible. Si el botón se ve con los estilos de HeroUI (no como HTML nativo), la instalación es correcta.

## 3. Reglas de uso en código

### 3.1 Componentes sobre HTML nativo

Si HeroUI ofrece un componente para un elemento HTML nativo, **DEBE** usarse el de HeroUI:

- `<Button>` en lugar de `<button>`
- `<Input>` / `<TextField>` en lugar de `<input>`
- `<TextArea>` en lugar de `<textarea>`
- `<Select>` / `<Autocomplete>` / `<ComboBox>` en lugar de `<select>`
- `<Checkbox>` en lugar de `<input type="checkbox">`
- `<Switch>` en lugar de `<input type="switch">`
- `<RadioGroup>` + `<Radio>` en lugar de `<input type="radio">`
- `<Slider>` en lugar de `<input type="range">`
- `<Link>` en lugar de `<a>` (cuando es navegación interna)
- `<Avatar>` en lugar de `<img>` redondo
- `<Kbd>` para atajos de teclado
- `<Typography>` para texto semántico (h1, p, code, etc.)

### 3.2 Compound components (patrón de punto)

HeroUI v3 usa **compound components** — el "componente" es un namespace con sub-piezas:

```tsx
import { Accordion, Card, Tabs } from "@heroui/react";

<Accordion>
  <Accordion.Item>
    <Accordion.Heading>
      <Accordion.Trigger>Título</Accordion.Trigger>
    </Accordion.Heading>
    <Accordion.Panel>
      <Accordion.Body>Contenido</Accordion.Body>
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>

<Tabs>
  <Tabs.List>
    <Tabs.Tab id="one">Uno</Tabs.Tab>
    <Tabs.Tab id="two">Dos</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="one">Panel uno</Tabs.Panel>
  <Tabs.Panel id="two">Panel dos</Tabs.Panel>
</Tabs>

<Card>
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

**NUNCA** usar sólo `<Accordion>` sin sus `<Accordion.Item>` — la API es por composición, no por props.

### 3.3 Custom render con `render` prop

HeroUI v3 permite reemplazar el elemento DOM por defecto usando la prop `render`:

```tsx
import { Button, Link as HeroUILink } from "@heroui/react";

// Botón que renderiza como <a>
<Button render={<a href="/home" />}>Ir a home</Button>

// Link que renderiza como Next.js Link
<HeroUILink render={<NextLink href="/about" />}>About</HeroUILink>
```

Usar esto cuando se necesita integrar con librerías de routing (`next/link`, `react-router`, etc.) sin perder la accesibilidad que HeroUI provee.

### 3.4 Clases Tailwind + CSS BEM

Dos formas válidas de personalizar:

**(a) Tailwind utilities en `className`** (más rápido, recomendado):
```tsx
<Button className="bg-purple-500 text-white hover:bg-purple-600">
  Purple Button
</Button>
```

**(b) BEM en `@layer components`** (para temas compartidos):
```css
@layer components {
  .button--primary {
    @apply bg-gradient-to-r from-pink-500 to-purple-500;
  }
}
```

Ambas funcionan. Tailwind utilities son locales al componente; BEM classes se reutilizan en toda la app.

### 3.5 Accesibilidad por defecto

HeroUI v3 está construido sobre React Aria Components, lo que significa:

- **NUNCA** agregar `role`, `aria-*` o `tabIndex` manualmente a componentes de HeroUI — ya los manejan.
- **NUNCA** envolver un `<Button>` en otro `<button>`.
- **SIEMPRE** usar `<label>` (o `Label` de HeroUI) asociado a inputs via `htmlFor` o envolviendo el control.

### 3.6 Estado controlado vs no controlado

HeroUI v3 soporta ambos patrones en la mayoría de componentes interactivos:

```tsx
// No controlado (default)
<Checkbox defaultSelected>Accept</Checkbox>

// Controlado
const [accepted, setAccepted] = useState(false);
<Checkbox isSelected={accepted} onValueChange={setAccepted}>Accept</Checkbox>
```

**Default a no controlado** salvo que el estado deba sincronizarse con otro lugar (form, URL, store).

## 4. NO hacer

- ❌ **NO** usar `<HeroUIProvider>` (NO existe en v3 — fue removido).
- ❌ **NO** instalar `framer-motion` para que HeroUI funcione (no es dependencia de v3).
- ❌ **NO** crear `tailwind.config.js` con `plugins: [heroui()]` (v3 usa CSS-first, no plugin de Tailwind).
- ❌ **NO** usar `@heroui-pro/react` ni ningún paquete `*-pro` (es producto pago separado, fuera de scope de este skill).
- ❌ **NO** agregar `darkMode: "class"` en tailwind config — v3 lo maneja con `data-theme` o `class="dark"` automáticamente via CSS.
- ❌ **NO** instalar `@heroui/theme` (es v2; v3 usa `@heroui/styles`).

## 5. Stack de referencia

| Pieza | Versión | Notas |
|---|---|---|
| `@heroui/react` | >= 3.0.0 | Componentes |
| `@heroui/styles` | >= 3.0.0 | Estilos CSS (importar en globals.css) |
| `react` / `react-dom` | >= 19.0.0 | Peer dep obligatoria |
| `tailwindcss` | >= 4.0.0 | Peer dep obligatoria |
| `tailwind-variants` | (transitiva) | Lo usa HeroUI internamente |
| `react-aria-components` | (transitiva) | Lo usa HeroUI internamente |

## 6. Documentación disponible

### 6.1 Skill oficial `heroui-react` (PRIMARIO — recomendado)

**Usar los scripts oficiales antes que este skill local**. Son la fuente de verdad, siempre actualizada:

```bash
# Desde la raíz del proyecto
node skills/heroui-react/scripts/list_components.mjs                    # Listar los 70 componentes
node skills/heroui-react/scripts/get_component_docs.mjs Accordion       # Doc completa
node skills/heroui-react/scripts/get_component_docs.mjs Button Card     # Varios a la vez
node skills/heroui-react/scripts/get_source.mjs Button                  # Código fuente TSX
node skills/heroui-react/scripts/get_styles.mjs Card                    # CSS BEM
node skills/heroui-react/scripts/get_theme.mjs                          # Variables de tema (oklch)
node skills/heroui-react/scripts/get_docs.mjs /docs/react/getting-started/theming  # Guides
```

**Desde OpenCode**, los agentes pueden invocar el skill directamente: pedir al agente "usá el skill `heroui-react`" lo carga automáticamente. Para más control, los scripts son ejecutables desde `bash`.

### 6.2 Documentación local (este skill)

Documentación empaquetada en `docs/`, útil cuando no hay red o para lookup rápido sin ejecutar scripts:

- `docs/installation.md` — Quick start oficial.
- `docs/frameworks.md` — Setup específico Next.js (App/Pages Router) y Vite, incluyendo `I18nProvider` + `isRTL` para i18n.
- `docs/agents-md.md` — Cómo descargar las docs al proyecto con `npx heroui-cli@latest agents-md --react`.
- `docs/agent-skills.md` — Skills de HeroUI (oficial, soporta OpenCode, Cursor, Claude).
- `docs/mcp-server.md` — Setup del **HeroUI MCP Server** (`@heroui/react-mcp`) para los 7 editores (Cursor, Claude Code, Windsurf, Zed, VSCode, Codex, **OpenCode**). **Recomendado**: instalar el MCP para tener docs siempre actualizadas sin depender de esta copia local.
- `docs/<component-slug>.md` — 70 componentes v3 con import, anatomy, ejemplos, API reference.
- `llms-full.txt` — Backup completo (~5MB) de la documentación oficial consolidada.
- `llms-components.txt` — Backup enfocado solo en los 70 componentes v3 (~2.8MB).
- `llms-patterns.txt` — Patrones y recetas: Animation, Colors, Composition, Dark Mode, Styling, Theming, etc. (~242KB).

### Herramienta `sdd_heroui_lookup`

Los agentes pueden consultar la doc de un componente específico con:

```ts
sdd_heroui_lookup({ componentName: "accordion" })
```

Retorna el contenido de `docs/<slug>.md`. Si el slug no existe, retorna la lista de componentes disponibles.

> **Preferir el script oficial** `node skills/heroui-react/scripts/get_component_docs.mjs Accordion` sobre `sdd_heroui_lookup` — el oficial siempre está actualizado a la última versión.

### Backups locales (LLMs.txt)

La skill incluye 3 archivos de respaldo oficial de HeroUI en la raíz, para casos donde el agente necesita más contexto del que ofrece un solo componente:

| Archivo | Tamaño | Contenido |
|---|---|---|
| `llms-full.txt` | ~5.0MB | TODO (React + Native, componentes + migration + releases + handbook) |
| `llms-components.txt` | ~2.8MB | Solo los 70 componentes v3 (sin migration/handbook) |
| `llms-patterns.txt` | ~242KB | Patterns: Animation, Colors, Composition, Dark Mode, Styling, Theming, Frameworks, Quick Start, CLI, MCP Server, etc. |

**Cuándo usar cada uno**:
- Lookup de **un componente específico** → `sdd_heroui_lookup({ componentName })` (devuelve el `.md` enfocado).
- Necesidad de **ver varios componentes relacionados** → leer `llms-components.txt`.
- Necesidad de **patrones de uso** (cómo combinar componentes, dark mode, theming) → leer `llms-patterns.txt`.
- Documentación **exhaustiva** (incluye migration v2→v3, releases) → leer `llms-full.txt`.

## 7. AI Agent Setup (recomendado)

> **Preconfigurado en `zugzbot-sdd` v2.1.8+**: el plugin ya agrega el MCP automáticamente a `opencode.json` con `enabled: true`, y activa el permiso `heroui-react_*: "allow"` en los **5 agentes UI** del harness (`sdd-planner`, `sdd-builder`, `f2-refactor-improver`, `sdd-tester`, `aux-refactor`). El router `zugzbot` y los agentes non-UI (`sdd-explorer`, `aux-oracle`, `aux-explainer`, etc.) NO lo reciben para no sumar contexto innecesario.

Si querés deshabilitarlo (ej. proyecto sin acceso a npm registry, o Node < 22), en tu `opencode.json`:

```jsonc
// Deshabilitar el server completo
{ "mcp": { "heroui-react": { "enabled": false } } }

// O deshabilitar globalmente las herramientas
{ "tools": { "heroui-react_*": false } }

// O deshabilitar por agente
{ "agent": { "sdd-builder": { "tools": { "heroui-react_*": false } } } }
```

### Para setup manual (otro editor o sin zugzbot-sdd)

El snippet a agregar a `opencode.json` (o equivalente en otros editores, ver `docs/mcp-server.md`):

```json
{
  "mcp": {
    "heroui-react": {
      "type": "local",
      "command": ["npx", "-y", "@heroui/react-mcp@latest"]
    }
  }
}
```

Esto expone 6 herramientas prefijadas con `heroui-react_`: `list_components`, `get_component_docs`, `get_component_source_code`, `get_component_source_styles`, `get_theme_variables`, `get_docs`. Invocar con "use heroui-react" en el prompt o vía menú `@`.

**Requisitos**: Node.js 22+. Sin red al primer arranque → `npx` descarga el paquete on-demand.
