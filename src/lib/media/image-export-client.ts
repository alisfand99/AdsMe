/**
 * Client-only helpers to fetch remote ad images and re-encode for download.
 */

export async function resolveImageBlob(src: string): Promise<Blob> {
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    const r = await fetch(src);
    if (!r.ok) throw new Error("Could not read image");
    return r.blob();
  }
  try {
    const r = await fetch(src, { mode: "cors" });
    if (r.ok) return r.blob();
  } catch {
    /* use proxy */
  }
  const r2 = await fetch("/api/media/proxy-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: src }),
  });
  if (!r2.ok) {
    let msg = "Could not load image for export";
    try {
      const j = (await r2.json()) as { error?: string };
      if (typeof j.error === "string") msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return r2.blob();
}

export async function exportImageBlob(
  src: string,
  format: "image/png" | "image/jpeg" | "image/webp",
  quality = 0.92
): Promise<Blob> {
  const blob = await resolveImageBlob(src);
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
      format,
      format === "image/png" ? undefined : quality
    );
  });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function formatHashtagsForPost(spaceSeparated: string): string {
  const parts = spaceSeparated
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return parts.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
}
