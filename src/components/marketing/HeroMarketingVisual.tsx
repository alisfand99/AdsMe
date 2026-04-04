"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { HeroStudioMock } from "./HeroStudioMock";

const HERO_SRC = "/images/hero-studio-ai.webp";

/**
 * Marketing hero: AI-generated studio still when `public/images/hero-studio-ai.webp` exists;
 * otherwise falls back to the CSS mock (or on load error).
 */
export function HeroMarketingVisual() {
  const [useFallback, setUseFallback] = useState(false);

  const onError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    return <HeroStudioMock />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
        <Image
          src={HERO_SRC}
          alt="HeroFrame Studio — assets, live canvas, and agent columns in a cinematic 3D view"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 896px"
          priority
          onError={onError}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.035] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(139,92,246,0.06)_48%,rgba(255,255,255,0.04)_52%,transparent_60%)]"
          aria-hidden
        />
      </div>
    </div>
  );
}
