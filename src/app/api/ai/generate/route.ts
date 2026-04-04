import Replicate from "replicate";

import { generateAdImageWithGoogleTemp } from "@/lib/ai/google-image-gen-temp";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

function forceGoogleImageBackend(): boolean {
  const v = process.env.ADSME_USE_GOOGLE_IMAGE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function hasGoogleImageKey(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
      process.env.GOOGLE_AI_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim()
  );
}

/** Default keeps the uploaded product in frame; set REPLICATE_MODEL=black-forest-labs/flux-schnell for faster text-only. */
const DEFAULT_MODEL = "black-forest-labs/flux-kontext-max";

function dataUrlToBuffer(dataUrl: string): Buffer {
  const m = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!m?.[2]) {
    throw new Error(
      "Invalid image data URL (need data:image/...;base64,... — not a blob: URL)"
    );
  }
  return Buffer.from(m[2], "base64");
}

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
  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const token = process.env.REPLICATE_API_TOKEN?.trim();
  const useReplicate = Boolean(token) && !forceGoogleImageBackend();

  if (!useReplicate) {
    if (!hasGoogleImageKey()) {
      return Response.json(
        {
          error:
            forceGoogleImageBackend()
              ? "ADSME_USE_GOOGLE_IMAGE is set but no Google API key is configured"
              : "Configure REPLICATE_API_TOKEN or Google API key (GOOGLE_GENERATIVE_AI_API_KEY) for image generation",
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
    if (modelUsesProductImage(model)) {
      const imageBuffer = dataUrlToBuffer(imageDataUrl);
      const input: Record<string, unknown> = {
        prompt,
        input_image: imageBuffer,
        aspect_ratio:
          process.env.REPLICATE_KONTEXT_ASPECT?.trim() || "match_input_image",
        output_format: "png",
      };
      const output = await replicate.run(
        model as `${string}/${string}`,
        { input }
      );
      const url = normalizeReplicateOutput(output);
      return Response.json({ url });
    }

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
    const url = normalizeReplicateOutput(output);
    return Response.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    console.error("[api/ai/generate]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
