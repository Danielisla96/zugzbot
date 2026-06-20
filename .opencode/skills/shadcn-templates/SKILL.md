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

1. **El Bloque es el Esqueleto Absoluto (Fase A - Inyección Pura y Migración Física)**:
   - El Coder (F2) **debe** instalar el bloque de Shadcn correspondiente mediante la CLI (`npx shadcn@latest add <block-name>`).
   - El bloque se descargará en `src/components/blocks/<block-name>/`. El Coder tiene **estrictamente prohibido** importar el `page.tsx` del bloque como un simple componente hijo (ej: `return <BlockPage />` desde la raíz de la app), ya que esto rompe la estructura del router de Next.js, layouts y metadata.
   - **Acción Obligatoria**: El Coder debe **copiar el contenido íntegro del código** de `src/components/blocks/<block-name>/page.tsx` hacia el `page.tsx` de tu ruta destino (por ejemplo, `src/app/page.tsx` o `src/app/dashboard/page.tsx`).
   - **Corrección de Imports de forma Manual**: Al mover el código de la ruta de componentes al App Router de Next.js, los imports relativos en ese archivo se romperán. El Coder tiene la obligación de **reescribir todos los imports relativos de componentes e información locales** (ej. `./components/app-sidebar` o `./data.json`) para usar aliases absolutos que apunten a la ubicación física descargada por Shadcn (ej. `@/components/blocks/<block-name>/components/app-sidebar` o `@/components/blocks/<block-name>/data.json`).
   - **Preservación de Datos Mock/Dummy**: El archivo de datos del bloque (por ejemplo, `data.json` o constantes internas) **debe ser preservado e importado de manera intacta** durante esta Fase A para garantizar que la vista renderice con datos idénticos al demo original en el navegador.
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

### Fase F3 (Verification)
El `@sdd-tester` ejecuta las pruebas según el modo de verificación especificado en el contrato (`settings.verificationMode`):
- Si es `"console"`, verifica la compilación correcta y la ausencia de errores de consola/hidratación en el navegador.
- Si es `"visual"`, ejecuta tests de regresión visual de Playwright tomando capturas de pantalla para comprobar la responsividad del layout.

