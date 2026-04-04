"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { AdCanvas } from "@/components/canvas/AdCanvas";
import { LeftAssetsPanel } from "@/components/sidebar/LeftAssetsPanel";
import { RightAgentPanel } from "@/components/sidebar/RightAgentPanel";
import { Button } from "@/components/ui/button";
import {
  analyzeProductImage,
  expandCreativePrompt,
  generateAdImage,
  refineFromChatHistory,
} from "@/lib/ai";
import type { ChatTurn, ExpandedPrompt, ProductAnalysis } from "@/lib/ai/types";

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
  const [expanded, setExpanded] = useState<ExpandedPrompt | null>(null);
  const [expandLoading, setExpandLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const selectedDirectionTitle = useMemo(() => {
    if (!analysis || !selectedDirectionId) return null;
    return (
      analysis.suggestedDirections.find((d) => d.id === selectedDirectionId)
        ?.title ?? null
    );
  }, [analysis, selectedDirectionId]);

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
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const onExpand = useCallback(async () => {
    setExpandLoading(true);
    setGenerateError(null);
    try {
      const out = await expandCreativePrompt(prompt);
      setExpanded(out);
    } finally {
      setExpandLoading(false);
    }
  }, [prompt]);

  const onGenerate = useCallback(async () => {
    if (!productDataUrl || !expanded?.expandedPrompt?.trim()) return;
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      const result = await generateAdImage(
        productDataUrl,
        expanded.expandedPrompt
      );
      setGeneratedImageUrl(result.url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Generation failed";
      setGenerateError(message);
      console.error("Generation failed", error);
    } finally {
      setGenerateLoading(false);
    }
  }, [productDataUrl, expanded]);

  const onSendChat = useCallback(async (message: string) => {
    const userTurn: ChatTurn = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    const historyAfterUser: ChatTurn[] = [...chat, userTurn];
    setChat(historyAfterUser);
    setChatLoading(true);
    try {
      const result = await refineFromChatHistory(historyAfterUser, message);
      const assistantTurn: ChatTurn = {
        role: "assistant",
        content: result.reply,
        timestamp: Date.now(),
      };
      setChat((c) => [...c, assistantTurn]);
    } finally {
      setChatLoading(false);
    }
  }, [chat]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <div className="hidden h-4 w-px bg-white/15 sm:block" />
          <div>
            <h1 className="text-sm font-semibold tracking-tight">AdsMe Studio</h1>
            <p className="text-[11px] text-muted-foreground">
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
        className="flex min-h-0 min-h-[calc(100vh-3.5rem)] flex-1 flex-col gap-3 overflow-auto p-3 lg:flex-row lg:overflow-hidden sm:gap-4 sm:p-4"
      >
        <LeftAssetsPanel
          onFileSelect={onFileSelect}
          analysis={analysis}
          analysisLoading={analysisLoading}
          selectedDirectionId={selectedDirectionId}
          onSelectDirection={setSelectedDirectionId}
        />
        <AdCanvas
          productPreviewUrl={productPreviewUrl}
          generatedImageUrl={generatedImageUrl}
          isAnalyzing={analysisLoading}
          isGenerating={generateLoading}
          selectedDirectionTitle={selectedDirectionTitle}
        />
        <RightAgentPanel
          prompt={prompt}
          onPromptChange={setPrompt}
          onExpand={onExpand}
          expandLoading={expandLoading}
          expanded={expanded}
          onGenerate={onGenerate}
          generateLoading={generateLoading}
          canGenerate={Boolean(
            productDataUrl && expanded?.expandedPrompt?.trim()
          )}
          generateError={generateError}
          chat={chat}
          onSendChat={onSendChat}
          chatLoading={chatLoading}
        />
      </motion.main>
    </div>
  );
}

function BadgePill() {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md">
      Beta · Gemini + Replicate
    </div>
  );
}
