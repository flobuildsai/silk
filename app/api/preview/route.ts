import { NextResponse } from "next/server";
import { PageSpecSchema, applyTasteEnvelope } from "@/lib/pageSpec";
import { saveSite } from "@/lib/siteStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be JSON." }, { status: 400 });
  }
  const parsed = PageSpecSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid PageSpec.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const site = await saveSite(applyTasteEnvelope(parsed.data));
  return NextResponse.json({
    ok: true,
    id: site.id,
    siteId: site.id,
    slug: site.slug,
    shareUrl: `/s/${site.slug}`,
  });
}
