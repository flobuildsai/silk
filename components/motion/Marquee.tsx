"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Children, memo, type ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  /** Seconds for one full pass. Editorial default: 32s — slow and confident. */
  durationS?: number;
  /** Reverse direction. */
  reverse?: boolean;
  /** Optional gap between items in `px`. */
  gapPx?: number;
};

/**
 * Perpetual horizontal marquee. Memoized + isolated client component per
 * §5.5 of DESIGN.md. Reduced-motion users see the static row with no
 * translation. Renders content twice so the loop is seamless.
 */
function MarqueeImpl({
  children,
  className,
  durationS = 32,
  reverse = false,
  gapPx = 48,
}: MarqueeProps) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);

  if (reduce) {
    return (
      <div className={className} style={{ overflow: "hidden" }}>
        <div className="flex" style={{ gap: gapPx }}>
          {items}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ overflow: "hidden" }}>
      <motion.div
        className="flex w-max"
        style={{ gap: gapPx }}
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: durationS, ease: "linear", repeat: Infinity }}
      >
        <div className="flex shrink-0" style={{ gap: gapPx }}>
          {items}
        </div>
        <div className="flex shrink-0" aria-hidden style={{ gap: gapPx }}>
          {items}
        </div>
      </motion.div>
    </div>
  );
}

export const Marquee = memo(MarqueeImpl);
