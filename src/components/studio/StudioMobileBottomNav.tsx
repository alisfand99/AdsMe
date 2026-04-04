"use client";

import { LayoutTemplate, Menu, MessageSquare } from "lucide-react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

export type StudioMobileTab = "assets" | "canvas" | "agent";

type StudioMobileBottomNavProps = {
  active: StudioMobileTab;
  onTabChange: (tab: StudioMobileTab) => void;
  onPhotoCapture: (file: File) => void;
};

function ViewfinderGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-7 w-7", className)}
      aria-hidden
    >
      <path
        d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.25" fill="currentColor" />
    </svg>
  );
}

export function StudioMobileBottomNav({
  active,
  onTabChange,
  onPhotoCapture,
}: StudioMobileBottomNavProps) {
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) onPhotoCapture(f);
      e.target.value = "";
    },
    [onPhotoCapture]
  );

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] lg:hidden"
      aria-label="Studio mobile navigation"
    >
      <div className="pointer-events-auto border-t border-white/10 bg-zinc-950/95 shadow-[0_-12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-end justify-between gap-1 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-0.5">
          <button
            type="button"
            onClick={() => onTabChange("assets")}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
              active === "assets"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Menu
              className="h-5 w-5 shrink-0"
              strokeWidth={active === "assets" ? 2.25 : 1.75}
            />
            <span className="truncate">Assets</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("canvas")}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
              active === "canvas"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutTemplate
              className="h-5 w-5 shrink-0"
              strokeWidth={active === "canvas" ? 2.25 : 1.75}
            />
            <span className="truncate">Canvas</span>
          </button>

          <div className="flex w-[4.5rem] shrink-0 flex-col items-center">
            <label className="-mt-9 mb-0.5 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={onInputChange}
              />
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/45 bg-gradient-to-b from-violet-500 to-violet-700 text-white shadow-[0_10px_32px_rgba(124,58,237,0.5)] ring-2 ring-black/35 transition active:scale-95">
                <ViewfinderGlyph className="text-white" />
              </span>
            </label>
            <span className="text-[10px] font-medium text-muted-foreground">
              Capture
            </span>
          </div>

          <button
            type="button"
            onClick={() => onTabChange("agent")}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
              active === "agent"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare
              className="h-5 w-5 shrink-0"
              strokeWidth={active === "agent" ? 2.25 : 1.75}
            />
            <span className="truncate">Agent</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
