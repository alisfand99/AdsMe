/**
 * TEMPORARY — Google Gemini image generation as a stand-in for Replicate.
 * Remove this module (and route branches) when Replicate billing is restored.
 */

import "server-only";

function apiKey(): string {
  const k =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
  if (!k) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY (or GOOGLE_AI_API_KEY / GEMINI_API_KEY)"
    );
  }
  return k;
}

function imageModel(): string {
  return (
    process.env.GEMINI_IMAGE_MODEL?.trim() ||
    "gemini-2.5-flash-image"
  );
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const m = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!m) {
    throw new Error("Invalid image data URL");
  }
  return { mimeType: m[1] || "image/jpeg", base64: m[2] ?? "" };
}

type RestPart = {
  text?: string;
  inline_data?: { mime_type: string; data: string };
};

/** Google JSON may return snake_case or camelCase for inline image blobs. */
type ApiInlinePart = RestPart & {
  inlineData?: { mimeType?: string; data?: string };
};

type GenerateResponse = {
  candidates?: Array<{
    content?: { parts?: ApiInlinePart[] };
  }>;
  error?: { message?: string };
};

function firstInlineImageFromResponse(data: GenerateResponse): {
  mimeType: string;
  base64: string;
} | null {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts?.length) return null;
  for (const p of parts) {
    const snake = p.inline_data;
    if (snake?.data && snake.mime_type) {
      return { mimeType: snake.mime_type, base64: snake.data };
    }
    const camel = p.inlineData;
    if (camel?.data && camel.mimeType) {
      return { mimeType: camel.mimeType, base64: camel.data };
    }
  }
  return null;
}

/**
 * Image-to-image style ad generation: reference product + prompt → data URL.
 */
export async function generateAdImageWithGoogleTemp(
  imageDataUrl: string,
  prompt: string
): Promise<string> {
  const key = apiKey();
  const model = imageModel();
  const { mimeType, base64 } = parseDataUrl(imageDataUrl);

  const userPrompt = `${prompt}

Constraints: Professional advertising key visual or poster — not casual UGC. Use the attached image as the product reference; preserve identity, shape, branding, and key colors. If the prompt specifies on-image brand name, tagline, or headline, render them as art-directed typography (designed lockup, proper hierarchy, print-ready), never plain default-font stickers. Polished commercial lighting and set suitable for paid media.`;

  const imageConfig = {
    aspectRatio:
      process.env.GEMINI_IMAGE_ASPECT?.trim() || "4:5",
    imageSize: process.env.GEMINI_IMAGE_SIZE?.trim() || "1K",
  };

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: userPrompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
        ] as RestPart[],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify(body),
  });

  const raw = (await res.json()) as GenerateResponse;
  if (!res.ok) {
    const msg =
      raw.error?.message ||
      `Google image API HTTP ${res.status}`;
    throw new Error(msg);
  }

  const img = firstInlineImageFromResponse(raw);
  if (!img) {
    throw new Error(
      "No image in Google response (try GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview or check API access)"
    );
  }

  return `data:${img.mimeType};base64,${img.base64}`;
}
