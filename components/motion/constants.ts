/**
 * Silk motion envelope — shared tokens enforced by every primitive in
 * `components/motion/*`. Maps to DESIGN.md §5. Never edit casually; the
 * generator depends on these defaults to keep output editorial.
 */

import type { Easing, Transition } from "framer-motion";

export const OUT_EXPO: Easing = [0.16, 1, 0.3, 1];
export const OUT_QUART: Easing = [0.25, 1, 0.5, 1];
export const SNAP: Easing = [0.6, 0, 0.4, 1];

export const DURATION = {
  micro: 0.18,
  fast: 0.32,
  base: 0.52,
  slow: 0.72,
  cinematic: 0.96,
} as const;

export const REDUCED_DURATION = 0.18;
export const REDUCED_TRANSITION: Transition = {
  duration: REDUCED_DURATION,
  ease: "linear",
};

export const VIEWPORT = {
  amount: 0.2 as const,
  once: true as const,
};

export type Archetype = "minimalist-ui" | "industrial-brutalist" | "editorial-luxury";

/**
 * Per-archetype timing budget. Read by primitives when an explicit duration
 * is not provided. Sourced from DESIGN.md §5 timing table.
 */
export const ARCHETYPE_TIMING: Record<Archetype, { duration: number; translate: number; ease: Easing }> = {
  "minimalist-ui": { duration: DURATION.base, translate: 16, ease: OUT_EXPO },
  "industrial-brutalist": { duration: DURATION.fast, translate: 8, ease: SNAP },
  "editorial-luxury": { duration: DURATION.slow, translate: 24, ease: OUT_QUART },
};
