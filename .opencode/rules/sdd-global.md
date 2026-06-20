# Reglas Globales de Desarrollo SDD - Brain y Autopilot

Estas reglas son mandatorias para todos los agentes de la sesión (Orchestrator, Coder, Tester, Spec-Writer).

## 1. Sistema de Memoria Compartida (Brain)
El proyecto utiliza un sistema de memoria centralizado en `.openspec/brain.md` gestionado por las herramientas `brain_save_memory` y `brain_read_memory`.

- **Orquestador (F0/F1 y Finalización)**:
  - Al iniciar, debe invocar `brain_read_memory` para extraer aprendizajes de diseño, ruteo o errores históricos.
  - Al completar una sesión, debe sintetizar las lecciones valiosas aprendidas y registrarlas mediante `brain_save_memory`.
- **Coder (F2)**:
  - Antes de empezar a codificar, debe consultar la categoría `design` y `learnings` en el Brain.
  - Si soluciona un bug complejo, debe reportarlo registrándolo en la categoría `errors` o `learnings`.
- **Tester (F3)**:
  - Debe consultar la categoría `errors` para asegurar que los nuevos casos de prueba cubran regresiones históricas.

## 2. Modo Autopiloto (/loop)
Cuando el estado del sistema tiene `loopMode === true` (activado mediante el comando `/loop` o llamando a `sdd_set_phase`):

- **Prohibición de Preguntas**: Está estrictamente prohibido usar la herramienta `question` o pausar esperando aprobación del usuario. Los agentes deben decidir por sí mismos usando las recomendaciones por defecto (Next.js 16, Console mode, primer diseño recomendado de la marca).
- **Intercepción de Barrera**: Si algún agente intenta llamar a la herramienta `question` en este modo, el sistema abortará la llamada mecánicamente a través del plugin enforcer.
- **Specs Incrementales**: Si la petición es grande, el orquestador debe dividirla secuencialmente en contratos incrementales. Completa un spec por completo (F0->F4) y arranca el siguiente de inmediato de forma autónoma hasta finalizar todo el plan.
- **Rollback de Emergencia**: Si una misma fase falla de forma continua (más de 2 rollbacks), desactiva `loopMode` usando `sdd_set_phase` y solicita asistencia humana en el chat.

## 3. Uso Mandatorio de Bloques Prehechos de Shadcn UI (dashboard, sidebar, login, etc.)
Para optimizar el tiempo de desarrollo, garantizar una experiencia visual premium y evitar la invención de layouts o formularios comunes desde cero:
- **Prioridad de Bloques**: Al diseñar cualquier interfaz de usuario (Layouts, Dashboards, Paneles de Control, Vistas de Configuración, Páginas de Autenticación, Tablas de Datos, Gráficos), los agentes **deben** buscar y utilizar de forma prioritaria los bloques prehechos del registro oficial `@shadcn` (como `dashboard-01`, `sidebar-01` al `16`, `login-01` al `05`, `signup-01` al `05`).
- **Búsqueda Proactiva**: El Spec-Writer **debe** consultar el registro utilizando las herramientas del MCP `shadcn` (`shadcn_search_items_in_registries`, `shadcn_list_items_in_registries`) al redactar el contrato (F1) para identificar qué bloques se ajustan a la necesidad, y declararlos en `frontend.components` y `files_affected` de `contract.json`.
- **Implementación por Distribución y Composición**: El Coder (F2) **debe** instalar estos bloques usando `npx shadcn@latest add <block-name>` (ej: `dashboard-01`, `login-03`) en su proyecto, integrando y distribuyendo los elementos con el estado y lógica del backend, sin rediseñar o codificar layouts que ya existen de forma oficial.

## 4. Soporte para Subdirectorios, Monorepos (targetDir) y Estándar Corporativo `src/`
Si el proyecto o aplicación principal vive en un subdirectorio (ej. `next-app`, `frontend`, `backend`), se deben seguir estas directivas estrictas para mantener la consistencia y el "estándar corporativo con carpeta `src/`":
- **Estructura del Proyecto**: Toda la estructura de código fuente, páginas, componentes, estilos, pruebas y configuraciones debe vivir agrupada dentro de la subcarpeta del proyecto y bajo la carpeta `src/` obligatoriamente (ej. `next-app/src/app/...`, `next-app/src/components/...`, `next-app/tsconfig.json`, `next-app/package.json`).
- **Rutas de Archivos en el Contrato**: El Spec-Writer (F1) **debe** escribir las rutas del campo `files_affected` del contrato con el prefijo del subdirectorio correspondiente (ej. `["next-app/src/app/page.tsx", "next-app/src/components/blocks/Navbar.tsx"]`).
- **Ejecución de Comandos**: El Coder (F2), Tester (F3) y Deployer (F4) **deben** ejecutar siempre sus comandos de terminal (`npm install`, `npm run lint`, `npx tsc`, `npx vitest`, `docker compose`) utilizando la subcarpeta como directorio de trabajo (`workdir` en las llamadas a herramientas, o moviéndose a ella).
- **Consistencia de Configuración**: Está estrictamente prohibido esparcir o duplicar archivos de configuración (como `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `components.json`) en la raíz del espacio de trabajo si hay un subdirectorio activo. Todo debe quedar encapsulado dentro del subdirectorio del proyecto.

## 5. Estándares de Calidad UI/UX Premium, Soporte de Temas y Robustez HTML (OBLIGATORIO)
Cualquier desarrollo de interfaz de usuario (Dashboards, Landings, Formularios, Componentes) debe cumplir con los siguientes estándares desde su **primera entrega (F2)** sin esperar a iteraciones reactivas:
- **Soporte Semántico de Temas (Zero Hardcoded Light/Dark colors):**
  - Está estrictamente PROHIBIDO usar clases de colores absolutos de Tailwind (como `bg-white`, `bg-neutral-50`, `text-neutral-900`, `border-neutral-200`) para componentes estructurales, fondos, textos o bordes.
  - Se deben mapear obligatoriamente a variables semánticas de Shadcn/Tailwind que soporten modo claro/oscuro dinámico por defecto (ej. `bg-background`, `bg-muted/50`, `bg-accent`, `text-foreground`, `text-muted-foreground`, `border-border`).
- **Gráficos Dinámicos y Reactivos (SVG/Recharts Theme Sync):**
  - Cualquier componente de gráficos (como Recharts o visores vectoriales SVG) que use atributos de pintado inline (`stroke`, `fill`, `color`) debe resolver sus colores mediante un custom hook o variables dinámicas que consuman el estado del tema actual (`useTheme` de `next-themes` u homólogo), previniendo que líneas o textos queden invisibles en modo oscuro.
- **Robustez HTML y Regla de No-Nesting en Triggers:**
  - Al utilizar componentes contenedores de Radix/Shadcn UI (como `TooltipTrigger`, `DropdownMenuTrigger`, `DialogTrigger`, `SheetTrigger`), está estrictamente PROHIBIDO anidar un elemento interactivo nativo (como `<button>` o `<a>`) directamente dentro de otro trigger que ya renderice un botón por defecto.
  - Para evitar la hidratación rota y HTML inválido, se debe usar siempre el prop `asChild` en el trigger de Radix o delegar los props correctamente usando las directivas del componente de base.
- **Pulido y Acabado UX Premium:**
  - **Tooltips:** Todo botón que contenga únicamente un icono de acción debe estar envuelto en un componente `Tooltip` con su descripción respectiva.
  - **Skeletons y Empty States:** Las vistas de carga deben contar con animaciones de `Skeleton` fluidas. Las listas o tablas vacías deben presentar un `Empty State` visual y explicativo agradable con iconos y un botón de acción alternativo, nunca una página o cuadro en blanco.

## 6. Estándar de Robustez en Autenticación, Ruteo y SSR (Next.js)
Para evitar bucles de redirección ("redirect loops") y pantallas parpadeantes (flickers/blinking) tras iniciar sesión:
- **Evitar Race Conditions en Redirecciones:** En el formulario de login, usa siempre `router.replace("/")` en lugar de `push` tras un login exitoso para evitar empujar estados duplicados al historial.
- **Evitar useEffects Cruzados Activos:** Si usas un guard de redirección en `LoginPage` o similar para usuarios ya autenticados, utiliza un `useRef(false)` para controlar que la redirección asíncrona solo se dispare una vez y no se encadene con re-renderizados concurrentes de React.
- **Evitar Flash de Carga SSR en Layouts:** Para layouts o guards protegidos, nunca asumas estados por defecto que pinten elementos cargando (spinners) durante el servidor. Comprueba si el componente está montado (`mounted === true`) antes de evaluar la sesión en el cliente y renderizar el contenido. Retorna `null` antes de montar para evitar desajustes de hidratación (hydration mismatch).

## 7. Mockups Visuales y Validación Temprana de Layout (F0/F1)
Para optimizar el diseño, evitar cambios de arquitectura estructurales a mitad del desarrollo (como rediseñar pestañas a layouts de sidebar lateral) y garantizar alineación inmediata con las expectativas del usuario:
- **Propuesta de Layout Visual:** Durante la transición de F0 a F1, el `@sdd-spec-writer` **debe** proponer un mockup textual o diagrama de cajas ASCII detallando la distribución estructural de la pantalla (Layout general, barras laterales sticky, contenedores de contenido responsivos y anchos de pantalla recomendados, ej. `max-w-6xl` vs `w-full`).
- **Ancho y Densidad Modernos:** Por defecto, los layouts complejos deben evitar contenedores angostos restrictivos como `max-w-3xl` para maximizar el aprovechamiento de pantallas de escritorio modernas mediante rejillas responsivas (`grid grid-cols-1 md:grid-cols-X gap-6`).
- **Aprobación Temprana:** El orquestador presentará esta propuesta visual al usuario en la fase F1. Una vez aprobada la disposición espacial y la estructura de navegación local (ej: sidebar split vs horizontal tabs), el `@sdd-coder` la ejecutará exactamente como se acordó, previniendo loops redundantes de maquetación en fases tardías.

## 8. Abstracción y Prohibición de Parchar Código en F3/Orquestador
Para mantener la limpieza y disciplina en la ventana de contexto de la sesión:
- **Orquestador No-Coder:** El orquestador principal (`sdd-orchestrator`) tiene estrictamente prohibido usar herramientas de edición (`edit` o `write`) para modificar código de producción o archivos de test.
- **Rollback Disciplinado:** Si en la fase `F3_VERIFICATION` el linter o los tests reportan errores, el orquestador **debe** transicionar el estado a `F2_IMPLEMENTATION` mediante `sdd_core_set_phase` y re-invocar al subagente experto (`sdd-coder`) para que realice la corrección cleanly. No se permiten parches rápidos a mitad de fase de test.
