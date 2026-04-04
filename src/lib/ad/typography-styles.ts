export type AdTypographyStyle = {
  id: string;
  label: string;
  /** Injected into image prompts — how on-image lettering should look */
  promptHint: string;
};

export const AD_TYPOGRAPHY_STYLES: AdTypographyStyle[] = [
  {
    id: "editorial-serif",
    label: "Editorial serif",
    promptHint:
      "On-image typography: refined high-contrast serif headline (Didone / editorial fashion), elegant kerning, subtle ligatures feel, printed or foil-stamped quality, integrated into layout grid — never generic default font appearance.",
  },
  {
    id: "geometric-sans",
    label: "Geometric sans",
    promptHint:
      "On-image typography: clean geometric sans (neo-grotesk / Swiss), bold weight for headline, precise alignment to grid, modern tech or beauty brand poster treatment, letterspacing tuned for display size.",
  },
  {
    id: "condensed-impact",
    label: "Condensed impact",
    promptHint:
      "On-image typography: tall condensed sans or grotesk, retail poster impact, stacked lines allowed, high legibility at small sizes in footer, campaign energy without looking like a meme font.",
  },
  {
    id: "script-premium",
    label: "Script / signature",
    promptHint:
      "On-image typography: controlled script or signature wordmark for premium or artisan positioning — legible, single focal signature element, paired with a simple sans subline if needed, luxury packaging aesthetic.",
  },
  {
    id: "constructivist",
    label: "Constructivist / angular",
    promptHint:
      "On-image typography: angular constructed lettering or bold slab aligned to graphic shapes, poster art influence, strong angle or overlap with color fields — still professional campaign art direction.",
  },
  {
    id: "neon-sign",
    label: "Neon / illuminated",
    promptHint:
      "On-image typography: appears as physical neon tube, backlit sign, or embossed light — glow controlled, realistic mount and perspective, integrated into environment not pasted-on sticker text.",
  },
];

export function getAdTypographyStyle(id: string): AdTypographyStyle | undefined {
  return AD_TYPOGRAPHY_STYLES.find((t) => t.id === id);
}

export const DEFAULT_TYPOGRAPHY_STYLE_ID = AD_TYPOGRAPHY_STYLES[0].id;
