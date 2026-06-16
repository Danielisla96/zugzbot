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
- [2026-06-16]: F4_DEPLOYMENT (2026-06-15): Zugzbot-v2 desplegado exitosamente en Docker con Next.js 16.2.9 standalone mode. Dockerfile multi-stage (node:20-alpine) con `npm ci --frozen-lockfile`. Healthcheck con `node -e http.get` pasó en <10s. Container name: zugzbot-v2-web-1, puerto 3000.
- [2026-06-16]: 2026-06-16: Iteración 1/2 notes-enhancements completada. Añadidas 3 funcionalidades: (1) Toast notifications con singleton useToast hook (CheckCircle2/Info/XCircle icons, auto-dismiss 3s, animación fade+slide); (2) SortControls con 4 modos (newest/oldest/a-z/favorites-first) usando botones pill con iconos; (3) NoteStats badge contador con pluralización y conteo filtrado. Todos los tests (37) pasaron y Docker build/run exitoso.
- [2026-06-16]: Lint fix: 7 warnings corregidos en undo-delete spec — (1) `deletedNotes` → `_deletedNotes` en page.tsx; (2) `SortBy` removido de import innecesario en notes-list-sort.test.tsx; (3) `vi` removido de import en use-toast.test.ts; (4) `UseToastReturn` interface removida (no referenciada); (5) imports no usados (`render`, `screen`, `userEvent`) removidos de use-toast.test.tsx.
- [2026-06-16]: Lint fix: 7 warnings corregidos en undo-delete spec - page.tsx deletedNotes prefixed, SortBy import removed, vi import removed, UseToastReturn interface removed, unused render/screen/userEvent imports removed from test files.
- [2026-06-16]: 2026-06-16: Iteración 2/2 undo-delete-toast completada. Implementado buffer temporal de notas eliminadas (deletedNotes state) con toast "Deshacer" de 5 segundos. Patrón clave: setTimeout para purga automática con useRef<Map<string, setTimeout>> para cleanup. Toast action extendido con interface {label, onClick}. Total tests: 45, todos verdes.
- [2026-06-16]: 2026-06-16: Sesión SDD completa con 2 iteraciones en autopiloto. Iteración 1 (notes-enhancements): toast notifications (singleton useToast con module-level state), sort controls (4 modos), note stats counter. Iteración 2 (undo-delete-toast): buffer temporal de notas eliminadas con deshacer en toast (5s auto-purga). Total specs: 2. Total tests: 45. Ambos specs desplegados en Docker exitosamente.
- [2026-06-16]: Iteración 1/3 (improve-task-cards): NoteCard rediseñado con metadata bar (fecha relativa, word/char count, hashtags), Linear design (indigo primary #5e6ad2, cards translúcidas), favorito siempre visible, hover elevado. 66 tests pasan, Docker healthy.
- [2026-06-16]: Iteracion 1/3 improve-task-cards completada: NoteCard redisenado con metadata bar (fecha relativa, word/char count, hashtags), Linear design, favorito siempre visible, hover elevado. 66 tests pasan, Docker healthy.
- [2026-06-16]: Nota: Iteracion 1 improve-task-cards completa. NoteCard mejorado con metadata bar, hashtags, Linear design. 66 tests.

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
- [2026-06-16]: 2026-06-16: ToastContainer usa bg #171717 light / #2a2a2a dark con shadow-card Vercel. SortControls: botón activo bg #171717 text-white (dark: invertido). NoteStats: bg #f5f5f5 text #666666. Consistente con diseño Vercel existente.

# Errors
- [2026-06-16]: Tests reveal "Encountered two children with the same key" warning for `test-uuid-xxxx` in home-page.test.tsx. Tests use a static UUID for all mocked notes. In production, `crypto.randomUUID()` generates unique keys. The warning only manifests in test environment; not a production bug. Consider using unique UUIDs per mock note in tests to eliminate the warning.
- [2026-06-16]: Test duplicate key warning: home-page tests use static test-uuid-xxxx across mock notes, triggering React duplicate key warnings. Not a production bug but should be fixed by using unique UUIDs per mock note.

# Deployment
- [2026-06-16]: F4 Deployment (Iteración 2/2 Undo Delete): Docker build exitoso con Next.js 16.2.9 en node:20-alpine multi-stage. Contenedor healthy en puerto 3000. Healthcheck con node nativo funciona correctamente. Comando clave: `docker compose up -d --build --force-recreate` para despliegue limpio.
