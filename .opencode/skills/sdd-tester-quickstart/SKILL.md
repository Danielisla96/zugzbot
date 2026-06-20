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

### Paso 1: Leer solo lo indispensable (Máximo 3 reads) y asegurar entorno
1. **Contrato**: Lee únicamente `contract.json` para extraer los `test_scenarios` y el `verificationMode`.
2. **Setup**: Lee `src/test/setup.ts` o `vitest.config.ts` para confirmar si ya hay polyfills.
3. **Breve examen**: Lee el componente principal (`AppLayout` o similar) para confirmar el `stateFlow`. 
*NO uses `glob` ciegos para buscar archivos del proyecto.*

**VERIFICACIÓN CLAVE DE DEPENDENCIAS**: Asegúrate de que `package.json` tenga instaladas las devDependencies necesarias para pruebas de React: `happy-dom`, `@testing-library/jest-dom` y `@testing-library/dom`. Si no están presentes, instálalas en un solo comando unificado: `npm install --save-dev happy-dom @testing-library/jest-dom @testing-library/dom`.

### Paso 2: Autogenerar plantillas de tests (BLOQUEANTE)
Antes de escribir cualquier test a mano, **DEBES** ejecutar:
```bash
./generate-tests.sh
```
Esto creará automáticamente las plantillas correspondientes en base a los `test_scenarios` del contrato, previniendo inconsistencias de nombres o firmas de tests.

### Paso 3: Completar aserciones usando Mocks Estandarizados (Evitar fallos de librerías)
Completa los tests importando los componentes reales. Si Vitest o happy-dom fallan por dependencias externas de Shadcn UI o Lucide, aplica estos mocks centralizados:

#### Mock Dinámico de Lucide Icons (Recomendado para evitar fallos de iconos faltantes)
Para evitar que tests fallen porque falta mockear un icono específico (ej. `PanelLeft`, `Search`, etc.), usa un Proxy que mockea dinámicamente CUALQUIER icono exportado por `lucide-react`:
```typescript
vi.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        // Retorna un componente funcional con el testid del icono solicitado
        const IconComponent = (props: any) => (
          <span data-testid={`icon-${String(prop).toLowerCase()}`} {...props} />
        );
        IconComponent.displayName = String(prop);
        return IconComponent;
      },
    }
  );
});
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
4. **REGLA DE ORO DE ASERCIONES DE TEXTO (Acentos y Encoding)**: Para evitar fallos tontos de aserción por diferencias de codificación en caracteres con tildes (ej: `ó` vs `\u00f3`, `ñ` vs `\u00f1`), usa siempre expresiones regulares insensibles a mayúsculas y comodines (ej: `screen.getByText(/Inicia sesi.n/i)` o `screen.getByText(/contrase.a/i)`). Nunca utilices comparaciones estrictas de cadenas de texto acentuadas.

---

## ⚠️ Trampas Comunes de Pruebas (Testing Gotchas)

### 1. Extensión incorrecta en archivos de pruebas con JSX
* **No hagas**: Usar la extensión `.ts` para archivos de tests que renderizan primitivas de HTML o JSX o que mockean componentes de interfaz (causa fallos de compilación inmediatos en Vitest).
* **Haz**: Toda suite de pruebas que monte componentes o contenga JSX debe grabarse con la extensión `.tsx` obligatoriamente.

### 2. Selectores ambiguos para campos interactivos comunes
* **No hagas**: Usar queries genéricas e insensibles como `screen.getByLabelText(/password/i)` si existen múltiples elementos en el DOM que contengan esa palabra (ej: botones de "Show password"). Esto lanzará un error de "Found multiple elements".
* **Haz**: Usa selectores de coincidencia exacta como `screen.getByLabelText(/^Password$/)` o busca mediante placeholders específicos (`screen.getByPlaceholderText(...)`).

### 3. Validar ausencia de elementos ocultos por CSS con `not.toBeInTheDocument()`
* **No hagas**: Tratar de validar que un menú o modal colapsado/oculto ya no es visible utilizando `expect(queryByText("...")).not.toBeInTheDocument()`. Si el elemento simplemente se oculta con clases de CSS (como `hidden`, `w-0` u `opacity-0`), el nodo sigue existiendo físicamente en el DOM.
* **Haz**: Verifica la visibilidad real usando `.not.toBeVisible()` de `@testing-library/jest-dom`, o comprueba directamente las clases CSS de colapso.

### 4. Mocks estáticos de hooks con estado
* **No hagas**: Mockear hooks que controlan toggles (como `useTheme` de `next-themes`) usando un retorno fijo estático. Al simular el clic en el botón de toggle, el test fallará o entrará en bucles porque el valor del estado simulado permanece congelado.
* **Haz**: Declara variables mutables locales a nivel de archivo de pruebas y usa getters dinámicos en la definición del mock de Vitest para simular los cambios de estado correctamente.
