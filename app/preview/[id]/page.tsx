import { notFound } from "next/navigation";
import { Renderer } from "@/components/Renderer";
import { getSiteById } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const site = await getSiteById(params.id);
  if (!site) notFound();
  return <Renderer spec={site.spec} />;
}
