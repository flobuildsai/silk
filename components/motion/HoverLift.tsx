"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { OUT_EXPO } from "./constants";

type HoverLiftTag = "div" | "a" | "button" | "li" | "article";

type HoverLiftProps = {
  children: ReactNode;
  className?: string;
  as?: HoverLiftTag;
  /** Lift in pixels on hover. Editorial default: 2. */
  lift?: number;
  /** Press scale (active state). Editorial default: 0.98. */
  press?: number;
} & Omit<HTMLMotionProps<"div">, "ref" | "children" | "whileHover" | "whileTap" | "transition">;

/**
 * A hover/press primitive that lifts a card or button by a small Y offset
 * and dips on press. Animates `transform` only. Reduced-motion users get
 * a static element with no hover transform.
 */
export function HoverLift({
  children,
  className,
  as: Tag = "div",
  lift = 2,
  press = 0.98,
  ...rest
}: HoverLiftProps) {
  const reduce = useReducedMotion();
  const Component = motion[Tag] as ElementType;
  if (reduce) {
    const Static = Tag as ElementType;
    return (
      <Static className={className} {...rest}>
        {children}
      </Static>
    );
  }
  return (
    <Component
      className={className}
      whileHover={{ y: -lift }}
      whileTap={{ scale: press }}
      transition={{ duration: 0.24, ease: OUT_EXPO }}
      {...rest}
    >
      {children}
    </Component>
  );
}
