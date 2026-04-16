---
name: silk-a11y-motion
description: In-house a11y + motion-safety gate for Silk. Every generated PageSpec and motion primitive must pass this skill before rendering. Prefers-reduced-motion + vestibular safety are non-negotiable.
version: 0.1.0
owner: Founding Engineer
scope: lib/pageSpec.ts, components/motion/*, lib/generator.ts
---

# Silk a11y-motion skill

This is our internal micro-skill. We authored it after the skills.sh scout ([WEB-11](/WEB/issues/WEB-11)) found nothing that met the bar (recognizable author OR ≥1K installs) for reduced-motion + vestibular safety. It is versioned alongside `DESIGN.md` §5 and extends `applyTasteEnvelope` in `lib/pageSpec.ts`.

## 1. Non-negotiables

Every generation runs through this gate **before** the React tree is committed. Any violation is a hard reject in the taste-guardrails loop ([WEB-8](/WEB/issues/WEB-8)).

### 1.1 `prefers-reduced-motion`
- Every motion primitive in `components/motion/*` MUST consult `useReducedMotion()` and collapse to a ≤200ms cross-fade.
- Footer sections default to `entry: "none"` regardless of the generator's output — `applyTasteEnvelope` enforces this.
- Perpetual motion (marquees, status dots) MUST pause or step when reduced-motion is set.

### 1.2 Vestibular safety
Applies to users **without** `prefers-reduced-motion` too — these are absolute caps in the render layer:

| Rule | Cap |
| ---- | ---- |
| Scroll-linked parallax (`<Parallax offset>`) | ≤ 8px net Y translation at low viewport widths, ≤ 24px at `lg+` |
| Entry translate (y) | ≤ 24px per DESIGN §5 archetype row |
| Auto-play / perpetual motion duration | ≤ 3s full cycle OR loop silently after first pass |
| Full-viewport translate | Banned |
| Rapid color/luminance flicker | Banned (≤ 3 cycles/sec, ≤ 20% luminance delta) |
| Autoplaying video | Banned for hero / above-the-fold surfaces |

### 1.3 Motion envelope (MotionSpec layer)
`PageSpec.sections[].motion` is the generator-facing envelope. These mirror `applyTasteEnvelope` and are enforced by `validateMotionEnvelope`:

| Field | Range | Rationale |
| ----- | ----- | --------- |
| `durationMs` | 200–900 | Below 200 feels broken; above 900 feels laggy |
| `staggerMs` | 0 or 40–120 | Sub-40 reads as simultaneous; >120 reads as drag |
| `delayMs` (hero) | ≤ 120 | Hero must open without perceived lag |
| `entry` | ≤ 2 parallel non-`none` entries per viewport | More than 2 reads as confetti |
| `entry` (footer) | must be `"none"` | Vestibular-safe default — footer is stable ground |

### 1.4 Easing allowlist
Only the curves in `components/motion/constants.ts`:
`OUT_EXPO`, `OUT_QUART`, `SNAP`, `REDUCED_TRANSITION` (linear 180ms for reduced-motion only).
Framer's default `easeInOut` and CSS `linear` are banned outside the reduced transition.

## 2. Wiring

### 2.1 Pre-render gate
`lib/pageSpec.ts` exports two complementary functions:

- `applyTasteEnvelope(spec)` — **clamps** the spec to be envelope-safe (mutating defensively). Always called by `generator.ts` before returning a spec.
- `validateMotionEnvelope(spec)` — **reports** violations as `MotionViolation[]`. Consumed by the WEB-8 guardrails layer to decide whether to re-prompt the model with corrective context.

The two functions share the same rule set. `applyTasteEnvelope` is the write path; `validateMotionEnvelope` is the read path for diagnostics.

### 2.2 Component gate
Every primitive in `components/motion/*`:
1. Calls `useReducedMotion()` first.
2. Returns the reduced variant (opacity-only, ≤200ms, linear) when reduced is true.
3. Uses only easings from `constants.ts`.
4. Never animates `top`/`left`/`width`/`height` (DESIGN §5.1).
5. For `<Parallax>`: clamps the configured `offset` prop to the caps in §1.2.

## 3. Self-test

Unit coverage lives in `lib/__tests__/pageSpec.test.ts`. At minimum:

- A crafted spec with `durationMs: 1200` must produce a `durationMs` violation.
- A crafted spec with `entry: "fade-up"` on a footer must produce a footer violation.
- `applyTasteEnvelope` applied to the same spec must downgrade footer to `entry: "none"` and clamp duration to ≤ 900.
- A spec with 3 non-`none` entries in a row must produce a `parallel entries` violation.

Run with `npm test`.

## 4. Out of scope (for v0)

- Publishing to skills.sh (internal use only until v0 ships).
- WCAG checks beyond motion (contrast, focus order, ARIA) — separate skill later.
- Full vestibular-safety audit of WebGL / 3D surfaces — we do not ship 3D in v0.

## 5. Changelog

- `0.1.0` — Initial skill. Codifies DESIGN §5 as executable rules. Wired into `applyTasteEnvelope`. Author: Founding Engineer for [WEB-12](/WEB/issues/WEB-12).
