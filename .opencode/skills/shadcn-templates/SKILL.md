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

### 3.1 Componer, no reinventar (MANDATORIO)
Utiliza las plantillas y bloques existentes de Shadcn como el estándar absoluto de tu interfaz. Queda **estrictamente prohibido** escribir layouts, páginas de autenticación o cuadros de mando desde cero si ya existe un bloque oficial que resuelva el caso de uso. **No estás restringido a ningún subconjunto fijo de componentes**: tienes total libertad para buscar en el catálogo completo de 97+ bloques oficiales y componentes primitivos de Shadcn:
- **Dashboards**: Utiliza `dashboard-01` o cualquier variante de panel de control interactivo oficial.
- **Sidebars / Barras de Navegación**: Utiliza `sidebar-01` al `16` para paneles laterales funcionales, colapsables, dinámicos o anidados. No programes componentes de navegación complejos a mano.
- **Login / Registro**: Utiliza `login-01` al `05` y `signup-01` al `05` para flujos de login y registro de usuarios.
- **Gráficos y Métricas**: Busca y añade bloques de gráficos oficiales de Recharts (`chart-area-*`, `chart-bar-*`, `chart-pie-*`, `chart-radar-*`) para dar vida a la visualización de datos.

Busca layouts de dashboards o formularios complejos en el registro mediante el MCP `shadcn` antes de escribir cualquier código personalizado. Una vez agregado el bloque, distribuye y adapta sus elementos con el estado y la lógica de tu aplicación. Te motivamos a explorar todo el ecosistema de bloques pre-creados por Shadcn para armar una UI robusta y moderna.

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

### 3.5 Estética de Diseño Premium y Layouts (OBLIGATORIO)
Queda **estrictamente prohibido** generar interfaces visualmente planas, vacías o que parezcan un "mínimo producto viable" básico (por ejemplo, una sola caja minimalista en el centro de un fondo blanco plano con un botón gris). 

El diseño debe ser profesional y generar impacto visual instantáneo. Sigue estas directrices:
- **Estructura de Layout Completa**: Toda herramienta, calculadora o pantalla debe estar contenida en un layout profesional. Usa barras de navegación superiores (`Header`), paneles laterales colapsables (`Sidebar`), menús de usuario con avatares, y una barra de estado o pie de página.
- **Grids de KPIs y Métricas**: Añade tarjetas estadísticas en la parte superior de la página para resumir datos clave (ej. número de cálculos realizados, tiempo de respuesta promedio, tasa de éxito) utilizando iconos, números destacados y pequeños indicadores porcentuales.
- **Gráficos e Historiales**: Si hay tablas o historiales, hazlos interactivos. Usa bordes redondeados (`rounded-xl`), sombras suaves, efectos de hover en las filas y, de ser posible, integra gráficos modernos (ej. utilizando `@/components/ui/chart` o Recharts) para representar tendencias.
- **Colores Semánticos y Gradientes**: Utiliza gradientes sutiles y la paleta de colores HSL/OKLCH del tema en lugar de colores puros. Asegúrate de que el botón de cambiar tema (Modo Claro/Oscuro) esté visible en la barra de navegación y funcione de manera impecable.
- **Estados Dinámicos y Micro-animaciones**: Añade pequeños efectos de transición y hover (`transition-all duration-200`) en botones, inputs y tarjetas para que la interfaz se sienta "viva" y responda a las acciones del usuario.

---

## 4. Flujo de Trabajo en SDD

### Fase F1 (Spec-Driven Contract)
El `@sdd-spec-writer` utiliza el MCP `shadcn` (`mcp__shadcn__search_items`, `mcp__shadcn__get_item`) para documentar en el contrato (`contract.json`) qué componentes y bloques se usarán para la UI y verificar sus APIs/propiedades expuestas.

### Fase F2 (Implementation)
El `@sdd-coder` utiliza el template base `nextjs-shadcn` y ejecuta `npx shadcn@latest add` para instalar los componentes requeridos para la interfaz. Implementa las vistas componiendo dichos bloques y vinculando el estado con el backend.

### Fase F3 (Verification)
El `@sdd-tester` ejecuta las pruebas según el modo de verificación especificado en el contrato (`settings.verificationMode`):
- Si es `"console"`, verifica la compilación correcta y la ausencia de errores de consola/hidratación en el navegador.
- Si es `"visual"`, ejecuta tests de regresión visual de Playwright tomando capturas de pantalla para comprobar la responsividad del layout.

