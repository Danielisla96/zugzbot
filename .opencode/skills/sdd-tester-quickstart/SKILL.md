---
name: sdd-tester-quickstart
description: Guía de ejecución ultra-rápida y libre de fricción para la fase F3_VERIFICATION (Tester). Evita la exploración ciega y el redescubrimiento mediante un plan de pruebas y mocks estandarizados.
license: MIT
compatibility: opencode
---

## Qué hace esta habilidad

Esta habilidad proporciona un **flujo de trabajo estructurado en 4 pasos** para el `@sdd-tester` en la fase **F3_VERIFICATION**, eliminando el exceso de llamadas a `read`, `glob` y `edit` (iteraciones fallidas).

---

## 🚀 El flujo F3 en 4 pasos (Sin exploración ciega)

*NOTA DE LENGUAJE (CRÍTICO):* Si el proyecto es en **Python**, toda la suite de Node.js/Vitest queda excluida. Aplica los pasos de abajo usando herramientas de Python:
- En el **Paso 1**, lee `requirements.txt` y los archivos en `tests/` y `src/`.
- En el **Paso 2**, no ejecutes `./generate-tests.sh` ya que es Node. El contrato ya debió tener los tests redactados por el spec-writer, o el coder los generó en F2.
- En el **Paso 3**, no aplican los mocks de React, Lucide ni `crypto.randomUUID` en JS. Si necesitas mockear en Python, usa `unittest.mock` (como `patch` o `MagicMock`).
- En el **Paso 4**, ejecuta `ruff check src/` o similar para linting, y `python -m pytest tests/ -v` para ejecutar toda la suite de pruebas de una sola llamada consolidada.

### Paso 1: Leer solo lo indispensable (Máximo 3 reads)
1. **Contrato**: Lee únicamente `contract.json` para extraer los `test_scenarios` y el `verificationMode`.
2. **Setup**: Lee `src/test/setup.ts` o `vitest.config.ts` para confirmar si ya hay polyfills.
3. **Breve examen**: Lee el componente principal (`AppLayout` o similar) para confirmar el `stateFlow`. 
*NO uses `glob` ciegos para buscar archivos del proyecto.*

### Paso 2: Autogenerar plantillas de tests (BLOQUEANTE)
Antes de escribir cualquier test a mano, **DEBES** ejecutar:
```bash
./generate-tests.sh
```
Esto creará automáticamente las plantillas correspondientes en base a los `test_scenarios` del contrato, previniendo inconsistencias de nombres o firmas de tests.

### Paso 3: Completar aserciones usando Mocks Estandarizados (Evitar fallos de librerías)
Completa los tests importando los componentes reales. Si Vitest o happy-dom fallan por dependencias externas de Shadcn UI o Lucide, aplica estos mocks centralizados:

#### Mock de Lucide Icons (si fallan por SVG/React)
```typescript
vi.mock('lucide-react', () => ({
  Sun: () => <div data-testid="icon-sun" />,
  Moon: () => <div data-testid="icon-moon" />,
  Plus: () => <div data-testid="icon-plus" />,
  Trash2: () => <div data-testid="icon-trash" />,
  History: () => <div data-testid="icon-history" />,
  Clock: () => <div data-testid="icon-clock" />,
  Calculator: () => <div data-testid="icon-calculator" />
}));
```

#### Mock de Base UI / Shadcn Radix Primitives
```typescript
vi.mock('@radix-ui/react-switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onCheckedChange(e.target.checked)} 
      data-testid="shadcn-switch"
    />
  )
}));
```

#### Mock de `crypto.randomUUID` (evitar warnings de llaves duplicadas en React)
```typescript
let uuidCounter = 0;
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: { 
      randomUUID: () => `test-uuid-${++uuidCounter}-${Math.random().toString(36).slice(2, 6)}` 
    }
  });
}
```

#### Mock de `next-themes` (Soporte reactivo de Tema)
Para probar toggles de tema sin que fallen en clics sucesivos:
```typescript
let currentTheme = 'light';
const mockSetTheme = vi.fn((newTheme: string) => {
  currentTheme = newTheme;
});

vi.mock('next-themes', () => ({
  useTheme: () => ({
    get theme() { return currentTheme; },
    setTheme: mockSetTheme,
    get resolvedTheme() { return currentTheme; },
  }),
}));
```

#### Mock de `next/navigation` (Router y Pathname)
```typescript
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));
```

### Paso 4: Ejecutar Lint y Tests consolidando comandos
1. Corre el linter enfocado en el código fuente:
```bash
npx eslint src/
```
2. Corre la suite completa en modo ejecución única (no watch):
```bash
npx vitest run
```

---

## 🚫 Restricciones críticas para F3_VERIFICATION

1. **PROHIBIDO Playwright en modo Console**: Si `verificationMode === "console"`, no instancies ni corras ningún test de Playwright, ni navegues con tools de Playwright. Solo corre tests de Vitest.
2. **PROHIBIDO modificar código de features para "hacer pasar" el test**: Si el código tiene un bug, haz rollback a `F2_IMPLEMENTATION` reportando el error exacto al coder. No parches la lógica del negocio en F3.
3. **Consolidación**: No corras `vitest` archivo por archivo. Corre la suite completa en una sola llamada a `bash`.
