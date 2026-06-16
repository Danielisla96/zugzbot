# Note Colors & Categories — Active Contract

## Ubicación
`.openspec/specs/2026-06-16__09-06-22_note-colors-categories/contract.json`

## Cambios
- **Type**: Añadir `NoteColor = "indigo" | "orange" | "green" | "red" | "purple" | "gray" | "none"` y campo `color?: NoteColor` en `Note`
- **NUEVO**: `ColorPicker` (7 círculos de color estilo Linear.app, seleccionado con indigo ring)
- **NUEVO**: `src/lib/colors.ts` (mapa NOTE_COLORS con label, dot, lightBg, hex)
- **MOD**: `NoteEditor` — añadir ColorPicker, color state, onSave incluye color
- **MOD**: `NoteCard` — border-left tint, badge, lightBg según note.color
- **MOD**: `NotesList` — filtro por color tipo pills horizontal

## Diseño
- **Marca**: Linear.app (indigo #5e6ad2, dark-mode-first, cards translúcidas)
- **Tokens**: primary #5e6ad2, surface rgbefectos translúcidos, filter-pill estilo Linear

## Stack
Next.js 16 + Shadcn UI + Tailwind v4 + localStorage

## Tests (6 escenarios)
1. `ColorPicker.test.tsx` — CLR-01 (renderiza 7 colores), CLR-02 (onChange al clickear)
2. `NoteEditor.test.tsx` — CLR-03 (guarda con color), CLR-06 (inicializa desde nota existente)
3. `NoteCard.test.tsx` — CLR-04 (indicador visual purple), CLR-04b (none no muestra)
4. `NotesList.test.tsx` — CLR-05 (filtra por color), CLR-05b (Todas muestra todo)

## Hints
- shadcn componentes ya instalados: button, input, card, textarea, dialog, badge, scroll-area
- Iconos validados: Circle, Slash, Filter, X
- Bootstrap: nextjs-shadcn
