---
omd: 0.1
brand: ZugzCalc
bootstrapped_from: mercury
bootstrapped_at: 2026-06-14
---

# Design System of ZugzCalc

## 1. Visual Theme & Atmosphere

ZugzCalc is a modern calculator built for everyone — students, professionals, and casual users who expect their tools to look as good as they work. The interface carries the quiet confidence of software made by people who care about craft. Every pixel is intentional: generous whitespace, a restrained indigo accent, and typography that makes numbers feel solid and trustworthy.

Key Characteristics:
- Indigo `#5266eb` as the sole primary action color
- Proprietary Arcadia / Arcadia Display type
- Dark canvas (`#171721`) inverting to light canvas (`#fbfcfd`)
- Soft off-white ink (`#ededf3`)
- Tight 4px base radius, 12px cards
- Periwinkle→mist gradient washes (`#9cb4e8` → `#cdddff`)

## 2. Color Palette & Roles

### Primary
- Indigo (`#5266eb`): Primary brand and action color. CTA fills ("Calcular", "Sumar"), links, active states, focus rings.
- Indigo Hover (`#4354c8`), Indigo Active (`#3442a6`)
- Periwinkle (`#9cb4e8`), Mist (`#cdddff`)

### Surface
- Canvas (`#171721`), Canvas Elevated (`#1e1e2a`), Canvas Light (`#fbfcfd`)
- Surface Default (`#ededf3`), Surface Secondary (`#f4f5f9`), Surface Hover (`#dddde5`)

### Text
- Ink Default (`#ededf3`), Ink Emphasized (`#1e1e2a`), Ink Subdued (`#c3c3cc`)
- Ink Disabled (`#70707d`), On Primary (`#ffffff`)

### Semantic
- Error (`#d03275`), Success: contextual green

### Borders
- Hairline (`#272735`), Hairline Subdued (`#c3c3cc`)

## 3. Typography Rules

### Font Stack
| Role | Font | Weight | Size | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Display L | Arcadia Display | 480 | 32px | 40px | -0.02em |
| Display M | Arcadia Display | 480 | 24px | 32px | -0.01em |
| Headline | Arcadia | 420 | 20px | 28px | 0 |
| Subheader | Arcadia | 420 | 17px | 24px | 0 |
| Body | Arcadia | 400 | 15px | 22px | 0 |
| Caption | Arcadia | 360 | 12px | 16px | 0.01em |
| Mono | Arcadia Mono | 400 | 15px | 22px | 0 |

### Principles
- 480 weight is the brand voice — use for results, totals, display numbers
- Display faces get tighter letter-spacing; body faces get none
- Generous line-height for readability
- Tabular figures in Arcadia Mono for result columns

## 4. Component Stylings

### Buttons
- Primary: `#5266eb` bg, white text, 4px radius, 15px/480 — Use: "Calcular", "Sumar"
- Secondary: `#ededf3` bg, near-black text — Use: "Limpiar", "Reset"
- Ghost: transparent, indigo text — Use: "Ver historial", "Más info"

### Inputs
- Light: `#fbfcfd` bg, 1px `#c3c3cc` border, 4px radius
- Focus: indigo ring, no offset
- Error: `#d03275` border
- Placeholder: `#70707d`

### Cards
- 12px radius, 24px padding, 1px borders
- Elevated cards get subtle shadow
- Use: Result display card, calculation panel, history panel

### Table
- Use for calculation history: time column, operation column, result column
- Caption 12px for metadata (timestamps), body 15px for numbers
- Zebra rows with `#f4f5f9` (light) / staggered opacity (dark)
- Column headers: subheader weight, subdued ink

### Badges
- Small 4px radius pills
- Indigo bg for "active" / "computed"
- Subtle bg for neutral states

### Toggle (Dark/Light Mode)
- Dark mode toggle: Indigo when on, `#c3c3cc` when off
- Label optional; icon preferred (sun/moon)

### Dialog
- Canvas Elevated bg, 12px radius
- 24px padding; title + description + action row
- Used for: "Limpiar historial" confirmation, error details

## 5. Layout & Spacing

### Grid
- 12-column grid, 20px gutter
- Max content width: 480px for the calculator surface; full width for history

### Spacing Scale
| Token | px |
|---|---|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-5 | 20px |
| space-6 | 24px |
| space-8 | 32px |
| space-10 | 40px |
| space-12 | 48px |

### Calculator Layout
- Result display: full-width card at top
- Operation input: two inputs + operator + "Sumar" button
- History table: scrollable below the fold
- Fixed footer with theme toggle and "Limpiar historial"

## 6. Depth & Elevation

| Elevation | Use | Shadow |
|---|---|---|
| 0 | Canvas, flat cards | none |
| 1 | Elevated cards, input focus | `0 1px 3px rgba(0,0,0,0.08)` |
| 2 | Dialog, dropdowns | `0 4px 12px rgba(0,0,0,0.12)` |
| 3 | Modal backdrop | `0 8px 24px rgba(0,0,0,0.16)` |

## 7. Do's & Don'ts

| Do | Don't |
|---|---|
| Use indigo only for actionable elements | Use indigo for decorative borders or dividers |
| Keep calculator surface minimal | Add charts, graphs, or illustrations to the calc area |
| Show results immediately after clicking "Calcular" | Require users to navigate away to see results |
| Use Arcadia Mono for all numeric columns | Mix monospace and proportional numbers in the same column |
| Wrap long operation strings in the table | Truncate without tooltip |
| Persist history across sessions | Clear history on page refresh without confirmation |

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout behavior |
|---|---|---|
| Mobile | < 640px | Single column, stacked inputs, full-width history |
| Tablet | 640–1024px | Calculator centered, history in a scrollable panel |
| Desktop | > 1024px | Side-by-side calc + history at 480px calc width |

## 9. Agent Prompt

> You are the ZugzCalc design agent. You follow the ZugzCalc Design System spec (.opencode/DESIGN.md). All UI must use the indigo (`#5266eb`) primary palette, Arcadia typography, and the component library described above. Never introduce a second accent color. Never use pure white (`#ffffff`) as a background — use `#fbfcfd` in light mode. Keep the interface sparse: every element must earn its place. For any calculation operation, prefer direct feedback: show the result inline, immediately.

## 10. Voice & Tone

ZugzCalc writes like a well-crafted tool that respects your time. The voice is precise, calm, and helpful. No exclamation marks, no emoji on the calculator surface, no hype.

| Context | Tone |
|---|---|
| CTAs | Direct imperative — "Sumar", "Calcular", "Limpiar" |
| Headlines | Declarative — "Resultado", "Historial de cálculos" |
| Body | Specific and functional |
| Success | Calm and factual — "Resultado: 42" |
| Errors | Blameless, specific — "Ingresa ambos números" |
| Empty state | One line explaining what the table shows — "Aún no hay cálculos. Usa el panel de arriba para sumar dos números." |
| Confirmation | Low-key — "¿Limpiar todo el historial?" |

## 11. Brand Narrative

ZugzCalc is a modern calculator application created in 2026 by wavesbyte. It exists because even the simplest tools deserve great design. Most calculators are either utilitarian to the point of coldness or over-engineered with features nobody asked for. ZugzCalc walks the line: it does one thing — add two numbers and keep a record — and does it beautifully. The tagline says it all: **"Tus cálculos, siempre contigo."**

**Thesis**: Make calculations feel calm, precise, and well-made — like using a premium tool that was built just for you. Every interaction should confirm that someone cared about the details.

## 12. Principles

1. **One action per surface** — The calculator panel does one thing: add two numbers. History reviews past results. Never combine modes.
2. **Indigo is action, never decoration** — The primary color only appears on clickable, interactive elements. Results and display text remain ink-colored.
3. **Off-white over pure white** — `#fbfcfd` in light mode is a deliberate choice. Pure white feels sterile; off-white feels like paper.
4. **Restraint is the brand** — ZugzCalc earns trust by not doing too much. No animations that serve no purpose, no decorative illustrations, no branding in the main calc view.
5. **Theatrical marketing, serene product** — The landing page or promotional materials can be bold and expressive. The calculator itself stays quiet and focused.
6. **Numbers are typography** — All numerical output uses Arcadia Mono with tabular figures. Columns align. Results feel solid.
7. **Respect the user** — History persists. Nothing is deleted without confirmation. Keyboard input is supported. The tool adapts to dark/light preference without asking.
8. **Whitespace is a premium signal** — Generous padding around the calculator surface signals quality. Cramped layouts feel cheap.

## 13. Personas

### Casual User — "Lucía"
- **Age**: 28
- **Context**: Needs to split bills, calculate tips, or do quick mental-math checks
- **Needs**: Fast, obvious interface; dark mode for late-night use; sees result instantly
- **Frustrations**: Bloated apps with ads; having to navigate menus for a simple sum

### Student — "Mateo"
- **Age**: 19
- **Context**: High school / university student doing homework; needs to keep a record of intermediate calculations
- **Needs**: History that persists; clear time-stamped rows so he can copy results to his notebook
- **Frustrations**: Losing results after closing the tab; confusing scientific notation

### Professional — "Carmen"
- **Age**: 42
- **Context**: Small business owner / accountant doing quick data entry
- **Needs**: Keyboard-friendly workflow; ability to clear history in bulk; trust that the numbers are correct
- **Frustrations**: Tools that round or truncate without warning; lack of keyboard shortcuts

## 14. States

### Button States
| State | Primary | Secondary | Ghost |
|---|---|---|---|
| Default | `#5266eb` | `#ededf3` | transparent |
| Hover | `#4354c8` | `#dddde5` | `rgba(82,102,235,0.08)` |
| Active | `#3442a6` | `#c3c3cc` | `rgba(82,102,235,0.12)` |
| Disabled | `#70707d` | `#c3c3cc` | `#c3c3cc` |

### Input States
| State | Border | Background |
|---|---|---|
| Default | `#c3c3cc` | `#fbfcfd` |
| Hover | `#9cb4e8` | `#fbfcfd` |
| Focus | `#5266eb` + 2px ring | `#fbfcfd` |
| Error | `#d03275` | `#fbfcfd` |
| Disabled | `#c3c3cc` | `#f4f5f9` |

### Table States
- Row hover: `#f4f5f9` (light) / `rgba(255,255,255,0.03)` (dark)
- Selected row: indigo tint at 8% opacity
- Empty state: centered caption, subdued ink

### Theme Toggle States
- Light mode: sun icon, toggle off (`#c3c3cc`)
- Dark mode: moon icon, toggle on (`#5266eb`)
- Transition: 200ms ease background swap

## 15. Motion

### Duration Tokens
| Token | ms | Use |
|---|---|---|
| fast | 150 | Micro-interactions, hover states |
| normal | 200 | Toggle switch, theme transition |
| slow | 300 | Dialog open/close, card elevation change |

### Easing
- Default: `cubic-bezier(0.2, 0, 0, 1)` — custom ease-out
- Enter: `cubic-bezier(0, 0, 0.2, 1)` — anticipation
- Exit: `cubic-bezier(0.4, 0, 1, 1)` — rapid fade

### Specific Animations
- **Result appear**: fast fade-in + 4px upward shift at 150ms
- **Theme toggle**: 200ms cross-fade on canvas and surface colors
- **Row entry in history table**: slide-in from right at 200ms, staggered by index
- **Dialog**: slow scale + fade at 300ms, backdrop fade at 200ms
- **Button press**: 50ms scale to 0.97, snap back at 100ms
