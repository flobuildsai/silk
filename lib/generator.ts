import Anthropic from "@anthropic-ai/sdk";
import {
  PageSpecSchema,
  applyTasteEnvelope,
  DISPLAY_FONTS,
  BODY_FONTS,
  type PageSpec,
} from "@/lib/pageSpec";
import { landing } from "@/lib/fixtures/landing";
import { runGuardrails, composeRepromptMessage, type Violation } from "@/lib/guardrails";

/**
 * SILK_SYSTEM_PROMPT distills the leonxlnx/taste-skill family of skills
 * (taste-skill, minimalist-skill, brutalist-skill, soft-skill, output-skill)
 * into a single prompt that the PageSpec schema can constrain. Skill
 * markdown lives under `skills/` for reference — rules here are the
 * condensed operative surface the model sees on every call.
 */
export const SILK_SYSTEM_PROMPT = `You are the page designer for Silk, a tool that turns a short prompt into a beautifully-animated, one-page website. You design like a senior UI engineer at a top agency (Awwwards-tier). You never ship generic SaaS slop.

CORE DIRECTIVES
- Output a single PageSpec via the emit_page_spec tool. Never prose, never markdown.
- Pick ONE archetype for the project and commit: "minimalist-ui", "editorial-luxury", or "industrial-brutalist". Do not mix modes mid-page.
- Real copy only. Specific verbs, quiet sentences, no marketing slop. Banned phrases: elevate, seamless, unleash, empower, unlock, leverage, supercharge, revolutionize, reimagine, next-gen, game-changing, cutting-edge, disruptive.
- Banned filler names: John Doe, Jane Doe, Acme, Nexus, SmartFlow, Lorem ipsum. Invent premium, contextual brand + people names.
- No emoji anywhere — copy, labels, alt text, or content. Replace with icon tokens (sparkles, bolt, grid, wand, globe, shield).
- Colors: one accent, saturation ≤ 80%. Never pure #000000 or #FFFFFF — use off-whites and near-blacks. Banned: AI-purple gradient glows, neon outer shadows.
- Fonts: pick from displayFont ${JSON.stringify(DISPLAY_FONTS)} and bodyFont ${JSON.stringify(BODY_FONTS)}. Inter is forbidden for display.
- Sections: exactly one hero (first) and one footer (last). Between them, 2–4 of: features, gallery, cta. Order communicates hierarchy.
- Features must NOT have exactly 3 items (Bootstrap three-card slop). Use 2, 4, or 5.
- Headlines: one idea per line, no trailing period. Eyebrows ≤ 24 chars. Hero headline ≤ 140 chars.

MOTION ENVELOPE (vestibular-safe, enforced)
- durationMs 200–900. delayMs ≤ 120 on hero. staggerMs 40–120 for stagger entries, else 0.
- Max 2 parallel entry effects per viewport. Any extra sections must use entry:"none".
- Footer must always use entry:"none" (stable-ground default).
- Easing: easeOut, easeInOut, circOut, anticipate, or backOut. No linear.
- Translate ≤ 16px. Never animate top/left/width/height — transform + opacity only.

ARCHETYPE PLAYBOOK — pick one, commit, and set \`archetype\` accordingly.

[minimalist-ui] Premium utilitarian minimalism. Editorial workspace feel.
  palette: warm off-white bg (#F7F6F3 / #FBFBFA / #FFFFFF), ink fg (#111111 / #2F3437), muted gray (#787774 / #6A6A66), one restrained accent ≤80% sat (deep green #346538, terracotta #B44B2F, navy #1F4A7A, or washed pastel).
  typography: displayFont Instrument Serif / Newsreader / Fraunces; bodyFont Geist or Manrope. tracking tight, line-height 1.1 on headings.
  radius: "md" or "lg". crisp 1px hairline dividers.
  motion: 400–700ms, fade-up or fade. translate ≤16px. staggerMs 60–90. Quiet entries — invisible but present.
  copy: calm, editorial, specific. Verbs like "read", "notice", "write", "keep", "remember".

[editorial-luxury] Warm cream paper, confident serif, agency-tier haptic depth.
  palette: cream bg (#FDFBF7 / #F5F1EA / #F4EFE5), deep ink fg (#1C1917 / #191511), muted warm gray (#8A8275 / #7A6F5E), one deep accent: espresso #3B2A22 / muted sage #7C8B72 / deep rose #A34560 / dusk blue #3E4D6A.
  typography: displayFont Playfair Display / Fraunces / Newsreader; bodyFont Geist or Manrope. tracking -0.02em, line-height 1.02 on hero.
  radius: "lg" or "full". double-bezel (nested card surface) allowed.
  motion: 600–900ms, fade-up or blur-in. staggerMs 80–120. Cinematic but slow — never jittery.
  copy: slow, confident, exact. Long vowels. Avoid CTAs that shout.

[industrial-brutalist] Raw mechanical. Swiss Print (light) OR Tactical Telemetry (dark). Pick ONE substrate.
  palette option A (Swiss Print): bg #F4F4F0 / #EAE8E3, fg #050505 / #111111, muted #5A5A55, accent aviation-red #E61919 used sparingly.
  palette option B (Tactical Telemetry): bg #0A0A0A / #121212, fg #EAEAEA, muted #8A8A8A, accent aviation-red #E61919 or phosphor-green #4AF626 (one only).
  typography: displayFont Archivo Black UPPERCASE; bodyFont Neue Haas Grotesk or Geist. tracking -0.03em, line-height 0.9 on hero. All structural headers uppercase.
  radius: "none". 90° corners only. Visible 1–2px solid borders for compartmentalization.
  motion: 120–300ms snap. entry: fade or none. No blur-in, no float. staggerMs 40–60.
  copy: terse, operational, uppercase eyebrows. Acronyms and unit IDs welcome (UNIT / D-01, REV 2.6).

OUTPUT CONTRACT
- Call emit_page_spec exactly once with a PageSpec object. Include \`archetype\`. No prose, no markdown wrapping.
- Before emitting, silently check the Pre-Output Checklist: no banned clichés, no emoji, no pure #000/#FFF, no Inter for display, no 3-item feature row, exactly one hero + one footer, footer entry="none", all hex colors lowercased.`;

export const PAGE_SPEC_TOOL: Anthropic.Tool = {
  name: "emit_page_spec",
  description: "Emit the final PageSpec for the requested page.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["version", "archetype", "meta", "theme", "sections"],
    properties: {
      version: { type: "number", enum: [1] },
      archetype: {
        type: "string",
        enum: ["minimalist-ui", "editorial-luxury", "industrial-brutalist"],
      },
      meta: {
        type: "object",
        required: ["title", "description"],
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 80 },
          description: { type: "string", maxLength: 200 },
        },
      },
      theme: {
        type: "object",
        required: ["palette", "typography", "radius"],
        additionalProperties: false,
        properties: {
          palette: {
            type: "object",
            required: ["bg", "fg", "muted", "accent"],
            additionalProperties: false,
            properties: {
              bg: { type: "string", pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$" },
              fg: { type: "string", pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$" },
              muted: { type: "string", pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$" },
              accent: { type: "string", pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$" },
              accent2: { type: "string", pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$" },
            },
          },
          typography: {
            type: "object",
            required: ["displayFont", "bodyFont", "scale"],
            additionalProperties: false,
            properties: {
              displayFont: { type: "string", enum: [...DISPLAY_FONTS] },
              bodyFont: { type: "string", enum: [...BODY_FONTS] },
              scale: { type: "string", enum: ["compact", "editorial", "oversized"] },
            },
          },
          radius: { type: "string", enum: ["none", "sm", "md", "lg", "full"] },
        },
      },
      sections: {
        type: "array",
        minItems: 2,
        maxItems: 6,
        items: { type: "object" },
      },
    },
  },
};

export type GenerateAttempt = {
  attempt: number;
  ok: boolean;
  violations?: Violation[];
  error?: string;
  latencyMs: number;
};

export type GenerateResult =
  | {
      ok: true;
      spec: PageSpec;
      source: "llm" | "fallback";
      latencyMs: number;
      attempts: GenerateAttempt[];
      violations: Violation[];
    }
  | {
      ok: false;
      error: string;
      attempts: GenerateAttempt[];
    };

const DEFAULT_MAX_ATTEMPTS = 3;

/** Injected for tests — a callable that takes messages + system prompt and returns a parsed PageSpec or an error string. */
export type ModelCaller = (args: {
  messages: Anthropic.MessageParam[];
  system: string;
}) => Promise<{ ok: true; spec: PageSpec } | { ok: false; error: string }>;

const defaultModelCaller: ModelCaller = async ({ messages, system }) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY not set" };
  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    temperature: 0.7,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    tools: [PAGE_SPEC_TOOL],
    tool_choice: { type: "tool", name: "emit_page_spec" },
    messages,
  });
  const toolUse = res.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return { ok: false, error: "Model did not call emit_page_spec." };
  }
  const parsed = PageSpecSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    return { ok: false, error: `PageSpec failed schema validation: ${parsed.error.message}` };
  }
  return { ok: true, spec: parsed.data };
};

export async function generatePageSpec(
  prompt: string,
  opts?: { maxAttempts?: number; callModel?: ModelCaller; directive?: string }
): Promise<GenerateResult> {
  const started = Date.now();
  const maxAttempts = opts?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const callModel = opts?.callModel ?? defaultModelCaller;
  const attempts: GenerateAttempt[] = [];

  // Fallback path when no API key and no injected caller: return the hand-written fixture.
  if (!opts?.callModel && !process.env.ANTHROPIC_API_KEY) {
    const spec = applyTasteEnvelope({
      ...landing,
      meta: { ...landing.meta, description: `[fallback spec — no ANTHROPIC_API_KEY set] ${prompt}` },
    });
    return {
      ok: true,
      spec,
      source: "fallback",
      latencyMs: Date.now() - started,
      attempts,
      violations: runGuardrails(spec),
    };
  }

  const userContent = opts?.directive
    ? `${opts.directive.trim()}\n\nBrief: ${prompt.trim()}`
    : `Brief: ${prompt.trim()}`;
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userContent }];

  for (let i = 1; i <= maxAttempts; i += 1) {
    const attemptStarted = Date.now();
    const call = await callModel({ messages, system: SILK_SYSTEM_PROMPT });
    const latencyMs = Date.now() - attemptStarted;

    if (!call.ok) {
      attempts.push({ attempt: i, ok: false, error: call.error, latencyMs });
      if (i === maxAttempts) {
        return { ok: false, error: call.error, attempts };
      }
      messages.push(
        { role: "assistant", content: "(prior call failed to emit emit_page_spec)" },
        { role: "user", content: "Your previous response did not call emit_page_spec. Call emit_page_spec exactly once with a valid PageSpec. No prose." }
      );
      continue;
    }

    const clamped = applyTasteEnvelope(call.spec);
    const violations = runGuardrails(clamped);
    attempts.push({ attempt: i, ok: true, violations, latencyMs });

    const blockingViolations = violations.filter((v) => v.severity === "error");
    if (blockingViolations.length === 0) {
      return {
        ok: true,
        spec: clamped,
        source: "llm",
        latencyMs: Date.now() - started,
        attempts,
        violations,
      };
    }

    if (i === maxAttempts) {
      return {
        ok: true,
        spec: clamped,
        source: "llm",
        latencyMs: Date.now() - started,
        attempts,
        violations,
      };
    }

    messages.push(
      { role: "assistant", content: JSON.stringify(call.spec) },
      { role: "user", content: composeRepromptMessage(violations) }
    );
  }

  return { ok: false, error: "generation loop exhausted without result", attempts };
}
