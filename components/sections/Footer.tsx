"use client";

import type { z } from "zod";
import type { FooterSectionSchema, ArchetypeKey } from "@/lib/pageSpec";
import { Reveal } from "@/components/motion";
import { tokensFor } from "@/lib/archetypeTokens";

type Props = {
  section: z.infer<typeof FooterSectionSchema>;
  archetype?: ArchetypeKey;
};

export function Footer({ section, archetype }: Props) {
  const t = tokensFor(archetype);
  const brutalist = archetype === "industrial-brutalist";
  return (
    <Reveal spec={section.motion} as="footer" className="px-6 pb-16 pt-10">
      <div
        className={`${t.container} flex flex-wrap items-center justify-between gap-3 border-t pt-8 text-sm ${t.muted}`}
        style={{ borderColor: "color-mix(in srgb, var(--fg) 10%, transparent)" }}
      >
        <span
          className={
            brutalist
              ? "font-mono text-sm uppercase tracking-[0.22em] text-[color:var(--fg)]"
              : "font-display text-lg tracking-[-0.01em] text-[color:var(--fg)]"
          }
        >
          {section.brand}
        </span>
        <span className={brutalist ? "font-mono text-xs uppercase tracking-[0.2em]" : ""}>
          {section.note ?? `© ${new Date().getFullYear()} ${section.brand}`}
        </span>
      </div>
    </Reveal>
  );
}
