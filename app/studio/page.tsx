import { Studio } from "@/components/Studio";

export default function StudioPage({
  searchParams,
}: {
  searchParams: { prompt?: string; url?: string };
}) {
  return (
    <Studio
      initialPrompt={searchParams?.prompt}
      initialUrl={searchParams?.url}
    />
  );
}
