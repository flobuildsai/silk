import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Renderer } from "@/components/Renderer";
import { getSiteBySlug } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

function baseUrl() {
  const envBase = process.env.SILK_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  return "";
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const site = await getSiteBySlug(params.slug);
  if (!site) {
    return { title: "Silk — site not found" };
  }
  const { meta } = site.spec;
  const base = baseUrl();
  const shareUrl = `${base}/s/${site.slug}`;
  const ogUrl = `${base}/s/${site.slug}/opengraph-image`;
  return {
    title: `${meta.title} · Silk`,
    description: meta.description,
    openGraph: {
      type: "website",
      url: shareUrl || undefined,
      title: meta.title,
      description: meta.description,
      siteName: "Silk",
      images: [{ url: ogUrl || "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [ogUrl || "/opengraph-image"],
    },
  };
}

export default async function SharePage({ params }: Params) {
  const site = await getSiteBySlug(params.slug);
  if (!site) notFound();
  return <Renderer spec={site.spec} />;
}
