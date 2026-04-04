import { refineWithGemini } from "@/lib/ai/gemini";

import type { ChatTurn } from "@/lib/ai/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      history?: ChatTurn[];
      message?: string;
      currentImagePrompt?: string;
    };
    const history = Array.isArray(body.history) ? body.history : [];
    const message = typeof body.message === "string" ? body.message : "";
    if (!message.trim()) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }
    const currentImagePrompt =
      typeof body.currentImagePrompt === "string"
        ? body.currentImagePrompt
        : "";
    const result = await refineWithGemini(history, message, {
      currentImagePrompt,
    });
    return Response.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Refinement failed";
    console.error("[api/ai/refine]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
