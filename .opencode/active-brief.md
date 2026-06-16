# Brief: ImproveNoteCards (Iteración 1/3)

## Path del contrato
`.openspec/specs/2026-06-16__00-10-04_improve-task-cards/contract.json`

## Bootstrap
Ya inicializado (Next.js 16 + Shadcn UI + Tailwind v4). No ejecutar bootstrap.

## Shadcn components a usar
card (ya instalado), button (ya instalado), badge (ya instalado)

## Lucide icons
Star, Trash2, Clock, FileText, Hash, Tag, MessageSquare

## Componentes a modificar

### 1. NoteCard (`@/components/blocks/NoteCard`)
Rediseño completo manteniendo interface exacta:
- **Header**: Título con tracking-tight + Star favorito SIEMPRE visible (sin group-hover). Título vacío → "Sin título" italic muted.
- **Content preview**: line-clamp-3 text-sm, detectar #hashtags con regex y renderizar como badges/pills con icono Tag
- **Metadata bar**: Clock + fecha relativa ("hace 5 min"), FileText + word count, Hash + char count
- **Hover**: shadow elevado + translateY(-2px), transiciones 200ms ease
- **Contenido vacío**: "Sin contenido" text-xs muted italic

### 2. NotesList (`@/components/blocks/NotesList`)
- gap-4 → gap-5 en grid

### 3. Utilidades nuevas en `@/lib/`:
- `formatRelativeDate(isoDate: string): string` — fecha relativa en español (Intl.RelativeTimeFormat)
- `extractHashtags(content: string): string[]` — extrae #hashtags
- `countWords(text: string): number` — cuenta palabras

## Diseño visual
Linear.app (indigo primary #5e6ad2, cards con border rgba(0,0,0,0.08)/rgba(255,255,255,0.08), radius 8px, pills 9999px)

## Tests
Ya creados en `src/__tests__/NoteCard.test.tsx` (TS-01 a TS-06). Debes crear tests para las 3 utilidades en `src/lib/`.

## PRIMERA ACCIÓN
1. No ejecutes bootstrap (ya está)
2. Lee el contrato completo para detalles
3. Implementa NoteCard.tsx primero, luego utilidades, luego NotesList.tsx
4. Crea tests para utilidades
5. Asegúrate de que todos los tests pasen
