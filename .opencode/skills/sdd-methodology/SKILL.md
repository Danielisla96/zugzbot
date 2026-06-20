---
name: sdd-methodology
description: Guía rápida del flujo SDD (Spec-Driven Development) con atajos y trampas conocidas. Cargar al inicio de CUALQUIER sesión SDD. Esta skill reemplaza la guía genérica anterior y contiene los patrones optimizados descubiertos tras analizar la sesión 137a (Sumadora Nike).
license: MIT
compatibility: opencode
---

## Qué hace esta habilidad

Esta habilidad instruye a los agentes del arnés SDD a través del ciclo de 5 fases (F0-F4) **usando los atajos del harness optimizado**. NO es solo una guía genérica — incluye las **trampas conocidas** que han costado tiempo en sesiones reales y los atajos que las evitan.

---

## 1. El ciclo SDD en 60 segundos

```
F0_DETECT  → detectar stack + diseño + crear carpeta del spec (atómica)
F1_CONTRACT → escribir contract.json desde plantilla pre-rellenada (sdd-quickstart)
F2_IMPLEMENTATION → implementar código que pase los tests del F1
F3_VERIFICATION → correr linter + tests (con auto-lint gate)
F4_DEPLOYMENT → generar Dockerfile con 1 tool call, build, deploy
```

Cada fase tiene un **gate explícito** (HIL del usuario) antes de transicionar a la siguiente.

---

## 2. Atajos críticos (USAR siempre)

| Atajo | Cuándo | Ahorro |
|---|---|---|
| `sdd_list_design_recommendations({ use_case: "all" })` | F0 | 4 llamadas a `oh-my-design_list_references` → 1 |
| `sdd_set_phase({ phase: "F1_CONTRACT", spec_name: "..." })` | F0→F1 | Crea la carpeta del spec atómicamente, sin race de timestamp |
| `sdd_select_design({ brandId: "nike" })` | F0 | Copia DESIGN.md al path canónico `.openspec/design-assets/<brandId>/` |
| `brain_read_memory({ category: ... })` | F0-F4 | Consulta el cerebro del proyecto para recuperar aprendizajes y evitar errores históricos |
| `brain_save_memory({ category: ... })` | F2, F4 | Guarda aprendizajes, errores técnicos resueltos y decisiones de diseño en el cerebro |
| Skill `sdd-quickstart` | F1 | Plantilla de `contract.json` pre-rellenada + test_scenarios recurrentes |
| `sdd_apply_brand_tokens({ tokens: ... })` | F2 | Inyecta tokens de marca en `globals.css` sin romper variables shadcn |
| `sdd_generate_dockerfile({ stack: "nextjs", port: 3000 })` | F4 | Genera Dockerfile + .dockerignore + docker-compose.yml en 1 call |
| `_sessions.jsonl` | Histórico | 1 línea por contrato (vs 18K+ líneas de MD export) |

---

## 3. Trampas conocidas (EVITAR siempre)

### Trampa 1: Listar marcas de diseño una por una
**NO HAGAS**: 4 llamadas a `oh-my-design_list_references` con `category: "saas"`, "fintech", "ecommerce", "consumer" solo para mostrar opciones.
**HAZ**: 1 llamada a `sdd_list_design_recommendations({ use_case: "all", max_per_category: 3 })`. Si el usuario quiere "Personalizar", ahí sí usa `oh-my-design_search_by_vibe`.

### Trampa 2: Crear la carpeta del spec en 2 steps
**NO HAGAS**: `sdd_create_spec_folder("mi-spec")` + `sdd_set_phase("F1_CONTRACT", ...)` en 2 calls (race condition de timestamp, observado en sesión 137a).
**HAZ**: 1 sola call: `sdd_set_phase({ phase: "F1_CONTRACT", spec_name: "mi-spec" })`. Devuelve `activeContract` listo.

### Trampa 3: Reescribir `globals.css` desde cero
**NO HAGAS**: Sobrescribir `src/app/globals.css` quitando las variables shadcn (`--color-border: var(--border)`, etc.) al aplicar tokens de marca. Build falla con `Cannot apply unknown utility class 'border-border'` (observado en sesión 137a).
**HAZ**: Usar `sdd_apply_brand_tokens` que inyecta en un bloque `@theme inline` aparte, preservando las variables shadcn.

### Trampa 4: Cargar `next-devtools` MCP en sesión normal
**NO HAGAS**: Dejar `next-devtools` habilitado. Su tool `init` inyecta 1000+ palabras de "FORGET ALL PRIOR KNOWLEDGE" (~8K tokens de reasoning desperdiciado — el coder tuvo el mayor consumo de tokens de la sesión 137a por esta razón).
**HAZ**: Está deshabilitado por defecto en `opencode.json`. Solo activarlo on-demand si un subagente reporta un error específico de Next 16.

### Trampa 5: Escribir el contrato desde cero
**NO HAGAS**: Redactar 600+ líneas de `contract.json` en cada sesión. Riesgo alto de inconsistencia.
**HAZ**: Cargar la skill `sdd-quickstart` y usar la plantilla pre-rellenada. Solo rellenar `{{...}}`.

### Trampa 6: Tests en F2
**NO HAGAS**: Que el coder escriba los tests después de implementar (loop Coder → Tester → Coder, observado en sesión 137a).
**HAZ**: Que el spec-writer (en F1) cree los tests con assertions reales basadas en `test_scenarios`. El coder solo implementa el código de producción para hacerlos pasar.

### Trampa 7: 5+ llamadas a `todowrite` durante la sesión
**NO HAGAS**: Actualizar la lista de TODOs cada vez que cambias de fase (observado 5 veces en sesión 137a).
**HAZ**: Crear la lista al inicio. Marcar `in_progress` solo cuando arrancas la fase. Marcar `completed` **en bloque** al final.

### Trampa 8: `lint: false` en el orquestador
**NO HAGAS**: Dejar que el tester descubra imports no usados en tests.
**HAZ**: El self-audit del coder (F2) y el auto-lint gate de `sdd_set_phase("F3_VERIFICATION")` ya lo previenen. El orquestador debe **reportar el `lintWarning`** al usuario antes de delegar al tester.

### Trampa 9: Cargar skills duplicadas
**NO HAGAS**: Cargar skills de forma genérica en subagentes si su contenido ya está integrado en su prompt de identidad (ej. cargar `sdd-methodology` en `@sdd-deployer` o `@sdd-tester`). Esto duplica los tokens de input consumidos.
**HAZ**: Limitar la carga de skills a los casos proactivos indicados o cuando se requieran plantillas/recursos específicos de la skill (ej. `sdd-quickstart` en `@sdd-spec-writer`).

### Trampa 10: Playwright en modo Console
**NO HAGAS**: Invocar herramientas de Playwright (`playwright_browser_navigate`, `playwright_browser_snapshot`, etc.) si `verificationMode` está configurado en `"console"`. Esto consume tiempo y reasoning innecesarios.
**HAZ**: En modo `console`, confía en pruebas unitarias/integración (Vitest) y verificaciones directas con curls/logs. No abras navegadores.

### Trampa 11: Orquestador usurpador (Ruptura de Abstracción)
**NO HAGAS**: Permitir que el Orquestador principal (`sdd-orchestrator`) tome el rol de escribir el código de producción o escribir/ejecutar tests directamente si un subagent (ej. `@sdd-coder`) falla o alcanza el límite de pasos ("Maximum Steps Reached"). Esto ensucia la ventana de contexto principal de la sesión.
**HAZ**: Re-invoca al mismo subagente usando la herramienta `task`, pasando el `task_id` original del subagente interrumpido e instruyéndole: "Te quedaste sin pasos. Continúa y finaliza los archivos pendientes".

### Trampa 12: Obsesión por alineación de consola (Pixel-Peeping)
**NO HAGAS**: Gastar múltiples iteraciones o miles de tokens en el razonamiento de `@sdd-coder` tratando de lograr una alineación perfecta de columnas con espacios exactos en salidas CLI o tablas ASCII.
**HAZ**: Usa funciones estándar de formateo de strings de tu lenguaje (como `ljust()`, `rjust()` o `center()` en Python; o formateadores sencillos en JS/TS) para lograr una presentación razonable de forma inmediata y avanzar directamente a la creación de pruebas.

### Trampa 13: Omitir la disposición espacial y propuesta de Layout en F1
**NO HAGAS**: Redactar el contrato en F1 listando únicamente archivos de forma abstracta sin definir o validar la geometría estructural y distribución de la UI (ej. si se requieren Sidebars locales de navegación vs pestañas horizontales planas), asumiendo anchos angostos y estáticos (como `max-w-3xl`) o rompiendo el soporte de modo oscuro con colores absolutos (`bg-white`).
**HAZ**: El spec-writer debe proponer proactivamente en F1 un bosquejo textual o diagrama ASCII de la interfaz y validar con el usuario un layout responsivo amplio (`max-w-6xl` o superior). Además, el coder debe implementar soporte semántico dinámico de temas de entrada (sin colores duros) y sincronizar colores SVG/gráficos dinámicamente con el tema actual.

### Trampa 14: Guardar archivos de tests que contienen JSX con extensión `.ts` en vez de `.tsx`
**NO HAGAS**: Usar la extensión `.ts` para archivos de tests que mockean iconos de lucide o renderizan primitivas de HTML o JSX (esbuild/Vitest fallarán en la compilación con errores como `Expected ">" but found "data"`).
**HAZ**: Toda suite de pruebas unitarias o de integración que monte componentes o contenga JSX debe grabarse con la extensión `.tsx` obligatoriamente.

### Trampa 15: Selectores de Testing Library ambiguos para campos comunes
**NO HAGAS**: Usar queries amplias y con insensibilidad a mayúsculas como `screen.getByLabelText(/password/i)` si hay botones como "Show password" con `aria-label` que repiten la palabra clave. Esto lanzará un error de "Found multiple elements".
**HAZ**: Usa selectores de coincidencia exacta como `screen.getByLabelText(/^Password$/)` o busca mediante `screen.getByPlaceholderText(...)` para aislar de forma unívoca el input deseado.

### Trampa 16: Probar la ausencia de elementos ocultos por CSS con `not.toBeInTheDocument()`
**NO HAGAS**: Tratar de validar que un menú, etiqueta de barra lateral colapsada o modal ya no es visible utilizando `expect(queryByText("...")).not.toBeInTheDocument()`. Al ocultar layouts mediante clases CSS de ancho cero (`w-0`), opacidad (`opacity-0`) o display (`hidden`), los elementos siguen existiendo físicamente en el DOM de pruebas.
**HAZ**: Verifica las clases CSS de visibilidad directamente (ej. `expect(sidebarEl.className).toContain("w-16")`) o usa `.not.toBeVisible()` de `@testing-library/jest-dom`.

### Trampa 17: Mocks estáticos para toggles y hooks con estado
**NO HAGAS**: Mockear hooks que controlan transiciones (como `useTheme` de `next-themes`) con retornos fijos y estáticos, ej. `vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }))`. El segundo clic en el toggle intentará pasar de 'light' a 'dark' pero fallará porque el estado simulado sigue en 'light' (llamando a setTheme('dark') por segunda vez).
**HAZ**: Define variables mutables a nivel de archivo dentro de la suite de mocks y usa getters en la definición del mock para reflejar los cambios en caliente.

### Trampa 18: Fallos en resolución de `@import "shadcn/tailwind.css"` en Tailwind v4 con Next.js 16/Shadcn
**NO HAGAS**: Importar `@import "shadcn/tailwind.css"` en `globals.css` sin comprobar si el paquete npm `shadcn` está instalado en la máquina, provocando fallos fatales de compilación durante el comando `next build`.
**HAZ**: El coder siempre debe instalar explícitamente el paquete base ejecutable y estilizado `npm install shadcn` en proyectos Next + Tailwind v4.

### Trampa 19: Bucle infinito y parpadeo de pantalla (Flicker) tras el inicio de sesión
**NO HAGAS**: Usar redirecciones cruzadas en `useEffect` con `router.push()` tanto en el formulario de login como en la propia página de login, o renderizar spinners por defecto antes de verificar la sesión en el cliente, causando que el router encadene múltiples repeticiones de renderizado y la pantalla parpadee.
**HAZ**: Usa `router.replace()` para evitar ensuciar el historial. Proporciona siempre una bandera de montaje (`mounted === true`) y retorna `null` para evitar desajustes de hidratación (hydration mismatch). Protege las redirecciones del login mediante una referencia `useRef(false)` para controlar que no se solapen redirecciones de estado concurrentes de React.

---

## 4. Stack cerrado (NO abrir)

- **Frontend**: Next.js 15/16 + React 19 + TypeScript + Tailwind v4 + Shadcn UI @latest (Radix UI) + lucide-react + Vitest. **PROHIBIDO**: Shadcn v4/Base-UI (por inestabilidad y falta de soporte actual), HeroUI, Chakra, Material-UI.
- **Backend**: Python 3.11+ + FastAPI + Pydantic v2 + Uvicorn + Pytest + Ruff. **PROHIBIDO**: Django, Flask, sync SQLAlchemy.
- **Persistencia**: localStorage (frontend-only) o PostgreSQL con pgvector. **PROHIBIDO**: MongoDB (excepto si se justifica), Redis como primary store.
- **Containerización**: Docker multi-stage con `node:20-alpine` (Next) o `python:3.11-slim` (FastAPI). Usuario no-root. Healthcheck via `node -e` (no wget en alpine).

---

## 5. Estructura de directorios (OBLIGATORIA)

```
/
├── .opencode/                    # Arnés SDD (no tocar)
├── .openspec/
│   ├── specs/<yyyy-mm-dd__hh-mm-ss>_<name>/   # Contratos activos
│   │   └── contract.json
│   ├── archive/                  # Contratos completados
│   │   ├── _sessions.jsonl       # 1 línea por contrato (histórico compacto)
│   │   └── <archived_specs>/
│   ├── design-assets/<brandId>/  # ÚNICA ruta canónica de DESIGN.md
│   │   ├── DESIGN.md
│   │   ├── preview.html
│   │   └── preview-dark.html
│   ├── .playwright/              # (transient, se borra en F0_DETECT)
│   ├── sdd_state.json
│   └── .sdd_session_metrics.json
├── src/                          # Código de aplicación
│   ├── app/                      # Next.js App Router
│   ├── components/{ui,blocks}/
│   ├── lib/
│   ├── test/setup.ts             # Polyfills (crypto.randomUUID, etc.)
│   └── types/
├── tests/                        # (opcional) tests de integración
├── eslint.config.mjs             # ESLint 9 flat (ignora .opencode/, .openspec/)
├── next.config.ts                # output: "standalone"
├── Dockerfile, .dockerignore, docker-compose.yml
└── package.json
```

---

## 6. Modos de verificación (F3 y F4)

| Modo | Cuándo usar | Tests permitidos | Token audit | Docker verify |
|---|---|---|---|---|
| `console` | Apps lógicas, APIs, dashboards sin pixel-review | `unit`, `integration` (3-5 escenarios) | NO visual | `curl` + logs |
| `visual` | Landings, marketing, designs pixel-perfect | + `visual`, `e2e` (5-10 escenarios) | SÍ (5 aserciones Playwright) | + Playwright opcional |

El modo se define en `contract.json:settings.verificationMode` en F1. **No cambies el modo a mitad de sesión** — invalida los tests ya escritos.

---

## 7. Métricas de éxito de una sesión

- **F0**: 1 sola ronda de `question` con 3-4 opciones
- **F1**: contract.json entre 100-300 líneas, 3-5 test_scenarios
- **F2**: self-audit limpio en 1 intento (sin loops)
- **F3**: lint pasa en 1 intento, 100% tests verdes
- **F4**: Dockerfile generado por tool, build OK al 1er intento, healthcheck `healthy` en <60s

Si tu sesión desvía de estos números, probablemente estás cayendo en una de las trampas de la sección 3.
