import "server-only";

import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerativeModel,
  type ResponseSchema,
} from "@google/generative-ai";

import type {
  ChatTurn,
  ExpandedPrompt,
  ProductAnalysis,
  RefinementResult,
} from "./types";

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

function defaultModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

function getModel(): GenerativeModel {
  const genAI = new GoogleGenerativeAI(apiKey());
  return genAI.getGenerativeModel({ model: defaultModel() });
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const m = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!m) {
    throw new Error("Invalid image data URL");
  }
  return { mimeType: m[1] || "image/jpeg", base64: m[2] ?? "" };
}

function parseJson<T>(text: string): T {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const raw = fence ? fence[1].trim() : trimmed;
  return JSON.parse(raw) as T;
}

const productSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: { type: SchemaType.STRING },
    dominantColors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    materialGuess: { type: SchemaType.STRING },
    suggestedDirections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          styleTags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["id", "title", "description", "styleTags"],
      },
    },
  },
  required: [
    "category",
    "dominantColors",
    "materialGuess",
    "suggestedDirections",
  ],
};

const expandedPromptSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    userIntent: { type: SchemaType.STRING },
    expandedPrompt: { type: SchemaType.STRING },
    negativePrompt: { type: SchemaType.STRING },
  },
  required: ["userIntent", "expandedPrompt"],
};

const refinementSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: { type: SchemaType.STRING },
    lighting: { type: SchemaType.STRING },
    headline: { type: SchemaType.STRING },
    notes: { type: SchemaType.STRING },
    imagePrompt: {
      type: SchemaType.STRING,
      description:
        "Complete detailed English prompt for the image model for the NEXT render, merging the current prompt with all requested changes.",
    },
  },
  required: ["reply", "lighting", "notes", "imagePrompt"],
};

function normalizeAnalysis(raw: ProductAnalysis): ProductAnalysis {
  const dirs = (raw.suggestedDirections ?? []).slice(0, 3).map((d, i) => ({
    id: d.id || String(i + 1),
    title: d.title || `Direction ${i + 1}`,
    description: d.description || "",
    styleTags: Array.isArray(d.styleTags) ? d.styleTags.slice(0, 6) : [],
  }));
  while (dirs.length < 3) {
    dirs.push({
      id: String(dirs.length + 1),
      title: "Creative variation",
      description: "Refine with chat to tune this direction.",
      styleTags: ["custom"],
    });
  }
  return {
    category: raw.category || "General product",
    dominantColors: Array.isArray(raw.dominantColors)
      ? raw.dominantColors.slice(0, 8)
      : [],
    materialGuess: raw.materialGuess || "Unknown",
    suggestedDirections: dirs,
  };
}

export async function analyzeProductWithGemini(
  imageDataUrl: string
): Promise<ProductAnalysis> {
  const { mimeType, base64 } = parseDataUrl(imageDataUrl);
  const model = getModel();

  const prompt = `You are a senior commercial art director. Look at this product photo.
Return JSON only (schema enforced). Infer:
- category (short retail category)
- dominantColors: 3–6 color names
- materialGuess: likely materials/finish for the product/packaging
- suggestedDirections: exactly 3 distinct ad creative directions (title, one-line description, 2–4 styleTags each).
Use ids "1","2","3". Titles must be evocative (e.g. minimalist marble, neon cyberpunk, tropical beach).`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.6,
      responseMimeType: "application/json",
      responseSchema: productSchema,
    },
  });

  const text = result.response.text();
  const parsed = parseJson<ProductAnalysis>(text);
  return normalizeAnalysis(parsed);
}

export async function expandPromptWithGemini(
  shortPrompt: string
): Promise<ExpandedPrompt> {
  const trimmed = shortPrompt.trim() || "premium product hero";
  const model = getModel();
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `User brief for a product ad image: "${trimmed}"
Expand into a single detailed English prompt for an image model. Preserve product accuracy; describe background, lighting, mood, camera, and composition. Also suggest a concise negativePrompt string (comma-separated tokens).
Return JSON with userIntent (echo), expandedPrompt, negativePrompt.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: expandedPromptSchema,
    },
  });
  const parsed = parseJson<ExpandedPrompt>(result.response.text());
  return {
    userIntent: parsed.userIntent || trimmed,
    expandedPrompt: parsed.expandedPrompt || trimmed,
    negativePrompt: parsed.negativePrompt,
  };
}

export async function refineWithGemini(
  history: ChatTurn[],
  latestUserMessage: string,
  options?: { currentImagePrompt: string }
): Promise<RefinementResult> {
  const model = getModel();
  const transcript = history
    .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
    .join("\n");

  const base =
    options?.currentImagePrompt?.trim() ||
    "(No prior render prompt — infer from conversation only.)";

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You refine product advertisement images. The CURRENT full image-generation prompt (what was used for the latest render) is:

"""
${base}
"""

Conversation:
${transcript}

Latest user request: ${latestUserMessage}

You must output JSON:
- reply: short friendly message confirming what you changed for the user
- lighting: concise lighting note for the next render
- headline: short on-image headline if they asked for text; else empty string
- notes: one internal sentence summarizing the change
- imagePrompt: ONE complete, detailed English prompt for the NEXT image render. It must incorporate EVERYTHING in the current prompt above PLUS all changes from the conversation (camera distance/angle, background, mood, lighting, composition, text on image, etc.). Standalone — do not say "as before"; be fully specific. Preserve product accuracy and identity.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.65,
      responseMimeType: "application/json",
      responseSchema: refinementSchema,
    },
  });

  const parsed = parseJson<{
    reply: string;
    lighting: string;
    headline: string;
    notes: string;
    imagePrompt: string;
  }>(result.response.text());

  const imagePrompt = (parsed.imagePrompt || base || latestUserMessage).trim();

  return {
    reply: parsed.reply || "Updated the creative direction based on your note.",
    lighting: parsed.lighting || "neutral studio",
    headline: parsed.headline?.trim() || undefined,
    notes: parsed.notes || latestUserMessage,
    imagePrompt,
  };
}
