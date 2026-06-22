---
name: sdd-foundation-overview
description: Resumen ejecutivo del flujo SDD para el orquestador. Cargado SOLO por el orquestador principal (~50 líneas). Para detalles profundos, los subagentes cargan `sdd-methodology` directamente.
license: MIT
compatibility: opencode
---

## Qué hace esta habilidad

Resumen ultra-compacto del ciclo SDD. El orquestador NO debe cargar `sdd-methodology` (600 líneas). Solo esta skill + delegar.

## El ciclo en 60 segundos

```
F0 → detectar stack + auto-bootstrap (si dashboard/admin/panel) + diseñar 1 pregunta
F1 → spec-writer redacta contract.json desde plantilla (sdd-quickstart)
F2 → coder implementa con block-first (@shadcn/dashboard-01 si es dashboard)
F3 → tester corre vitest/pytest (tests YA tienen assertions reales)
F4 → deployer genera Dockerfile + build + verify
```

## Defaults razonables (NO preguntar)

- **Stack**: Next.js 16 + Shadcn UI + Tailwind v4 (frontend), FastAPI + Pydantic (backend)
- **Verificación**: `console` (5x más rápido que `visual`)
- **Persistencia**: localStorage (mock frontend), SQLite (backend simple)
- **Diseño**: `shadcn-zinc` nativo (default; sin marcas externas)

## Atajos críticos

| Atajo | Ahorro |
|---|---|
| `sdd_set_phase({ phase: "F1_CONTRACT", spec_name: "..." })` atómico | Crea carpeta sin race |
| `brain_read_memory({ category: ... })` en F0 y F3 inicio | Previene errores históricos |
| Skill `sdd-quickstart` en F1 | Plantilla pre-rellenada (~1 min vs 3+ min) |
| `sdd_catalog_list_blocks({ registry: "all" })` en F1 | Lista shadcn/basecn/reactbits en 1 call |
| `sdd_lucide_validate_lucide_icons_batch({ icons: [...] })` en F1 | Valida lote de iconos en 1 call |
| `sdd_generate_dockerfile({ stack: "nextjs", port: 3000 })` en F4 | Genera 3 archivos en 1 call |

## Reglas duras

1. **Coordinación pura**: el orquestador NO escribe/edita código. Solo delega vía `task`.
2. **Hasta 5 preguntas SECUENCIALES en F0 (HIL)**: Propósito → Track (Fast/SDD) → Stack (con recomendaciones priorizadas) → Diseño (con `preview_url` del catálogo unificado) → Verificación (Console/Visual). Cada paso es 1 llamada separada a `question` (PROHIBIDO arrays múltiples — causa errores JSON). **Solo `/loop`** bypasea TODAS las preguntas y asume defaults. El usuario puede escribir `default`/`skip`/`recomienda` en cualquier paso para aceptar el default y continuar. `/fast` salta el wizard y va directo a F2 (sin pasar por F1/F3/F4).
3. **No hay atajos por keywords**: la detección de `dashboard/admin/panel/hero/landing` ya NO bypasea el wizard — solo guarda `sdd_hints.detected_blocks` que se presentan como sugerencias prioritarias en 5.4 Diseño con `preview_url`. El usuario decide. Los únicos bypass legítimos son `/loop` (100% autónomo) y `/fast` (skip total → F2 sin wizard).
4. **Brain obligatorio**: save 1-3 lecciones al cerrar cada sesión, read learnings+errors en F0.
5. **Tests con assertions reales**: nunca stubs con `expect(true).toBe(true)`.

## Métricas objetivo de una sesión

- F0 HIL: hasta 5 rondas de `question` (Propósito → Track → Stack → Diseño → Verificación); 0 rondas solo si `/loop` (autopiloto)
- F1: contract.json 80-120 líneas, 3-5 test_scenarios
- F2: self-audit limpio en 1 intento
- F3: lint + tests verdes en 1 intento
- F4: build OK al 1er intento, healthcheck `healthy` en <60s

## Anti-patrones (PROHIBIDO)

- Cargar `sdd-methodology` (600 líneas) en el orquestador
- Preguntar stack/diseño/persistencia si el usuario dijo "dashboard"
- Usar `todowrite` más de 2 veces por sesión
- Ejecutar `glob`/`grep` ciegos en el orquestador
- Pedirle al orquestador que compile/testee código

## Inyectar en briefs de subagentes

Cada vez que delegues a un subagente, pasa en el brief:
- `brain_learnings`: resultado de `brain_read_memory({ category: "design" })` para coder
- `regressions`: resultado de `brain_read_memory({ category: "errors" })` para tester
- `mockPatterns`: pre-armados para tester (Proxy lucide-react, mock next-themes)
- `files_affected`: lista exacta, NO paths inferidos
