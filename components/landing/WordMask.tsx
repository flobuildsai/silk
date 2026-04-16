"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment } from "react";

/**
 * Headline reveal where each word sits inside an overflow-hidden clip and
 * slides up from below. Apple-style "word cadence" that reads richer than
 * a single fade-up. Respects prefers-reduced-motion by collapsing to a
 * simple opacity fade.
 */
export function WordMask({
  text,
  className,
  as = "span",
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "span";
  delay?: number;
  stagger?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const Tag = as;

  if (reduce) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
      >
        <Tag className={className}>{text}</Tag>
      </motion.div>
    );
  }

  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span
            className="inline-block overflow-hidden align-[0.1em] pb-[0.15em]"
            aria-hidden
          >
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                  mass: 0.8,
                  delay: delay + i * stagger,
                  duration,
                },
              }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
