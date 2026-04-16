"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import type { MotionSpec } from "@/lib/pageSpec";
import { OUT_EXPO, REDUCED_TRANSITION, VIEWPORT } from "./constants";

type StaggerProps = {
  spec: MotionSpec;
  children: ReactNode;
  className?: string;
};

export function Stagger({ spec, children, className }: StaggerProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: REDUCED_TRANSITION }}
        viewport={VIEWPORT}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: spec.staggerMs / 1000,
            delayChildren: spec.delayMs / 1000,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  spec,
  children,
  className,
  style,
}: {
  spec: MotionSpec;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: spec.durationMs / 1000, ease: OUT_EXPO },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
