import { describe, it } from "vitest";
import { runGuardrails, composeRepromptMessage } from "../guardrails";
import { applyTasteEnvelope, type PageSpec } from "../pageSpec";

// Intentionally dirty spec — archetypal generic-LLM output Silk must reject.
const dirty: PageSpec = {
  version: 1,
  meta: { title: "AcmeAI — Unleash Your Creativity", description: "The next-gen AI copilot for designers." },
  theme: {
    palette: { bg: "#000000", fg: "#ffffff", muted: "#888888", accent: "#6366F1" },
    typography: { displayFont: "Inter", bodyFont: "Inter", scale: "compact" },
    radius: "lg",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      motion: { entry: "fade-up", durationMs: 1600, delayMs: 400, easing: "easeOut", staggerMs: 20 },
      eyebrow: "INTRODUCING THE FUTURE OF AI CREATIVITY",
      headline: "Unlock game-changing creativity with Acme.",
      sub: "Empower your team to ship faster with seamless AI-powered workflows.",
      ctas: [{ label: "Get started", href: "#", variant: "primary" }],
      media: { kind: "none" },
    },
    {
      id: "features",
      type: "features",
      motion: { entry: "stagger", durationMs: 520, delayMs: 0, easing: "easeOut", staggerMs: 20 },
      heading: "Revolutionize your workflow",
      items: [
        { title: "Seamless", body: "Everything just works.", icon: "sparkles" },
        { title: "Fast", body: "10x faster than the competition.", icon: "bolt" },
        { title: "Smart", body: "AI-powered automation.", icon: "wand" },
      ],
    },
    {
      id: "footer",
      type: "footer",
      motion: { entry: "fade-up", durationMs: 400, delayMs: 0, easing: "easeOut", staggerMs: 0 },
      brand: "Acme",
      note: "(c) 2026 Acme.",
    },
  ],
};

describe("[demo] guardrails reject a generic spec", () => {
  it("prints the violation report + corrective re-prompt", () => {
    const clamped = applyTasteEnvelope(dirty);
    const violations = runGuardrails(clamped);
    const divider = "==================================================";
    console.log(`\n${divider}\nDIRTY SPEC VIOLATIONS (${violations.length} total)\n${divider}`);
    violations.forEach((v) => {
      console.log(`[${v.severity.toUpperCase()}] ${v.code} @ ${v.path}\n    ${v.message}`);
    });
    console.log(`\n${divider}\nCORRECTIVE RE-PROMPT (sent back to the model)\n${divider}`);
    console.log(composeRepromptMessage(violations));
    console.log(divider);
  });
});
