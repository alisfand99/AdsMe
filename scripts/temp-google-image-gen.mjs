/**
 * TEMPORARY — Smoke test for Google Gemini image generation (Replicate substitute).
 * Remove when Replicate billing is back.
 *
 * Usage:
 *   node scripts/temp-google-image-gen.mjs [path-to-image.jpg] ["optional prompt"]
 *
 * Requires GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) in .env.local
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadDotEnvFile(relPath) {
  const p = resolve(root, relPath);
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim().replace(/^\uFEFF/, "");
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!val) continue;
    process.env[key] = val;
  }
}

loadDotEnvFile(".env.local");
loadDotEnvFile(".env");

function googleKey() {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    ""
  );
}

function pickMime(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function firstInlineImage(data) {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) return null;
  for (const p of parts) {
    if (p.inline_data?.data && p.inline_data?.mime_type) {
      return { mime: p.inline_data.mime_type, b64: p.inline_data.data };
    }
    if (p.inlineData?.data && p.inlineData?.mimeType) {
      return { mime: p.inlineData.mimeType, b64: p.inlineData.data };
    }
  }
  return null;
}

async function main() {
  const key = googleKey();
  if (!key) {
    console.error("Missing Google API key (.env.local → GOOGLE_GENERATIVE_AI_API_KEY)");
    process.exit(1);
  }

  const model =
    process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.5-flash-image";
  const imgPath = process.argv[2];
  const textPrompt =
    process.argv[3]?.trim() ||
    "Premium product hero shot, soft studio light, minimal luxury background.";

  /** @type {object} */
  let body;

  if (imgPath) {
    const abs = resolve(process.cwd(), imgPath);
    if (!existsSync(abs)) {
      console.error("File not found:", abs);
      process.exit(1);
    }
    const buf = readFileSync(abs);
    const mime = pickMime(abs);
    body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: textPrompt },
            {
              inline_data: {
                mime_type: mime,
                data: buf.toString("base64"),
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: process.env.GEMINI_IMAGE_ASPECT?.trim() || "4:5",
          imageSize: process.env.GEMINI_IMAGE_SIZE?.trim() || "1K",
        },
      },
    };
  } else {
    body = {
      contents: [
        {
          role: "user",
          parts: [{ text: textPrompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K",
        },
      },
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  console.log("Model:", model);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("HTTP", res.status, data?.error?.message || JSON.stringify(data).slice(0, 500));
    process.exit(1);
  }

  const img = firstInlineImage(data);
  if (!img) {
    console.error(
      "No image in response. Try GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview"
    );
    process.exit(1);
  }

  const out = resolve(root, "temp-google-image-out.png");
  writeFileSync(out, Buffer.from(img.b64, "base64"));
  console.log("OK — wrote", out, `(${img.mime})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
