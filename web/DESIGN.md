# Design System: Technical Atlas

## 1. Visual Direction

The marketplace is a technical atlas for reusable agent workflows. It should feel precise, spatial, and quietly cinematic: a map of operational knowledge rather than a conventional documentation site or marketing grid.

- Default character: deep navy field, fine coordinate grid, signal nodes, and open record rows.
- Creativity: 7/10. Distinctive enough to be recognizable, restrained enough for repeated technical use.
- Density: 5/10. The first viewport stays focused; the catalog becomes denser as users browse.
- Avoid the previous workshop ledger language entirely: no beige paper, verdigris, register surfaces, oversized black-on-cream typography, or archival stationery motifs.

## 2. Color System

### Dark signal

- Atlas Ink: `#07101E` — page canvas.
- Station Surface: `#0D1B2E` — install panel, modal, and elevated controls.
- Deep Station: `#102238` — secondary surfaces.
- Primary Text: `#EEF6FF`.
- Muted Text: `#8FA4BA`.
- Coral Signal: `#FF715B` — primary accent, active nodes, important actions.
- Cyan Signal: `#70D7E5` — focus, navigation, and information signal.

### Light signal

The light theme is the same atlas system under daylight, not a separate aesthetic.

- Canvas: `#E7EEF5`.
- Station Surface: `#F6F9FC`.
- Secondary Surface: `#DCE7EF`.
- Primary Text: `#0B1825`.
- Muted Text: `#526A7E`.
- Coral Signal: `#E95545`.
- Cyan Signal: `#147F91`.

Never introduce purple AI gradients, beige paper surfaces, neon outer glows, or pure black.

## 3. Typography

- Display: `Avenir Next`, Avenir, `Century Gothic`, or a humanist sans fallback. Use for the hero, section titles, modal titles, and record names.
- Interface: Inter or the system sans stack. Use for descriptions, controls, and navigation.
- Mono: SFMono-Regular, Menlo, or Consolas. Use for install commands, identifiers, counts, dates, and compact status text.
- Headlines are geometric and humanist, with strong weight and open counters; they must fit cleanly on a 1280px desktop and 390px mobile viewport.

## 4. Layout

- Maximum content width: `1360px`.
- Header: simple brand mark, theme selector, and GitHub link.
- First viewport: asymmetric two-column composition. Search and collection facts sit with the main statement; the install station is the dominant secondary object.
- Catalog: open horizontal records separated by signal rules. Do not turn it into a generic card grid.
- Detail: a large focused modal that preserves browsing context and uses the same station geometry.
- Mobile: stack the hero and install station; catalog rows reduce metadata without losing the primary action.

## 5. Component Language

- Brand mark: a white geometric SVG `FS` monogram on a solid coral tile with precise cut corners.
- Signal nodes: small diamonds or points, used sparingly for catalog position and spatial rhythm.
- Install station: one elevated panel with a coral top rule and exact copy controls.
- Search: one long command-like field with a cyan icon zone and keyboard shortcut.
- Catalog rows: open, border-separated, and hover toward a faint coral signal wash.
- Buttons: square or lightly rectangular, minimum 44px target, thin structural border, no pill treatment unless required by an external component.
- Empty/error states: inline atlas messages near the affected content.

## 6. Motion

- Use 160–220ms state transitions and restrained spring entrances.
- Animate opacity and transform for catalog filtering and modal transitions.
- Hover states may illuminate a signal node or move an arrow by a few pixels.
- Respect `prefers-reduced-motion` everywhere.

## 7. Functional Invariants

- Keep generated skill data flow unchanged.
- Keep search by display name and description.
- Keep newest-first ordering.
- Keep URL query behavior with `?skill=<slug>`.
- Keep modal fetch through `/api/skills/[slug]`.
- Keep repository install copy behavior and individual skill install copy behavior.
- Keep GitHub source links and relative Markdown link resolution.
- Keep theme switching with `system`, `light`, and `dark`.
- Keep all existing Google Analytics event names and payload intent.
- Keep loading, empty, and invalid-slug states.
- Keep responsive behavior without horizontal overflow.

## 8. Anti-patterns

- No reuse of the previous ledger/workshop visual language.
- No beige, paper clay, verdigris, or stationery metaphors.
- No default bento grid or repeated floating cards.
- No fake metrics or fabricated proof.
- No decorative badge clutter or hero eyebrow labels.
- No generic AI gradients or glow-heavy cyberpunk treatment.
- No text glyphs when an existing icon component communicates the action.
- No clipped commands, headings, or mobile controls.
