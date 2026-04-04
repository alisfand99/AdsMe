import type { CanvasSceneAdjustments } from "@/lib/canvas/canvas-adjustments";

export type CreativeDirection = {
  id: string;
  title: string;
  description: string;
  styleTags: string[];
};

export type ProductAnalysis = {
  category: string;
  dominantColors: string[];
  materialGuess: string;
  suggestedDirections: CreativeDirection[];
};

export type ExpandedPrompt = {
  userIntent: string;
  expandedPrompt: string;
  negativePrompt?: string;
};

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type IterationParams = {
  lighting?: string;
  headline?: string;
  notes: string;
};

export type RefinementResult = IterationParams & {
  reply: string;
  /** Full English prompt for the next image render (iteration). */
  imagePrompt: string;
};

export type IterationVersion = {
  id: string;
  label: string;
  imageUrl: string;
  promptUsed: string;
  createdAt: number;
  /** Vision model estimate of camera / light / framing for this frame (slider baseline markers). */
  inferredScene?: CanvasSceneAdjustments | null;
};

/** Passed expand/refine APIs — commercial ad focus + brand + style. */
export type AdCreativeContext = {
  adVisualStyleId: string;
  adVisualStyleName: string;
  adVisualStyleGuidance: string;
  brandName: string;
  brandTagline: string;
  typographyStyleId: string;
  typographyStyleLabel: string;
  typographyPromptHint: string;
  selectedCreativeDirection?: string;
  productSummary?: string;
};

export type SuggestTaglinesResult = {
  taglines: string[];
};

export type ComposeCanvasAdjustmentsResult = {
  augmentedPrompt: string;
  adjustmentSummary: string;
};

export type SocialCaptionPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "tiktok";

export type SocialCaptionResult = {
  caption: string;
  /** Space-separated tags without leading # */
  hashtags: string;
};
