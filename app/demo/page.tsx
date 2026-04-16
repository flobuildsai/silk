import { Renderer } from "@/components/Renderer";
import { landing } from "@/lib/fixtures/landing";
import { applyTasteEnvelope, PageSpecSchema } from "@/lib/pageSpec";

export default function Demo() {
  const spec = applyTasteEnvelope(PageSpecSchema.parse(landing));
  return <Renderer spec={spec} />;
}
