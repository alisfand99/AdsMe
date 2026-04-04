/**
 * Rebuild full English chat export from _recovered_stripped.md:
 * redact secrets, replace header, translate Persian blocks (longest-first).
 * Run: node scripts/build-full-chat-export.mjs
 */
import fs from "fs";
import { BATCH2 } from "./chat-export-pairs-batch2.mjs";
import { BATCH3 } from "./chat-export-pairs-batch3.mjs";
import {
  BATCH4,
  FOOTER_ADVICE_CURSOR_EN,
  HOME_LANDING_CURSOR_EN,
} from "./chat-export-pairs-batch4.mjs";

const IN = "C:/Users/Alisf/Desktop/_recovered_stripped.md";
const OUT = "C:/Users/Alisf/Desktop/cursor_local_repository_not_a_git_direc.md";

let s = fs.readFileSync(IN, "utf8");

// --- Persian → English first (matches include raw tokens; redact after) ---
/** @type {Array<[string, string]>} */
const PAIRS = [
  [
    `این اسلایدر نمیخوام باشه اینجا. وسط صفحه اینجوری باشه که یه باکس واسه تصویر باشه. این scnee tools رو زیر عکس باشه. همین.`,
    `I do not want this slider here. The center should be one image box, with **Scene tools** directly under the photo. That is it.`,
  ],
  [
    `بررسی لایه‌بندی استودیو و \`AdCanvas\` برای حذف اسکرول داخلی ستون وسط و چیدمان «تصویر بالا، Scene tools زیر آن».

حذف اسکرول داخلی ستون وسط: اجازه اسکرول به \`main\` و چیدمان «یک باکس تصویر + Scene tools درست زیر آن» داخل همان کارت.

حذف اسکرول داخلی ستون وسط و ادغام «باکس تصویر» با Scene tools در یک کارت عمودی.

اصلاح ساختار: ارتفاع ثابت فقط روی ناحیهٔ تصویر باشد تا بخش Scene زیر آن بریده نشود.
این‌ها اعمال شد:

## ۱. حذف اسکرول داخلی ستون وسط
- در \`studio-workspace.tsx\`، روی \`lg\` دیگر \`overflow-hidden\` روی \`main\` نیست؛ کل صفحه با **\`overflow-y-auto\`** اسکرول می‌کند.
- ستون وسط دیگر \`max-height\` و \`overflow-hidden\` ندارد تا محتوا بریده نشود و آن نوار عمودی جدا کنار کانوس دیده نشود.

## ۲. یک باکس واحد: تصویر بالا، Scene tools پایین
- **\`Scene3DSchematic\` + \`CanvasToolDock\`** داخل **همان کارت گوشه‌گرد** قرار گرفتند، دقیقاً **زیر** ناحیهٔ تصویر (با یک \`border-t\`).
- کارت دوم جدا حذف شد؛ منطق بصری: اول باکس خروجی تصویر، بعد نوار ۳بعدی، بعد «Scene tools».
## ۳. ارتفاع فقط برای تصویر
- ارتفاع ثابت (\`h-[min(52dvh,480px)]\`) فقط روی **بلوک تصویر** است؛ بخش Scene دیگر داخل یک ظرف با ارتفاع محدود گیر نمی‌کند و بریده نمی‌شود.

## ۴. جزئیات کوچک
- ارتفاع ویو ۳بعدی کمی کمتر شد تا صفحه کوتاه‌تر شود.
- عنوان dock ساده شد: «Scene tools».

اگر هنوز جایی اسکرول جدا می‌بینی، یک‌بار **Hard refresh** بزن (\`Ctrl+Shift+R\`). از این به بعد اسکرول باید مثل بقیهٔ استودیو، روی کل \`main\` باشد نه فقط وسط صفحه.`,
    `Reviewing studio layout and \`AdCanvas\` to remove the inner scrollbar in the center column and arrange “image on top, Scene tools below.”

Removed inner scroll on the center column: let \`main\` scroll and keep “one image box + Scene tools right under it” inside the same card.

Merged the image box with Scene tools in one vertical card.

Adjusted structure: fixed height only on the image area so the Scene section below is not clipped.
Implemented:

## 1. Remove inner scroll on the center column
- In \`studio-workspace.tsx\`, on \`lg\`, \`main\` no longer uses \`overflow-hidden\`; the whole page scrolls with **\`overflow-y-auto\`**.
- The center column no longer uses \`max-height\` / \`overflow-hidden\`, so content is not clipped and you do not get a separate vertical strip beside the canvas.

## 2. One card: image on top, Scene tools below
- **\`Scene3DSchematic\` + \`CanvasToolDock\`** sit in the **same rounded card**, **below** the image area (with a \`border-t\`).
- The second separate card was removed; visual order: image output, 3D strip, then “Scene tools.”

## 3. Fixed height only for the image
- Fixed height (\`h-[min(52dvh,480px)]\`) applies only to the **image block**; Scene is no longer trapped in a short container.

## 4. Small tweaks
- 3D view height slightly reduced to shorten the page.
- Dock title simplified to “Scene tools.”

If you still see a separate scrollbar, do a **hard refresh** (\`Ctrl+Shift+R\`). Scrolling should match the rest of the studio on the full \`main\`, not only the middle.`,
  ],
  [
    `الان دچار یک خطای تحلیلی هستی.
قرار اینه که اون تغییراتی که توی scene tools میدیم. تبدیل به یک سری پرامپت ریاضی و دقیق بشن برای تولید تصویر جدید و ایجاد تغییرات در نور و زاویه و دوربین و ...
نه اینکه وقتی با اونا بازی میکنیم عکس بالا رو بچرخونیم یا اینا.
تو باید سعی کنی یک منطق ایجاد کنی و اونو تبدیل به پرامپت کنی. مثلا هر آبجکتی رو که کاربر میده باید هوش مصنوعی بتونه جلو و پشت و چپ و راست و بالا و پایینش رو تعیین کنه. و اون باکس چرخان توی scene tools هم باید این جهات رو داشته باشه.
بنابراین وقتی باکس رو و مشخصات رو تغییر میدیم باید دقیق اون تغییرات به صورت فرموله و دقیق تحویل هوش مصنوعی بشه در بک اند که اون بتونه دقیق ترین تصویر رو بسازه.
همینطور وقتی که یک تصویر رو می سازه. از اولین تصویر گرفته تا آخرین. باید هوش مصنوعی گوگل که تصویر رو پردازش میکنه بیاد و مشخصاتی که برای scene tools نیازه رو از تصویر داده شده استخراج کنه. مثلا چی؟ یعنی مثلا بگه الان نور در 45 درجه ست. زاویه محصول فلان درجه از فرانت محصوله و ... و اتفاقی که باید بیافته اینه که وضعیت فعلی که در تصویر هست، باید روی اون اسلایدرهای عددی باید به صورت یک نقطه کمرنگ قرار بگیره که وقتی کاربر داره تغییر وضعیت میده بدونه که داره نسبت به وضعیت فعلی چه تغییری میده.
اجرای دقیق.`,
    `There is a conceptual issue right now.

The requirement is that changes from **Scene tools** become **precise, mathematical prompts** for a **new** image—lighting, camera angle, etc.—**not** that we rotate or warp the preview while dragging sliders.

You need a clear logic that turns controls into prompts. For any object the user provides, the model should be able to reason about front/back/left/right/top/bottom; the rotating cube in Scene tools should expose those directions.

So when the cube and parameters change, the backend must receive a **formal, precise** description for the image model.

Also, for every generated image (first to last), Google’s model that processes the image should **infer** the scene parameters needed for Scene tools—e.g. “key light is at ~45°,” “product angle vs front is …”—and the **current** state in the image should appear as a **faint marker** on the numeric sliders so the user sees edits **relative** to the current frame.

Implement precisely.`,
  ],
  [
    `حذف پیش‌نمایش چرخشی روی تصویر، افزودن استخراج صحنه با Gemini، ذخیرهٔ baseline و نمایش نشانگر کمرنگ روی اسلایدرها. در حال بررسی کد فعلی.
پیاده‌سازی: حذف چرخش پیش‌نمایش تصویر؛ API استخراج صحنه با Gemini؛ پاس دادن baseline به compose؛ نشانگر روی اسلایدرها؛ برچسب‌های جهت روی مکعب.

خلاصهٔ اجرای دقیق:

## ۱. تصویر دیگر با اسلایدرها «نمی‌چرخد»
تابع \`canvasPreviewStyle\` و هر \`transform\`/\`filter\` روی خروجی تصویر حذف شد. عکس بالا فقط همان رندر است؛ تغییرات صحنه فقط برای **پرامپت نسل بعدی** است.

## ۲. استخراج صحنه از تصویر (Gemini)- **\`inferCanvasSceneFromImageWithGemini\`** در \`src/lib/ai/gemini.ts\`: با همان مختصات کنترل‌ها (زوم، yaw/pitch، roll، آزیموت/ارتفاع نور، hardness) JSON برمی‌گرداند.
- **\`clampCanvasSceneAdjustments\`** در \`src/lib/canvas/canvas-adjustments.ts\` برای هم‌راستا بودن با محدودهٔ UI.
- **\`POST /api/ai/analyze-scene-from-image\`** با بدنه \`{ imageDataUrl }\` → \`{ adjustments }\`.
- کلاینت: **\`analyzeSceneFromImage\`**.

## ۳. بعد از هر رندر
روی هر نسخهٔ تولیدشده (Generate، Apply & render، چت که تصویر بسازد) **\`inferSceneForImage(versionId, url)\`** صدا زده می‌شود و روی همان ورژن **\`inferredScene\`** ذخیره می‌شود. اگر آن ورژن هنوز فعال باشد، **اسلایدرها با همان تخمین هم‌تراز** می‌شوند.

## ۴. انتخاب ورژن
با کلیک روی یک ورژن در تاریخچه: اگر \`inferredScene\` دارد → اسلایدرها همان می‌شوند؛ وگرنه → پیش‌فرض + تحلیل دوباره در پس‌زمینه.
## ۵. Compose با baseline ریاضی
- **\`composeCanvasAdjustments\`** حالا **\`baselineScene\`** اختیاری می‌فرستد.
- در Gemini: اگر baseline باشد، دو بلوک **تخمین فعلی از تصویر** و **هدف مطلق اسلایدرها** داده می‌شود و مدل صریحاً از **تفاضل تخمین → هدف** پرامپت دقیق می‌سازد؛ بدون baseline همان حالت «هدف مطلق از استودیوی خنثی» است.
- برای **Apply**، baseline از **آخرین ورژن قبل از رندر** (همان تصویری که به عنوان ورودی می‌رود) خوانده می‌شود.

## ۶. نقطهٔ کمرنگ روی اسلایدر
در **\`CanvasToolDock\`**: برای هر کنترل، اگر برای فریم فعلی \`inferredScene\` داشته باشیم، یک **نقطهٔ بنفش کم‌رنگ** روی track نشان داده می‌شود (تخمین Gemini از همان تصویر). دکمهٔ ریست اگر baseline باشد متنش **Match image est.** است و اسلایدرها را به همان تخمین برمی‌گرداند.

## ۷. مکعب جهت‌دارروی مکعب برچسب‌های **F / B / L / R / U / D** (جلو، پشت، راست، چپ، بالا، پایین) با \`Text\` از drei اضافه شد تا محور محصول با کنترل‌های orbit/yaw هم‌معنی باشد.

---

**نکته:** تخمین بینایی است، نه متریک دوربین واقعی؛ برای همین clamp و متن راهنما «estimate» است. اگر بخواهی بعداً مدل یا دما را جدا برای inference تنظیم کنیم می‌توانیم env اضافه کنیم.`,
    `Removed rotational preview on the image; added Gemini scene extraction, baseline storage, and faint markers on sliders. Reviewing current code.

Implementation: no image rotation in preview; scene API with Gemini; pass baseline into compose; markers on sliders; direction labels on the cube.

Summary:

## 1. Image no longer “spins” with sliders
\`canvasPreviewStyle\` and any \`transform\`/\`filter\` on the output image were removed. The image is the render; scene edits feed the **next** generation prompt only.

## 2. Scene from image (Gemini)
- **\`inferCanvasSceneFromImageWithGemini\`** in \`src/lib/ai/gemini.ts\` returns JSON aligned with controls (zoom, yaw/pitch, roll, light azimuth/elevation, hardness).
- **\`clampCanvasSceneAdjustments\`** in \`src/lib/canvas/canvas-adjustments.ts\` keeps values in UI ranges.
- **\`POST /api/ai/analyze-scene-from-image\`** body \`{ imageDataUrl }\` → \`{ adjustments }\`.
- Client: **\`analyzeSceneFromImage\`**.

## 3. After each render
For each new version (Generate, Apply & render, chat that builds an image), **\`inferSceneForImage(versionId, url)\`** runs and stores **\`inferredScene\`** on that version. If that version is active, **sliders align to that estimate**.

## 4. Version selection
Clicking a history version: if \`inferredScene\` exists → sliders use it; else → defaults + background re-analysis.

## 5. Compose with numeric baseline
- **\`composeCanvasAdjustments\`** accepts optional **\`baselineScene\`**.
- With Gemini: if baseline exists, the model gets **current estimate from image** and **absolute slider target** and builds a prompt from **estimate → target**; without baseline, neutral-studio absolute targets.
- For **Apply**, baseline comes from the **last version before render** (the reference image).

## 6. Faint dot on sliders
In **\`CanvasToolDock\`**, when \`inferredScene\` exists for the frame, a **light purple dot** on the track shows Gemini’s estimate. Reset label **Match image est.** returns sliders to that estimate when baseline exists.

## 7. Labeled cube
Cube shows **F / B / L / R / U / D** via drei \`Text\` so product axes match orbit/yaw controls.

---

**Note:** This is visual estimation, not ground-truth camera metrics—hence clamping and “estimate” copy. We can add env knobs for model/temperature later if you want.`,
  ],
  [
    `سرور توسعه بالا است.

به‌خاطر اشغال بودن پورت‌های **3000 تا 3002**، این نمونه روی این آدرس اجرا شده:
**http://localhost:3003**

استودیو: **http://localhost:3003/studio**

اگر می‌خواهی حتماً روی 3000 باشد، باید آن پروسه‌های قبلی را ببندی یا در ترمینال \`Ctrl+C\` بزنی و دوباره \`npm run dev\` را فقط یک‌بار اجرا کنی.`,
    `Dev server is running.

Because ports **3000–3002** were busy, this instance is on:
**http://localhost:3003**

Studio: **http://localhost:3003/studio**

If you need port 3000 specifically, stop the other processes or press \`Ctrl+C\` and run \`npm run dev\` once.`,
  ],
  [
    `هیچ تغییری اتفاق نمی افته وفتی رندر رو میزنیم!
آیا پرامپت دقیقی میدی به هوش مصنوعی تولید تصویر؟
آیا وقتی رندر رو میزنیم دستور ایجاد تصویر جدید با مشخصات دقیق جدید صادر میشه به هوش مصنوعی؟
نکته سوم اینکه REPLICATE_API_TOKEN الان آماده ست. اگه یادت باشه گفتم که هروقت اوکی شد میگم که وصلش کنی. الان اماده ست.
صرفا برای تولید تصویر از این هوش مصنوعی استفاده کن.`,
    `Nothing changes when we hit render!
Are you sending a precise prompt to the image model?
When we render, does a **new** image request go out with the updated specs?
Third: \`REPLICATE_API_TOKEN\` is ready now—connect it when I said it would be OK. Use that provider **only** for image generation.`,
  ],
  [
    `ردیابی جریان «Apply & render» و اتصال تولید تصویر به Replicate.

اولویت با Google بود؛ اگر هر دو کلید موجود باشند، Replicate بدون \`ADSME_USE_REPLICATE=1\` استفاده نمی‌شد. اولویت را به Replicate وقتی \`REPLICATE_API_TOKEN\` تنظیم شده تغییر می‌دهیم و \`input_image\` را به‌صورت data URL می‌فرستیم (سازگاری بهتر با API).

## چرا «هیچی نمی‌شد»؟
در \`src/app/api/ai/generate/route.ts\` منطق قبلی این بود: **اگر کلید گوگل هم داشتی، پیش‌فرض تصویر با Google ساخته می‌شد** و Replicate **فقط** با \`ADSME_USE_REPLICATE=1\` یا وقتی اصلاً گوگل نبود فعال می‌شد.  
یعنی با وجود \`REPLICATE_API_TOKEN\`، تا وقتی گوگل ست بود، عملاً از Replicate برای تولید تصویر استفاده نمی‌شد (و اگر مسیر Google خطا می‌داد یا خروجی شبیه قبل بود، از دید تو «تغییری» حس نمی‌شد).

## الان چی عوض شد؟

- **اگر \`REPLICATE_API_TOKEN\` در \`.env.local\` باشد، پیش‌فرض تولید تصویر با Replicate است** (مدل پیش‌فرض همان \`black-forest-labs/flux-kontext-max\` با \`input_image\` + \`prompt\`).
- فقط اگر بخواهی دوباره عمداً Google برای **تصویر** باشد:  
  \`ADSME_FORCE_GOOGLE_IMAGE=1\` یا \`IMAGE_GENERATION_BACKEND=google\`
- برای Kontext، **\`input_image\` به‌صورت همان data URL** فرستاده می‌شود (سازگاری بهتر با API).
سرور dev را بعد از ذخیرهٔ \`.env.local\` یک‌بار **ری‌استارت** کن.

## آیا پرامپت دقیق می‌رود؟

بله. جریان **Apply & render**:

1. \`POST /api/ai/compose-canvas-adjustments\` → Gemini یک **\`augmentedPrompt\`** کامل می‌سازد (همان متن بلند با زوایا و نور و … که در Creative brief هم می‌بینی).
2. \`POST /api/ai/generate\` با بدنه  
   \`{ imageDataUrl: آخرین تصویر رندرشده, prompt: augmentedPrompt }\`  
   یعنی **دستور ساخت تصویر جدید** با همان پرامپت دقیق + تصویر مرجع.
پس از نظر معماری، هم پرامپت دقیق ساخته می‌شود هم **یک درخواست جدید تولید تصویر** زده می‌شود؛ مشکل اصلی اتصال واقعی به مدل تصویر (Replicate vs Google) بود که الان با توکن Replicate اولویت با Replicate است.

در \`.env.local\` حتماً داشته باش:

\`\`\`env
REPLICATE_API_TOKEN=r8_...
\`\`\`

(متن کامل توکن را اینجا ننویس؛ فقط در فایل محلی.)`,
    `Tracing “Apply & render” and wiring image generation to Replicate.

Previously Google took priority; with both keys set, Replicate was not used without \`ADSME_USE_REPLICATE=1\`. Priority now goes to Replicate when \`REPLICATE_API_TOKEN\` is set, and \`input_image\` is sent as a data URL for better API compatibility.

## Why “nothing happened”
In \`src/app/api/ai/generate/route.ts\`, **if Google was configured, images defaulted to Google** and Replicate ran **only** with \`ADSME_USE_REPLICATE=1\` or when Google was absent. So with \`REPLICATE_API_TOKEN\` set but Google also set, Replicate was effectively unused (and if Google errored or looked unchanged, you saw “no change”).

## What changed
- **With \`REPLICATE_API_TOKEN\` in \`.env.local\`, image generation defaults to Replicate** (default model \`black-forest-labs/flux-kontext-max\` with \`input_image\` + \`prompt\`).
- To force Google for images: \`ADSME_FORCE_GOOGLE_IMAGE=1\` or \`IMAGE_GENERATION_BACKEND=google\`.
- For Kontext, **\`input_image\` is sent as the same data URL**.

Restart dev after saving \`.env.local\`.

## Does a precise prompt go out?
Yes. **Apply & render**:
1. \`POST /api/ai/compose-canvas-adjustments\` → Gemini builds **\`augmentedPrompt\`**.
2. \`POST /api/ai/generate\` with \`{ imageDataUrl: latest rendered image, prompt: augmentedPrompt }\`—a **new** image job with that prompt + reference.

Architecturally both the prompt and a **new** generation call were already there; the main gap was which backend ran—now Replicate wins when the token is set.

In \`.env.local\` keep:

\`\`\`env
REPLICATE_API_TOKEN=[REDACTED]
\`\`\`

(Do not paste the real token into chat—local file only.)`,
  ],
  [
    `اوکیه. توی فایل محلی هست.
لوکال سرور رو بیار بالا.`,
    `OK—it is in the local file.
Start the local server.`,
  ],
  [
    `سرور بالا است.

به‌خاطر اشغال بودن پورت‌های **3000–3003**، این نمونه روی این آدرس اجرا شده:

**http://localhost:3004**

استودیو: **http://localhost:3004/studio**
\`.env.local\` هم لود شده (\`Environments: .env.local\`). اگر خواستی حتماً روی ۳۰۰۰ باشد، بقیهٔ \`next dev\`ها را ببند و دوباره \`npm run dev\` بزن.`,
    `Server is up.

Ports **3000–3003** were busy, so this run is on:

**http://localhost:3004**

Studio: **http://localhost:3004/studio**
\`.env.local\` is loaded (\`Environments: .env.local\`). For port 3000, stop other \`next dev\` processes and run \`npm run dev\` again.`,
  ],
  ...BATCH2,
  ...BATCH3,
  ...BATCH4,
  [
    `لوکال بیاد بالا.`,
    `Start the local dev server.`,
  ],
];

for (const [fa, en] of PAIRS) {
  if (s.includes(fa)) s = s.split(fa).join(en);
}

// Regex fallbacks for mixed EN/FA Cursor intros or tiny Unicode drift
s = s.replace(
  /یک پاراگراف انگلیسی زیر دکمه‌های[\s\S]*?بگو تا جابه‌جاش کنم\./,
  `A one-line English disclaimer was added under **Apply & render** / **Reset** inside the collapsible Scene tools panel, with a light divider and smaller type.

Copy:

*«Scene controls only enrich the camera-and-lighting wording in your generation prompt—they are not executed as a deterministic 3D rig. The model treats that text as interpretive direction; pixel-accurate or numerically exact reproduction of every adjustment is not guaranteed.»*

Say if you want the same note visible when the panel is collapsed under “Scene tools.”`
);

s = s.replace(
  /\*\*Cursor\*\*\r?\n\r?\nدر حال بررسی محل ساخت تصویر\/پیش‌نمایش صفحهٔ اصلی تا توضیح دقیق بدهیم\.[\s\S]*?(?=\r?\n---\r?\n\r?\n\*\*User\*\*\r?\n\*\*HeroFrame AI\*\* is the pick)/,
  `**Cursor**\n\n${HOME_LANDING_CURSOR_EN}`
);

s = s.replace(
  /\*\*Cursor\*\*\r?\n\r?\nالان فوترت در `page\.tsx`[\s\S]*?(?=\r?\n---\r?\n\*\*User\*\*\r?\n\r?\nOK[\u2014\u2013-]do \*\*all\*\* of that\.)/,
  `**Cursor**\n\n${FOOTER_ADVICE_CURSOR_EN}`
);

// --- Redact secrets (after translation) ---
s = s.replace(/\br8_[A-Za-z0-9_-]+\b/g, "[REDACTED_REPLICATE_TOKEN]");
s = s.replace(/\bAIzaSy[A-Za-z0-9_-]{20,}\b/g, "[REDACTED_GOOGLE_API_KEY]");
s = s.replace(/REPLICATE_API_TOKEN\s*=\s*\S+/gi, "REPLICATE_API_TOKEN=[REDACTED]");
s = s.replace(
  /GOOGLE_GENERATIVE_AI_API_KEY\s*=\s*\S+/gi,
  "GOOGLE_GENERATIVE_AI_API_KEY=[REDACTED]"
);
s = s.replace(/GEMINI_API_KEY\s*=\s*\S+/gi, "GEMINI_API_KEY=[REDACTED]");
s = s.replace(/GOOGLE_AI_API_KEY\s*=\s*\S+/gi, "GOOGLE_AI_API_KEY=[REDACTED]");
s = s.replace(/Bearer\s+r8_[^\s]+/gi, "Bearer [REDACTED]");
s = s.replace(
  /Authorization:\s*['"]?Bearer\s+[^'"\s]+/gi,
  "Authorization: Bearer [REDACTED]"
);

// --- Header ---
s = s.replace(
  /^# Local repository not a git directory\n_Exported on .*$/m,
  "# HeroFrame AI — Cursor chat export (full, English, redacted)\n\n_Reconstructed from workspace transcript; originally exported 2026-04-04. Sensitive values replaced with placeholders._"
);

// Fix accidental quadruple backticks
s = s.replace(/\`\`\`\`env/g, "```env");

fs.writeFileSync(OUT, s, "utf8");
const left = /[\u0600-\u06FF]/.test(s);
console.log("Wrote", OUT, "chars:", s.length, "remaining Persian:", left);
