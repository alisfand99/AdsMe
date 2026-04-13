import { DEFAULT_TYPOGRAPHY_STYLE_ID } from "@/lib/ad/typography-styles";

export const BRAND_VOICE_OPTIONS = [
  "professional",
  "playful",
  "luxury",
  "minimalist",
  "bold",
] as const;

export type BrandVoice = (typeof BRAND_VOICE_OPTIONS)[number];

export type BrandProfile = {
  brandName: string;
  brandTagline: string;
  brandNarrative: string;
  targetAudience: string;
  brandVoice: BrandVoice;
  visualIdentityRules: string;
  typographyStyleId: string;
};

export const defaultBrandProfile: BrandProfile = {
  brandName: "",
  brandTagline: "",
  brandNarrative: "",
  targetAudience: "",
  brandVoice: "professional",
  visualIdentityRules: "",
  typographyStyleId: DEFAULT_TYPOGRAPHY_STYLE_ID,
};
