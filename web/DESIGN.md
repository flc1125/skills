# Design System: Soft Modern

## 1. Visual Direction

The marketplace is a friendly, modern product surface for discovering reusable agent skills. It should feel light, calm, and effortless: soft cards floating on a quiet canvas, one confident accent color, and generous whitespace.

- Default character: warm off-white canvas, white rounded cards, diffused shadows, and a single vivid tangerine accent.
- Creativity: 5/10. Familiar product patterns executed with restraint and polish.
- Density: 4/10. The hero stays airy; the catalog is a comfortable card grid.
- The previous "technical atlas" language is retired: no coordinate grids, signal nodes, diamond markers, hard rules, or navy station surfaces.

## 2. Color System

### Light theme

- Background: `#FAF9F7` — warm off-white canvas.
- Surface: `#FFFFFF` — cards, modal, popovers.
- Surface Muted: `#F1F0EE` — inset fills (command rows, chips, segmented control track).
- Foreground: `#1B1E28`.
- Muted: `#68707F`.
- Border: `rgba(27, 30, 40, 0.08)` / strong `0.14`.
- Accent: `#FF5C33` (vivid tangerine), Accent Strong: `#E84620`, Accent Soft: 10% tangerine wash.

### Dark theme

The dark theme is the same system at night, not a separate aesthetic.

- Background: `#0E0F13`.
- Surface: `#17181E`.
- Surface Muted: `#1F2129`.
- Foreground: `#F2F3F7`.
- Muted: `#9AA2B1`.
- Border: `rgba(242, 243, 247, 0.09)` / strong `0.16`.
- Accent: `#FF8A66`, Accent Strong: `#FFA585`, Accent Soft: 16% wash.

The only decorative treatment is a faint tangerine radial glow at the top center of the page (`--glow`). No other gradients, no neon, no glassmorphism stacks. Never use blue-violet/indigo as the accent — it reads as generic AI-product branding.

## 3. Typography

- Display: `Plus Jakarta Sans` (loaded via `next/font/google` as `--font-jakarta`). Used for the hero, section titles, modal titles, card titles, and the wordmark. Apply via the `.font-display` class.
- Interface: `Inter` (`--font-inter`). Body text, controls, navigation.
- Mono: SFMono-Regular/Menlo stack. Install commands, dates, file counts, keyboard hints.
- Headings use tight tracking and bold/extrabold weights; body text is regular/medium with relaxed leading.

## 4. Layout

- Maximum content width: `72rem` (`max-w-6xl`).
- Header: fixed, 64px, blurred translucent background, hairline bottom border. Left: rounded gradient brand mark + wordmark. Right: theme selector and GitHub link as circular icon buttons.
- Hero: centered composition — headline, subtext, the search field as the hero object (large pill with ⌘K badge), then fact pills (skill count, file count).
- Quick install: one centered `max-w-2xl` card below the hero containing the provider segmented control and command rows.
- Catalog: a responsive card grid — 1 column on mobile, 2 on `sm`, 3 on `lg` — with a small heading row above it.
- Detail: a centered `rounded-3xl` modal that preserves browsing context.
- Footer: centered wordmark, one-line description, copyright.
- Mobile: everything stacks; cards go full width; the search pill keeps its primary action.

## 5. Component Language

- Brand mark: white `FS` monogram on a rounded-square (`rx=11`) tangerine gradient tile.
- Cards: `rounded-2xl`, 1px `--border`, `--shadow-card`. Hover: `-translate-y-1`, accent-tinted border, `--shadow-card-hover`.
- Buttons and inputs: `rounded-full` for pills/icon buttons, `rounded-xl` for inset rows. Minimum 44px touch target where practical.
- Chips/badges: `rounded-full` fills of `--surface-muted`; accent actions use `--accent-soft` background with `--accent` text.
- Search: one large pill field, search icon on the left, `⌘K` kbd chip on the right, accent focus ring via border + shadow.
- Segmented control: muted track pill with a white/surface sliding indicator (`layoutId` spring).
- Copy buttons: circular, surface background; success state fills with `--accent`.
- Empty/error states: centered, dashed-border panel or soft accent wash, inline near the affected content.

## 6. Motion

- Springs over easings: cards enter with a soft spring (`stiffness ~260, damping ~28`) and a short per-item stagger (≤12 items, ~35ms each).
- The hero (headline, subtext, search, fact pills, install panel) enters as a choreographed sequence — fade-up with ~70ms stagger.
- Stat numbers (skill/file counts) count up from 0 on first paint (~700ms, instant under reduced motion).
- Catalog filtering uses `AnimatePresence mode="popLayout"` with `layout` springs; the stagger delay applies to entrance only, never to layout reflow.
- Press feedback uses Motion `whileTap` scale springs on cards, tabs, and copy buttons (no CSS `:active` transforms — inline Motion transforms would override them anyway).
- Copy success crossfades the icon/label in place — both states share one grid cell and animate opacity + scale simultaneously (150ms, `cubic-bezier(0.34, 1.56, 0.64, 1)` for a slight overshoot). Never serialize exit-then-enter here (no `AnimatePresence mode="wait"`); it leaves a dead gap with nothing visible.
- The install provider tabs slide their indicator (`layoutId`) and cross-slide the command area on switch.
- Card hover lift is `whileHover={{ y: -4 }}` (Motion-driven, not a CSS transform, so it composes with layout animations). On hover the title also shifts to the accent color and the arrow button fills.
- Hovered cards show a cursor-following spotlight: a ~220px radial wash of the accent at 7% alpha, driven by Motion values (no React re-renders on mousemove), faded in/out over 300ms. Keep it at or under 8% alpha — it should read as a sheen, not a glow.
- Empty states animate in: the panel fades up while the icon springs in with a low-damping wobble.
- Long modal content gets a circular accent back-to-top button (bottom-right of the scroll area) once scrolled past ~240px; it springs in/out and smooth-scrolls the content. Content scroll resets when the modal opens or the skill changes.
- Theme switching transitions colors globally (200ms on background/border/color/fill/stroke/box-shadow via a `@layer base` rule that utilities can override).
- Modal: backdrop fade (200ms), panel spring from `scale 0.96 / y 16`.
- Respect `prefers-reduced-motion` everywhere (`MotionConfig reducedMotion="user"` plus the global CSS guard).

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

- No revival of the atlas/ledger visual languages (grids, signal nodes, navy stations, beige paper).
- No heavy gradients, glassmorphism stacks, or glow effects beyond the single page glow.
- No sharp-cornered cards or hard uppercase microcopy.
- No fake metrics or fabricated proof.
- No decorative badge clutter.
- No text glyphs when an existing icon component communicates the action.
- No clipped commands, headings, or mobile controls.
