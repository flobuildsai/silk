import { NextResponse } from "next/server";
import { generatePageSpec } from "@/lib/generator";
import { findArchetype } from "@/lib/archetypes";
import { saveSite } from "@/lib/siteStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let prompt = "";
  let archetypeKey: string | undefined;
  try {
    const body = (await req.json()) as { prompt?: string; archetype?: string };
    prompt = (body?.prompt ?? "").toString();
    archetypeKey = body?.archetype;
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be JSON { prompt, archetype? }" }, { status: 400 });
  }
  if (!prompt || prompt.trim().length < 8) {
    return NextResponse.json({ ok: false, error: "Prompt too short (min 8 chars)." }, { status: 400 });
  }
  const archetype = findArchetype(archetypeKey);
  const result = await generatePageSpec(prompt, { directive: archetype.directive });
  if (!result.ok) return NextResponse.json(result, { status: 502 });
  const site = await saveSite(result.spec);
  return NextResponse.json({
    ...result,
    previewId: site.id,
    siteId: site.id,
    slug: site.slug,
    shareUrl: `/s/${site.slug}`,
    archetype: archetype.key,
  });
}
