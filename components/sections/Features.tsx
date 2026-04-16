"use client";

import type { z } from "zod";
import type { FeaturesSectionSchema } from "@/lib/pageSpec";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

type Props = { section: z.infer<typeof FeaturesSectionSchema> };

const ICON: Record<string, string> = {
  sparkles: "✦",
  bolt: "⚡",
  grid: "▦",
  wand: "✺",
  globe: "◐",
  shield: "◆",
};

export function Features({ section }: Props) {
  return (
    <Reveal spec={section.motion} as="section" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl leading-tight tracking-tight md:text-5xl">
          {section.heading}
        </h2>
        <Stagger
          spec={section.motion}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {section.items.map((item, i) => (
            <StaggerItem
              key={i}
              spec={section.motion}
              className="group rounded-2xl border border-black/5 bg-white/70 p-6 shadow-soft backdrop-blur transition hover:-translate-y-0.5"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-lg text-white">
                {ICON[item.icon] ?? "✦"}
              </div>
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Reveal>
  );
}
