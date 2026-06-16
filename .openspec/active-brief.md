# Active Brief: CardFilterAnimations

## Contrato
`.openspec/specs/2026-06-16__11-02-42_card-filter-animations/contract.json`

## Stack
Next.js 16 + Shadcn UI + Tailwind v4 + localStorage

## Diseño
Linear.app (#5e6ad2 primary) — mantener existente

## Cambios a implementar

### 1. globals.css (`src/app/globals.css`)
Añadir DESPUÉS del keyframe `fadeSlideUp` existente:
```css
@layer utilities {
  .animate-fade-slide-up {
    animation: fadeSlideUp 0.4s ease-out both;
  }
  .animate-fade-slide-up-fast {
    animation: fadeSlideUp 0.3s ease-out both;
  }
}
```

### 2. NotesList (`src/components/blocks/NotesList.tsx`)
- **Cards grid**: Cada `<NoteCard>` recibe:
  - `className="animate-fade-slide-up"` 
  - `style={{ animationDelay: \`$\{index * 60}ms\` }}`
- **"Todas" button**: Añadir `animate-fade-slide-up-fast` + `hover:scale-105` con `transition-all duration-200 ease-out`
- **Color pills** (cada `<button>` en el map): Añadir:
  - `animate-fade-slide-up-fast`
  - `animationDelay: \`$\{index * 40}ms\`` (basado en índice del array)
  - `hover:scale-105`
  - `transition-all duration-200 ease-out` (reemplazar solo `transition-colors`)
- **SortControls wrapper**: Ya se maneja desde el propio SortControls

### 3. SortControls (`src/components/blocks/SortControls.tsx`)
- **Wrapper div**: Añadir `animate-fade-slide-up-fast`
- **Cada botón**: Añadir `hover:scale-105` + `transition-all duration-200 ease-out`
- Mantener `transition-colors duration-150` existente
- Los botones mantienen su className condicional actual

### 4. NoteCard (`src/components/blocks/NoteCard.tsx`)
- SIN CAMBIOS. Solo recibe `style` prop con `animationDelay` desde NotesList

## Reglas clave
- NO modificar la duración del keyframe `fadeSlideUp` existente
- NO cambiar la funcionalidad actual (búsqueda, filtros, sort, pin, favoritos)
- Los 45 tests existentes deben seguir pasando
- Mantener diseño Linear existente
- Bootstrap Status: OK (ya bootstrapped)
