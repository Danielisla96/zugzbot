---
name: sdd-methodology
description: Guía DETALLADA del flujo SDD con trampas conocidas. SOLO para subagentes (spec-writer, coder, tester, deployer). El orquestador debe cargar `sdd-foundation-overview` en su lugar.
license: MIT
compatibility: opencode
---

## A quién está dirigida esta habilidad

Esta skill es la versión **detallada y profunda** del flujo SDD. Está optimizada para subagentes que necesitan el contexto completo de las 5 fases, las trampas conocidas y los atajos avanzados.

**El orquestador NO debe cargar esta skill.** Carga `sdd-foundation-overview` (~50 líneas) en su lugar.

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
| `sdd_set_phase({ phase: "F1_CONTRACT", spec_name: "..." })` | F0→F1 | Crea la carpeta del spec atómicamente, sin race de timestamp |
| `brain_read_memory({ category: ... })` | F0-F4 | Consulta el cerebro del proyecto para recuperar aprendizajes y evitar errores históricos |
| `brain_save_memory({ category: ... })` | F2, F4 | Guarda aprendizajes, errores técnicos resueltos y decisiones de diseño en el cerebro |
| Skill `sdd-quickstart` | F1 | Plantilla de `contract.json` pre-rellenada + test_scenarios recurrentes |
| `sdd_lucide_validate_lucide_icons_batch({ icons: [...] })` | F1 | Valida lote completo de iconos Lucide en 1 call (vs 1 por icono) |
| `sdd_catalog_list_blocks({ registry: "all" })` | F1 | Lista candidatos de shadcn/basecn/reactbits en 1 call |
| `sdd_generate_dockerfile({ stack: "nextjs", port: 3000 })` | F4 | Genera Dockerfile + .dockerignore + docker-compose.yml en 1 call |
| `_sessions.jsonl` | Histórico | 1 línea por contrato (vs 18K+ líneas de MD export) |

> **Diseño**: el arnés ya no inyecta marcas externas. El default es `shadcn-zinc` nativo del template `nextjs-shadcn`. Si el usuario quiere tokens custom, lo hace explícito en F2 con edición manual de `globals.css`.

---

## 3. Trampas del Flujo Maestro (EVITAR siempre)

### Trampa 1: Preguntar marca de diseño al usuario en F0
**NO HAGAS**: Preguntar al usuario "¿qué marca/diseño quieres?" o asumir tokens custom por defecto.
**HAZ**: Asumir `shadcn-zinc` nativo. El template `nextjs-shadcn/src/app/globals.css` ya viene con todas las variables semánticas para tema claro/oscuro. El usuario puede pedir custom en F2 si quiere.

### Trampa 2: Crear la carpeta del spec en 2 steps
**NO HAGAS**: Llamar a `sdd_create_spec_folder("mi-spec")` y luego a `sdd_set_phase("F1_CONTRACT", ...)` por separado (causa race conditions en el timestamp).
**HAZ**: Transiciona en un solo paso: `sdd_set_phase({ phase: "F1_CONTRACT", spec_name: "mi-spec" })`.

### Trampa 3: Cargar `next-devtools` MCP en sesión normal
**NO HAGAS**: Activar `next-devtools` por defecto. Inyecta miles de palabras de instrucciones redundantes al contexto, desperdiciando tokens de razonamiento.
**HAZ**: Mantenerlo deshabilitado en `opencode.json` y activarlo únicamente bajo demanda si se depura un error muy específico del runtime de Next.js.

### Trampa 4: Escribir el contrato desde cero en F1
**NO HAGAS**: Redactar cientos de líneas de `contract.json` de forma manual.
**HAZ**: Cargar la skill `sdd-quickstart` y rellenar los huecos `{{...}}` de su plantilla preconfigurada.

### Trampa 5: Permitir que el Coder escriba los tests en F2
**NO HAGAS**: Desarrollar la lógica y luego redactar las pruebas (causa bucles redundantes entre Coder y Tester).
**HAZ**: Que el Spec-Writer declare las aserciones en el contrato en F1. El Coder solo implementa el código de negocio necesario para que pasen.

### Trampa 6: Exceso de actualizaciones de TODOs con `todowrite`
**NO HAGAS**: Llamar a `todowrite` para actualizar el estado del arnés tras cada pequeño cambio o fase.
**HAZ**: Inicializar la lista al inicio, marcar `in_progress` al arrancar una fase, y marcar los TODOs completados en bloque al final.

### Trampa 7: Cargar skills duplicadas en subagentes
**NO HAGAS**: Cargar skills generales (como `sdd-methodology`) de manera redundante en subagentes especializados (como `@sdd-deployer` o `@sdd-tester`) que ya la tienen incorporada en su prompt base.
**HAZ**: Limitar la carga de skills estrictamente a tareas que requieran sus plantillas específicas.

### Trampa 8: Invocar Playwright en modo Console
**NO HAGAS**: Abrir navegadores o tomar snapshots si `verificationMode` es `"console"`.
**HAZ**: Confiar plenamente en Vitest/Pytest y curls rápidos desde la terminal.

### Trampa 9: Orquestador usurpador (Ruptura de Abstracción)
**NO HAGAS**: Editar código de producción o escribir/ejecutar tests directamente desde el orquestador si un subagente falla o se queda sin pasos.
**HAZ**: Re-invocar al subagente experto (`sdd-coder` o `sdd-tester`) mediante la herramienta `task` pasándole el `task_id` original para que continúe limpiamente.

### Trampa 10: Obsesión por alineación exacta en consola (Pixel-Peeping)
**NO HAGAS**: Consumir iteraciones intentando alinear espacios exactos en salidas CLI o tablas ASCII.
**HAZ**: Usar funciones estándar de formateo de strings de tu lenguaje (`ljust()`, `rjust()`) y priorizar la lógica de negocio y las pruebas.

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
│   ├── DESIGN.md                 # Resumen del spec activo (actualizado por sdd_save_active_brief)
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
