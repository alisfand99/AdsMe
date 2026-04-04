/** Remaining FA→EN blocks (landing, branding, mobile nav, footer). */
export const BATCH3 = [
  [
    `چند سرور \`next dev\` هم‌زمان روی پورت‌های 3000–3004 در حال اجراست. در حال آزاد کردن پورت‌ها و راه‌اندازی یک نمونهٔ تمیز روی 3000. تب‌های اضافی ترمینال در Cursor را باید خودت ببندی — از اینجا قابل بستن نیستند.

این کارها انجام شد:

1. **پروسه‌هایی که روی پورت‌های ۳۰۰۰–۳۰۱۰ گوش می‌دادند** متوقف شدند (چند تا \`next dev\` هم‌زمان باعث شده بود 3001، 3002، … استفاده شود).2. **یک سرور تازه** با \`npm run dev\` در پس‌زمینه بالا آمده و الان روی **\`http://localhost:3000\`** است (\`Ready\` خورده).

**ترمینال‌های اضافی:** از داخل Cursor نمی‌توانم تب ترمینال را برایت ببندم. لطفاً خودت تب‌های قدیمی‌ای که دیگر \`npm run dev\` یا build در آن‌ها نیست (یا خطای توقف خورده) را با سطل زباله / Kill Terminal ببند و فقط همان ترمینالی که الان سرور روی 3000 است را نگه دار.

اگر هنوز جایی پیام «port in use» دیدی، بگو تا همان پورت را دوباره چک کنیم.`,
    `Several \`next dev\` servers were running on ports 3000–3004. Freeing ports and starting a clean instance on 3000. Extra Cursor terminal tabs must be closed manually—I cannot close them from here.

Done:

1. **Processes listening on 3000–3010** were stopped (multiple dev servers had bumped you to 3001, 3002, …).  
2. A **fresh** \`npm run dev\` is running in the background on **\`http://localhost:3000\`** (\`Ready\`).

**Extra terminals:** I cannot close terminal tabs from here. Please close old tabs that no longer run \`npm run dev\` or builds (or show stopped errors) via the trash / Kill Terminal, and keep only the one serving port 3000.

If you still see “port in use,” tell me which port and we will recheck.`,
  ],
  [
    `یه سوال.
الان دقیق بگو هرکدوم از تسک ها دقیقا توسط کدوم api ها داره انجام میشه؟`,
    `Quick question: which **API** handles each task exactly?`,
  ],
  [
    `در حال بررسی مسیرهای API و محل فراخوانی آن‌ها در پروژه.

این نقشهٔ دقیقِ **هر کار** ↔ **کدام API** (و در پس‌زمینه چه سرویسی) است، مطابق کد فعلی پروژه:

---

### ۱. \`POST /api/ai/analyze\`
- **کار:** تحلیل تصویر محصول (دسته، رنگ‌ها، متریال، جهت‌های خلاقانه و …).
- **کد سمت سرور:** \`analyzeProductWithGemini\` در \`gemini.ts\`.
- **در UI:** بعد از آپلود فایل، در \`studio-workspace.tsx\` با \`analyzeProductImage\` → همین API.
---

### ۲. \`POST /api/ai/expand-prompt\`
- **کار:** گسترشِ متن کوتاه کاربر به یک پرامپت خلاقانهٔ بلندتر با توجه به \`creativeContext\` (استایل تبلیغ، تایپوگرافی، برند، …).
- **کد:** \`expandPromptWithGemini\`.
- **در UI:** دکمه/جریان Expand با \`expandCreativePrompt\`.

---

### ۳. \`POST /api/ai/generate\`- **کار:** **خروج گرفتن تصویر نهایی** (image-to-image با تصویر مرجع + متن پرامپت).
- **بک‌اند تصویر:**
  - اگر \`REPLICATE_API_TOKEN\` باشد و \`ADSME_FORCE_GOOGLE_IMAGE\` / \`IMAGE_GENERATION_BACKEND=google\` اجبار نکند → **Replicate** (پیش‌فرض مدل مثل \`flux-kontext-max\` با \`input_image\`).
  - وگرنه → **\`generateAdImageWithGoogleTemp\`** (کلیدهای Google/Gemini).
- **در UI:** اولین Generate، Apply & render (بعد از compose)، و هر بار Refine از چت که دوباره تصویر ساخته می‌شود → همه با \`generateAdImage\`.

---

### ۴. \`POST /api/ai/refine\`
- **کار:** چت روی نسخهٔ ساخته‌شده — پاسخ متنی به کاربر + **\`imagePrompt\`** برای رندر بعدی (دلتای ویرایش، نه کل بریف لوکس).- **کد:** \`refineWithGemini\`.
- **در UI:** ارسال پیام در بخش iteration chat با \`refineFromChatHistory\`؛ بعد از آن کلاینت جداگانه \`generate\` را با \`result.imagePrompt\` صدا می‌زند.

---

### ۵. \`POST /api/ai/suggest-tagline\`
- **کار:** پیشنهاد چند تگ‌لاین تبلیغاتی از روی خلاصهٔ محصول (و اختیاری تصویر).
- **کد:** \`suggestTaglinesWithGemini\`.
- **در UI:** \`onSuggestTaglines\` با \`suggestAdvertisingTaglines\`.
---

### ۶. \`POST /api/ai/compose-canvas-adjustments\`
- **کار:** تبدیل اسلایدرهای صحنه + (اختیاری) baseline تخمینی به **\`augmentedPrompt\`** انگلیسی و **\`adjustmentSummary\`** برای UI.
- **کد:** تابعی که در import هنوز \`composeCanvasAdjustmentsWithGemini\` نام دارد، ولی **دیگر به Gemini درخواست نمی‌زند**؛ خروجی از \`buildPhotographicSceneEditPrompt\` / \`summarizeSceneDelta\` در \`scene-to-photographic-english.ts\` است (منطق قطعی روی سرور).
- **در UI:** \`Apply & render\` در scene tools با \`composeCanvasAdjustments\`؛ بلافاصله بعدش \`generate\` با همان \`augmentedPrompt\`.

---

### ۷. \`POST /api/ai/analyze-scene-from-image\`- **کار:** از روی **تصویر رندر شده**، تخمین اسلایدرهای صحنه (\`CanvasSceneAdjustments\`) برای نقطهٔ بنفش روی اسلایدر و هم‌ترازی با فریم فعلی.
- **کد:** \`inferCanvasSceneFromImageWithGemini\`.
- **در UI:** \`inferSceneForImage\` بعد از هر generate جدید یا وقتی نسخه‌ای را انتخاب می‌کنی که هنوز \`inferredScene\` ندارد.

---

### جمع‌بندی سریع
| تسک | API |
|--------|-----|
| تحلیل محصول از عکس | \`/api/ai/analyze\` || بزرگ‌کردن پرامپت اولیه | \`/api/ai/expand-prompt\` |
| ساختن/آپدیت تصویر آگهی | \`/api/ai/generate\` |
| چت و پرامپت رندر بعدی | \`/api/ai/refine\` (+ بعدش \`generate\`) |
| پیشنهاد تگ‌لاین | \`/api/ai/suggest-tagline\` |
| متن پرامپت از scene tools | \`/api/ai/compose-canvas-adjustments\` (+ بعدش \`generate\`) |
| تخمین صحنه از تصویر | \`/api/ai/analyze-scene-from-image\` |

همهٔ مسیرهای \`/api/ai/*\` به‌جز **\`generate\`** و **\`compose-canvas-adjustments\`** در عمل به **Gemini** (از طریق \`gemini.ts\`) وابسته‌اند؛ **\`generate\`** به Replicate یا Google تصویر بستگی به env دارد؛ **\`compose-canvas-adjustments\`** فقط منطق TypeScript است و به API خارجی برای همان endpoint نیاز ندارد.`,
    `Reviewing API routes and where they are called.

Here is the **task ↔ API** map (and backing service) for the current codebase:

---

### 1. \`POST /api/ai/analyze\`
- **Job:** Product image analysis (category, colors, materials, creative directions, …).
- **Server:** \`analyzeProductWithGemini\` in \`gemini.ts\`.
- **UI:** After upload in \`studio-workspace.tsx\` via \`analyzeProductImage\`.

---

### 2. \`POST /api/ai/expand-prompt\`
- **Job:** Expand short user text into a longer creative prompt using \`creativeContext\` (ad style, typography, brand, …).
- **Code:** \`expandPromptWithGemini\`.
- **UI:** Expand flow via \`expandCreativePrompt\`.

---

### 3. \`POST /api/ai/generate\`
- **Job:** Final **image** output (image-to-image with reference + prompt).
- **Image backend:**
  - If \`REPLICATE_API_TOKEN\` is set and Google is not forced → **Replicate** (default e.g. \`flux-kontext-max\` with \`input_image\`).
  - Else → **\`generateAdImageWithGoogleTemp\`** (Google/Gemini keys).
- **UI:** First Generate, Apply & render (after compose), and each chat refine that rebuilds an image → all use \`generateAdImage\`.

---

### 4. \`POST /api/ai/refine\`
- **Job:** Chat on the built version—assistant reply + **\`imagePrompt\`** for the next render (edit delta, not the whole luxury brief).
- **Code:** \`refineWithGemini\`.
- **UI:** Iteration chat via \`refineFromChatHistory\`, then client calls \`generate\` with \`result.imagePrompt\`.

---

### 5. \`POST /api/ai/suggest-tagline\`
- **Job:** Suggest ad taglines from product summary (optional image).
- **Code:** \`suggestTaglinesWithGemini\`.
- **UI:** \`onSuggestTaglines\` / \`suggestAdvertisingTaglines\`.

---

### 6. \`POST /api/ai/compose-canvas-adjustments\`
- **Job:** Turn scene sliders + optional baseline into English **\`augmentedPrompt\`** and **\`adjustmentSummary\`** for the UI.
- **Code:** Still imported as \`composeCanvasAdjustmentsWithGemini\` but **no Gemini call**; output from \`buildPhotographicSceneEditPrompt\` / \`summarizeSceneDelta\` in \`scene-to-photographic-english.ts\` (deterministic TS).
- **UI:** \`Apply & render\` → \`composeCanvasAdjustments\`, then \`generate\` with the same \`augmentedPrompt\`.

---

### 7. \`POST /api/ai/analyze-scene-from-image\`
- **Job:** From a **rendered** image, estimate scene sliders (\`CanvasSceneAdjustments\`) for the violet track markers / current frame alignment.
- **Code:** \`inferCanvasSceneFromImageWithGemini\`.
- **UI:** \`inferSceneForImage\` after each new generate or when selecting a version missing \`inferredScene\`.

---

### Quick table
| Task | API |
|--------|-----|
| Product analysis | \`/api/ai/analyze\` |
| Expand initial prompt | \`/api/ai/expand-prompt\` |
| Build/update ad image | \`/api/ai/generate\` |
| Chat + next-render prompt | \`/api/ai/refine\` (then \`generate\`) |
| Tagline suggestions | \`/api/ai/suggest-tagline\` |
| Scene text for tools | \`/api/ai/compose-canvas-adjustments\` (then \`generate\`) |
| Scene from image | \`/api/ai/analyze-scene-from-image\` |

All \`/api/ai/*\` routes except **\`generate\`** and **\`compose-canvas-adjustments\`** call **Gemini** via \`gemini.ts\`; **\`generate\`** picks Replicate vs Google from env; **\`compose-canvas-adjustments\`** is local TypeScript only.`,
  ],
  [
    `این متن پاک بشه.`,
    `Remove this copy.`,
  ],
  [
    `آن پاراگراف از \`CanvasToolDock.tsx\` حذف شد. متن هشدار پایین (دربارهٔ prompt و عدم تضمین تطابق دقیق) هنوز هست؛ اگر آن را هم می‌خواهی برداری بگو.`,
    `Removed that paragraph from \`CanvasToolDock.tsx\`. The footer disclaimer (prompt enrichment, no exact-match guarantee) remains; say if you want that removed too.`,
  ],
  [
    `اوکی. حالا این امکان رو فراهم کن که روی تصویر کلیک میکنیم بزرگ شه و امکان دانلودش در فرمتهای مختلف فراهم باشه. همینطور امکان ارسال مستقیم به شبکه های اجتماعی+ امکان جنریت کردن کپشن برای هرکدوم.`,
    `OK—click the image to enlarge it, support downloads in multiple formats, direct share to socials, and AI-generated captions per network.`,
  ],
  [
    `در حال بررسی نحوهٔ نمایش تصویر و لایت‌باکس موجود در پروژه.

پیاده‌سازی لایت‌باکس یکپارچه با دانلود چندفرمت، اشتراک‌گذاری و API تولید کپشن.

در حال ایجاد API پروکسی برای دور زدن CORS در صورت نیاز، افزودن endpoint کپشن و کامپوننت لایت‌باکس.

در حال افزودن فایل‌ها و اتصال آن‌ها.

این‌ها اضافه و وصل شدند:
### باز کردن بزرگ (lightbox)
- کلیک روی **تصویر اصلی** (محصول، خروجی تکی، یا **جلوی استک** نسخه‌ها)، یا آیکن **Maximize** در هدر، یا **تامبنیل محصول** → مودال تمام‌صفحه با \`ImageViewerLightbox\`.
- **Escape** یا کلیک بیرون / دکمه بستن برای خروج.

### دانلود
- دکمه‌های **PNG / JPEG / WebP**؛ JPEG با پس‌زمینهٔ سفید برای شفافیت.
- اگر مرورگر به خاطر CORS به تصویر ریموت دسترسی نداشته باشد، از **\`POST /api/media/proxy-image\`** (فقط هاست‌های مجاز مثل \`replicate.delivery\` و چند هاست Google) استفاده می‌شود.

### اشتراک‌گذاری- **System share** (Web Share API؛ روی موبایل اغلب با فایل تصویر).
- لینک‌های وب: **X، Facebook، LinkedIn، Pinterest** (پنجرهٔ جدید؛ متن از کپشن ترکیبی + در صورت امکان URL تصویر).
- توضیح کوتاه در UI: **اینستاگرام و تیک‌تاک** API پست وب ندارند → باید فایل را ذخیره و از اپ منتشر شود.

### کپشن با AI (برای هر شبکه جدا)
- چیپ‌های **Instagram / Facebook / X / LinkedIn / TikTok**؛ برای هر کدام متن جدا ذخیره می‌شود.
- **Generate for …** → **\`POST /api/ai/social-caption\`** با تصویر به‌صورت data URL و **\`generateSocialCaptionWithGemini\`** (با زمینهٔ \`creativeContext\` استودیو وقتی موجود باشد).
- **Copy caption + tags** متن + هشتگ‌های پیشنهادی را یکجا کپی می‌کند.

### فایل‌های مهم- \`src/components/canvas/ImageViewerLightbox.tsx\`
- \`src/lib/media/image-export-client.ts\`
- \`src/app/api/media/proxy-image/route.ts\`
- \`src/app/api/ai/social-caption/route.ts\` + توسعه در \`src/lib/ai/gemini.ts\` و \`client.ts\`
- \`AdCanvas.tsx\` و \`studio-workspace.tsx\` برای \`captionContext\`

\`npm run build\` بدون خطا تمام شد. اگر هاست تصویرت خارج از لیست پروکسی بود، بگو تا دامنهٔ مجاز اضافه شود.`,
    `Reviewing how images render and any existing lightbox patterns.

Implemented a unified lightbox with multi-format download, sharing, and a caption API.

Added a CORS proxy when needed, the caption route, and the lightbox component.

Wiring files.

Shipped:

### Lightbox
- Click **main image** (product, single output, or **front of** version stack), **Maximize** in the header, or **product thumbnail** → fullscreen \`ImageViewerLightbox\`.
- **Escape**, outside click, or close button to dismiss.

### Download
- **PNG / JPEG / WebP**; JPEG composites on white for transparency.

### Sharing
- **System share** (Web Share API; mobile often shares the image file).
- Web links: **X, Facebook, LinkedIn, Pinterest** (new window; text from combined caption + image URL when possible).
- UI note: **Instagram and TikTok** have no real web-post API → save the file and publish from the app.

### AI captions (per network)
- Chips for **Instagram / Facebook / X / LinkedIn / TikTok** with separate stored text.
- **Generate for …** → **\`POST /api/ai/social-caption\`** with image as data URL and **\`generateSocialCaptionWithGemini\`** (uses studio \`creativeContext\` when present).
- **Copy caption + tags** copies body + suggested hashtags.

### Key files
- \`src/components/canvas/ImageViewerLightbox.tsx\`
- \`src/lib/media/image-export-client.ts\`
- \`src/app/api/media/proxy-image/route.ts\`
- \`src/app/api/ai/social-caption/route.ts\` + updates in \`src/lib/ai/gemini.ts\` and \`client.ts\`
- \`AdCanvas.tsx\` and \`studio-workspace.tsx\` for \`captionContext\`

\`npm run build\` succeeded. If your image host is outside the proxy allowlist, tell us to add the domain.`,
  ],
  [
    `لوکال سرور بیاد بالا. ریست بشه. فرانت و اند.`,
    `Bring up the local server with a full reset (front + API).`,
  ],
  [
    `در حال آزاد کردن پورت‌ها، پاک کردن کش \`.next\` و راه‌اندازی مجدد \`next dev\` (فرانت و API در یک پروسه).

انجام شد:

1. **پروسه‌هایی که روی پورت‌های ۳۰۰۰–۳۰۱۰ گوش می‌دادند** متوقف شدند.  
2. **پوشهٔ \`.next\` پاک شد** تا کش بیلد فرانت/بک‌اند Next یک‌بار از نو ساخته شود.  
3. **\`npm run dev\`** دوباره اجرا شد.

الان سرور روی **\`http://localhost:3000\`** است (\`Ready\`). در این پروژه همان یک پروسه هم **صفحات** و هم **\`/api/*\`** را سرو می‌کند؛ برای «ریست بک‌اند» جداگانه‌ای وجود ندارد مگر سرویس دیگری داشته باشی.
اگر تب مرورگر هنوز نسخهٔ قدیمی نشان می‌دهد، یک **hard refresh** بزن (Ctrl+Shift+R).`,
    `Freed ports, deleted the \`.next\` cache, and restarted \`next dev\` (pages + API in one process).

Done:

1. **Listeners on ports 3000–3010** were stopped.  
2. **\`.next\` removed** so Next rebuilds client/server bundles cleanly.  
3. **\`npm run dev\`** relaunched.

Server: **\`http://localhost:3000\`** (\`Ready\`). One process serves **pages** and **\`/api/*\`**; there is no separate “backend reset” unless you run another service.

If the browser still looks stale, **hard refresh** (Ctrl+Shift+R).`,
  ],
  [
    `قرار بود همچین اروری دیگه نیاد دیگه!
قرار شد اگه اعتبار رپلیکیت تموم شد بره روی گوگل خودش اتوماتیک! ارور نده!`,
    `We agreed this error should not surface!
If Replicate runs out of credit it should **automatically fall back to Google** with **no error** to the user!`,
  ],
  [
    `پیاده‌سازی fallback خودکار به Google هنگام خطای اعتبار Replicate (مثلاً 402).

افزودن تشخیص خطای اعتبار Replicate و fallback خودکار به Google.

الان در \`src/app/api/ai/generate/route.ts\` این رفتار اضافه شده:

1. **اول** مثل قبل با Replicate تولید می‌کند (اگر توکن باشد و \`ADSME_FORCE_GOOGLE_IMAGE\` روشن نباشد).
2. **اگر خطا «اعتبار / صورتحساب» باشد** — با هر کدام از این‌ها تشخیص داده می‌شود:
   - کد HTTP **402** روی \`ApiError.response\` (همان چیزی که SDK ریپلیکیت می‌گذارد)   - یا متن خطا شامل \`402\`, \`Payment Required\`, \`Insufficient credit\`, \`purchase credit\`, \`account/billing\`
3. **و** کلید Google (\`GOOGLE_GENERATIVE_AI_API_KEY\` / \`GOOGLE_AI_API_KEY\` / \`GEMINI_API_KEY\`) تنظیم باشد → **بدون نشان دادن خطای Replicate به کاربر** دوباره با **\`generateAdImageWithGoogleTemp\`** تولید می‌کند و همان \`{ url }\` را برمی‌گرداند.
4. اگر Replicate به خاطر **چیز دیگری** (مثلاً باگ مدل) بترکد، همان خطای قبلی برمی‌گردد.
5. اگر اعتبار Replicate تمام شده باشد ولی **کلید Google نباشد**، هنوز خطا می‌گیری (جای دیگری برای رفتن نیست).

در لاگ سرور یک **\`console.warn\`** می‌بینی که می‌گوید به Google fallback شده؛ برای کاربر UI عوض نمی‌شود مگر Google هم خطا بدهد.

برای تست، سرور dev را یک بار ریست کن و مطمئن شو \`.env.local\` حداقل یکی از کلیدهای Google را دارد.`,
    `Implemented automatic **Google fallback** when Replicate returns a billing/credit error (e.g. 402).

Detection covers credit/billing signals on the Replicate error.

In \`src/app/api/ai/generate/route.ts\`:

1. Still tries **Replicate first** when a token exists and \`ADSME_FORCE_GOOGLE_IMAGE\` is off.
2. **Billing/credit** errors match **402** on \`ApiError.response\` **or** message tokens like \`402\`, \`Payment Required\`, \`Insufficient credit\`, \`purchase credit\`, \`account/billing\`.
3. If a **Google** key (\`GOOGLE_GENERATIVE_AI_API_KEY\` / \`GOOGLE_AI_API_KEY\` / \`GEMINI_API_KEY\`) is set → **without surfacing Replicate’s error to the user**, retry with **\`generateAdImageWithGoogleTemp\`** and return the same \`{ url }\` shape.
4. Other Replicate failures still bubble normally.
5. If credit is gone **and** no Google key exists, you still get an error (nowhere else to go).

Server logs show a **\`console.warn\`** about Google fallback; the UI stays the same unless Google fails too.

Restart dev once and ensure \`.env.local\` has at least one Google key for testing.`,
  ],
  [
    `خب حالا لطفا بیا بریم روی موبایلش کار کنیم که متناسب بشه با موبایل.
ببین توی موبایل بالا تر از بقیه. زیر هدر باید باکس آپلود و بعد از اینکه آپلود انجام شد همین قاب اصلی تصویر قرار بگیره.
اون استایل ها خیلی گنده ن واسه موبایل. باید یه کار کنی که توی موبایلش جمع و جور بشن و زیر تصویر بیان. بعد از اون هم اون creative ها میاد. همه اینا جمع و جور و متناسب با صفحه موبایل. اندازه ها همه استاندارد و خوش ساخت.
بعدش هم که اون باکس پراممپت و جنریشن و اینا.
وقتی هم که هر موقع از هر جایی جنریشن دستورش داده شد تصویر سریع بره بالا روی قسمت عکس.
همه ی تغییرات جوری انجام بشه که هیچ تغییری (مطلقا تاکید میکنم هیچ تغییری) در فرمت کامپیوترش داده نشه. فقط واسه لپتاپ. اوکی؟؟؟؟
نیام ببینم باز توی لپتاپ هم تغییر کرده ها! فقط فقط این تغییرانی که گفتم برای موبایل. تاکید میشه. فقط برای موبایل!`,
    `Please tune the **mobile** layout.

On mobile, directly under the header: **upload** first; after upload, the **main image frame** should sit there. The style tiles feel huge—tighten them on mobile and place them **under** the image. Then the **creative** blocks—everything should feel balanced and standard-sized for phones. After that, prompt / generation UI.

Whenever generation starts from anywhere, **scroll/focus the image area** quickly.

**Do not change desktop at all**—I mean zero layout regressions on laptop. **Only** the mobile adjustments above.`,
  ],
  [
    `بررسی ساختار فعلی استودیو و پنل‌ها برای اعمال تغییرات فقط در موبایل (زیر \`lg\`).

پیاده‌سازی: افزودن \`variant\` به \`LeftAssetsPanel\`، چیدمان \`order\` در \`studio-workspace\`، فشرده‌سازی با \`max-lg:\` در پنل‌ها و \`AdCanvas\`، و اسکرول به ناحیهٔ تصویر هنگام شروع جنریشن.

اعمال تغییرات: ابتدا \`LeftAssetsPanel\` را با \`variant\` به‌روز می‌کنیم، سپس \`studio-workspace\`، \`AdCanvas\`، \`Scene3DSchematic\`، \`CanvasToolDock\` و \`RightAgentPanel\` را با کلاس‌های \`max-lg:\` تنظیم می‌کنیم.

خلاصهٔ کارها (همهٔ تغییرات با **\`max-lg:\`** و چیدمان جدا برای **\`lg:\`** است تا از **۱۰۲۴px به بالا** همان چیدمان قبلی دسکتاپ بماند):
### چیدمان موبایل / تبلت (\`< lg\`)
1. **زیر هدر:** فقط باکس **آپلود** (\`LeftAssetsPanel\` با \`variant="upload-only"\`).
2. **بعدش:** **کانوس تصویر** (\`AdCanvas\`) با ارتفاع و padding فشرده‌تر.
3. **بعدش:** **استایل‌ها، آنالیز، جهت‌های خلاق** (\`variant="creative-only"\`) با گرید ۳ ستونه، تایپ کوچک‌تر و \`ScrollArea\` با حداکثر ارتفاع.
4. **آخر:** **Agent** (برند، پرامپت، Generate، چت) با \`order-4\`.

### دسکتاپ (\`lg\` و بالاتر)
- همان **یک ستون چپ کامل** (\`variant="full"\` + \`hidden lg:flex\`)، **کانوس وسط**، **Agent راست** — بدون تکرار آپلود/استایل موبایل.
### فشرده‌سازی فقط موبایل
- **\`AdCanvas\`:** ارتفاع ناحیهٔ تصویر، گوشه‌ها، padding، تامبنیل.
- **\`Scene3DSchematic\` / \`CanvasToolDock\`:** ارتفاع ۳D، تک‌ستونه شدن اسلایدرها، دکمه‌ها و متن کوچک‌تر.
- **\`RightAgentPanel\`:** padding، textareaها، دکمه‌ها، ناحیهٔ چت.

### اسکرول به تصویر هنگام جنریشن
- وقتی **\`generateLoading\`** true شود و عرض **\`≤ 1023px\`** باشد، ستون کانوس با **\`scrollIntoView({ behavior: 'smooth', block: 'start' })\`** بالا می‌آید (Generate، Apply & render، چت که تصویر بسازد).

### هدر
- روی موبایل زیرعنوان **«Agentic product ad canvas»** مخفی است تا جا باز شود؛ از **\`lg\`** به بعد مثل قبل نمایش داده می‌شود.
اگر خواستی breakpoint را مثلاً فقط زیر **768px** محدود کنیم، بگو تا به **\`md\`/\`max-md\`** عوضش کنیم.`,
    `Reviewed studio structure to scope changes to **mobile only** (below \`lg\`).

Shipped: \`variant\` on \`LeftAssetsPanel\`, \`order\` tweaks in \`studio-workspace\`, \`max-lg:\` density on panels + \`AdCanvas\`, and smooth scroll to the image column when generation starts.

Summary (everything gated with **\`max-lg:\`**; **\`lg+\`** keeps the old desktop layout):

### Mobile / tablet (\`< lg\`)
1. Under header: **upload only** (\`LeftAssetsPanel\` \`variant="upload-only"\`).
2. Next: **image canvas** (\`AdCanvas\`) with tighter height/padding.
3. Then: **styles / analysis / creative directions** (\`variant="creative-only"\`) in a 3-column grid, smaller type, capped-height \`ScrollArea\`.
4. Last: **Agent** (brand, prompt, Generate, chat) \`order-4\`.

### Desktop (\`lg+\`)
- Same single left column (\`variant="full"\` + \`hidden lg:flex\`), center canvas, right agent—no duplicated mobile strips.

### Mobile-only density
- \`AdCanvas\`: image area height, radii, padding, thumbnails.
- \`Scene3DSchematic\` / \`CanvasToolDock\`: 3D height, single-column sliders, smaller buttons/copy.
- \`RightAgentPanel\`: padding, textareas, buttons, chat area.

### Scroll on generate
- When \`generateLoading\` is true and width **≤ 1023px**, canvas column \`scrollIntoView({ behavior: 'smooth', block: 'start' })\` (Generate, Apply & render, chat renders).

### Header
- Hides the **“Agentic product ad canvas”** subtitle on mobile for space; shows again from \`lg\`.

Want the breakpoint tightened to **768px** only? We can switch to \`md\`/\`max-md\`.`,
  ],
  [
    `این منوی scene tools به صورت پیشفرض وقتی صفحه میاد بالا بسته باشه. اگه روش کلیک کردن باز بشه. اون حجم سه بعدیش هم بره زیرمجموعه ی همون که وقتی بسته بود دیگه دیده نشه.`,
    `Scene tools menu should default **collapsed** on load; click header to expand. Move the **3D block inside** that panel so when collapsed nothing 3D shows.`,
  ],
  [
    `تنظیم پیش‌فرض به بسته، و قرار دادن \`Scene3DSchematic\` داخل همان پنل بازشونده.

این‌ها اعمال شد:

### ۱. پیش‌فرض بسته- \`useState(false)\` برای پنل Scene tools؛ فقط با کلیک روی هدر باز می‌شود.

### ۲. پیش‌نمایش ۳D زیرمجموعهٔ همان پنل
- \`Scene3DSchematic\` از بالای داک جدا شد و به‌صورت prop **\`scenePreview\`** به \`CanvasToolDock\` داده می‌شود.
- وقتی پنل **بسته** است، نه اسلایدرها نه بلوک ۳D رندر نمی‌شوند → WebGL/Canvas هم سوار نمی‌شود تا باز کنی.
- وقتی **باز** است، ترتیب این است: اول پیش‌نمایش ۳D، بعد اسلایدرها و دکمه‌ها و متن راهنما.

### ۳. آیکن شِورون
- حالت رایج: بسته = ▼، باز = ▲، به‌همراه \`aria-expanded\`.
فایل‌ها: \`CanvasToolDock.tsx\`, \`AdCanvas.tsx\`.`,
    `Default **collapsed**; \`Scene3DSchematic\` now lives inside the same expandable panel.

### 1. Default closed
- \`useState(false)\` on Scene tools; header toggles.

### 2. 3D inside the panel
- \`Scene3DSchematic\` moved out of the top chrome and passed as **\`scenePreview\`** into \`CanvasToolDock\`.
- **Collapsed:** neither sliders nor 3D mount → no WebGL until expanded.
- **Expanded:** 3D preview first, then sliders/buttons/help copy.

### 3. Chevron
- Collapsed ▼ / expanded ▲ with \`aria-expanded\`.

Files: \`CanvasToolDock.tsx\`, \`AdCanvas.tsx\`.`,
  ],
  [
    `گزینه دراگ اند دراپ رو هم برای لپتاپش فعال کن. عکس رو بگیری بندازی تو باکس آپلود یا اون باکس خالی وسط باز شه.`,
    `Enable **drag-and-drop** on desktop: drop onto the upload box or the empty center canvas.`,
  ],
  [
    `فعال‌کردن drag-and-drop روی باکس آپلود (دسکتاپ) و ناحیهٔ خالی کانوس.

افزودن هوک مشترک برای ناحیهٔ دراپ و اتصال آن به \`LeftAssetsPanel\` و \`AdCanvas\`.
### انجام‌شده

1. **\`src/lib/hooks/use-image-drop-zone.ts\`**  
   - شمارندهٔ عمق برای drag enter/leave (بدون چشمک زدن)  
   - \`firstImageFileFromDataTransfer\` برای گرفتن اولین فایل \`image/*\`

2. **\`LeftAssetsPanel\`** (ستون Assets و باکس موبایل)  
   - کل ناحیهٔ آپلود **drag & drop** دارد؛ هنگام کشیدن روی باکس، حاشیه/ring پررنگ می‌شود.  
   - متن راهنما: **«Drag & drop or click · PNG, JPG»**
3. **\`AdCanvas\`**  
   - prop اختیاری **\`onFileSelect\`**  
   - وقتی هنوز محصولی نیست، ناحیهٔ خالی وسط (**Drop a product shot here**) همان handlerهای دراپ را دارد و با drag فعال، پس‌زمینهٔ خط‌چین پررنگ می‌شود.

4. **\`studio-workspace\`**  
   - \`onFileSelect={onFileSelect}\` به \`AdCanvas\` پاس داده می‌شود (همان مسیر آنالیز و بقیهٔ جریان).

روی لپتاپ می‌توانی عکس را هم روی باکس چپ بیندازی هم روی قاب خالی وسط؛ هر دو همان \`onFileSelect\` استودیو را صدا می‌زنند.`,
    `Drag-and-drop enabled on the upload well (desktop) and the empty canvas.

Shared hook wired into \`LeftAssetsPanel\` + \`AdCanvas\`.

### Shipped

1. **\`src/lib/hooks/use-image-drop-zone.ts\`** — depth counter for enter/leave (no flicker) + \`firstImageFileFromDataTransfer\`.
2. **\`LeftAssetsPanel\`** — full drop target with stronger border/ring while dragging; helper text **“Drag & drop or click · PNG, JPG.”**
3. **\`AdCanvas\`** — optional \`onFileSelect\`; empty state (**Drop a product shot here**) uses the same handlers and dashed highlight on drag.
4. **\`studio-workspace\`** — passes \`onFileSelect\` into \`AdCanvas\` (same analyze pipeline).

On laptop you can drop on the left column or the empty center—both call the studio \`onFileSelect\`.`,
  ],
  [
    `لوکال هاست بیاد بالا`,
    `Bring up the local host.`,
  ],
  [
    `سرور توسعه دوباره بالا آمد.
پورت‌های ۳۰۰۰–۳۰۱۰ آزاد شد و **\`npm run dev\`** اجرا شد. الان آدرس:

**http://localhost:3000**

است (\`Ready in 2.4s\`). برای استودیو برو به **http://localhost:3000/studio**.`,
    `Dev server restarted.
Ports 3000–3010 cleared and **\`npm run dev\`** is running:

**http://localhost:3000**

(\`Ready in 2.4s\`). Studio: **http://localhost:3000/studio**.`,
  ],
];
