"use client";

import { useState } from "react";
import { motion, type MotionValue } from "framer-motion";
import {
  HoverLift,
  Magnetic,
  Marquee,
  Parallax,
  Pin,
  PresenceFade,
  Reveal,
  ScrollProgress,
  Stagger,
  StaggerItem,
  useProgressTransform,
} from "@/components/motion";
import type { MotionSpec } from "@/lib/pageSpec";

function ScrollProgressDemoInner({ progress }: { progress: MotionValue<number> }) {
  const scale = useProgressTransform(progress, [0.85, 1.05]);
  const x = useProgressTransform(progress, [-40, 40]);
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        style={{ scale, x }}
        className="font-display text-4xl tracking-tight md:text-6xl"
      >
        Drives any transform.
      </motion.div>
    </div>
  );
}

const baseSpec = (overrides: Partial<MotionSpec> = {}): MotionSpec => ({
  entry: "fade-up",
  durationMs: 520,
  delayMs: 0,
  easing: "easeOut",
  staggerMs: 80,
  ...overrides,
});

function Demo({
  name,
  intent,
  scope,
  children,
}: {
  name: string;
  intent: string;
  scope: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-black/5 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 grid gap-6 md:grid-cols-[1fr_2fr]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-ink-600">{scope}</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">{name}</h2>
          </div>
          <p className="text-base leading-relaxed text-ink-600 md:pt-9">{intent}</p>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white/70 p-6 shadow-soft md:p-10">
          {children}
        </div>
      </div>
    </section>
  );
}

function Tile({ label }: { label: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-2xl border border-black/5 bg-ink-50 px-4 text-center text-sm text-ink-600">
      {label}
    </div>
  );
}

export function MotionShowcase() {
  const [open, setOpen] = useState(true);

  return (
    <main className="bg-ink-50 text-ink-900">
      <header className="px-6 pt-24 pb-16 md:pt-36 md:pb-20">
        <div className="mx-auto max-w-5xl">
          <span className="text-xs uppercase tracking-[0.2em] text-ink-600">
            Silk · motion layer
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[1.04] tracking-tight md:text-7xl">
            Motion primitives the generator composes from.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-600 md:text-xl">
            Editorial defaults. <code>transform</code> and <code>opacity</code> only. Out-expo
            easing. Every primitive collapses to a quiet cross-fade for visitors with
            <code className="mx-1">prefers-reduced-motion: reduce</code>.
          </p>
        </div>
      </header>

      <Demo
        scope="Entry"
        name="Reveal"
        intent="A single element entering on view. Variants cover fade, fade-up, clip-reveal, blur-in, and an opt-out 'none' for footers and chrome that should not draw the eye."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {(["fade-up", "fade", "reveal", "blur-in"] as const).map((entry) => (
            <Reveal key={entry} spec={baseSpec({ entry })} className="rounded-2xl border border-black/5 bg-ink-50 p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-600">{entry}</div>
              <div className="mt-2 font-display text-2xl">A confident reveal.</div>
            </Reveal>
          ))}
        </div>
      </Demo>

      <Demo
        scope="Entry · group"
        name="Stagger / StaggerItem"
        intent="Cascade siblings into view. Cadence is set by spec.staggerMs (default 80ms). Use for feature grids, gallery tiles, navigation lists."
      >
        <Stagger spec={baseSpec({ staggerMs: 90 })} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StaggerItem key={i} spec={baseSpec()}>
              <Tile label={`Tile ${i + 1}`} />
            </StaggerItem>
          ))}
        </Stagger>
      </Demo>

      <Demo
        scope="Exit"
        name="PresenceFade"
        intent="Mount/unmount transitions for modals, banners, route swaps. Wraps AnimatePresence so the exit plays before the child detaches."
      >
        <div className="flex flex-col items-start gap-4">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-ink-900 px-5 py-2 text-sm font-medium text-white"
          >
            {open ? "Dismiss panel" : "Show panel"}
          </button>
          <PresenceFade show={open} className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-soft">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-600">Notification</div>
            <p className="mt-2 text-sm text-ink-600">
              Exit transitions translate up before unmounting. Press the button to toggle.
            </p>
          </PresenceFade>
        </div>
      </Demo>

      <Demo
        scope="Scroll"
        name="Parallax"
        intent="Drift a layer along Y as it crosses the viewport. Offset is in pixels travelled across the full scroll window — keep it under 80 for editorial restraint."
      >
        <div className="relative h-[420px] overflow-hidden rounded-2xl bg-ink-100">
          <Parallax offset={48} className="absolute inset-x-0 top-8 mx-auto w-3/4">
            <div className="rounded-xl bg-white p-6 shadow-soft">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-600">Foreground</div>
              <div className="font-display text-2xl">Drifts upward</div>
            </div>
          </Parallax>
          <Parallax offset={96} className="absolute inset-x-0 bottom-8 mx-auto w-1/2">
            <div className="rounded-xl bg-ink-900 p-6 text-white">
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Background</div>
              <div className="font-display text-2xl">Drifts faster</div>
            </div>
          </Parallax>
        </div>
      </Demo>

      <Demo
        scope="Scroll · progress"
        name="ScrollProgress"
        intent="A render-prop that surfaces a 0→1 MotionValue tracking an element's traversal. Compose any transform/opacity curve from it."
      >
        <ScrollProgress className="h-[360px] overflow-hidden rounded-2xl bg-ink-100">
          {(progress) => <ScrollProgressDemoInner progress={progress} />}
        </ScrollProgress>
      </Demo>

      <Demo
        scope="Scroll · pin"
        name="Pin"
        intent="Sticks an element to the viewport for a chapter while you scroll. Built on CSS sticky — no JS scroll listeners. Use sparingly."
      >
        <Pin
          className="relative -mx-6 md:-mx-10"
          innerClassName="px-6 text-center"
          vhMultiple={1.6}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-ink-600">Chapter 1</span>
          <h3 className="mt-3 font-display text-4xl tracking-tight md:text-6xl">
            Held in place while the page moves.
          </h3>
        </Pin>
      </Demo>

      <Demo
        scope="Hover"
        name="HoverLift"
        intent="A small Y lift on hover and a 0.98 dip on press. The default editorial micro-interaction for cards, list rows, and ghost buttons."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {["Card", "Card", "Card"].map((label, i) => (
            <HoverLift
              key={i}
              className="cursor-pointer rounded-2xl border border-black/5 bg-white p-6 shadow-soft"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-ink-600">{label} {i + 1}</div>
              <div className="mt-2 font-display text-xl">Hover and press.</div>
            </HoverLift>
          ))}
        </div>
      </Demo>

      <Demo
        scope="Hover · CTA"
        name="Magnetic"
        intent="Pulls an element toward the cursor with a damped spring. Reserve for primary CTAs in editorial-luxury archetypes — never apply to entire cards."
      >
        <div className="flex flex-wrap items-center justify-center gap-6 py-12">
          <Magnetic strength={0.3}>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3 text-sm font-medium text-white"
            >
              Start a project
              <span aria-hidden>→</span>
            </a>
          </Magnetic>
          <Magnetic strength={0.18}>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 px-7 py-3 text-sm font-medium text-ink-900"
            >
              See the work
            </a>
          </Magnetic>
        </div>
      </Demo>

      <Demo
        scope="Perpetual"
        name="Marquee"
        intent="Memoized horizontal loop for logo bars and quote bands. Renders content twice for a seamless wrap. Reduced-motion users see a static row."
      >
        <Marquee durationS={36} gapPx={56}>
          {["Aperture", "Field Atelier", "Helio", "North Quay", "Polaris Studio", "Verse"].map((brand) => (
            <span key={brand} className="font-display text-2xl tracking-tight text-ink-600">
              {brand}
            </span>
          ))}
        </Marquee>
      </Demo>

      <footer className="border-t border-black/5 px-6 py-16 text-sm text-ink-600">
        <div className="mx-auto max-w-5xl">
          <p>
            All primitives live in <code>components/motion/*</code>. Import via{" "}
            <code>@/components/motion</code>. See <code>DESIGN.md §5</code> for the
            envelope these primitives implement.
          </p>
        </div>
      </footer>
    </main>
  );
}
