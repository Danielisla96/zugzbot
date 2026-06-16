# Zugzbot Brain - Memory and Learnings

# Learnings
- [2026-06-16]: ## Sesión App de Notas (2026-06-15)
- **Diseño**: Notion (warm neutrals, whisper borders, primary #0075de) seleccionado para app de notas (productividad)
- **Lección**: El sort por favoritos en NotesList causó tests fallando porque el orden de renderizado no coincidía con el esperado por los tests. Se optó por mantener orden de inserción original.
- **Técnico**: `window.confirm` no existe en happy-dom, hay que asignarlo como `window.confirm = vi.fn()` en vez de `vi.spyOn(window, 'confirm')`.
- **Stack**: Next.js 16 + Shadcn UI + Tailwind v4 + localStorage funciona perfectamente para apps client-side.
- **Shadcn components usados**: button, input, card, textarea, dialog, badge, scroll-area

# Design
- [2026-06-16]: ## Notion Design System aplicado en App de Notas
- Paleta cálida de neutros con #f6f5f4 (warm white) y #31302e (warm dark)
- Whisper borders: 1px solid rgba(0,0,0,0.1)
- Primary CTA: #0075de (Notion Blue)
- Radius: 4px botones/inputs, 12px cards, 9999px badges
- Dark mode: invertir paleta con warm-dark como fondo y warm-white como texto
- Typography: Inter font con 4 pesos (400/500/600/700), tracking negativo en títulos
