"use client";

import { ImagePlus, MessageCircle, SendHorizonal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBrand } from "@/contexts/brand-context";
import { useInventory } from "@/contexts/inventory-context";
import type {
  CalendarPost,
  MarketingChannelId,
} from "@/contexts/marketing-context";
import { useMarketing } from "@/contexts/marketing-context";
import { postMarketingAssistant } from "@/lib/ai";
import type { MarketingAssistantAction } from "@/lib/ai/types";
import type { BrandProfile } from "@/lib/brand/brand-profile-types";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
};

type PendingProposal = {
  actions: MarketingAssistantAction[];
  latestImages: string[];
};

function describeAction(a: MarketingAssistantAction): string {
  switch (a.type) {
    case "update_brand":
      return `Brand: update ${Object.keys(a.patch).join(", ")}`;
    case "add_inventory_product":
      return `Inventory: add “${a.name}”${a.includeLatestUserImage ? " (attach your photo)" : ""}`;
    case "update_inventory_product":
      return `Inventory: update product (${a.productId.slice(0, 8)}…)`;
    case "remove_inventory_product":
      return `Inventory: remove product (${a.productId.slice(0, 8)}…)`;
    case "set_marketing_webhook":
      return `Marketing: set n8n webhook URL`;
    case "add_calendar_post":
      return `Calendar: add “${a.title}” (${a.channel})`;
    case "update_calendar_post":
      return `Calendar: update post (${a.postId.slice(0, 8)}…)`;
    case "remove_calendar_post":
      return `Calendar: remove post (${a.postId.slice(0, 8)}…)`;
    default:
      return "Change";
  }
}

function applyAllActions(
  actions: MarketingAssistantAction[],
  ctx: {
    patchProfile: (p: Partial<BrandProfile>) => void;
    addProduct: (p: {
      name: string;
      narrative: string;
      specs: string;
      imageDataUrl: string | null;
    }) => void;
    updateProduct: (
      id: string,
      patch: Partial<{
        name: string;
        narrative: string;
        specs: string;
        imageDataUrl: string | null;
      }>
    ) => void;
    removeProduct: (id: string) => void;
    setSettings: (s: { n8nWebhookUrl?: string }) => void;
    addPost: (p: Omit<CalendarPost, "id">) => void;
    updatePost: (id: string, patch: Partial<CalendarPost>) => void;
    removePost: (id: string) => void;
    latestImages: string[];
  }
): string[] {
  const lines: string[] = [];
  for (const a of actions) {
    if (a.type === "update_brand") {
      ctx.patchProfile(a.patch as Partial<BrandProfile>);
      lines.push(`Brand (${Object.keys(a.patch).join(", ")})`);
    } else if (a.type === "add_inventory_product") {
      const img =
        a.includeLatestUserImage && ctx.latestImages[0]
          ? ctx.latestImages[0]
          : null;
      ctx.addProduct({
        name: a.name,
        narrative: a.narrative,
        specs: a.specs,
        imageDataUrl: img,
      });
      lines.push(`Added inventory: ${a.name}`);
    } else if (a.type === "update_inventory_product") {
      const patch: Partial<{
        name: string;
        narrative: string;
        specs: string;
        imageDataUrl: string | null;
      }> = {};
      if (a.name !== undefined) patch.name = a.name;
      if (a.narrative !== undefined) patch.narrative = a.narrative;
      if (a.specs !== undefined) patch.specs = a.specs;
      if (a.clearImage) patch.imageDataUrl = null;
      else if (a.includeLatestUserImage && ctx.latestImages[0]) {
        patch.imageDataUrl = ctx.latestImages[0];
      }
      ctx.updateProduct(a.productId, patch);
      lines.push(`Updated inventory ${a.productId.slice(0, 8)}…`);
    } else if (a.type === "remove_inventory_product") {
      ctx.removeProduct(a.productId);
      lines.push(`Removed inventory item`);
    } else if (a.type === "set_marketing_webhook") {
      ctx.setSettings({ n8nWebhookUrl: a.url });
      lines.push(`Updated n8n webhook`);
    } else if (a.type === "add_calendar_post") {
      ctx.addPost({
        title: a.title,
        channel: a.channel,
        scheduledAt: a.scheduledAt,
        status: a.status,
        notes: a.notes?.trim() ? a.notes : undefined,
      });
      lines.push(`Calendar: added “${a.title}”`);
    } else if (a.type === "update_calendar_post") {
      const patch: Partial<CalendarPost> = {};
      if (a.title !== undefined) patch.title = a.title;
      if (a.channel !== undefined)
        patch.channel = a.channel as MarketingChannelId;
      if (a.scheduledAt !== undefined) patch.scheduledAt = a.scheduledAt;
      if (a.status !== undefined) patch.status = a.status;
      if (a.notes !== undefined) patch.notes = a.notes;
      ctx.updatePost(a.postId, patch);
      lines.push(`Calendar: updated post`);
    } else if (a.type === "remove_calendar_post") {
      ctx.removePost(a.postId);
      lines.push(`Calendar: removed post`);
    }
  }
  return lines;
}

export function GlobalMarketingAssistant() {
  const { profile, patchProfile } = useBrand();
  const { products, addProduct, updateProduct, removeProduct } = useInventory();
  const { posts, settings, addPost, updatePost, removePost, setSettings } =
    useMarketing();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingProposal, setPendingProposal] = useState<PendingProposal | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ block: "end" });
    });
    return () => cancelAnimationFrame(id);
  }, [open, messages, loading, pendingProposal]);

  const onPickImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = "";
    if (!files?.length) return;
    const cap = 3 - pendingImages.length;
    const arr = Array.from(files).slice(0, Math.max(0, cap));
    for (const f of arr) {
      if (!f.type.startsWith("image/")) continue;
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result);
        if (url.length > 5_200_000) {
          setError("Image too large — try a smaller file.");
          return;
        }
        setPendingImages((prev) => [...prev, url].slice(0, 3));
        setError(null);
      };
      reader.readAsDataURL(f);
    }
  }, [pendingImages.length]);

  const onApplyPending = useCallback(() => {
    if (!pendingProposal?.actions.length) return;
    const lines = applyAllActions(pendingProposal.actions, {
      patchProfile,
      addProduct,
      updateProduct,
      removeProduct,
      setSettings,
      addPost,
      updatePost,
      removePost,
      latestImages: pendingProposal.latestImages,
    });
    setPendingProposal(null);
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          lines.length > 0
            ? `Applied: ${lines.join(" · ")}`
            : "No changes were applied.",
      },
    ]);
  }, [
    pendingProposal,
    patchProfile,
    addProduct,
    updateProduct,
    removeProduct,
    setSettings,
    addPost,
    updatePost,
    removePost,
  ]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setPendingProposal(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      images: pendingImages.length ? [...pendingImages] : undefined,
    };
    setMessages((m) => [...m, userMsg]);
    const snapImages = [...pendingImages];
    setPendingImages([]);
    setLoading(true);
    setError(null);
    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const clip = (s: string, n: number) =>
        s.length <= n ? s : s.slice(0, n);
      const res = await postMarketingAssistant({
        history,
        message: text,
        images: snapImages.length ? snapImages : undefined,
        brandProfile: { ...profile },
        inventorySummary: products.map((p) => ({
          id: p.id,
          name: p.name,
          narrative: clip(p.narrative, 4000),
          specs: clip(p.specs, 4000),
          hasImage: Boolean(p.imageDataUrl),
        })),
        marketingSummary: {
          posts: posts.map((p) => ({
            id: p.id,
            title: p.title,
            channel: p.channel,
            scheduledAt: p.scheduledAt,
            status: p.status,
            notes: p.notes,
          })),
          n8nWebhookUrl: settings.n8nWebhookUrl,
        },
      });

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.assistantMessage,
        },
      ]);

      if (res.actions.length > 0) {
        setPendingProposal({
          actions: res.actions,
          latestImages: snapImages,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry — something went wrong talking to the assistant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    input,
    loading,
    messages,
    pendingImages,
    profile,
    products,
    posts,
    settings,
  ]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed z-[160] flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/45 bg-gradient-to-b from-violet-500 to-violet-700 text-white shadow-[0_10px_36px_rgba(124,58,237,0.45)] ring-2 ring-black/40 transition hover:brightness-110 active:scale-95",
          "bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-4 lg:bottom-8"
        )}
        aria-label={open ? "Close assistant" : "Open AI assistant"}
        title="Marketing assistant"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
        )}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[155] bg-black/50 backdrop-blur-sm lg:bg-black/40"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}

      {open ? (
        <div
          className="fixed z-[165] flex max-h-[min(640px,88dvh)] w-[calc(100vw-1.5rem)] max-w-md min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl max-lg:left-3 max-lg:right-3 max-lg:top-[max(4.5rem,env(safe-area-inset-top))] lg:bottom-8 lg:right-6 lg:top-auto lg:max-h-[min(720px,85dvh)]"
          role="dialog"
          aria-modal="true"
          aria-label="Marketing assistant"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Marketing assistant
              </p>
              <p className="text-[11px] text-muted-foreground">
                Proposed edits need your <strong className="text-foreground">Apply</strong>{" "}
                tap — nothing changes until then.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                <Link href="/brand" onClick={() => setOpen(false)}>
                  Brand
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-3 py-2">
            <div className="space-y-3 pr-2">
              {messages.length === 0 ? (
                <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-muted-foreground">
                  Ask for changes to brand, inventory, calendar, or n8n webhook. When I
                  propose structured updates, review them below and tap{" "}
                  <strong className="text-foreground">Apply changes</strong>.
                </p>
              ) : null}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-6 border-primary/25 bg-primary/10"
                      : "mr-4 border-white/10 bg-black/25"
                  )}
                >
                  {m.images?.length ? (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {m.images.map((src, i) => (
                        <Image
                          key={i}
                          src={src}
                          alt=""
                          width={72}
                          height={72}
                          unoptimized
                          className="h-16 w-16 rounded-md border border-white/10 object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
              {loading ? (
                <div className="mr-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
                  Thinking…
                </div>
              ) : null}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {pendingProposal && pendingProposal.actions.length > 0 ? (
            <div className="shrink-0 border-t border-violet-500/30 bg-violet-950/25 px-3 py-3">
              <p className="text-xs font-semibold text-violet-200">
                Pending changes
              </p>
              <ul className="mt-2 max-h-28 list-disc space-y-1 overflow-y-auto pl-4 text-[11px] text-muted-foreground">
                {pendingProposal.actions.map((a, i) => (
                  <li key={i}>{describeAction(a)}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={onApplyPending}
                >
                  Apply changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setPendingProposal(null)}
                >
                  Discard
                </Button>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="border-t border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <div className="border-t border-white/10 p-3">
            {pendingImages.length ? (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {pendingImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-12 w-12 overflow-hidden rounded-md border border-white/10"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      className="absolute inset-0 flex items-center justify-center bg-black/55 text-[10px] font-medium text-white opacity-0 transition hover:opacity-100"
                      onClick={() =>
                        setPendingImages((p) => p.filter((_, j) => j !== i))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" asChild>
                <label className="cursor-pointer">
                  <ImagePlus className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={onPickImages}
                  />
                </label>
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="text-sm"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                disabled={loading || !input.trim()}
                onClick={() => void send()}
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
