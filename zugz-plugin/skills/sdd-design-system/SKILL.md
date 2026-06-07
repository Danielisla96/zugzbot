---
name: sdd-design-system
description: Carga y aplica design tokens estrictos (Airbnb, Apple, HeroUI, Meta, Nike, Notion, Renault, The Verge, Uber, Voltagent, x.ai) al crear UI. Usar cuando el pedido involucre crear vistas, componentes, landing, dashboard, página web, formulario, modal, navbar, footer, card, botón, formulario, tabla o cualquier frontend. También usar cuando el prompt mencione explícitamente una de las marcas soportadas (estilo Apple, como Notion, vibe de The Verge, etc.).
---

# SDD Design System Loader

Carga un design system del catálogo y persiste la elección en el lockfile SDD
para que el subagente de implementación (Fase 2) lo siga al pie de la letra.

## Cuándo activarme

- Pedido contiene verbos de construcción de UI: "crear front", "armar landing",
  "hacer dashboard", "construir página", "implementar vista", "diseñar
  componente", "maquetar", "styling".
- Pedido menciona explícitamente una marca del catálogo: "estilo Apple", "como
  Notion", "vibe The Verge", "dark mode como Voltagent", etc.
- El router `@zugzbot` detecta el patrón y te invoca (ver
  `agents/zugzbot.md` → sección "Detección de UI").

## Catálogo

Ver `catalog.md` (en esta misma carpeta) para la lista canónica de 10 design
systems disponibles, con su `slug`, `path`, `primary color` y `vibe`.

## Flujo obligatorio (no negociable)

Este flujo es **lineal y bloqueante**. No avances a Fase 2 si no completaste
todos los pasos.

**Importante**: este skill es **el prompt**. Cuando te invocan
(`skill({ name: "sdd-design-system" })`), tu primer paso es mostrar el
picker al usuario. No pidas permiso al Orquestador para preguntar — la
pregunta al usuario **es** tu trabajo.

### Paso 1 — Detectar elección del usuario

1. **Si el prompt menciona una marca explícita** ("estilo Apple", "como
   The Verge") → mapear al slug correspondiente del catálogo. **Confirmá
   brevemente con el usuario** (1 línea) en vez de re-mostrar el picker
   completo.
2. **Si el dominio es claro** (marketplace, devtool, editorial, etc.) →
   inferir según las reglas de `catalog.md` sección "Reglas de elección".
   **Confirmá brevemente con el usuario** antes de persistir.
3. **Si no hay pista** → usar la tool `question` con la lista numerada del
   catálogo. Una sola llamada, opciones múltiples (Single-Select). Esta es
   la **única pregunta al usuario** sobre el design system.

   Formato de la pregunta:
   ```
   ¿Qué design system querés usar como base para este frontend?

    1. airbnb — marketplace cálido, primary #ff385c
    2. apple — minimal premium, photography-first
    3. heroui — clean modern, Tailwind-based components
    4. meta — utility-first, blue brand
    5. nike — bold sports, black/white editorial
    6. notion — productivity, off-white canvas
    7. renault — automotive, dark + sunlight yellow
    8. theverge — editorial tech media, dark + oversized headlines
    9. uber — clean utilitarian, geometric sans + pill
    10. voltagent — devtool, near-black + electric green
    11. x.ai — AI brand, near-black + cosmic gradients
    12. (skip) — sin design system, estilo ad-hoc

   (Por defecto: el último usado. Respondé con el número o el slug.)
   ```

4. **Si el usuario eligió un slug (1-11)** → persistir vía
   `sdd_lock_manager` con `action: "set_design_system"`,
   `patch: { slug: "<slug>" }`. Eso setea
   `active_design_system: "<slug>"` y `design_system_explicitly_skipped: false`.

5. **Si el usuario eligió "skip" (opción 12)** → persistir vía
   `sdd_lock_manager` con `action: "skip_design_system"`. Eso setea
   `active_design_system: null` y `design_system_explicitly_skipped: true`.
   El sdd-builder procederá con estilo ad-hoc y emitirá un warning.

6. **Si el usuario eligió algo no reconocible** (texto libre que no
   matchea ningún slug) → re-preguntar con el picker. NO improvisar.

### Paso 2 — Cargar tokens

Una vez elegido el slug, invocar la tool `read` sobre
`.opencode/design/DESIGN-<slug>.md` (path relativo a la raíz del proyecto del
usuario). Estos archivos los copia el instalador de `zugzbot-sdd`
(`npx zugzbot`) a `<INSTALL_DIR>/.opencode/design/`. En el repo de desarrollo
viven en `zugz-plugin/design/`.

**Cargar el archivo completo en contexto** — los design tokens son
interdependientes y omitir bloques rompe la coherencia visual.

Verificaciones obligatorias tras leer:

- ✅ Existe bloque `colors:` (puede estar en `colors.primary` o, en The Verge,
  descrito en prosa — extraer manualmente el hex principal).
- ✅ Existe bloque `typography:` o `type:` con al menos `display`, `body` y
  `caption`.
- ✅ Existe bloque `rounded:` o `radius:` con al menos `sm`, `md`, `lg`.
- ✅ Existe bloque `spacing:` o `space:` con escala clara.
- ✅ Existe bloque `components:` con al menos `button-primary` y `card`.

Si **falla alguna verificación** → emitir `design_gap` en `diagnostics.md` y
preguntar al usuario si quiere continuar con los tokens parciales o elegir
otro design system.

### Paso 3 — Persistir elección (amnesia-cero)

Invocar la tool `sdd_lock_manager` con:

```json
{
  "action": "update",
  "patch": "{\"active_design_system\": \"DESIGN-<slug>\"}"
}
```

Esto guarda la elección en `.openspec/sdd-lock.json` (campo
`active_design_system`). En el próximo turno, `@zugzbot` la lee del lockfile y
no vuelve a preguntar.

### Paso 4 — SANTUARIO (reglas estrictas durante Fase 2)

A partir de este punto, **toda** decisión de UI usa los tokens del YAML
cargado. **No hay excepciones**.

| ✅ Permitido | ❌ Prohibido |
|---|---|
| `style={{ background: 'var(--color-primary)' }}` referenciando el token | `style={{ background: '#ff385c' }}` hardcoded |
| Usar `<Button variant="primary">` mapeado a `components.button-primary` | `<button style={{ background: 'red' }}>` ad-hoc |
| Importar la typography scale del design system | `font-family: sans-serif` genérico |
| Aplicar `rounded.md` del design system | Inventar `border-radius: 13px` |
| Referenciar `spacing.lg` | Hardcodear `padding: 23px` |

Si el código de Fase 2 contiene valores hardcoded detectables por inspección
visual (hex colors, font-family fuera de la escala, border-radius fuera de la
escala) → es un **fallo de compliance** que `sdd_spec_compliance_linter` debe
detectar en Fase 3.

### Paso 5 — Gate al terminar UI

Antes de transicionar a Fase 3 (testing), invocar:

- `sdd_spec_validator` con el bloque `Design Constraints` del spec → debe
  pasar.
- `sdd_visual_regression_diff` con screenshots antes/después → debe mostrar
  0 desviaciones visuales fuera de la tolerancia.
- Si `sdd_visual_regression_diff` no está disponible → al menos
  `sdd_ui_auditor` con `mode: 'design-compliance'`.

## Cambiar de design system a mitad de proyecto

Si el usuario quiere cambiar el design system activo:

1. Leer `lock.active_design_system` actual.
2. Confirmar cambio con `question` (esta acción invalida coherencia visual
   previa).
3. Repetir desde Paso 1 con el nuevo slug.
4. **No migrar código automáticamente** — el cambio es opcional; documentar
   en `diagnostics.md` que los archivos UI pre-existentes NO cumplen el
   nuevo design system.

## Tags

#design-system #ui #frontend #tokens #compliance #builder
