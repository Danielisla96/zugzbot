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

## 5. Catálogo Externo Oficial: Shadcn UI Blocks (Akash)

Además del catálogo nativo de Shadcn UI, dispones de acceso autónomo a más de 200 bloques de alta calidad del repositorio **Shadcn UI Blocks (por Akash)**. Si necesitas un layout, sección o componente complejo (ej. hero, footer, pricing, login, dashboard), **debes** explorar este catálogo y proponerlo.

### 5.1 Flujo de Descubrimiento (Fase F1 - Spec-Writer)
Si el usuario solicita una interfaz genérica o tú detectas que un bloque complejo ahorraría tiempo, consulta la lista maestra de bloques en tiempo real:
- **Comando a usar:** Ejecuta la herramienta `webfetch` apuntando a la API de GitHub:
  `webfetch("https://api.github.com/repos/akash3444/shadcn-ui-blocks/contents/public/r/radix")`
- **Análisis de resultados:** El JSON devuelto listará todos los bloques (`hero-01.json`, `footer-05.json`, `pricing-02.json`, etc.). Filtra mentalmente los que coincidan con la necesidad.

### 5.2 Selección de Bloques
Cuando existan múltiples opciones para un mismo tipo de bloque (ej. 10 footers distintos):
- **Modo Asistido (Por defecto):** Utiliza la herramienta `question` o lista en el chat las opciones disponibles, proporcionando la URL visual del catálogo (`https://www.shadcnui-blocks.com/blocks/categories/[categoria]`) para que el usuario pueda verlos y elegir. *Ejemplo: "He encontrado 5 tipos de Footers, puedes verlos aquí. ¿Cuál prefieres (footer-01 a footer-05)?"*.
- **Modo Autopiloto (`/loop`):** Si estás actuando de forma 100% autónoma sin interacción del usuario, lee el código fuente de 2 o 3 opciones al azar utilizando `webfetch("https://raw.githubusercontent.com/akash3444/shadcn-ui-blocks/main/public/r/radix/[bloque].json")` para analizar qué código encaja mejor con la petición (ej. si pide newsletter, busca uno con `<Input>`) y elígelo autónomamente.

### 5.3 Inyección e Instalación (Contrato y Coder)
- **Spec-Writer (F1):** En el `contract.json`, dentro de `frontend.components`, anota el bloque utilizando la URL remota directa:
  ```json
  "frontend": {
    "components": [
      "https://shadcnui-blocks.com/r/radix/footer-04.json"
    ]
  }
  ```
- **Coder (F2):** Para instalar estos bloques externos, utiliza la capacidad nativa de la CLI v3 de Shadcn. Ejecuta directamente el comando apuntando a la URL:
  ```bash
  npx shadcn@latest add https://shadcnui-blocks.com/r/radix/footer-04.json
  ```
  La CLI se encargará automáticamente de descargar el código y resolver dependencias internas (ej. instalar `separator` o `button` si el bloque lo requiere). No es necesario configurar nada en el `components.json`.

