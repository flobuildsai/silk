/**
 * Design-taste guardrails for Silk. Consumes a `PageSpec` and returns a
 * flat list of `Violation`s. Used by `generator.ts` to decide whether to
 * re-prompt the model with corrective context.
 *
 * Source of truth for rules: `DESIGN.md` §5 (motion), §7 (copy), §8 (banned
 * patterns), plus `skills/silk-a11y-motion/SKILL.md`.
 *
 * We enforce conventions from the `full-output-enforcement` skill in the
 * re-prompt composer: be explicit, name every violated rule, never suggest
 * "maybe fix" — direct corrective instructions only.
 */

import {
  validateMotionEnvelope,
  type PageSpec,
  type Section,
  type MotionViolation,
} from "./pageSpec";

export type ViolationSeverity = "error" | "warn";

export type Violation = {
  code: string;
  path: string;
  message: string;
  severity: ViolationSeverity;
};

/** Copy clichés banned by DESIGN §7. Case-insensitive whole-word match. */
export const BANNED_CLICHES = [
  "elevate",
  "seamless",
  "unleash",
  "next-gen",
  "next generation",
  "game-changer",
  "game-changing",
  "delve",
  "supercharge",
  "revolutionize",
  "revolutionary",
  "reimagine",
  "empower",
  "unlock",
  "leverage",
  "synergy",
  "cutting-edge",
  "disruptive",
] as const;

/** Filler brand / person names banned by DESIGN §7. */
export const BANNED_FILLER_NAMES = [
  "john doe",
  "jane doe",
  "acme",
  "nexus",
  "smartflow",
  "lorem ipsum",
  "lorem",
] as const;

/** Display fonts banned by DESIGN §2. Our schema already excludes them,
 * but a user-provided theme could still smuggle one through, so we double-check. */
export const BANNED_DISPLAY_FONTS = ["Inter", "Roboto", "Open Sans", "Arial", "Helvetica"] as const;

/** Pure anchor colors. DESIGN §4: never pure black or white. */
const BANNED_HEX_COLORS = new Set(["#000", "#000000", "#fff", "#ffffff"]);

/** Emojis detected via a unicode emoji regex (DESIGN §7 / §8). */
// eslint-disable-next-line no-misleading-character-class
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}]/u;

const BANNED_CLICHE_RE = new RegExp(
  `\\b(?:${BANNED_CLICHES.map((c) => c.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})\\b`,
  "i"
);

const BANNED_FILLER_RE = new RegExp(
  `\\b(?:${BANNED_FILLER_NAMES.map((c) => c.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})\\b`,
  "i"
);

function textFromSection(s: Section): Array<{ path: string; text: string }> {
  const out: Array<{ path: string; text: string }> = [];
  const push = (field: string, v?: string | null) => {
    if (v && v.trim()) out.push({ path: `${s.id}.${field}`, text: v });
  };
  switch (s.type) {
    case "hero":
      push("eyebrow", s.eyebrow);
      push("headline", s.headline);
      push("sub", s.sub);
      s.ctas.forEach((c, i) => push(`ctas[${i}].label`, c.label));
      break;
    case "features":
      push("heading", s.heading);
      s.items.forEach((it, i) => {
        push(`items[${i}].title`, it.title);
        push(`items[${i}].body`, it.body);
      });
      break;
    case "gallery":
      push("heading", s.heading);
      s.tiles.forEach((t, i) => push(`tiles[${i}].label`, t.label));
      break;
    case "cta":
      push("heading", s.heading);
      push("sub", s.sub);
      push("action.label", s.action.label);
      break;
    case "footer":
      push("brand", s.brand);
      push("note", s.note);
      break;
  }
  return out;
}

function motionChecks(spec: PageSpec): Violation[] {
  return validateMotionEnvelope(spec).map(
    (v: MotionViolation): Violation => ({
      code: `motion.${v.field}`,
      path: `sections.${v.sectionId}.motion.${v.field}`,
      message: v.message,
      severity: "error",
    })
  );
}

function structureChecks(spec: PageSpec): Violation[] {
  const violations: Violation[] = [];
  const heroes = spec.sections.filter((s) => s.type === "hero");
  const footers = spec.sections.filter((s) => s.type === "footer");

  if (heroes.length !== 1) {
    violations.push({
      code: "structure.hero_count",
      path: "sections",
      message: `page must contain exactly one hero section (found ${heroes.length})`,
      severity: "error",
    });
  }
  if (footers.length !== 1) {
    violations.push({
      code: "structure.footer_count",
      path: "sections",
      message: `page must contain exactly one footer section (found ${footers.length})`,
      severity: "error",
    });
  }

  // Hero must be first, footer last
  if (spec.sections.length > 0 && spec.sections[0].type !== "hero") {
    violations.push({
      code: "structure.hero_not_first",
      path: "sections[0]",
      message: "first section must be the hero",
      severity: "error",
    });
  }
  if (spec.sections.length > 0 && spec.sections[spec.sections.length - 1].type !== "footer") {
    violations.push({
      code: "structure.footer_not_last",
      path: `sections[${spec.sections.length - 1}]`,
      message: "last section must be the footer",
      severity: "error",
    });
  }

  // Hero must have real motion
  const hero = heroes[0];
  if (hero && hero.motion.entry === "none") {
    violations.push({
      code: "motion.hero_static",
      path: `sections.${hero.id}.motion.entry`,
      message: "hero section must have a non-none entry motion",
      severity: "error",
    });
  }

  // Three-equal-card horizontal feature row: exactly 3 items reads as Bootstrap slop.
  // DESIGN §8 bans this specifically — prefer 2, 4, or 5.
  spec.sections.forEach((s) => {
    if (s.type === "features" && s.items.length === 3) {
      violations.push({
        code: "structure.three_card_slop",
        path: `sections.${s.id}.items`,
        message:
          "three-equal-card feature row reads as Bootstrap slop (DESIGN §8). Use 2, 4, or 5 items, or switch to a bento grid.",
        severity: "error",
      });
    }
  });

  return violations;
}

function copyChecks(spec: PageSpec): Violation[] {
  const violations: Violation[] = [];

  for (const s of spec.sections) {
    for (const { path, text } of textFromSection(s)) {
      if (BANNED_CLICHE_RE.test(text)) {
        const hit = text.match(BANNED_CLICHE_RE)?.[0] ?? "";
        violations.push({
          code: "copy.banned_cliche",
          path,
          message: `copy contains banned cliché "${hit}" (DESIGN §7). Rewrite with a concrete, specific verb.`,
          severity: "error",
        });
      }
      if (BANNED_FILLER_RE.test(text)) {
        const hit = text.match(BANNED_FILLER_RE)?.[0] ?? "";
        violations.push({
          code: "copy.banned_filler_name",
          path,
          message: `copy contains placeholder filler "${hit}" (DESIGN §7). Generate a realistic contextual name.`,
          severity: "error",
        });
      }
      if (EMOJI_RE.test(text)) {
        violations.push({
          code: "copy.emoji",
          path,
          message: "emoji in copy — DESIGN §8 bans emoji anywhere in markup, labels, or alt text.",
          severity: "error",
        });
      }
      if (/lorem ipsum|dolor sit amet/i.test(text)) {
        violations.push({
          code: "copy.lorem_ipsum",
          path,
          message: "lorem ipsum detected — replace with real copy (DESIGN §8).",
          severity: "error",
        });
      }
    }
  }

  // Headline must not end with a period (DESIGN §7).
  for (const s of spec.sections) {
    if (s.type === "hero" && /\.\s*$/.test(s.headline)) {
      violations.push({
        code: "copy.headline_trailing_period",
        path: `sections.${s.id}.headline`,
        message: "hero headline ends with a period (DESIGN §7). Remove it.",
        severity: "warn",
      });
    }
  }

  // Eyebrow length cap (DESIGN §7).
  for (const s of spec.sections) {
    if (s.type === "hero" && s.eyebrow && s.eyebrow.length > 24) {
      violations.push({
        code: "copy.eyebrow_too_long",
        path: `sections.${s.id}.eyebrow`,
        message: `eyebrow "${s.eyebrow}" exceeds 24 characters (DESIGN §7). Tighten to a short, uppercase tag.`,
        severity: "error",
      });
    }
  }

  return violations;
}

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase();
}

function colorChecks(spec: PageSpec): Violation[] {
  const violations: Violation[] = [];
  const palette = spec.theme.palette;
  (["bg", "fg", "muted", "accent", "accent2"] as const).forEach((field) => {
    const v = palette[field];
    if (!v) return;
    if (BANNED_HEX_COLORS.has(normalizeHex(v))) {
      violations.push({
        code: "color.pure_anchor",
        path: `theme.palette.${field}`,
        message: `palette.${field} is ${v} — pure black/white is banned (DESIGN §4). Use a near-black (#111, #1C1917) or off-white (#F7F6F3, #FDFBF7).`,
        severity: "error",
      });
    }
  });
  return violations;
}

function themeChecks(spec: PageSpec): Violation[] {
  const violations: Violation[] = [];
  const display = spec.theme.typography.displayFont;
  if ((BANNED_DISPLAY_FONTS as readonly string[]).includes(display)) {
    violations.push({
      code: "theme.banned_display_font",
      path: "theme.typography.displayFont",
      message: `"${display}" is a banned display font (DESIGN §2). Use an editorial serif (Fraunces, Instrument Serif, Playfair Display) or a heavy sans (Archivo Black) for brutalist.`,
      severity: "error",
    });
  }
  return violations;
}

/**
 * Run every guardrail against a spec. Returns an empty array when clean.
 */
export function runGuardrails(spec: PageSpec): Violation[] {
  return [
    ...motionChecks(spec),
    ...structureChecks(spec),
    ...copyChecks(spec),
    ...colorChecks(spec),
    ...themeChecks(spec),
  ];
}

/**
 * Compose a corrective re-prompt body for the LLM. Follows
 * `full-output-enforcement` conventions: explicit, imperative, line by
 * line, no hedging. Re-states the rule that was broken and the fix.
 */
export function composeRepromptMessage(violations: Violation[]): string {
  if (violations.length === 0) {
    return "The prior output passed all guardrails; regenerate only if explicitly asked.";
  }
  const errors = violations.filter((v) => v.severity === "error");
  const warns = violations.filter((v) => v.severity === "warn");
  const lines: string[] = [];
  lines.push(
    "The prior PageSpec failed Silk's design-taste guardrails. Regenerate the entire PageSpec. Fix every item below. Do not apologize, do not explain — just emit a corrected `emit_page_spec` tool call."
  );
  lines.push("");
  lines.push("REQUIRED FIXES (errors):");
  if (errors.length === 0) {
    lines.push("- (none)");
  } else {
    errors.forEach((v, i) => {
      lines.push(`${i + 1}. [${v.code}] at \`${v.path}\`: ${v.message}`);
    });
  }
  if (warns.length > 0) {
    lines.push("");
    lines.push("Secondary (warnings — fix if trivially possible):");
    warns.forEach((v, i) => {
      lines.push(`${i + 1}. [${v.code}] at \`${v.path}\`: ${v.message}`);
    });
  }
  lines.push("");
  lines.push(
    "Non-negotiables to keep in mind: exactly one hero and one footer; hero must animate; no banned clichés or filler names; no pure #000/#FFF; motion duration 200–900ms; stagger 40–120ms; footer must be entry=\"none\"; ≤2 parallel entries per viewport."
  );
  return lines.join("\n");
}
