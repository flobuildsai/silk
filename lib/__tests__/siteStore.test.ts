import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { landing } from "@/lib/fixtures/landing";

let tmpRoot: string;
let originalCwd: string;

beforeAll(async () => {
  originalCwd = process.cwd();
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "silk-sitestore-"));
  process.chdir(tmpRoot);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

afterEach(async () => {
  await fs.rm(path.join(tmpRoot, ".silk"), { recursive: true, force: true });
  vi.resetModules();
});

async function freshStore() {
  vi.resetModules();
  return (await import("@/lib/siteStore")) as typeof import("@/lib/siteStore");
}

describe("siteStore", () => {
  it("saves a site and reads it by id and slug", async () => {
    const { saveSite, getSiteById, getSiteBySlug } = await freshStore();
    const record = await saveSite(landing);
    expect(record.id).toMatch(/^[a-f0-9]{18}$/);
    expect(record.slug).toMatch(/^[a-z0-9-]+$/);

    const byId = await getSiteById(record.id);
    expect(byId?.spec.meta.title).toBe(landing.meta.title);

    const bySlug = await getSiteBySlug(record.slug);
    expect(bySlug?.id).toBe(record.id);
  });

  it("persists data on disk and survives a fresh module load", async () => {
    const first = await freshStore();
    const record = await first.saveSite(landing);

    const onDisk = await fs.readFile(
      path.join(tmpRoot, ".silk", "sites", `${record.id}.json`),
      "utf8"
    );
    expect(JSON.parse(onDisk).slug).toBe(record.slug);

    const second = await freshStore();
    const rehydrated = await second.getSiteBySlug(record.slug);
    expect(rehydrated?.id).toBe(record.id);
    expect(rehydrated?.spec.sections.length).toBe(landing.sections.length);
  });

  it("rejects invalid / reserved slugs and allows valid renames", async () => {
    const { saveSite, updateSlug, getSiteBySlug } = await freshStore();
    const record = await saveSite(landing);

    const invalid = await updateSlug(record.id, "Bad Slug!");
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.error).toBe("invalid");

    const reserved = await updateSlug(record.id, "api");
    expect(reserved.ok).toBe(false);
    if (!reserved.ok) expect(reserved.error).toBe("reserved");

    const renamed = await updateSlug(record.id, "linen-parlor");
    expect(renamed.ok).toBe(true);
    if (renamed.ok) expect(renamed.record.slug).toBe("linen-parlor");

    const oldLookup = await getSiteBySlug(record.slug);
    expect(oldLookup).toBeNull();
    const newLookup = await getSiteBySlug("linen-parlor");
    expect(newLookup?.id).toBe(record.id);
  });

  it("refuses to collide with an existing slug", async () => {
    const { saveSite, updateSlug } = await freshStore();
    const a = await saveSite(landing);
    const b = await saveSite(landing);
    const renamedA = await updateSlug(a.id, "velvet-orchard");
    expect(renamedA.ok).toBe(true);
    const collision = await updateSlug(b.id, "velvet-orchard");
    expect(collision.ok).toBe(false);
    if (!collision.ok) expect(collision.error).toBe("taken");
  });

  it("returns null for unknown id / slug", async () => {
    const { getSiteById, getSiteBySlug } = await freshStore();
    expect(await getSiteById("unknowndead")).toBeNull();
    expect(await getSiteBySlug("nope-nope-0000")).toBeNull();
  });
});
