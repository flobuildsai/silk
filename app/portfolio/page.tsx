import { Renderer } from "@/components/Renderer";
import { portfolio } from "@/lib/fixtures/portfolio";
import { applyTasteEnvelope, PageSpecSchema } from "@/lib/pageSpec";

export default function Portfolio() {
  const spec = applyTasteEnvelope(PageSpecSchema.parse(portfolio));
  return <Renderer spec={spec} />;
}
