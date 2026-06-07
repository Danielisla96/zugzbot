# Catálogo de Design Systems

Listado canónico de design systems disponibles para el skill `sdd-design-system`.
Sincronizado manualmente con `.opencode/design/DESIGN-*.md` (la lista no se regenera por
runtime; el script `tools/sdd_design_catalog_sync.ts` puede regenerarlo).

## Ubicación

Los archivos `DESIGN-<slug>.md` se copian al proyecto del usuario en
`<INSTALL_DIR>/.opencode/design/` durante la instalación (`npx zugzbot`). En modo
desarrollo (este repo), viven en `zugz-plugin/design/`.

## Tabla principal

| # | Slug | Nombre | Path (relativo al proyecto) | Primary | Vibe |
|---|------|--------|------|---------|------|
| 1 | airbnb | Airbnb | `.opencode/design/DESIGN-airbnb.md` | `#ff385c` | Marketplace cálido, pill-shaped, fotos primero |
| 2 | apple | Apple | `.opencode/design/DESIGN-apple.md` | `#0066cc` | Minimal premium, monochrome, system font, edge-to-edge |
| 3 | heroui | HeroUI | `.opencode/design/DESIGN-heroui.md` | `#006fee` | Clean modern, Tailwind CSS-based components, vibrant blue |
| 4 | meta | Meta | `.opencode/design/DESIGN-meta.md` | `#0064e0` | Utility-first, blue brand, hairline borders, dual-CTA |
| 5 | nike | Nike | `.opencode/design/DESIGN-nike.md` | `#111111` | Bold sports, black/white, Futura uppercase, editorial |
| 6 | notion | Notion | `.opencode/design/DESIGN-notion.md` | `#0075de` | Editorial productivity, off-white canvas, Inter, stickers |
| 7 | renault | Renault | `.opencode/design/DESIGN-renault.md` | Sunlight Yellow | Automotive, dark, NouvelR display, diamond mark |
| 8 | theverge | The Verge | `.opencode/design/DESIGN-theverge.md` | `#3cffd0` (jelly mint) | Editorial tech media, dark, oversized Manuka, timeline |
| 9 | uber | Uber | `.opencode/design/DESIGN-uber.md` | `#000000` | Clean utilitarian, black/white, geometric sans, full-pill |
| 10 | voltagent | Voltagent | `.opencode/design/DESIGN-voltagent.md` | `#00d992` | Devtool, near-black canvas, mono accents, code-mock hero |
| 11 | x.ai | xAI | `.opencode/design/DESIGN-x.ai.md` | `#ffffff` | AI brand, near-black canvas, geometric sans, cosmic |

## Reglas de elección

1. **Si el usuario nombra una marca explícitamente** ("como Apple", "estilo
   The Verge") → usar ese slug sin re-preguntar.
2. **Si el usuario no especifica y el dominio es claro**:
   - Marketplace / consumer con búsqueda → `airbnb` o `uber`.
   - Producto premium / hardware / photography-first → `apple` o `meta`.
   - Editorial / publicación / blog / media → `theverge` o `notion`.
   - Developer tool / devtool / IA agent → `voltagent` o `x.ai`.
   - Sports / athletic / bold → `nike`.
   - Automotive → `renault`.
   - Productivity SaaS → `notion`.
3. **Si ninguna pista aplica** → `question` con el catálogo completo.
4. **Default sugerido** → el último `active_design_system` del lockfile
   (amnesia-cero).

## Constraints globales (aplican a TODOS los design systems)

- **Cero valores hardcoded** en código: todo debe venir del YAML/token file
  del design system elegido.
- **Componentes reusables** (button-primary, card, input, etc.) se mapean
  siempre al `components.*` del design system elegido.
- Si un componente del catálogo no cubre el caso → `design_gap` en
  `diagnostics.md` y consulta al usuario antes de improvisar.
