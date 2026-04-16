# Silk — DESIGN.md

The taste contract for every site Silk generates. The generator (`lib/generator.ts`)
and every archetype template MUST consult this file before producing a page spec
or rendering output. If output violates a rule here, the generation fails review.

This document is the project-level synthesis of the installed `leonxlnx/taste-skill/*`
skills: `minimalist-ui`, `industrial-brutalist-ui`, `high-end-visual-design`, and
`design-taste-frontend`. Those skills are the source of truth for archetype depth;
this file is the enforceable surface for generation.

---

## 1. Archetypes

Every generation picks exactly ONE archetype and commits to it. Do not mix archetypes
within a single page. Archetype is part of the `PageSpec` contract.

| Key                    | When to pick                                                                                 | Source skill              |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------- |
| `minimalist-ui`        | **Default.** SaaS, portfolios, docs, editorial — anything where restraint is a virtue.       | `minimalist-ui`           |
| `industrial-brutalist` | Data-heavy dashboards, engineering/infra brands, manifestos, portfolios that want to shout. | `industrial-brutalist-ui` |
| `editorial-luxury`     | Lifestyle, agency, real estate, premium consumer — warm, haptic, agency-tier.                | `high-end-visual-design` (Editorial Luxury vibe) |

If the prompt is ambiguous, default to `minimalist-ui`. Never invent a fourth archetype
at runtime — extend this file and the skill layer instead.

---

## 2. Typography Tokens

Shared rule across all archetypes: **no Inter, Roboto, Open Sans, Arial, or Helvetica.**

| Token              | minimalist-ui                          | industrial-brutalist                        | editorial-luxury                       |
| ------------------ | -------------------------------------- | ------------------------------------------- | -------------------------------------- |
| Display (serif/sans) | `Instrument Serif`, `Newsreader`, `Lyon Text` | `Archivo Black`, `Neue Haas Grotesk Black` | `PP Editorial New`, `Playfair Display` |
| Body sans          | `Geist Sans`, `Switzer`, `SF Pro`      | `Neue Haas Grotesk`, `Inter Display` (only as body substitute) | `Geist Sans`, `Satoshi`, `Plus Jakarta Sans` |
| Mono               | `Geist Mono`, `JetBrains Mono`         | `JetBrains Mono`, `IBM Plex Mono`, `Space Mono` | `Geist Mono`                           |
| Display tracking   | `-0.02em` to `-0.04em`, line-height `1.1` | `-0.04em` to `-0.06em`, line-height `0.85–0.95`, UPPERCASE | `-0.02em`, line-height `1.05`          |
| Body tracking      | `0` to `-0.01em`, line-height `1.6`, max `65ch` | UPPERCASE mono at `0.05em–0.1em`, line-height `1.2–1.4` | `0`, line-height `1.6`, max `65ch`     |
| Body color         | `#2F3437` (never pure black)          | `#050505` on light / `#EAEAEA` on dark     | `#1C1917` on cream                     |

Display size: use `clamp()` for fluid scale. Brutalist headers can bleed viewport
(`clamp(4rem, 10vw, 15rem)`). Minimalist and editorial cap around `clamp(2.5rem, 6vw, 5.5rem)`.

---

## 3. Spacing Scale

Single 4px-based scale used by every archetype. Generators MUST map to these,
not arbitrary Tailwind values.

```
space-1  = 4px
space-2  = 8px
space-3  = 12px
space-4  = 16px
space-6  = 24px
space-8  = 32px
space-12 = 48px
space-16 = 64px
space-24 = 96px    ← minimum section padding-y for minimalist / editorial
space-32 = 128px   ← preferred section padding-y above md
space-40 = 160px   ← hero / closer sections
```

Containers: `max-w-5xl` for editorial content (prose / hero copy), `max-w-7xl` for
app/dashboard chrome, `max-w-[1400px]` for brutalist grid bleeds. NEVER use
`h-screen` — always `min-h-[100dvh]`.

---

## 4. Color Discipline

**One accent per site. Saturation ≤ 80%. No AI purple glow. No neon. No gradient text on H1s.**

### 4.1 minimalist-ui (warm monochrome + muted pastels)
- Canvas: `#FFFFFF` or warm `#F7F6F3`
- Surface: `#FFFFFF` or `#F9F9F8`
- Border: `#EAEAEA` (exactly `1px solid`)
- Body text: `#2F3437`, secondary `#787774`
- Tag pastels (bg / text): `#FDEBEC`/`#9F2F2D`, `#E1F3FE`/`#1F6C9F`, `#EDF3EC`/`#346538`, `#FBF3DB`/`#956400`

### 4.2 industrial-brutalist (pick ONE substrate — never mix)
Light (Swiss Industrial Print):
- Background: `#F4F4F0` or `#EAE8E3`
- Foreground: `#050505`–`#111111`
- Accent: `#E61919` aviation red (only accent)

Dark (Tactical Telemetry):
- Background: `#0A0A0A` or `#121212` (never `#000000`)
- Foreground: `#EAEAEA`
- Accent: `#E61919`; optional single-use terminal green `#4AF626`

### 4.3 editorial-luxury (warm cream + restrained accent)
- Canvas: `#FDFBF7` (cream) or `#F5F1EA`
- Surface: `#FFFFFF` with 3% warm grain overlay on fixed pseudo-element
- Ink: `#1C1917`
- Accent options (pick one): deep espresso `#3B2A22`, muted sage `#7C8B72`, deep rose `#A34560`. Saturation capped at 60%.

Shared rule: shadows are tinted to the substrate, never pure black. Minimal/editorial
use `rgba(23,23,26,0.04)`-class softness; brutalist uses no shadows at all.

---

## 5. Motion Envelope

Global guardrails that apply to every archetype (enforced by `components/motion/*`):

1. **Only animate `transform` and `opacity`.** Never animate `top`/`left`/`width`/`height`.
2. **Primary easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo). Springs use
   `{ type: "spring", stiffness: 100, damping: 20 }`. No `linear`, no default `ease-in-out`.
3. **Entry choreography:** scroll-enter via `IntersectionObserver` or Framer
   `whileInView`. Never `window.addEventListener('scroll')`. Staggered reveals
   cascade with `calc(var(--index) * 80ms)` (minimalist) or `100ms` (editorial).
4. **Timing by archetype:**
   - `minimalist-ui`: 400–700ms. Translate offset ≤ `16px`. Opacity from 0 → 1. Blur optional ≤ `4px`.
   - `industrial-brutalist`: 120–300ms. Prefer snap/step transitions, 1-frame flickers,
     typewriter scramble. No blur. No float.
   - `editorial-luxury`: 700–1000ms. Translate up to `24px`, optional blur `8–12px`
     resolving to 0. Magnetic button hover on CTAs.
5. **Perpetual motion:** permitted for status dots, carousels, marquee bands. MUST
   be isolated in its own memoized client component (`React.memo` + `'use client'`).
   Never attach perpetual animation to a layout container.
6. **Fixed-blur only.** `backdrop-blur` on sticky/fixed elements only. Never on
   scrolling containers.
7. **Reduced motion:** every motion component respects `prefers-reduced-motion: reduce`
   by collapsing to a cross-fade ≤ 200ms. This is non-negotiable.
8. **Z-index discipline:** reserved systemic layers only — `z-40` nav, `z-50` modal,
   `z-60` toast. No arbitrary `z-[9999]`.

---

## 6. Component Defaults

| Pattern        | Rule                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Card / bento   | Minimalist: `border: 1px solid #EAEAEA`, radius `8–12px`, padding `24–40px`. Editorial: double-bezel (outer shell `p-1.5 rounded-[2rem] ring-1 ring-black/5`, inner core `rounded-[calc(2rem-0.375rem)]`). Brutalist: 0 radius, 1–2px solid borders, grid-gap dividers. |
| Primary CTA    | Minimalist: solid `#111111`, text `#FFFFFF`, radius `4–6px`, no shadow, hover `scale(0.98)`. Editorial: rounded-full pill with nested trailing icon circle. Brutalist: square button, uppercase mono label, hazard-red on hover only. |
| Tags / badges  | `rounded-full`, `text-xs` uppercase, tracking `0.05em`, muted pastel (minimalist) or hazard-red outline (brutalist) or warm-ink with cream bg (editorial). |
| Accordion      | Strip containers. `border-bottom: 1px solid` dividers. `+` / `−` glyph toggle. No chevron icon. |
| Form field     | Label above input (`gap-2`), helper text optional, inline error below, `:active` press `scale(0.98)`. |
| Keystroke / `<kbd>` | Monospace, `border: 1px solid #EAEAEA`, bg `#F7F6F3`, radius `4px`.                         |
| Icons          | Phosphor (Light 1.5 or Bold/Fill) or Radix UI Icons. Standardized stroke across the page.        |
| Imagery        | Placeholder: `https://picsum.photos/seed/{context}/1200/800`. Never Unsplash URLs. Desaturate + warm grain overlay for minimalist/editorial. |

---

## 7. Copy Tone

- Plain, specific, concrete verbs. Second person when addressing the user.
- **Banned clichés:** Elevate, Seamless, Unleash, Next-gen, Game-changer, Delve,
  Supercharge, Revolutionize, Reimagine, Empower, Unlock.
- **Banned filler names:** John Doe, Jane Doe, Acme, Nexus, SmartFlow, Lorem Ipsum.
  Generate realistic contextual brand and person names.
- **Banned fake numbers:** `99.99%`, `50%`, round marketing percentages, `1234567`
  phone numbers. Use organic values (`47.2%`, `+1 (312) 847-1928`).
- Headlines: one idea per line, no trailing periods.
- Eyebrow tags (above H1/H2): uppercase, tracking `0.2em`, ≤ 24 characters.

---

## 8. Banned Patterns Checklist

The generator MUST fail its own pre-output check if ANY of the following appear.
This is the final filter, applied after archetype rules.

- [ ] Inter, Roboto, Open Sans, Arial, or Helvetica as the primary font
- [ ] Pure `#000000` anywhere
- [ ] `shadow-md` / `shadow-lg` / `shadow-xl` or any generic Tailwind heavy shadow
- [ ] Gradient text on headings; neon outer glows; AI-purple (`from-purple-500 to-blue-500`) gradients
- [ ] Three-equal-card horizontal feature row (the "three-column cards" slop)
- [ ] Centered H1 + sub + CTA stacked in a tiny vertical column as the entire hero
- [ ] Emojis anywhere — in markup, content, alt text, labels, buttons
- [ ] Lorem ipsum, placeholder "John Doe"/"Acme"/"Nexus" content
- [ ] Grey-on-grey cards (e.g., `bg-gray-100` card on `bg-gray-50` surface with no border)
- [ ] Unsplash URLs; use picsum with a stable seed instead
- [ ] Lucide / FontAwesome / Material default icons (use Phosphor or Radix)
- [ ] `rounded-full` on large containers / hero cards / primary content wrappers
- [ ] `h-screen` on hero — always `min-h-[100dvh]`
- [ ] Animation of `top`, `left`, `width`, or `height`
- [ ] `window.addEventListener('scroll')` — use `IntersectionObserver` or Framer `whileInView`
- [ ] `backdrop-blur` on scrolling containers
- [ ] Linear or default ease-in-out transitions
- [ ] Custom mouse cursors
- [ ] Centered 3-column Bootstrap-style feature grid when the prompt implies premium
- [ ] Serif display font on a dashboard/data UI
- [ ] More than one accent color per site
- [ ] Copy containing any banned cliché from §7
- [ ] Mixed archetypes (e.g., brutalist monospace inside a minimalist card)

---

## 9. PageSpec Integration

`lib/pageSpec.ts` defines the structured contract between prompt and render.
The spec MUST include an `archetype` field typed as the keys in §1. The renderer
(`components/Renderer.tsx`) dispatches on that key to archetype-specific section
templates. Tokens in §2–§5 are exposed through Tailwind theme (`tailwind.config.ts`)
and a CSS-variable sheet in `app/globals.css`. The generator is free to choose
layouts within an archetype; it is NOT free to mix tokens across archetypes.

When `WEB-5` (animation layer primitives) lands, the motion envelope in §5 becomes
the contract those primitives implement. Until then, any ad-hoc Framer usage in
sections must still honour §5.

---

## 10. Enforcement Hook (Self-Check)

Before returning a generation, the generator runs this mental pass:

1. Is exactly one archetype selected? (§1)
2. Do all tokens (font, color, spacing) come from this archetype's row in §2–§4?
3. Does every animated element obey §5 (transform/opacity, easing, reduced-motion)?
4. Does the output pass every item in §8?
5. Does the copy survive §7?

If any check fails, the generator must regenerate the offending section — it does
NOT ship half-correct output.
