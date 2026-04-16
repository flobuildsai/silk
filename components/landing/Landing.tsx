"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Marquee } from "@/components/motion/Marquee";
import { WordMask } from "./WordMask";
import { DevicePreview } from "./DevicePreview";
import { PromptPanel, type PromptMode } from "./PromptPanel";
import type { MotionSpec } from "@/lib/pageSpec";

const sectionMotion: MotionSpec = {
  entry: "fade-up",
  durationMs: 800,
  delayMs: 0,
  easing: "easeOut",
  staggerMs: 90,
};

const staggerMotion: MotionSpec = {
  entry: "stagger",
  durationMs: 700,
  delayMs: 0,
  easing: "easeOut",
  staggerMs: 90,
};

const PROMPT_SUGGESTIONS = [
  "A reading app that turns long articles into weekly digests",
  "Ceramics studio in Porto, two commissions a month",
  "A deterministic build cache for infra teams",
  "Quiet journaling app that asks better questions",
  "Indie design studio booking Q3 2026",
];

const REDESIGN_SUGGESTIONS = [
  "https://your-startup.com",
  "https://portfolio.example.com",
  "https://product.example.com",
];

export function Landing() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<PromptMode>("describe");
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      setSuggestionIndex((i) => (i + 1) % PROMPT_SUGGESTIONS.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [reduce]);

  const submit = useCallback(
    (override?: { mode?: PromptMode; value?: string }) => {
      const m = override?.mode ?? mode;
      const raw =
        override?.value ?? (m === "describe" ? prompt : url);
      const value = raw.trim();
      if (m === "redesign") {
        const qs = value ? `?url=${encodeURIComponent(value)}` : "";
        router.push(`/studio${qs}`);
      } else {
        const qs = value ? `?prompt=${encodeURIComponent(value)}` : "";
        router.push(`/studio${qs}`);
      }
    },
    [mode, prompt, url, router]
  );

  return (
    <main className="silk-landing relative min-h-[100dvh] overflow-hidden bg-[#060606] text-[#EEEAE0]">
      <GrainOverlay />
      <AmbientOrbs />
      <Nav />

      <HeroBlock
        mode={mode}
        prompt={prompt}
        url={url}
        placeholder={
          mode === "describe"
            ? PROMPT_SUGGESTIONS[suggestionIndex]
            : REDESIGN_SUGGESTIONS[suggestionIndex % REDESIGN_SUGGESTIONS.length]
        }
        onModeChange={setMode}
        onPromptChange={setPrompt}
        onUrlChange={setUrl}
        onSubmit={() => submit()}
        onTrySuggestion={(value) => submit({ mode: "describe", value })}
      />

      <TickerBand />
      <StickyFeatures />
      <ArchetypeShowcase />
      <Manifesto />
      <BigCTA onSubmit={() => submit({ mode: "describe", value: prompt })} />
      <Footer />
    </main>
  );
}

function Nav() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 40], [0.5, 0.95]);
  const blur = useTransform(scrollY, [0, 120], [8, 20]);
  const bg = useTransform(
    scrollY,
    [0, 120],
    ["rgba(10,10,10,0.35)", "rgba(10,10,10,0.78)"]
  );
  return (
    <Reveal spec={{ entry: "fade", durationMs: 500, delayMs: 0, easing: "easeOut", staggerMs: 0 }} as="header" className="sticky top-0 z-40">
      <motion.div
        className="mx-auto mt-5 flex w-[min(94%,1200px)] items-center justify-between rounded-full border border-white/[0.08] px-5 py-3"
        style={{
          opacity,
          backdropFilter: useTransform(blur, (b) => `blur(${b}px) saturate(140%)`),
          background: bg,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <Wordmark />
          <span className="hidden text-[10px] uppercase tracking-[0.26em] text-white/35 sm:inline">
            prompt → animated website
          </span>
        </div>
        <div className="flex items-center gap-1">
          <NavLink href="/demo">Demo</NavLink>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#archetypes">Archetypes</NavLink>
          <Link
            href="/studio"
            className="group ml-2 inline-flex items-center gap-2 rounded-full bg-white py-2 pl-4 pr-2 text-[13px] font-medium text-[#0A0A0A] transition active:scale-[0.98] hover:-translate-y-[1px]"
          >
            Open studio
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 transition group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </motion.div>
    </Reveal>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hidden rounded-full px-3.5 py-2 text-[13px] text-white/55 transition hover:text-white md:inline-flex"
    >
      {children}
    </Link>
  );
}

function HeroBlock({
  mode,
  prompt,
  url,
  placeholder,
  onModeChange,
  onPromptChange,
  onUrlChange,
  onSubmit,
  onTrySuggestion,
}: {
  mode: PromptMode;
  prompt: string;
  url: string;
  placeholder: string;
  onModeChange: (m: PromptMode) => void;
  onPromptChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onSubmit: () => void;
  onTrySuggestion: (v: string) => void;
}) {
  return (
    <section className="relative z-10 px-6 pt-12 pb-24 md:pt-16 md:pb-28">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          {/* Left: copy + prompt */}
          <div className="flex flex-col">
            <Reveal
              spec={{ entry: "fade", durationMs: 500, delayMs: 0, easing: "easeOut", staggerMs: 0 }}
              as="div"
              className="mb-6 inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/65 backdrop-blur-md"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#D6A76A]"
                style={{ boxShadow: "0 0 12px rgba(214,167,106,0.75)" }}
              />
              v0 · private beta · an Eisberg.ai project
            </Reveal>

            <h1 className="font-display text-[clamp(2.25rem,5.2vw,5.25rem)] leading-[0.96] tracking-[-0.035em]">
              <WordMask text="Websites worth shipping." as="span" />
              <br />
              <span className="text-white/45">
                <WordMask
                  text="From one paragraph."
                  as="span"
                  delay={0.55}
                  stagger={0.07}
                />
              </span>
            </h1>

            <Reveal
              spec={{ entry: "fade-up", durationMs: 700, delayMs: 900, easing: "easeOut", staggerMs: 0 }}
              as="div"
              className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/60 md:text-[17px]"
            >
              Silk reads your brief, commits to a design archetype, and renders
              an animated, taste-constrained landing page in about twelve
              seconds. Re-roll. Rename the slug. Share the URL. Or paste a site
              you already run and have Silk redesign it.
            </Reveal>

            <Reveal
              spec={{ entry: "fade-up", durationMs: 700, delayMs: 1100, easing: "easeOut", staggerMs: 0 }}
              as="div"
              className="mt-8"
            >
              <PromptPanel
                mode={mode}
                value={mode === "describe" ? prompt : url}
                placeholder={placeholder}
                onModeChange={onModeChange}
                onChange={mode === "describe" ? onPromptChange : onUrlChange}
                onSubmit={onSubmit}
              />
            </Reveal>

            {mode === "describe" && (
              <Reveal
                spec={{ entry: "fade", durationMs: 500, delayMs: 1300, easing: "easeOut", staggerMs: 0 }}
                as="div"
                className="mt-5 flex flex-wrap items-center gap-2"
              >
                <span className="text-[10px] uppercase tracking-[0.26em] text-white/30">
                  Try
                </span>
                {PROMPT_SUGGESTIONS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => onTrySuggestion(s)}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11px] text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white/90"
                  >
                    {truncate(s, 38)}
                  </button>
                ))}
              </Reveal>
            )}
          </div>

          {/* Right: big cycling device preview */}
          <Reveal
            spec={{ entry: "fade-up", durationMs: 900, delayMs: 400, easing: "easeOut", staggerMs: 0 }}
            as="div"
            className="relative"
          >
            <DevicePreview />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TickerBand() {
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
    "no Inter for display",
    "no emoji",
    "no pure #000",
  ];
  return (
    <div className="relative z-10 border-y border-white/[0.06] bg-white/[0.02] py-4 backdrop-blur-sm">
      <Marquee durationS={42}>
        {items.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="mx-8 inline-flex items-center gap-3 font-display text-xl text-white/55 md:text-2xl"
          >
            {s}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D6A76A]" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}

function StickyFeatures() {
  const steps = [
    {
      n: "01",
      title: "Write or paste",
      body: "A one-paragraph brief, or a URL of a site you already run. Silk reads the room — tone, structure, what's being asked — and infers the archetype.",
    },
    {
      n: "02",
      title: "Silk commits",
      body: "Minimalist, editorial-luxury, or industrial-brutalist. Never mixed. Each archetype drives its own typography, motion envelope, palette, and component tokens.",
    },
    {
      n: "03",
      title: "Taste enforced",
      body: "Guardrails reject banned clichés, Inter-as-display, pure #000/#FFF, emoji, three-card slop, and vestibular-unsafe motion. Failures re-prompt; successes render.",
    },
    {
      n: "04",
      title: "Ship the link",
      body: "Every site gets a shareable URL under /s/. Rename the slug and the link stays stable. Open Graph images, taste report, regeneration, and a clean handoff.",
    },
  ];
  return (
    <section id="how" className="relative z-10 px-6 py-24 md:py-40">
      <div className="mx-auto max-w-[1200px]">
        <Reveal spec={sectionMotion} as="div" className="mb-14 max-w-3xl">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            the studio · in motion
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.035em]">
            The fastest way to a site that
            <br />
            <span className="italic text-[#D6A76A]">doesn&apos;t look AI</span>.
          </h2>
        </Reveal>

        <div className="relative flex flex-col gap-4">
          {steps.map((s) => (
            <StickyCard key={s.n} step={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StickyCard({
  step,
}: {
  step: { n: string; title: string; body: string };
}) {
  return (
    <Reveal
      spec={sectionMotion}
      as="div"
      className="sticky top-24 rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md md:p-10"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[120px_1fr]">
        <div className="font-mono text-[12px] uppercase tracking-[0.28em] text-white/35">
          step {step.n}
        </div>
        <div>
          <h3 className="font-display text-2xl md:text-4xl leading-[1.05] tracking-[-0.02em]">
            {step.title}
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
            {step.body}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function ArchetypeShowcase() {
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
    <section id="archetypes" className="relative z-10 px-6 py-24 md:py-40">
      <div className="mx-auto max-w-[1200px]">
        <Reveal spec={sectionMotion} as="div" className="mb-14 max-w-3xl">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            three archetypes
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.035em]">
            Pick a mood. Silk commits.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
            Every archetype is its own design language — fonts, motion,
            palette, spacing. Silk never mixes them. You get one, all the way
            through.
          </p>
        </Reveal>
        <Stagger spec={staggerMotion} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <StaggerItem
              key={c.key}
              spec={staggerMotion}
              className="group overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.02] p-1.5 backdrop-blur-sm transition hover:-translate-y-0.5"
            >
              <div
                className="rounded-[1.4rem] p-8 transition-all duration-500"
                style={{ background: c.bg, color: c.fg }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.26em]"
                    style={{ color: c.fg, opacity: 0.5 }}
                  >
                    {c.key}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: c.accent }}
                  />
                </div>
                <div className="mt-28 md:mt-36">
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
                    className="mt-2 text-[10px] uppercase tracking-[0.24em]"
                    style={{ color: c.fg, opacity: 0.5 }}
                  >
                    sample
                  </div>
                </div>
              </div>
              <div className="p-6 pt-7">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-2xl tracking-[-0.015em]">
                    {c.title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                    {c.hint.split("·")[0].trim()}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {c.blurb}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Manifesto() {
  const rows = [
    { k: "Motion envelope", v: "200–900ms. ≤16px translate. ≤2 parallel entries." },
    { k: "Typography", v: "Fraunces, Newsreader, Instrument Serif, Archivo Black. Inter banned for display." },
    { k: "Color discipline", v: "One accent ≤80% saturation. No pure #000, no pure #FFF, no AI-purple gradients." },
    { k: "Copy guardrails", v: "No elevate, seamless, unleash, empower. No Acme, no John Doe, no emoji." },
    { k: "A11y", v: "prefers-reduced-motion honored. Footer stays static. Vestibular-safe caps enforced." },
    { k: "Publishing", v: "Shareable /s/[slug]. Safe rename. Social preview auto-generated." },
  ];
  return (
    <section className="relative z-10 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <Reveal spec={sectionMotion} as="div" className="mb-10 max-w-3xl">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            under the hood
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.035em]">
            Taste is enforced,
            <br />
            <span className="text-white/40">not hoped for.</span>
          </h2>
        </Reveal>
        <Reveal
          spec={sectionMotion}
          as="div"
          className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-2 backdrop-blur-md"
        >
          <div className="rounded-[1.4rem] bg-black/30 p-8 md:p-12">
            <div className="divide-y divide-white/[0.06]">
              {rows.map((r) => (
                <div
                  key={r.k}
                  className="grid grid-cols-1 gap-2 py-5 md:grid-cols-[260px_1fr]"
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">
                    {r.k}
                  </div>
                  <div className="text-base leading-relaxed text-white/80 md:text-lg">
                    {r.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BigCTA({ onSubmit }: { onSubmit: () => void }) {
  return (
    <Reveal spec={sectionMotion} as="section" className="relative z-10 px-6 py-24 md:py-40">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-[#141414] to-[#0C0C0C] p-10 md:p-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -left-20 h-[420px] w-[420px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(214,167,106,0.35), transparent 72%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-10 h-[340px] w-[340px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(124,139,114,0.25), transparent 72%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-5xl md:text-8xl leading-[0.98] tracking-[-0.04em]">
              Start with
              <br />
              <span className="italic text-[#D6A76A]">one paragraph.</span>
            </h2>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
              The studio is quiet. Write the thing. Press enter. You&apos;ll
              have a rendered site with a link you can share in about twelve
              seconds.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={onSubmit}
                className="group inline-flex items-center gap-3 rounded-full bg-white py-4 pl-7 pr-3 text-sm font-medium text-[#0A0A0A] transition active:scale-[0.98] hover:-translate-y-[1px]"
              >
                <span>Open the studio</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 transition group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
                  <ArrowIcon />
                </span>
              </button>
              <Link
                href="/demo"
                className="inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-4 text-sm text-white/75 transition hover:border-white/40 hover:text-white"
              >
                See a finished site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 px-6 pb-12 pt-6">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-8 text-sm text-white/40">
        <Wordmark />
        <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
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
        className="h-2.5 w-2.5 rounded-full bg-[#D6A76A]"
        style={{ boxShadow: "0 0 14px rgba(214,167,106,0.75)" }}
      />
      <span className="font-display text-[22px] leading-none tracking-[-0.02em] text-white">
        Silk
      </span>
    </Link>
  );
}

function AmbientOrbs() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useSpring(useTransform(scrollY, [0, 2000], [0, 240]), {
    stiffness: 40,
    damping: 20,
  });
  const y2 = useSpring(useTransform(scrollY, [0, 2000], [0, -200]), {
    stiffness: 40,
    damping: 20,
  });
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-44 left-[-6%] h-[760px] w-[760px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(214,167,106,0.55), transparent 70%)",
          y: reduce ? 0 : y1,
        }}
        animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[24%] right-[-14%] h-[640px] w-[640px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(124,139,114,0.40), transparent 70%)",
          y: reduce ? 0 : y2,
        }}
        animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[62%] left-[32%] h-[520px] w-[520px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(163,69,96,0.28), transparent 70%)",
        }}
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 opacity-[0.08] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
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
