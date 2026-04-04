import { parseAdCreativeContext } from "@/lib/ad/creative-context";
import { generateSocialCaptionWithGemini } from "@/lib/ai/gemini";

import type { SocialCaptionPlatform } from "@/lib/ai/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PLATFORMS: SocialCaptionPlatform[] = [
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
  "tiktok",
];

function parsePlatform(raw: unknown): SocialCaptionPlatform | null {
  if (typeof raw !== "string") return null;
  return PLATFORMS.includes(raw as SocialCaptionPlatform)
    ? (raw as SocialCaptionPlatform)
    : null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      platform?: unknown;
      imageDataUrl?: unknown;
      creativeContext?: unknown;
      brandName?: unknown;
      brandTagline?: unknown;
      productSummary?: unknown;
      adVisualStyleName?: unknown;
    };

    const platform = parsePlatform(body.platform);
    if (!platform) {
      return Response.json({ error: "valid platform is required" }, { status: 400 });
    }

    const imageDataUrl =
      typeof body.imageDataUrl === "string" ? body.imageDataUrl.trim() : "";
    if (!imageDataUrl || !/^data:image\//i.test(imageDataUrl)) {
      return Response.json(
        { error: "imageDataUrl (data URL) is required" },
        { status: 400 }
      );
    }

    const ctx = parseAdCreativeContext(body.creativeContext);
    const brandName =
      typeof body.brandName === "string"
        ? body.brandName
        : ctx?.brandName || "";
    const brandTagline =
      typeof body.brandTagline === "string"
        ? body.brandTagline
        : ctx?.brandTagline || "";
    const productSummary =
      typeof body.productSummary === "string"
        ? body.productSummary
        : ctx?.productSummary || "";
    const adVisualStyleName =
      typeof body.adVisualStyleName === "string"
        ? body.adVisualStyleName
        : ctx?.adVisualStyleName || "";

    const result = await generateSocialCaptionWithGemini({
      platform,
      imageDataUrl,
      brandName: brandName.trim() || undefined,
      brandTagline: brandTagline.trim() || undefined,
      productSummary: productSummary.trim() || undefined,
      adVisualStyleName: adVisualStyleName.trim() || undefined,
    });

    return Response.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Caption generation failed";
    console.error("[api/ai/social-caption]", e);
    return Response.json({ error: message }, { status: 500 });
  }
}
