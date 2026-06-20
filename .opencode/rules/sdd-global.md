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
