import { suggestBrandProfileWithGemini } from "@/lib/ai/gemini";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      brandName?: string;
      brandTagline?: string;
      brandNarrative?: string;
      targetAudience?: string;
      brandVoice?: string;
      visualIdentityRules?: string;
    };
    const result = await suggestBrandProfileWithGemini({
      brandName: body.brandName,
      brandTagline: body.brandTagline,
      brandNarrative: body.brandNarrative,
      targetAudience: body.targetAudience,
      brandVoice: body.brandVoice,
      visualIdentityRules: body.visualIdentityRules,
    });
    return Response.json(result);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Brand profile suggestion failed";
    console.error("[api/ai/suggest-brand-profile]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
