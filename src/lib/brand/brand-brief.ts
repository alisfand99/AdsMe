import type { BrandProfile } from "@/lib/brand/brand-profile-types";

/** Multi-line brief for AI tagline / studio when no product analysis yet. */
export function buildBrandBriefFromProfile(p: BrandProfile): string {
  const lines: string[] = [];
  if (p.brandName.trim()) lines.push(`Brand name: ${p.brandName.trim()}`);
  if (p.brandTagline.trim()) {
    lines.push(`Current tagline / claim: ${p.brandTagline.trim()}`);
  }
  if (p.brandNarrative.trim()) {
    lines.push(`Mission / narrative: ${p.brandNarrative.trim()}`);
  }
  if (p.targetAudience.trim()) {
    lines.push(`Target audience: ${p.targetAudience.trim()}`);
  }
  lines.push(`Brand voice (guidance): ${p.brandVoice}`);
  if (p.visualIdentityRules.trim()) {
    lines.push(`Visual identity notes: ${p.visualIdentityRules.trim()}`);
  }
  return lines.join("\n");
}

export function profileHasBrandSignal(p: BrandProfile): boolean {
  return (
    p.brandName.trim().length > 0 ||
    p.brandTagline.trim().length > 0 ||
    p.brandNarrative.trim().length > 8 ||
    p.targetAudience.trim().length > 8 ||
    p.visualIdentityRules.trim().length > 8
  );
}
