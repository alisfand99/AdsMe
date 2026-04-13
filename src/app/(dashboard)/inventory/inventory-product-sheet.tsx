"use client";

import { ImagePlus, Package, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { InventoryProduct } from "@/contexts/inventory-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MAX_IMAGE_CHARS = 2_400_000;

type InventoryProductSheetProps = {
  product: InventoryProduct | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (
    id: string,
    patch: Partial<
      Pick<InventoryProduct, "name" | "narrative" | "specs" | "imageDataUrl">
    >
  ) => void;
  onRemoveProduct: (id: string) => void;
};

export function InventoryProductSheet({
  product,
  open,
  onClose,
  onUpdate,
  onRemoveProduct,
}: InventoryProductSheetProps) {
  const [name, setName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [specs, setSpecs] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageHint, setImageHint] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setNarrative(product.narrative);
    setSpecs(product.specs);
    setImageDataUrl(product.imageDataUrl);
    setImageHint(null);
    setSavedFlash(false);
  }, [product]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      if (url.length > MAX_IMAGE_CHARS) {
        setImageHint("Image too large — use a smaller file.");
        return;
      }
      setImageHint(null);
      setImageDataUrl(url);
    };
    reader.readAsDataURL(f);
  }, []);

  const onSave = () => {
    if (!product) return;
    const n = name.trim();
    if (!n) return;
    onUpdate(product.id, {
      name: n,
      narrative: narrative.trim(),
      specs: specs.trim(),
      imageDataUrl,
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const onDeleteProduct = () => {
    if (!product) return;
    if (
      !window.confirm(
        `Remove “${product.name}” from the catalog? This cannot be undone.`
      )
    ) {
      return;
    }
    onRemoveProduct(product.id);
    onClose();
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[145]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close product details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-product-sheet-title"
        className={cn(
          "absolute flex w-full flex-col overflow-hidden border border-white/10 bg-zinc-950/98 shadow-2xl backdrop-blur-xl",
          "inset-x-0 bottom-0 max-h-[min(92dvh,900px)] rounded-t-2xl border-b-0",
          "lg:inset-x-auto lg:bottom-4 lg:left-auto lg:right-4 lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:max-w-md lg:rounded-2xl lg:border-b"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/20 lg:hidden" />

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-3 sm:px-5 sm:pt-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40",
                !imageDataUrl && "items-center justify-center"
              )}
            >
              {imageDataUrl ? (
                <Image
                  src={imageDataUrl}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="m-auto h-6 w-6 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0">
              <p
                id="inventory-product-sheet-title"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Product
              </p>
              <p className="truncate text-base font-semibold tracking-tight">
                {name || product.name}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name or SKU"
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
                className="min-h-[100px] resize-y text-sm"
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
                className="min-h-[88px] resize-y text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Hero image
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <ImagePlus className="h-4 w-4" />
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={onImage}
                    />
                  </label>
                </Button>
                {imageDataUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setImageDataUrl(null);
                      setImageHint(null);
                    }}
                  >
                    Remove image
                  </Button>
                ) : null}
              </div>
              {imageHint ? (
                <p className="text-xs text-amber-400/90">{imageHint}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 space-y-2 border-t border-white/10 bg-zinc-950/90 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
          {savedFlash ? (
            <p className="text-center text-xs font-medium text-emerald-400/90">
              Saved to this browser.
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              className="w-full"
              onClick={onSave}
              disabled={!name.trim()}
            >
              <Pencil className="h-4 w-4" />
              Save changes
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              {imageDataUrl ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:flex-1"
                  asChild
                >
                  <Link href={`/studio?inventory=${product.id}`} onClick={onClose}>
                    Open in Studio
                  </Link>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 sm:flex-1"
                onClick={onDeleteProduct}
              >
                <Trash2 className="h-4 w-4" />
                Delete product
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
