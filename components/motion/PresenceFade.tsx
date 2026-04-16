"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { OUT_EXPO, REDUCED_DURATION } from "./constants";

type PresenceFadeProps = {
  show: boolean;
  children: ReactNode;
  className?: string;
  /** Translation in pixels accompanying the entry/exit fade. */
  offset?: number;
  /** Optional key to force re-mount on identity change. */
  itemKey?: string;
};

/**
 * Mount/unmount transition wrapper. Uses framer-motion's AnimatePresence
 * so the exit animation plays before the child unmounts. Honours reduced
 * motion by collapsing to a short cross-fade.
 */
export function PresenceFade({
  show,
  children,
  className,
  offset = 8,
  itemKey,
}: PresenceFadeProps) {
  const reduce = useReducedMotion();
  const duration = reduce ? REDUCED_DURATION : 0.36;
  const y = reduce ? 0 : offset;
  return (
    <AnimatePresence mode="wait" initial={false}>
      {show && (
        <motion.div
          key={itemKey}
          className={className}
          initial={{ opacity: 0, y }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -y }}
          transition={{ duration, ease: OUT_EXPO }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
