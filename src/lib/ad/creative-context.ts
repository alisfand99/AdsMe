import type { AdCreativeContext, ProductAnalysis } from "@/lib/ai/types";

import type { AdTypographyStyle } from "./typography-styles";
import type { AdVisualStyle } from "./ad-visual-styles";

export function buildAdCreativeContext(input: {
  visualStyle: AdVisualStyle;
  typography: AdTypographyStyle;
  brandName: string;
  brandTagline: string;
  selectedCreativeDirection?: string | null;
  analysis: ProductAnalysis | null;
}): AdCreativeContext {
  const a = input.analysis;
  const productSummary = a
    ? `Category: ${a.category}. Colors: ${a.dominantColors.join(", ")}. Materials / finish: ${a.materialGuess}.`
    : undefined;
  return {
    adVisualStyleId: input.visualStyle.id,
    adVisualStyleName: input.visualStyle.name,
    adVisualStyleGuidance: input.visualStyle.promptGuidance,
    brandName: input.brandName.trim(),
    brandTagline: input.brandTagline.trim(),
    typographyStyleId: input.typography.id,
    typographyStyleLabel: input.typography.label,
    typographyPromptHint: input.typography.promptHint,
    selectedCreativeDirection: input.selectedCreativeDirection?.trim() || undefined,
    productSummary,
  };
}

export function parseAdCreativeContext(
  raw: unknown
): AdCreativeContext | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const id = typeof o.adVisualStyleId === "string" ? o.adVisualStyleId : "";
  const name =
    typeof o.adVisualStyleName === "string" ? o.adVisualStyleName : "";
  const guidance =
    typeof o.adVisualStyleGuidance === "string"
      ? o.adVisualStyleGuidance
      : "";
  if (!id || !name || !guidance) return undefined;
  const typoId =
    typeof o.typographyStyleId === "string" ? o.typographyStyleId : "";
  const typoLabel =
    typeof o.typographyStyleLabel === "string" ? o.typographyStyleLabel : "";
  const typoHint =
    typeof o.typographyPromptHint === "string" ? o.typographyPromptHint : "";
  if (!typoId || !typoLabel || !typoHint) return undefined;
  return {
    adVisualStyleId: id,
    adVisualStyleName: name,
    adVisualStyleGuidance: guidance,
    brandName: typeof o.brandName === "string" ? o.brandName : "",
    brandTagline: typeof o.brandTagline === "string" ? o.brandTagline : "",
    typographyStyleId: typoId,
    typographyStyleLabel: typoLabel,
    typographyPromptHint: typoHint,
    selectedCreativeDirection:
      typeof o.selectedCreativeDirection === "string"
        ? o.selectedCreativeDirection
        : undefined,
    productSummary:
      typeof o.productSummary === "string" ? o.productSummary : undefined,
  };
}
