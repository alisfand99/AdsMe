import type { MarketingAssistantApiRequest } from "@/lib/ai/types";
import { runMarketingAssistantWithGemini } from "@/lib/ai/gemini";
import { imageDataUrlTooLarge } from "@/lib/security/payload-limits";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_IMAGE_CHARS = 5_500_000;
const MAX_HISTORY = 24;

function bad(msg: string, status = 400) {
  return Response.json({ error: msg }, { status });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<MarketingAssistantApiRequest>;
    const message = typeof body.message === "string" ? body.message : "";
    if (!message.trim()) {
      return bad("message is required");
    }
    const history = Array.isArray(body.history) ? body.history : [];
    if (history.length > MAX_HISTORY) {
      return bad(`history too long (max ${MAX_HISTORY})`);
    }
    for (const h of history) {
      if (h.role !== "user" && h.role !== "assistant") {
        return bad("invalid history role");
      }
      if (typeof h.content !== "string") return bad("invalid history content");
    }
    const brandProfile =
      body.brandProfile && typeof body.brandProfile === "object"
        ? (body.brandProfile as Record<string, unknown>)
        : {};
    const inventorySummary = Array.isArray(body.inventorySummary)
      ? body.inventorySummary
          .filter(
            (x): x is { id: string; name: string } =>
              x &&
              typeof x === "object" &&
              typeof (x as { id?: string }).id === "string" &&
              typeof (x as { name?: string }).name === "string"
          )
          .slice(0, 200)
      : [];

    const images = Array.isArray(body.images) ? body.images : [];
    if (images.length > 3) return bad("At most 3 images per message");
    for (const img of images) {
      if (typeof img !== "string" || !img.startsWith("data:")) {
        return bad("images must be data URLs");
      }
      if (imageDataUrlTooLarge(img) || img.length > MAX_IMAGE_CHARS) {
        return Response.json(
          { error: "Image too large for assistant upload" },
          { status: 413 }
        );
      }
    }

    const result = await runMarketingAssistantWithGemini({
      history: history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      message,
      images,
      brandProfile,
      inventorySummary,
    });

    return Response.json(result);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Marketing assistant request failed";
    console.error("[api/ai/marketing-assistant]", e);
    return Response.json({ error: msg }, { status: 500 });
  }
}
