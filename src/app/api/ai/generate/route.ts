import Replicate from "replicate";

import { generateAdImageWithGoogleTemp } from "@/lib/ai/google-image-gen-temp";
import { imageDataUrlTooLarge } from "@/lib/security/payload-limits";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

function hasGoogleImageKey(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
      process.env.GOOGLE_AI_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim()
  );
}

/**
 * When REPLICATE_API_TOKEN is set, Replicate is used first.
 * If Replicate returns 402 / insufficient credit (or similar), we automatically fall
 * back to Google image generation when a Google API key is configured.
 * Set ADSME_FORCE_GOOGLE_IMAGE=1 (or IMAGE_GENERATION_BACKEND=google) to skip Replicate entirely.
 */
function forceGoogleImage(): boolean {
  const v = process.env.ADSME_FORCE_GOOGLE_IMAGE?.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  const backend = process.env.IMAGE_GENERATION_BACKEND?.trim().toLowerCase();
  return backend === "google";
}

/** Default keeps the uploaded product in frame; set REPLICATE_MODEL=black-forest-labs/flux-schnell for faster text-only. */
const DEFAULT_MODEL = "black-forest-labs/flux-kontext-max";

function normalizeReplicateOutput(output: unknown): string {
  if (output == null) {
    throw new Error("Empty output from Replicate");
  }
  const list = Array.isArray(output) ? output : [output];
  const first = list[0];
  if (typeof first === "string") {
    return first;
  }
  if (
    first &&
    typeof first === "object" &&
    "url" in first &&
    typeof (first as { url: unknown }).url === "function"
  ) {
    return (first as { url: () => string }).url();
  }
  if (
    first &&
    typeof first === "object" &&
    "href" in first &&
    typeof (first as { href: unknown }).href === "string"
  ) {
    return (first as { href: string }).href;
  }
  throw new Error("Could not resolve image URL from model output");
}

function modelUsesProductImage(model: string): boolean {
  const m = model.toLowerCase();
  return (
    m.includes("kontext") ||
    m.includes("image-to-image") ||
    m.includes("img2img") ||
    m.includes("ip-adapter")
  );
}

function replicateHttpStatus(e: unknown): number | undefined {
  if (!e || typeof e !== "object" || !("response" in e)) return undefined;
  const r = (e as { response?: { status?: number } }).response;
  return typeof r?.status === "number" ? r.status : undefined;
}

/** True when Replicate refused the run due to billing / zero credit — safe to try Google. */
function isReplicateCreditOrBillingFailure(e: unknown): boolean {
  if (replicateHttpStatus(e) === 402) return true;

  const msg =
    e instanceof Error ? e.message : typeof e === "string" ? e : "";
  const lower = msg.toLowerCase();
  if (msg.includes("402") || lower.includes("payment required"))
    return true;
  if (lower.includes("insufficient credit")) return true;
  if (lower.includes("purchase credit")) return true;
  if (lower.includes("account/billing")) return true;
  return false;
}

export async function POST(req: Request) {
  let body: { imageDataUrl?: string; prompt?: string };
  try {
    body = (await req.json()) as { imageDataUrl?: string; prompt?: string };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const imageDataUrl = body.imageDataUrl;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return Response.json({ error: "imageDataUrl is required" }, { status: 400 });
  }
  if (imageDataUrlTooLarge(imageDataUrl)) {
    return Response.json({ error: "Image payload too large" }, { status: 413 });
  }
  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const token = process.env.REPLICATE_API_TOKEN?.trim();
  const googleOk = hasGoogleImageKey();
  const useReplicate = Boolean(token) && !forceGoogleImage();

  if (!useReplicate) {
    if (!googleOk) {
      return Response.json(
        {
          error:
            "Add REPLICATE_API_TOKEN for image generation (recommended), or set GOOGLE_GENERATIVE_AI_API_KEY for Google image output.",
        },
        { status: 500 }
      );
    }
    try {
      const url = await generateAdImageWithGoogleTemp(imageDataUrl, prompt);
      return Response.json({ url });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Generation failed";
      console.error("[api/ai/generate] google temp", e);
      return Response.json({ error: message }, { status: 500 });
    }
  }

  const model =
    process.env.REPLICATE_MODEL?.trim() ||
    process.env.REPLICATE_GENERATE_MODEL?.trim() ||
    DEFAULT_MODEL;

  const replicate = new Replicate({ auth: token! });

  try {
    let url: string;
    if (modelUsesProductImage(model)) {
      const input: Record<string, unknown> = {
        prompt,
        input_image: imageDataUrl.trim(),
        aspect_ratio:
          process.env.REPLICATE_KONTEXT_ASPECT?.trim() || "match_input_image",
        output_format: "png",
      };
      const output = await replicate.run(
        model as `${string}/${string}`,
        { input }
      );
      url = normalizeReplicateOutput(output);
    } else {
      const input: Record<string, unknown> = {
        prompt,
        aspect_ratio: process.env.REPLICATE_SCHNELL_ASPECT?.trim() || "4:5",
        num_outputs: 1,
        output_format: "png",
        go_fast: true,
      };
      const output = await replicate.run(model as `${string}/${string}`, {
        input,
      });
      url = normalizeReplicateOutput(output);
    }
    return Response.json({ url });
  } catch (e) {
    if (googleOk && isReplicateCreditOrBillingFailure(e)) {
      console.warn(
        "[api/ai/generate] Replicate credit/billing blocked request; falling back to Google image generation"
      );
      try {
        const url = await generateAdImageWithGoogleTemp(imageDataUrl, prompt);
        return Response.json({ url });
      } catch (ge) {
        const gMsg = ge instanceof Error ? ge.message : "Google generation failed";
        console.error("[api/ai/generate] fallback google after Replicate billing error", ge);
        return Response.json({ error: gMsg }, { status: 500 });
      }
    }

    const message = e instanceof Error ? e.message : "Generation failed";
    console.error("[api/ai/generate]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
