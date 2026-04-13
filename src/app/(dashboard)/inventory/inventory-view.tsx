"use client";

import Image from "next/image";
import { ImagePlus, Package, Pencil, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { InventoryProductSheet } from "./inventory-product-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/contexts/inventory-context";
import { cn } from "@/lib/utils";

const MAX_IMAGE_CHARS = 2_400_000;

export function InventoryView() {
  const { products, addProduct, removeProduct, updateProduct } = useInventory();
  const [sheetProductId, setSheetProductId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [specs, setSpecs] = useState("");
  const [sku, setSku] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageHint, setImageHint] = useState<string | null>(null);

  const onImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      if (url.length > MAX_IMAGE_CHARS) {
        setImageHint("Image too large for browser storage — use a smaller file.");
        setImageDataUrl(null);
        return;
      }
      setImageHint(null);
      setImageDataUrl(url);
    };
    reader.readAsDataURL(f);
  }, []);

  const sheetProduct = sheetProductId
    ? products.find((p) => p.id === sheetProductId) ?? null
    : null;

  useEffect(() => {
    if (sheetProductId && !products.some((p) => p.id === sheetProductId)) {
      setSheetProductId(null);
    }
  }, [products, sheetProductId]);

  const onAdd = () => {
    const n = name.trim();
    if (!n) return;
    addProduct({
      name: n,
      sku: sku.trim(),
      narrative: narrative.trim(),
      specs: specs.trim(),
      notes: notes.trim(),
      imageDataUrl,
      galleryDataUrls: [],
    });
    setName("");
    setSku("");
    setNarrative("");
    setSpecs("");
    setNotes("");
    setImageDataUrl(null);
    setImageHint(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950">
      <header className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-primary">
              <Package className="h-5 w-5" strokeWidth={1.85} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                Inventory
              </h1>
              <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
                Product catalog for your Marketing OS — stored locally until backend
                ships.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-start">
        <section className="glass-panel w-full shrink-0 rounded-2xl p-5 sm:p-6 lg:max-w-md">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">
            Add product
          </h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                SKU / code
              </label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Optional internal code"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Narrative
              </label>
              <Textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Story for ads and listings…"
                className="min-h-[88px] resize-y text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Specs
              </label>
              <Textarea
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                placeholder="Size, materials, variants…"
                className="min-h-[72px] resize-y text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Pricing, links, channel copy…"
                className="min-h-[64px] resize-y text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Cover image
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <ImagePlus className="h-4 w-4" />
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={onImage}
                    />
                  </label>
                </Button>
                {imageDataUrl ? (
                  <span className="text-xs text-emerald-400/90">Image attached</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Optional</span>
                )}
              </div>
              {imageHint ? (
                <p className="text-xs text-amber-400/90">{imageHint}</p>
              ) : null}
            </div>
            <Button
              type="button"
              className="w-full gap-1.5"
              onClick={onAdd}
              disabled={!name.trim()}
            >
              <Wand2 className="h-4 w-4" />
              Save product
            </Button>
          </div>
        </section>

        <section className="min-h-0 flex-1 space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">
            Catalog ({products.length})
          </h2>
          {products.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-sm text-muted-foreground">
              No products yet. Add one to send hero shots into the Studio.
            </div>
          ) : (
            <ul className="space-y-3 pb-20">
              {products.map((p) => {
                const thumb =
                  p.imageDataUrl ??
                  p.galleryDataUrls?.find((u) => u?.startsWith("data:image/")) ??
                  null;
                const hasAnyImage = Boolean(thumb);
                return (
                  <li
                    key={p.id}
                    className="glass-panel flex flex-col gap-3 rounded-xl p-4 transition hover:border-white/15 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 gap-4 rounded-lg text-left outline-none ring-primary/40 transition hover:bg-white/[0.03] focus-visible:ring-2"
                      onClick={() => setSheetProductId(p.id)}
                    >
                      <div
                        className={cn(
                          "h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/30",
                          !thumb && "flex items-center justify-center"
                        )}
                      >
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            width={80}
                            height={80}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="font-medium leading-tight">{p.name}</p>
                        {p.sku?.trim() ? (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            SKU: {p.sku.trim()}
                          </p>
                        ) : null}
                        {p.narrative ? (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {p.narrative}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[11px] text-primary/80">
                          Tap to open details
                        </p>
                      </div>
                    </button>
                    <div className="flex shrink-0 flex-wrap gap-2 border-t border-white/5 pt-3 sm:flex-col sm:border-t-0 sm:pt-0">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-1"
                        onClick={() => setSheetProductId(p.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      {hasAnyImage ? (
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/studio?inventory=${p.id}`}>
                            Open in Studio
                          </Link>
                        </Button>
                      ) : (
                        <span className="self-center text-[11px] text-muted-foreground sm:max-w-[9rem]">
                          Add a cover or gallery photo to use Studio
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeProduct(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <InventoryProductSheet
        product={sheetProduct}
        open={Boolean(sheetProduct)}
        onClose={() => setSheetProductId(null)}
        onUpdate={(id, patch) => updateProduct(id, patch)}
        onRemoveProduct={removeProduct}
      />
    </div>
  );
}
