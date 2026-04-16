"use client";

import type { z } from "zod";
import type { CTASectionSchema, ArchetypeKey } from "@/lib/pageSpec";
import { Reveal } from "@/components/motion";
import { tokensFor } from "@/lib/archetypeTokens";

type Props = {
  section: z.infer<typeof CTASectionSchema>;
  archetype?: ArchetypeKey;
};

export function CTA({ section, archetype }: Props) {
  const t = tokensFor(archetype);
  const brutalist = archetype === "industrial-brutalist";
  const radius = brutalist ? "" : archetype === "editorial-luxury" ? "rounded-[2rem]" : "rounded-3xl";
  return (
    <Reveal spec={section.motion} as="section" className={`px-6 ${t.sectionY}`}>
      <div
        className={`mx-auto max-w-4xl ${radius} px-8 py-16 md:px-16 md:py-24 text-left`}
        style={{
          background: brutalist ? "var(--bg)" : "var(--fg)",
          color: brutalist ? "var(--fg)" : "var(--bg)",
          border: brutalist ? "1px solid var(--fg)" : "none",
        }}
      >
        <h2 className={`${t.heading}`} style={{ color: brutalist ? "var(--fg)" : "var(--bg)" }}>
          {section.heading}
        </h2>
        {section.sub && (
          <p
            className="mt-4 max-w-xl text-base md:text-lg leading-relaxed"
            style={{ color: brutalist ? "var(--muted)" : "color-mix(in srgb, var(--bg) 72%, transparent)" }}
          >
            {section.sub}
          </p>
        )}
        <div className="mt-10">
          <a
            href={section.action.href}
            className={
              brutalist
                ? "inline-flex items-center gap-2 bg-[color:var(--accent)] px-6 py-3 text-xs font-mono uppercase tracking-[0.2em] text-white transition active:scale-[0.98]"
                : "group inline-flex items-center gap-3 rounded-full bg-[color:var(--bg)] py-3 pl-6 pr-2 text-sm text-[color:var(--fg)] transition active:scale-[0.98] hover:-translate-y-[1px]"
            }
          >
            <span>{section.action.label}</span>
            {!brutalist && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </a>
        </div>
      </div>
    </Reveal>
  );
}
