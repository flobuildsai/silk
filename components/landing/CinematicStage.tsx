"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";

type ArchetypeKey = "editorial" | "minimalist" | "brutalist";

type Slide = {
  key: ArchetypeKey;
  label: string;
  labelPretty: string;
  prompt: string;
  caption: string;
  palette: { bg: string; fg: string; accent: string; muted: string };
  render: () => React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    key: "editorial",
    labelPretty: "Editorial luxury",
    label: "editorial-luxury",
    prompt: "A ceramics studio in Porto, two commissions a month.",
    caption:
      "Cream canvas. Serif display. One deep rose accent. Reads like a catalogue you'd keep.",
    palette: { bg: "#FDFBF7", fg: "#1C1917", accent: "#A34560", muted: "#8A8275" },
    render: () => <EditorialSite />,
  },
  {
    key: "minimalist",
    labelPretty: "Minimalist UI",
    label: "minimalist-ui",
    prompt: "A reading app that turns long articles into weekly digests.",
    caption:
      "Warm off-white. Quiet type. One restrained accent. Like a Notion doc that learned to dress up.",
    palette: { bg: "#FBFAF7", fg: "#111111", accent: "#346538", muted: "#6A6A66" },
    render: () => <MinimalistSite />,
  },
  {
    key: "brutalist",
    labelPretty: "Industrial brutalist",
    label: "industrial-brutalist",
    prompt: "Kiln Systems — a deterministic build cache for infra teams.",
    caption:
      "Archivo Black uppercase. Aviation red. 90° corners. A site that feels like a declassified blueprint.",
    palette: { bg: "#F4F4F0", fg: "#050505", accent: "#E61919", muted: "#5A5A55" },
    render: () => <BrutalistSite />,
  },
];

/**
 * Apple-product-page stage: a tall scroll container with a sticky device
 * inside. Device pins centered and morphs through the three archetypes as
 * the user scrolls. Palette, prompt, screen content, and surrounding copy
 * all driven by the same scroll progress value.
 */
export function CinematicStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  // Scroll progress over the full stage: 0 at top-in, 1 at bottom-out.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.6 });

  // Three archetype bands live at progress 0.10, 0.45, 0.80.
  // Scale in at arrival, ease out at exit.
  const deviceScale = useTransform(smooth, [0, 0.05, 0.92, 1], [0.78, 1, 1, 0.94]);
  const deviceY = useTransform(smooth, [0, 0.05], [60, 0]);
  const deviceRotate = useTransform(smooth, [0, 0.05], [3.5, 0]);
  const deviceOpacity = useTransform(smooth, [0, 0.04, 0.95, 1], [0, 1, 1, 0.8]);

  // Archetype index changes at scroll bands.
  useMotionValueEvent(smooth, "change", (v) => {
    const next = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
    setActive((cur) => (cur === next ? cur : next));
  });

  const slide = SLIDES[active];

  return (
    <section ref={ref} className="relative" style={{ height: "360vh" }}>
      <div className="sticky top-0 flex h-[100vh] min-h-[640px] w-full items-center justify-center overflow-hidden">
        {/* Breathing colored glow tied to current archetype */}
        <motion.div
          aria-hidden
          key={`glow-${slide.key}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${slide.palette.accent}2A, transparent 60%)`,
          }}
        />

        <div className="relative z-10 w-full px-6">
          <div className="mx-auto max-w-[1400px]">
            {/* Label + caption above the device */}
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                  archetype {String(active + 1).padStart(2, "0")} / 03
                </div>
                <motion.h2
                  key={`label-${slide.key}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-4xl md:text-6xl leading-[0.98] tracking-[-0.035em]"
                >
                  {slide.labelPretty}
                </motion.h2>
              </div>
              <motion.p
                key={`caption-${slide.key}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="hidden max-w-md text-sm leading-relaxed text-white/55 md:block md:text-base"
              >
                {slide.caption}
              </motion.p>
            </div>

            {/* The giant device */}
            <motion.div
              style={{
                scale: reduce ? 1 : deviceScale,
                y: reduce ? 0 : deviceY,
                rotateX: reduce ? 0 : deviceRotate,
                opacity: reduce ? 1 : deviceOpacity,
                transformPerspective: 1600,
                transformOrigin: "50% 50%",
              }}
              className="relative mx-auto w-full max-w-[1200px]"
            >
              <Device slide={slide} />
            </motion.div>

            {/* Scroll hint + band progress */}
            <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/40">
              <span className="flex items-center gap-3">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20">
                  <svg width="8" height="8" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M12 5v14M6 13l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                scroll to morph
              </span>
              <div className="flex items-center gap-2">
                {SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-[3px] rounded-full transition-all duration-500 ${
                      i === active ? "w-10 bg-white" : "w-4 bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Device({ slide }: { slide: Slide }) {
  const { bg, fg, accent, muted } = slide.palette;
  return (
    <div className="relative rounded-[2.25rem] border border-white/[0.1] bg-white/[0.03] p-3 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
      {/* Window chrome */}
      <div className="mb-2 flex items-center gap-2 px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
            <span>silk.app/s/</span>
            <motion.span
              key={slide.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-white/85"
            >
              {slide.key === "editorial"
                ? "foyer-porto"
                : slide.key === "minimalist"
                ? "marginalia"
                : "kiln-systems"}
            </motion.span>
          </div>
        </div>
        <div className="w-16" />
      </div>

      {/* Screen */}
      <motion.div
        key={slide.key}
        initial={{ opacity: 0, scale: 1.01, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[1.6rem]"
        style={{ background: bg, color: fg, minHeight: 420 }}
      >
        <div className="h-full p-8 md:p-12">
          <MiniNav muted={muted} accent={accent} archetype={slide.key} />
          <div className="mt-8">{slide.render()}</div>
        </div>

        {/* Initial scan sweep */}
        <motion.div
          aria-hidden
          initial={{ y: "-40%", opacity: 0.55 }}
          animate={{ y: "140%", opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[260px]"
          style={{
            background: `linear-gradient(180deg, transparent, ${accent}1F, transparent)`,
          }}
        />
      </motion.div>
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
        className="flex items-center justify-between border-b pb-3 font-mono text-[11px] uppercase tracking-[0.24em]"
        style={{ borderColor: "currentColor" }}
      >
        <span>KILN / D-01</span>
        <span style={{ color: accent }}>REV 2.6</span>
      </div>
    );
  }
  return (
    <div
      className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em]"
      style={{ color: muted }}
    >
      <span className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: accent }}
        />
        {archetype === "editorial" ? "foyer · ceramics" : "marginalia · reading"}
      </span>
      <span className="flex items-center gap-6">
        <span className="hidden md:inline">work</span>
        <span className="hidden md:inline">journal</span>
        <span className="hidden md:inline">index</span>
        <span>open</span>
      </span>
    </div>
  );
}

/* ------- Archetype renderings (large/cinematic) ------- */

function EditorialSite() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.25fr_1fr]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.28em] opacity-50">
          now booking · q3
        </div>
        <div
          className="mt-5 font-display leading-[0.96] tracking-[-0.035em]"
          style={{ fontSize: "clamp(36px, 5.6vw, 84px)" }}
        >
          Two <span className="italic" style={{ color: "#A34560" }}>commissions</span>
          <br />
          a month.
        </div>
        <div className="mt-6 max-w-md text-[15px] leading-relaxed opacity-75">
          A studio of one, in Porto. Pieces fired to keep. Slow, confident, exact —
          the site reads like the studio does.
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <div className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1C1917] px-4 text-[13px] text-white">
            Start a conversation
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/12">
              <Arrow />
            </span>
          </div>
          <div className="inline-flex h-11 items-center rounded-full border border-[#1C1917]/20 px-5 text-[13px]">
            See the archive
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl"
            style={{
              background:
                i === 0
                  ? "color-mix(in srgb, #A34560 22%, #FDFBF7)"
                  : i === 3
                  ? "color-mix(in srgb, #1C1917 6%, #FDFBF7)"
                  : "color-mix(in srgb, #1C1917 10%, #FDFBF7)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MinimalistSite() {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.28em] opacity-50">
        · now in beta
      </div>
      <div
        className="mt-5 font-display leading-[1.02] tracking-[-0.02em]"
        style={{ fontSize: "clamp(32px, 5.4vw, 76px)" }}
      >
        Read with intent.
      </div>
      <div className="mt-5 max-w-xl text-[15px] leading-relaxed opacity-75">
        Marginalia turns long articles into a single calm digest. One email a
        week. No feeds, no streaks, no nudges. Just the sentences worth keeping.
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <div className="inline-flex h-11 items-center gap-2 rounded-md bg-[#111111] px-5 text-[13px] text-white">
          Start reading
        </div>
        <div className="inline-flex h-11 items-center rounded-md border border-black/15 px-5 text-[13px]">
          How it works
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Ask", "Calm question prompts"],
          ["Private", "On-device by default"],
          ["Patterns", "Themes, not streaks"],
          ["Weekly", "One quiet email"],
        ].map(([t, d]) => (
          <div
            key={t}
            className="rounded-xl border border-black/[0.08] bg-white p-4"
          >
            <div className="h-6 w-6 rounded-full bg-[#111111]" />
            <div className="mt-3 text-[13px] font-semibold">{t}</div>
            <div className="mt-1 text-[11px] leading-snug opacity-60">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrutalistSite() {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.24em] opacity-70">
        [ DELIVERY SYSTEMS ]
      </div>
      <div
        className="mt-4 font-display uppercase leading-[0.86] tracking-[-0.04em]"
        style={{ fontSize: "clamp(46px, 9vw, 140px)" }}
      >
        KILN
        <br />
        SYSTEMS
      </div>
      <div className="mt-4 h-[2px] w-full bg-current" />
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="font-mono text-[13px] leading-relaxed opacity-75">
          &gt; DETERMINISTIC BUILD CACHE. SHIPS REPRODUCIBLE
          <br />
          &gt; ARTIFACTS FROM FIRST COMMIT. NO FLAKES.
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 items-center bg-[#E61919] px-5 font-mono text-[12px] uppercase tracking-[0.22em] text-white">
            INIT CACHE
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-60">
            UNIT / D-01
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-4">
        {["online", "sync", "build", "ship"].map((s, i) => (
          <div
            key={s}
            className={`px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] ${
              i < 3 ? "border-r" : ""
            }`}
            style={{ borderColor: "currentColor" }}
          >
            <div className="opacity-50">NODE {i + 1}</div>
            <div>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
