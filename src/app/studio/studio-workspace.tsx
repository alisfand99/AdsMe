"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

import { AdCanvas } from "@/components/canvas/AdCanvas";
import { LeftAssetsPanel } from "@/components/sidebar/LeftAssetsPanel";
import { RightAgentPanel } from "@/components/sidebar/RightAgentPanel";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_AD_VISUAL_STYLE_ID,
  getAdVisualStyle,
} from "@/lib/ad/ad-visual-styles";
import { buildAdCreativeContext } from "@/lib/ad/creative-context";
import {
  DEFAULT_TYPOGRAPHY_STYLE_ID,
  getAdTypographyStyle,
} from "@/lib/ad/typography-styles";
import {
  analyzeProductImage,
  analyzeSceneFromImage,
  composeCanvasAdjustments,
  expandCreativePrompt,
  generateAdImage,
  refineFromChatHistory,
  suggestAdvertisingTaglines,
  toImageDataUrl,
} from "@/lib/ai";
import {
  DEFAULT_CANVAS_ADJUSTMENTS,
} from "@/lib/canvas/canvas-adjustments";
import type { ChatTurn, IterationVersion, ProductAnalysis } from "@/lib/ai/types";
import { PRODUCT_SOURCE_VERSION_ID } from "@/lib/studio/constants";

export function StudioWorkspace() {
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(null);
  /** Base64 data URL for API routes (blob: preview URLs cannot be sent to the server). */
  const [productDataUrl, setProductDataUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(
    null
  );
  const [prompt, setPrompt] = useState("make it look luxury");
  const [expandLoading, setExpandLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [iterationVersions, setIterationVersions] = useState<IterationVersion[]>(
    []
  );
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  /**
   * Sole text spec for the render chain after the first image: first Generate prompt,
   * then scene-tool merges and chat merges. Scene tools + chat MUST use this — not the
   * creative brief textarea (except for the very first Generate).
   */
  const [iterationRenderPrompt, setIterationRenderPrompt] = useState<string | null>(
    null
  );
  /** Last prompt string sent to POST /api/ai/generate (debug). */
  const [imageApiDebug, setImageApiDebug] = useState<{
    prompt: string;
    source: string;
    at: number;
  } | null>(null);
  const [imageApiDebugOpen, setImageApiDebugOpen] = useState(true);
  const [selectedAdStyleId, setSelectedAdStyleId] = useState(
    DEFAULT_AD_VISUAL_STYLE_ID
  );
  const [brandName, setBrandName] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [typographyStyleId, setTypographyStyleId] = useState(
    DEFAULT_TYPOGRAPHY_STYLE_ID
  );
  const [taglineSuggestions, setTaglineSuggestions] = useState<string[] | null>(
    null
  );
  const [suggestTaglinesLoading, setSuggestTaglinesLoading] = useState(false);
  const [canvasAdjustments, setCanvasAdjustments] = useState(
    DEFAULT_CANVAS_ADJUSTMENTS
  );
  const [canvasApplyLoading, setCanvasApplyLoading] = useState(false);
  const activeVersionIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeVersionIdRef.current = activeVersionId;
  }, [activeVersionId]);

  const inferSceneForImage = useCallback(
    async (versionId: string, imageUrl: string) => {
      try {
        const dataUrl = await toImageDataUrl(imageUrl);
        const { adjustments } = await analyzeSceneFromImage({
          imageDataUrl: dataUrl,
        });
        setIterationVersions((prev) =>
          prev.map((v) =>
            v.id === versionId ? { ...v, inferredScene: adjustments } : v
          )
        );
        if (activeVersionIdRef.current === versionId) {
          setCanvasAdjustments(adjustments);
        }
      } catch (err) {
        console.error("Scene inference failed", err);
      }
    },
    []
  );

  const selectedDirectionTitle = useMemo(() => {
    if (!analysis || !selectedDirectionId) return null;
    return (
      analysis.suggestedDirections.find((d) => d.id === selectedDirectionId)
        ?.title ?? null
    );
  }, [analysis, selectedDirectionId]);

  const creativeContext = useMemo(() => {
    const visual = getAdVisualStyle(selectedAdStyleId);
    const typo = getAdTypographyStyle(typographyStyleId);
    if (!visual || !typo) return undefined;
    return buildAdCreativeContext({
      visualStyle: visual,
      typography: typo,
      brandName,
      brandTagline,
      selectedCreativeDirection: selectedDirectionTitle,
      analysis,
    });
  }, [
    selectedAdStyleId,
    typographyStyleId,
    brandName,
    brandTagline,
    selectedDirectionTitle,
    analysis,
  ]);

  const onSuggestTaglines = useCallback(async () => {
    if (!analysis) return;
    setSuggestTaglinesLoading(true);
    setTaglineSuggestions(null);
    try {
      const productSummary = `Category: ${analysis.category}. Colors: ${analysis.dominantColors.join(", ")}. Materials / finish: ${analysis.materialGuess}.`;
      const res = await suggestAdvertisingTaglines({
        productSummary,
        brandName: brandName.trim() || undefined,
        imageDataUrl: productDataUrl ?? undefined,
      });
      setTaglineSuggestions(res.taglines.length ? res.taglines : null);
    } catch (e) {
      console.error(e);
      setTaglineSuggestions(null);
    } finally {
      setSuggestTaglinesLoading(false);
    }
  }, [analysis, brandName, productDataUrl]);

  const onFileSelect = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setProductPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setAnalysis(null);
    setSelectedDirectionId(null);
    setGeneratedImageUrl(null);
    setProductDataUrl(null);
    setGenerateError(null);
    setChat([]);
    setIterationVersions([]);
    setActiveVersionId(null);
    setIterationRenderPrompt(null);
    setImageApiDebug(null);
    setCanvasAdjustments({ ...DEFAULT_CANVAS_ADJUSTMENTS });
    setAnalysisLoading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setProductDataUrl(dataUrl);
      const result = await analyzeProductImage(dataUrl);
      setAnalysis(result);
      if (result.suggestedDirections[0]) {
        setSelectedDirectionId(result.suggestedDirections[0].id);
      }
      setActiveVersionId(PRODUCT_SOURCE_VERSION_ID);
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const onExpand = useCallback(async () => {
    setExpandLoading(true);
    setGenerateError(null);
    try {
      const out = await expandCreativePrompt(prompt, creativeContext);
      setPrompt(out.expandedPrompt);
    } finally {
      setExpandLoading(false);
    }
  }, [prompt, creativeContext]);

  const onGenerate = useCallback(async () => {
    const p = prompt.trim();
    if (!productDataUrl || !p) return;
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      setImageApiDebug({
        prompt: p,
        source: "Generate — creative brief → first image",
        at: Date.now(),
      });
      const result = await generateAdImage(productDataUrl, p);
      setGeneratedImageUrl(result.url);
      setIterationRenderPrompt(p);
      const vid = crypto.randomUUID();
      setIterationVersions((prev) => [
        ...prev,
        {
          id: vid,
          label: prev.length === 0 ? "Initial" : "Generate",
          imageUrl: result.url,
          promptUsed: p,
          createdAt: Date.now(),
        },
      ]);
      setActiveVersionId(vid);
      void inferSceneForImage(vid, result.url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Generation failed";
      setGenerateError(message);
      console.error("Generation failed", error);
    } finally {
      setGenerateLoading(false);
    }
  }, [productDataUrl, prompt, inferSceneForImage]);

  const canUseCanvasTools = iterationVersions.length > 0;

  const onApplyCanvasRender = useCallback(async () => {
    if (!iterationRenderPrompt?.trim() || iterationVersions.length === 0) return;
    setCanvasApplyLoading(true);
    setGenerateError(null);
    try {
      const baseVersion =
        iterationVersions[iterationVersions.length - 1] ?? null;
      /** Scene compose is delta-only; reference image + sliders — do not merge long brief. */
      const { augmentedPrompt } = await composeCanvasAdjustments({
        currentImagePrompt: "",
        adjustments: canvasAdjustments,
        baselineScene: baseVersion?.inferredScene ?? null,
        creativeContext,
      });
      const latestBuilt = baseVersion?.imageUrl;
      const dataUrl = await toImageDataUrl(latestBuilt);
      setGenerateLoading(true);
      setImageApiDebug({
        prompt: augmentedPrompt,
        source: "Apply & render — scene tools + iteration prompt",
        at: Date.now(),
      });
      const gen = await generateAdImage(dataUrl, augmentedPrompt);
      const vid = crypto.randomUUID();
      setIterationVersions((prev) => [
        ...prev,
        {
          id: vid,
          label: "Scene tools",
          imageUrl: gen.url,
          promptUsed: augmentedPrompt,
          createdAt: Date.now(),
        },
      ]);
      setActiveVersionId(vid);
      setGeneratedImageUrl(gen.url);
      setIterationRenderPrompt(augmentedPrompt);
      void inferSceneForImage(vid, gen.url);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Scene render failed";
      setGenerateError(msg);
      console.error(e);
    } finally {
      setCanvasApplyLoading(false);
      setGenerateLoading(false);
    }
  }, [iterationRenderPrompt, iterationVersions, canvasAdjustments, creativeContext, inferSceneForImage]);

  const onSelectIterationVersion = useCallback(
    (id: string) => {
      if (id === PRODUCT_SOURCE_VERSION_ID) {
        setActiveVersionId(PRODUCT_SOURCE_VERSION_ID);
        setGeneratedImageUrl(null);
        setCanvasAdjustments({ ...DEFAULT_CANVAS_ADJUSTMENTS });
        return;
      }
      const v = iterationVersions.find((x) => x.id === id);
      if (!v) return;
      setActiveVersionId(id);
      setGeneratedImageUrl(v.imageUrl);
      setIterationRenderPrompt(v.promptUsed);
      if (v.inferredScene) {
        setCanvasAdjustments({ ...v.inferredScene });
      } else {
        setCanvasAdjustments({ ...DEFAULT_CANVAS_ADJUSTMENTS });
        void inferSceneForImage(v.id, v.imageUrl);
      }
    },
    [iterationVersions, inferSceneForImage]
  );

  /** Iteration chat: needs a generated version + chain prompt (not the brief alone). */
  const canIterate = Boolean(
    productDataUrl &&
      iterationVersions.length > 0 &&
      iterationRenderPrompt?.trim()
  );

  const onSendChat = useCallback(
    async (message: string) => {
      if (!canIterate) return;
      const userTurn: ChatTurn = {
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      const historyAfterUser: ChatTurn[] = [...chat, userTurn];
      setChat(historyAfterUser);
      setChatLoading(true);
      setGenerateError(null);
      try {
        const chain = iterationRenderPrompt?.trim();
        if (!chain || !productDataUrl) return;
        const result = await refineFromChatHistory(historyAfterUser, message, {
          currentImagePrompt: chain,
          creativeContext,
        });

        const assistantTurn: ChatTurn = {
          role: "assistant",
          content: result.reply,
          timestamp: Date.now(),
        };
        setChat((c) => [...c, assistantTurn]);

        const latestBuilt =
          iterationVersions.length > 0
            ? iterationVersions[iterationVersions.length - 1]?.imageUrl
            : null;
        const refSrc =
          latestBuilt ?? generatedImageUrl ?? productDataUrl;
        const dataUrl = await toImageDataUrl(refSrc);

        setGenerateLoading(true);
        try {
          setImageApiDebug({
            prompt: result.imagePrompt,
            source: "Chat iteration — refine + image",
            at: Date.now(),
          });
          const gen = await generateAdImage(dataUrl, result.imagePrompt);
          const vid = crypto.randomUUID();
          const label =
            message.length > 28
              ? `${message.slice(0, 25)}…`
              : message || "Iteration";
          setIterationVersions((prev) => [
            ...prev,
            {
              id: vid,
              label,
              imageUrl: gen.url,
              promptUsed: result.imagePrompt,
              createdAt: Date.now(),
            },
          ]);
          setActiveVersionId(vid);
          setGeneratedImageUrl(gen.url);
          setIterationRenderPrompt(result.imagePrompt);
          void inferSceneForImage(vid, gen.url);
        } catch (genErr) {
          const msg =
            genErr instanceof Error ? genErr.message : "Image render failed";
          setGenerateError(msg);
        } finally {
          setGenerateLoading(false);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Iteration failed";
        setGenerateError(msg);
      } finally {
        setChatLoading(false);
      }
    },
    [
      canIterate,
      chat,
      productDataUrl,
      iterationRenderPrompt,
      iterationVersions,
      generatedImageUrl,
      creativeContext,
      inferSceneForImage,
    ]
  );

  const sceneBaselineForTools = useMemo(() => {
    if (activeVersionId === PRODUCT_SOURCE_VERSION_ID) return null;
    const v = iterationVersions.find((x) => x.id === activeVersionId);
    return v?.inferredScene ?? null;
  }, [activeVersionId, iterationVersions]);

  const canvasColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!generateLoading) return;
    const w = typeof window !== "undefined" ? window : null;
    if (!w || !w.matchMedia("(max-width: 1023px)").matches) return;
    const id = w.requestAnimationFrame(() => {
      canvasColumnRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => w.cancelAnimationFrame(id);
  }, [generateLoading]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <div className="hidden h-4 w-px bg-white/15 sm:block" />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight max-lg:text-[13px]">
              AdsMe Studio
            </h1>
            <p className="text-[11px] text-muted-foreground max-lg:hidden">
              Agentic product ad canvas
            </p>
          </div>
        </div>
        <BadgePill />
      </header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className={`flex min-h-0 min-h-[calc(100vh-3.5rem)] flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-3 sm:gap-4 sm:p-4 lg:flex-row max-lg:gap-2 max-lg:p-2 ${
          imageApiDebug && imageApiDebugOpen
            ? "pb-[min(38vh,380px)] max-lg:pb-[min(32vh,300px)]"
            : ""
        }`}
      >
        <LeftAssetsPanel
          variant="upload-only"
          onFileSelect={onFileSelect}
          analysis={analysis}
          analysisLoading={analysisLoading}
          selectedAdStyleId={selectedAdStyleId}
          onSelectAdStyle={setSelectedAdStyleId}
          selectedDirectionId={selectedDirectionId}
          onSelectDirection={setSelectedDirectionId}
          className="order-1 lg:hidden"
        />
        <LeftAssetsPanel
          variant="full"
          onFileSelect={onFileSelect}
          analysis={analysis}
          analysisLoading={analysisLoading}
          selectedAdStyleId={selectedAdStyleId}
          onSelectAdStyle={setSelectedAdStyleId}
          selectedDirectionId={selectedDirectionId}
          onSelectDirection={setSelectedDirectionId}
          className="hidden lg:order-none lg:flex lg:w-[280px] lg:shrink-0"
        />
        <div
          ref={canvasColumnRef}
          className="order-2 flex min-h-0 flex-1 flex-col max-lg:min-h-0 lg:sticky lg:top-3 lg:z-20 lg:max-h-none lg:min-h-[min(480px,70dvh)] lg:self-start lg:overflow-visible"
        >
          <AdCanvas
            productPreviewUrl={productPreviewUrl}
            generatedImageUrl={generatedImageUrl}
            iterationVersions={iterationVersions}
            activeVersionId={activeVersionId}
            onSelectIterationVersion={onSelectIterationVersion}
            isAnalyzing={analysisLoading}
            isGenerating={generateLoading}
            selectedDirectionTitle={selectedDirectionTitle}
            productSourceVersionId={PRODUCT_SOURCE_VERSION_ID}
            canvasAdjustments={canvasAdjustments}
            onCanvasAdjustmentsChange={setCanvasAdjustments}
            onApplyCanvasRender={onApplyCanvasRender}
            canvasApplyLoading={canvasApplyLoading}
            canUseCanvasTools={canUseCanvasTools}
            sceneBaselineFromImage={sceneBaselineForTools}
            captionContext={
              creativeContext
                ? { creativeContext }
                : undefined
            }
            className="min-h-0 flex-1 max-lg:min-h-[280px]"
          />
        </div>
        <LeftAssetsPanel
          variant="creative-only"
          onFileSelect={onFileSelect}
          analysis={analysis}
          analysisLoading={analysisLoading}
          selectedAdStyleId={selectedAdStyleId}
          onSelectAdStyle={setSelectedAdStyleId}
          selectedDirectionId={selectedDirectionId}
          onSelectDirection={setSelectedDirectionId}
          className="order-3 lg:hidden"
        />
        <RightAgentPanel
          brandName={brandName}
          brandTagline={brandTagline}
          typographyStyleId={typographyStyleId}
          onBrandNameChange={setBrandName}
          onBrandTaglineChange={setBrandTagline}
          onTypographyStyleChange={setTypographyStyleId}
          onSuggestTaglines={onSuggestTaglines}
          suggestTaglinesLoading={suggestTaglinesLoading}
          canSuggestTaglines={Boolean(analysis)}
          taglineSuggestions={taglineSuggestions}
          onPickTaglineSuggestion={(line) => {
            setBrandTagline(line);
            setTaglineSuggestions(null);
          }}
          prompt={prompt}
          onPromptChange={setPrompt}
          onExpand={onExpand}
          expandLoading={expandLoading}
          onGenerate={onGenerate}
          generateLoading={generateLoading}
          canGenerate={Boolean(productDataUrl && prompt.trim())}
          generateError={generateError}
          productPreviewUrl={productPreviewUrl}
          productSourceVersionId={PRODUCT_SOURCE_VERSION_ID}
          iterationVersions={iterationVersions}
          activeIterationId={activeVersionId}
          onSelectIterationVersion={onSelectIterationVersion}
          canIterate={canIterate}
          chat={chat}
          onSendChat={onSendChat}
          chatLoading={chatLoading}
          className="order-4 lg:order-none"
        />
      </motion.main>

      {imageApiDebug ? (
        <div className="fixed inset-x-0 bottom-0 z-[400] border-t border-violet-500/25 bg-zinc-950/95 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setImageApiDebugOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] font-medium text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
          >
            <span className="truncate">
              Last image API prompt{" "}
              <span className="font-normal text-violet-300/90">
                ({imageApiDebug.source})
              </span>
            </span>
            {imageApiDebugOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
            ) : (
              <ChevronUp className="h-4 w-4 shrink-0 opacity-70" />
            )}
          </button>
          {imageApiDebugOpen ? (
            <div className="max-h-[min(42vh,420px)] overflow-auto border-t border-white/10 px-3 pb-4 pt-2">
              <p className="text-[10px] text-muted-foreground">
                Exact string sent to{" "}
                <code className="rounded bg-white/10 px-1">/api/ai/generate</code>{" "}
                as <code className="rounded bg-white/10 px-1">prompt</code> ·{" "}
                {new Date(imageApiDebug.at).toLocaleString()}
              </p>
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/40 p-2 font-mono text-[10px] leading-relaxed text-foreground/90">
                {imageApiDebug.prompt}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function BadgePill() {
  return (
    <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-md sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-widest max-lg:max-w-[9rem] max-lg:truncate lg:max-w-none">
      Beta · Gemini + Replicate image
    </div>
  );
}
