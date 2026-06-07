---
name: sdd-heroui
description: Instrucciones y guías para integrar y construir interfaces con HeroUI (anteriormente NextUI). Usar cuando el usuario haya elegido 'heroui' como biblioteca de componentes o cuando se requieran componentes interactivos premium de React.
---

# SDD HeroUI Skill

Este skill define cómo configurar, estructurar e implementar componentes utilizando **HeroUI** (NextUI v2.x).

## Instalación e Inicialización

Para integrar HeroUI en un proyecto React/Next.js/Vite:

```bash
npm install @heroui/react framer-motion tailwind-merge clsx
```

### Configuración de Tailwind CSS (`tailwind.config.js`):

```javascript
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}" // Ajustar según estructura de carpetas
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()]
}
```

### Proveedor de Contexto (Context Provider)

Envuelve la aplicación o la raíz en `<HeroUIProvider>`:

```tsx
import { HeroUIProvider } from "@heroui/react";

export function App() {
  return (
    <HeroUIProvider>
      <YourApp />
    </HeroUIProvider>
  );
}
```

## Reglas de Desarrollo con HeroUI

- **Uso Obligatorio de Componentes:** Si HeroUI ofrece un componente para un elemento HTML nativo, DEBES utilizar el de HeroUI.
  - Usar `<Button>` en lugar de `<button>`.
  - Usar `<Input>` o `<Select>` en lugar de `<input>` o `<select>`.
  - Usar `<Table>` en lugar de `<table>`.
- **Estilos y Clases de Tailwind:** Puedes personalizar y extender estilos de HeroUI mediante las props `className` o usando el objeto `classNames` para targetear partes internas de los componentes (ej. `classNames={{ wrapper: "bg-red-500" }}`).
- **Animaciones:** Todas las transiciones de HeroUI dependen de `framer-motion`, asegúrate de que esté correctamente instalado en `package.json`.
