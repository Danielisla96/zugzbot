## Contrato Activo: note-card-pinned-colors

**Path del contrato**: `.openspec/specs/2026-06-16__00-21-55_note-card-pinned-colors/contract.json`

### Stack
- Next.js 16 + Shadcn UI + Tailwind v4 + lucide-react + Vitest
- **NO ejecutar bootstrap** — proyecto ya inicializado

### Diseño visual
- Linear.app (tokens ya aplicados en globals.css)
- Primary: #5e6ad2 para accent bar y pin activo

### Cambios a implementar

1. **src/types/index.ts**: Añadir `pinned?: boolean` al `interface Note`
2. **src/app/page.tsx** (HomePage):
   - Añadir `handleTogglePin(id: string)` que invierte `note.pinned`, actualiza `updatedAt`, persiste a localStorage
   - Al crear nueva nota (handleSave), incluir `pinned: false`
   - Pasar `onTogglePin` a `NotesList`
3. **src/components/blocks/NoteCard.tsx**:
   - Nuevo prop: `onTogglePin: (id: string) => void`
   - Añadir botón Pin (lucide `Pin`) junto a Star y Trash
   - Cuando `note.pinned`: icono Pin con `fill="#5e6ad2"` + `text-[#5e6ad2]` + `rotate-[-45deg]`
   - Cuando `note.pinned`: Card con `border-l-[3px] border-l-[#5e6ad2]` como barra de acento
   - Cuando `note.pinned`: `data-pinned="true"` para tests
   - Stagger: aceptar style prop con transitionDelay
4. **src/components/blocks/NotesList.tsx**:
   - Nuevo prop: `onTogglePin: (id: string) => void`
   - Pasar `onTogglePin` a cada NoteCard
   - Lógica de sorted: notas pinned (note.pinned === true) SIEMPRE primero, luego sortBy activo
   - Añadir stagger: `transitionDelay: \`${index * 50}ms\`` a cada NoteCard

### Shadcn components
- Ya instalados: card, button, input, textarea, dialog, badge, scroll-area
- NO reinstalar

### Lucide icons
- `Pin` (validado) — para botón pin/despin
- `CheckCircle2` (validado) — para toasts si es necesario

### Tests a hacer pasar
- 5 test scenarios (TS-01 a TS-05) en contract.json
- Archivos de test ya creados por spec-writer: `src/__tests__/NoteCard.test.tsx`, `src/__tests__/NotesList.test.tsx`, `src/__tests__/HomePage.test.tsx`
