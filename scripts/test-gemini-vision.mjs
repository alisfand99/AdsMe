/**
 * Vision smoke test: multimodal Gemini + structured JSON (no secrets printed).
 * Run: node scripts/test-gemini-vision.mjs
 */

import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadDotEnvFile(relPath) {
  const p = resolve(root, relPath);
  if (!existsSync(p)) return false;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed
      .slice(0, eq)
      .trim()
      .replace(/^\uFEFF/, "");
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
  return true;
}

function googleKey() {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    ""
  );
}

function mask(s, max = 160) {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

async function main() {
  loadDotEnvFile(".env.local");
  loadDotEnvFile(".env");

  const key = googleKey();
  if (!key) {
    console.log("[Vision] FAIL — no Google API key");
    process.exit(1);
  }

  const imgPath = resolve(root, "public", "favicon.png");
  if (!existsSync(imgPath)) {
    console.log("[Vision] FAIL — missing public/favicon.png");
    process.exit(1);
  }

  const buf = readFileSync(imgPath);
  const base64 = buf.toString("base64");
  const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      category: { type: SchemaType.STRING },
      dominantColors: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
    },
    required: ["category", "dominantColors"],
  };

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: modelId });

  console.log(
    `[Vision] Testing multimodal JSON (same stack as /api/ai/analyze) model=${modelId}`
  );

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "You are analyzing a small icon or image for a product-ad app smoke test. Return JSON only.",
          },
          {
            inlineData: { mimeType: "image/png", data: base64 },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const text = result.response.text().trim();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.log(`[Vision] FAIL — invalid JSON: ${mask(text, 120)}`);
    process.exit(1);
  }

  const hasCat =
    typeof parsed.category === "string" && parsed.category.length > 0;
  const hasColors = Array.isArray(parsed.dominantColors);
  const ok = hasCat && hasColors;

  console.log(
    `[Vision] ${ok ? "OK" : "WARN"} — category=${mask(parsed.category, 60)} colors=${hasColors ? parsed.dominantColors.length : 0}`
  );
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.log(`[Vision] FAIL — ${mask(e?.message || e, 200)}`);
  process.exit(1);
});
