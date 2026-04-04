"use client";

import { MessageSquare, SendHorizonal, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

import { AD_TYPOGRAPHY_STYLES } from "@/lib/ad/typography-styles";
import type { ChatTurn, IterationVersion } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RightAgentPanelProps = {
  brandName: string;
  brandTagline: string;
  typographyStyleId: string;
  onBrandNameChange: (v: string) => void;
  onBrandTaglineChange: (v: string) => void;
  onTypographyStyleChange: (id: string) => void;
  onSuggestTaglines: () => void;
  suggestTaglinesLoading: boolean;
  canSuggestTaglines: boolean;
  taglineSuggestions: string[] | null;
  onPickTaglineSuggestion: (line: string) => void;
  prompt: string;
  onPromptChange: (v: string) => void;
  onExpand: () => void;
  expandLoading: boolean;
  onGenerate: () => void;
  generateLoading: boolean;
  canGenerate?: boolean;
  generateError?: string | null;
  productPreviewUrl: string | null;
  productSourceVersionId: string;
  iterationVersions: IterationVersion[];
  activeIterationId: string | null;
  onSelectIterationVersion: (id: string) => void;
  canIterate?: boolean;
  chat: ChatTurn[];
  onSendChat: (message: string) => void;
  chatLoading: boolean;
  className?: string;
};

export function RightAgentPanel({
  brandName,
  brandTagline,
  typographyStyleId,
  onBrandNameChange,
  onBrandTaglineChange,
  onTypographyStyleChange,
  onSuggestTaglines,
  suggestTaglinesLoading,
  canSuggestTaglines,
  taglineSuggestions,
  onPickTaglineSuggestion,
  prompt,
  onPromptChange,
  onExpand,
  expandLoading,
  onGenerate,
  generateLoading,
  canGenerate = true,
  generateError = null,
  productPreviewUrl,
  productSourceVersionId,
  iterationVersions,
  activeIterationId,
  onSelectIterationVersion,
  canIterate = true,
  chat,
  onSendChat,
  chatLoading,
  className,
}: RightAgentPanelProps) {
  const [chatInput, setChatInput] = useState("");

  return (
    <aside
      className={cn(
        "glass-panel flex w-full shrink-0 flex-col overflow-hidden rounded-xl lg:w-[320px] max-lg:rounded-lg",
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3 max-lg:px-3 max-lg:py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary max-lg:h-3.5 max-lg:w-3.5" />
          <h2 className="text-sm font-semibold tracking-tight max-lg:text-[13px]">
            Agent
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground max-lg:mt-0.5 max-lg:text-[10px] max-lg:leading-snug">
          Commercial poster prompts — brand lockups, designed type, campaign polish.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Iteration first so chat is reachable without scrolling past brand/brief */}
        <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-3 max-lg:px-3 max-lg:pb-2.5 max-lg:pt-2">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground max-lg:mb-1.5 max-lg:text-[10px]">
            <MessageSquare className="h-3.5 w-3.5" />
            Iteration
          </div>
          {productPreviewUrl || iterationVersions.length > 0 ? (
            <div className="mb-2">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Versions
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {productPreviewUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSelectIterationVersion(productSourceVersionId)
                    }
                    className={cn(
                      "flex shrink-0 flex-col items-center gap-1 rounded-lg border p-1.5 text-left transition-colors",
                      activeIterationId === productSourceVersionId
                        ? "border-primary/70 bg-primary/10 ring-1 ring-primary/40"
                        : "border-white/10 bg-black/30 hover:border-white/20"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={productPreviewUrl}
                      alt=""
                      className="h-11 w-11 rounded object-cover"
                    />
                    <span className="max-w-[4.5rem] truncate text-[9px] text-muted-foreground">
                      1. Product
                    </span>
                  </button>
                ) : null}
                {iterationVersions.map((v, idx) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSelectIterationVersion(v.id)}
                    className={cn(
                      "flex shrink-0 flex-col items-center gap-1 rounded-lg border p-1.5 text-left transition-colors",
                      activeIterationId === v.id
                        ? "border-primary/70 bg-primary/10 ring-1 ring-primary/40"
                        : "border-white/10 bg-black/30 hover:border-white/20"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- iteration thumbnails */}
                    <img
                      src={v.imageUrl}
                      alt=""
                      className="h-11 w-11 rounded object-cover"
                    />
                    <span className="max-w-[4.5rem] truncate text-[9px] text-muted-foreground">
                      {idx + (productPreviewUrl ? 2 : 1)}. {v.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <ScrollArea className="h-[min(22dvh,200px)] rounded-lg border border-white/10 bg-black/20 lg:h-[200px]">
            <div className="space-y-3 p-3 max-lg:space-y-2 max-lg:p-2">
              {chat.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  After you generate once, describe changes here — e.g. &quot;Pull
                  the camera back a bit&quot; — we re-render and save each result
                  as a version. Use{" "}
                  <span className="text-foreground/80">Creative brief</span> below
                  for the first render.
                </p>
              ) : (
                chat.map((m, i) => (
                  <div
                    key={`${m.role}-${m.timestamp}-${i}`}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs",
                      m.role === "user"
                        ? "ml-4 bg-primary/15 text-foreground"
                        : "mr-4 bg-white/5 text-muted-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                ))
              )}
              {chatLoading ? (
                <div className="space-y-2">
                  <div className="ml-4 h-10 rounded-lg shimmer-bg" />
                </div>
              ) : null}
            </div>
          </ScrollArea>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const t = chatInput.trim();
              if (!t || !canIterate) return;
              onSendChat(t);
              setChatInput("");
            }}
          >
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                canIterate ? "Change the shot…" : "Add a brief first…"
              }
              className="text-xs"
              disabled={!canIterate}
            />
            <Button
              type="submit"
              size="icon"
              variant="glass"
              disabled={chatLoading || !canIterate}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-3 p-4 max-lg:space-y-2 max-lg:p-3">
          <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3 max-lg:space-y-1.5 max-lg:p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary max-lg:text-[9px]">
              Brand identity
            </p>
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground">
                Brand name
              </label>
              <Input
                value={brandName}
                onChange={(e) => onBrandNameChange(e.target.value)}
                placeholder="e.g. Lumen & Co."
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] text-muted-foreground">
                  Tagline / claim
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 px-2 text-[10px]"
                  disabled={!canSuggestTaglines || suggestTaglinesLoading}
                  onClick={onSuggestTaglines}
                >
                  <Wand2 className="h-3 w-3" />
                  {suggestTaglinesLoading ? "…" : "Suggest"}
                </Button>
              </div>
              <Textarea
                value={brandTagline}
                onChange={(e) => onBrandTaglineChange(e.target.value)}
                placeholder="Short line for the poster lockup"
                className="min-h-[52px] text-xs max-lg:min-h-[44px] max-lg:text-[11px]"
              />
              {taglineSuggestions?.length ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {taglineSuggestions.map((line) => (
                    <button
                      key={line}
                      type="button"
                      onClick={() => onPickTaglineSuggestion(line)}
                      className="max-w-full rounded-md border border-white/15 bg-white/5 px-2 py-1 text-left text-[10px] leading-snug text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                    >
                      {line}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground">
                Typography / lettering style
              </label>
              <select
                value={typographyStyleId}
                onChange={(e) => onTypographyStyleChange(e.target.value)}
                className="flex h-8 w-full rounded-md border border-white/10 bg-zinc-950/80 px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {AD_TYPOGRAPHY_STYLES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] leading-snug text-muted-foreground max-lg:text-[9px] max-lg:leading-tight">
                Controls how on-image headlines and taglines are described to the
                image model — art-directed, not plain text.
              </p>
            </div>
          </div>

          <label className="text-xs font-medium text-muted-foreground">
            Creative brief
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder='Short brief, or Expand to fill a full ad prompt'
            className="min-h-[100px] max-h-[220px] resize-y text-sm max-lg:min-h-[72px] max-lg:max-h-[160px] max-lg:text-xs"
          />
          <div className="flex gap-2 max-lg:gap-1.5">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 text-xs max-lg:h-8 max-lg:text-[11px]"
              onClick={onExpand}
              disabled={expandLoading}
            >
              {expandLoading ? (
                <span className="shimmer-bg block h-4 w-20 rounded" />
              ) : (
                "Expand prompt"
              )}
            </Button>
            <Button
              type="button"
              className="flex-1 gap-1 text-xs max-lg:h-8 max-lg:text-[11px]"
              onClick={onGenerate}
              disabled={generateLoading || !canGenerate}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generateLoading ? "Working…" : "Generate"}
            </Button>
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground max-lg:text-[9px] max-lg:leading-tight">
            Expand replaces this text with a long ad-ready prompt. Edit it, then
            Generate — or change brand/style and Expand again.
          </p>
          {generateError ? (
            <p
              className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-[11px] leading-snug text-destructive"
              role="alert"
            >
              {generateError}
            </p>
          ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
