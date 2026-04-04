import { analyzeProductWithGemini } from "@/lib/ai/gemini";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { imageDataUrl?: string };
    if (!body.imageDataUrl || typeof body.imageDataUrl !== "string") {
      return Response.json({ error: "imageDataUrl is required" }, { status: 400 });
    }
    const analysis = await analyzeProductWithGemini(body.imageDataUrl);
    return Response.json(analysis);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analysis failed";
    console.error("[api/ai/analyze]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
