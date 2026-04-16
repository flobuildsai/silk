import { Studio } from "@/components/Studio";

export default function StudioPage({
  searchParams,
}: {
  searchParams: { prompt?: string };
}) {
  return <Studio initialPrompt={searchParams?.prompt} />;
}
