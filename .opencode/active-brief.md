# Active Brief: StatsDashboardRedesign (Iteración 1/2)

## Contrato
`.openspec/specs/2026-06-16__09-40-59_stats-dashboard-redesign/contract.json`

## Resumen
Rediseño completo del dashboard de estadísticas con diseño Linear premium (translúcido, dark-mode-first, brand indigo #5e6ad2).

### Cambios en StatsButton.tsx
- DialogContent: `max-w-[800px]` → `sm:max-w-5xl lg:max-w-6xl max-h-[85vh]`
- Eliminar ScrollArea externo
- Añadir DialogDescription: "Resumen de tu actividad"
- Padding más amplio (p-6 md:p-8)

### Cambios en StatsDashboard.tsx (rediseño completo)
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- **8 Metric Cards** (FileText, AlignLeft, Type, Star, Pin, Calendar, TrendingUp, Sparkles) — icono circular tintado + número grande + label + mini progress bar
- **Color Distribution Chart** (2 cols) — histograma vertical con NOTE_COLORS[color].hex
- **Weekly Activity Chart** (2 cols) — 7 barras verticales, día actual destacado #5e6ad2
- **Top Hashtags Cloud** (2 cols) — pills con tamaño proporcional, empty state
- **Notas Timeline** (1 col) — últimas 5 notas con fecha relativa

### Cambios en stats.ts
- Añadir: `notesLast7Days: { date: string; count: number }[]`
- Añadir: `averageWordsPerNote: number`
- Añadir: `completionRate: number`
- Exportar: `extractHashtags`, helpers de fecha

### Diseño
- **Brand**: Linear.app (dark-mode-first, cards translúcidas)
- **Primary**: #5e6ad2 | **Accent**: #7170ff | **Bg**: #0f1011 | **Surface**: #191a1b
- Cards: `rounded-lg border border-border/50 bg-card p-4 md:p-5 hover:shadow-sm`
- Números: `text-3xl md:text-4xl font-semibold tracking-tight tabular-nums`
- Labels: `text-xs text-muted-foreground font-medium uppercase tracking-wider`
- Chart bars: `rounded-full transition-all duration-500 ease-out`

### Tests creados
- `src/__tests__/StatsDashboard.test.tsx` — TS-01 (8 labels visibles) + TS-03 (hashtags render)
- `src/__tests__/StatsButton.test.tsx` — TS-02 (título + subtítulo del modal)

### Shadcn components usados
- button, card, dialog, badge, scroll-area (ya instalados)

### Lucide icons validados (16)
BarChart3, FileText, AlignLeft, Type, Star, Pin, Calendar, TrendingUp, PieChart, Palette, Activity, Hash, Tag, Clock, Sparkles, BarChartHorizontal
