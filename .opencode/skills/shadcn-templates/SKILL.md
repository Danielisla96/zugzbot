---
name: shadcn-templates
description: Instrucciones y mejores prácticas para el uso de plantillas de diseño, bloques y el MCP oficial de Shadcn UI en Next.js con Tailwind CSS v4.
license: MIT
compatibility: opencode
---

## Qué hace esta habilidad

Esta habilidad instruye a los subagentes del arnés de desarrollo SDD (`@sdd-spec-writer`, `@sdd-coder`, `@sdd-tester`) sobre cómo estructurar, buscar, instalar y validar interfaces de usuario utilizando **Shadcn UI** como stack de UI único y cerrado (no se deben usar otras librerías externas o legacy como HeroUI).

Se centra en dos pilares fundamentales:
1. El uso de la plantilla base pre-configurada en `.opencode/templates/nextjs-shadcn`.
2. La utilización del MCP `shadcn` para buscar e instalar componentes y bloques interactivos.

---

## 1. Plantilla Base: `nextjs-shadcn`

Para evitar la sobrecarga de configurar el entorno en cada nueva funcionalidad o proyecto, el repositorio cuenta con una plantilla lista para usar en:
`[nextjs-shadcn](file:///.opencode/templates/nextjs-shadcn)`

### Características y Estructura Integrada:
- **Tailwind CSS v4**: Configurado vía PostCSS. No existe un archivo `tailwind.config.js`; todas las personalizaciones se realizan en la directiva `@theme inline` dentro de `src/app/globals.css`.
- **Variables CSS Semánticas (OKLCH)**: Integradas para el modo claro y oscuro (`:root` y `.dark` en `globals.css`). Utilizan nombres estándar de shadcn como `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, y variables específicas para `sidebar`.
- **next-themes**: Integración pre-configurada con `ThemeProvider` en `src/components/theme-provider.tsx`.
- **Estructura App Router**: Con `layout.tsx` pre-configurado.
- **Vitest**: Configurado para pruebas unitarias rápidas en `vitest.config.ts` y `src/test/setup.ts`.

### Regla Crítica de Hidratación:
En `layout.tsx`, el elemento `<html>` **debe** incluir obligatoriamente el atributo `suppressHydrationWarning`. Esto evita warnings de desajuste de hidratación debido a que `next-themes` inyecta la clase `.dark` antes de que se monte el árbol de React en el cliente:
```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 2. Uso del MCP `shadcn`

El plugin MCP de Shadcn está configurado localmente en `opencode.json` y proporciona herramientas nativas para interactuar con los registros de componentes.

### Herramientas del MCP `shadcn`:
- **Listar componentes**: `mcp__shadcn__list_items`
  Lista todos los items disponibles (componentes y bloques de diseño) en el registro oficial.
- **Buscar componentes**: `mcp__shadcn__search_items`
  Busca items específicos mediante keywords (ej. `"dashboard"`, `"login"`, `"sidebar"`, `"table"`).
- **Inspeccionar item**: `mcp__shadcn__get_item`
  Obtiene el código fuente y las dependencias de un componente/bloque antes de instalarlo. Es útil para que `@sdd-spec-writer` revise APIs de componentes en la fase F1.

### Instalación de Componentes vía CLI:
Para instalar un componente o bloque en el frontend, se debe ejecutar el CLI de shadcn desde la raíz de la aplicación web:
```bash
npx shadcn@latest add <component-name>
```
- Los **componentes básicos** (primitivos como button, dialog, card, inputs) se instalarán en `src/components/ui/`.
- Los **bloques complejos** (como auth layouts, tables, dashboards de ejemplo) se instalarán en `src/components/blocks/` o como páginas directamente.

---

## 3. Patrones de Diseño y Buenas Prácticas

Al diseñar o codificar páginas con Shadcn UI, sigue estas reglas estrictas:

### 3.1 Componer, no reinventar - Estrategia "Block-First" con Inyección Zero-Touch (MANDATORIO)
Utiliza las plantillas y bloques existentes de Shadcn como el estándar absoluto de tu interfaz. Queda **estrictamente prohibido** escribir layouts, páginas de autenticación o cuadros de mando desde cero si ya existe un bloque oficial que resuelva el caso de uso.

Para garantizar interfaces de usuario premium y visualmente idénticas a los demos oficiales de Shadcn, se debe seguir de manera mandatoria la **Metodología de Arquitectura Block-First**:

1. **El Bloque es el Esqueleto Absoluto (Fase A - Inyección Pura y Preservación de Estructura)**:
   - El Coder (F2) **debe** instalar el bloque de Shadcn correspondiente mediante la CLI (`npx shadcn@latest add <block-name>`).
   - La CLI de Shadcn colocará automáticamente la página del bloque (ej: `src/app/dashboard/page.tsx`) y los componentes y datos asociados en las ubicaciones de producción correctas de tu proyecto.
   - **Acción Obligatoria / Prohibición de Migración**: Queda **estrictamente prohibido** mover los archivos del bloque a carpetas artificiales (como `src/components/blocks/...`) o reescribir manualmente sus imports si la CLI ya los ha ubicado en sus posiciones funcionales definitivas. Esto evita errores sutiles de compilación, rotura de imports y degradación de los estilos de modo oscuro en gráficos de Recharts.
   - **Preservación de Datos Mock/Dummy**: El archivo de datos del bloque (por ejemplo, `data.json` o constantes locales) **debe ser preservado e importado de manera intacta en su ruta nativa** durante esta Fase A para garantizar que la vista renderice con datos idénticos al demo original en el navegador.
   - **Meta**: Al terminar la Fase A, la aplicación debe renderizarse de manera *pixel-perfect* (idéntica) al demo oficial de Shadcn en local, sin un solo error de compilación o de imports rotos.

2. **Sustitución de Datos Atómica (Fase B - Conexión de Lógica)**:
   - Una vez comprobado que el esqueleto visual se muestra perfecto y sin aberraciones de flexbox o alineación, el Coder procederá a sustituir de manera quirúrgica y atómica los datos dummy o locales por la lógica de negocio real (estados de React, fetchings de API del backend).
   - El Coder **no debe modificar las clases contenedoras estructurales** (`SidebarProvider`, `SidebarInset`, grids de diseño principales, anchos o paddings del bloque) para evitar corrupciones visuales en pantallas grandes o pequeñas.

3. **Prevención de Parpadeos (Flicker) de Sidebar y Providers**:
   - Si el bloque utiliza providers globales como `<SidebarProvider>`, el Coder debe extraer la barra lateral (`AppSidebar`) y sus providers principales hacia `src/app/layout.tsx` (o un layout del Route Group respectivo) en lugar de dejarlos redundantes en el `page.tsx` de cada ruta, permitiendo un ruteo libre de parpadeos desagradables y garantizando consistencia.

4. **Catálogo de Bloques a Explorar**:
   - **Dashboards**: Utiliza `dashboard-01` o cualquier variante de panel de control interactivo oficial.
   - **Sidebars / Barras de Navegación**: Utiliza `sidebar-01` al `16` para paneles laterales funcionales, colapsables, dinámicos o anidados. No programes componentes de navegación complejos a mano.
   - **Login / Registro**: Utiliza `login-01` al `05` y `signup-01` al `05` para flujos de login y registro de usuarios.
   - **Gráficos y Métricas**: Busca y añade bloques de gráficos oficiales de Recharts (`chart-area-*`, `chart-bar-*`, `chart-pie-*`, `chart-radar-*`) para dar vida a la visualización de datos.

**REGLA CRÍTICA DE RUTAS DUPLICADAS POR SHADCN CLI**:
Al agregar un bloque interactivo complejo (como `dashboard-01`), el CLI de Shadcn puede inyectar automáticamente archivos en directorios fijos (como `src/app/dashboard/page.tsx`). El Coder **debe** verificar inmediatamente si existe una colisión con la estructura de rutas establecida por el contrato (`contract.json`) —por ejemplo, si el contrato establece un Route Group `src/app/(dashboard)/page.tsx` que sirve en la raíz `/`—. Si ocurre esto, el Coder tiene la obligación de **borrar, mover o refactorizar de inmediato el archivo inyectado automáticamente** para eliminar la duplicidad de rutas, evitando así bucles infinitos de redirección o errores fatales de compilación del router de Next.js.

**REGLA CRÍTICA DE COMPATIBILIDAD TAILWIND V4 + SHADCN UI (Sidebar Overlap Fix)**:
Al instalar componentes que usan `sidebar` (como `dashboard-01`, `sidebar-01` a `sidebar-16`, o el componente `sidebar` individual), la CLI de Shadcn inyecta código con sintaxis de variables CSS arbitrarias propias de Tailwind v3 (`w-[--sidebar-width]`, `w-[--sidebar-width-icon]`, `max-w-[--skeleton-width]`) que **rompen en Tailwind v4** generando CSS inválido (`width: --sidebar-width;` sin `var()`). Esto hace que el espaciador invisible del sidebar colapse a 0px, provocando que el contenido principal se solape bajo el sidebar fijo.

**Acción obligatoria inmediata tras instalar**: El Coder debe parchear `src/components/ui/sidebar.tsx` en el mismo paso de instalación transformando:
- `w-[--sidebar-width]` → `w-[var(--sidebar-width)]`
- `w-[--sidebar-width-icon]` → `w-[var(--sidebar-width-icon)]`
- `max-w-[--skeleton-width]` → `max-w-[var(--skeleton-width)]`

Sin este fix, el dashboard renderizará con el sidebar tapando el contenido. Verificar con `npx tsc --noEmit` y comprobación visual tras la instalación.

### 3.2 Form Layouts (FieldGroup + Field)
Para estructurar campos de formularios, no uses `div`s arbitrarios con clases de espaciado complejas. Usa las composiciones semánticas oficiales de Shadcn:
```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
    <Input id="email" type="email" placeholder="tu@ejemplo.com" />
    <FieldDescription>Nunca compartiremos tu correo.</FieldDescription>
  </Field>
</FieldGroup>
```
*Si hay errores de validación, aplica `data-invalid` en el componente `<Field>` y `aria-invalid` en el `<Input>`.*

### 3.3 Uso de Iconos
- La librería de iconos por defecto es `lucide-react`.
- Cuando agregues iconos dentro de botones u otros controles de Shadcn, usa el atributo `data-icon` para permitir que los estilos globales de Shadcn controlen el espaciado y tamaño automáticamente. Evita clases manuales de tamaño como `size-4` o `w-4 h-4`:
  ```tsx
  import { Mail } from "lucide-react";
  
  <Button>
    <Mail data-icon="inline-start" />
    Enviar correo
  </Button>
  ```

### 3.4 Sin Placeholders en Producción
Los datos dummy y placeholders deben reemplazarse inmediatamente por estados y hooks reales en el frontend que llamen a las APIs del backend (ej. estados de carga, manejo de errores de llamada, y datos dinámicos).

### 3.5 Reglas de Diseño y Estándares de Calidad (Consolidadas)
* **Estándar Semántico**: Consulta y aplica estrictamente la **Sección 5 de `.opencode/rules/sdd-global.md`** para la prevención de colores fijos (hardcoded light/dark), sincronización de temas en gráficos Recharts, prevención de solapamientos del sidebar (Sidebar Overlap) y la regla de no anidamiento en triggers de Radix.
* **Componentes de Calidad**: Toda interfaz debe estar pulida con skeletons de carga fluidos, empty states agradables con iconos ilustrativos, y tooltips descriptivos para cualquier botón basado únicamente en iconos.

---

## 4. Flujo de Trabajo en SDD

### Fase F1 (Spec-Driven Contract)
El `@sdd-spec-writer` utiliza de manera proactiva el MCP `shadcn` (`shadcn_search_items_in_registries`, `shadcn_list_items_in_registries`) para encontrar bloques. **Es obligatorio** usar la herramienta `shadcn_view_items_in_registries` para inspeccionar el contenido completo, la estructura de archivos y las dependencias del bloque seleccionado antes de cerrar el contrato. Esto le permite al Spec-Writer mapear con exactitud los archivos que se generarán en `files_affected` y documentar explícitamente cualquier potencial colisión de ruteo en el `contract.json`.

### Fase F2 (Implementation)
El `@sdd-coder` utiliza el template base `nextjs-shadcn`. Si el contrato no detalla todos los sub-componentes o el Coder necesita verificar el comportamiento de un bloque antes de acoplarlo con el backend, debe ejecutar `shadcn_get_item_examples_from_registries` para ver ejemplos funcionales del componente real. Tras ejecutar la instalación con `npx shadcn@latest add`, el Coder debe contrastar los archivos inyectados con el mapa del contrato y limpiar de inmediato cualquier archivo redundante (como una página de inicio duplicada) que no coincida con el router oficial.

## 5. Catálogo Unificado de Bloques Externos (`sdd_catalog`)

Además del catálogo nativo de Shadcn UI, el arnés expone un catálogo unificado de **3 registries** externos (todos con catálogo JSON oficial y discoverable programáticamente). Si el usuario pide cualquier interfaz (hero, footer, dashboard, login, AI chat, animated background, etc.), **TIENES LA OBLIGACIÓN** de explorar este catálogo ANTES de inventar desde cero.

### 5.0 Registries Soportados (todos discoverables)

| Registry | Fuente de catálogo | Contenido | TTL | Notas |
|---|---|---|---|---|
| `shadcn` | akash3444/shadcn-ui-blocks (GitHub Contents API) | ~540 bloques Radix | 7d | **Default** para marketing/landing/auth/dashboards |
| `basecn` | akash3444/basecn (GitHub Contents API) | ~60 bloques fork Base UI | 7d | Alternativa si el proyecto usa Base UI |
| `reactbits` | reactbits.dev/r/registry.json (JSON oficial shadcn) | 134 bases × 4 variantes = 536 items | 1d | Primitivas animadas (backgrounds, text, cards, cursors, etc.) |

> **Criterio de inclusion**: solo se soportan registries con catálogo JSON oficialmente discoverable. 21st.dev fue removido porque su catálogo es JS-rendered y requiere scraping para descubrir items nuevos — eso rompe el principio de "siempre saber qué hay disponible antes de elegir".

### 5.1 Herramientas MCP Nativas del Arnés (PREFERENTE — `sdd_catalog_*`)

**PROHIBIDO** usar `webfetch` directo a GitHub o reactbits.dev para descubrir bloques. El arnés expone 3 tools MCP dedicadas que cachean en `.openspec/cache/` y evitan redescubrimiento:

- `sdd_catalog_list_blocks({ category?, query?, registry?, limit?, force_refresh? })`
  - `registry`: `"shadcn"` | `"basecn"` | `"reactbits"` | `"all"` (default).
  - Filtra por categoria exacta (`hero`, `pricing`, `backgrounds`, `text`, `cards`, `navigation`, ...) o substring libre (sobre `name`, `description`, `tags`).
  - Para `reactbits`: devuelve las **134 bases** (cada una con `variants[]` y `default_variant`), NO las 536 variantes. Esto evita duplicados y permite ver opciones de un vistazo.
- `sdd_catalog_get_block({ name, registry?, variant?, force_refresh? })`
  - Formatos de `name`:
    - shadcn/basecn: `"hero-06"`, `"sidebar-07"`
    - reactbits: `"Dither"` (auto-resuelve a `Dither-TS-TW` por default) **o** `"Dither-JS-CSS"` (variante canónica completa)
    - URL directa: `"https://reactbits.dev/r/Dither-TS-TW.json"` o `"https://shadcnui-blocks.com/r/radix/hero-06.json"`
    - Namespace shadcn: `"@acme/button"`
  - Para reactbits, parámetro opcional `variant`: `"JS-CSS" | "JS-TW" | "TS-CSS" | "TS-TW"` (default `"TS-TW"`). Aplicar solo cuando pasas el nombre base sin sufijo de variante.
  - `registry` autodetecta por el formato; pasalo explícito solo si necesitas forzar.
  - Devuelve `source_files[]`, `dependencies[]`, `preview_url`, `install_command` listo y metadatos `base_name` + `variant` (para reactbits).
- `sdd_catalog_warm_index({ registry? })`
  - Pre-calienta caches. Llamar al bootstrap (F0) o inicio de F1.

### 5.2 Flujo de Descubrimiento (Fase F1 - Spec-Writer)

Cuando el usuario pide una UI, sigue este orden de prioridad:

1. **Primero** `sdd_catalog_list_blocks({ registry: "all", category: "<categoria>", limit: 10 })` — devuelve candidatos de los 3 registries simultáneamente.
2. **Si el usuario pide animaciones/shaders/efectos visuales cinematograficos**, prioriza `registry: "reactbits"` (es donde estan las primitivas animadas reales: `Dither`, `Aurora`, `GlareHover`, `Magnet`, `StaggeredMenu`, `FloatingDock`, etc.).
3. **Si el usuario pide paginas de marketing completas** (landing, pricing, features), prioriza `registry: "shadcn"` (bloques Radix mas completos con texto, CTAs, imagenes placeholder).
4. **Si el usuario ya dio una URL** (`https://reactbits.dev/...` o `https://shadcnui-blocks.com/...`), ve directo a `sdd_catalog_get_block` con esa URL.
5. **Presenta opciones con `preview_url`** para que el usuario vea cada una antes de elegir:
   - **Asistido (HIL):** muestra `preview_url` (que el usuario puede abrir en navegador) + `install_command` para los 2-3 mejores candidatos y deja que elija. Si el usuario dice "ese", ejecuta el `install_command`.
   - **Autopiloto (`/loop`):** inspecciona 2-3 candidatos con `sdd_catalog_get_block`, analiza dependencias y compat con el stack del contrato, elige autonomamente.

### 5.3 Seleccion de Bloques (Interactiva o Autonoma)

Cuando hay multiples opciones para una categoria (ej. 10 heroes):
- **Modo Asistido (default):** pregunta al usuario con `question` o en chat: *"Tengo X opciones de [categoria]. ¿Quieres revisar alguna? Puedo darte el `preview_url` (ej. `https://shadcnui-blocks.com/blocks/hero-06` o `https://reactbits.dev/Dither`) para que elijas."*
- **Modo Autopiloto:** lee el codigo de 2-3 opciones con `sdd_catalog_get_block` y elige sin preguntar.

### 5.4 Inyeccion e Instalacion (Spec-Writer + Coder)

- **Spec-Writer (F1):** En el `contract.json`, dentro de `frontend.components`, anota el bloque usando **el `install_url` o el `name` canonico** que devolvio `sdd_catalog_get_block`:
  ```json
  "frontend": {
    "components": [
      { "name": "hero-06", "registry": "shadcn", "source": "akash3444/shadcn-ui-blocks" },
      { "name": "Dither", "registry": "reactbits", "variant": "TS-TW", "source": "reactbits.dev/Dither" }
    ]
  }
  ```
- **Coder (F2):** Para instalar, usa el `install_command` literal que devuelve `sdd_catalog_get_block` (campo `block.install_command`). Ejemplos reales:
  ```bash
  # Akash Radix (shadcn CLI nativo)
  npx shadcn@latest add https://shadcnui-blocks.com/r/radix/hero-06.json --yes
  # Basecn
  npx shadcn@latest add https://basecn.dev/r/footer-04.json --yes
  # reactbits (variante TS-TW explicita)
  npx shadcn@latest add https://reactbits.dev/r/Dither-TS-TW.json --yes
  ```
  La CLI v3 de Shadcn negocia `Accept: application/json` automaticamente, descarga el codigo y resuelve las `registryDependencies`.

### 5.5 Validacion Post-Instalacion (BLOQUEANTE)

Tras instalar cualquier bloque externo, ejecuta INMEDIATAMENTE:
1. `npx tsc --noEmit` para detectar imports rotos o packages faltantes.
2. Verifica que todos los archivos declarados en `source_files[]` (devuelto por `sdd_catalog_get_block`) fueron creados fisicamente.
3. Si faltan archivos, reintenta con `--overwrite`.
4. **Para bloques reactbits con dependencias pesadas** (`gsap`, `three`, `@react-three/fiber`, `motion`): confirma que el `package.json` del proyecto las incluye; si no, `npm install <deps>` antes de continuar. Revisa el campo `dependencies[]` del JSON retornado por `sdd_catalog_get_block`.
5. **Solo entonces** reporta exito al orquestador.

**Bug conocido**: `Can't resolve 'shadcn/tailwind.css'` en Tailwind v4 requiere `npm install shadcn` antes de continuar.

### 5.6 reactbits.dev - Detalles de Variantes

reactbits.dev es el registry mas "vivo" del catalogo unificado. Cada componente base se publica en **4 variantes** con sufijo `-<Lang>-<Style>`:

| Sufijo | Lenguaje | Styling |
|---|---|---|
| `JS-CSS` | JavaScript | CSS plano (.css) |
| `JS-TW` | JavaScript | Tailwind v4 (.tw) |
| `TS-CSS` | TypeScript | CSS plano |
| `TS-TW` | TypeScript | Tailwind v4 |

- **Default del arnés**: `TS-TW` (TypeScript + Tailwind v4, alineado al stack Next.js 16 + Shadcn + Tailwind v4 del harness).
- **Para usar otra variante**: `sdd_catalog_get_block({ name: "Dither", variant: "JS-CSS", registry: "reactbits" })`.
- **El preview_url es siempre por base**: `https://reactbits.dev/Dither` (muestra el demo vivo con animación real, ideal para que el usuario vea cómo se ve antes de instalar).
- **Las dependencias son reales**: `gsap@^3.13.0`, `three`, `@react-three/fiber@^9.3.0`, `postprocessing`, `motion`. **Third-party trust obligatorio**: validar compat con el stack target antes de instalar.
- **Mapa curado de categorias** (dentro de `sdd_catalog.ts`, constante `REACTBITS_POPULAR_BY_CATEGORY`): las ~85 bases más populares organizadas en `backgrounds`, `text`, `cards`, `navigation`, `buttons`, `animations`, `cursors`, `misc`. Las bases fuera del mapa caen en `misc` pero son buscables por `query`.

### 5.7 Preview UX — Cómo se ve antes de instalar

**Todos los items del catálogo unificado exponen `preview_url`** que el orchestrator debe presentar al usuario en modo HIL para que vea la animación/componente real antes de decidir:

| Registry | Preview URL | Tipo de preview |
|---|---|---|
| shadcn | `https://shadcnui-blocks.com/blocks/<name>` | iframe del demo oficial |
| basecn | `https://basecn.dev/blocks/<name>` | iframe del demo oficial |
| reactbits | `https://reactbits.dev/<BaseName>` | demo vivo con animacion real + codigo a la derecha |

Cuando el orchestrator presente opciones al usuario, **siempre incluir el `preview_url`** en el chat. Para reactbits en particular, el demo es animado y se ve inmediatamente cómo se mueve la UI en el navegador del usuario — esto cierra el ciclo "imaginar como se ve → ver real → decidir instalar" sin hacer conjeturas.

---

## 6. Patrones Avanzados de Layout CSS

### 6.1 Patrón de Fullscreen Layouts y Centrado (CRÍTICO)
Cuando necesites crear un Hero, Landing, o Splash screen que deba ocupar el 100% de la pantalla visible y tener su contenido perfectamente centrado, evita mezclar clases CSS que peleen entre sí. Sigue **estrictamente** este patrón:
- **Contenedor Padre**: Usa `min-h-[100dvh] flex flex-col`.
- **Contenedor Interno (Wrapper)**: Usa `flex-1 flex items-center justify-center w-full`.
- **Contenido Central**: Usa `mx-auto max-w-[ancho-deseado] flex flex-col items-center text-center`.
- **PROHIBICIÓN ESTRICTA DE `w-full` EN FLEX HIJOS**: Si el contenedor padre usa `flex` con `items-center` para centrar, **NO** le pongas `w-full` al hijo interno si quieres que no se "pegue" a la izquierda en pantallas ultra anchas. El `w-full` forzará al elemento a ocupar el 100% del contenedor padre flex y anulará el centrado horizontal. Usa siempre `mx-auto` explícitamente en el elemento hijo para garantizar que quede centrado dentro de su propia columna.

