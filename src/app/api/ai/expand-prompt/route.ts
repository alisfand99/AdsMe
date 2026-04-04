import { parseAdCreativeContext } from "@/lib/ad/creative-context";
import { expandPromptWithGemini } from "@/lib/ai/gemini";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      prompt?: string;
      creativeContext?: unknown;
    };
    const prompt =
      typeof body.prompt === "string" ? body.prompt : "";
    const creativeContext = parseAdCreativeContext(body.creativeContext);
    const expanded = await expandPromptWithGemini(prompt, creativeContext);
    return Response.json(expanded);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Expansion failed";
    console.error("[api/ai/expand-prompt]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
