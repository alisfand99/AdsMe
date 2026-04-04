"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Download,
  Loader2,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { generateSocialCaption, toImageDataUrl } from "@/lib/ai/client";
import type {
  AdCreativeContext,
  SocialCaptionPlatform,
} from "@/lib/ai/types";
import {
  exportImageBlob,
  formatHashtagsForPost,
  resolveImageBlob,
  triggerDownload,
} from "@/lib/media/image-export-client";
import { cn } from "@/lib/utils";

const PLATFORMS: { id: SocialCaptionPlatform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
];

export type ImageViewerCaptionContext = {
  creativeContext?: AdCreativeContext;
};

type ImageViewerLightboxProps = {
  imageUrl: string;
  onClose: () => void;
  /** Optional brand / style context for AI captions */
  captionContext?: ImageViewerCaptionContext;
};

function fullPostText(caption: string, hashtags: string): string {
  const h = formatHashtagsForPost(hashtags);
  if (!h) return caption.trim();
  return `${caption.trim()}\n\n${h}`.trim();
}

export function ImageViewerLightbox({
  imageUrl,
  onClose,
  captionContext,
}: ImageViewerLightboxProps) {
  const [platform, setPlatform] = useState<SocialCaptionPlatform>("instagram");
  const [captions, setCaptions] = useState<
    Partial<Record<SocialCaptionPlatform, string>>
  >({});
  const [hashtagsByPlatform, setHashtagsByPlatform] = useState<
    Partial<Record<SocialCaptionPlatform, string>>
  >({});
  const [captionLoading, setCaptionLoading] = useState(false);
  const [downloadErr, setDownloadErr] = useState<string | null>(null);
  const [exportingMime, setExportingMime] = useState<string | null>(null);
  const [copyFlash, setCopyFlash] = useState(false);

  const draft = captions[platform] ?? "";
  const draftTags = hashtagsByPlatform[platform] ?? "";

  const setDraft = useCallback(
    (text: string) => {
      setCaptions((s) => ({ ...s, [platform]: text }));
    },
    [platform]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const combinedForShare = useMemo(
    () => fullPostText(draft, draftTags),
    [draft, draftTags]
  );

  const onDownload = async (mime: "image/png" | "image/jpeg" | "image/webp") => {
    setDownloadErr(null);
    const ext =
      mime === "image/png" ? "png" : mime === "image/jpeg" ? "jpg" : "webp";
    setExportingMime(mime);
    try {
      const blob = await exportImageBlob(imageUrl, mime);
      triggerDownload(blob, `heroframe-creative-${Date.now()}.${ext}`);
    } catch (e) {
      setDownloadErr(
        e instanceof Error ? e.message : "Download failed — try another format."
      );
    } finally {
      setExportingMime(null);
    }
  };

  const onGenerateCaption = async () => {
    setCaptionLoading(true);
    setDownloadErr(null);
    try {
      const dataUrl = await toImageDataUrl(imageUrl);
      const res = await generateSocialCaption({
        platform,
        imageDataUrl: dataUrl,
        creativeContext: captionContext?.creativeContext,
      });
      setCaptions((s) => ({ ...s, [platform]: res.caption }));
      setHashtagsByPlatform((s) => ({ ...s, [platform]: res.hashtags }));
    } catch (e) {
      setDownloadErr(
        e instanceof Error ? e.message : "Could not generate caption."
      );
    } finally {
      setCaptionLoading(false);
    }
  };

  const copyCombined = async () => {
    const t = fullPostText(draft, draftTags);
    try {
      await navigator.clipboard.writeText(t);
      setCopyFlash(true);
      window.setTimeout(() => setCopyFlash(false), 1600);
    } catch {
      setDownloadErr("Clipboard not available in this browser.");
    }
  };

  const shareNative = async () => {
    setDownloadErr(null);
    try {
      const blob = await resolveImageBlob(imageUrl);
      const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/png";
      const file = new File([blob], `heroframe-ad.${type.split("/")[1] || "png"}`, {
        type,
      });
      const payload: ShareData = {
        title: "Ad creative",
        text: combinedForShare || "Creative from HeroFrame AI",
      };
      if (navigator.canShare?.({ ...payload, files: [file] })) {
        await navigator.share({ ...payload, files: [file] });
        return;
      }
      if (navigator.share) {
        await navigator.share({
          ...payload,
          url: imageUrl.startsWith("http") ? imageUrl : undefined,
        });
        return;
      }
      setDownloadErr("System share is not supported here — use the buttons below.");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setDownloadErr(
        e instanceof Error ? e.message : "Share was cancelled or failed."
      );
    }
  };

  const openShare = (kind: "twitter" | "facebook" | "linkedin" | "pinterest") => {
    const text = combinedForShare || draft || "New campaign visual";
    const url =
      imageUrl.startsWith("http") ? imageUrl : window.location.origin;
    let href = "";
    if (kind === "twitter") {
      href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 2400))}`;
    } else if (kind === "facebook") {
      href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (kind === "linkedin") {
      href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    } else if (kind === "pinterest") {
      const media =
        imageUrl.startsWith("http") ? imageUrl : url;
      href = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(text.slice(0, 500))}`;
    }
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=520");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="viewer"
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/88 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
      >
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-3 top-3 z-[210] h-10 w-10 rounded-full border border-white/10 bg-black/60 text-white hover:bg-black/80 sm:right-5 sm:top-5"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-zinc-950 shadow-2xl sm:max-h-[92vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:flex-row sm:gap-4 sm:p-4">
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-black/40 p-2 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Enlarged creative"
                className="max-h-[min(52dvh,560px)] w-full max-w-full object-contain sm:max-h-[min(70vh,720px)]"
              />
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-[min(100%,380px)]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Download
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(
                    [
                      ["PNG", "image/png"],
                      ["JPEG", "image/jpeg"],
                      ["WebP", "image/webp"],
                    ] as const
                  ).map(([label, mime]) => (
                    <Button
                      key={label}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs"
                      disabled={Boolean(exportingMime)}
                      onClick={() => onDownload(mime)}
                    >
                      {exportingMime === mime ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Share
                </p>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground/90">
                  Most networks open a compose window; you still attach the
                  image there if the link alone is not enough. Instagram and
                  TikTok are app-first — save the file and paste your caption.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 gap-1 text-xs"
                    onClick={() => void shareNative()}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    System share
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openShare("twitter")}
                  >
                    X
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openShare("facebook")}
                  >
                    Facebook
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openShare("linkedin")}
                  >
                    LinkedIn
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openShare("pinterest")}
                  >
                    Pinterest
                  </Button>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Caption (per network)
                </p>
                <div className="flex flex-wrap gap-1">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-medium transition",
                        platform === p.id
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-white/10 bg-black/30 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Write or generate a ${PLATFORMS.find((x) => x.id === platform)?.label ?? "social"} caption…`}
                  className="min-h-[100px] resize-y border-white/10 bg-black/30 text-sm"
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    disabled={captionLoading}
                    onClick={() => void onGenerateCaption()}
                  >
                    {captionLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Generate for {PLATFORMS.find((x) => x.id === platform)?.label}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                    onClick={() => void copyCombined()}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copyFlash ? "Copied" : "Copy caption + tags"}
                  </Button>
                </div>
                {draftTags ? (
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/70">
                      Suggested tags:{" "}
                    </span>
                    {formatHashtagsForPost(draftTags)}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground/80">
                    AI returns hashtags separately; they are appended when you
                    copy.
                  </p>
                )}
              </div>

              {downloadErr ? (
                <p className="text-[11px] text-amber-200/90">{downloadErr}</p>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
