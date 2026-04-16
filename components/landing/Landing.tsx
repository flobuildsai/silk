"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Marquee } from "@/components/motion/Marquee";
import type { MotionSpec } from "@/lib/pageSpec";

const heroMotion: MotionSpec = {
  entry: "fade-up",
  durationMs: 800,
  delayMs: 0,
  easing: "easeOut",
  staggerMs: 90,
};

const sectionMotion: MotionSpec = {
  entry: "fade-up",
  durationMs: 700,
  delayMs: 0,
  easing: "easeOut",
  staggerMs: 80,
};

const staggerMotion: MotionSpec = {
  entry: "stagger",
  durationMs: 600,
  delayMs: 0,
  easing: "easeOut",
  staggerMs: 80,
};

const PROMPT_SUGGESTIONS = [
  "A reading app that turns long articles into weekly digests",
  "Ceramics studio in Porto, two commissions a month",
  "A deterministic build cache for infra teams",
  "Quiet journaling app that asks better questions",
  "Indie design studio booking Q3 2026",
];

export function Landing() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState(PROMPT_SUGGESTIONS[0]);
  const reduce = useReducedMotion();

  // Rotate placeholder ideas every ~4s so the input feels alive.
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      setSuggestionIndex((i) => (i + 1) % PROMPT_SUGGESTIONS.length);
    }, 4200);
    return () => window.clearInterval(t);
  }, [reduce]);

  useEffect(() => {
    setPlaceholder(PROMPT_SUGGESTIONS[suggestionIndex]);
  }, [suggestionIndex]);

  const submit = useCallback(
    (value?: string) => {
      const text = (value ?? prompt).trim();
      const qs = text ? `?prompt=${encodeURIComponent(text)}` : "";
      router.push(`/studio${qs}`);
    },
    [prompt, router]
  );

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  return (
    <main className="silk-landing relative min-h-[100dvh] overflow-hidden bg-[#F5F1EA] text-[#1C1917]">
      <AmbientOrbs />
      <Nav />
      <HeroBlock
        prompt={prompt}
        placeholder={placeholder}
        onChange={setPrompt}
        onKey={onKey}
        onSubmit={submit}
        onTrySuggestion={submit}
      />
      <MarqueeBand />
      <HowItWorks />
      <ArchetypeCards />
      <ProofStrip />
      <EndCTA onSubmit={submit} />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <Reveal spec={{ ...heroMotion, durationMs: 500 }} as="header" className="relative z-30">
      <div className="mx-auto mt-6 flex w-[min(94%,1200px)] items-center justify-between rounded-full border border-black/[0.08] bg-white/70 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Wordmark />
          <span className="hidden text-[10px] uppercase tracking-[0.24em] text-black/50 sm:inline">
            prompt → animated website
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="hidden rounded-full px-4 py-2 text-[13px] text-black/70 transition hover:text-black sm:inline-flex"
          >
            Demo
          </Link>
          <Link
            href="/studio"
            className="group inline-flex items-center gap-2 rounded-full bg-[#1C1917] py-2 pl-4 pr-2 text-[13px] text-[#F5F1EA] transition active:scale-[0.98] hover:-translate-y-[1px]"
          >
            Open studio
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/12 transition group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

function HeroBlock({
  prompt,
  placeholder,
  onChange,
  onKey,
  onSubmit,
  onTrySuggestion,
}: {
  prompt: string;
  placeholder: string;
  onChange: (v: string) => void;
  onKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onTrySuggestion: (v: string) => void;
}) {
  return (
    <section className="relative z-20 px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      <Stagger spec={heroMotion} className="mx-auto max-w-5xl">
        <StaggerItem spec={heroMotion}>
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-black/60 backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#A34560" }}
            />
            v0 · in private beta
          </span>
        </StaggerItem>
        <StaggerItem spec={heroMotion} className="mt-8">
          <h1 className="font-display text-[clamp(2.75rem,7.2vw,6.75rem)] leading-[0.98] tracking-[-0.035em] text-[#1C1917]">
            Describe a site.
            <br />
            <span className="italic text-[#A34560]">See it</span> come to life.
          </h1>
        </StaggerItem>
        <StaggerItem spec={heroMotion} className="mt-7">
          <p className="max-w-2xl text-lg leading-relaxed text-black/65 md:text-xl">
            Silk turns one paragraph into a polished, animated landing page.
            Pick an archetype — minimalist, editorial, industrial — and host
            the result in a click. No templates. No slop.
          </p>
        </StaggerItem>
        <StaggerItem spec={heroMotion} className="mt-10">
          <PromptBox
            prompt={prompt}
            placeholder={placeholder}
            onChange={onChange}
            onKey={onKey}
            onSubmit={onSubmit}
          />
        </StaggerItem>
        <StaggerItem spec={heroMotion} className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-black/50">
            Try
          </span>
          {PROMPT_SUGGESTIONS.slice(0, 3).map((s) => (
            <button
              key={s}
              onClick={() => onTrySuggestion(s)}
              className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs text-black/70 transition hover:border-black/25 hover:text-black"
            >
              {truncate(s, 40)}
            </button>
          ))}
        </StaggerItem>
      </Stagger>
    </section>
  );
}

function PromptBox({
  prompt,
  placeholder,
  onChange,
  onKey,
  onSubmit,
}: {
  prompt: string;
  placeholder: string;
  onChange: (v: string) => void;
  onKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-black/[0.08] bg-white/70 p-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.22)] backdrop-blur-md">
      <div className="flex flex-col gap-2 rounded-[1.5rem] bg-white/80 p-2 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 pl-4">
          <PromptIcon />
          <input
            value={prompt}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            className="w-full bg-transparent py-3 font-display text-[17px] leading-relaxed text-[#1C1917] placeholder:text-black/40 focus:outline-none"
            aria-label="Describe the site you want to build"
            autoFocus
          />
        </div>
        <MagneticSubmit onSubmit={onSubmit} />
      </div>
      <div className="flex items-center justify-between px-4 pb-1 pt-2 text-[11px] uppercase tracking-[0.2em] text-black/45">
        <span>press enter to generate</span>
        <span>~ 12 seconds · editorial default</span>
      </div>
    </div>
  );
}

function MagneticSubmit({ onSubmit }: { onSubmit: () => void }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 20 });
  const sy = useSpring(my, { stiffness: 220, damping: 20 });
  const x = useTransform(sx, (v) => v * 0.25);
  const y = useTransform(sy, (v) => v * 0.25);
  const reduce = useReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(e.clientX - (r.left + r.width / 2));
    my.set(e.clientY - (r.top + r.height / 2));
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onSubmit}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#1C1917] py-2 pl-6 pr-2 text-sm text-[#F5F1EA] transition active:scale-[0.98]"
    >
      <span>Generate</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 transition group-hover:translate-x-0.5">
        <ArrowIcon />
      </span>
    </motion.button>
  );
}

function MarqueeBand() {
  const items = [
    "editorial luxury",
    "minimalist UI",
    "tactical telemetry",
    "swiss print",
    "warm cream",
    "near-black",
    "serif display",
    "fraunces",
    "newsreader",
    "archivo black",
  ];
  return (
    <div className="relative z-10 -mt-2 border-y border-black/[0.08] bg-white/40 backdrop-blur-sm">
      <Marquee durationS={38}>
        {items.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="mx-8 inline-flex items-center gap-3 font-display text-xl text-black/55 md:text-2xl"
          >
            {s}
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#A34560" }}
            />
          </span>
        ))}
      </Marquee>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Write the brief",
      body: "One paragraph describing the product, the feeling, and who it's for. Silk reads the room — tone, cadence, what's being asked.",
    },
    {
      n: "02",
      title: "Silk picks an archetype",
      body: "Minimalist, editorial-luxury, or industrial-brutalist. You can steer by clicking one — or let the brief choose for you.",
    },
    {
      n: "03",
      title: "Ship the site",
      body: "Every generation renders to a live preview with a shareable URL in seconds. Re-roll, rename the slug, and the link stays stable.",
    },
  ];
  return (
    <Reveal spec={sectionMotion} as="section" className="relative z-10 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em]">
          The fastest way to a site that
          <br />
          <span className="italic text-[#A34560]">doesn&apos;t look AI</span>.
        </h2>
        <Stagger spec={staggerMotion} className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem
              key={s.n}
              spec={staggerMotion}
              className="rounded-[1.75rem] border border-black/[0.08] bg-white/70 p-8 backdrop-blur-sm transition hover:-translate-y-0.5"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/40">
                step / {s.n}
              </span>
              <h3 className="mt-5 font-display text-2xl tracking-[-0.01em] text-[#1C1917]">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/65">
                {s.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Reveal>
  );
}

function ArchetypeCards() {
  const cards = [
    {
      key: "minimalist-ui",
      title: "Minimalist",
      hint: "Editorial SaaS · restraint as virtue",
      bg: "#FBFBFA",
      fg: "#111111",
      accent: "#346538",
      sample: "Nocturne",
      blurb: "Warm off-white, quiet type, one restrained accent. Like a Notion doc that learned to dress up.",
    },
    {
      key: "editorial-luxury",
      title: "Editorial",
      hint: "Warm cream · agency-tier haptics",
      bg: "#FDFBF7",
      fg: "#1C1917",
      accent: "#A34560",
      sample: "Foyer",
      blurb: "Cream canvas, serif display, nested double-bezel cards. Reads like a catalogue you want to keep.",
    },
    {
      key: "industrial-brutalist",
      title: "Industrial",
      hint: "Swiss print · tactical telemetry",
      bg: "#F4F4F0",
      fg: "#050505",
      accent: "#E61919",
      sample: "KILN / D-01",
      blurb: "Archivo Black, aviation red, 90° corners. For sites that want to feel like a declassified blueprint.",
    },
  ];
  return (
    <Reveal spec={sectionMotion} as="section" className="relative z-10 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
            three archetypes
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em]">
            Pick a mood. Silk commits.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65 md:text-lg">
            Every archetype is a different design language — fonts, motion,
            palette, spacing. Silk never mixes them. You get one, all the way
            through.
          </p>
        </div>
        <Stagger spec={staggerMotion} className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <StaggerItem
              key={c.key}
              spec={staggerMotion}
              className="group overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-white/80 p-1.5 transition hover:-translate-y-0.5"
            >
              <div
                className="rounded-[1.4rem] p-8 transition"
                style={{ background: c.bg, color: c.fg }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.24em]"
                    style={{ color: c.fg, opacity: 0.5 }}
                  >
                    {c.key}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: c.accent }}
                  />
                </div>
                <div className="mt-24 md:mt-32">
                  <div
                    className={
                      c.key === "industrial-brutalist"
                        ? "font-display uppercase text-4xl leading-[0.9] tracking-[-0.04em]"
                        : "font-display text-4xl leading-[1.02] tracking-[-0.02em]"
                    }
                    style={{ color: c.fg }}
                  >
                    {c.sample}
                  </div>
                  <div
                    className="mt-2 text-xs tracking-[0.18em] uppercase"
                    style={{ color: c.fg, opacity: 0.55 }}
                  >
                    sample
                  </div>
                </div>
              </div>
              <div className="p-5 pt-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl tracking-[-0.01em]">
                    {c.title}
                  </h3>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-black/45">
                    {c.hint}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-black/65">
                  {c.blurb}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Reveal>
  );
}

function ProofStrip() {
  const rows = [
    { k: "Section motion", v: "200–900ms, ≤16px translate, vestibular-safe caps" },
    { k: "Guardrails", v: "no emoji, no Inter display, no pure #000/#FFF, no 3-card slop" },
    { k: "A11y", v: "prefers-reduced-motion honored, footer stays static" },
    { k: "Publishing", v: "one-click share at /s/[slug], rename safely, OG preview included" },
  ];
  return (
    <Reveal spec={sectionMotion} as="section" className="relative z-10 px-6 py-24">
      <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-black/[0.08] bg-white/70 p-8 backdrop-blur-sm md:p-12">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
          under the hood
        </span>
        <h2 className="mt-4 font-display text-3xl md:text-4xl tracking-[-0.02em]">
          Taste is enforced, not hoped for.
        </h2>
        <div className="mt-8 divide-y divide-black/[0.08]">
          {rows.map((r) => (
            <div
              key={r.k}
              className="grid grid-cols-1 gap-2 py-4 md:grid-cols-[220px_1fr]"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-black/55">
                {r.k}
              </div>
              <div className="text-sm text-black/75">{r.v}</div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function EndCTA({ onSubmit }: { onSubmit: () => void }) {
  return (
    <Reveal spec={sectionMotion} as="section" className="relative z-10 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-[#1C1917] px-8 py-16 text-[#F5F1EA] md:px-16 md:py-24">
        <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em]">
          Start with one paragraph.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
          The studio is quiet. Write the thing. Press enter. In about twelve
          seconds you&apos;ll have a rendered site with a link you can share.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={onSubmit}
            className="group inline-flex items-center gap-3 rounded-full bg-[#F5F1EA] py-3 pl-6 pr-2 text-sm text-[#1C1917] transition active:scale-[0.98] hover:-translate-y-[1px]"
          >
            <span>Open the studio</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
              <ArrowIcon />
            </span>
          </button>
          <Link
            href="/demo"
            className="inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm text-white/80 transition hover:border-white/45"
          >
            See a demo
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 px-6 pb-12 pt-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-8 text-sm text-black/55">
        <Wordmark />
        <span className="font-mono text-[11px] uppercase tracking-[0.24em]">
          silk · an Eisberg.ai project · v0
        </span>
      </div>
    </footer>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: "#A34560" }}
      />
      <span className="font-display text-[22px] leading-none tracking-[-0.02em] text-[#1C1917]">
        Silk
      </span>
    </Link>
  );
}

function AmbientOrbs() {
  const reduce = useReducedMotion();
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-[10%] h-[540px] w-[540px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(163,69,96,0.38), transparent 72%)" }}
        animate={reduce ? undefined : { y: [0, 22, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[42%] right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(124,139,114,0.32), transparent 72%)" }}
        animate={reduce ? undefined : { y: [0, -18, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function PromptIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h10M4 17h14" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
