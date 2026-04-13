import type {
  MarketingAssistantApiRequest,
  MarketingAssistantInventoryRow,
  MarketingAssistantMarketingSummary,
} from "@/lib/ai/types";
import { runMarketingAssistantWithGemini } from "@/lib/ai/gemini";
import { imageDataUrlTooLarge } from "@/lib/security/payload-limits";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_IMAGE_CHARS = 5_500_000;
const MAX_HISTORY = 24;
const MAX_FIELD = 6000;

function bad(msg: string, status = 400) {
  return Response.json({ error: msg }, { status });
}

function clip(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max);
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

    const inventorySummary: MarketingAssistantInventoryRow[] = Array.isArray(
      body.inventorySummary
    )
      ? body.inventorySummary
          .filter(
            (x): x is MarketingAssistantInventoryRow =>
              x != null &&
              typeof x === "object" &&
              typeof (x as { id?: unknown }).id === "string" &&
              typeof (x as { name?: unknown }).name === "string"
          )
          .slice(0, 200)
          .map((x) => ({
            id: x.id,
            name: clip(String(x.name), 200),
            narrative:
              typeof x.narrative === "string"
                ? clip(x.narrative, MAX_FIELD)
                : undefined,
            specs:
              typeof x.specs === "string" ? clip(x.specs, MAX_FIELD) : undefined,
            hasImage:
              typeof x.hasImage === "boolean" ? x.hasImage : undefined,
          }))
      : [];

    let marketingSummary: MarketingAssistantMarketingSummary | undefined;
    if (
      body.marketingSummary &&
      typeof body.marketingSummary === "object"
    ) {
      const m = body.marketingSummary as Record<string, unknown>;
      const rawPosts = Array.isArray(m.posts) ? m.posts : [];
      const posts = rawPosts
        .map((p) => {
          if (!p || typeof p !== "object") return null;
          const row = p as Record<string, unknown>;
          if (typeof row.id !== "string" || typeof row.title !== "string")
            return null;
          return {
            id: row.id,
            title: clip(String(row.title), 240),
            channel: String(row.channel ?? ""),
            scheduledAt: clip(String(row.scheduledAt ?? ""), 80),
            status: String(row.status ?? "draft"),
            notes:
              typeof row.notes === "string"
                ? clip(row.notes, MAX_FIELD)
                : undefined,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x != null)
        .slice(0, 200);
      const n8nWebhookUrl =
        typeof m.n8nWebhookUrl === "string"
          ? clip(m.n8nWebhookUrl, 2048)
          : "";
      marketingSummary = { posts, n8nWebhookUrl };
    }

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
      marketingSummary,
    });

    return Response.json(result);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Marketing assistant request failed";
    console.error("[api/ai/marketing-assistant]", e);
    return Response.json({ error: msg }, { status: 500 });
  }
}
