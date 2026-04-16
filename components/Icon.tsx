"use client";

/**
 * Inline SVG icon set keyed by the enum in `pageSpec.ts`. We ship our own
 * instead of pulling a library so icons render without any extra runtime
 * and we control stroke weight and scale. Stroke width is standardized to
 * 1.5 per the taste-skill icon rule.
 */

export type IconName =
  | "sparkles"
  | "bolt"
  | "grid"
  | "wand"
  | "globe"
  | "shield";

const PATHS: Record<IconName, React.ReactNode> = {
  sparkles: (
    <>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
      <path d="M7 7l2 2M17 17l-2-2M7 17l2-2M17 7l-2 2" />
    </>
  ),
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" strokeLinejoin="round" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </>
  ),
  wand: (
    <>
      <path d="M4 20l12-12" />
      <path d="M14 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" strokeLinejoin="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 3 2.6 14 0 17M12 3.5c-2.6 3-2.6 14 0 17" />
    </>
  ),
  shield: (
    <path
      d="M12 3.5l7 2.5v5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6l7-2.5z"
      strokeLinejoin="round"
    />
  ),
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const d = PATHS[name] ?? PATHS.sparkles;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      {d}
    </svg>
  );
}
