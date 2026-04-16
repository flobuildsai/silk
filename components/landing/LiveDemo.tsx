"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const SCRIPT = "A calm reading app that turns long articles into a weekly digest";

/**
 * A purely visual "first render" demo. A prompt types itself into a fake
 * input, then three archetype previews materialize underneath. No API
 * calls, no real generation — it's just a motion piece that communicates
 * what the real studio does. Respects prefers-reduced-motion.
 */
export function LiveDemo() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? SCRIPT : "");
  const [cursorOn, setCursorOn] = useState(true);
  const [phase, setPhase] = useState<"typing" | "rendering" | "done">(
    reduce ? "done" : "typing"
  );

  // Typewriter.
  useEffect(() => {
    if (reduce) return;
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setTyped(SCRIPT.slice(0, i));
      if (i >= SCRIPT.length) {
        window.clearInterval(t);
        window.setTimeout(() => setPhase("rendering"), 400);
        window.setTimeout(() => setPhase("done"), 1400);
      }
    }, 38);
    return () => window.clearInterval(t);
  }, [reduce]);

  // Blinking cursor.
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setCursorOn((c) => !c), 520);
    return () => window.clearInterval(t);
  }, [reduce]);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-5 md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem]"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(214,167,106,0.10), transparent 55%), radial-gradient(100% 70% at 100% 100%, rgba(124,139,114,0.10), transparent 55%)",
        }}
      />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#D6A76A]"
              style={{ boxShadow: "0 0 10px rgba(214,167,106,0.8)" }}
            />
            brief
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="font-display text-[16px] leading-relaxed text-white/90">
              {typed}
              {phase === "typing" && (
                <span
                  className="ml-[2px] inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-white/80"
                  style={{ opacity: cursorOn ? 1 : 0 }}
                  aria-hidden
                />
              )}
            </p>
          </div>
          <StageList phase={phase} />
        </div>

        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            preview · three archetypes in parallel
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <MockMinimalist visible={phase !== "typing"} delay={0} />
            <MockEditorial visible={phase !== "typing"} delay={0.15} />
            <MockBrutalist visible={phase !== "typing"} delay={0.3} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StageList({ phase }: { phase: "typing" | "rendering" | "done" }) {
  const rows: { label: string; done: boolean }[] = [
    { label: "Parse brief", done: phase !== "typing" },
    { label: "Pick archetype", done: phase === "done" },
    { label: "Check taste", done: phase === "done" },
    { label: "Render", done: phase === "done" },
  ];
  return (
    <ul className="flex flex-col gap-1.5 text-[11px] uppercase tracking-[0.22em] text-white/55">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-2.5">
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full"
            animate={{
              backgroundColor: r.done ? "#D6A76A" : "rgba(255,255,255,0.2)",
              boxShadow: r.done ? "0 0 8px rgba(214,167,106,0.7)" : "0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ duration: 0.35 }}
          />
          <span className={r.done ? "text-white/80" : ""}>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}

function Mock({
  visible,
  delay,
  children,
  style,
  label,
  accent,
}: {
  visible: boolean;
  delay: number;
  children: React.ReactNode;
  style: React.CSSProperties;
  label: string;
  accent: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="group relative overflow-hidden rounded-[1.25rem] border border-white/[0.08]"
      style={style}
      initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={
        visible
          ? { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] } }
          : undefined
      }
    >
      <div className="aspect-[3/4] w-full p-4">{children}</div>
      <div className="flex items-center justify-between border-t border-current/[0.1] px-3 py-2 text-[10px] uppercase tracking-[0.22em]">
        <span className="opacity-70">{label}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
      </div>
    </motion.div>
  );
}

function MockMinimalist({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <Mock
      visible={visible}
      delay={delay}
      label="minimalist"
      accent="#7C8B72"
      style={{ background: "#FBFAF7", color: "#1B1B1B" }}
    >
      <div className="mb-3 text-[9px] uppercase tracking-[0.24em] opacity-50">
        · now in beta
      </div>
      <div
        className="font-display leading-[1.02] tracking-[-0.02em]"
        style={{ fontSize: 22 }}
      >
        Marginalia — read with intent.
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-1 w-[85%] rounded-full bg-black/[0.12]" />
        <div className="h-1 w-[70%] rounded-full bg-black/[0.12]" />
        <div className="h-1 w-[55%] rounded-full bg-black/[0.08]" />
      </div>
      <div className="mt-4 flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-[#1B1B1B]" />
        <div className="h-5 w-14 rounded-full border border-black/15" />
      </div>
    </Mock>
  );
}

function MockEditorial({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <Mock
      visible={visible}
      delay={delay}
      label="editorial"
      accent="#A34560"
      style={{ background: "#FDFBF7", color: "#1C1917" }}
    >
      <div className="mb-3 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.24em] opacity-50">
        <span className="h-1 w-1 rounded-full" style={{ background: "#A34560" }} />
        foyer · ceramics
      </div>
      <div
        className="font-display leading-[0.98] tracking-[-0.03em]"
        style={{ fontSize: 24 }}
      >
        Two <span className="italic" style={{ color: "#A34560" }}>commissions</span> a month.
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-1 w-[75%] rounded-full bg-black/[0.12]" />
        <div className="h-1 w-[60%] rounded-full bg-black/[0.12]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1">
        <div className="aspect-square rounded-md bg-[color:#A34560]/20" />
        <div className="aspect-square rounded-md bg-black/[0.06]" />
        <div className="aspect-square rounded-md bg-[color:#A34560]/10" />
      </div>
    </Mock>
  );
}

function MockBrutalist({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <Mock
      visible={visible}
      delay={delay}
      label="industrial"
      accent="#E61919"
      style={{ background: "#F4F4F0", color: "#050505", borderRadius: "0.75rem" }}
    >
      <div className="mb-3 flex items-center justify-between text-[9px] uppercase tracking-[0.24em] opacity-60 font-mono">
        <span>UNIT / D-01</span>
        <span>REV 2.6</span>
      </div>
      <div
        className="font-display uppercase leading-[0.88] tracking-[-0.04em]"
        style={{ fontSize: 28 }}
      >
        KILN<br />
        SYSTEMS
      </div>
      <div className="mt-3 h-[1px] w-full" style={{ background: "#050505" }} />
      <div className="mt-2 space-y-1 font-mono text-[8px] uppercase tracking-[0.2em] opacity-70">
        <div>[ DELIVERY SYSTEMS ]</div>
        <div>&gt; deterministic build cache</div>
      </div>
      <div className="mt-4 inline-block" style={{ background: "#E61919" }}>
        <div className="px-2 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white">
          INIT
        </div>
      </div>
    </Mock>
  );
}
