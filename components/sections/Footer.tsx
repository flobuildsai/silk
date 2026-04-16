"use client";

import type { z } from "zod";
import type { FooterSectionSchema } from "@/lib/pageSpec";
import { Reveal } from "@/components/motion";

type Props = { section: z.infer<typeof FooterSectionSchema> };

export function Footer({ section }: Props) {
  return (
    <Reveal spec={section.motion} as="footer" className="px-6 pb-16 pt-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-black/5 pt-8 text-sm text-ink-600">
        <span className="font-display text-lg text-ink-900">{section.brand}</span>
        <span>{section.note ?? `© ${new Date().getFullYear()} ${section.brand}`}</span>
      </div>
    </Reveal>
  );
}
