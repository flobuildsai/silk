"use client";

import type { z } from "zod";
import type { FeaturesSectionSchema, ArchetypeKey } from "@/lib/pageSpec";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { tokensFor } from "@/lib/archetypeTokens";
import { Icon, type IconName } from "@/components/Icon";

type Props = {
  section: z.infer<typeof FeaturesSectionSchema>;
  archetype?: ArchetypeKey;
};

function gridColsFor(count: number, archetype?: ArchetypeKey) {
  // We never allow 3 items (guardrail), so these are the real cases:
  if (count === 2) return "md:grid-cols-2";
  if (count === 4) return "md:grid-cols-2";
  if (count === 5) return "md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]";
  if (count === 6) return archetype === "industrial-brutalist" ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3";
  return "md:grid-cols-2";
}

export function Features({ section, archetype }: Props) {
  const t = tokensFor(archetype);
  const brutalist = archetype === "industrial-brutalist";
  return (
    <Reveal
      spec={section.motion}
      as="section"
      className={`px-6 ${t.sectionY}`}
    >
      <div className={t.container}>
        <div className="flex max-w-3xl flex-col gap-4">
          <h2 className={t.heading}>{section.heading}</h2>
        </div>
        <Stagger
          spec={section.motion}
          className={`mt-12 grid grid-cols-1 gap-5 ${gridColsFor(section.items.length, archetype)}`}
        >
          {section.items.map((item, i) => (
            <StaggerItem
              key={i}
              spec={section.motion}
              className={`${t.card} ${brutalist ? "font-mono" : ""}`}
            >
              <div
                className={`mb-5 inline-flex h-10 w-10 items-center justify-center ${
                  brutalist
                    ? "border border-[color:var(--fg)]"
                    : "rounded-full bg-[color:var(--fg)] text-[color:var(--bg)]"
                }`}
              >
                <Icon name={item.icon as IconName} />
              </div>
              <h3
                className={`${
                  brutalist
                    ? "font-mono uppercase tracking-wider text-base"
                    : "font-display text-xl md:text-2xl tracking-[-0.01em]"
                }`}
              >
                {item.title}
              </h3>
              <p className={`mt-2.5 text-sm leading-relaxed ${t.muted}`}>
                {item.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Reveal>
  );
}
