# Zugzbot Brain - Memory and Learnings

# Learnings
- [2026-06-16]: ## Sesión App de Notas (2026-06-15)
- **Diseño**: Notion (warm neutrals, whisper borders, primary #0075de) seleccionado para app de notas (productividad)
- **Lección**: El sort por favoritos en NotesList causó tests fallando porque el orden de renderizado no coincidía con el esperado por los tests. Se optó por mantener orden de inserción original.
- **Técnico**: `window.confirm` no existe en happy-dom, hay que asignarlo como `window.confirm = vi.fn()` en vez de `vi.spyOn(window, 'confirm')`.
- **Stack**: Next.js 16 + Shadcn UI + Tailwind v4 + localStorage funciona perfectamente para apps client-side.
- **Shadcn components usados**: button, input, card, textarea, dialog, badge, scroll-area
- [2026-06-16]: 2026-06-15: Ciclo SDD tipografía Vercel completado. Aprendizajes clave: (1) Geist font (sans + mono) se carga desde next/font/google con las variables --font-geist-sans y --font-geist-mono; (2) La jerarquía tipográfica Vercel usa tracking progresivo: -2.4px (48px) → -1.28px (32px) → -0.96px (24px) → normal (14px-16px); (3) Los 3 pesos son: 400 body, 500 UI/interactive, 600 headings; (4) En Tailwind v4, tracking-tight = -0.025em que equivale aproximadamente a -0.96px a 24px; (5) Los tests existentes (17) pasaron sin modificaciones tras el cambio de Inter → Geist, demostrando que el cambio de fuente es no-rompiente.

# Design
- [2026-06-16]: ## Notion Design System aplicado en App de Notas
- Paleta cálida de neutros con #f6f5f4 (warm white) y #31302e (warm dark)
- Whisper borders: 1px solid rgba(0,0,0,0.1)
- Primary CTA: #0075de (Notion Blue)
- Radius: 4px botones/inputs, 12px cards, 9999px badges
- Dark mode: invertir paleta con warm-dark como fondo y warm-white como texto
- Typography: Inter font con 4 pesos (400/500/600/700), tracking negativo en títulos
- [2026-06-16]: Typography improvement: Replace Inter with Geist Sans/Mono (next/font/google) para jerarquía tipográfica Vercel. Variables CSS: --font-geist-sans y --font-geist-mono en @theme inline. Tracking negativo progresivo: -0.96px en card-title (24px), normal en body. Tres pesos: 400 (body), 500 (UI/interactive), 600 (headings). Layout.tsx debe importar Geist y Geist_Mono de next/font/google, NO Inter.
- [2026-06-16]: 2026-06-15: Aplicado diseño Vercel al proyecto zugzbot-v2. Tokens injectados: primary #171717, canvas #ffffff, body #4d4d4d, muted #666666, border #ebebeb. Tipografía: Geist Sans + Geist Mono. Shadow-as-border técnica: box-shadow 0_0_0_1px_rgba(0,0,0,0.08) en cards. Radius: sm=4, md=6, lg=12, full=9999px.
