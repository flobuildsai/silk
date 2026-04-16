"use client";

import type { z } from "zod";
import type { HeroSectionSchema } from "@/lib/pageSpec";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

type Props = { section: z.infer<typeof HeroSectionSchema> };

export function Hero({ section }: Props) {
  return (
    <Reveal
      spec={section.motion}
      as="section"
      className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-36 md:pb-28"
    >
      {section.media.kind === "gradient-orb" && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(closest-side, var(--accent) 0%, transparent 70%)",
          }}
        />
      )}
      <Stagger spec={section.motion} className="relative mx-auto max-w-4xl text-center">
        {section.eyebrow && (
          <StaggerItem spec={section.motion} className="mb-6">
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-600 backdrop-blur">
              {section.eyebrow}
            </span>
          </StaggerItem>
        )}
        <StaggerItem spec={section.motion}>
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
            {section.headline}
          </h1>
        </StaggerItem>
        {section.sub && (
          <StaggerItem spec={section.motion} className="mt-6">
            <p className="mx-auto max-w-2xl text-lg text-ink-600 md:text-xl">
              {section.sub}
            </p>
          </StaggerItem>
        )}
        {section.ctas.length > 0 && (
          <StaggerItem spec={section.motion} className="mt-10 flex items-center justify-center gap-3">
            {section.ctas.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className={
                  c.variant === "primary"
                    ? "rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-soft"
                    : "rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-ink-900 transition hover:bg-white"
                }
              >
                {c.label}
              </a>
            ))}
          </StaggerItem>
        )}
      </Stagger>
    </Reveal>
  );
}
