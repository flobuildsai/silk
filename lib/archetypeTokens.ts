import type { ArchetypeKey } from "@/lib/pageSpec";

/**
 * Per-archetype className tokens. Sections read these so typography,
 * spacing, borders, and CTA shape match the archetype without forking
 * each section by type. Kept to className strings so Tailwind's JIT
 * can pick them up at build.
 */
export type ArchetypeTokens = {
  /** Section vertical rhythm. */
  sectionY: string;
  /** Body text color class. */
  body: string;
  /** Muted text color class. */
  muted: string;
  /** Hero headline classes (font, size, tracking, line-height, case). */
  headline: string;
  /** Section heading classes (features, gallery, cta). */
  heading: string;
  /** Eyebrow chip/label classes. */
  eyebrow: string;
  /** Card container classes (features, gallery tiles). */
  card: string;
  /** Primary CTA classes. */
  ctaPrimary: string;
  /** Ghost CTA classes. */
  ctaGhost: string;
  /** Divider utility for hairlines. */
  hairline: string;
  /** Max-width container. */
  container: string;
};

const SHARED_CONTAINER = "mx-auto max-w-6xl";

export const ARCHETYPE_TOKENS: Record<ArchetypeKey, ArchetypeTokens> = {
  "minimalist-ui": {
    sectionY: "py-24 md:py-32",
    body: "text-[color:var(--fg)]",
    muted: "text-[color:var(--muted)]",
    headline:
      "font-display text-5xl md:text-7xl leading-[1.04] tracking-[-0.02em]",
    heading:
      "font-display text-3xl md:text-5xl leading-[1.08] tracking-[-0.015em]",
    eyebrow:
      "inline-flex items-center rounded-full border border-black/10 bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)] backdrop-blur",
    card:
      "rounded-2xl border border-black/[0.08] bg-white/80 p-7 transition hover:-translate-y-0.5 hover:border-black/15",
    ctaPrimary:
      "inline-flex items-center gap-2 rounded-md bg-[color:var(--fg)] px-6 py-3 text-sm font-medium text-[color:var(--bg)] transition active:scale-[0.98] hover:-translate-y-[1px]",
    ctaGhost:
      "inline-flex items-center gap-2 rounded-md border border-black/15 px-6 py-3 text-sm font-medium text-[color:var(--fg)] transition hover:border-black/30",
    hairline: "border-black/[0.08]",
    container: SHARED_CONTAINER,
  },

  "editorial-luxury": {
    sectionY: "py-28 md:py-40",
    body: "text-[color:var(--fg)]",
    muted: "text-[color:var(--muted)]",
    headline:
      "font-display text-[clamp(2.75rem,7.5vw,6.5rem)] leading-[1.01] tracking-[-0.035em]",
    heading:
      "font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em]",
    eyebrow:
      "inline-flex items-center rounded-full border border-[color:var(--fg)]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]",
    card:
      "rounded-[2rem] border border-[color:var(--fg)]/10 bg-[color:var(--bg)] p-1.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5",
    ctaPrimary:
      "group inline-flex items-center gap-3 rounded-full bg-[color:var(--fg)] py-3 pl-6 pr-2 text-sm text-[color:var(--bg)] transition active:scale-[0.98] hover:-translate-y-[1px]",
    ctaGhost:
      "inline-flex items-center gap-3 rounded-full border border-[color:var(--fg)]/20 px-6 py-3 text-sm text-[color:var(--fg)] transition hover:border-[color:var(--fg)]/45",
    hairline: "border-[color:var(--fg)]/12",
    container: SHARED_CONTAINER,
  },

  "industrial-brutalist": {
    sectionY: "py-20 md:py-28",
    body: "text-[color:var(--fg)]",
    muted: "text-[color:var(--muted)]",
    headline:
      "font-display uppercase text-[clamp(3rem,11vw,10rem)] leading-[0.88] tracking-[-0.04em]",
    heading:
      "font-display uppercase text-3xl md:text-5xl leading-[0.9] tracking-[-0.03em]",
    eyebrow:
      "inline-flex items-center gap-2 border border-[color:var(--fg)] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[color:var(--fg)] font-mono",
    card:
      "border border-[color:var(--fg)]/25 bg-[color:var(--bg)] p-7 transition hover:border-[color:var(--fg)]",
    ctaPrimary:
      "inline-flex items-center gap-2 bg-[color:var(--accent)] px-6 py-3 text-xs font-mono uppercase tracking-[0.2em] text-white transition active:scale-[0.98]",
    ctaGhost:
      "inline-flex items-center gap-2 border border-[color:var(--fg)] px-6 py-3 text-xs font-mono uppercase tracking-[0.2em] text-[color:var(--fg)] transition hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)]",
    hairline: "border-[color:var(--fg)]/20",
    container: SHARED_CONTAINER,
  },
};

export function tokensFor(archetype: ArchetypeKey | undefined): ArchetypeTokens {
  return ARCHETYPE_TOKENS[archetype ?? "minimalist-ui"];
}
