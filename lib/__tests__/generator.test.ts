import { describe, it, expect } from "vitest";
import { generatePageSpec, type ModelCaller } from "../generator";
import type { PageSpec } from "../pageSpec";
import { landing } from "../fixtures/landing";

const cleanSpec = (): PageSpec => JSON.parse(JSON.stringify(landing));

const dirtySpec = (): PageSpec => {
  const spec = cleanSpec();
  const hero = spec.sections[0];
  if (hero.type === "hero") {
    hero.headline = "Unlock a seamless way to elevate your writing";
    hero.motion = { ...hero.motion, durationMs: 1600 };
  }
  return spec;
};

describe("generatePageSpec re-prompt loop", () => {
  it("returns on the first attempt when the model emits a clean spec", async () => {
    let calls = 0;
    const callModel: ModelCaller = async () => {
      calls += 1;
      return { ok: true, spec: cleanSpec() };
    };
    const res = await generatePageSpec("a calm journaling app", { callModel });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(calls).toBe(1);
    expect(res.attempts).toHaveLength(1);
    expect(res.violations.filter((v) => v.severity === "error")).toEqual([]);
  });

  it("re-prompts with corrective context when guardrails fail, then succeeds", async () => {
    let calls = 0;
    const callModel: ModelCaller = async ({ messages }) => {
      calls += 1;
      if (calls === 1) {
        return { ok: true, spec: dirtySpec() };
      }
      // Verify the re-prompt carries the corrective message.
      const last = messages[messages.length - 1];
      expect(last.role).toBe("user");
      const body = typeof last.content === "string" ? last.content : JSON.stringify(last.content);
      expect(body).toContain("REQUIRED FIXES");
      expect(body).toContain("copy.banned_cliche");
      return { ok: true, spec: cleanSpec() };
    };
    const res = await generatePageSpec("a calm journaling app", { callModel });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(calls).toBe(2);
    expect(res.attempts).toHaveLength(2);
    expect(res.violations.filter((v) => v.severity === "error")).toEqual([]);
  });

  it("gives up after maxAttempts and returns the last clamped spec with violations surfaced", async () => {
    let calls = 0;
    const callModel: ModelCaller = async () => {
      calls += 1;
      return { ok: true, spec: dirtySpec() };
    };
    const res = await generatePageSpec("a calm journaling app", { callModel, maxAttempts: 2 });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(calls).toBe(2);
    expect(res.attempts).toHaveLength(2);
    const blockers = res.violations.filter((v) => v.severity === "error");
    expect(blockers.length).toBeGreaterThan(0);
    expect(blockers.some((v) => v.code === "copy.banned_cliche")).toBe(true);
  });

  it("retries when the model fails to emit the tool call", async () => {
    let calls = 0;
    const callModel: ModelCaller = async () => {
      calls += 1;
      if (calls === 1) return { ok: false, error: "Model did not call emit_page_spec." };
      return { ok: true, spec: cleanSpec() };
    };
    const res = await generatePageSpec("a calm journaling app", { callModel });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(calls).toBe(2);
    expect(res.attempts[0].ok).toBe(false);
    expect(res.attempts[1].ok).toBe(true);
  });
});
