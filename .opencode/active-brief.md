# Contrato Activo: MarkdownTemplates (Iteración 1/3)

## Features
1. **Modo Markdown en vista previa de notas**
   - Instalar `react-markdown` + `remark-gfm`
   - Crear `MarkdownRenderer` en `src/components/blocks/MarkdownRenderer.tsx` (content, className props)
   - NoteCard: toggle botón (Eye icon) para alternar raw ↔ markdown preview
   - NoteEditor: botón "vista previa" que muestra markdown renderizado

2. **Plantillas de notas al crear**
   - Crear `src/lib/templates.ts` con 4 templates: Reunión 📋, Diario 📔, TODO List ✅, Idea 💡
   - Crear `TemplateSelector` en `src/components/blocks/TemplateSelector.tsx` con grid de 4 cards
   - NoteEditor modificado: mostrar TemplateSelector al crear nueva nota

## Diseño Linear.app
- Primary: #5e6ad2, accent-hover: #828fff
- Cards: bg-white dark:bg-white/[0.02], border border-border/50, rounded-[8px]
- Hover: shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]
- Typography: Inter, tracking-tight para headings

## Tests creados (5 escenarios)
1. `src/__tests__/MarkdownRenderer.test.tsx` - renderizado correcto de headings/bold/lists
2. `src/__tests__/MarkdownRenderer.test.tsx` - XSS safety (no raw HTML)
3. `src/__tests__/TemplateSelector.test.tsx` - 4 templates en grid + blank note
4. `src/__tests__/NoteEditor.test.tsx` - template pre-fills title/content
5. `src/__tests__/NoteCard.test.tsx` (TS-09 añadido) - toggle raw/markdown

## Dependencias nuevas
- `react-markdown` + `remark-gfm` (instalar en package.json)
- Shadcn: `tabs` component

## Iconos validados (lucide-react)
FileCode, Eye, Edit, FileText, ClipboardList, BookOpen, CheckSquare, Lightbulb, Plus, Calendar