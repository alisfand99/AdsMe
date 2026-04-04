"use client";

import { motion } from "framer-motion";
import { Upload, Wand2 } from "lucide-react";

import { AD_VISUAL_STYLES } from "@/lib/ad/ad-visual-styles";
import type { CreativeDirection, ProductAnalysis } from "@/lib/ai/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type LeftAssetsPanelVariant = "full" | "upload-only" | "creative-only";

type LeftAssetsPanelProps = {
  onFileSelect: (file: File) => void;
  analysis: ProductAnalysis | null;
  analysisLoading: boolean;
  selectedAdStyleId: string;
  onSelectAdStyle: (id: string) => void;
  selectedDirectionId: string | null;
  onSelectDirection: (id: string) => void;
  className?: string;
  /** Desktop uses `full`. Mobile layout uses `upload-only` then `creative-only` below the canvas. */
  variant?: LeftAssetsPanelVariant;
};

export function LeftAssetsPanel({
  onFileSelect,
  analysis,
  analysisLoading,
  selectedAdStyleId,
  onSelectAdStyle,
  selectedDirectionId,
  onSelectDirection,
  className,
  variant = "full",
}: LeftAssetsPanelProps) {
  const uploadBlock = (
    <label className="block">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
          e.target.value = "";
        }}
      />
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 bg-white/[0.03] px-3 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/5 max-lg:gap-1 max-lg:py-5 max-lg:px-3"
      >
        <Upload className="h-6 w-6 text-muted-foreground max-lg:h-5 max-lg:w-5" />
        <span className="text-sm font-medium max-lg:text-xs">
          Upload product image
        </span>
        <span className="text-xs text-muted-foreground max-lg:text-[10px] max-lg:leading-tight">
          PNG, JPG — Gemini vision on the server
        </span>
      </motion.div>
    </label>
  );

  const creativeBody = (
    <>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground max-lg:mb-1.5 max-lg:text-[10px]">
          Ad visual style
        </h3>
        <p className="mb-2 text-[11px] leading-snug text-muted-foreground max-lg:mb-1.5 max-lg:text-[10px] max-lg:line-clamp-2 lg:line-clamp-none">
          Each tile shows the kind of campaign look we optimize for.
        </p>
        <div className="grid grid-cols-2 gap-2 max-lg:grid-cols-3 max-lg:gap-1.5">
          {AD_VISUAL_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectAdStyle(s.id)}
              className={cn(
                "overflow-hidden rounded-lg border text-left transition-colors",
                selectedAdStyleId === s.id
                  ? "border-primary/70 bg-primary/10 ring-1 ring-primary/35"
                  : "border-white/10 bg-black/20 hover:border-white/25"
              )}
            >
              <div className="relative aspect-[4/5] w-full bg-zinc-900 max-lg:aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static mood SVGs */}
                <img
                  src={s.imageSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-2 max-lg:p-1.5">
                <p className="text-[11px] font-medium leading-tight text-foreground max-lg:text-[9px] max-lg:leading-tight">
                  {s.name}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground max-lg:mt-0 max-lg:line-clamp-1 max-lg:text-[8px]">
                  {s.blurb}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div>
        <div className="mb-2 flex items-center justify-between max-lg:mb-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground max-lg:text-[10px]">
            Analysis
          </h3>
          {analysisLoading ? (
            <Badge variant="muted" className="text-[10px] max-lg:text-[9px]">
              Running…
            </Badge>
          ) : null}
        </div>
        {analysisLoading ? (
          <div className="space-y-2 max-lg:space-y-1.5">
            <Skeleton className="h-4 w-full max-lg:h-3" />
            <Skeleton className="h-4 w-3/4 max-lg:h-3" />
            <Skeleton className="h-16 w-full max-lg:h-12" />
          </div>
        ) : analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3 text-xs max-lg:space-y-1 max-lg:p-2 max-lg:text-[10px]"
          >
            <p>
              <span className="text-muted-foreground">Category: </span>
              {analysis.category}
            </p>
            <p>
              <span className="text-muted-foreground">Colors: </span>
              {analysis.dominantColors.join(", ")}
            </p>
            <p>
              <span className="text-muted-foreground">Material: </span>
              {analysis.materialGuess}
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-muted-foreground max-lg:text-[10px]">
            Upload an image — Gemini analyzes the product and suggests directions.
          </p>
        )}
      </div>

      <Separator className="bg-white/10" />

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground max-lg:mb-1.5 max-lg:text-[10px]">
          Creative directions
        </h3>
        <div className="space-y-2 max-lg:space-y-1.5">
          {analysisLoading
            ? [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg max-lg:h-16" />
              ))
            : (analysis?.suggestedDirections ?? []).map(
                (d: CreativeDirection, i: number) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectDirection(d.id)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left text-xs transition-colors max-lg:p-2 max-lg:text-[10px]",
                        selectedDirectionId === d.id
                          ? "border-primary/60 bg-primary/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      )}
                    >
                      <p className="font-medium text-foreground max-lg:text-[11px]">
                        {d.title}
                      </p>
                      <p className="mt-1 text-muted-foreground line-clamp-2 max-lg:mt-0.5 max-lg:text-[9px] max-lg:line-clamp-2">
                        {d.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1 max-lg:mt-1 max-lg:gap-0.5">
                        {d.styleTags.map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="text-[10px] font-normal max-lg:px-1 max-lg:py-0 max-lg:text-[8px]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  </motion.div>
                )
              )}
          {!analysisLoading && !analysis ? (
            <p className="text-xs text-muted-foreground max-lg:text-[10px]">
              Three directions will appear after analysis.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );

  if (variant === "upload-only") {
    return (
      <aside
        className={cn(
          "glass-panel w-full shrink-0 overflow-hidden rounded-xl border border-white/10",
          className
        )}
      >
        <div className="border-b border-white/10 px-3 py-2 max-lg:px-2.5 max-lg:py-2">
          <p className="text-[11px] font-semibold tracking-tight text-foreground max-lg:text-[10px]">
            Product photo
          </p>
          <p className="text-[10px] text-muted-foreground max-lg:text-[9px]">
            Upload first — then style and generate below.
          </p>
        </div>
        <div className="p-3 max-lg:p-2.5">{uploadBlock}</div>
      </aside>
    );
  }

  if (variant === "creative-only") {
    return (
      <aside
        className={cn(
          "glass-panel flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-white/10",
          className
        )}
      >
        <div className="border-b border-white/10 px-3 py-2 max-lg:px-2.5 max-lg:py-2">
          <div className="flex items-center gap-2">
            <Wand2 className="h-3.5 w-3.5 text-primary max-lg:h-3 max-lg:w-3" />
            <h2 className="text-xs font-semibold tracking-tight max-lg:text-[11px]">
              Look &amp; directions
            </h2>
          </div>
        </div>
        <ScrollArea className="max-h-[min(55dvh,420px)] flex-1">
          <div className="space-y-3 p-3 max-lg:space-y-2.5 max-lg:p-2.5">
            {creativeBody}
          </div>
        </ScrollArea>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "glass-panel flex w-full shrink-0 flex-col overflow-hidden rounded-xl lg:w-[280px]",
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Assets</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload, pick an ad visual style, then brief the agent.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {uploadBlock}

          <Separator className="bg-white/10" />

          {creativeBody}
        </div>
      </ScrollArea>

      <div className="border-t border-white/10 p-3">
        <Button variant="glass" className="w-full text-xs" type="button" disabled>
          Asset library (soon)
        </Button>
      </div>
    </aside>
  );
}
