"use client";

import { useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ScrollProgressProps = {
  children: (progress: MotionValue<number>) => ReactNode;
  className?: string;
  /** Where in the viewport the progress crosses 0 → 1. Default: bottom-of-element to top-of-element. */
  range?: [string, string];
};

/**
 * Render-prop wrapper that exposes a [0, 1] scroll progress MotionValue
 * for consumers that want to drive arbitrary `transform`/`opacity` curves.
 */
export function ScrollProgress({
  children,
  className,
  range = ["start end", "end start"],
}: ScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: range as ["start end", "end start"],
  });
  return (
    <div ref={ref} className={className}>
      {children(scrollYProgress)}
    </div>
  );
}

/** Convenience hook for consumers building inline scroll-driven transforms. */
export function useProgressTransform(
  progress: MotionValue<number>,
  output: number[]
) {
  const stops = output.length === 2 ? [0, 1] : output.map((_, i) => i / (output.length - 1));
  return useTransform(progress, stops, output);
}
