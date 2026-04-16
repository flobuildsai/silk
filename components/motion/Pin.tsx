"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type PinProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Multiplier of the viewport height to keep the inner element pinned. */
  vhMultiple?: number;
};

/**
 * CSS-sticky pin with a scroll-driven progress channel. The outer wrapper
 * is `vhMultiple * 100vh` tall; the inner content sticks to the top of the
 * viewport for the duration and reveals/translates based on progress.
 *
 * Use for product walkthroughs and chapter intros. Avoid on dashboards.
 */
export function Pin({ children, className, innerClassName, vhMultiple = 2 }: PinProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.85, 1], [0.4, 1, 1, 0.6]);
  const y = useTransform(scrollYProgress, [0, 1], [16, -16]);

  if (reduce) {
    return (
      <section ref={ref} className={className}>
        <div className={innerClassName}>{children}</div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={className}
      style={{ height: `${vhMultiple * 100}vh` }}
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center">
        <motion.div className={innerClassName} style={{ opacity, y }}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
