import { describe, it, expect } from "vitest";
import {
  applyTasteEnvelope,
  validateMotionEnvelope,
  type PageSpec,
} from "../pageSpec";

const baseSpec = (): PageSpec => ({
  version: 1,
  archetype: "editorial-luxury",
  meta: { title: "Test", description: "motion envelope fixtures" },
  theme: {
    palette: { bg: "#F7F3EC", fg: "#171717", muted: "#6A6A66", accent: "#E94F37" },
    typography: { displayFont: "Fraunces", bodyFont: "Geist", scale: "editorial" },
    radius: "lg",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      motion: { entry: "fade-up", durationMs: 600, delayMs: 0, easing: "easeOut", staggerMs: 80 },
      headline: "Headline",
      ctas: [],
      media: { kind: "none" },
    },
    {
      id: "footer",
      type: "footer",
      motion: { entry: "none", durationMs: 200, delayMs: 0, easing: "easeOut", staggerMs: 0 },
      brand: "Test",
    },
  ],
});

describe("validateMotionEnvelope", () => {
  it("accepts a clean envelope-respecting spec", () => {
    expect(validateMotionEnvelope(baseSpec())).toEqual([]);
  });

  it("flags duration above the 900ms ceiling", () => {
    const spec = baseSpec();
    spec.sections[0].motion.durationMs = 1200;
    const issues = validateMotionEnvelope(spec);
    expect(issues).toContainEqual(expect.objectContaining({ sectionId: "hero", field: "durationMs" }));
  });

  it("flags stagger cadence below the 40ms floor when entry=stagger", () => {
    const spec = baseSpec();
    spec.sections[0].motion = { entry: "stagger", durationMs: 520, delayMs: 0, easing: "easeOut", staggerMs: 20 };
    const issues = validateMotionEnvelope(spec);
    expect(issues).toContainEqual(expect.objectContaining({ sectionId: "hero", field: "staggerMs" }));
  });

  it("flags footer sections that attempt a non-none entry", () => {
    const spec = baseSpec();
    spec.sections[1].motion = { entry: "fade-up", durationMs: 520, delayMs: 0, easing: "easeOut", staggerMs: 0 };
    const issues = validateMotionEnvelope(spec);
    expect(issues).toContainEqual(expect.objectContaining({ sectionId: "footer", field: "entry" }));
  });

  it("flags more than 2 parallel entry effects per viewport", () => {
    const spec = baseSpec();
    spec.sections = [
      { ...spec.sections[0], id: "s1" },
      { ...spec.sections[0], id: "s2" },
      { ...spec.sections[0], id: "s3" },
      spec.sections[1],
    ];
    const issues = validateMotionEnvelope(spec);
    expect(issues).toContainEqual(expect.objectContaining({ sectionId: "s3", field: "entry" }));
  });

  it("flags hero delay above the 120ms cap", () => {
    const spec = baseSpec();
    spec.sections[0].motion.delayMs = 400;
    const issues = validateMotionEnvelope(spec);
    expect(issues).toContainEqual(expect.objectContaining({ sectionId: "hero", field: "delayMs" }));
  });
});

describe("applyTasteEnvelope", () => {
  it("clamps runaway duration and forces footer entry to none", () => {
    const spec = baseSpec();
    spec.sections[0].motion.durationMs = 2000;
    spec.sections[1].motion = { entry: "fade-up", durationMs: 520, delayMs: 0, easing: "easeOut", staggerMs: 0 };

    const safe = applyTasteEnvelope(spec);
    expect(safe.sections[0].motion.durationMs).toBeLessThanOrEqual(900);
    expect(safe.sections[1].motion.entry).toBe("none");
    expect(validateMotionEnvelope(safe)).toEqual([]);
  });

  it("lifts an under-floor stagger cadence up to 40ms when entry=stagger", () => {
    const spec = baseSpec();
    spec.sections[0].motion = { entry: "stagger", durationMs: 520, delayMs: 0, easing: "easeOut", staggerMs: 10 };
    const safe = applyTasteEnvelope(spec);
    expect(safe.sections[0].motion.staggerMs).toBe(40);
  });

  it("downgrades a third parallel entry to none so the clamped spec passes validation", () => {
    const spec = baseSpec();
    spec.sections = [
      { ...spec.sections[0], id: "s1" },
      { ...spec.sections[0], id: "s2" },
      { ...spec.sections[0], id: "s3" },
      spec.sections[1],
    ];
    const safe = applyTasteEnvelope(spec);
    expect(safe.sections[2].motion.entry).toBe("none");
    expect(validateMotionEnvelope(safe)).toEqual([]);
  });
});
