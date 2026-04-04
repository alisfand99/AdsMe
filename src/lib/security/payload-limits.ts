/**
 * Guardrails for public API routes that accept base64 image data URLs.
 * Prevents trivial DoS via multi‑hundred‑MB JSON bodies.
 */
export const MAX_IMAGE_DATA_URL_CHARS = 28_000_000; // ~20MB binary as base64, generous headroom

export function imageDataUrlTooLarge(dataUrl: string): boolean {
  return dataUrl.length > MAX_IMAGE_DATA_URL_CHARS;
}
