# Design System: Flc's Skills Marketplace

## 1. Visual Theme & Atmosphere
The interface is a workshop ledger for agent workflows: editorial, precise, and built for scanning. It should feel like a high-quality command archive rather than a marketing page.

- Density: 6/10, balanced for repeated browsing without becoming sparse.
- Variance: 8/10, asymmetric first viewport and staggered catalog rhythm.
- Motion: 6/10, weighty spring motion with subtle perpetual activity on active controls.
- Creativity: 8/10, distinctive but still practical for a developer tool.

Do not reuse the old centered hero, pastel gradient glow, sticker-label typography, rounded pill statistics, or three-equal-card marketplace grid.

## 2. Color Palette & Roles
- **Paper Clay** (#F4F1EA) - Primary page canvas.
- **Bone Surface** (#FBFAF6) - Primary elevated surface and modal body.
- **Register Surface** (#E8E1D4) - Secondary bands, side rails, quiet filled controls.
- **Charcoal Register** (#1D1C19) - Primary text and structural marks. Never use pure black.
- **Graphite Note** (#6D6961) - Secondary copy, helper text, inactive controls.
- **Faint Rule** (rgba(29, 28, 25, 0.12)) - Hairline borders and dividers.
- **Verdigris Mark** (#3E8F78) - The only accent. Use for primary actions, active state, focus rings, and selected metadata.
- **Night Canvas** (#151512) - Dark theme canvas.
- **Night Surface** (#201F1B) - Dark theme elevated surface.
- **Night Rule** (rgba(244, 241, 234, 0.14)) - Dark theme structural lines.

Only Verdigris Mark may behave as an accent. No purple, blue neon, candy gradients, outer glow shadows, or oversaturated highlights.

## 3. Typography Rules
- **Display:** Satoshi, Geist, or a local sans fallback. Tight tracking, controlled clamp scale, high weight only where hierarchy demands it.
- **Body:** Satoshi, Geist, or local sans fallback. Relaxed leading and a maximum readable measure near 65 characters.
- **Mono:** JetBrains Mono, SFMono-Regular, or ui-monospace. Use for commands, install names, dates, file counts, and compact index metadata.
- **Banned:** Inter, generic serif fonts, browser-default control typography, exaggerated hero-scale type in compact panels.

## 4. Component Stylings
- **Buttons:** Flat, tactile, minimum 44px target. Active state translates down 1px. Primary uses Verdigris Mark fill; secondary uses transparent surface with a hairline rule.
- **Cards and records:** Use cards only for individual records, modal bodies, and command surfaces. Catalog records should feel like ledger entries with visible dividers, not floating marketing cards.
- **Inputs:** Label or visible context above or beside the input. Focus ring uses Verdigris Mark. No floating labels.
- **Command blocks:** Mono text, stable height, copy icon button, clear step label, selected command text.
- **Loaders:** Skeleton blocks that match the final layout. No circular spinners.
- **Empty states:** Quiet composed empty state with a structural mark and direct text. No generic decorative icon cluster.
- **Error states:** Inline, close to the failed content, with plain language.

## 5. Layout Principles
- First viewport is asymmetric: editorial copy and primary command surface on one side, live index records on the other.
- Use CSS Grid for major layout. Avoid percentage math and nested cards.
- Multi-column layouts collapse below 768px.
- Every element has its own clear spatial zone. No overlapping text, controls, or decorative content.
- Catalog layout should vary scale and rhythm while keeping predictable scanning.
- Use max-width containment around 1400px.
- Do not create fake metrics or statistics. Counts must come from real data already in the app.

## 6. Motion & Interaction
- Use spring transitions with stiffness 100 and damping 20 for major interactions.
- Animate only transform and opacity.
- Use staggered cascade reveals for skill records.
- Active controls may use a subtle repeating underline, shimmer, or small transform loop.
- Respect reduced motion by keeping interaction readable when motion is minimized.

## 7. Functional Invariants
- Keep generated skill data flow unchanged.
- Keep search by display name and description.
- Keep URL query behavior with `?skill=<slug>`.
- Keep modal fetch through `/api/skills/[slug]`.
- Keep repository install copy behavior and individual skill install copy behavior.
- Keep GitHub source links and relative Markdown link resolution.
- Keep theme switching with `system`, `light`, and `dark`.
- Keep Google Analytics event names and payload intent.
- Keep responsive mobile behavior without horizontal overflow.

## 8. Anti-Patterns (Banned)
- No emojis anywhere.
- No Inter.
- No pure black (#000000).
- No neon glows or outer glow shadows.
- No purple/blue AI gradients.
- No centered hero for the first viewport.
- No three-column equal feature rows as the defining marketplace pattern.
- No fake numbers, fake performance metrics, or fabricated proof points.
- No `LABEL // YEAR` typography.
- No AI copywriting cliches such as "Elevate", "Seamless", "Unleash", or "Next-Gen".
- No scroll prompts, bouncing arrows, or filler helper text.
- No custom mouse cursors.
- No broken remote image dependencies.
