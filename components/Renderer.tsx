"use client";

import type { PageSpec } from "@/lib/pageSpec";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Gallery } from "@/components/sections/Gallery";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export function Renderer({ spec }: { spec: PageSpec }) {
  const { palette } = spec.theme;
  const cssVars = {
    "--bg": palette.bg,
    "--fg": palette.fg,
    "--muted": palette.muted,
    "--accent": palette.accent,
    "--accent2": palette.accent2 ?? palette.accent,
  } as React.CSSProperties;

  return (
    <main
      style={{ ...cssVars, background: "var(--bg)", color: "var(--fg)" }}
      className="min-h-screen"
    >
      {spec.sections.map((section) => {
        switch (section.type) {
          case "hero":
            return <Hero key={section.id} section={section} />;
          case "features":
            return <Features key={section.id} section={section} />;
          case "gallery":
            return <Gallery key={section.id} section={section} />;
          case "cta":
            return <CTA key={section.id} section={section} />;
          case "footer":
            return <Footer key={section.id} section={section} />;
        }
      })}
    </main>
  );
}
