"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type ArchetypeKey = "editorial" | "minimalist" | "brutalist";

type Slide = {
  key: ArchetypeKey;
  label: string;
  prompt: string;
  palette: { bg: string; fg: string; accent: string; muted: string };
  render: () => React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    key: "editorial",
    label: "editorial-luxury",
    prompt: "A ceramics studio in Porto, two commissions a month.",
    palette: { bg: "#FDFBF7", fg: "#1C1917", accent: "#A34560", muted: "#8A8275" },
    render: () => <EditorialSite />,
  },
  {
    key: "minimalist",
    label: "minimalist-ui",
    prompt: "A reading app that turns long articles into weekly digests.",
    palette: { bg: "#FBFAF7", fg: "#111111", accent: "#346538", muted: "#6A6A66" },
    render: () => <MinimalistSite />,
  },
  {
    key: "brutalist",
    label: "industrial-brutalist",
    prompt: "Kiln Systems — a deterministic build cache for infra teams.",
    palette: { bg: "#F4F4F0", fg: "#050505", accent: "#E61919", muted: "#5A5A55" },
    render: () => <BrutalistSite />,
  },
];

const TYPE_MS = 28;
const DWELL_MS = 3200;

/**
 * Auto-cycling "device" mockup that visually sells the Silk pipeline. For
 * each slide it: (1) types out the prompt letter-by-letter, (2) reveals
 * the taste-report, (3) mounts a mini rendered site in the frame, then
 * moves on. Respects prefers-reduced-motion by collapsing to static
 * crossfades between slides.
 */
export function DevicePreview() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState(reduce ? SLIDES[0].prompt : "");
  const [phase, setPhase] = useState<"type" | "render">(reduce ? "render" : "type");
  const slide = SLIDES[idx];

  // Typewriter + phase machine.
  useEffect(() => {
    if (reduce) {
      const t = window.setTimeout(() => setIdx((i) => (i + 1) % SLIDES.length), 3600);
      return () => window.clearTimeout(t);
    }
    setTyped("");
    setPhase("type");
    let i = 0;
    const typing = window.setInterval(() => {
      i += 1;
      setTyped(slide.prompt.slice(0, i));
      if (i >= slide.prompt.length) {
        window.clearInterval(typing);
        window.setTimeout(() => setPhase("render"), 280);
      }
    }, TYPE_MS);
    const next = window.setTimeout(
      () => setIdx((v) => (v + 1) % SLIDES.length),
      TYPE_MS * slide.prompt.length + DWELL_MS
    );
    return () => {
      window.clearInterval(typing);
      window.clearTimeout(next);
    };
  }, [idx, slide, reduce]);

  const { bg, fg, accent, muted } = slide.palette;

  return (
    <div className="relative">
      {/* Ambient glow behind device */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-12 rounded-[3rem] blur-3xl"
        animate={{
          background: `radial-gradient(closest-side, ${accent}40, transparent 70%)`,
        }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />

      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-3 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
      >
        {/* Window chrome */}
        <div className="mb-2 flex items-center gap-2 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
              <span>silk.app/s/</span>
              <motion.span
                key={slide.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-white/80"
              >
                {slide.key === "editorial"
                  ? "foyer-porto"
                  : slide.key === "minimalist"
                  ? "marginalia"
                  : "kiln-systems"}
              </motion.span>
            </div>
          </div>
          <div className="w-14" />
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          {/* Brief pane */}
          <div className="flex flex-col gap-2 rounded-[1rem] bg-black/40 p-3">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.24em] text-white/45">
              <span>brief</span>
              <motion.span
                key={`arch-${slide.key}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="font-mono"
                style={{ color: accent }}
              >
                {slide.label}
              </motion.span>
            </div>
            <div className="rounded-md bg-black/40 p-2.5 font-display text-[13px] leading-snug text-white/90 min-h-[72px]">
              {typed}
              {phase === "type" && !reduce && (
                <motion.span
                  className="ml-[1px] inline-block h-[1em] w-[2px] translate-y-[3px] bg-white/80 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  aria-hidden
                />
              )}
            </div>
            <TasteReport phase={phase} accent={accent} />
          </div>

          {/* Rendered site pane */}
          <div
            className="relative overflow-hidden rounded-[1rem]"
            style={{ background: bg, color: fg, minHeight: 360 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.key}
                initial={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
                animate={{
                  opacity: phase === "render" ? 1 : 0.45,
                  scale: 1,
                  filter: phase === "render" ? "blur(0px)" : "blur(4px)",
                }}
                exit={{ opacity: 0, scale: 0.99, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <div
                  style={{ color: fg }}
                  className="h-full p-6 md:p-8"
                >
                  <MiniNav muted={muted} accent={accent} archetype={slide.key} />
                  <div className="mt-6">{slide.render()}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Scan line during render */}
            {phase === "render" && !reduce && (
              <motion.div
                aria-hidden
                initial={{ y: "-30%", opacity: 0.6 }}
                animate={{ y: "130%", opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-x-0 top-0 h-[180px]"
                style={{
                  background: `linear-gradient(180deg, transparent, ${accent}22, transparent)`,
                }}
              />
            )}
          </div>
        </div>

        {/* Phase progress bar */}
        <ProgressStripe key={idx} reduce={!!reduce} accent={accent} />
      </div>

      {/* Slide dots */}
      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setIdx(i)}
            className={`h-1 rounded-full transition-all ${
              i === idx ? "w-8 bg-white/90" : "w-3 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Show ${s.label}`}
          />
        ))}
      </div>
    </div>
  );
}

function TasteReport({ phase, accent }: { phase: "type" | "render"; accent: string }) {
  const rows = [
    { label: "archetype · picked", done: phase === "render" },
    { label: "taste · passed", done: phase === "render" },
    { label: "motion · vestibular-safe", done: phase === "render" },
    { label: "rendered · /s/ link ready", done: phase === "render" },
  ];
  return (
    <ul className="mt-1 flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em]">
      {rows.map((r, i) => (
        <motion.li
          key={r.label}
          initial={{ opacity: 0, x: -4 }}
          animate={{
            opacity: r.done ? 1 : 0.35,
            x: 0,
            transition: { delay: r.done ? i * 0.08 : 0, duration: 0.3 },
          }}
          className="flex items-center gap-2 text-white/70"
        >
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full"
            animate={{
              background: r.done ? accent : "rgba(255,255,255,0.25)",
              boxShadow: r.done ? `0 0 8px ${accent}` : "none",
            }}
            transition={{ duration: 0.35 }}
          />
          <span>{r.label}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function ProgressStripe({ reduce, accent }: { reduce: boolean; accent: string }) {
  return (
    <div className="relative mt-2 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.04]">
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: reduce ? "100%" : "100%" }}
        transition={{ duration: reduce ? 3.6 : 5.0, ease: "linear" }}
        className="absolute inset-y-0 left-0"
        style={{ background: accent }}
      />
    </div>
  );
}

function MiniNav({
  muted,
  accent,
  archetype,
}: {
  muted: string;
  accent: string;
  archetype: ArchetypeKey;
}) {
  if (archetype === "brutalist") {
    return (
      <div
        className="flex items-center justify-between border-b pb-2 font-mono text-[9px] uppercase tracking-[0.22em]"
        style={{ borderColor: "currentColor" }}
      >
        <span>KILN / D-01</span>
        <span style={{ color: accent }}>REV 2.6</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em]" style={{ color: muted }}>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        {archetype === "editorial" ? "foyer · ceramics" : "marginalia · reading"}
      </span>
      <span>open</span>
    </div>
  );
}

/* ------- Mini renderings of each archetype's hero ------- */

function EditorialSite() {
  return (
    <>
      <div className="text-[10px] uppercase tracking-[0.24em] opacity-50">
        now booking · q3
      </div>
      <div
        className="mt-4 font-display leading-[0.98] tracking-[-0.035em]"
        style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
      >
        Two <span className="italic" style={{ color: "#A34560" }}>commissions</span>
        <br />
        a month.
      </div>
      <div className="mt-5 max-w-sm text-[13px] leading-relaxed opacity-75">
        A studio of one, in Porto. Slow, confident, exact. Pieces fired to keep,
        never to fill shelves.
      </div>
      <div className="mt-5 flex gap-2">
        <div className="inline-flex h-8 items-center gap-2 rounded-full bg-[#1C1917] px-3 text-[11px] text-white">
          Start a conversation
          <span className="h-5 w-5 rounded-full bg-white/10" />
        </div>
        <div className="inline-flex h-8 items-center rounded-full border border-[#1C1917]/20 px-3 text-[11px]">
          See the archive
        </div>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-md"
            style={{ background: i % 2 ? "#A3456020" : "#1C191710" }}
          />
        ))}
      </div>
    </>
  );
}

function MinimalistSite() {
  return (
    <>
      <div className="text-[10px] uppercase tracking-[0.24em] opacity-50">
        · now in beta
      </div>
      <div
        className="mt-4 font-display leading-[1.02] tracking-[-0.02em]"
        style={{ fontSize: "clamp(26px, 5vw, 44px)" }}
      >
        Read with intent.
      </div>
      <div className="mt-4 max-w-sm text-[13px] leading-relaxed opacity-75">
        Marginalia turns long articles into a single calm digest. One email a
        week. No feeds, no streaks, no nudges.
      </div>
      <div className="mt-5 flex gap-2">
        <div className="inline-flex h-8 items-center gap-2 rounded-md bg-[#111111] px-3 text-[11px] text-white">
          Start reading
        </div>
        <div className="inline-flex h-8 items-center rounded-md border border-black/15 px-3 text-[11px]">
          How it works
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        {["ask, don't autocomplete", "patterns, not metrics"].map((t) => (
          <div
            key={t}
            className="rounded-lg border border-black/[0.08] bg-white p-3"
          >
            <div className="h-4 w-4 rounded-full bg-[#111111]" />
            <div className="mt-2 text-[11px] font-semibold">{t}</div>
            <div className="mt-1 text-[10px] leading-snug opacity-60">
              Calm question prompts. Private by default.
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function BrutalistSite() {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-60">
        [ DELIVERY SYSTEMS ]
      </div>
      <div
        className="mt-3 font-display uppercase leading-[0.88] tracking-[-0.04em]"
        style={{ fontSize: "clamp(36px, 7vw, 76px)" }}
      >
        KILN<br />SYSTEMS
      </div>
      <div className="mt-3 h-[2px] w-full bg-current" />
      <div className="mt-3 max-w-md font-mono text-[11px] leading-relaxed opacity-75">
        &gt; DETERMINISTIC BUILD CACHE / SHIPS REPRODUCIBLE
        <br />
        &gt; ARTIFACTS FROM FIRST COMMIT.
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div
          className="inline-flex h-8 items-center bg-[#E61919] px-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white"
        >
          INIT CACHE
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-60">
          UNIT / D-01
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-0">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 border-r border-current/20 px-2 pt-1 font-mono text-[9px] uppercase tracking-[0.2em]"
          >
            <div className="opacity-60">NODE {i + 1}</div>
            <div>{["online", "sync", "build", "ship"][i]}</div>
          </div>
        ))}
      </div>
    </>
  );
}
