import { promises as fs } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import type { PageSpec } from "@/lib/pageSpec";

export type SiteRecord = {
  id: string;
  slug: string;
  spec: PageSpec;
  createdAt: number;
  updatedAt: number;
};

const ROOT = path.join(process.cwd(), ".silk");
const SITES_DIR = path.join(ROOT, "sites");
const SLUGS_DIR = path.join(ROOT, "slugs");

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;
const RESERVED_SLUGS = new Set([
  "api",
  "s",
  "preview",
  "studio",
  "portfolio",
  "demo",
  "assets",
  "public",
  "static",
  "admin",
  "login",
  "signup",
  "pricing",
  "docs",
  "help",
  "silk",
  "new",
  "settings",
  "_next",
  "favicon",
]);

const WORD_LEFT = [
  "linen",
  "velvet",
  "cedar",
  "amber",
  "dune",
  "moss",
  "slate",
  "ivory",
  "cobalt",
  "quartz",
  "marigold",
  "ember",
  "indigo",
  "clay",
  "pearl",
  "onyx",
  "copper",
  "saffron",
  "mint",
  "coral",
];

const WORD_RIGHT = [
  "atrium",
  "harbor",
  "meadow",
  "ridge",
  "parlor",
  "aviary",
  "loft",
  "terrace",
  "grove",
  "library",
  "studio",
  "garden",
  "foundry",
  "gallery",
  "lantern",
  "orchard",
  "bureau",
  "cloister",
  "hollow",
  "plaza",
];

function hex(len: number): string {
  return randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}

export function newSiteId(): string {
  return hex(18);
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function generateSlug(): string {
  return `${pick(WORD_LEFT)}-${pick(WORD_RIGHT)}-${hex(4)}`;
}

export type SlugError = "invalid" | "reserved" | "taken";

export function validateSlugShape(slug: string): SlugError | null {
  if (!SLUG_RE.test(slug)) return "invalid";
  if (RESERVED_SLUGS.has(slug)) return "reserved";
  return null;
}

async function ensureDirs() {
  await fs.mkdir(SITES_DIR, { recursive: true });
  await fs.mkdir(SLUGS_DIR, { recursive: true });
}

function siteFile(id: string) {
  return path.join(SITES_DIR, `${id}.json`);
}

function slugFile(slug: string) {
  return path.join(SLUGS_DIR, `${slug}.json`);
}

async function writeJsonAtomic(file: string, value: unknown) {
  const tmp = `${file}.${hex(6)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value), "utf8");
  await fs.rename(tmp, file);
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function allocateSlug(): Promise<string> {
  for (let i = 0; i < 16; i++) {
    const s = generateSlug();
    const existing = await readJson<{ id: string }>(slugFile(s));
    if (!existing) return s;
  }
  return `site-${hex(8)}`;
}

export async function saveSite(spec: PageSpec): Promise<SiteRecord> {
  await ensureDirs();
  const id = newSiteId();
  const slug = await allocateSlug();
  const now = Date.now();
  const record: SiteRecord = { id, slug, spec, createdAt: now, updatedAt: now };
  await writeJsonAtomic(siteFile(id), record);
  await writeJsonAtomic(slugFile(slug), { id });
  return record;
}

export async function getSiteById(id: string): Promise<SiteRecord | null> {
  if (!id || !/^[a-z0-9-]{1,64}$/i.test(id)) return null;
  return readJson<SiteRecord>(siteFile(id));
}

export async function getSiteBySlug(slug: string): Promise<SiteRecord | null> {
  if (validateSlugShape(slug)) return null;
  const pointer = await readJson<{ id: string }>(slugFile(slug));
  if (!pointer?.id) return null;
  return getSiteById(pointer.id);
}

export type UpdateSlugResult =
  | { ok: true; record: SiteRecord }
  | { ok: false; error: SlugError | "not-found" };

export async function updateSlug(id: string, nextSlug: string): Promise<UpdateSlugResult> {
  const shape = validateSlugShape(nextSlug);
  if (shape) return { ok: false, error: shape };
  const record = await getSiteById(id);
  if (!record) return { ok: false, error: "not-found" };
  if (record.slug === nextSlug) return { ok: true, record };

  const taken = await readJson<{ id: string }>(slugFile(nextSlug));
  if (taken && taken.id !== id) return { ok: false, error: "taken" };

  const updated: SiteRecord = { ...record, slug: nextSlug, updatedAt: Date.now() };
  await writeJsonAtomic(siteFile(id), updated);
  await writeJsonAtomic(slugFile(nextSlug), { id });
  if (record.slug !== nextSlug) {
    try {
      await fs.unlink(slugFile(record.slug));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }
  return { ok: true, record: updated };
}

export async function listSites(limit = 20): Promise<SiteRecord[]> {
  await ensureDirs();
  const files = await fs.readdir(SITES_DIR).catch(() => [] as string[]);
  const records: SiteRecord[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const r = await readJson<SiteRecord>(path.join(SITES_DIR, f));
    if (r) records.push(r);
  }
  records.sort((a, b) => b.updatedAt - a.updatedAt);
  return records.slice(0, limit);
}

export const __test = { ROOT, SITES_DIR, SLUGS_DIR, RESERVED_SLUGS, SLUG_RE };
