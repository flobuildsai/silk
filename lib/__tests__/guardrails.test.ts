import { describe, it, expect } from "vitest";
import { runGuardrails, composeRepromptMessage } from "../guardrails";
import { applyTasteEnvelope, type PageSpec } from "../pageSpec";
import { landing } from "../fixtures/landing";
import { portfolio } from "../fixtures/portfolio";

const cloneLanding = (): PageSpec => JSON.parse(JSON.stringify(landing));

describe("runGuardrails — clean fixtures", () => {
  it("accepts the landing fixture with no blocking violations", () => {
    const blockers = runGuardrails(applyTasteEnvelope(landing)).filter((v) => v.severity === "error");
    expect(blockers).toEqual([]);
  });

  it("accepts the portfolio fixture with no blocking violations", () => {
    const blockers = runGuardrails(applyTasteEnvelope(portfolio)).filter((v) => v.severity === "error");
    expect(blockers).toEqual([]);
  });
});

describe("runGuardrails — copy bans", () => {
  it("rejects banned clichés", () => {
    const spec = cloneLanding();
    const hero = spec.sections[0];
    if (hero.type === "hero") hero.headline = "Unlock a seamless way to empower your writing";
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("copy.banned_cliche");
  });

  it("rejects filler names like Acme / John Doe", () => {
    const spec = cloneLanding();
    const hero = spec.sections[0];
    if (hero.type === "hero") hero.sub = "Join teams at Acme and Nexus already shipping this.";
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("copy.banned_filler_name");
  });

  it("rejects emoji in copy", () => {
    const spec = cloneLanding();
    const hero = spec.sections[0];
    if (hero.type === "hero") hero.eyebrow = "Now in beta \u{2728}";
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("copy.emoji");
  });

  it("warns on hero headline trailing period", () => {
    const spec = cloneLanding();
    const hero = spec.sections[0];
    if (hero.type === "hero") hero.headline = "Write the quiet thoughts.";
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("copy.headline_trailing_period");
  });

  it("rejects an overlong eyebrow", () => {
    const spec = cloneLanding();
    const hero = spec.sections[0];
    if (hero.type === "hero") hero.eyebrow = "NOW IN BETA — TAKING INVITES QUICKLY";
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("copy.eyebrow_too_long");
  });
});

describe("runGuardrails — structure", () => {
  it("rejects a three-equal-card features row", () => {
    const spec = cloneLanding();
    const features = spec.sections.find((s) => s.type === "features");
    if (features && features.type === "features") features.items = features.items.slice(0, 3);
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("structure.three_card_slop");
  });

  it("rejects a hero that is not the first section", () => {
    const spec = cloneLanding();
    const [hero, ...rest] = spec.sections;
    spec.sections = [rest[0], hero, ...rest.slice(1)];
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("structure.hero_not_first");
  });

  it("rejects a static hero (entry=none)", () => {
    const spec = cloneLanding();
    const hero = spec.sections[0];
    if (hero.type === "hero") hero.motion = { ...hero.motion, entry: "none" };
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("motion.hero_static");
  });
});

describe("runGuardrails — theme", () => {
  it("rejects pure black or white palette entries", () => {
    const spec = cloneLanding();
    spec.theme.palette.bg = "#000000";
    const codes = runGuardrails(spec).map((v) => v.code);
    expect(codes).toContain("color.pure_anchor");
  });
});

describe("composeRepromptMessage", () => {
  it("returns a corrective imperative with every violation listed", () => {
    const msg = composeRepromptMessage([
      { code: "copy.banned_cliche", path: "hero.headline", message: 'banned "elevate"', severity: "error" },
      { code: "copy.headline_trailing_period", path: "hero.headline", message: "trailing period", severity: "warn" },
    ]);
    expect(msg).toContain("REQUIRED FIXES");
    expect(msg).toContain("copy.banned_cliche");
    expect(msg).toContain("hero.headline");
    expect(msg).toContain("Secondary");
    expect(msg).toContain("copy.headline_trailing_period");
    expect(msg).toMatch(/Regenerate the entire PageSpec/);
    expect(msg).toMatch(/Non-negotiables/i);
  });

  it("returns an empty-pass notice when there are no violations", () => {
    const msg = composeRepromptMessage([]);
    expect(msg).toContain("passed all guardrails");
  });
});
