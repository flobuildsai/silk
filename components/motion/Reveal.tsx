"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import type { MotionSpec } from "@/lib/pageSpec";
import { OUT_EXPO, REDUCED_TRANSITION, VIEWPORT } from "./constants";

type RevealTag = "div" | "section" | "header" | "footer" | "article" | "aside";

type RevealEntry = MotionSpec["entry"];

const variantsFor = (entry: RevealEntry, durationS: number, delayS: number): Variants => {
  const transition = { duration: durationS, delay: delayS, ease: OUT_EXPO };
  switch (entry) {
    case "fade":
      return {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition },
      };
    case "reveal":
      return {
        hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
        show: { opacity: 1, clipPath: "inset(0 0 0% 0)", transition },
      };
    case "blur-in":
      return {
        hidden: { opacity: 0, filter: "blur(10px)" },
        show: { opacity: 1, filter: "blur(0px)", transition },
      };
    case "stagger":
    case "fade-up":
    default:
      return {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition },
      };
  }
};

type RevealProps = {
  spec: MotionSpec;
  children: ReactNode;
  className?: string;
  as?: RevealTag;
};

export function Reveal({ spec, children, className, as: Tag = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Component = motion[Tag] as ElementType;
  if (spec.entry === "none") {
    const Static = Tag as ElementType;
    return <Static className={className}>{children}</Static>;
  }
  if (reduce) {
    return (
      <Component
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: REDUCED_TRANSITION }}
        viewport={VIEWPORT}
      >
        {children}
      </Component>
    );
  }
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={variantsFor(spec.entry, spec.durationMs / 1000, spec.delayMs / 1000)}
    >
      {children}
    </Component>
  );
}

export { Stagger, StaggerItem } from "./Stagger";
