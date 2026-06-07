# Catálogo de Componentes de HeroUI

Listado canónico de componentes avanzados y Pro disponibles bajo la skill `sdd-heroui`.
Los agentes pueden consultar la documentación y ejemplos específicos de cada componente usando la herramienta `sdd_heroui_lookup({ componentName: "<slug>" })`.

---

## 1. Gráficos (Charts)

Visualizaciones de datos interactivas y responsivas basadas en Recharts y estilizadas con Tailwind CSS.

| Slug | Componente | Descripción |
|---|---|---|
| `area-chart` | Area Chart | Gráfico de áreas para mostrar tendencias acumuladas en el tiempo. |
| `bar-chart` | Bar Chart | Gráfico de barras horizontales o verticales para comparaciones cuantitativas. |
| `chart-tooltip` | Chart Tooltip | Tooltip personalizable integrado para mostrar detalles al hacer hover en gráficos. |
| `composed-chart` | Composed Chart | Combinación de barras, líneas y áreas en un único gráfico. |
| `line-chart` | Line Chart | Gráfico de líneas simple para mostrar la evolución de variables continuas. |
| `pie-chart` | Pie Chart | Gráfico circular para representación de proporciones y porcentajes. |
| `radar-chart` | Radar Chart | Gráfico radial para comparar múltiples variables cuantitativas. |
| `radial-chart` | Radial Chart | Gráfico de barras circulares/radiales para métricas de progreso porcentual. |

---

## 2. Visualización de Datos (Data Display)

Componentes estructurados para la presentación y administración de datos complejos.

| Slug | Componente | Descripción |
|---|---|---|
| `agenda` | Agenda | Vista de calendario y lista de eventos cronológicos diarios/semanales. |
| `action-bar` | Action Bar | Barra flotante para acciones en lote o rápidas sobre una selección de filas. |
| `carousel` | Carousel | Galería deslizable de elementos multimedia con controles de navegación. |
| `data-grid` | Data Grid | Tabla avanzada con paginación, filtros de columna, ordenación y selección. |
| `empty-state` | Empty State | Tarjeta informativa ilustrada para vistas sin datos o estados iniciales. |
| `file-tree` | File Tree | Explorador jerárquico de archivos y directorios expandible. |
| `floating-toc` | Floating TOC | Tabla de contenidos flotante/anclada para navegación en documentos largos. |
| `hover-card` | Hover Card | Tarjeta de vista previa enriquecida que aparece al hacer hover sobre un enlace. |
| `kanban` | Kanban Board | Tablero de tareas con columnas de estado arrastrables (drag-and-drop). |
| `item-card` | Item Card | Tarjeta de producto o elemento con soporte para imágenes, badges y acciones. |
| `item-card-group` | Item Card Group | Contenedor grid responsivo y manejador de selección para Item Cards. |
| `kpi` | KPI Card | Tarjeta indicadora de métricas clave con tendencias y comparaciones. |
| `kpi-group` | KPI Group | Grupo o layout alineado de tarjetas KPI para paneles de control. |
| `list-view` | List View | Lista de elementos optimizada con soporte para avatares, metadatos y acciones. |
| `widget` | Widget | Contenedor tipo dashboard para agrupar métricas y accesos rápidos. |

---

## 3. Inteligencia Artificial (AI Components)

Componentes optimizados para el diseño de interfaces de chat de IA, asistentes y flujos de trabajo conversacionales.

| Slug | Componente | Descripción |
|---|---|---|
| `chain-of-thought` | Chain Of Thought | Acordeón de pasos interactivos que muestra el proceso de razonamiento de un modelo. |
| `chat-attachment` | Chat Attachment | Previsualización de archivos adjuntos (imágenes, PDFs, etc.) en la caja de chat. |
| `chat-conversation` | Chat Conversation | Contenedor principal para renderizar el historial completo de la conversación. |
| `chat-list-view` | Chat List View | Lista de hilos de conversación anteriores para paneles laterales. |
| `chat-loader` | Chat Loader | Indicador animado de generación de respuesta (tipo "escribiendo..."). |
| `chat-message` | Chat Message | Burbuja individual de mensaje con soporte para avatar y roles (user/system). |
| `chat-message-actions` | Chat Message Actions | Barra de utilidades rápida (copiar, regenerar, feedback) en el mensaje. |
| `chat-source` | Chat Source | Componente de atribución de fuentes y citas para respuestas basadas en RAG. |
| `chat-tool` | Chat Tool | Visualizador del estado y llamada a funciones/herramientas por parte del agente. |
| `code-block` | Code Block | Bloque de código con resaltado de sintaxis sintáctico y botón de copiar. |
| `markdown` | Markdown | Renderizador seguro de texto enriquecido formateado en Markdown. |
| `prompt-input` | Prompt Input | Área de texto expandible optimizada para entrada de prompts con adjuntos y botones. |
| `prompt-suggestion` | Prompt Suggestion | Tarjetas con sugerencias o plantillas de prompts listos para enviar al hacer click. |
| `text-shimmer` | Text Shimmer | Efecto skeleton brillante para textos en proceso de carga o streaming. |

---

## 4. Retroalimentación (Feedback)

Componentes para interacciones rápidas del usuario y visualización de estados.

| Slug | Componente | Descripción |
|---|---|---|
| `emoji-reaction-button` | Emoji Reaction | Botón flotante para dar feedback rápido mediante emojis. |
| `number-value` | Number Value | Renderizador numérico formateado con indicadores visuales de tendencia. |
| `pressable-feedback` | Pressable Feedback | Envoltorio con micro-animaciones interactivas para dar respuesta al tacto/click. |
| `rating` | Rating | Selector de estrellas o iconos para sistemas de valoración. |
| `trend-chip` | Trend Chip | Chip con badge de porcentaje y color (verde/rojo) para subidas/bajadas. |

---

## 5. Layout y Navegación

Componentes estructurales para dar soporte y organización a la aplicación.

| Slug | Componente | Descripción |
|---|---|---|
| `resizable` | Resizable Layout | Divisores de pantalla ajustables horizontal o verticalmente mediante arrastre. |
| `app-layout` | App Layout | Contenedor principal con sidebar colapsable y header pre-diseñados. |
| `command` | Command Palette | Menú de búsqueda rápida y comandos por teclado (tipo Spotlight / KBar). |
| `context-menu` | Context Menu | Menú emergente personalizado que se activa al hacer click derecho. |
| `navbar` | Navbar | Barra de navegación superior responsiva con menús y soporte de usuario. |
| `segment` | Segmented Control | Botones tipo pestaña alineados para alternar entre estados mutuamente excluyentes. |
| `sidebar` | Sidebar | Panel de navegación lateral jerárquico colapsable con rutas y submenús. |
| `stepper` | Stepper | Indicador visual de progreso por pasos (ej. flujos de checkout o wizards). |
| `sheet` | Sheet | Panel lateral deslizable (drawer/overlay) para configuraciones adicionales. |

---

## 6. Formularios e Inputs (Forms)

Elementos avanzados para recolección, selección y validación de datos.

| Slug | Componente | Descripción |
|---|---|---|
| `cell-color-picker` | Cell Color Picker | Matriz compacta de selección rápida de color integrada en celdas de tablas. |
| `cell-select` | Cell Select | Input de tipo desplegable compacto optimizado para edición directa en celdas. |
| `cell-slider` | Cell Slider | Deslizador de rango compacto integrado para ajustar valores en celdas o grids. |
| `cell-switch` | Cell Switch | Interruptor de encendido/apagado compacto optimizado para celdas. |
| `checkbox-button-group` | Checkbox Button Group | Grupo de opciones de selección múltiple diseñados como botones estilizados. |
| `drop-zone` | Drop Zone | Área dedicada para arrastrar y soltar archivos con estados de hover visuales. |
| `inline-select` | Inline Select | Desplegable embebido directamente en la línea de texto o prosa. |
| `native-select` | Native Select | Envoltorio estilizado alrededor del elemento HTML `select` nativo. |
| `number-stepper` | Number Stepper | Input numérico con botones de incremento/decremento y límites de paso. |
| `radio-button-group` | Radio Button Group | Selector exclusivo modelado como un set horizontal o vertical de botones. |
| `emoji-picker` | Emoji Picker | Panel buscador y selector de emojis integrado. |
