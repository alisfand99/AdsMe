import "server-only";

import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerativeModel,
  type ResponseSchema,
} from "@google/generative-ai";

import type { CanvasSceneAdjustments } from "@/lib/canvas/canvas-adjustments";
import { clampCanvasSceneAdjustments } from "@/lib/canvas/canvas-adjustments";
import {
  buildPhotographicSceneEditPrompt,
  summarizeSceneDelta,
} from "@/lib/canvas/scene-to-photographic-english";

import type {
  AdCreativeContext,
  ChatTurn,
  ComposeCanvasAdjustmentsResult,
  ExpandedPrompt,
  ProductAnalysis,
  RefinementResult,
  SocialCaptionPlatform,
  SocialCaptionResult,
  SuggestTaglinesResult,
} from "./types";

const AD_POSTER_PREAMBLE = `This is for professional commercial advertising: print posters, OOH, paid social statics, and e-commerce hero campaigns — NOT casual influencer content, phone selfies, or unstyled UGC.

The image must feel art-directed: clear hierarchy (product hero + headline/tagline zones), intentional negative space, color grading suited to paid media, and typography on image that looks designed by a creative team (custom lockup, proper scale, optical kerning) — never plain default fonts or sticker-like text.

Avoid: blogger bedroom aesthetics, messy backgrounds, snapshot framing, watermarks, UI mockups, stock-photo cliché without art direction.`;

function formatCreativeContextBlock(ctx: AdCreativeContext | undefined): string {
  if (!ctx) return "";
  const brandBlock =
    ctx.brandName.trim() || ctx.brandTagline.trim()
      ? `- Brand name (render on-image if appropriate): ${ctx.brandName.trim() || "(not specified — omit or use subtle generic mark only)"}
- Brand tagline / claim (render as designed ad copy if provided): ${ctx.brandTagline.trim() || "(none — do not invent a fake brand sentence unless brief implies it)"}`
      : `- Brand name: (not specified)
- Tagline: (not specified)`;

  return `
SELECTED AD VISUAL STYLE: "${ctx.adVisualStyleName}"
${ctx.adVisualStyleGuidance}

TYPOGRAPHY / LETTERING STYLE (for any on-image words): "${ctx.typographyStyleLabel}"
${ctx.typographyPromptHint}

${brandBlock}
${ctx.selectedCreativeDirection ? `- Creative direction brief: ${ctx.selectedCreativeDirection}` : ""}
${ctx.productSummary ? `- Product context: ${ctx.productSummary}` : ""}
`.trim();
}

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

/** Same numeric fields as CanvasSceneAdjustments — vision → structured controls. */
const sceneInferenceSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    framingZoom: {
      type: SchemaType.NUMBER,
      description:
        "1 = neutral hero tightness; <1 wider FOV / camera farther; >1 tighter crop.",
    },
    orbitYawDeg: {
      type: SchemaType.NUMBER,
      description:
        "Horizontal camera orbit around product: negative = camera toward subject's right side; positive = toward subject's left.",
    },
    orbitPitchDeg: {
      type: SchemaType.NUMBER,
      description:
        "Camera height: negative = lower / looking slightly up at hero; positive = higher / looking down.",
    },
    subjectRollDeg: {
      type: SchemaType.NUMBER,
      description:
        "Product rotation in the image plane (Z), degrees; 0 = upright vs frame.",
    },
    lightAzimuthDeg: {
      type: SchemaType.NUMBER,
      description:
        "Key light azimuth 0–360: 0° = from camera-right of set; 90° = from behind camera toward subject; 180° = camera-left; 270° = toward camera.",
    },
    lightElevationDeg: {
      type: SchemaType.NUMBER,
      description: "Key light elevation above horizon in degrees (about 8–82).",
    },
    lightHardness: {
      type: SchemaType.NUMBER,
      description: "0 = very soft wrap; 1 = hard shadow edges.",
    },
  },
  required: [
    "framingZoom",
    "orbitYawDeg",
    "orbitPitchDeg",
    "subjectRollDeg",
    "lightAzimuthDeg",
    "lightElevationDeg",
    "lightHardness",
  ],
};

const taglinesSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    taglines: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "3–5 short advertising taglines, English, campaign-ready",
    },
  },
  required: ["taglines"],
};

const socialCaptionSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    caption: {
      type: SchemaType.STRING,
      description: "Main post body for the chosen platform, English unless context demands otherwise",
    },
    hashtags: {
      type: SchemaType.STRING,
      description: "Space-separated keywords WITHOUT # prefix; 0–12 tags",
    },
  },
  required: ["caption", "hashtags"],
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

  const prompt = `You are a senior commercial art director for paid advertising (print, OOH, social statics). Look at this product photo.
Return JSON only (schema enforced). Infer:
- category (short retail category)
- dominantColors: 3–6 color names
- materialGuess: likely materials/finish for the product/packaging
- suggestedDirections: exactly 3 distinct directions for a professional AD CAMPAIGN key visual — not casual lifestyle blogging. Each: title, one-line description, 2–4 styleTags (e.g. shelf-impact, editorial-luxury, tech-launch).
Use ids "1","2","3". Titles must sound like campaign routes (e.g. "Marble flagship", "Neon night market").`;

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

/**
 * Estimates structured scene parameters from a finished ad render so sliders can show
 * a "current frame" baseline (faded markers) and compose can compute deltas.
 */
export async function inferCanvasSceneFromImageWithGemini(
  imageDataUrl: string
): Promise<CanvasSceneAdjustments> {
  const { mimeType, base64 } = parseDataUrl(imageDataUrl);
  const model = getModel();

  const text = `You are a technical cinematographer analyzing a SINGLE finished advertising key visual.

Infer the scene as NUMERICAL controls matching this exact coordinate system (output JSON only):

- framingZoom: 1.0 = typical hero product framing for this genre; lower if camera feels farther / more environment; higher if very tight crop on product.
- orbitYawDeg: horizontal angle of the CAMERA around the product. 0 = head-on / symmetric; negative = camera shifted toward the product's RIGHT side (we see more product left cheek); positive = camera shifted toward product LEFT.
- orbitPitchDeg: 0 = lens near product mid-height; negative = camera lower (looking up at product); positive = camera higher (looking down).
- subjectRollDeg: rotation of the product in the picture plane (tilt), degrees. 0 = product vertical edges parallel to frame (modulo perspective).
- lightAzimuthDeg: dominant KEY light, 0–360. 0° = light from camera-RIGHT side of set; 90° = from behind camera toward subject; 180° = from camera-LEFT; 270° = toward camera / front fill side.
- lightElevationDeg: key light elevation (8 = very low/grazing; 82 = almost overhead).
- lightHardness: shadow edge hardness 0 (ultra soft) to 1 (hard).

Use the IMAGE only. Best estimate — these values drive a 3D gizmo and must be internally consistent.`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
      responseSchema: sceneInferenceSchema,
    },
  });

  const parsed = parseJson<Record<string, unknown>>(result.response.text());
  return clampCanvasSceneAdjustments(parsed);
}

export async function expandPromptWithGemini(
  shortPrompt: string,
  creativeContext?: AdCreativeContext
): Promise<ExpandedPrompt> {
  const trimmed = shortPrompt.trim() || "premium product hero";
  const model = getModel();
  const ctxBlock = formatCreativeContextBlock(creativeContext);
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${AD_POSTER_PREAMBLE}

User creative brief: "${trimmed}"

${ctxBlock ? `LOCKED CREATIVE INPUTS:\n${ctxBlock}\n` : ""}

Expand into ONE detailed English prompt for an image generation model. Requirements:
- Describe a single advertising key visual: camera/lens feel, lighting for print reproduction, set design, color grade, product hero treatment, and where headline/tagline/brand lockup sit (if brand or tagline provided, specify exact professional treatment — emboss, neon sign, foil block, integrated signage, etc.).
- Merge the user's brief with the selected visual style and typography direction.
- Preserve product identity and accuracy; no wrong product category.

Also suggest negativePrompt: comma-separated tokens excluding blogger/UGC/snapshot/watermark/amateur text.

Return JSON: userIntent (echo), expandedPrompt, negativePrompt.`,
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
  options?: {
    currentImagePrompt?: string;
    creativeContext?: AdCreativeContext;
  }
): Promise<RefinementResult> {
  const model = getModel();
  const transcript = history
    .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
    .join("\n");

  const baseRaw = options?.currentImagePrompt?.trim() || "";
  const baseForModel =
    baseRaw.length > 800
      ? `${baseRaw.slice(0, 800)}\n… [truncated — the reference image shows the full current ad; do not reproduce this block in imagePrompt.]`
      : baseRaw ||
        "(No prior edit log — infer only from conversation + reference image.)";

  const ctxBlock = formatCreativeContextBlock(options?.creativeContext);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${AD_POSTER_PREAMBLE}

You refine professional ADVERTISING / POSTER key visuals (not casual photos).

PRIOR EDIT / PROMPT LOG (context only — may include long text from an older step). The image-to-image model receives the CURRENT FRAME as pixels. Your JSON field imagePrompt must be DELTA-ONLY: never paste this entire block or repeat luxury/OOH boilerplate.

"""
${baseForModel}
"""

${ctxBlock ? `BRAND & STYLE CONSTRAINTS (keep consistent unless user explicitly overrides):\n${ctxBlock}\n` : ""}

Conversation:
${transcript}

Latest user request: ${latestUserMessage}

Output JSON:
- reply: short friendly confirmation
- lighting: concise note for next render
- headline: on-image headline if relevant; else empty
- notes: one internal sentence
- imagePrompt: ONLY incremental edit instructions for the image-to-image model (the reference frame carries the full ad). Do NOT paste the luxury/editorial style bible, long OOH/print paragraphs, or the full prior iteration prompt. Start with one short line that the reference image is the ground truth, then list ONLY what must change (camera, light, framing, copy tweaks the user asked for) in clear imperative sentences. If the user asked for typography/headline changes, state those briefly. Max ~800 characters unless they requested many edits. No blogger/UGC look.`,
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

  const imagePrompt = (
    parsed.imagePrompt?.trim() ||
    `Use the reference image as the full visual base. Apply only: ${latestUserMessage}`
  ).trim();

  return {
    reply: parsed.reply || "Updated the creative direction based on your note.",
    lighting: parsed.lighting || "neutral studio",
    headline: parsed.headline?.trim() || undefined,
    notes: parsed.notes || latestUserMessage,
    imagePrompt,
  };
}

export async function composeCanvasAdjustmentsWithGemini(input: {
  /** Ignored — scene compose is delta-only; reference image holds the ad. */
  currentImagePrompt?: string;
  adjustments: CanvasSceneAdjustments;
  /** Vision-derived estimate of the reference frame; when set, describe before → after in plain photographic language. */
  baselineScene?: CanvasSceneAdjustments | null;
  creativeContext?: AdCreativeContext;
}): Promise<ComposeCanvasAdjustmentsResult> {
  const target = clampCanvasSceneAdjustments(input.adjustments);
  const baselineRaw = input.baselineScene;
  const baseline =
    baselineRaw != null ? clampCanvasSceneAdjustments(baselineRaw) : null;

  return {
    augmentedPrompt: buildPhotographicSceneEditPrompt(
      baseline,
      target,
      input.creativeContext
    ).trim(),
    adjustmentSummary: summarizeSceneDelta(baseline, target).trim(),
  };
}

export async function suggestTaglinesWithGemini(input: {
  productSummary: string;
  brandName?: string;
  imageDataUrl?: string;
}): Promise<SuggestTaglinesResult> {
  const model = getModel();
  const brand =
    typeof input.brandName === "string" ? input.brandName.trim() : "";
  const summary = input.productSummary.trim() || "General consumer product";

  const textIntro = `You write short advertising taglines for posters and paid social statics.
Product / market context:
${summary}
${brand ? `Brand name to align with: ${brand}` : "No brand name — lines should work as generic claims or invite adding a name later."}

Return JSON only: { "taglines": string[] } with 3–5 options.
Each tagline: max ~8 words, punchy, professional, suitable for designed lockup under a logo — not cheesy rhymes unless brief fits. English only.`;

  const parts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  > = [{ text: textIntro }];

  if (input.imageDataUrl?.trim()) {
    const { mimeType, base64 } = parseDataUrl(input.imageDataUrl);
    parts.push({
      text: "Use the product photo to match tone and category:",
    });
    parts.push({ inlineData: { mimeType, data: base64 } });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.85,
      responseMimeType: "application/json",
      responseSchema: taglinesSchema,
    },
  });

  const parsed = parseJson<{ taglines: string[] }>(result.response.text());
  const taglines = (parsed.taglines ?? [])
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 5);
  return { taglines };
}

const SOCIAL_PLATFORM_GUIDE: Record<SocialCaptionPlatform, string> = {
  instagram:
    "Instagram: strong hook in the first line; short paragraphs or line breaks OK; main message under ~900 chars unless product story needs more (hard max ~2200).",
  facebook:
    "Facebook: warm, readable tone; one clear message; optional soft CTA; paragraph style OK.",
  twitter:
    "X (Twitter): single tweet body only, max ~260 characters including spaces — no thread, no '1/'.",
  linkedin:
    "LinkedIn: professional, benefit-led; avoid cringe hustle-speak; 1–3 short paragraphs.",
  tiktok:
    "TikTok caption: very short punchy first line; playful; can add one follow-up line; total under ~400 characters preferred.",
};

export async function generateSocialCaptionWithGemini(input: {
  platform: SocialCaptionPlatform;
  imageDataUrl: string;
  brandName?: string;
  brandTagline?: string;
  productSummary?: string;
  adVisualStyleName?: string;
}): Promise<SocialCaptionResult> {
  const { mimeType, base64 } = parseDataUrl(input.imageDataUrl);
  const model = getModel();
  const platform = input.platform;
  const guide = SOCIAL_PLATFORM_GUIDE[platform];
  const brand = input.brandName?.trim() || "";
  const tag = input.brandTagline?.trim() || "";
  const sum = input.productSummary?.trim() || "";
  const style = input.adVisualStyleName?.trim() || "";

  const text = `You write organic social post copy for a FINISHED static ad / product key visual (image attached).

Target platform: ${platform}
Platform rules: ${guide}

Context (use only if it fits naturally):
${brand ? `- Brand: ${brand}` : "- Brand: (not specified)"}
${tag ? `- Tagline / claim on ad: ${tag}` : ""}
${sum ? `- Product notes: ${sum}` : ""}
${style ? `- Campaign visual style label: ${style}` : ""}

Return JSON only with:
- caption: the post text only (no hashtags inside this string)
- hashtags: space-separated keywords WITHOUT # (e.g. "skincare minimal design"); 0–12 tags, relevant to the image and platform

Do not invent a fake brand name. If the image shows readable on-image copy, align tone with it. English unless the brief clearly implies another language.`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.75,
      responseMimeType: "application/json",
      responseSchema: socialCaptionSchema,
    },
  });

  const parsed = parseJson<{ caption?: string; hashtags?: string }>(
    result.response.text()
  );
  return {
    caption: String(parsed.caption ?? "").trim(),
    hashtags: String(parsed.hashtags ?? "").trim(),
  };
}
