import { parseAdCreativeContext } from "@/lib/ad/creative-context";
import { composeCanvasAdjustmentsWithGemini } from "@/lib/ai/gemini";

import type { CanvasSceneAdjustments } from "@/lib/canvas/canvas-adjustments";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function parseAdjustments(raw: unknown): CanvasSceneAdjustments | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const num = (k: string, d: number) =>
    typeof o[k] === "number" && Number.isFinite(o[k] as number)
      ? (o[k] as number)
      : d;
  return {
    framingZoom: num("framingZoom", 1),
    orbitYawDeg: num("orbitYawDeg", 0),
    orbitPitchDeg: num("orbitPitchDeg", 0),
    subjectRollDeg: num("subjectRollDeg", 0),
    lightAzimuthDeg: num("lightAzimuthDeg", 45),
    lightElevationDeg: num("lightElevationDeg", 38),
    lightHardness: num("lightHardness", 0.45),
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      currentImagePrompt?: string;
      adjustments?: unknown;
      creativeContext?: unknown;
    };
    const currentImagePrompt =
      typeof body.currentImagePrompt === "string"
        ? body.currentImagePrompt
        : "";
    /** Scene compose is delta-only; long iteration brief is not required. */
    const adjustments = parseAdjustments(body.adjustments);
    if (!adjustments) {
      return Response.json(
        { error: "valid adjustments object is required" },
        { status: 400 }
      );
    }
    const creativeContext = parseAdCreativeContext(body.creativeContext);
    const baselineScene = parseAdjustments(
      (body as { baselineScene?: unknown }).baselineScene
    );
    const result = await composeCanvasAdjustmentsWithGemini({
      currentImagePrompt,
      adjustments,
      baselineScene: baselineScene ?? undefined,
      creativeContext,
    });
    return Response.json(result);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Canvas compose failed";
    console.error("[api/ai/compose-canvas-adjustments]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
