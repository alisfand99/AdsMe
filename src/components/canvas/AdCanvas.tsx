/* eslint-disable @next/next/no-img-element -- blob + data / remote URLs */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Maximize2,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { CanvasToolDock } from "@/components/canvas/CanvasToolDock";
import {
  ImageViewerLightbox,
  type ImageViewerCaptionContext,
} from "@/components/canvas/ImageViewerLightbox";
import type { CanvasSceneAdjustments } from "@/lib/canvas/canvas-adjustments";
import type { IterationVersion } from "@/lib/ai/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Scene3DSchematic = dynamic(
  () =>
    import("@/components/canvas/Scene3DSchematic").then((m) => ({
      default: m.Scene3DSchematic,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[200px] w-full items-center justify-center border-b border-white/10 bg-[#08080a] text-[10px] text-muted-foreground">
        Loading 3D preview…
      </div>
    ),
  }
);

type AdCanvasProps = {
  productPreviewUrl: string | null;
  generatedImageUrl: string | null;
  iterationVersions: IterationVersion[];
  activeVersionId: string | null;
  onSelectIterationVersion: (id: string) => void;
  productSourceVersionId: string;
  isAnalyzing: boolean;
  isGenerating: boolean;
  selectedDirectionTitle?: string | null;
  canvasAdjustments: CanvasSceneAdjustments;
  onCanvasAdjustmentsChange: (a: CanvasSceneAdjustments) => void;
  onApplyCanvasRender: () => void;
  canvasApplyLoading: boolean;
  canUseCanvasTools: boolean;
  /** Vision-estimated scene for the active frame — faded markers on sliders (not live preview on the photo). */
  sceneBaselineFromImage?: CanvasSceneAdjustments | null;
  /** Passed to AI caption generator in the image viewer */
  captionContext?: ImageViewerCaptionContext;
  className?: string;
};

export function AdCanvas({
  productPreviewUrl,
  generatedImageUrl,
  iterationVersions,
  activeVersionId,
  onSelectIterationVersion,
  productSourceVersionId,
  isAnalyzing,
  isGenerating,
  selectedDirectionTitle,
  canvasAdjustments,
  onCanvasAdjustmentsChange,
  onApplyCanvasRender,
  canvasApplyLoading,
  canUseCanvasTools,
  sceneBaselineFromImage = null,
  captionContext,
  className,
}: AdCanvasProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const hasProduct = Boolean(productPreviewUrl);
  const isViewingProduct =
    hasProduct && activeVersionId === productSourceVersionId;

  const genActiveIndex = useMemo(() => {
    if (!activeVersionId || activeVersionId === productSourceVersionId)
      return -1;
    const idx = iterationVersions.findIndex((v) => v.id === activeVersionId);
    return idx;
  }, [iterationVersions, activeVersionId, productSourceVersionId]);

  const showVersionStack =
    iterationVersions.length > 0 && !isViewingProduct && genActiveIndex >= 0;

  const visibleVersions = showVersionStack
    ? iterationVersions.slice(0, genActiveIndex + 1)
    : [];

  const displayUrl =
    !showVersionStack && !isViewingProduct && (generatedImageUrl ?? productPreviewUrl)
      ? (generatedImageUrl ?? productPreviewUrl)
      : null;

  const displayKey = generatedImageUrl ? "generated" : "source";

  const activeImageUrl = useMemo((): string | null => {
    if (isViewingProduct && productPreviewUrl) return productPreviewUrl;
    if (showVersionStack && genActiveIndex >= 0) {
      const v = iterationVersions[genActiveIndex];
      return v?.imageUrl ?? null;
    }
    return displayUrl;
  }, [
    isViewingProduct,
    productPreviewUrl,
    showVersionStack,
    genActiveIndex,
    iterationVersions,
    displayUrl,
  ]);

  const totalSlots = hasProduct
    ? 1 + iterationVersions.length
    : iterationVersions.length;

  const currentSlot = useMemo(() => {
    if (isViewingProduct) return 0;
    if (genActiveIndex >= 0) return hasProduct ? 1 + genActiveIndex : genActiveIndex;
    if (iterationVersions.length === 0) return 0;
    return hasProduct ? iterationVersions.length : iterationVersions.length - 1;
  }, [
    isViewingProduct,
    genActiveIndex,
    hasProduct,
    iterationVersions.length,
  ]);

  const selectSlot = (slot: number) => {
    if (slot < 0 || slot >= totalSlots) return;
    if (hasProduct) {
      if (slot === 0) {
        onSelectIterationVersion(productSourceVersionId);
        return;
      }
      const g = iterationVersions[slot - 1];
      if (g) onSelectIterationVersion(g.id);
      return;
    }
    const g = iterationVersions[slot];
    if (g) onSelectIterationVersion(g.id);
  };

  const canGoOlder = totalSlots > 1 && currentSlot > 0;
  const canGoNewer = totalSlots > 1 && currentSlot < totalSlots - 1;

  const goOlder = () => selectSlot(currentSlot - 1);
  const goNewer = () => selectSlot(currentSlot + 1);

  const versionBadge =
    totalSlots > 0
      ? isViewingProduct
        ? `1 / ${totalSlots} · Product`
        : `${currentSlot + 1} / ${totalSlots}`
      : null;

  const previewWrapClass = "flex h-full w-full items-center justify-center overflow-hidden p-3 sm:p-4";

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 shadow-inner",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(39 39 42 / 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(39 39 42 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Badge variant="outline" className="shrink-0 font-mono text-[10px] uppercase tracking-wider">
            Canvas
          </Badge>
          {selectedDirectionTitle ? (
            <span className="hidden min-w-0 truncate text-xs text-muted-foreground sm:inline">
              {selectedDirectionTitle}
            </span>
          ) : null}
          {versionBadge ? (
            <Badge variant="muted" className="shrink-0 text-[10px] font-normal">
              {versionBadge}
            </Badge>
          ) : generatedImageUrl ? (
            <Badge variant="muted" className="shrink-0 text-[10px] font-normal">
              Live output
            </Badge>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {productPreviewUrl ? (
            <button
              type="button"
              onClick={() => setLightboxUrl(productPreviewUrl)}
              className="rounded-md border border-white/15 bg-black/40 p-0.5 shadow-sm transition hover:border-primary/45"
              aria-label="Enlarge product reference"
            >
              <img
                src={productPreviewUrl}
                alt=""
                className="h-9 w-9 rounded object-cover sm:h-10 sm:w-10"
              />
            </button>
          ) : null}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={!activeImageUrl}
            aria-label="Enlarge current image"
            onClick={() => {
              if (activeImageUrl) setLightboxUrl(activeImageUrl);
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-visible">
        <div className="relative mx-auto flex w-full max-w-lg flex-col px-3 pt-3 sm:px-4 sm:pt-4 pb-4">
          <div className="relative w-full shrink-0" style={{ perspective: "1200px" }}>
            <div
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-sm",
                isAnalyzing && "ring-2 ring-primary/40"
              )}
            >
              <div className="relative min-h-[240px] h-[min(52dvh,480px)] w-full shrink-0">
                <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 blur-2xl" />
                <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
                  <div className="relative min-h-0 flex-1">
                {isViewingProduct && productPreviewUrl ? (
                  <button
                    type="button"
                    className={cn(previewWrapClass, "cursor-zoom-in")}
                    onClick={() => setLightboxUrl(productPreviewUrl)}
                    aria-label="Enlarge product image"
                  >
                    <motion.img
                      key="product-main"
                      src={productPreviewUrl}
                      alt="Product"
                      className="max-h-full max-w-full object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35 }}
                    />
                  </button>
                ) : showVersionStack ? (
                  <div className="relative flex h-full min-h-[240px] w-full items-center justify-center">
                    {visibleVersions.map((v, i) => {
                      const depth = genActiveIndex - i;
                      const isFront = depth === 0;
                      return (
                        <motion.div
                          key={v.id}
                          className="absolute inset-0 flex items-center justify-center px-3 sm:px-4"
                          style={{
                            zIndex: 10 + i,
                            transformStyle: "preserve-3d",
                          }}
                          initial={false}
                          animate={{
                            scale: 1 - depth * 0.052,
                            y: depth * 16,
                            x: depth * -14,
                            rotateY: depth * -2,
                            opacity: Math.max(0.42, 1 - depth * 0.065),
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 30,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (!isFront) onSelectIterationVersion(v.id);
                              else setLightboxUrl(v.imageUrl);
                            }}
                            className={cn(
                              "relative max-h-full max-w-full outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-primary/50",
                              isFront
                                ? "cursor-zoom-in"
                                : "cursor-pointer rounded-xl hover:ring-2 hover:ring-white/20"
                            )}
                            aria-label={
                              isFront
                                ? `Current version ${i + 1}`
                                : `View version ${i + 1}`
                            }
                            aria-current={isFront ? "true" : undefined}
                          >
                            <div className="relative max-h-[min(58vh,560px)] max-w-full">
                              <img
                                src={v.imageUrl}
                                alt=""
                                className={cn(
                                  "max-h-[min(58vh,560px)] max-w-full rounded-xl border object-contain shadow-xl",
                                  isFront
                                    ? "border-white/15"
                                    : "border-white/10"
                                )}
                                draggable={false}
                              />
                            </div>
                            {!isFront ? (
                              <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/90">
                                v{i + 1}
                              </span>
                            ) : null}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : displayUrl ? (
                  <button
                    type="button"
                    className={cn(previewWrapClass, "cursor-zoom-in")}
                    onClick={() => setLightboxUrl(displayUrl)}
                    aria-label="Enlarge image"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={displayKey}
                        className="flex max-h-full max-w-full items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <img
                          src={displayUrl}
                          alt={generatedImageUrl ? "Generated ad" : "Product preview"}
                          className="max-h-full max-w-full object-contain"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </button>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-muted-foreground">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5">
                      <ImageIcon className="h-8 w-8 opacity-50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/80">
                        Drop a product shot
                      </p>
                      <p className="mt-1 text-xs">
                        Upload on the left — the agent will analyze and suggest directions.
                      </p>
                    </div>
                  </div>
                )}

                {isAnalyzing ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
                      <span className="text-xs font-medium text-primary">
                        Analyzing product…
                      </span>
                    </div>
                  </div>
                ) : null}

                {totalSlots > 1 ? (
                  <div className="pointer-events-auto absolute bottom-3 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-zinc-950/90 px-1 py-1 shadow-lg backdrop-blur-md">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 rounded-full px-2.5 text-[11px]"
                      disabled={!canGoOlder}
                      onClick={goOlder}
                      aria-label="Older version"
                    >
                      <ChevronLeft className="h-4 w-4 shrink-0" />
                      Older
                    </Button>
                    <div className="h-5 w-px bg-white/15" />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 rounded-full px-2.5 text-[11px]"
                      disabled={!canGoNewer}
                      onClick={goNewer}
                      aria-label="Newer version"
                    >
                      Newer
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </Button>
                  </div>
                ) : null}

                <AnimatePresence>
                  {isGenerating ? (
                    <motion.div
                      key="gen-overlay"
                      className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-zinc-950/75 px-6 text-center backdrop-blur-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="relative h-14 w-14">
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-primary/30"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Rendering…
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          New version appears in front when ready.
                        </p>
                      </div>
                      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted/30">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent shimmer-bg" />
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-zinc-950/90">
                <Scene3DSchematic
                  adjustments={canvasAdjustments}
                  onChange={onCanvasAdjustmentsChange}
                  interactive={canUseCanvasTools}
                />
                <CanvasToolDock
                  adjustments={canvasAdjustments}
                  baselineScene={sceneBaselineFromImage}
                  onChange={onCanvasAdjustmentsChange}
                  onApplyRender={onApplyCanvasRender}
                  applyDisabled={!canUseCanvasTools}
                  applyLoading={canvasApplyLoading || isGenerating}
                  className="border-t-0 bg-zinc-950/95"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxUrl ? (
        <ImageViewerLightbox
          key={lightboxUrl}
          imageUrl={lightboxUrl}
          onClose={() => setLightboxUrl(null)}
          captionContext={captionContext}
        />
      ) : null}
    </div>
  );
}
