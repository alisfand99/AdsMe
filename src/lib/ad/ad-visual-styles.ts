export type AdVisualStyle = {
  id: string;
  name: string;
  /** Short UI description */
  blurb: string;
  imageSrc: string;
  /** Detailed guidance injected into LLM prompts */
  promptGuidance: string;
};

export const AD_VISUAL_STYLES: AdVisualStyle[] = [
  {
    id: "luxury-editorial",
    name: "Luxury editorial",
    blurb: "Dark premium sets, gold accents, magazine campaign.",
    imageSrc: "/ad-styles/luxury-editorial.svg",
    promptGuidance:
      "High-end print advertising and luxury magazine campaign aesthetic: controlled studio or architectural set, rich shadows, metallic or velvet textures in environment, restrained color palette with one accent metal tone, hero product lit like a jewelry or fragrance campaign, generous negative space for upscale copy lockups.",
  },
  {
    id: "bold-retail",
    name: "Bold retail",
    blurb: "High-impact shelf & promo poster energy.",
    imageSrc: "/ad-styles/bold-retail.svg",
    promptGuidance:
      "Mass-market retail and promotional poster language: strong color blocking, clear focal hierarchy, punchy contrast readable from distance, shelf-stopper composition, campaign headline zones, graphic shapes supporting the product — still polished commercial photography, not amateur collage.",
  },
  {
    id: "minimal-premium",
    name: "Minimal premium",
    blurb: "Clean white space, Swiss-style layout.",
    imageSrc: "/ad-styles/minimal-premium.svg",
    promptGuidance:
      "Scandinavian / Swiss premium brand poster: abundant whitespace, precise grid, soft even or gradient studio light, product as singular sculptural object, subtle shadow contact, typography zones implied by layout — Apple-adjacent restraint and museum-catalog calm.",
  },
  {
    id: "tech-future",
    name: "Tech & future",
    blurb: "Neon edges, digital UI-adjacent mood.",
    imageSrc: "/ad-styles/tech-future.svg",
    promptGuidance:
      "Consumer electronics and futuristic launch-key visual: cool color temperature, subtle neon rim light, geometric lines or holographic hints, crisp specular highlights on product, space for spec callouts — still a finished ad key visual, not a game screenshot.",
  },
  {
    id: "organic-lifestyle",
    name: "Organic lifestyle",
    blurb: "Natural light, wellness & craft cues.",
    imageSrc: "/ad-styles/organic-lifestyle.svg",
    promptGuidance:
      "Premium lifestyle advertising for wellness, food, or craft brands: soft daylight, natural materials (wood, linen, stone), authentic but art-directed set, product integrated in a purposeful scene — always reads as commissioned brand photography, never casual phone content.",
  },
  {
    id: "cinematic-drama",
    name: "Cinematic drama",
    blurb: "Filmic contrast, moody hero lighting.",
    imageSrc: "/ad-styles/cinematic-drama.svg",
    promptGuidance:
      "Cinematic advertising still: dramatic key light, shallow depth when appropriate, moody grade suitable for fashion or automotive-adjacent energy, strong silhouette readability, theatrical but controlled — poster-ready single frame from a high-budget spot.",
  },
];

export function getAdVisualStyle(id: string): AdVisualStyle | undefined {
  return AD_VISUAL_STYLES.find((s) => s.id === id);
}

export const DEFAULT_AD_VISUAL_STYLE_ID = AD_VISUAL_STYLES[0].id;
