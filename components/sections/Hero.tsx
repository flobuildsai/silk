"use client";

import type { z } from "zod";
import type { HeroSectionSchema, ArchetypeKey } from "@/lib/pageSpec";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { tokensFor } from "@/lib/archetypeTokens";

type Props = {
  section: z.infer<typeof HeroSectionSchema>;
  archetype?: ArchetypeKey;
};

export function Hero({ section, archetype }: Props) {
  const t = tokensFor(archetype);
  const brutalist = archetype === "industrial-brutalist";
  return (
    <Reveal
      spec={section.motion}
      as="section"
      className={`relative overflow-hidden px-6 ${t.sectionY} pt-[calc(2rem+env(safe-area-inset-top))]`}
    >
      {section.media.kind === "gradient-orb" && !brutalist && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(closest-side, var(--accent) 0%, transparent 72%)",
          }}
        />
      )}
      {brutalist && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-0 h-[2px]"
          style={{ background: "var(--fg)" }}
        />
      )}
      <Stagger
        spec={section.motion}
        className={`relative ${t.container} ${
          archetype === "editorial-luxury" ? "max-w-5xl text-left" : "max-w-5xl text-left"
        }`}
      >
        {section.eyebrow && (
          <StaggerItem spec={section.motion} className="mb-8">
            <span className={t.eyebrow}>{section.eyebrow}</span>
          </StaggerItem>
        )}
        <StaggerItem spec={section.motion}>
          <h1 className={t.headline}>{section.headline}</h1>
        </StaggerItem>
        {section.sub && (
          <StaggerItem spec={section.motion} className="mt-7 md:mt-9">
            <p
              className={`max-w-2xl text-lg md:text-xl leading-relaxed ${t.muted}`}
            >
              {section.sub}
            </p>
          </StaggerItem>
        )}
        {section.ctas.length > 0 && (
          <StaggerItem
            spec={section.motion}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            {section.ctas.map((c, i) => {
              const primary = c.variant === "primary";
              return (
                <a
                  key={i}
                  href={c.href}
                  className={primary ? t.ctaPrimary : t.ctaGhost}
                >
                  <span>{c.label}</span>
                  {primary && archetype === "editorial-luxury" && (
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 transition group-hover:translate-x-0.5 group-hover:-translate-y-[1px]"
                      aria-hidden
                    >
                      <Arrow />
                    </span>
                  )}
                </a>
              );
            })}
          </StaggerItem>
        )}
      </Stagger>
    </Reveal>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
