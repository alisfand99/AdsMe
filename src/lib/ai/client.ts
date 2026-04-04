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
  latestUserMessage: string,
  options?: { currentImagePrompt?: string }
): Promise<RefinementResult> {
  return postJson<RefinementResult>("/api/ai/refine", {
    history,
    message: latestUserMessage,
    currentImagePrompt: options?.currentImagePrompt ?? "",
  });
}

/** Ensures a value suitable for /api/ai/generate (data URL). Fetches http(s) if needed. */
export async function toImageDataUrl(src: string): Promise<string> {
  const s = src.trim();
  if (/^data:/i.test(s)) return s;
  const res = await fetch(s);
  if (!res.ok) {
    throw new Error(`Could not load image for iteration (HTTP ${res.status})`);
  }
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
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
