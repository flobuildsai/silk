import type { PageSpec } from "@/lib/pageSpec";

export const portfolio: PageSpec = {
  version: 1,
  meta: {
    title: "Ines Martel — independent designer",
    description: "Brand and product design for ambitious small teams.",
  },
  theme: {
    palette: {
      bg: "#0E0E10",
      fg: "#F5F3EE",
      muted: "#9A968E",
      accent: "#E8E1D0",
      accent2: "#B9A77F",
    },
    typography: {
      displayFont: "Instrument Serif",
      bodyFont: "Inter",
      scale: "oversized",
    },
    radius: "sm",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      motion: { entry: "reveal", durationMs: 720, delayMs: 0, easing: "circOut", staggerMs: 80 },
      eyebrow: "Independent — Q3 slots",
      headline: "Brand, identity, and product for teams that sweat the details.",
      sub: "Ten years across editorial, fintech, and climate. I ship work that reads like writing and feels like object design.",
      ctas: [
        { label: "See selected work", href: "#work", variant: "primary" },
        { label: "Say hello", href: "mailto:hi@inesmartel.com", variant: "ghost" },
      ],
      media: { kind: "none" },
    },
    {
      id: "gallery",
      type: "gallery",
      motion: { entry: "stagger", durationMs: 520, delayMs: 0, easing: "easeOut", staggerMs: 70 },
      heading: "Selected work",
      tiles: [
        { label: "Foyer — brand", tint: "warm" },
        { label: "Slate — product", tint: "mono" },
        { label: "Rook — editorial", tint: "cool" },
        { label: "Harbor — identity", tint: "warm" },
        { label: "Kiln — packaging", tint: "mono" },
        { label: "Weft — type", tint: "cool" },
      ],
    },
    {
      id: "features",
      type: "features",
      motion: { entry: "fade-up", durationMs: 520, delayMs: 0, easing: "easeOut", staggerMs: 60 },
      heading: "How I work",
      items: [
        {
          title: "Small teams, whole problems",
          body: "I take one engagement at a time, embedded for four to eight weeks. Brand and product together, or not at all.",
          icon: "wand",
        },
        {
          title: "Object, not deck",
          body: "Deliverables are working artifacts — real screens, real packaging, real type — not slides pretending to be design.",
          icon: "grid",
        },
      ],
    },
    {
      id: "cta",
      type: "cta",
      motion: { entry: "fade", durationMs: 480, delayMs: 0, easing: "easeOut", staggerMs: 60 },
      heading: "Booking Q3 2026.",
      sub: "Two slots left. Quiet intros preferred.",
      action: { label: "Start a conversation", href: "mailto:hi@inesmartel.com" },
    },
    {
      id: "footer",
      type: "footer",
      motion: { entry: "none", durationMs: 200, delayMs: 0, easing: "easeOut", staggerMs: 0 },
      brand: "Ines Martel",
      note: "Studio of one. Based in Lisbon.",
    },
  ],
};
