import type { PageSpec } from "@/lib/pageSpec";

export const landing: PageSpec = {
  version: 1,
  archetype: "editorial-luxury",
  meta: {
    title: "Nocturne — a journaling app that writes with you",
    description: "A calm, AI-assisted journal that turns scattered thoughts into clarity.",
  },
  theme: {
    palette: {
      bg: "#F7F3EC",
      fg: "#171717",
      muted: "#6A6A66",
      accent: "#A34560",
      accent2: "#1B2A4E",
    },
    typography: {
      displayFont: "Fraunces",
      bodyFont: "Geist",
      scale: "editorial",
    },
    radius: "lg",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      motion: { entry: "fade-up", durationMs: 600, delayMs: 0, easing: "easeOut", staggerMs: 80 },
      eyebrow: "Now in beta",
      headline: "Write the thoughts you couldn't say out loud.",
      sub: "Nocturne is a quiet journal with a gentle AI companion. It listens, asks better questions, and helps you find the shape of what you feel.",
      ctas: [
        { label: "Start writing", href: "#get-started", variant: "primary" },
        { label: "See a demo", href: "#demo", variant: "ghost" },
      ],
      media: { kind: "gradient-orb" },
    },
    {
      id: "features",
      type: "features",
      motion: { entry: "stagger", durationMs: 520, delayMs: 0, easing: "easeOut", staggerMs: 70 },
      heading: "Designed for the things we only say at midnight.",
      items: [
        {
          title: "Ask, don't autocomplete",
          body: "Nocturne asks one careful question at a time. No summaries, no performance — just quiet forward motion.",
          icon: "sparkles",
        },
        {
          title: "Private by default",
          body: "End-to-end encrypted entries, on-device transcription, and a panic-wipe that actually works.",
          icon: "shield",
        },
        {
          title: "Patterns, not metrics",
          body: "No streaks, no scores. Nocturne surfaces recurring themes across months — the things worth noticing.",
          icon: "grid",
        },
        {
          title: "Written, not tracked",
          body: "Nocturne never sells attention. No streak nudges, no retention emails — the only person pulling you back is you.",
          icon: "globe",
        },
      ],
    },
    {
      id: "gallery",
      type: "gallery",
      motion: { entry: "fade", durationMs: 480, delayMs: 0, easing: "easeOut", staggerMs: 60 },
      heading: "A journal that feels like paper.",
      tiles: [
        { label: "Morning pages", tint: "warm" },
        { label: "Voice memos", tint: "cool" },
        { label: "Weekly review", tint: "mono" },
        { label: "Themes", tint: "warm" },
        { label: "Private", tint: "cool" },
        { label: "Offline", tint: "mono" },
      ],
    },
    {
      id: "cta",
      type: "cta",
      motion: { entry: "fade-up", durationMs: 520, delayMs: 0, easing: "backOut", staggerMs: 60 },
      heading: "Start with five minutes tonight.",
      sub: "Invite-only beta. We're letting a few hundred writers in each week.",
      action: { label: "Request an invite", href: "#invite" },
    },
    {
      id: "footer",
      type: "footer",
      motion: { entry: "none", durationMs: 200, delayMs: 0, easing: "easeOut", staggerMs: 0 },
      brand: "Nocturne",
      note: "Made quietly in Berlin.",
    },
  ],
};
