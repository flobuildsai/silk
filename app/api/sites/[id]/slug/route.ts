import { NextResponse } from "next/server";
import { updateSlug } from "@/lib/siteStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, { message: string; status: number }> = {
  invalid: {
    message: "Slug must be 3–40 chars, lowercase letters, numbers or hyphens.",
    status: 400,
  },
  reserved: { message: "That slug is reserved. Pick another.", status: 400 },
  taken: { message: "That slug is already taken.", status: 409 },
  "not-found": { message: "Site not found.", status: 404 },
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let body: { slug?: unknown };
  try {
    body = (await req.json()) as { slug?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be JSON { slug }" }, { status: 400 });
  }
  const raw = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!raw) {
    return NextResponse.json({ ok: false, error: "Missing slug." }, { status: 400 });
  }
  const result = await updateSlug(params.id, raw);
  if (!result.ok) {
    const info = ERROR_MESSAGES[result.error] ?? { message: "Could not update slug.", status: 400 };
    return NextResponse.json({ ok: false, error: info.message, code: result.error }, { status: info.status });
  }
  return NextResponse.json({
    ok: true,
    slug: result.record.slug,
    shareUrl: `/s/${result.record.slug}`,
  });
}
