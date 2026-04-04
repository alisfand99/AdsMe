/* eslint-disable @next/next/no-img-element -- blob + Replicate URLs */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Maximize2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdCanvasProps = {
  productPreviewUrl: string | null;
  generatedImageUrl: string | null;
  isAnalyzing: boolean;
  isGenerating: boolean;
  selectedDirectionTitle?: string | null;
  className?: string;
};

export function AdCanvas({
  productPreviewUrl,
  generatedImageUrl,
  isAnalyzing,
  isGenerating,
  selectedDirectionTitle,
  className,
}: AdCanvasProps) {
  const displayUrl = generatedImageUrl ?? productPreviewUrl;
  const displayKey = generatedImageUrl ? "generated" : "source";

  return (
    <div
      className={cn(
        "relative flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 shadow-inner lg:min-h-0",
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
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
            Canvas
          </Badge>
          {selectedDirectionTitle ? (
            <span className="max-w-[200px] truncate text-xs text-muted-foreground">
              {selectedDirectionTitle}
            </span>
          ) : null}
          {generatedImageUrl ? (
            <Badge variant="muted" className="text-[10px] font-normal">
              Live output
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Fit view"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="relative flex aspect-[4/5] w-full max-w-lg items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 blur-2xl" />
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-sm",
              isAnalyzing && "ring-2 ring-primary/40"
            )}
          >
            {displayUrl ? (
              <div className="relative flex h-full w-full items-center justify-center p-4">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={displayKey}
                    src={displayUrl}
                    alt={generatedImageUrl ? "Generated ad" : "Product preview"}
                    className="max-h-full max-w-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-8 text-center text-muted-foreground">
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

            <AnimatePresence>
              {isGenerating ? (
                <motion.div
                  key="gen-overlay"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/75 px-6 text-center backdrop-blur-md"
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
                      Generating with Replicate
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Flux — this can take up to a minute.
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
    </div>
  );
}
