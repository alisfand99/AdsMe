"use client";

import { motion } from "framer-motion";
import { MessageSquare, SendHorizonal, Sparkles } from "lucide-react";
import { useState } from "react";

import type {
  ChatTurn,
  ExpandedPrompt,
  IterationVersion,
} from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RightAgentPanelProps = {
  prompt: string;
  onPromptChange: (v: string) => void;
  onExpand: () => void;
  expandLoading: boolean;
  expanded: ExpandedPrompt | null;
  onGenerate: () => void;
  generateLoading: boolean;
  canGenerate?: boolean;
  generateError?: string | null;
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
  prompt,
  onPromptChange,
  onExpand,
  expandLoading,
  expanded,
  onGenerate,
  generateLoading,
  canGenerate = true,
  generateError = null,
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
        "glass-panel flex w-full shrink-0 flex-col overflow-hidden rounded-xl lg:w-[320px]",
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Agent</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Natural language → Gemini expands the prompt → Google image for pixels.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-3 p-4">
          <label className="text-xs font-medium text-muted-foreground">
            Creative brief
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder='e.g. "make it look luxury"'
            className="min-h-[88px] text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 text-xs"
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
              className="flex-1 text-xs gap-1"
              onClick={onGenerate}
              disabled={generateLoading || !canGenerate}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generateLoading ? "Working…" : "Generate"}
            </Button>
          </div>
          {generateError ? (
            <p
              className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-[11px] leading-snug text-destructive"
              role="alert"
            >
              {generateError}
            </p>
          ) : null}
          {expanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-lg border border-white/10 bg-black/25 p-3 text-xs"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                Expanded prompt
              </p>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {expanded.expandedPrompt}
              </p>
            </motion.div>
          ) : null}
        </div>

        <Separator className="bg-white/10" />

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Iteration
          </div>
          {iterationVersions.length > 0 ? (
            <div className="mb-2">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Versions
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
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
                      {idx + 1}. {v.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <ScrollArea className="min-h-[180px] flex-1 rounded-lg border border-white/10 bg-black/20">
            <div className="space-y-3 p-3">
              {chat.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  After you generate once, describe changes here — e.g. &quot;Pull
                  the camera back a bit&quot; — we re-render and save each result
                  as a version above.
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
                canIterate
                  ? "Change the shot…"
                  : "Expand prompt first…"
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
      </div>
    </aside>
  );
}
