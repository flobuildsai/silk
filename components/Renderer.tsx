"use client";

import type { PageSpec } from "@/lib/pageSpec";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Gallery } from "@/components/sections/Gallery";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import { resolveFontVar } from "@/lib/fonts";

export function Renderer({ spec }: { spec: PageSpec }) {
  const { palette, typography } = spec.theme;
  const archetype = spec.archetype ?? "minimalist-ui";

  // Fallbacks preserve the default Geist + Fraunces stack when a name
  // doesn't resolve. The renderer only ever reads --font-display and
  // --font-sans — Tailwind's font-display/font-sans classes bind to these.
  const displayVar = resolveFontVar(typography.displayFont, "var(--font-fraunces)");
  const bodyVar = resolveFontVar(typography.bodyFont, "var(--font-geist)");

  const cssVars = {
    "--bg": palette.bg,
    "--fg": palette.fg,
    "--muted": palette.muted,
    "--accent": palette.accent,
    "--accent2": palette.accent2 ?? palette.accent,
    "--font-display": `${displayVar}, "Georgia", serif`,
    "--font-sans": `${bodyVar}, "ui-sans-serif", system-ui, sans-serif`,
  } as React.CSSProperties;

  return (
    <main
      data-archetype={archetype}
      style={{
        ...cssVars,
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-sans)",
      }}
      className={`silk-render min-h-screen silk-${archetype}`}
    >
      {spec.sections.map((section) => {
        switch (section.type) {
          case "hero":
            return <Hero key={section.id} section={section} archetype={archetype} />;
          case "features":
            return <Features key={section.id} section={section} archetype={archetype} />;
          case "gallery":
            return <Gallery key={section.id} section={section} archetype={archetype} />;
          case "cta":
            return <CTA key={section.id} section={section} archetype={archetype} />;
          case "footer":
            return <Footer key={section.id} section={section} archetype={archetype} />;
        }
      })}
    </main>
  );
}
