"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

export type PromptMode = "describe" | "redesign";

export function PromptPanel({
  mode,
  value,
  placeholder,
  onModeChange,
  onChange,
  onSubmit,
}: {
  mode: PromptMode;
  value: string;
  placeholder: string;
  onModeChange: (m: PromptMode) => void;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-2 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <div className="mb-2 flex gap-1 rounded-full border border-white/[0.06] bg-black/30 p-1 text-[11px] uppercase tracking-[0.22em]">
        <ModeButton active={mode === "describe"} onClick={() => onModeChange("describe")}>
          Describe
        </ModeButton>
        <ModeButton active={mode === "redesign"} onClick={() => onModeChange("redesign")}>
          Redesign a site
        </ModeButton>
      </div>
      <div className="flex flex-col gap-2 rounded-[1.4rem] bg-black/40 p-2 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 pl-4">
          <LeadingIcon mode={mode} />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent py-3 font-display text-[17px] leading-relaxed text-white/92 placeholder:text-white/30 focus:outline-none"
            aria-label={mode === "describe" ? "Describe the site you want" : "Paste a URL to redesign"}
            spellCheck={mode === "describe"}
            autoCapitalize={mode === "redesign" ? "off" : "sentences"}
            autoCorrect={mode === "redesign" ? "off" : "on"}
            inputMode={mode === "redesign" ? "url" : "text"}
          />
        </div>
        <MagneticSubmit onSubmit={onSubmit} label={mode === "describe" ? "Generate" : "Redesign"} />
      </div>
      <div className="flex items-center justify-between px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.24em] text-white/35">
        <span>press enter · ~ 12s</span>
        <span>{mode === "describe" ? "editorial default" : "taste-inferred from source"}</span>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1.5 transition ${
        active
          ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "text-white/45 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}

function LeadingIcon({ mode }: { mode: PromptMode }) {
  if (mode === "redesign") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M10 14L21 3M21 3V9M21 3H15M13 10L3 20M3 20H9M3 20V14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h10M4 17h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MagneticSubmit({ onSubmit, label }: { onSubmit: () => void; label: string }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 22 });
  const sy = useSpring(my, { stiffness: 220, damping: 22 });
  const x = useTransform(sx, (v) => v * 0.22);
  const y = useTransform(sy, (v) => v * 0.22);
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
      className="group inline-flex h-12 items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-medium text-[#0A0A0A] transition active:scale-[0.98]"
    >
      <span>{label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    </motion.button>
  );
}
