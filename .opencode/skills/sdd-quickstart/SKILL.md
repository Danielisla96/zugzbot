---
name: sdd-quickstart
description: Plantilla de contract.json + lista de test_scenarios recurrentes para acelerar F1. Cargar al inicio de F1_CONTRACT para evitar redactar 600+ líneas desde cero. Solo rellenar los huecos {{...}} con los datos específicos del proyecto.
license: MIT
compatibility: opencode
---

## Qué hace esta habilidad

Proporciona una **plantilla pre-rellenada** del `contract.json` SDD para el stack cerrado `frontend + nextjs-shadcn + localStorage`, junto con escenarios de prueba recurrentes (CALC, HIST, THEME) ya escritos con sus `given/when/then`. El spec-writer solo debe:

1. Cargar esta skill.
2. Copiar la plantilla a `.openspec/specs/<spec_folder>/contract.json`.
3. Reemplazar los huecos `{{...}}` con los datos del proyecto.
4. Ajustar los `test_scenarios` que apliquen (borrar los que no, no inventar nuevos a menos que sean necesarios).

**Beneficio**: Reduce la fase F1 de ~3 min a ~1 min y elimina inconsistencias de redacción entre sesiones.

---

## 1. Plantilla de contract.json

Copia el siguiente JSON y rellena los huecos. Los campos sin `{{...}}` se mantienen tal cual.

```json
{
  "$schema": "../../../.opencode/contract-schema.json",
  "contractName": "{{NOMBRE_EN_PASCAL_CASE}}",
  "description": "{{DESCRIPCION_DE_UNA_LINEA}}",
  "category": "frontend",
  "settings": {
    "verificationMode": "{{console|visual}}",
    "language": "TypeScript",
    "testFramework": "Vitest",
    "darkMode": "class-based (tailwind dark:)",
    "persistence": "{{localStorage|sqlite|postgresql}}"
  },
  "design": {
    "brand": "{{BRAND_ID}}",
    "reference": ".openspec/design-assets/{{BRAND_ID}}/DESIGN.md",
    "tokens": "{{PEGA_AQUI_LOS_TOKENS_EXTRAIDOS_CON_oh-my-design_get_design_md}}"
  },
  "stack": {
    "core": ["Next.js 16", "Shadcn UI", "Tailwind CSS v4", "{{PERSISTENCE}}"],
    "databases": []
  },
  "routes": [
    {
      "path": "/",
      "name": "Home",
      "description": "{{DESCRIPCION_RUTA}}",
      "layout": "AppLayout (Header + main content)",
      "components": ["AppLayout", "{{COMPONENTE_1}}", "{{COMPONENTE_2}}"],
      "access": "public"
    }
  ],
  "frontend": {
    "components": [
      {
        "name": "AppLayout",
        "path": "@/components/layout/AppLayout",
        "description": "Layout general. Header con título en MAYÚSCULAS y ThemeToggle a la derecha.",
        "props": { "children": "React.ReactNode" }
      },
      {
        "name": "{{COMPONENTE_PRINCIPAL}}",
        "path": "@/components/blocks/{{COMPONENTE_PRINCIPAL_KEBAB}}",
        "description": "{{DESCRIPCION_COMPONENTE_PRINCIPAL}}",
        "props": {}
      }
    ]
  },
  "stateFlow": {
    "owner": "AppLayout",
    "lifts_to": null,
    "props_down": [
      { "from": "AppLayout", "to": "{{COMPONENTE_PRINCIPAL}}", "prop": "onChange", "type": "callback" }
    ],
    "forbidden": ["instanciar useState en componentes hijos", "usar context global sin provider"]
  },
  "test_scenarios": [
    {
      "id": "TS-01",
      "name": "Renderiza el componente principal con estado vacío",
      "type": "unit",
      "feature_ref": "{{COMPONENTE_PRINCIPAL}}",
      "given": "el componente se monta por primera vez",
      "when": "no hay interacción del usuario",
      "then": "se muestra el estado inicial sin errores"
    },
    {
      "id": "TS-02",
      "name": "Valida inputs requeridos antes de calcular",
      "type": "unit",
      "feature_ref": "{{COMPONENTE_PRINCIPAL}}",
      "given": "el usuario no ha ingresado valores en los inputs",
      "when": "hace clic en el botón principal",
      "then": "se muestra un mensaje de error y no se calcula"
    },
    {
      "id": "TS-03",
      "name": "Persiste el resultado en el almacenamiento configurado",
      "type": "integration",
      "feature_ref": "{{HISTORIAL_O_PERSISTENCIA}}",
      "given": "el usuario realiza una operación válida",
      "when": "se muestra el resultado",
      "then": "la operación queda guardada en {{PERSISTENCE}} y es visible después de recargar"
    },
    {
      "id": "TS-04",
      "name": "Toggle de modo oscuro/claro persiste entre sesiones",
      "type": "integration",
      "feature_ref": "ThemeToggle",
      "given": "el usuario cambia el tema a oscuro",
      "when": "recarga la página",
      "then": "el tema oscuro se mantiene y la clase `dark` está presente en `<html>`"
    }
  ]
}
```

---

## 2. Escenarios reutilizables por tipo de feature

Copia y adapta los IDs y descripciones que apliquen. Borra los que no apliquen.

### Calculadora / Formulario numérico
- `CALC-01`: Suma/resta/multiplica correctamente con valores válidos.
- `CALC-02`: Muestra error si los inputs están vacíos o no son numéricos.
- `CALC-03`: El botón se deshabilita durante el cálculo (loading state).
- `CALC-04`: El resultado se redondea a N decimales según contrato.

### Historial / Lista persistente
- `HIST-01`: La operación se agrega al historial tras una operación exitosa.
- `HIST-02`: El historial persiste tras recargar (localStorage / DB).
- `HIST-03`: Botón "Limpiar historial" vacía la lista y el storage.
- `HIST-04`: Empty state visible cuando no hay operaciones.

### Toggle de tema
- `THEME-01`: El toggle cambia la clase `dark` en `<html>`.
- `THEME-02`: La preferencia se guarda en localStorage.
- `THEME-03`: Al recargar, el tema guardado se restaura.
- `THEME-04`: Sigue la preferencia del sistema (`prefers-color-scheme`) si no hay preferencia guardada.

### Auth / User
- `AUTH-01`: Login con credenciales válidas redirige al dashboard.
- `AUTH-02`: Login con credenciales inválidas muestra error genérico.
- `AUTH-03`: Logout limpia el token y redirige a `/login`.

### Charts / Recharts (CRÍTICO — bugfix sesión 1176)

Cuando el contrato declare un chart de Recharts (`chart-area-*`, `chart-bar-*`, `chart-pie-*`, etc.) o cualquier componente que lea `var(--chart-*)`, **debes incluir al menos UNO de los siguientes test_scenarios para forzar la validación de tema dark/light en F3**:

```json
{
  "id": "TS-CHART-01",
  "name": "Chart visible con contraste WCAG AA en modo oscuro",
  "type": "visual",
  "feature_ref": "ChartAreaInteractive",
  "given": "el dashboard se renderiza en modo oscuro",
  "when": "el area chart muestra las series desktop y mobile",
  "then": "las líneas y rellenos tienen contraste >= 4.5:1 con el fondo de la card",
  "selector": "[data-testid='chart-area-interactive']",
  "assertion": "color-contrast-pass AND not-invisible"
}
```

```json
{
  "id": "TS-CHART-02",
  "name": "ChartConfig usa variables CSS válidas (no hsl+oklch mix)",
  "type": "unit",
  "feature_ref": "ChartAreaInteractive",
  "given": "el componente importa su chartConfig",
  "when": "el linter `node .opencode/scripts/lint-charts.js` escanea el archivo",
  "then": "ninguna entrada usa 'hsl(var(--chart-N))'; todas usan 'var(--color-chart-N)' directamente",
  "assertion": "lint-charts --json status == PASS"
}
```

**Por qué importan**: en sesión 1176, el coder dejó `color: "hsl(var(--chart-1))"` que es CSS inválido porque `--chart-1` se define en OKLCH. El usuario tuvo que reportar el bug manualmente. Estos test_scenarios **activan el linter BLOQUEANTE** `sdd_testing_lint_charts` durante shift-left y fuerzan al tester a validar contraste visual con Playwright.

Si el chart es solo decorativo (no necesita tema oscuro), puedes omitir `TS-CHART-01`. Pero `TS-CHART-02` debería incluirse **siempre** que el chart use tokens `--chart-*`.

---

## 2.5. Plantilla MÍNIMA viable (Fast-Track Dashboard)

Para un dashboard o panel estándar, usa esta plantilla **reducida** de **~80 líneas** en lugar de la completa. Omite `external_api_verification`, `database` y detalles innecesarios.

```json
{
  "$schema": "../../../.opencode/contract-schema.json",
  "contractName": "{{NOMBRE_PASCAL}}",
  "description": "{{UNA_LINEA}}",
  "category": "frontend",
  "settings": {
    "verificationMode": "console",
    "language": "TypeScript",
    "testFramework": "Vitest"
  },
  "stack": {
    "core": ["Next.js 16", "Shadcn UI", "Tailwind CSS v4"],
    "databases": []
  },
  "files_affected": [
    "src/app/page.tsx",
    "src/app/layout.tsx",
    "{{ARCHIVOS_RELEVANTES}}"
  ],
  "frontend": {
    "components": [
      { "name": "{{COMP_1}}", "path": "@/components/blocks/{{COMP_1_KEBAB}}" },
      { "name": "{{COMP_2}}", "path": "@/components/blocks/{{COMP_2_KEBAB}}" }
    ]
  },
  "test_scenarios": [
    {
      "id": "TS-01",
      "name": "{{NOMBRE_TEST}}",
      "type": "unit",
      "feature_ref": "{{COMP_1}}",
      "given": "{{GIVEN}}",
      "when": "{{WHEN}}",
      "then": "{{THEN_OBSERVABLE}}"
    }
  ],
  "sdd_hints": {
    "bootstrap_template": "nextjs-shadcn",
    "fast_track": true,
    "blocks_to_install": ["@shadcn/dashboard-01"]
  }
}
```

**Tiempo objetivo F1 con Fast-Track**: 30-45 segundos.

---

## 2.6. Estrategia de Testing (CRÍTICO — bugfix sesión 118f)

**El error más común en modo `console`**: hacer `render(<Component />)` sobre componentes que dependen de Context (SidebarProvider, ThemeProvider, etc.) **cuelga happy-dom indefinidamente**. Esto causa timeouts de 120-300s en el tester.

### Reglas:
- **Smoke tests por defecto (modo `console`)**: Solo verificar que el módulo se importa sin error, que `typeof Component === "function"`, y que las firmas del contrato se cumplen. NO usar `render()` salvo necesidad estricta.
- **Render real solo si**: el test scenario es `integration` Y la interacción es crítica (ej: ThemeToggle toggle). En ese caso, envolver con todos los Providers necesarios en el mismo archivo `.test.tsx`.
- **PROHIBIDO en `console`**: renderizar páginas server component completas, Sidebar sin `<SidebarProvider>`, Charts sin `<ResponsiveContainer>`.

### Plantilla de test_scenario segura:
```json
{
  "id": "TS-01",
  "name": "Componente se monta sin errores",
  "type": "unit",
  "feature_ref": "MiComponente",
  "given": "el módulo existe",
  "when": "se importa",
  "then": "se exporta una función válida sin errores de compilación"
}
```

---

## 3. Anti-patrones a evitar en el contrato

- **Inconsistencia de nombres de componentes (CRÍTICO)**: Los nombres declarados en `frontend.components[].name` del contrato son **un compromiso inmutable**. El spec-writer DEBE usar exactamente estos mismos nombres al crear las pruebas unitarias/integración, y el coder DEBE usarlos para crear los componentes de producción. **PROHIBIDO renombrar o cambiar de PascalCase a kebab-case en archivos de test**. Si el contrato dice `CalculatorPanel`, el archivo de test se llamará `CalculatorPanel.test.tsx` y no se debe cambiar a `CalculatorPage.test.tsx` (esto causó fallas de compilación con imports rotos en la sesión 1374).
- **NO busques iconos uno por uno**: PROHIBIDO usar `lucide-icons_fuzzy_search_icons` de forma repetitiva en un loop para cada icono. Usa la herramienta optimizada por lotes `sdd_validate_lucide_icons_batch` pasándole todo el arreglo de nombres de iconos que desees usar en una sola llamada.
- **NO uses `read` para DESIGN.md**: Para extraer los tokens de diseño de una marca, usa siempre `oh-my-design_get_design_md(brandId)` o lee selectivamente, no leas el archivo entero que consume miles de tokens de input innecesariamente.
- **NO embebas código TSX en el contrato.** El contrato es declarativo (qué, no cómo).
- **NO dupliques los tokens de `.openspec/design-assets/<brandId>/DESIGN.md` línea por línea.** Usa el tool `oh-my-design_get_design_md` y pega el bloque `tokens` completo UNA vez.
- **NO escribas más de 5-6 `test_scenarios`** para modo `console`. Más de eso no acelera la entrega, solo retrasa F2.
- **NO incluyas escenarios `visual` o `e2e` si `verificationMode` es `console`.** El tester los rechazará.
- **NO omitas la disposición espacial y propuesta de Layout**: El spec-writer DEBE proponer un bosquejo textual o diagrama ASCII de la disposición espacial de la UI en F1 (ej. layouts con sidebar lateral para configuración o paneles complejos en lugar de simples pestañas tradicionales planas) y acordar anchos de pantalla generosos (`max-w-6xl` o superior, evitando el limitante `max-w-3xl`) con el usuario antes de transicionar a F2. Esto previene reestructuraciones estéticas costosas y asegura entregas de alta gama a la primera.
- **NO omitas la página raíz (`src/app/page.tsx`) en el mapeo de archivos afectados**: El spec-writer DEBE asegurar que `src/app/page.tsx` quede registrado explícitamente y que el contrato aclare si la ruta raíz `/` servirá el contenido principal de la aplicación, o si simplemente ejecutará una redirección limpia (`redirect("/dashboard")`) hacia el panel principal. Esto evita que el Coder conserve el placeholder por defecto de bootstrap y cause inconsistencias visuales o de navegación.

---

## 4. Flujo de uso

```
[orchestrator] → sdd_set_phase({ phase: "F1_CONTRACT", spec_name: "..." })
[spec-writer]  → skill sdd-quickstart       ← ESTA SKILL
[spec-writer]  → read .opencode/contract-schema.json
[spec-writer]  → oh-my-design_get_design_md(brandId)  (si aplica)
[spec-writer]  → write .openspec/specs/.../contract.json (rellenando plantilla)
[spec-writer]  → sdd_set_phase({ phase: "F2_IMPLEMENTATION" })
```

**Tiempo objetivo F1**: 60-90 segundos (vs 3+ min sin esta skill).
