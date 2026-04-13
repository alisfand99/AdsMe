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

export type SuggestBrandProfileResult = {
  missionOptions: string[];
  taglines: string[];
  visualIdentityBullets: string[];
  suggestedVoice: string;
  voiceRationale: string;
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

/** Partial brand fields the assistant may set (validated server-side). */
export type MarketingAssistantBrandPatch = {
  brandName?: string;
  brandTagline?: string;
  brandNarrative?: string;
  targetAudience?: string;
  brandVoice?: string;
  visualIdentityRules?: string;
  typographyStyleId?: string;
};

export type MarketingAssistantCalendarChannel =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "tiktok";

export type MarketingAssistantAction =
  | { type: "update_brand"; patch: MarketingAssistantBrandPatch }
  | {
      type: "add_inventory_product";
      name: string;
      narrative: string;
      specs: string;
      includeLatestUserImage: boolean;
    }
  | {
      type: "update_inventory_product";
      productId: string;
      name?: string;
      narrative?: string;
      specs?: string;
      includeLatestUserImage?: boolean;
      clearImage?: boolean;
    }
  | { type: "remove_inventory_product"; productId: string }
  | { type: "set_marketing_webhook"; url: string }
  | {
      type: "add_calendar_post";
      title: string;
      channel: MarketingAssistantCalendarChannel;
      scheduledAt: string;
      status: "draft" | "scheduled" | "published";
      notes?: string;
    }
  | {
      type: "update_calendar_post";
      postId: string;
      title?: string;
      channel?: MarketingAssistantCalendarChannel;
      scheduledAt?: string;
      status?: "draft" | "scheduled" | "published";
      /** Empty string clears notes when provided */
      notes?: string;
    }
  | { type: "remove_calendar_post"; postId: string };

export type MarketingAssistantResult = {
  assistantMessage: string;
  actions: MarketingAssistantAction[];
};

export type MarketingAssistantInventoryRow = {
  id: string;
  name: string;
  sku?: string;
  narrative?: string;
  specs?: string;
  notes?: string;
  hasImage?: boolean;
  galleryImageCount?: number;
};

export type MarketingAssistantMarketingSummary = {
  posts: {
    id: string;
    title: string;
    channel: string;
    scheduledAt: string;
    status: string;
    notes?: string;
  }[];
  n8nWebhookUrl: string;
};

/** Request body for POST /api/ai/marketing-assistant */
export type MarketingAssistantApiRequest = {
  history: { role: "user" | "assistant"; content: string }[];
  message: string;
  images?: string[];
  brandProfile: Record<string, unknown>;
  inventorySummary: MarketingAssistantInventoryRow[];
  marketingSummary?: MarketingAssistantMarketingSummary;
};
