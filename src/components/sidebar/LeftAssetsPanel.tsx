"use client";

import { motion } from "framer-motion";
import { Upload, Wand2 } from "lucide-react";

import type { CreativeDirection, ProductAnalysis } from "@/lib/ai/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LeftAssetsPanelProps = {
  onFileSelect: (file: File) => void;
  analysis: ProductAnalysis | null;
  analysisLoading: boolean;
  selectedDirectionId: string | null;
  onSelectDirection: (id: string) => void;
  className?: string;
};

export function LeftAssetsPanel({
  onFileSelect,
  analysis,
  analysisLoading,
  selectedDirectionId,
  onSelectDirection,
  className,
}: LeftAssetsPanelProps) {
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
          Agentic upload analyzes your product automatically.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
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
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/[0.03] px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Upload product image</span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG — Gemini vision on the server
              </span>
            </motion.div>
          </label>

          <Separator className="bg-white/10" />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Analysis
              </h3>
              {analysisLoading ? (
                <Badge variant="muted" className="text-[10px]">
                  Running…
                </Badge>
              ) : null}
            </div>
            {analysisLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3 text-xs"
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
              <p className="text-xs text-muted-foreground">
                Upload an image — Gemini analyzes the product and suggests directions.
              </p>
            )}
          </div>

          <Separator className="bg-white/10" />

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Creative directions
            </h3>
            <div className="space-y-2">
              {analysisLoading
                ? [1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
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
                            "w-full rounded-lg border p-3 text-left text-xs transition-colors",
                            selectedDirectionId === d.id
                              ? "border-primary/60 bg-primary/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20"
                          )}
                        >
                          <p className="font-medium text-foreground">{d.title}</p>
                          <p className="mt-1 text-muted-foreground line-clamp-2">
                            {d.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {d.styleTags.map((t) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className="text-[10px] font-normal"
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
                <p className="text-xs text-muted-foreground">
                  Three directions will appear after analysis.
                </p>
              ) : null}
            </div>
          </div>
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
