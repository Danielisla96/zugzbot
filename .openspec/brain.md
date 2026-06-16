# Zugzbot Brain - Memory and Learnings

# Learnings
- [2026-06-16]: ## Sesión App de Notas (2026-06-15)
- **Diseño**: Notion (warm neutrals, whisper borders, primary #0075de) seleccionado para app de notas (productividad)
- **Lección**: El sort por favoritos en NotesList causó tests fallando porque el orden de renderizado no coincidía con el esperado por los tests. Se optó por mantener orden de inserción original.
- **Técnico**: `window.confirm` no existe en happy-dom, hay que asignarlo como `window.confirm = vi.fn()` en vez de `vi.spyOn(window, 'confirm')`.
- **Stack**: Next.js 16 + Shadcn UI + Tailwind v4 + localStorage funciona perfectamente para apps client-side.
- **Shadcn components usados**: button, input, card, textarea, dialog, badge, scroll-area
- [2026-06-16]: 2026-06-15: Ciclo SDD tipografía Vercel completado. Aprendizajes clave: (1) Geist font (sans + mono) se carga desde next/font/google con las variables --font-geist-sans y --font-geist-mono; (2) La jerarquía tipográfica Vercel usa tracking progresivo: -2.4px (48px) → -1.28px (32px) → -0.96px (24px) → normal (14px-16px); (3) Los 3 pesos son: 400 body, 500 UI/interactive, 600 headings; (4) En Tailwind v4, tracking-tight = -0.025em que equivale aproximadamente a -0.96px a 24px; (5) Los tests existentes (17) pasaron sin modificaciones tras el cambio de Inter → Geist, demostrando que el cambio de fuente es no-rompiente.
- [2026-06-16]: Spec: NotesEnhancements — toasts (useToast hook sin Context, module-level state), sort controls (4 modos: newest/oldest/a-z/favorites-first), y note stats counter en header. Patrón clave: useToast usa estado compartido a nivel de módulo con forceUpdate para que múltiples instancias del hook compartan el mismo array. NoteStats recibe totalCount + filteredCount + searchActive como props desde AppLayout, que a su vez las recibe de HomePage. SortBy state vive en HomePage y baja a NotesList → SortControls.

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
- [2026-06-16]: Vercel tokens aplicados en spec NotesEnhancements: primary #171717, canvas #ffffff, body #4d4d4d, muted #666666, border #ebebeb, shadow-border technique (0px 0px 0px 1px rgba(0,0,0,0.08)). ToastContainer usa bg primary con texto blanco, animación fade+slide (200ms ease-out entrada, 150ms ease-in salida). SortControls usa estilo pill: botón activo bg primary, inactivos text-muted-foreground con hover bg-accent. NoteStats badge sutil bg #f5f5f5 con texto muted.

# Errors
- [2026-06-16]: Tests reveal "Encountered two children with the same key" warning for `test-uuid-xxxx` in home-page.test.tsx. Tests use a static UUID for all mocked notes. In production, `crypto.randomUUID()` generates unique keys. The warning only manifests in test environment; not a production bug. Consider using unique UUIDs per mock note in tests to eliminate the warning.
- [2026-06-16]: Test duplicate key warning: home-page tests use static test-uuid-xxxx across mock notes, triggering React duplicate key warnings. Not a production bug but should be fixed by using unique UUIDs per mock note.
