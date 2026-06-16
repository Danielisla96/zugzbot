# StatsDashboard - Brief del Coder

## Path del contrato
`.openspec/specs/2026-06-16__09-21-03_stats-dashboard/contract.json`

## Bootstrap
- Template: nextjs-shadcn (ya bootstrapped)
- Shadcn components a instalar: `progress` (el resto ya están: button, card, dialog, badge, scroll-area)
- Lucide icons (10): BarChart3, FileText, AlignLeft, Type, Star, Pin, PieChart, Hash, Calendar, TrendingUp

## Componentes a crear
1. **src/lib/stats.ts** — `computeStats(notes): NoteStats` con totalNotes, totalWords (importar countWords de src/lib/countWords.ts), totalChars, favoritedCount, pinnedCount, colorDistribution (Record<NoteColor, number>), topHashtags (top 5 extraídos del content), createdToday, createdThisWeek. Helpers inline isToday/isThisWeek (NO hay date-fns).
2. **src/components/blocks/StatsDashboard.tsx** — Grid de cards métricas estilo Linear (translúcido rgba(255,255,255,0.02), borde rgba(255,255,255,0.08), números 32px weight 510, etiquetas 13px muted #8a8f98). Layout: 2 cols móvil, 3-4 desktop. Incluye Progress bar para distribución de colores.
3. **src/components/ui/StatsButton.tsx** — Botón con BarChart3 que abre Dialog de shadcn con StatsDashboard.

## Modificaciones existentes
- **AppLayout** — Añadir prop `notes: Note[]`, insertar `<StatsButton notes={notes} />` en header (entre NoteStats y ThemeToggle). Pasar notes desde HomePage.

## Diseño
- Linear.app: indigo primary #5e6ad2, fondo canvas #0f1011, surface #191a1b, cards rgba(255,255,255,0.02)
- Modal/dialog estilo command palette: fondo #191a1b, radius 12px, overlay rgba(0,0,0,0.85)

## Tests
- Crear tests: src/lib/stats.test.ts, src/__tests__/StatsDashboard.test.tsx, src/__tests__/StatsButton.test.tsx
- Primero tests, luego implementación para que pasen
- Nota: Note type NO tiene campo hashtags — extraer de content via regex

## PRIMERA ACCIÓN
`sdd_bootstrap_status` → luego instalar progress shadcn component → luego crear archivos en orden: stats.ts → StatsDashboard.tsx → StatsButton.tsx → modificar AppLayout