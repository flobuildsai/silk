"use client";

import type { z } from "zod";
import type { GallerySectionSchema, ArchetypeKey } from "@/lib/pageSpec";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { tokensFor } from "@/lib/archetypeTokens";

type Props = {
  section: z.infer<typeof GallerySectionSchema>;
  archetype?: ArchetypeKey;
};

function tileStyle(archetype: ArchetypeKey | undefined, tint: string): React.CSSProperties {
  if (archetype === "industrial-brutalist") {
    // Swiss-print: stark bg with accent strip; telemetry: dark cell with hairline.
    return {
      background: "color-mix(in srgb, var(--fg) 4%, var(--bg))",
      borderColor: "color-mix(in srgb, var(--fg) 25%, transparent)",
    };
  }
  if (archetype === "editorial-luxury") {
    const map: Record<string, string> = {
      warm: "color-mix(in srgb, var(--accent) 14%, var(--bg))",
      cool: "color-mix(in srgb, var(--accent2, var(--fg)) 10%, var(--bg))",
      mono: "color-mix(in srgb, var(--fg) 8%, var(--bg))",
    };
    return { background: map[tint] ?? map.mono };
  }
  const map: Record<string, string> = {
    warm: "color-mix(in srgb, var(--accent) 18%, var(--bg))",
    cool: "color-mix(in srgb, var(--accent2, var(--fg)) 14%, var(--bg))",
    mono: "color-mix(in srgb, var(--fg) 6%, var(--bg))",
  };
  return { background: map[tint] ?? map.mono };
}

export function Gallery({ section, archetype }: Props) {
  const t = tokensFor(archetype);
  const brutalist = archetype === "industrial-brutalist";
  const radius =
    archetype === "editorial-luxury"
      ? "rounded-[1.75rem]"
      : brutalist
      ? "rounded-none"
      : "rounded-2xl";
  return (
    <Reveal spec={section.motion} as="section" className={`px-6 ${t.sectionY}`}>
      <div className={t.container}>
        {section.heading && (
          <h2 className={`mb-10 ${t.heading}`}>{section.heading}</h2>
        )}
        <Stagger
          spec={section.motion}
          className="grid grid-cols-2 gap-4 md:grid-cols-3"
        >
          {section.tiles.map((tile, i) => (
            <StaggerItem
              key={i}
              spec={section.motion}
              className={`aspect-[4/5] overflow-hidden ${radius} ${
                brutalist ? "border" : ""
              } p-5`}
              style={tileStyle(archetype, tile.tint)}
            >
              <div className="flex h-full flex-col justify-end">
                <span
                  className={
                    brutalist
                      ? "font-mono text-[11px] uppercase tracking-[0.22em]"
                      : "text-xs uppercase tracking-[0.18em] opacity-75"
                  }
                >
                  {tile.label}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Reveal>
  );
}
