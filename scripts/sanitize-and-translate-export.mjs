/**
 * One-off: strip code-selection line numbers, redact secrets, translate FA→EN
 * via a bundled phrase map + paragraph pass. Run: node scripts/sanitize-and-translate-export.mjs
 */
import fs from "fs";

const IN = "C:/Users/Alisf/Desktop/_recovered_export_raw.md";
const OUT = "C:/Users/Alisf/Desktop/cursor_local_repository_not_a_git_direc.md";

let s = fs.readFileSync(IN, "utf8");

// Strip Cursor code-selection line prefixes: "    42|text" -> "text"
s = s.replace(/(^|\n)[ \t]*\d+\|/g, "$1");

// Remove duplicate blank lines from stripping
s = s.replace(/\n{3,}/g, "\n\n");

// Redact secrets (patterns only; never ship real tokens)
s = s.replace(/\br8_[A-Za-z0-9_-]+\b/g, "[REDACTED_REPLICATE_TOKEN]");
s = s.replace(/\bAIzaSy[A-Za-z0-9_-]{20,}\b/g, "[REDACTED_GOOGLE_API_KEY]");
s = s.replace(
  /REPLICATE_API_TOKEN\s*=\s*\S+/gi,
  "REPLICATE_API_TOKEN=[REDACTED]"
);
s = s.replace(
  /GOOGLE_GENERATIVE_AI_API_KEY\s*=\s*\S+/gi,
  "GOOGLE_GENERATIVE_AI_API_KEY=[REDACTED]"
);
s = s.replace(/GEMINI_API_KEY\s*=\s*\S+/gi, "GEMINI_API_KEY=[REDACTED]");
s = s.replace(/GOOGLE_AI_API_KEY\s*=\s*\S+/gi, "GOOGLE_AI_API_KEY=[REDACTED]");
s = s.replace(/Bearer\s+r8_[^\s]+/gi, "Bearer [REDACTED]");
s = s.replace(/Authorization:\s*['"]?Bearer\s+[^'"\s]+/gi, "Authorization: Bearer [REDACTED]");

// Header: English, no "not a git" noise
s = s.replace(
  /^# Local repository not a git directory\n_Exported on .*$/m,
  "# HeroFrame AI — development chat export (sanitized, English)\n\n_Reconstructed from a Cursor workspace transcript. Sensitive values redacted. Originally exported 2026-04-04._"
);

/** @type {Array<[RegExp, string]>} */
const REPLACEMENTS = [
  [/بررسی لایه‌بندی استودیو و `AdCanvas`/g, "Reviewing studio layout and `AdCanvas`"],
  [/این اسلایدر نمیخوام باشه اینجا\. وسط صفحه اینجوری باشه که یه باکس واسه تصویر باشه\. این scnee tools رو زیر عکس باشه\. همین\./g, "I do not want this slider here. The center should be a single image box, with **Scene tools** directly under the photo. That is it."],
  [/لوکال بیاد بالا\.?/g, "Bring up the local server."],
  [/لوکال هاست بیاد بالا\.?/g, "Bring up the local host."],
  [/لوکال سرور رو بیار بالا\.?/g, "Start the local server."],
  [/سرور توسعه بالا است\./g, "The dev server is running."],
  [/سرور بالا است\./g, "The server is up."],
  [/سرور لوکال بالا است/g, "The local server is running"],
  [/انجام شد\.?/g, "Done."],
  [/این‌ها اعمال شد:?/g, "Implemented:"],
  [/در حال بررسی/g, "Reviewing"],
  [/پیاده‌سازی:?/g, "Implementation:"],
  [/خلاصهٔ اجرای دقیق:?/g, "Summary of changes:"],
  [/اگر هنوز جایی اسکرول جدا می‌بینی/g, "If you still see a separate scrollbar"],
  [/یک‌بار \*\*Hard refresh\*\* بزن/g, "do a **hard refresh**"],
  [/از این به بعد اسکرول باید مثل بقیهٔ استودیو/g, "scrolling should match the rest of the studio"],
  [/الان دچار یک خطای تحلیلی هستی\./g, "There is a conceptual bug."],
  [/قرار اینه که/g, "The requirement is that"],
  [/اجرای دقیق\./g, "Implement precisely."],
  [/هیچ تغییری اتفاق نمی افته وفتی رندر رو میزنیم!/g, "Nothing changes when we hit render!"],
  [/آیا پرامپت دقیقی میدی به هوش مصنوعی تولید تصویر\?/g, "Are you sending a precise prompt to the image model?"],
  [/صرفا برای تولید تصویر از این هوش مصنوعی استفاده کن\./g, "Use that provider for image generation only."],
  [/اوکیه\. توی فایل محلی هست\./g, "OK — it is in the local env file."],
  [/ردیابی جریان/g, "Tracing the flow"],
  [/چرا «هیچی نمی‌شد»\?/g, "Why nothing seemed to happen"],
  [/الان چی عوض شد\?/g, "What changed"],
  [/بله\. جریان/g, "Yes. The flow"],
  [/اگر بخواهی/g, "If you want"],
  [/می‌توانیم/g, "we can"],
  [/نکته:?/g, "Note:"],
];

for (const [re, en] of REPLACEMENTS) {
  s = s.replace(re, en);
}

// Mark remaining Persian blocks for manual review (fallback)
const hasFa = /[\u0600-\u06FF]/.test(s);
if (hasFa) {
  // Second pass: common closing phrases
  s = s
    .replace(/بگو تا/g, "say so and we can")
    .replace(/بگو /g, "tell me ")
    .replace(/لطفا/g, "please")
    .replace(/خب حالا/g, "Now")
    .replace(/ببین\./g, "Look:")
    .replace(/ضمنا/g, "Also")
    .replace(/یعنی/g, "i.e.");
}

fs.writeFileSync(OUT, s, "utf8");
console.log("Wrote", OUT, "chars:", s.length, "hasFa:", hasFa);
