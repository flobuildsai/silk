/**
 * Silk motion primitives. Single import surface for the generator and
 * archetype templates. Every primitive obeys DESIGN.md §5: transform/opacity
 * only, out-expo easing, prefers-reduced-motion respected.
 */

export { Reveal } from "./Reveal";
export { Stagger, StaggerItem } from "./Stagger";
export { Parallax } from "./Parallax";
export { ScrollProgress, useProgressTransform } from "./ScrollProgress";
export { Pin } from "./Pin";
export { HoverLift } from "./HoverLift";
export { Magnetic } from "./Magnetic";
export { Marquee } from "./Marquee";
export { PresenceFade } from "./PresenceFade";

export {
  OUT_EXPO,
  OUT_QUART,
  SNAP,
  DURATION,
  REDUCED_DURATION,
  REDUCED_TRANSITION,
  VIEWPORT,
  ARCHETYPE_TIMING,
} from "./constants";
export type { Archetype } from "./constants";
