import { NextResponse } from "next/server";
import { generatePageSpec } from "@/lib/generator";
import { findArchetype } from "@/lib/archetypes";
import { saveSite } from "@/lib/siteStore";
import { scrapeUrl, briefFromScrape } from "@/lib/scrape";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let url = "";
  let archetypeKey: string | undefined;
  try {
    const body = (await req.json()) as { url?: string; archetype?: string };
    url = (body?.url ?? "").toString();
    archetypeKey = body?.archetype;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body must be JSON { url, archetype? }" },
      { status: 400 }
    );
  }
  if (!url || url.trim().length < 4) {
    return NextResponse.json(
      { ok: false, error: "URL too short." },
      { status: 400 }
    );
  }

  const scrape = await scrapeUrl(url);
  if (!scrape.ok) {
    return NextResponse.json(
      { ok: false, error: `Couldn't read source: ${scrape.error}` },
      { status: 400 }
    );
  }

  const brief = briefFromScrape(scrape);
  const archetype = archetypeKey ? findArchetype(archetypeKey) : undefined;
  const result = await generatePageSpec(brief, {
    directive: archetype?.directive,
  });
  if (!result.ok) return NextResponse.json(result, { status: 502 });

  const site = await saveSite(result.spec);
  return NextResponse.json({
    ...result,
    previewId: site.id,
    siteId: site.id,
    slug: site.slug,
    shareUrl: `/s/${site.slug}`,
    archetype: result.spec.archetype,
    source: result.source,
    sourceUrl: scrape.finalUrl,
  });
}
