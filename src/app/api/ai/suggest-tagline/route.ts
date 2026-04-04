import { suggestTaglinesWithGemini } from "@/lib/ai/gemini";
import { imageDataUrlTooLarge } from "@/lib/security/payload-limits";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      productSummary?: string;
      brandName?: string;
      imageDataUrl?: string;
    };
    const productSummary =
      typeof body.productSummary === "string" ? body.productSummary : "";
    if (!productSummary.trim()) {
      return Response.json(
        { error: "productSummary is required (e.g. category, materials, colors)" },
        { status: 400 }
      );
    }
    const optionalImage =
      typeof body.imageDataUrl === "string" ? body.imageDataUrl : undefined;
    if (optionalImage && imageDataUrlTooLarge(optionalImage)) {
      return Response.json({ error: "Image payload too large" }, { status: 413 });
    }
    const result = await suggestTaglinesWithGemini({
      productSummary,
      brandName: body.brandName,
      imageDataUrl: optionalImage,
    });
    return Response.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Tagline suggestion failed";
    console.error("[api/ai/suggest-tagline]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
