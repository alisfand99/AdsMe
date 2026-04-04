import type {
  ChatTurn,
  ExpandedPrompt,
  ProductAnalysis,
  RefinementResult,
} from "./types";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`
    );
  }
  return data as T;
}

export async function analyzeProductImage(
  imageDataUrl: string
): Promise<ProductAnalysis> {
  return postJson<ProductAnalysis>("/api/ai/analyze", { imageDataUrl });
}

export async function expandCreativePrompt(
  shortPrompt: string
): Promise<ExpandedPrompt> {
  return postJson<ExpandedPrompt>("/api/ai/expand-prompt", {
    prompt: shortPrompt,
  });
}

export async function refineFromChatHistory(
  history: ChatTurn[],
  latestUserMessage: string
): Promise<RefinementResult> {
  return postJson<RefinementResult>("/api/ai/refine", {
    history,
    message: latestUserMessage,
  });
}

export type GenerateAdImageResult = { url: string };

export async function generateAdImage(
  imageDataUrl: string,
  prompt: string
): Promise<GenerateAdImageResult> {
  return postJson<GenerateAdImageResult>("/api/ai/generate", {
    imageDataUrl,
    prompt,
  });
}
