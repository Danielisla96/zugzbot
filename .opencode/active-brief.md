# Dashboard Animations — Spec Activo

**Contrato**: `.openspec/specs/2026-06-16__09-50-28_dashboard-animations/contract.json`

## Resumen
Añadir animaciones de entrada, tooltips interactivos, donut chart alternativo, hover en timeline, smooth transitions y carga progresiva al StatsDashboard existente.

## Stack
- Next.js 16 + Shadcn UI + Tailwind v4 + localStorage + Vitest
- Diseño: Linear.app (#5e6ad2 indigo, dark-mode-first)

## Componentes involucrados
- **StatsDashboard** (`@/components/blocks/StatsDashboard.tsx`) — Modificar: añadir animaciones, tooltips, toggle, carga progresiva
- **DonutChart** (NUEVO: `@/components/blocks/DonutChart.tsx`) — Mini donut con conic-gradient
- **MetricCard** (inline en StatsDashboard) — fadeSlideUp + smooth transitions
- **ColorChart/WeeklyChart** (inline en StatsDashboard) — Tooltips en hover + toggle Donut/Bar
- **HashtagsCloud** (inline en StatsDashboard) — Progressive loading (600-900ms)
- **Timeline** (inline en StatsDashboard) — Hover interactivo + mini preview

## Shadcn components necesarios
- `tooltip` (instalar con: `npx shadcn@latest add tooltip`)

## Lucide icons usados
- `PieChart`, `BarChart3`, `MousePointer2`, `BarChartHorizontal`

## Animaciones
- `@keyframes fadeSlideUp`: opacity 0→1, translateY(12px)→0
- Metric cards: 0-300ms (index * 50ms delay)
- Charts: 300-600ms
- Hashtags + Timeline: 600-900ms
- Smooth transitions: `transition-all duration-200 ease-out`
- Hover: `hover:shadow-md hover:-translate-y-[1px]`

## Tests (4 escenarios)
1. TS-ANIM-01 → StatsDashboard metric cards tienen animación
2. TS-ANIM-02 → DonutChart renderiza conic-gradient correcto
3. TS-ANIM-03 → Toggle button cambia vista
4. TS-ANIM-04 → Tooltip en WeeklyChart aparece en hover