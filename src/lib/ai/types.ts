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
};
