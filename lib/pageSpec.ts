import { z } from "zod";

const hexColor = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

export const ThemeSchema = z.object({
  palette: z.object({
    bg: hexColor,
    fg: hexColor,
    muted: hexColor,
    accent: hexColor,
    accent2: hexColor.optional(),
  }),
  typography: z.object({
    displayFont: z.enum(["Fraunces", "Playfair Display", "Instrument Serif", "Inter", "Geist"]),
    bodyFont: z.enum(["Inter", "Geist", "IBM Plex Sans", "Manrope"]),
    scale: z.enum(["compact", "editorial", "oversized"]),
  }),
  radius: z.enum(["none", "sm", "md", "lg", "full"]).default("md"),
});
export type Theme = z.infer<typeof ThemeSchema>;

export const MOTION_EASINGS = [
  "easeOut",
  "easeInOut",
  "circOut",
  "anticipate",
  "backOut",
] as const;

export const MotionSpecSchema = z.object({
  entry: z.enum(["fade-up", "fade", "reveal", "stagger", "blur-in", "none"]).default("fade-up"),
  durationMs: z.number().int().min(120).max(900).default(520),
  delayMs: z.number().int().min(0).max(600).default(0),
  easing: z.enum(MOTION_EASINGS).default("easeOut"),
  staggerMs: z.number().int().min(0).max(160).default(60),
});
export type MotionSpec = z.infer<typeof MotionSpecSchema>;

const BaseSection = z.object({
  id: z.string().min(1),
  motion: MotionSpecSchema.default({
    entry: "fade-up",
    durationMs: 520,
    delayMs: 0,
    easing: "easeOut",
    staggerMs: 60,
  }),
});

export const HeroSectionSchema = BaseSection.extend({
  type: z.literal("hero"),
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(140),
  sub: z.string().max(220).optional(),
  ctas: z
    .array(
      z.object({
        label: z.string().min(1).max(40),
        href: z.string().min(1),
        variant: z.enum(["primary", "ghost"]).default("primary"),
      })
    )
    .max(2)
    .default([]),
  media: z
    .object({
      kind: z.enum(["none", "marquee", "gradient-orb"]).default("none"),
      items: z.array(z.string()).max(12).optional(),
    })
    .default({ kind: "none" }),
});

export const FeaturesSectionSchema = BaseSection.extend({
  type: z.literal("features"),
  heading: z.string().max(120),
  items: z
    .array(
      z.object({
        title: z.string().max(60),
        body: z.string().max(220),
        icon: z.enum(["sparkles", "bolt", "grid", "wand", "globe", "shield"]).default("sparkles"),
      })
    )
    .min(2)
    .max(6),
});

export const GallerySectionSchema = BaseSection.extend({
  type: z.literal("gallery"),
  heading: z.string().max(120).optional(),
  tiles: z
    .array(
      z.object({
        label: z.string().max(40),
        tint: z.enum(["warm", "cool", "mono"]).default("warm"),
      })
    )
    .min(3)
    .max(9),
});

export const CTASectionSchema = BaseSection.extend({
  type: z.literal("cta"),
  heading: z.string().max(120),
  sub: z.string().max(200).optional(),
  action: z.object({
    label: z.string().max(40),
    href: z.string().min(1),
  }),
});

export const FooterSectionSchema = BaseSection.extend({
  type: z.literal("footer"),
  brand: z.string().max(40),
  note: z.string().max(120).optional(),
});

export const SectionSchema = z.discriminatedUnion("type", [
  HeroSectionSchema,
  FeaturesSectionSchema,
  GallerySectionSchema,
  CTASectionSchema,
  FooterSectionSchema,
]);
export type Section = z.infer<typeof SectionSchema>;

export const PageSpecSchema = z.object({
  version: z.literal(1).default(1),
  meta: z.object({
    title: z.string().min(1).max(80),
    description: z.string().max(200),
  }),
  theme: ThemeSchema,
  sections: z.array(SectionSchema).min(2).max(6),
});
export type PageSpec = z.infer<typeof PageSpecSchema>;

/**
 * Motion envelope caps enforced by both `applyTasteEnvelope` (write path)
 * and `validateMotionEnvelope` (read path). Mirrors DESIGN.md §5 and the
 * in-house `silk-a11y-motion` skill.
 */
export const MOTION_ENVELOPE = {
  durationMsMin: 200,
  durationMsMax: 900,
  staggerMsFloor: 40,
  staggerMsCeiling: 120,
  heroDelayMsMax: 120,
  maxParallelEntries: 2,
} as const;

export type MotionViolation = {
  sectionId: string;
  field: "durationMs" | "staggerMs" | "delayMs" | "entry";
  message: string;
};

/**
 * Reports violations against the silk-a11y-motion envelope. Does not mutate.
 * Consumed by the WEB-8 guardrails layer to build re-prompt context.
 */
export function validateMotionEnvelope(spec: PageSpec): MotionViolation[] {
  const violations: MotionViolation[] = [];
  let activeEntries = 0;
  spec.sections.forEach((s, i) => {
    const m = s.motion;
    if (m.durationMs < MOTION_ENVELOPE.durationMsMin || m.durationMs > MOTION_ENVELOPE.durationMsMax) {
      violations.push({
        sectionId: s.id,
        field: "durationMs",
        message: `duration ${m.durationMs}ms outside ${MOTION_ENVELOPE.durationMsMin}–${MOTION_ENVELOPE.durationMsMax}ms envelope`,
      });
    }
    if (m.entry === "stagger" && m.staggerMs < MOTION_ENVELOPE.staggerMsFloor) {
      violations.push({
        sectionId: s.id,
        field: "staggerMs",
        message: `stagger cadence ${m.staggerMs}ms below ${MOTION_ENVELOPE.staggerMsFloor}ms floor (reads as simultaneous)`,
      });
    }
    if (m.staggerMs > MOTION_ENVELOPE.staggerMsCeiling) {
      violations.push({
        sectionId: s.id,
        field: "staggerMs",
        message: `stagger cadence ${m.staggerMs}ms above ${MOTION_ENVELOPE.staggerMsCeiling}ms ceiling (reads as drag)`,
      });
    }
    if (m.entry !== "none") {
      activeEntries += 1;
      if (activeEntries > MOTION_ENVELOPE.maxParallelEntries) {
        violations.push({
          sectionId: s.id,
          field: "entry",
          message: `exceeds ${MOTION_ENVELOPE.maxParallelEntries} parallel entry effects per viewport`,
        });
      }
    }
    if (i === 0 && m.delayMs > MOTION_ENVELOPE.heroDelayMsMax) {
      violations.push({
        sectionId: s.id,
        field: "delayMs",
        message: `hero delay ${m.delayMs}ms > ${MOTION_ENVELOPE.heroDelayMsMax}ms — hero must open without perceived lag`,
      });
    }
    if (s.type === "footer" && m.entry !== "none") {
      violations.push({
        sectionId: s.id,
        field: "entry",
        message: `footer must use entry="none" (vestibular-safe stable-ground default)`,
      });
    }
  });
  return violations;
}

export function applyTasteEnvelope(spec: PageSpec): PageSpec {
  let activeEntries = 0;
  const sections = spec.sections.map((s, i) => {
    const motion = { ...s.motion };
    motion.durationMs = Math.max(MOTION_ENVELOPE.durationMsMin, Math.min(MOTION_ENVELOPE.durationMsMax, motion.durationMs));
    motion.staggerMs = Math.max(0, Math.min(MOTION_ENVELOPE.staggerMsCeiling, motion.staggerMs));
    if (motion.entry === "stagger" && motion.staggerMs > 0 && motion.staggerMs < MOTION_ENVELOPE.staggerMsFloor) {
      motion.staggerMs = MOTION_ENVELOPE.staggerMsFloor;
    }
    if (s.type === "footer") {
      motion.entry = "none";
    }
    if (activeEntries >= MOTION_ENVELOPE.maxParallelEntries && motion.entry !== "none") {
      motion.entry = "none";
    }
    if (motion.entry !== "none") activeEntries += 1;
    if (i === 0 && motion.delayMs > MOTION_ENVELOPE.heroDelayMsMax) motion.delayMs = 0;
    return { ...s, motion } as Section;
  });
  return { ...spec, sections };
}
