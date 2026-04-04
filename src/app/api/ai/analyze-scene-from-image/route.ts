import { inferCanvasSceneFromImageWithGemini } from "@/lib/ai/gemini";
import { imageDataUrlTooLarge } from "@/lib/security/payload-limits";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { imageDataUrl?: string };
    const imageDataUrl =
      typeof body.imageDataUrl === "string" ? body.imageDataUrl.trim() : "";
    if (!imageDataUrl) {
      return Response.json(
        { error: "imageDataUrl is required" },
        { status: 400 }
      );
    }
    if (imageDataUrlTooLarge(imageDataUrl)) {
      return Response.json({ error: "Image payload too large" }, { status: 413 });
    }
    const adjustments = await inferCanvasSceneFromImageWithGemini(
      imageDataUrl
    );
    return Response.json({ adjustments });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Scene analysis failed";
    console.error("[api/ai/analyze-scene-from-image]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
