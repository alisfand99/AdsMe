/**
 * One-off: text-to-image for the landing hero (Replicate Flux Schnell).
 * Run: node scripts/generate-hero-marketing.mjs
 * Writes: public/images/hero-studio-ai.webp
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import Replicate from "replicate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFileSync(relPath) {
  const p = resolve(root, relPath);
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim().replace(/^\uFEFF/, "");
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val && process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFileSync(".env.local");
loadEnvFileSync(".env");

const token = process.env.REPLICATE_API_TOKEN?.trim();
if (!token) {
  console.error("Missing REPLICATE_API_TOKEN — add it to .env.local");
  process.exit(1);
}

const PROMPT = `Ultra-premium 3D advertising key visual: a single floating software window tilted slightly in perspective (subtle isometric, not flat), dark charcoal and near-black UI with glassmorphism panels and thin violet accent glow. The interface must clearly show THREE COLUMNS: LEFT column labeled Assets with a dashed upload drop zone and four small rounded style tiles in purple, teal, gold, and deep green gradients with tiny labels Noir, Clean, Warm, Shelf. CENTER column is a large hero canvas with a luxury cosmetic bottle product mockup, headline text "LUMEN & CO" and subline "EDITORIAL LUXURY". RIGHT column labeled Agent with a brief text block, two pill buttons "Expand" and "Generate", and a small chat iteration area. macOS-style red yellow green window dots in the title bar, monospace title "heroframe / studio". Cinematic studio lighting: soft purple rim light, a diagonal light beam sweeping across the glass panels, subtle reflections, shallow depth of field, octane-style render, no clutter, no extra monitors, no hands, no people.`;

async function main() {
  const replicate = new Replicate({ auth: token });
  const model =
    process.env.REPLICATE_HERO_MODEL?.trim() ||
    "black-forest-labs/flux-schnell";

  console.log("Generating hero image with", model, "…");
  const output = await replicate.run(model, {
    input: {
      prompt: PROMPT,
      aspect_ratio: "16:9",
      num_outputs: 1,
      output_format: "webp",
      go_fast: true,
    },
  });

  const first = Array.isArray(output) ? output[0] : output;
  let url = "";
  if (typeof first === "string") url = first;
  else if (first && typeof first === "object") {
    if (typeof first.url === "function") url = first.url();
    else if (typeof first.href === "string") url = first.href;
  }
  if (!url) {
    console.error("Unexpected Replicate output:", output);
    process.exit(1);
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Fetch image failed", res.status);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const outDir = resolve(root, "public", "images");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "hero-studio-ai.webp");
  writeFileSync(outPath, buf);
  console.log("Wrote", outPath, `(${Math.round(buf.length / 1024)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
