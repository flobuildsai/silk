"use client";

import type { z } from "zod";
import type { CTASectionSchema } from "@/lib/pageSpec";
import { Reveal } from "@/components/motion";

type Props = { section: z.infer<typeof CTASectionSchema> };

export function CTA({ section }: Props) {
  return (
    <Reveal spec={section.motion} as="section" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl rounded-3xl border border-black/5 bg-ink-900 p-10 text-center text-white shadow-soft md:p-16">
        <h2 className="font-display text-3xl leading-tight md:text-5xl">{section.heading}</h2>
        {section.sub && <p className="mt-4 text-white/70 md:text-lg">{section.sub}</p>}
        <a
          href={section.action.href}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-ink-900 transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          {section.action.label}
        </a>
      </div>
    </Reveal>
  );
}
