export type ArchetypeKey = "minimalist-ui" | "editorial-luxury" | "industrial-brutalist";

export type Archetype = {
  key: ArchetypeKey;
  label: string;
  hint: string;
  starter: string;
  directive: string;
};

export const ARCHETYPES: Archetype[] = [
  {
    key: "minimalist-ui",
    label: "Minimalist",
    hint: "Editorial SaaS · restraint as virtue",
    starter:
      "A calm landing page for Marginalia, a reading app that turns long articles into a weekly digest. Warm off-white canvas, quiet type, one restrained accent. No growth-hack copy.",
    directive:
      "Archetype: minimalist-ui. Warm off-white canvas (#F7F6F3 or #FFFFFF), body ink #2F3437, one restrained accent ≤ 80% saturation. Display in Instrument Serif or Newsreader; body in Geist Sans. Features must have 2, 4, or 5 items — never 3. Motion 400–700ms, translate ≤ 16px.",
  },
  {
    key: "editorial-luxury",
    label: "Editorial",
    hint: "Agency-tier · warm cream · haptic",
    starter:
      "A single-page site for Foyer, a ceramics studio in Porto that takes two commissions a month. Cream canvas, warm ink, espresso accent, serif display. The site should read like the studio: slow, confident, and exact.",
    directive:
      "Archetype: editorial-luxury. Cream canvas (#FDFBF7 or #F5F1EA), ink #1C1917, one deep accent (espresso #3B2A22, muted sage #7C8B72, or rose #A34560). Display in PP Editorial New or Playfair Display; body Geist Sans or Satoshi. Motion 700–1000ms with optional 8–12px blur-in resolving to 0. Double-bezel cards.",
  },
  {
    key: "industrial-brutalist",
    label: "Industrial",
    hint: "Swiss-print · tactical telemetry",
    starter:
      "A one-page manifesto for Kiln Systems, an infra team shipping a deterministic build cache. Tactical telemetry vibe: near-black background, uppercase mono labels, aviation-red accent used once. No hero orb.",
    directive:
      "Archetype: industrial-brutalist. Pick ONE substrate and commit: either Swiss Print (#F4F4F0 bg, #050505 fg) or Tactical Telemetry (#0A0A0A bg, #EAEAEA fg). Accent aviation red #E61919 used sparingly. Display Archivo Black UPPERCASE, body Neue Haas Grotesk. Motion 120–300ms, snap transitions, no blur, no float.",
  },
];

export function findArchetype(key: string | undefined | null): Archetype {
  return ARCHETYPES.find((a) => a.key === key) ?? ARCHETYPES[0];
}
