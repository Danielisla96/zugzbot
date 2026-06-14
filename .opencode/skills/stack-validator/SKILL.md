---
name: stack-validator
description: Restringe el desarrollo al stack cerrado y define la estructura de directorios escalable
license: MIT
compatibility: opencode
---

## Qué hace esta habilidad

- Mantiene las reglas de validación de stack cerrado:
  - **Frontend**: Next.js, React, TypeScript, TailwindCSS (v4), **Shadcn UI** + **Radix UI** + class-variance-authority + clsx + tailwind-merge + lucide-react, Vitest, ESLint + Prettier.
  - **Backend**: Python, FastAPI, FastAPI-MCP, Pytest, Ruff.
  - **Infra/BD**: Docker, Docker Compose, PostgreSQL (pgvector), MongoDB, Redis.
  - **UI objetivo**: Shadcn UI. HeroUI v3 queda PROHIBIDO en código nuevo (mantener MCP `heroui` solo como referencia de docs legacy).

## Estructura de Directorios Escalable (OBLIGATORIA)

Para garantizar consistencia y escalabilidad en todos los proyectos, la estructura debe ser:

### A. Para Backend (Python/FastAPI)
```
/
├── src/                    # Todo el código fuente de la aplicación backend
│   ├── app/                # Aplicación FastAPI
│   │   ├── __init__.py
│   │   ├── main.py         # Punto de entrada de FastAPI
│   │   ├── routers/        # Rutas y controladores (ej. routers/suma.py)
│   │   ├── core/           # Configuraciones y utilidades globales
│   │   └── schemas/        # Esquemas de validación Pydantic
│   └── requirements.txt    # Dependencias backend
├── tests/                  # Carpeta dedicada exclusivamente para pruebas
│   ├── __init__.py
│   └── test_main.py
├── docker-compose.yml      # Configuración de contenedores
└── Dockerfile              # Dockerfile para la API backend
```

### B. Para Frontend (Next.js/React + Shadcn UI)
```
/
├── src/                        # Todo el código fuente de la aplicación frontend
│   ├── app/                    # Next.js App Router (rutas, layouts, pages)
│   ├── components/
│   │   ├── ui/                 # Componentes Shadcn UI instalados (button.tsx, card.tsx, etc.)
│   │   └── blocks/             # Bloques compuestos pre-construidos (dashboard, landing, etc.)
│   ├── lib/
│   │   └── utils.ts            # Helper cn() = clsx + tailwind-merge (OBLIGATORIO)
│   ├── hooks/                  # Custom React Hooks
│   └── types/                  # Interfaces y tipos TypeScript
├── tests/                      # Carpeta dedicada exclusivamente para pruebas
│   ├── unit/                   # Pruebas unitarias de componentes
│   └── integration/            # Pruebas de integración
├── components.json             # Configuración Shadcn (style, registries, aliases)
├── package.json                # Dependencias frontend (incluye @radix-ui/*, class-variance-authority, clsx, tailwind-merge, lucide-react)
└── tailwind.config.ts          # Configuración de TailwindCSS v4
```

## Convenciones de Shadcn UI y Next.js (OBLIGATORIAS)

1. **Imports**: `import { Button } from "@/components/ui/button"` (NO desde `@heroui/react` ni Radix primitivas directas a menos que la firma coincida).
2. **Eventos**: usar `onClick` (NO `onPress`).
3. **Variantes**: definir con `class-variance-authority` (cva) en cada componente.
4. **Composición de clases**: usar `cn()` desde `@/lib/utils`:
   ```ts
   import { cn } from "@/lib/utils"
   className={cn("base-classes", condition && "extra", className)}
   ```
5. **Iconos**: usar `lucide-react` (`import { Icon } from "lucide-react"`).
6. **Block/Template installation**: usar el MCP `shadcn` para browse/search/install:
   - Dashboards → `mcp__shadcn__get_item` con `@shadcn/dashboard-01`
   - Landings → `@shadcn/landing-hero`, `@shadcn/pricing`, etc.
   - Auth flows → `@shadcn/login-01`, `@shadcn/signup-01`
   - Forms complejos → `@shadcn/settings`, `@shadcn/data-table`
7. **Shadcn v4 (Base UI)**: En Shadcn UI v4.11.0+, la biblioteca primitiva es `@base-ui/react` (no Radix UI). La propiedad `asChild` **no existe**. Para evitar HTML inválido y problemas de SEO/accesibilidad, no anides interactives (`<Button><Link>`). Aplica las clases de estilo del botón directamente sobre el elemento `<Link>` de Next.js.
8. **Compatibilidad Turbopack + CSS**: Turbopack no resuelve directivas `@import` para archivos CSS de `node_modules` (ej. `@import "tw-animate-css"` o `@import "shadcn/tailwind.css"`). En Tailwind CSS v4, define las variables y estilos inline en `globals.css` en lugar de importar desde `node_modules`.
9. **Despliegue y Next Config**: Todo proyecto de Next.js debe estar configurado para Docker standalone en `next.config.ts`:
   ```ts
   const nextConfig = {
     output: 'standalone',
   };
   ```

## Cuándo usarme

Se invoca en las fases F0, F1 y F2 para guiar a `@sdd-orchestrator` y `@sdd-coder` en la arquitectura escalable de archivos antes de materializar código.
