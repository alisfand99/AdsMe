/** More FA→EN blocks (appended after batch 1; keep longest-first within this file). */
export const BATCH2 = [
  [
    `لوکال بیاد بالا. ترمینال های اضافی رو هم ببند.`,
    `Start the local dev server and close the extra terminals.`,
  ],
  [
    `ببین. بازم اون تغییر نور و زوایایی که میخوام روی تصویر انجام نمیشه.
ببین. نکته اصلی اینه که وقتی داریم تغییر تصویر قبلی رو انجام میدیم دو تا مرجع داریم. یک مرجع عکس که همون عکس ورژن قبلیه و یک مرجع متن. که وقتی داریم تغییر رو انجام میدیم مرجع متنی میشه تغییراتی که از منبع scene tools و چت باکس iteration میگیریم. دیگه سراغ پرامپت اولیه نمی ریم. منبع پرامپتمون میشه چی؟ این دوتا.
پس وقتی تصویر جدید رو هوش مصنوعی میخواد درست کنه باید اون پرامپت دقیقی که از مشخصات scene tools درست کردی یا اگه چتی توی چت باکس iteration باشه بره برای هوش مصنوعی. نه چیز دیگری!
ضمنا یه باکس موقتی اون ته صفحه درست کن که پرامپتی که برای هر تغییر میدی به هوش مصنوعی رو ببینم.`,
    `Again: the lighting / angle changes I want still are not happening on the image.

The key point: when we edit the **previous** image we have **two** references—the **photo** (last version) and **text**. While editing, the **text** reference must be only what comes from **Scene tools** and the **iteration chat**—not the original brief. Those two are our prompt sources.

So when the model builds the **new** image it must receive the **exact** prompt from Scene tools (or iteration chat if present)—nothing else.

Also add a **temporary panel at the bottom** so I can read the prompt you send to the model for each change.`,
  ],
  [
    `در حال بررسی جریان کامل پرامپت و تصویر در استودیو.
یکپارچه‌سازی زنجیرهٔ متنی ی iteration (\`iterationRenderPrompt\`)، حذف بازگشت به بریف هنگام scene/chat، همگام‌سازی با ورژن انتخاب‌شده، و افزودن پنل اشکال‌زدایی ثابت در پایین صفحه.

اعمال تغییرات در \`studio-workspace.tsx\` و تقویت دستورالعمل‌های Gemini در \`gemini.ts\`.

این‌ها اعمال شد:
## ۱. زنجیرهٔ متنی فقط «تصویر قبلی + متن iteration»
- **\`iterationRenderPrompt\`**: بعد از **اولین Generate** همان بریف اولیه را ذخیره می‌کند؛ از آن به بعد **فقط** با **Apply & render** (scene tools) و **چت iteration** به‌روز می‌شود.
- **Scene tools** دیگر از باکس Creative brief به‌عنوان منبع merge استفاده نمی‌کند؛ ورودی \`composeCanvasAdjustments\` همیشه **\`iterationRenderPrompt\`** است.
- **چت iteration** دیگر به \`prompt\` (بریف) برنمی‌گردد؛ فقط **\`iterationRenderPrompt\`** به refine داده می‌شود.
- با **انتخاب یک ورژن** در تاریخچه، \`iterationRenderPrompt\` با **\`promptUsed\`** همان ورژن هم‌تراز می‌شود تا زنجیره با همان فریم منطقی باشد.
- دیگر **\`setPrompt(augmentedPrompt)\`** بعد از scene نیست؛ بریف در UI جدا می‌ماند.

## ۲. تقویت پرامپت در Gemini
- **Compose scene**: تأکید شده خروجی **\`augmentedPrompt\` یک پرامپت کامل** باشد + پاراگراف جدا **\`CAMERA & LIGHTING (exact):\`** — نه فقط یک delta کوتاه.
- **Refine چت**: تصریح شده منبع متن فقط **iteration prompt** است، نه بریف جدا.- بخش delta که می‌گفت «فقط تغییر لازم را بنویس» طوری عوض شد که **محتوای iteration حذف نشود**.

## ۳. باکس موقت پایین صفحه (debug)
- بعد از هر درخواست به **\`/api/ai/generate\`**، همان رشتهٔ **\`prompt\`** در یک پنل **ثابت پایین** نشان داده می‌شود (با برچسب منبع: Generate / Apply & render / Chat).
- جمع‌شونده با فلش؛ وقتی باز است **\`main\`** کمی **\`padding-bottom\`** می‌گیرد تا محتوا زیر پنل نرود.

اگر هنوز نور/زاویه روی خروجی Replicate ضعیف است، متن دقیق همان باکس پایین را بفرست تا ببینیم مدل چه چیزی می‌گیرد.`,
    `Reviewing the full prompt + image flow in the studio.

Wiring the iteration text chain (\`iterationRenderPrompt\`), stopping fallbacks to the brief during scene/chat, syncing with the selected version, and adding a fixed bottom debug panel.

Changes in \`studio-workspace.tsx\` and stronger Gemini instructions in \`gemini.ts\`.

Done:

## 1. Text chain = “previous image + iteration text” only
- **\`iterationRenderPrompt\`**: after the **first Generate** it stores the initial brief; afterward it updates **only** via **Apply & render** (Scene tools) and **iteration chat**.
- **Scene tools** no longer merge from the Creative brief box; \`composeCanvasAdjustments\` always receives **\`iterationRenderPrompt\`**.
- **Iteration chat** no longer falls back to \`prompt\` (brief); refine gets **\`iterationRenderPrompt\`** only.
- When you **pick a version** in history, \`iterationRenderPrompt\` aligns with that version’s **\`promptUsed\`**.
- No more **\`setPrompt(augmentedPrompt)\`** after scene; the brief stays separate in the UI.

## 2. Stronger Gemini prompting
- **Compose scene**: output must be a **full** \`augmentedPrompt\` plus a **\`CAMERA & LIGHTING (exact):\`** block—not a tiny delta only.
- **Refine chat**: text source is **iteration prompt** only, not the separate brief. The old “write only the delta” wording was adjusted so **iteration content is not dropped**.

## 3. Temporary bottom debug box
- After each **\`/api/ai/generate\`** call, the **\`prompt\`** string shows in a **fixed bottom** panel (source label: Generate / Apply & render / Chat).
- Collapsible with a chevron; when open, **\`main\`** gets **\`padding-bottom\`** so content clears the panel.

If lighting/angle still look weak on Replicate, paste the exact text from that bottom box so we can see what the model receives.`,
  ],
  [
    `دلیل اینه که وقتی داریم پرامپت تغییرات رو هم میدی اولش همون کسشرای پرامپت اصلی رو همچنان داری:`,
    `The reason is that when you send the “change” prompt you still prepend the whole long **original** brief:`,
  ],
  [
    `واسه همینه که وقتی میاد ادیت کنه فقط همون اولش رو که کسشرات پرامپت اصلیه ست رو انجام میده و به تغییرات نمی رسه. پرامپتی که میدی صرفا اشاره به تغییرات در ورژن جدید داشته باشه نه اون محتوای پرامپت اصلی!!!`,
    `That is why the model mostly follows the **opening** luxury brief and barely reaches the real edits. The prompt you send should reference **only the changes** for the new version—not the full original brief!!!`,
  ],
  [
    `تغییر مسیر compose به حالت «فقط دستورالعمل تغییر» بدون تکرار بلوک طولانی بریف؛ به‌روزرسانی refine چت به همان منطق.

بازنویسی \`compose\` برای خروجی فقط «دستور ادیت صحنه» و به‌روزرسانی \`refine\` برای \`imagePrompt\` کوتاه و delta-centric.

## مشکل چه بود؟
Gemini برای **Scene tools** طبق دستور قبلی کل **iteration prompt** (همان بلوک طولانی luxury editorial) را دوباره داخل \`augmentedPrompt\` می‌چسباند و فقط آخرش \`CAMERA & LIGHTING\` را اضافه می‌کرد. مدل image-to-image معمولاً همان ابتدای متن را «اصلی» می‌گیرد و بخش نور/زاویه را کمتر اجرا می‌کند.

## چه کار شد؟

### ۱. Compose صحنه = **فقط دلتا**
- **\`composeCanvasAdjustmentsWithGemini\`** دوباره نوشته شد: دیگر **هیچ** بلوک «پرامپت اصلی» به مدل داده نمی‌شود و در خروجی هم **مجاز نیست** همان کلیشه‌های تبلیغاتی را تکرار کند.- فقط **تگ‌های کوتاه** برند/استایل (برای فهم مدل، نه کپی در خروجی) + JSON اسلایدرها + baseline بینایی.
- خروجی باید شبیه این باشد: **یک جمله** «مرجع = همان تصویر» + بلوک **\`CAMERA & LIGHTING (exact):\`** با اعداد دقیق؛ **بدون** پاراگراف‌های بازاری طولانی.
- اگر JSON خراب باشد، **\`fallbackSceneDeltaPrompt\`** همان مقادیر عددی را به‌صورت کوتاه می‌سازد.

### ۲. API
- **\`currentImagePrompt\`** برای این مسیر **اجباری نیست** (دیگر ۴۰۰ نمی‌دهد اگر خالی باشد).

### ۳. استودیو
- روی **Apply & render** دیگر **\`iterationRenderPrompt\` طولانی** به compose فرستاده نمی‌شود؛ **\`currentImagePrompt: ""\`** — یعنی فقط **اسلایدر + تصویر مرجع + تگ‌های کوتاه** تصمیم می‌گیرند.
### ۴. چت iteration (refine)
- متن قبلی در prompt به Gemini **حداکثر ۸۰۰ کاراکتر** + یادداشت «truncated — مرجع بصری تصویر است».
- **\`imagePrompt\`** دیگر به‌عنوان fallback به کل متن قبلی برنمی‌گردد؛ اگر خالی باشد:  
  \`Use the reference image as the full visual base. Apply only: …\`

بعد از یک بار **Apply** جدید، در باکس پایین باید ببینی پرامپت کوتاه شده و تقریباً فقط دستور دوربین/نور است؛ اگر هنوز چیزی بلند دیدی، همان را بفرست تا بررسی کنیم.`,
    `Rerouted compose to “**change instructions only**” without repeating the long brief; updated chat refine to the same idea.

Rewrote \`compose\` to emit only a **scene edit directive** and \`refine\` for a short, delta-centric \`imagePrompt\`.

## What was wrong?
For **Scene tools**, Gemini was still **pasting the entire iteration prompt** (the long luxury block) into \`augmentedPrompt\` and only appending \`CAMERA & LIGHTING\`. Image-to-image models usually weight the **start** of the text most, so lighting/angle got starved.

## What we did

### 1. Scene compose = **delta only**
- **\`composeCanvasAdjustmentsWithGemini\`** was rewritten: **no** “main prompt” block is fed in, and the model **must not** repeat ad clichés in the output—only **short** brand/style tags (for understanding, not to copy) + slider JSON + visual baseline.
- Output shape: **one sentence** “reference = same image” + **\`CAMERA & LIGHTING (exact):\`** with numbers—**no** long marketing paragraphs.
- Bad JSON → **\`fallbackSceneDeltaPrompt\`** emits compact numeric wording.

### 2. API
- **\`currentImagePrompt\`** is **not required** for this path (no 400 when empty).

### 3. Studio
- **Apply & render** no longer sends the long \`iterationRenderPrompt\` into compose; **\`currentImagePrompt: ""\`** so **sliders + reference image + short tags** drive the result.

### 4. Iteration chat (refine)
- Prior text to Gemini is **capped at 800 chars** + note “truncated — visual reference is the image.”
- **\`imagePrompt\`** no longer falls back to the entire prior text; if empty: \`Use the reference image as the full visual base. Apply only: …\`

After a fresh **Apply**, the bottom box should show a **short** prompt—mostly camera/light. If it is still long, paste it and we will trace further.`,
  ],
  [
    `این اعدادی که نوشتی خب برای هوش مصنوعی معنایی نداره که کسخل!!!
اینا باید یک مترجم داشته باشه که اینا یعنی چی.
پرامپتی که میدی باید شامل اعداد واقعی باشه که هوش مصنوعی بفهمه.
براش قشنگ تحلیل کنی که الان مثلا توی همچین وضعیتی هستی. مثلا در فاصله بیست سانتی هستی. (با توجه به اعداد محاسباتی دقیق) باید بری در فاصله 50 سانتی از محصول. الان نور در زاویه فلان از سمت راست محصوله. باید بره از زاویه فلان چپ محصول.
منظورم اینه که این اعدادت رو (در وضعیت فعلی و وضعیت درخواستی کاربر) باید برای هوش مصنوعی شرح بدی تا بفهمه باید چه تغییری بده`,
    `Those parameter names mean **nothing** to the image model by themselves!!!
There must be a **translator** that explains what they mean.

The prompt should use **human** distances and angles the model understands—e.g. you are ~20 cm from the product now (from the math) and need to move to ~50 cm; key light is currently from such-and-such on the product’s right and should move to the left at such-and-such.

You need to **describe current vs requested** in plain photographic language so the model knows what to change.`,
  ],
  [
    `افزودن مترجم قطعی TypeScript که کنترل‌های عددی را به زبان عکاسی واقعی (فاصله تقریبی سانتی‌متر، جهت نور، زاویه دوربین) تبدیل کند و استفاده از آن به‌عنوان بدنهٔ اصلی \`augmentedPrompt\`.

در حال افزودن ماژول مترجم قطعی و جایگزینی خروجی compose با آن.

وصل کردن \`composeCanvasAdjustmentsWithGemini\` به مترجم قطعی و رفع باگ مقایسهٔ \`baseline === target\` (همیشه false برای دو آبجکت).

کار تمام شد. خلاصهٔ تغییرات:

## وصل شدن مترجم به خروجیٔ کامپوز
تابع \`composeCanvasAdjustmentsWithGemini\` دیگر به Gemini درخواست نمی‌زند؛ خروجی‌اش **قطعی** است و از همان ماژول \`scene-to-photographic-english.ts\` می‌آید:

- **\`augmentedPrompt\`** ← \`buildPhotographicSceneEditPrompt(baseline, target, creativeContext)\`  
  (فاصلهٔ تقریبی سانتی‌متر، اوربیت، پیتچ، رول، نور با زاویه و جهتٔ قابل‌فهم، و در صورت وجود baseline بلوک «وضعیت فعلی تخمینی» + «تغییرات» + «هدف نهایی»)
- **\`adjustmentSummary\`** ← \`summarizeSceneDelta(baseline, target)\`

مقادیر قبل از ساخت متن با **\`clampCanvasSceneAdjustments\`** هم‌رنج اسلایدرها می‌شوند.

## حذف مسیر قدیمی
- \`fallbackSceneDeltaPrompt\`، \`formatSceneEditContextTags\` و \`canvasComposeSchema\` برای این مسیر حذف شدند تا دیگر نام‌های داخلی مثل \`orbitYawDeg\` در پرامپت تصویر تکرار نشوند.

## باگ کوچک

شرط \`baseline === target\` همیشه برای دو آبجکت جدا false بود؛ الان با **\`canvasAdjustmentsEqual\`** درست شده تا اگر baseline و هدف یکی باشند، فقط بلوک «هدف» بیاید نه دلتای اشتباه.

\`npm run build\` بدون خطا پاس شد.

**نکته:** نام تابع هنوز \`…WithGemini\` است ولی برای **compose-canvas-adjustments** دیگر کلید Gemini لازم نیست؛ بقیهٔ APIهای Gemini مثل قبل به کلید وابسته‌اند. اگر بخواهی می‌توانیم نام تابع/ایمپورت را بعداً به چیزی مثل \`composeCanvasScenePrompt\` عوض کنیم.`,
    `Added a deterministic TypeScript translator that turns numeric controls into real-world photo language (approximate cm distance, light direction, camera angles) as the core of \`augmentedPrompt\`.

Adding the translator module and swapping compose output to use it.

Wired \`composeCanvasAdjustmentsWithGemini\` to the translator and fixed the \`baseline === target\` bug (always false for two object literals).

Done. Summary:

## Translator drives compose output
\`composeCanvasAdjustmentsWithGemini\` **no longer calls Gemini** for this path; output is **deterministic** from \`scene-to-photographic-english.ts\`:

- **\`augmentedPrompt\`** ← \`buildPhotographicSceneEditPrompt(baseline, target, creativeContext)\` (approximate cm, orbit/pitch/roll, readable light angles; with baseline: “estimated current” + “changes” + “final target”)
- **\`adjustmentSummary\`** ← \`summarizeSceneDelta(baseline, target)\`

Values are **\`clampCanvasSceneAdjustments\`**-aligned before text is built.

## Old path removed
- \`fallbackSceneDeltaPrompt\`, \`formatSceneEditContextTags\`, and \`canvasComposeSchema\` were removed for this flow so internal names like \`orbitYawDeg\` do not leak into image prompts.

## Small bugfix
\`baseline === target\` was always false for separate objects; **\`canvasAdjustmentsEqual\`** fixes equality so identical baseline/target yields “target” only, not a bogus delta.

\`npm run build\` passed.

**Note:** The function is still named \`…WithGemini\`, but **compose-canvas-adjustments** no longer needs a Gemini key; other Gemini routes still do. We can rename to e.g. \`composeCanvasScenePrompt\` later if you want.`,
  ],
  [
    `ببین. پس زیر اون scene tools مون یه چیزی بنویس که این فقط صرفا برای بهتر کردن پرامپت استفاده میشه ولی تضمینی در این که دقیقا همین تغییرات توسط هوش مصنوعی اتفاق بیافته وجود نداره.
به انگلیسی یه همچین چیزی بنویس. یه متن حرفه ی تر.`,
    `Under our Scene tools, add copy (in **English**) explaining that controls only **help the prompt** and there is **no guarantee** the model will reproduce every adjustment exactly—word it professionally.`,
  ],
  [
    `یک پاراگراف انگلیسی زیر دکمه‌های **Apply & render** / **Reset** اضافه شد (داخل همان پنل بازشوندهٔ Scene tools)، با خط جداکنندهٔ ظریف و تایپ کوچک‌تر تا مثل یادداشتٔ حرفه‌ای به‌نظر برسد.

متن:

اگر بخواهی همین متن وقتی پنل جمع است هم زیر عنوان «Scene tools» دیده شود، بگو تا جابه‌جاش کنم.`,
    `Added a one-line English disclaimer under **Apply & render** / **Reset** inside the collapsible Scene tools panel, with a light divider and smaller type so it reads like a professional footnote.

Copy:

*«Scene controls only enrich the camera-and-lighting wording in your generation prompt—they are not executed as a deterministic 3D rig. The model treats that text as interpretive direction; pixel-accurate or numerically exact reproduction of every adjustment is not guaranteed.»*

If you want the same note visible when the panel is **collapsed** (under the “Scene tools” title), say so and we can move it.`,
  ],
];
