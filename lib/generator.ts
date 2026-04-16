import Anthropic from "@anthropic-ai/sdk";
import { PageSpecSchema, applyTasteEnvelope, type PageSpec } from "@/lib/pageSpec";
import { landing } from "@/lib/fixtures/landing";
import { runGuardrails, composeRepromptMessage, type Violation } from "@/lib/guardrails";

export const SILK_SYSTEM_PROMPT = `You are the page designer for Silk, a tool that turns a short prompt into a beautifully-animated one-page website.

Taste rules — non-negotiable:
- Editorial, object-like design. Generous whitespace. Strong typographic hierarchy using a serif display (Fraunces, Playfair Display, or Instrument Serif) paired with a modern sans (Inter, Geist, Manrope).
- Palette: warm off-whites or deep near-blacks for bg. One restrained accent hex. Never pure #FFFFFF or pure #000000 unless the brief demands it.
- Copy: real sentences, specific and quiet. No "revolutionary", "unlock", "empower", "game-changing", "seamless", "leverage". No emoji. No "John Doe" / "Acme" / "Nexus" filler names.
- Motion envelope: duration 200–900ms; max 2 parallel entry effects per viewport; stagger 40–120ms; easing from easeOut/easeInOut/circOut/anticipate/backOut. Respect prefers-reduced-motion — choose none for the footer.
- Sections: exactly one hero (first) and exactly one footer (last). Between them, 2–4 of: features, gallery, cta. Order matters.
- Features sections must NOT have exactly 3 items (Bootstrap three-column slop). Use 2, 4, or 5 items.

Output shape:
Call the tool emit_page_spec exactly once with a PageSpec object. Never produce prose. Never wrap in markdown. Never invent fields not in the schema.`;

export const PAGE_SPEC_TOOL: Anthropic.Tool = {
  name: "emit_page_spec",
  description: "Emit the final PageSpec for the requested page.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["version", "meta", "theme", "sections"],
    properties: {
      version: { type: "number", enum: [1] },
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
              displayFont: { type: "string", enum: ["Fraunces", "Playfair Display", "Instrument Serif", "Inter", "Geist"] },
              bodyFont: { type: "string", enum: ["Inter", "Geist", "IBM Plex Sans", "Manrope"] },
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
      // Fatal: model did not emit a spec. Retry once, then give up.
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
      // Return the last spec anyway — marked ok because we have a renderable spec —
      // but surface the violations so the UI can warn the user.
      return {
        ok: true,
        spec: clamped,
        source: "llm",
        latencyMs: Date.now() - started,
        attempts,
        violations,
      };
    }

    // Re-prompt with corrective context. Keep the prior turn visible so the
    // model knows what it emitted and why it was rejected.
    messages.push(
      { role: "assistant", content: JSON.stringify(call.spec) },
      { role: "user", content: composeRepromptMessage(violations) }
    );
  }

  // Unreachable, but TypeScript needs an exit.
  return { ok: false, error: "generation loop exhausted without result", attempts };
}
