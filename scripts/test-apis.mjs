/**
 * Smoke test: Google Gemini + Replicate (no secrets printed).
 * Run: npm run test:apis
 */

import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadDotEnvFile(relPath) {
  const p = resolve(root, relPath);
  if (!existsSync(p))
    return { path: p, loaded: false, assignments: 0, keysSet: [] };
  const text = readFileSync(p, "utf8");
  let n = 0;
  /** @type {string[]} */
  const keysSet = [];
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
    n += 1;
    keysSet.push(key);
  }
  return { path: p, loaded: true, assignments: n, keysSet };
}

const envLocal = loadDotEnvFile(".env.local");
const envDefault = loadDotEnvFile(".env");

if (!process.env.REPLICATE_API_TOKEN?.trim() && process.env.REPLICATE_API_KEY?.trim()) {
  process.env.REPLICATE_API_TOKEN = process.env.REPLICATE_API_KEY;
}

function googleKey() {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    ""
  );
}

function mask(s, max = 120) {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

async function testGoogleGemini() {
  const key = googleKey();
  if (!key) {
    console.log(
      "[Google Gemini] SKIP — set GOOGLE_GENERATIVE_AI_API_KEY (or GOOGLE_AI_API_KEY / GEMINI_API_KEY)"
    );
    return false;
  }
  const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: modelId });
  const result = await model.generateContent(
    'Reply with exactly the word OK and nothing else.'
  );
  const text = result.response.text().trim();
  const ok = /^OK\b/i.test(text);
  console.log(
    `[Google Gemini] ${ok ? "OK" : "WARN"} — model=${modelId} reply=${mask(text, 40)}`
  );
  return ok;
}

async function testReplicate() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token?.trim()) {
    console.log("[Replicate] SKIP — REPLICATE_API_TOKEN is empty");
    return false;
  }
  const res = await fetch("https://api.replicate.com/v1/models?limit=1", {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });
  const bodyText = await res.text();
  let parsed = null;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    /* ignore */
  }
  const ok = res.ok && parsed?.results;
  console.log(
    `[Replicate] ${ok ? "OK" : "FAIL"} — HTTP ${res.status} ${ok ? `(sample model: ${parsed.results[0]?.name ?? "n/a"})` : mask(bodyText, 100)}`
  );
  return ok;
}

async function main() {
  console.log("HeroFrame AI API smoke test (keys are not printed)\n");
  console.log(
    `Env files: .env.local ${envLocal?.loaded ? `found (${envLocal.assignments} assignments)` : "missing"}${envLocal?.loaded && envLocal.keysSet?.length ? ` — keys: ${envLocal.keysSet.join(", ")}` : ""} | .env ${envDefault?.loaded ? `found (${envDefault.assignments} assignments)` : "missing"}`
  );
  if (envLocal?.loaded && !googleKey() && !process.env.REPLICATE_API_TOKEN?.trim()) {
    console.log(
      "Hint: GOOGLE_GENERATIVE_AI_API_KEY and REPLICATE_API_TOKEN on single lines, no spaces around =."
    );
  }
  let googleOk = false;
  let replicateOk = false;
  try {
    googleOk = await testGoogleGemini();
  } catch (e) {
    console.log(`[Google Gemini] FAIL — ${mask(e?.message || e, 200)}`);
  }
  try {
    replicateOk = await testReplicate();
  } catch (e) {
    console.log(`[Replicate] FAIL — ${mask(e?.message || e, 200)}`);
  }
  const exitCode = googleOk && replicateOk ? 0 : 1;
  console.log(
    `\nSummary: Google Gemini=${googleOk ? "pass" : "fail"} | Replicate=${replicateOk ? "pass" : "fail"}`
  );
  process.exit(exitCode);
}

main();
