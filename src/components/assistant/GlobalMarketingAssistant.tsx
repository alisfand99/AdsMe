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

function applyActions(
  actions: MarketingAssistantAction[],
  ctx: {
    patchProfile: (p: Partial<BrandProfile>) => void;
    addProduct: (p: {
      name: string;
      narrative: string;
      specs: string;
      imageDataUrl: string | null;
    }) => void;
    latestImages: string[];
  }
): string[] {
  const lines: string[] = [];
  for (const a of actions) {
    if (a.type === "update_brand") {
      ctx.patchProfile(a.patch as Partial<BrandProfile>);
      const keys = Object.keys(a.patch).filter(
        (k) => (a.patch as Record<string, unknown>)[k] != null
      );
      if (keys.length) lines.push(`Brand updated: ${keys.join(", ")}`);
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
      lines.push(
        img
          ? `Inventory: added “${a.name}” with your photo.`
          : `Inventory: added “${a.name}”.`
      );
    }
  }
  return lines;
}

export function GlobalMarketingAssistant() {
  const { profile, patchProfile } = useBrand();
  const { products, addProduct } = useInventory();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ block: "end" });
    });
    return () => cancelAnimationFrame(id);
  }, [open, messages, loading]);

  const onPickImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = "";
    if (!files?.length) return;
    const next: string[] = [...pendingImages];
    const cap = 3 - next.length;
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
  }, [pendingImages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
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
      const res = await postMarketingAssistant({
        history,
        message: text,
        images: snapImages.length ? snapImages : undefined,
        brandProfile: { ...profile },
        inventorySummary: products.map((p) => ({ id: p.id, name: p.name })),
      });

      const applied = applyActions(res.actions, {
        patchProfile,
        addProduct,
        latestImages: snapImages,
      });

      const content =
        applied.length > 0
          ? `${res.assistantMessage}\n\n— ${applied.join(" ")}`
          : res.assistantMessage;

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content,
        },
      ]);
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
    patchProfile,
    addProduct,
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
                Chat in natural language — I can update Brand &amp; Inventory when
                you confirm.
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
                  Try: &quot;I sell ceramic mugs to gift shops — what brand name
                  fits?&quot; Then: &quot;Set brand name to …&quot;. Attach a
                  product photo and say &quot;add this to inventory with that
                  name&quot;.
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

          {error ? (
            <p className="border-t border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <div className="border-t border-white/10 p-3">
            {pendingImages.length ? (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {pendingImages.map((src, i) => (
                  <div key={i} className="relative h-12 w-12 overflow-hidden rounded-md border border-white/10">
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
