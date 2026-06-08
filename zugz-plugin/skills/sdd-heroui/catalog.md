# Catálogo de Componentes de HeroUI v3

Listado canónico de los **70 componentes open-source** de HeroUI v3 (`@heroui/react`) disponibles bajo la skill `sdd-heroui`.

Los agentes pueden consultar la documentación y ejemplos específicos de cada componente usando **3 mecanismos** (en orden de preferencia):

### 1. Skill oficial `heroui-react` (PRIMARIO)

Empaquetado en `skills/heroui-react/`. **Usar siempre que sea posible** — es la fuente de verdad actualizada:

```bash
node skills/heroui-react/scripts/list_components.mjs                    # Lista los 70
node skills/heroui-react/scripts/get_component_docs.mjs Accordion       # Doc en vivo
node skills/heroui-react/scripts/get_source.mjs Button                  # Código TSX
node skills/heroui-react/scripts/get_styles.mjs Card                    # CSS BEM
node skills/heroui-react/scripts/get_theme.mjs                          # Variables de tema
```

Desde OpenCode: pedir al agente "usá el skill `heroui-react`" lo carga automáticamente.

### 2. Tool del plugin `sdd_heroui_lookup`

```ts
sdd_heroui_lookup({ componentName: "<slug>" })
```

Lee de `docs/<slug>.md` local. Fallback cuando los scripts oficiales no están disponibles (ej. entornos sin red).

### 3. Documentación local en `docs/`

70 archivos `.md` por componente, generados desde la doc oficial v3.0.5.

---

Donde `<slug>` es el nombre del componente en **kebab-case** (ej. `accordion`, `button-group`, `date-range-picker`).

> **Nota sobre HeroUI Pro**: este skill cubre **únicamente** la versión open-source v3. Componentes exclusivos de **HeroUI Pro** (pago, `@heroui-pro/react`) como Charts (Area, Bar, Line, Pie, Radar, Radial), Chat Components (ChatMessage, ChatConversation, etc.), DataGrid, Kanban, KPI, Command Palette, Markdown, PromptInput, Sheet, Sidebar, Navbar, AppLayout, Resizable, Rating, etc. **NO están incluidos**. Si el usuario tiene licencia Pro y los pide explícitamente, consultar la doc oficial en [heroui.pro](https://heroui.pro); si no, construir equivalentes sobre v3 OSS + libs estándar (Recharts para charts, dnd-kit para kanban, cmdk para command palette, etc.).

## Skills oficiales de HeroUI empaquetados

El plugin `zugzbot-sdd` incluye los 3 skills oficiales de HeroUI (los mismos que `npx skills add heroui-inc/heroui` instala globalmente) dentro de la carpeta `skills/`:

| Skill | Carpeta | Tamaño | Cuándo usar |
|---|---|---|---|
| `heroui-react` | `skills/heroui-react/` | 52KB | **(Principal)** HeroUI v3 React. Scripts Node para fetchear docs/source/styles/theme en vivo. |
| `heroui-migration` | `skills/heroui-migration/` | 40KB | Solo si el proyecto está en HeroUI v2 y hay que migrar a v3. |
| `heroui-native` | `skills/heroui-native/` | 44KB | Solo si el target es React Native (móvil). NO para web. |

---

## 1. Buttons (5)

| Slug | Componente | Descripción |
|---|---|---|
| `button` | Button | Botón clickeable con múltiples variantes y estados. |
| `button-group` | ButtonGroup | Agrupa botones relacionados con estilo y espaciado consistentes. |
| `close-button` | CloseButton | Botón especializado para cerrar diálogos, modales o descartar contenido. |
| `toggle-button` | ToggleButton | Control interactivo para estados on/off o seleccionado/no seleccionado. |
| `toggle-button-group` | ToggleButtonGroup | Agrupa múltiples ToggleButtons en un control unificado (selección única o múltiple). |

## 2. Collections (3)

| Slug | Componente | Descripción |
|---|---|---|
| `dropdown` | Dropdown | Muestra una lista de acciones u opciones que el usuario puede elegir. |
| `list-box` | ListBox | Lista de opciones que permite seleccionar una o varias. |
| `tag-group` | TagGroup | Lista enfocable de tags con soporte para navegación por teclado, selección y remoción. |

## 3. Colors (6)

| Slug | Componente | Descripción |
|---|---|---|
| `color-area` | ColorArea | Selector 2D de color sobre un gradiente. |
| `color-field` | ColorField | Input de color con label, descripción y validación. |
| `color-picker` | ColorPicker | Composable que sincroniza el valor de color entre múltiples sub-componentes. |
| `color-slider` | ColorSlider | Ajusta un canal individual de un valor de color. |
| `color-swatch` | ColorSwatch | Preview visual de un color con soporte de accesibilidad. |
| `color-swatch-picker` | ColorSwatchPicker | Lista de swatches para elegir un color de una paleta predefinida. |

## 4. Controls (2)

| Slug | Componente | Descripción |
|---|---|---|
| `slider` | Slider | Permite seleccionar uno o más valores dentro de un rango. |
| `switch` | Switch | Interruptor toggle para estados booleanos. |

## 5. Data Display (3)

| Slug | Componente | Descripción |
|---|---|---|
| `badge` | Badge | Indicador pequeño posicionado relativo a otro elemento (contadores, status dots, labels). |
| `chip` | Chip | Badges informativos pequeños para labels, estados y categorías. |
| `table` | Table | Tabla de datos estructurados en filas/columnas con sorting, selección, resize de columnas e infinite scroll. |

## 6. Date and Time (6)

| Slug | Componente | Descripción |
|---|---|---|
| `calendar` | Calendar | Selector de fecha con grid mensual, navegación y year picker. |
| `date-field` | DateField | Input de fecha con label, descripción y validación. |
| `date-picker` | DatePicker | Composable de selección de fecha (combina DateField + Calendar). |
| `date-range-picker` | DateRangePicker | Composable de selección de rango de fechas (combina DateField + RangeCalendar). |
| `range-calendar` | RangeCalendar | Calendario de rango con grid mensual, navegación y year picker. |
| `time-field` | TimeField | Input de hora con label, descripción y validación. |

## 7. Feedback (6)

| Slug | Componente | Descripción |
|---|---|---|
| `alert` | Alert | Muestra mensajes importantes y notificaciones con indicadores de estado. |
| `meter` | Meter | Representa una cantidad dentro de un rango conocido, o un valor fraccional. |
| `progress-bar` | ProgressBar | Barra de progreso (determinado o indeterminado). |
| `progress-circle` | ProgressCircle | Indicador circular de progreso (determinado o indeterminado). |
| `skeleton` | Skeleton | Placeholder que muestra un estado de carga con la forma esperada del componente. |
| `spinner` | Spinner | Indicador de carga para estados pendientes. |

## 8. Forms (16)

| Slug | Componente | Descripción |
|---|---|---|
| `checkbox` | Checkbox | Permite seleccionar múltiples items o marcar uno individual. |
| `checkbox-group` | CheckboxGroup | Grupo para administrar múltiples checkboxes. |
| `description` | Description | Texto suplementario para form fields y otros componentes. |
| `error-message` | ErrorMessage | Componente de bajo nivel para mostrar errores. |
| `field-error` | FieldError | Muestra errores de validación para form fields. |
| `fieldset` | Fieldset | Agrupa controles relacionados con legend, descripción y acciones. |
| `form` | Form | Wrapper para validación y submit de formularios. |
| `input` | Input | Input primitivo de una línea que acepta atributos HTML estándar. |
| `input-group` | InputGroup | Agrupa inputs relacionados con prefijos/sufijos. |
| `input-otp` | InputOTP | Input de contraseña de un solo uso para códigos de verificación. |
| `label` | Label | Renderiza un label accesible asociado a un control de formulario. |
| `number-field` | NumberField | Input numérico con botones de incremento/decremento, validación y formateo internacional. |
| `radio-group` | RadioGroup | Grupo de radios para seleccionar una opción de una lista. |
| `search-field` | SearchField | Input de búsqueda con botón de limpiar e icono de búsqueda. |
| `text-area` | TextArea | Textarea primitivo multilinea con atributos HTML estándar. |
| `text-field` | TextField | Text field componible con label, descripción y validación inline. |

## 9. Layout (4)

| Slug | Componente | Descripción |
|---|---|---|
| `card` | Card | Contenedor flexible para agrupar contenido y acciones relacionadas. |
| `separator` | Separator | Divide visualmente secciones de contenido. |
| `surface` | Surface | Contenedor con styling de superficie y contexto para hijos. |
| `toolbar` | Toolbar | Contenedor de controles interactivos con navegación por flechas. |

## 10. Media (1)

| Slug | Componente | Descripción |
|---|---|---|
| `avatar` | Avatar | Imagen de perfil de usuario con contenido de fallback personalizable. |

## 11. Navigation (7)

| Slug | Componente | Descripción |
|---|---|---|
| `accordion` | Accordion | Panel colapsable para organizar información en un espacio compacto. |
| `breadcrumbs` | Breadcrumbs | Navegación de migas mostrando la ubicación de la página actual en la jerarquía. |
| `disclosure` | Disclosure | Sección colapsable con header (heading + trigger) y panel con contenido. |
| `disclosure-group` | DisclosureGroup | Contenedor que coordina estados expandidos de múltiples Disclosures. |
| `link` | Link | Anchor estilizado para navegación con soporte de iconos. |
| `pagination` | Pagination | Navegación de páginas con links componibles, prev/next y ellipsis. |
| `tabs` | Tabs | Organiza contenido en múltiples secciones navegables. |

## 12. Overlays (6)

| Slug | Componente | Descripción |
|---|---|---|
| `alert-dialog` | AlertDialog | Diálogo modal para confirmaciones críticas que requieren acción explícita. |
| `drawer` | Drawer | Panel deslizable para contenido y acciones suplementarias. |
| `modal` | Modal | Overlay de diálogo para interacciones enfocadas y contenido importante. |
| `popover` | Popover | Contenido enriquecido en portal disparado por botón o elemento custom. |
| `toast` | Toast | Notificaciones temporales con dismiss automático y posición configurable. |
| `tooltip` | Tooltip | Texto informativo al hacer hover o focus sobre un elemento. |

## 13. Pickers (3)

| Slug | Componente | Descripción |
|---|---|---|
| `autocomplete` | Autocomplete | Combina un select con filtering para buscar y seleccionar de una lista. |
| `combo-box` | ComboBox | Combina un input de texto con un listbox para filtrar opciones por query. |
| `select` | Select | Muestra una lista colapsable de opciones y permite seleccionar una. |

## 14. Typography (2)

| Slug | Componente | Descripción |
|---|---|---|
| `kbd` | Kbd | Muestra atajos de teclado y combinaciones de teclas. |
| `typography` | Typography | Primitiva semántica para headings, body copy e inline code (antes "Text" en v3.0.5). |

## 15. Utilities (1)

| Slug | Componente | Descripción |
|---|---|---|
| `scroll-shadow` | ScrollShadow | Aplica sombras visuales para indicar overflow scrollable, con detección automática de posición. |

---

## Total: 70 componentes v3 OSS distribuidos en 15 categorías.

Documentos auxiliares en `docs/`:

- `installation.md` — Quick start oficial.
- `frameworks.md` — Setup específico Next.js / Vite.
- `agents-md.md` — `npx heroui-cli@latest agents-md --react`.
- `agent-skills.md` — Skills oficiales de HeroUI.
- `mcp-server.md` — Setup del MCP Server (Cursor, Claude Code, Windsurf, Zed, VSCode, Codex, **OpenCode**).
- `llms-full.txt` — Backup consolidado completo de la documentación oficial (~5MB, React + Native).
- `llms-components.txt` — Backup enfocado solo en los 70 componentes v3 (~2.8MB).
- `llms-patterns.txt` — Patrones y recetas: Animation, Colors, Composition, Dark Mode, Styling, Theming, etc. (~242KB).
