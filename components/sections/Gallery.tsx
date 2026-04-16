"use client";

import type { z } from "zod";
import type { GallerySectionSchema } from "@/lib/pageSpec";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

type Props = { section: z.infer<typeof GallerySectionSchema> };

const TINTS: Record<string, string> = {
  warm: "from-amber-200 via-rose-200 to-orange-300",
  cool: "from-sky-200 via-indigo-200 to-violet-300",
  mono: "from-neutral-200 via-neutral-300 to-neutral-400",
};

export function Gallery({ section }: Props) {
  return (
    <Reveal spec={section.motion} as="section" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        {section.heading && (
          <h2 className="mb-10 font-display text-3xl leading-tight tracking-tight md:text-4xl">
            {section.heading}
          </h2>
        )}
        <Stagger
          spec={section.motion}
          className="grid grid-cols-2 gap-4 md:grid-cols-3"
        >
          {section.tiles.map((t, i) => (
            <StaggerItem
              key={i}
              spec={section.motion}
              className={`aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br ${TINTS[t.tint]} p-5 shadow-soft`}
            >
              <div className="flex h-full flex-col justify-end">
                <span className="text-xs uppercase tracking-[0.16em] text-ink-900/70">
                  {t.label}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Reveal>
  );
}
