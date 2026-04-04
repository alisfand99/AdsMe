/** Landing, branding, mobile FAB, footer (final segment). */
export const BATCH4 = [
  [
    `خب. بیا بریم تو صفحه اصلی سایت.
یک اینکه اون تصویری که گذاشتی ناقصه. باید درستش کنی.

دوما که اسم پیشنهاد بده براش با توجه به کارکردی که داره. ده تا اسم پیشنهاد بده.

سوما که Canvas-first ads that feel like Flair.
Upload a product, let the agent propose directions, expand prompts, and iterate in chat — polished dark UI, glass panels, and motion throughout.

واسه این متن هم چند تا پیشنهاد دیگه بده.`,
    `Let’s work on the **home** page.

First, the hero visual you used looks **broken/incomplete**—fix it.

Second, suggest **ten names** that fit what the product does.

Third, for this headline + body—**Canvas-first ads that feel like Flair.** / *Upload a product…*—give me **several alternative** headline + subcopy options.`,
  ],
  [
    `در حال بررسی محل ساخت تصویر/پیش‌نمایش صفحهٔ اصلی تا توضیح دقیق بدهیم.
## ۱) چرا آن «تصویر» ناقص به نظر می‌رسد؟

آن بخش اصلاً **فایل تصویر نیست**؛ در کد به‌صورت **ماکت placeholder** با \`div\`های خاکستری و یک کادر خط‌چین ساخته شده است:

\`\`\`164:194:src/app/page.tsx
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              ...
            </div>
            <div className="grid gap-0 md:grid-cols-[1fr_1.4fr_1fr]">              <div className="hidden border-r border-white/10 p-4 md:block">
                ...
              </div>
              <div className="flex min-h-[280px] items-center justify-center ...">
                <div className="relative aspect-[4/5] ...">
                  <div className="absolute inset-4 rounded-lg border border-dashed ..." />
                  <Sparkles className="absolute bottom-4 right-4 ..." />
                </div>
              </div>
              ...            </div>
          </div>
\`\`\`

برای «درست کردنش» معمولاً یکی از این کارها انجام می‌شود: **اسکرین‌شات واقعی استودیو** (PNG/WebP) به‌جای گرید، **ماکت غنی‌تر با CSS** (شبیه‌سازی پنل‌ها، تایپوگرافی، تصویر محصول نمونه)، یا حتی **کامپوننت کوچک‌شدهٔ واقعی** (سنگین‌تر).  
الان در **Ask mode** نمی‌توانم فایل را عوض کنم؛ اگر بخواهی خودم در ریپو پیاده کنم، **Agent mode** بزن.

---

## ۲) ده پیشنهاد نام (بر اساس کارکرد: آپلود محصول، جهت‌های خلاق، گسترش پرامپت، چت، کانوس، رندر)
1. **HeroFrame**  
2. **LockupLab**  
3. **ShelfCraft**  
4. **CanvasMint**  
5. **PitchGlass**  
6. **FrameRelay**  
7. **BrandOrbit**  
8. **Fluxboard**  
9. **Meridian Studio**  10. **AdAgent** (یا **AdAgent Studio**)

*(اگر برند نهایی بین‌المللی است، قبل از ثبت دامنه حتماً تداخل علامت تجاری را چک کن.)*

---

## ۳) چند جایگزین برای همان تیتر + پاراگراف

**نکته:** عبارت **«feel like Flair»** ممکن است به محصول/برند دیگری ارجاع دارد؛ برای لانچ امن‌تر گاهی همان حس را **بدون نام** می‌گویند.
### تیتر (جایگزین‌ها)
- **Canvas-first ads with studio polish.**  
- **Product in frame. Campaign in flow.**  
- **From pack shot to paid-media hero — in one canvas.**  
- **Agent-led ad visuals, built for real products.**  
- **Dark-glass studio for ads that look designed — not generated.**

### پاراگراف زیرتیتر (جایگزین‌ها)
- **Upload your product shot. The agent suggests directions, expands your brief, and you iterate in chat — dark UI, glass panels, motion where it matters.**  
- **One workflow: vision analysis → three creative routes → rich image prompt → chat-driven refinements. Built for posters, social statics, and shelf-impact looks.**  - **Drop a product photo, pick a direction, expand “make it luxury” into a full brief, then nudge light and layout in conversation — without leaving the canvas.**  
- **Gemini reads the product; you steer the campaign. Same glassy, motion-forward UI from first upload to last render.**  
- **Less prompt-hacking, more art direction: structured controls, iteration history, and outputs tuned for commercial layouts.**

اگر بگی ترجیح می‌دهی تُن **رسمی‌تر** باشد یا **پلی‌فول‌تر** (مثل استارتاپ)، می‌توانم همان خط را دوباره فقط در آن تُن بازنویسی کنم.`,
    `Reviewing where the landing hero mock is built so we can explain it clearly.

## 1) Why the “image” looks incomplete

It is **not** a bitmap asset—it is a **CSS placeholder mock** made of gray \`div\`s and a dashed frame:

\`\`\`164:194:src/app/page.tsx
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              ...
            </div>
            <div className="grid gap-0 md:grid-cols-[1fr_1.4fr_1fr]">              <div className="hidden border-r border-white/10 p-4 md:block">
                ...
              </div>
              <div className="flex min-h-[280px] items-center justify-center ...">
                <div className="relative aspect-[4/5] ...">
                  <div className="absolute inset-4 rounded-lg border border-dashed ..." />
                  <Sparkles className="absolute bottom-4 right-4 ..." />
                </div>
              </div>
              ...            </div>
          </div>
\`\`\`

To “fix” it you typically swap in a **real studio screenshot** (PNG/WebP), a **richer CSS mock** (panels, type, sample product), or a **mini live embed** (heavier).

In **Ask mode** I cannot edit files; switch to **Agent mode** if you want me to implement it in-repo.

---

## 2) Ten name ideas (upload → directions → expand → chat → canvas → render)
1. **HeroFrame**  
2. **LockupLab**  
3. **ShelfCraft**  
4. **CanvasMint**  
5. **PitchGlass**  
6. **FrameRelay**  
7. **BrandOrbit**  
8. **Fluxboard**  
9. **Meridian Studio**  
10. **AdAgent** (or **AdAgent Studio**)

*(For an international launch, check trademark conflicts before buying a domain.)*

---

## 3) Alternate headline + subcopy

**Note:** “feel like Flair” can imply another product; safer launches describe the vibe **without** naming competitors.

### Headlines
- **Canvas-first ads with studio polish.**  
- **Product in frame. Campaign in flow.**  
- **From pack shot to paid-media hero — in one canvas.**  
- **Agent-led ad visuals, built for real products.**  
- **Dark-glass studio for ads that look designed — not generated.**

### Subcopy options
- **Upload your product shot. The agent suggests directions, expands your brief, and you iterate in chat — dark UI, glass panels, motion where it matters.**  
- **One workflow: vision analysis → three creative routes → rich image prompt → chat-driven refinements. Built for posters, social statics, and shelf-impact looks.**  
- **Drop a product photo, pick a direction, expand “make it luxury” into a full brief, then nudge light and layout in conversation — without leaving the canvas.**  
- **Gemini reads the product; you steer the campaign. Same glassy, motion-forward UI from first upload to last render.**  
- **Less prompt-hacking, more art direction: structured controls, iteration history, and outputs tuned for commercial layouts.**

Tell me if you want a **more formal** or **more playful** tone and I can rewrite in that voice only.`,
  ],
  [
    `این خوبه:
HeroFrame ai

همین رو میکنیم اسمش. پس اسامی رو تغییر بده.

اینم تیتر:

Product in frame. Campaign in flow.
اینم زیر تیتر:
Less prompt-hacking, more art direction: structured controls, iteration history, and outputs tuned for commercial layouts.
برای عکس صفحه اصلی:

 ماکت غنی‌تر با CSS (شبیه‌سازی پنل‌ها، تایپوگرافی، تصویر محصول نمونه)، یا حتی کامپوننت کوچک‌شدهٔ واقعی (سنگین‌تر). منتهی سعی کن در سبک ترین حالت و مینیمال ترین و در عین حال زیباترین حالت ممکنش در بیاری.

انجام. گزارش. ریستارت سرور لوکال`,
    `**HeroFrame AI** is the pick—rename everything to match.

**H1:** Product in frame. Campaign in flow.  
**Subhead:** Less prompt-hacking, more art direction: structured controls, iteration history, and outputs tuned for commercial layouts.

For the home visual: richer **CSS mock** (panels, type, sample product) or a shrunken live component—but keep it **as light and minimal as possible** while still beautiful.

Ship it, summarize, and **restart the local dev server**.`,
  ],
  [
    `اعمال برند «HeroFrame AI»، به‌روزرسانی تیترها و ساخت ماکت سبک CSS؛ سپس ریستارت سرور.

## گزارش

### برند **HeroFrame AI**
- **لوگوی متنی هدر لندینگ:** \`HeroFrame\` + \`AI\` با رنگ ملایم‌تر.- **متادیتا:** \`layout.tsx\` — عنوان پیش‌فرض و \`template\` به HeroFrame AI؛ توضیحات به‌روز شد.
- **استودیو:** عنوان صفحه \`Studio | HeroFrame AI\`؛ هدر workspace **HeroFrame Studio**؛ بج **Beta · HeroFrame AI**.
- **دانلود / اشتراک:** پیشوند فایل‌ها \`heroframe-creative-…\` / \`heroframe-ad.…\` و متن share **HeroFrame AI**.
- **پکیج:** \`package.json\` و \`package-lock.json\` نام **\`heroframe-ai\`**.
- **\`.env.example\` و \`scripts/test-apis.mjs\` و \`README.md\`** با نام جدید هم‌راستا شدند.  
- متغیرهای محیطی **\`ADSME_*\`** در کد API عمداً عوض نشدند تا \`.env\` فعلی نشکند.

### تیتر و زیرتیتر (صفحه اصلی)
- **H1:** «Product in frame.» + گرادیان روی **«Campaign in flow»** + نقطه.
- **زیرتیتر:** همان جمله‌ای که فرستادی دربارهٔ art direction / controls / iteration / commercial layouts.- **بج بالای هرو:** «AI product ad studio».

### ماکت جدید (فقط CSS، سبک و مینیمال)
- فایل جدید: \`src/components/marketing/HeroStudioMock.tsx\` — بدون تصویر خارجی و بدون R3F.
- نوار پنجره + \`heroframe / studio\`.
- **چپ (دسکتاپ):** باکس drag کوچک، گرید ۴ استایل با گرادیان و برچسب (Noir / Clean / Warm / Shelf).
- **وسط:** کارت کانوس با هالهٔ بنفش/صورتی، تایپوگرافی نمونه (**Lumen & Co.** + خطوط ساختگی)، ** بطری ساده با CSS**، برچسب **Editorial luxury**.
- **راست:** بلوک Brief، دکمه‌های Expand / Generate، ناحیهٔ Iteration با حباب چت و فیلد ورودی شبیه‌سازی‌شده.
- **موبایل:** نوار نازک Agent / Chat زیر کانوس.
### بیلد و سرور
- **\`npm run build\`** با موفقیت انجام شد.
- پورت‌های **۳۰۰۰–۳۰۱۰** آزاد و **\`npm run dev\`** دوباره اجرا شد → **\`http://localhost:3000\`** (Ready).

اگر بخواهی در UI جایی هنوز «AdsMe» دیده شود بگو تا همان خط را هم پیدا کنیم؛ در \`src\` دیگر ارجاعی به AdsMe نمانده است.`,
    `Applied **HeroFrame AI** branding, updated hero copy, built a lightweight CSS mock, restarted dev.

## Report

### Brand **HeroFrame AI**
- Landing header wordmark: \`HeroFrame\` + \`AI\` with softer accent. **Metadata** in \`layout.tsx\` (title template + description).
- Studio page title \`Studio | HeroFrame AI\`; workspace header **HeroFrame Studio**; pill **Beta · HeroFrame AI**.
- Download/share filenames \`heroframe-creative-…\` / \`heroframe-ad.…\`.
- Package renamed **\`heroframe-ai\`** in \`package.json\` / lockfile.
- **\`.env.example\`**, **\`scripts/test-apis.mjs\`**, **\`README.md\`** aligned. **\`ADSME_*\`** env names left intact so existing \`.env\` keeps working.

### Home hero copy
- **H1:** “Product in frame.” + gradient **“Campaign in flow.”** + dot.
- Subhead: your art-direction sentence. Eyebrow: “AI product ad studio.”

### New mock (CSS-only, minimal)
- \`src/components/marketing/HeroStudioMock.tsx\`—no external image, no R3F.
- Window chrome + \`heroframe / studio\`.
- **Left (desktop):** tiny drag tile, 4-style grid (Noir / Clean / Warm / Shelf).
- **Center:** canvas card with violet/pink glow, sample type (**Lumen & Co.**), CSS bottle, **Editorial luxury** tag.
- **Right:** Brief block, Expand/Generate, iteration chat stub.
- **Mobile:** slim agent/chat strip under canvas.

### Build + server
- **\`npm run build\`** OK; ports **3000–3010** cleared; **\`npm run dev\`** → **\`http://localhost:3000\`**.

Ping if any **AdsMe** string still shows in UI—\`src\` should be clean.`,
  ],
  [
    `یه پرامپت بده که بدم به canva واسه طراحی لوگو و favicon سایت.`,
    `Give me a **prompt** I can paste into **Canva** for logo + favicon design.`,
  ],
  [
    `می‌توانی این متن را **کپی–پیست** کنی (انگلیسی، مناسب ابزار طراحی مثل Canva):

---
**Logo + favicon brief — HeroFrame AI**

Design a **logo system** and **favicon** for **HeroFrame AI**, a B2B-style web app for **AI-powered product advertising** (upload product photo → AI suggests creative directions → generate campaign visuals on a dark “canvas” UI).

**Brand personality:** precise, premium, **studio / camera / frame** energy — not playful or childish. Think **editorial tech**, **commercial photography**, **art direction** — calm confidence, not startup chaos.

**Visual cues to explore (pick 1–2, don’t cram all):**  
- A **frame** (viewfinder, film frame, or simple geometric window) around negative space or a subtle “hero” dot  
- **Lens / aperture** abstracted into 2–3 shapes max  
- Monogram **HF** optional — only if it stays legible at small sizes  
**Style:** **minimal**, **flat or very soft 3D**, **single-color + one accent** works best. Avoid gradients in the primary logo unless extremely subtle. Must work on **dark backgrounds** (charcoal / near-black) as default; provide a **reversed / light** version for dark UI headers.

**Colors:** deep **violet** or **indigo** accent (not neon), with **white** or **cool gray** — optional tiny **fuchsia** highlight only if it stays tasteful.

**Typography (wordmark):** **HeroFrame** strong, **AI** lighter or smaller / superscript / thin weight — modern **geometric sans**, high legibility, no decorative serifs unless ultra-clean.

**Favicon:** **16–32px readable** — simplify to **frame + dot**, **abstract H**, or **aperture** — no thin lines, no tiny text.

**Avoid:** generic “AI brain” icons, magic wands, excessive sparkles, rainbows, stock “robot” tropes, complex illustrations.
Deliver: **primary horizontal logo**, **stacked / square lockup**, **favicon**, **single color** version, **on dark bg** mockup.

---

**خلاصه فارسی برای خودت:** لوگو برای **HeroFrame AI**، حس استودیو/کادر/لنز، مینیمال، تیره‌پس‌زمینه، بنفش/سرمه‌ای، بدون کلیشهٔ ربات و جادو؛ فاوآیکن خیلی ساده و درشت.`,
    `You can **copy/paste** this (English, good for Canva or similar):

---
**Logo + favicon brief — HeroFrame AI**

Design a **logo system** and **favicon** for **HeroFrame AI**, a B2B-style web app for **AI-powered product advertising** (upload product photo → AI suggests creative directions → generate campaign visuals on a dark “canvas” UI).

**Brand personality:** precise, premium, **studio / camera / frame** energy — not playful or childish. Think **editorial tech**, **commercial photography**, **art direction** — calm confidence, not startup chaos.

**Visual cues to explore (pick 1–2, don’t cram all):**  
- A **frame** (viewfinder, film frame, or simple geometric window) around negative space or a subtle “hero” dot  
- **Lens / aperture** abstracted into 2–3 shapes max  
- Monogram **HF** optional — only if it stays legible at small sizes  
**Style:** **minimal**, **flat or very soft 3D**, **single-color + one accent** works best. Avoid gradients in the primary logo unless extremely subtle. Must work on **dark backgrounds** (charcoal / near-black) as default; provide a **reversed / light** version for dark UI headers.

**Colors:** deep **violet** or **indigo** accent (not neon), with **white** or **cool gray** — optional tiny **fuchsia** highlight only if it stays tasteful.

**Typography (wordmark):** **HeroFrame** strong, **AI** lighter or smaller / superscript / thin weight — modern **geometric sans**, high legibility, no decorative serifs unless ultra-clean.

**Favicon:** **16–32px readable** — simplify to **frame + dot**, **abstract H**, or **aperture** — no thin lines, no tiny text.

**Avoid:** generic “AI brain” icons, magic wands, excessive sparkles, rainbows, stock “robot” tropes, complex illustrations.

Deliver: **primary horizontal logo**, **stacked / square lockup**, **favicon**, **single color** version, **on dark bg** mockup.

---

**Short Farsi note for yourself:** HeroFrame AI logo—studio/frame/lens vibe, minimal, dark UI, violet/indigo, no robot/wand clichés; favicon must stay bold and simple.`,
  ],
  [
    `این خوب نشد.
همون اگه میتونی یه تصویر generate شده با هوش مصنوعی درست کن جاش بذار که جذاب باشه.
مثلا زاویه یه کم داشته باشه. نور رد بشه. یه کم تبلیغاتی مثل همینا که خود سایتمون درست میکنه. ولی خود سایت رو نشون بده ها. یعنی ساختار کلی به هم نریزه.`,
    `Not happy with that.

If you can, **generate an AI marketing image** for the hero—slight angle, cinematic light, campaign feel like our own outputs, but it should still **read as this product** (don’t break the overall layout metaphor).`,
  ],
  [
    `در حال بررسی امکان تولید تصویر با API موجود پروژه؛ در صورت عدم موفقیت، یک نسخهٔ بصری پیشرفته‌تر (زاویه + نور) اضافه می‌کنیم.

نوشتن اسکریپت تولید تصویر با Replicate (متن‌به‌تصویر)، اجرای آن و اتصال کامپوننت با \`next/image\` و fallback به ماکت CSS در صورت نبود فایل.

حذف تابع \`loadEnvFile\` شکسته و نگه‌داشتن فقط \`loadEnvFileSync\`.

در حال ایجاد کامپوننت و اتصال آن به صفحه؛ سپس اجرای اسکریپت تولید تصویر.

اعتبار Replicate کافی نبود (۴۰۲). در حال تولید تصویر با ابزار تولید تصویر و ذخیره در \`public/images/hero-studio-ai.webp\`. توکن API شما در خروجی ترمینال لو رفته؛ در صورت نیاز آن را در Replicate بچرخانید.

کارهایی که انجام شد:
### ۱. تصویر هرو
به‌خاطر **۴۰۲ (اعتبار ناکافی)** روی Replicate، همان صحنهٔ استودیو (سه ستون، نور سینماتیک، زاویه) با **تولید تصویر** ساخته و در این مسیر گذاشته شد:

\`public/images/hero-studio-ai.webp\`

### ۲. کامپوننت و صفحه
- **\`HeroMarketingVisual\`** اضافه شد: با \`next/image\` همان فایل را نشان می‌دهد؛ اگر فایل نباشد یا لود نشود، خودکار به **\`HeroStudioMock\`** برمی‌گردد.
- در **\`page.tsx\`** به‌جای ماکت مستقیم، **\`HeroMarketingVisual\`** استفاده می‌شود.
### ۳. اسکریپت برای دفعه‌های بعد
- **\`scripts/generate-hero-marketing.mjs\`** (Flux Schnell + همان پرامپت تقریبی)
- در **\`package.json\`**: \`npm run hero:image\`  
بعد از شارژ حساب Replicate می‌توانی دوباره اجرا کنی تا نسخهٔ جدید جایگزین \`hero-studio-ai.webp\` شود.

### ۴. بیلد
\`npm run build\` بدون خطا تمام شد.

---
**امنیت:** در خروجی خطای Replicate، هدر \`Authorization\` (توکن) چاپ شده بود. اگر این لاگ جایی ذخیره یا به اشتراک گذاشته شده، در [Replicate](https://replicate.com) توکن را **rotate** کن.

اگر خواستی زاویه/نور یا متن روی بوم را عوض کنیم، بگو تا پرامپت اسکریپت (یا فایل تصویر) را دقیق‌تر کنیم.`,
    `Checked whether we can generate via the project APIs; if not, we would upgrade the CSS/visual treatment.

Added a Replicate text-to-image script, wired \`next/image\`, CSS mock fallback.

Removed broken \`loadEnvFile\`, kept \`loadEnvFileSync\`.

Built the component and page hookup; ran the generator.

Replicate returned **402 insufficient credit**. Generated the studio-style hero image via the image tool and saved to \`public/images/hero-studio-ai.webp\`. **Your API token may have leaked in terminal output**—rotate it in Replicate if that log was shared.

### 1. Hero image
Because of **402**, the three-column cinematic studio still was produced as a static asset at:

\`public/images/hero-studio-ai.webp\`

### 2. Component + page
- **\`HeroMarketingVisual\`** serves that file with \`next/image\`; falls back to **\`HeroStudioMock\`** if missing or broken.
- **\`page.tsx\`** now uses **\`HeroMarketingVisual\`**.

### 3. Regeneration script
- **\`scripts/generate-hero-marketing.mjs\`** (Flux Schnell + similar prompt)
- **\`npm run hero:image\`** after you top up Replicate.

### 4. Build
\`npm run build\` passed.

---
**Security:** Replicate’s error output printed an \`Authorization\` header. Rotate the token at [Replicate](https://replicate.com) if logs were stored/shared.

Say the word if you want different angle/lighting or on-canvas copy.`,
  ],
  [
    `این favicon
تنها جایی که استفاده میشه روی برگه Tab ئه.به هیچ وجه داخل خود سایت استفاده نشه.`,
    `The **favicon** should appear **only on the browser tab**—never inside the site UI.`,
  ],
  [
    `تنظیم favicon فقط برای تب مرورگر؛ بررسی نحوهٔ پیکربندی فعلی پروژه.
کپی کردن فایل PNG به \`public\` و افزودن \`metadata.icons\` در \`layout.tsx\` — بدون استفاده در UI (لوگوی هدر همان \`Zap\` می‌ماند).

انجام شد.

### تغییرات
1. **\`public/favicon.png\`** — همان طراحی viewfinder شما اینجا کپی شده (فایل استاتیک؛ هیچ کامپوننتی آن را import نمی‌کند).
2. **\`src/app/layout.tsx\`** — فقط در \`metadata.icons\` به‌صورت \`link rel="icon"\` برای تب/نوار آدرس استفاده می‌شود.
لوگوی هدر سایت همان **\`Zap\`** از Lucide است و به favicon وصل نشده؛ جای دیگری هم به \`/favicon.png\` ارجاعی نیست.

اگر بعداً خواستی برای iOS «Add to Home Screen» آیکن جدا بگذاری، می‌توانیم فقط \`apple\` را در metadata اضافه کنیم؛ فعلاً عمداً فقط \`icon\` گذاشته شده تا همان نقش تب را داشته باشد.`,
    `Favicon scoped to the browser tab; reviewed current setup.

Copied PNG to \`public\` and set \`metadata.icons\` in \`layout.tsx\`—no in-app usage (header still used \`Zap\` at the time).

### Changes
1. **\`public/favicon.png\`** — your viewfinder art, static asset (no component imports).
2. **\`src/app/layout.tsx\`** — \`metadata.icons\` only (\`rel="icon"\` for tab/omnibox).

Header logo stayed **Lucide \`Zap\`** (not wired to favicon); no other \`/favicon.png\` references.

Later we can add an \`apple\` icon for “Add to Home Screen”; for now only \`icon\` is declared so it stays tab-only.`,
  ],
  [
    `اینم لوگوی سایته. جایی که استفاده میشه کجاست؟ توی هدر سمت چپ. متوجه شدی؟ فقط همونجا.
انجام. گزارش. ریستارت سرورها`,
    `Here’s the site logo asset. **Use it only in the top-left header**—nowhere else.

Implement, report, restart servers.`,
  ],
  [
    `جایگزین کردن لوگوی هدر فقط در گوشهٔ بالاچپ؛ جستجو برای همهٔ هدرها.

### انجام شد
**۱. فایل لوگو**  
PNG شفاف در مسیر زیر قرار گرفت (فقط برای هدر):

\`public/brand/heroframe-logo.png\`

**۲. کامپوننت اختصاصی**  
\`src/components/brand/SiteHeaderLogo.tsx\` — فقط \`next/image\` + لینک به \`/\`، با \`aria-label\` برای دسترسی؛ \`alt=""\` چون متن روی لینک همان برند است.

**۳. جای استفاده (فقط هدر، گوشهٔ چپ)**  - **لندینگ:** \`src/app/page.tsx\` — به‌جای آیکن \`Zap\` + متن «HeroFrame AI».  
- **استودیو:** \`src/app/studio/studio-workspace.tsx\` — همان لوگو در ابتدای هدر؛ دکمهٔ «Home» حذف شد (رفتن به خانه با کلیک روی لوگو). عنوان از «HeroFrame Studio» به **«Studio»** تغییر کرد تا با متن داخل لوگو تکرار نشود.

لوگو در فوتر، metadata، favicon یا جای دیگری **استفاده نشده**؛ فوتر هنوز فقط متن است.

**۴. بیلد**  
\`npm run build\` بدون خطا.

**۵. ریستارت سرور**  
پروسهٔ روی پورت **3000** متوقف و **\`npm run dev\`** دوباره اجرا شد — سرور روی \`http://localhost:3000\` با پیام **Ready** بالا آمده است.
اگر بخواهی لوگو **فقط** در صفحهٔ اصلی باشد و در \`/studio\` نباشد، بگو تا همان‌جا را برگردانم.`,
    `Replaced header logos top-left only; scanned all headers.

### Done
**1. Asset** — transparent PNG for header only:

\`public/brand/heroframe-logo.png\`

**2. Component** — \`src/components/brand/SiteHeaderLogo.tsx\` (\`next/image\` + link to \`/\`, \`aria-label\`, empty \`alt\` because the link text is the brand).

**3. Usage (header left only)**  
- **Landing** \`page.tsx\` — swapped \`Zap\` + “HeroFrame AI” text.  
- **Studio** \`studio-workspace.tsx\` — same logo; removed separate Home button (logo navigates home). Title shortened to **“Studio”** to avoid repeating the wordmark.

Logo **not** used in footer, metadata, or favicon; footer stays text-only.

**4. Build** — \`npm run build\` OK.

**5. Restart** — killed port **3000** process, reran **\`npm run dev\`** → **Ready** on \`http://localhost:3000\`.

Say if the logo should be **landing-only** (not \`/studio\`).`,
  ],
  [
    `میخوام واسه نسخه موبایلی ش اون پایین نوار داشته باشه که چندتا گزینه داره. اسمش چیه؟`,
    `For the mobile version I want that **bottom bar with several options**—what’s it called?`,
  ],
  [
    `معمولاً بهش می‌گن:

- **Bottom navigation** (اصطلاح متریال دیزاین / خیلی رایج در وب و اندروید)  
- **Tab bar** (زبان رایج iOS وقتی چند تب/بخش دارد)  
- در وب/موبایل گاهی **bottom nav** یا **mobile tab bar** هم می‌گویند.

پس اگر بخواهی یک نام استاندارد برای سرچ و داک داشته باشی: **Bottom navigation**؛ اگر حس اپل‌مانند می‌دهد: **Tab bar**. هر دو برای «نوار پایین با چند گزینه» درست استفاده می‌شوند.`,
    `Common names:

- **Bottom navigation** (Material Design / very common on web + Android)  
- **Tab bar** (iOS wording when switching sections)  
- Sometimes **bottom nav** or **mobile tab bar**

For docs/search, **Bottom navigation** is the standard term; **Tab bar** if you want an Apple-ish feel. Both describe a bottom strip with multiple destinations.`,
  ],
  [
    `آره. همون. پیشنهادت چیه براش؟`,
    `Yep—that thing. What do you recommend for ours?`,
  ],
  [
    `پیشنهاد من برای **Bottom navigation** روی موبایل، مخصوصاً برای همین استودیوی سه‌ستونه‌ات، این است:

### ۱. چند تا آیتم؟
**۳ تا** بهترین تعادل است: **دارایی‌ها (آپلود)** · **بوم / پیش‌نمایش** · **ایجنت / چت**  
هر کدام دقیقاً همان سه ناحیه‌ای است که الان روی دسکتاپ کنار هم هستند؛ روی موبایل با تب بین‌شان جابه‌جا می‌شوی.

### ۲. رفتار
- فقط وقتی **\`/studio\`** (یا همان صفحهٔ کاری) است **نمایش بده**؛ روی لندینگ معمولاً لازم نیست.
- با انتخاب هر تب، **همان ستون** تمام‌عرض (یا تقریباً تمام‌ارتفاع) شود و بقیه مخفی؛ اسکرول داخل همان پنل.- **Canvas** را پیش‌فرض اول (یا بعد از آپلود) تا تمرکز روی خروجی بماند.

### ۳. UI کوچک
- آیکن + برچسب کوتاه (مثلاً «بوم»، «دارایی»، «ایجنت»).
- نوار **ثابت پایین** با \`padding-bottom: env(safe-area-inset-bottom)\` برای آیفون‌های با ناحیهٔ خانه.
- حالت فعال: رنگ accent (بنفش برند)، غیرفعال: خاکستری کم‌رنگ.

### ۴. پیاده‌سازی در استک فعلیت
- یک state مثل \`mobilePanel: 'assets' | 'canvas' | 'agent'\` در همان \`studio-workspace\` (یا layout استودیو).
- زیر \`max-lg\` نوار پایین را render کن و layout سه‌ستونه را به «یک ستون + تب» تبدیل کن.- از نظر a11y: \`role="tablist"\` / \`role="tab"\` یا دکمه‌های صریح با \`aria-current\`.

اگر بخواهی بعداً **چهارمین** آیتم اضافه کنی، معمولاً جایش **تنظیمات / بیشتر** است؛ برای نسخهٔ اول همان سه تب کافی و تمیز است.

اگر خواستی این را در پروژه پیاده کنم، باید به **Agent mode** بروی تا بتوانم کد بزنم.`,
    `For **bottom navigation** on mobile in your three-column studio:

### 1. How many items?
**Three** feels best: **Assets (upload)** · **Canvas preview** · **Agent chat**—same mental model as desktop columns.

### 2. Behavior
- Show only on **\`/studio\`** (not landing).
- Each tab shows one column full-width; others hide; scroll inside the active panel. Default to **Canvas** (or after upload) so output stays central.

### 3. UI details
- Icon + short label.
- Fixed bar with \`padding-bottom: env(safe-area-inset-bottom)\`.
- Active: accent purple; inactive: muted gray.

### 4. Implementation sketch
- State like \`mobilePanel: 'assets' | 'canvas' | 'agent'\` in \`studio-workspace\`.
- Render the bar under \`max-lg\`; collapse the three-column layout into “one column + tabs.”
- a11y: \`role="tablist"\` / \`role="tab"\` or buttons with \`aria-current\`.

A fourth slot is usually **Settings/More**—skip for v1.

Switch to **Agent mode** if you want me to ship it in code.`,
  ],
  [
    `آها. میخوام که دوربین باشه! کلید باز کردن دوربین باشه!
یعنی بزنه. دوربین واشه. عکس بگیره. درجا آپلود بشه توی استودیو نظرت چیه؟
یه همچین شکلی باشه نوار پایینش.`,
    `I want a **camera** action—a button that opens the camera, captures a photo, and **uploads straight into the studio**. Bottom bar should feel like my sketch.`,
  ],
  [
    `ایده‌ات منطقی و برای محصول «استودیوی عکس محصول» خیلی هم به‌جا است: **یک اکشن اصلی وسط** که مستقیم به **گرفتن عکس → آپلود** وصل شود، دقیقاً همان کاری است که کاربر موبایل انتظار دارد.
### نظر کلی
- **دکمهٔ دوربین وسط (FAB)** عالی است چون «منبع ورودی» اصلی‌ات همان تصویر محصول است؛ بقیهٔ نوار می‌تواند **ناوبری** باشد (مثلاً منوی دارایی‌ها / بوم / ایجنت)، نه لزوماً هر سه با یک وزن.
- **گرفتن عکس و درجا آپلود** از نظر UX درست است؛ به شرطی که بعد از گرفتن، **فیدبک فوری** ببیند (لودینگ روی بوم، پیش‌نمایش، یا رفتن خودکار به تب «بوم»).

### نکتهٔ مهم وب موبایل (نه اپ نیتیو)
روی **مرورگر** معمولاً «باز کردن اپ دوربین سیستم» مثل اپ نیتیو نیست؛ رایج‌ترین و پایدارترین راه:
- یک \`<input type="file" accept="image/*" capture="environment">\` (پشت دکمهٔ دوربین) که روی موبایل **دوربین پشت** را پیشنهاد می‌دهد، یا گالری را هم اجازه می‌دهد بسته به مرورگر/OS.
- **مجوز دوربین** را مرورگر می‌گیرد؛ روی iOS/Safari گاهی رفتار کمی متفاوت است؛ تست روی Safari و Chrome موبایل لازم است.
- اگر روزی **PWA** جدی شد، باز هم بیشتر مسیر همان \`capture\` / \`getUserMedia\` است؛ \`getUserMedia\` انعطاف بیشتری دارد ولی UI و نگهداری سنگین‌تر است.
### چیدمان شبیه اسکتچت
- **وسط:** فقط دوربین / viewfinder (همان اکشن اصلی).
- **چپ:** همبرگر مناسب است اگر **کشوی دارایی‌ها / منو** باز کند (لیست استایل، آپلودهای قبلی، تنظیمات سبک).
- **راست:** مثلث بالا می‌تواند مثلاً **بوم** (پیش‌نمایش)، **خانه**، یا **ایجنت** باشد؛ بهتر است معنی آیکن با برچسب کوتاه یا تولتیپ شفاف شود تا ابهام نماند.

### جمع‌بندی
از نظر محصول و UI، **بله — دکمهٔ دوربین مرکزی + آپلود مستقیم به همان pipeline استودیو** انتخاب خوبی است؛ از نظر فنی روی وب، **دکمه → input با \`capture\`** نقطهٔ شروع درست و کم‌دردسر است. اگر خواستی بعداً تجربهٔ «داخل‌صفحه‌ای شبیه دوربین» بسازی، آن مرحلهٔ دوم است.

الان در **Ask mode** هستم و نمی‌توانم کد بزنم؛ اگر بروی **Agent mode** می‌توانم همین نوار پایین و اتصال به آپلود استودیو را در \`studio-workspace\` پیاده کنم.`,
    `Great instinct for a **product-photo studio**: a **center FAB** wired to **capture → upload** is exactly what mobile users expect.

### Takeaways
- Central **camera FAB** works because imagery is the core input; flanking items can be **navigation** (assets / canvas / agent) with different visual weight.
- After capture, show **immediate feedback** (spinner on canvas, preview, auto-switch to Canvas tab).

### Web reality (not native)
Mobile browsers rarely open the “system camera app” like native. The reliable pattern is a hidden \`<input type="file" accept="image/*" capture="environment">\` behind the shutter—usually prefers **rear camera**, may still offer gallery depending on OS/browser.

Permissions are handled by the browser; test **Safari + Chrome** on iOS.

Future **PWA** work still leans on \`capture\` / \`getUserMedia\` (more flexible, heavier UX).

### Sketch alignment
- **Center:** shutter / viewfinder.
- **Left:** hamburger → assets drawer.
- **Right:** e.g. canvas/home/agent—label icons clearly.

**Yes:** central camera + same upload pipeline is the right v1. **Technically:** button → \`capture\` input is the pragmatic start; a custom in-page camera is phase two.

(I was in **Ask mode** in the original thread—switch to **Agent mode** to implement.)`,
  ],
  [
    `روی ایجنتی. انجام بده ببینم جه میکنی.`,
    `You’re in **Agent mode** now—ship it and show me.`,
  ],
  [
    `پیاده‌سازی نوار پایین موبایل با دکمهٔ دوربین مرکزی و اتصال به آپلود استودیو. در حال بررسی ساختار فعلی استودیو.

پیاده‌سازی نوار پایین موبایل با FAB دوربین و تب‌های Assets / Canvas / Agent؛ نگه‌داشتن یک نمونه از هر پنل با \`max-lg:hidden\` تا state حفظ شود.

ایجاد کامپوننت نوار پایین و اتصال آن به \`studio-workspace\`.

### انجام شد

**۱. \`StudioMobileBottomNav\`** (\`src/components/studio/StudioMobileBottomNav.tsx\`)  
- فقط زیر **\`lg\`** نمایش داده می‌شود (\`lg:hidden\`).  
- **Assets** (آیکن منو) · **Canvas** · **Capture** (دکمهٔ گرد بنفش با آیکن viewfinder مثل اسکتچ) · **Agent**.  
- ورودی مخفی: \`accept="image/*"\` و \`capture="environment"\` تا روی موبایل ترجیحاً **دوربین پشت** باز شود (بسته به مرورگر ممکن است گالری هم پیشنهاد شود).  
- \`pb\` + \`env(safe-area-inset-bottom)\` برای نوار خانهٔ آیفون.
**۲. \`studio-workspace.tsx\`**  
- state: \`mobileTab\` با مقدار اول **\`canvas\`**.  
- روی موبایل فقط **یک** ناحیه دیده می‌شود؛ بقیه با \`max-lg:hidden\` مخفی می‌مانند ولی **Unmount نمی‌شوند** تا state پنل‌ها حفظ شود.  
- \`onFileSelectWithMobileNav\`: بعد از آپلود موفق روی موبایل، تب را می‌برد روی **Canvas**.  
- **Generate** و **Apply & render** هم روی موبایل تب را به **Canvas** می‌برند.  
- \`main\` روی موبایل \`padding-bottom\` گرفته تا محتوا زیر نوار و FAB نرود؛ اگر پنل دیباگ تصویر باز باشد، \`padding\` بزرگ‌ترِ همان با \`max()\` ترکیب شده است.

**۳. بیلد**  
\`npm run build\` بدون خطا.
---

برای دیدنش DevTools را روی عرض **زیر 1024px** بگذار یا از گوشی باز کن. اگر بخواهی دقیقاً **سه** آیکن مثل اسکتچ (بدون تب جدا برای Canvas) داشته باشی، بگو تا چیدمان را جمع‌وجور کنیم.`,
    `Shipped a mobile bottom bar with a **center camera** wired to the studio upload pipeline.

### What landed

**1. \`StudioMobileBottomNav\`** (\`src/components/studio/StudioMobileBottomNav.tsx\`)  
- Visible only below **\`lg\`** (\`lg:hidden\`).  
- **Assets** · **Canvas** · **Capture** (purple circular shutter w/ viewfinder icon) · **Agent**.  
- Hidden input: \`accept="image/*"\`, \`capture="environment"\` (rear camera when supported).  
- Bottom padding + \`env(safe-area-inset-bottom)\`.

**2. \`studio-workspace.tsx\`**  
- \`mobileTab\` default **\`canvas\`**.  
- Mobile shows one panel at a time; others stay mounted but \`max-lg:hidden\` so state persists.  
- After successful mobile upload → switch to **Canvas**.  
- **Generate** / **Apply & render** also jump to **Canvas** on mobile.  
- \`main\` gets extra bottom padding for the bar/FAB; combines with image debug panel padding via \`max()\`.

**3. Build** — \`npm run build\` OK.

---

Test under **1024px** width or on a phone. Want a **three-icon** sketch-style bar without a separate Canvas tab? Say the word and we’ll tighten the layout.`,
  ],
  [
    `لوکال بیاد بالا`,
    `Start local dev.`,
  ],
  [
    `سرور لوکال بالا است.

**آدرس:** [http://localhost:3000](http://localhost:3000)  
\`next dev\` با \`.env.local\` اجرا شده و **Ready** گزارش شده است.`,
    `Local server is running: **http://localhost:3000** — \`next dev\` with \`.env.local\` reports **Ready**.`,
  ],
  [
    `این دکمه Open studio رو حذف کن. اضافیه.`,
    `Remove the **Open studio** button—it’s redundant.`,
  ],
  [
    `انجام شد. دکمهٔ «Open studio» از هدر صفحهٔ اصلی (\`page.tsx\`) حذف شد؛ فقط «Start creating» مانده و هنوز به \`/studio\` می‌رود.`,
    `Done. Removed **Open studio** from the landing header (\`page.tsx\`); **Start creating** remains and still links to \`/studio\`.`,
  ],
  [
    `برای این که این قسمت پایین هم مثل سایت های حرفه ای بشه و از این حالت پروژه کلاسی در بیاد چه پیشنهادی داری؟`,
    `How should we make the **footer** feel like a real product site instead of a “class project” stack dump?`,
  ],
  [
    `الان فوترت در \`page.tsx\` عملاً **رزومهٔ تک‌استک** است؛ برای حس «محصول» بهتر است آن را از **زبان توسعه‌دهنده** به **زبان کاربر/برند** برگردانی.

### ۱. متن فوتر را عوض کن (بیشترین اثر)
- خطوطی مثل «Next.js 14, Tailwind…» و «Gemini / Replicate…» را از فوتر حذف کن یا به **\`/about\`**، **\`README\`**، یا یک لینک خیلی کوچک «**Built with**» (اختیاری) ببر.
- به‌جایش: **© سال + HeroFrame AI**، یک جملهٔ کوتاه ارزش‌افزا (مثلاً focus روی تبلیغات محصول)، و لینک‌های واقعی وقتی داشتی: **Privacy**، **Terms**، **Contact**.

### ۲. چیدمان «سایت حرفه‌ای»
- فوتر **چندستونه** (مثلاً محصول / شرکت / حقوقی) روی \`md+\`، روی موبایل آکاردئون یا لیست ساده.- **لوگوی کوچک** + نام برند در یک ستون؛ بقیه لینک‌ها مرتب و کم‌حجم.
- یک **CTA تکراری** کوچک (مثلاً «شروع در استودیو») در فوتر یا بالای آن، هماهنگ با دکمه‌های هرو.

### ۳. ظاهر بصری
- \`border-t\` نازک + **گرادیان خیلی ملایم** یا نویز کم‌رنگ (هم‌خانوادهٔ بک‌گراند هرو).
- فاصلهٔ عمودی بیشتر (\`py-12\`/\`py-16\`) و **حداکثر عرض** مثل \`max-w-6xl\` تا با هدر یکی شود.
- رنگ لینک‌ها: پیش‌فرض \`muted\`، hover واضح؛ آیکن شبکه‌های اجتماعی فقط اگر واقعاً فعال هستند.

### ۴. نوار ثابت پایین (اگر منظورت «bottom bar» اپ‌مانند است)
- روی **لندینگ** معمولاً به‌جای دوربین، یک **نوار CTA** باریک (\`fixed bottom\` + safe-area) با یک دکمهٔ اصلی منطقی‌تر است؛ دوربین را همان‌طور که گذاشتی در **\`/studio\`** نگه دار.- اگر نوار ثابت بگذاری، حتماً به \`main\` **\`padding-bottom\`** بده تا محتوا زیرش نرود.

### ۵. بخش «Product pillars»
- خود کارت‌ها خوب‌اند؛ برای حرفه‌ای‌تر شدن می‌توانی یک **بند بالای فوتر** با تیتر کوتاه + یک دکمه اضافه کنی، یا کارت آخر را به «**شروع کنید**» با لینک به استودیو تبدیل کنی تا صفحه به پایین نرسد بدون اکشن.

جمع‌بندی: **حذف/انتقال متن استک از فوتر** + **فوتر چندستونه/برندمحور** + **لینک‌های حقوقی/تماس (حتی placeholder)** بیشترین فاصله را با حالت «پروژهٔ کلاسی» می‌گذارد.

اگر بخواهی همین‌ها را در کد اعمال کنم، باید به **Agent mode** بروی.`,
    `Right now the footer in \`page.tsx\` reads like a **tech resume**. For a “real product” feel, move from **developer voice** to **brand voice**.

### 1. Rewrite the copy (biggest win)
- Move “Next.js 14 / Tailwind / Gemini / Replicate” lines to **\`/about\`**, **README**, or a tiny **Built with** link.
- Replace with **© YEAR · HeroFrame AI**, a one-line value prop, and real links when you have them: **Privacy**, **Terms**, **Contact**.

### 2. Layout
- Multi-column footer on \`md+\` (Product / Company / Legal); simple stack or accordion on mobile.
- Optional small brand mark + tidy links.
- Optional secondary CTA aligned with the hero buttons.

### 3. Visual polish
- Thin \`border-t\`, subtle gradient/noise, generous \`py-12\`–\`py-16\`, \`max-w-6xl\` to match the header.
- Muted links with clear hovers; social icons only if they’re real destinations.

### 4. Sticky bottom CTA (if you meant an app-like bar)
- On marketing pages, a slim **fixed CTA** often beats a camera FAB; keep camera capture in **\`/studio\`**. Add \`padding-bottom\` on \`main\` if you add a fixed bar.

### 5. Product pillars
- Add a **pre-footer band** or turn the last card into a “Get started” jump to \`/studio\` so the page doesn’t dead-end.

**TL;DR:** evict stack spam from the footer, add brand/legal structure, optional CTA band.

(Switch to **Agent mode** if you want me to implement.)`,
  ],
  [
    `اوکی. همه رو انجام یده`,
    `OK—do **all** of that.`,
  ],
  [
    `پیاده‌سازی فوتر حرفه‌ای، صفحهٔ About برای جزئیات فنی، و بند CTA قبل از فوتر.

ایجاد کامپوننت فوتر، بند CTA، صفحهٔ About و صفحات placeholder برای Privacy، Terms و Contact.

### انجام شد

**۱. فوتر محصولی — \`SiteFooter\`** (\`src/components/marketing/SiteFooter.tsx\`)  - چیدمان **چندستونه** (\`lg:grid\`): برند با **متن** HeroFrame AI (بدون PNG لوگو، مطابق قانون «لوگوی تصویری فقط هدر»)، یک خط ارزش، دکمه **Start creating**.  
- ستون **Product**: Studio، Features (\`/#features\`)، About & stack (\`/about\`).  
- ستون **Legal**: Privacy، Terms، Contact.  
- کارت کناری **Ready when you are** + **Launch studio**.  
- نوار پایین: **© سال** + لینک توضیح stack در **About**.  
- خط گرادیان بنفش نازک بالای فوتر + \`max-w-6xl\` هم‌تراز هدر.

**۲. بند CTA قبل از فوتر — \`PreFooterCta\`** (\`src/components/marketing/PreFooterCta.tsx\`)  
- بلوک گرادیانی با تیتر، متن کوتاه، **Launch studio** و **Back to features** (\`/#features\`).  
- \`id="cta"\` برای لینک‌دهی بعدی.
**۳. صفحهٔ اصلی** (\`page.tsx\`)  
- \`id="features"\` و \`scroll-mt-24\` روی سکشن Product pillars؛ \`id\` از \`Separator\` برداشته شد تا تکراری نباشد.  
- فوتر قدیمی تک‌استک حذف و \`SiteFooter\` + \`PreFooterCta\` جایگزین شد.

**۴. صفحات placeholder**  
- \`/about\` — توضیح محصول + **لیست فنی** (Next، Tailwind، Gemini، تصاویر).  
- \`/privacy\`، \`/terms\`، \`/contact\` — متن کوتاه placeholder + لینک برگشت/مرتبط.

**۵. بیلد**  \`npm run build\` بدون خطا (۱۰ صفحهٔ استاتیک).

اگر بخواهی هدر ساده روی \`/about\` و صفحات حقوقی هم شبیه لندینگ شود، بگو تا یک \`MarketingSubLayout\` مشترک اضافه کنم.`,
    `Shipped a product-grade footer, **About** for stack details, and a **pre-footer CTA**.

### Done

**1. \`SiteFooter\`** (\`src/components/marketing/SiteFooter.tsx\`)  
- Multi-column \`lg:grid\`, text-only brand column (per “image logo stays in header”), value line, **Start creating** CTA.  
- **Product** column: Studio, Features (\`/#features\`), About (\`/about\`).  
- **Legal**: Privacy, Terms, Contact.  
- Side card **Ready when you are** + **Launch studio**.  
- Bottom bar: © year + link to stack notes on **About**.  
- Thin purple gradient rule + \`max-w-6xl\`.

**2. \`PreFooterCta\`** — gradient block, **Launch studio**, **Back to features** (\`/#features\`), \`id="cta"\`.

**3. \`page.tsx\`** — \`id="features"\` + \`scroll-mt-24\` on pillars; removed duplicate id from \`Separator\`. Replaced stack footer with \`SiteFooter\` + \`PreFooterCta\`.

**4. Placeholder routes** — \`/about\` (product + tech list), \`/privacy\`, \`/terms\`, \`/contact\`.

**5. Build** — \`npm run build\`, **10** static routes.

Want a shared marketing sub-layout for About/Legal? We can add \`MarketingSubLayout\`.`,
  ],
  [
    `سرور لوکال بالا است: **[http://localhost:3000](http://localhost:3000)** — \`next dev\` با وضعیت **Ready** اجرا شده است.`,
    `Local server: **http://localhost:3000** — \`next dev\` is **Ready**.`,
  ],
  [
    `اون پایین. دو تا دکمه پایینی دیگه اضافیه start creaing و اون open studio سمت راست پایین.
این دو نتا اضافیه. همه جا هی زدیم اوپن اوپن. بسه دیگه`,
    `Bottom of the page: the extra **Start creating** and **Launch studio** buttons are redundant—we already have enough “open studio” CTAs. Remove those two.`,
  ],
  [
    `حذف دو دکمهٔ «Start creating» و «Launch studio» از فوتر.

انجام شد.

هر دو دکمه از **\`SiteFooter\`** حذف شدند:
- **Start creating** زیر توضیح برند (ستون چپ)
- **Launch studio** داخل باکش «Ready when you are» (سمت راست)

متن آن باکس و لینک **Studio** در ستون Product مثل قبل مانده؛ برای رفتن به استودیو همان لینک متنی کافی است. دکمه‌های هرو و بلوک **PreFooterCta** (Launch studio / Back to features) و دکمه **Start creating** در هدر عوض نشده‌اند — اگر آن‌ها را هم کمتر می‌خواهی بگو کدام‌ها را حذف یا یکی کنیم.`,
    `Removed the **Start creating** and **Launch studio** buttons from the footer.

Both CTAs were deleted from **\`SiteFooter\`**:
- **Start creating** under the brand blurb (left column)
- **Launch studio** inside the “Ready when you are” card (right)

Copy + **Studio** text link in the Product column remain. Hero buttons, **PreFooterCta**, and header **Start creating** were untouched—tell me if you want those thinned out too.`,
  ],
];

/** Regex fallbacks (exact FA blocks may differ slightly on disk). */
export const HOME_LANDING_CURSOR_EN = BATCH4[1][1];
export const FOOTER_ADVICE_CURSOR_EN = BATCH4[25][1];
