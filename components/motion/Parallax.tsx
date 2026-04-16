"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Pixel offset travelled across the element's full scroll window. Negative = upward drift. */
  offset?: number;
  /** Whether to also fade the layer in tandem with translation. Subtle by default. */
  fade?: boolean;
};

/**
 * Translates a child layer along Y as it crosses the viewport. Animates
 * `transform` only — never `top`/`height`. Reduced-motion users see the
 * static element with no transform applied.
 */
export function Parallax({ children, className, offset = 60, fade = false }: ParallaxProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, fade ? 0 : 1]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={fade ? { y, opacity } : { y }}
    >
      {children}
    </motion.div>
  );
}
