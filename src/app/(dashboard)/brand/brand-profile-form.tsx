"use client";

import { motion } from "framer-motion";
import { Fingerprint, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  BRAND_VOICE_OPTIONS,
  type BrandProfile,
  type BrandVoice,
  useBrand,
} from "@/contexts/brand-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AD_TYPOGRAPHY_STYLES } from "@/lib/ad/typography-styles";
import { suggestAdvertisingTaglines, suggestBrandProfile } from "@/lib/ai";
import type { SuggestBrandProfileResult } from "@/lib/ai/types";
import {
  buildBrandBriefFromProfile,
  profileHasBrandSignal,
} from "@/lib/brand/brand-brief";
import { cn } from "@/lib/utils";

const VOICE_LABELS: Record<BrandVoice, string> = {
  professional: "Professional",
  playful: "Playful",
  luxury: "Luxury",
  minimalist: "Minimalist",
  bold: "Bold",
};

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none text-foreground"
      >
        {children}
      </label>
      {hint ? (
        <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function ChipRow({
  items,
  onPick,
}: {
  items: string[];
  onPick: (value: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {items.map((line, i) => (
        <button
          key={`${i}-${line.slice(0, 48)}`}
          type="button"
          onClick={() => onPick(line)}
          className="max-w-full rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-left text-[11px] leading-snug text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
        >
          {line}
        </button>
      ))}
    </div>
  );
}

export function BrandProfileForm() {
  const { profile, saveProfile } = useBrand();
  const [draft, setDraft] = useState<BrandProfile>(profile);
  const [savedFlash, setSavedFlash] = useState(false);
  const [aiLoading, setAiLoading] = useState<null | "strategy" | "taglines">(
    null
  );
  const [strategyPack, setStrategyPack] =
    useState<SuggestBrandProfileResult | null>(null);
  const [taglineChips, setTaglineChips] = useState<string[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const onSave = () => {
    saveProfile(draft);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  };

  const runStrategyAi = useCallback(async () => {
    setAiError(null);
    setAiLoading("strategy");
    setStrategyPack(null);
    try {
      const res = await suggestBrandProfile({
        brandName: draft.brandName,
        brandTagline: draft.brandTagline,
        brandNarrative: draft.brandNarrative,
        targetAudience: draft.targetAudience,
        brandVoice: draft.brandVoice,
        visualIdentityRules: draft.visualIdentityRules,
      });
      setStrategyPack(res);
      const v = res.suggestedVoice as BrandVoice;
      setDraft((d) => ({
        ...d,
        brandVoice: BRAND_VOICE_OPTIONS.includes(v) ? v : d.brandVoice,
      }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setAiLoading(null);
    }
  }, [draft]);

  const runTaglineAi = useCallback(async () => {
    setAiError(null);
    setAiLoading("taglines");
    setTaglineChips(null);
    try {
      const brandBrief = buildBrandBriefFromProfile(draft);
      const res = await suggestAdvertisingTaglines({
        brandBrief,
        brandName: draft.brandName.trim() || undefined,
      });
      setTaglineChips(res.taglines.length ? res.taglines : null);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setAiLoading(null);
    }
  }, [draft]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950">
      <header className="shrink-0 border-b border-white/10 bg-zinc-950/80 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_28px_-10px_hsl(var(--primary)/0.55)]">
              <Fingerprint className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                Brand Profile
              </h1>
              <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
                Global identity and voice — synced with the Studio agent panel.
              </p>
            </div>
          </div>
          <Button variant="glass" size="sm" asChild className="shrink-0">
            <Link href="/studio">Open Studio</Link>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-3xl space-y-6 pb-24 lg:pb-10"
        >
          <section className="glass-panel rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold tracking-tight">
                  AI assistants
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  disabled={aiLoading !== null}
                  onClick={() => void runStrategyAi()}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {aiLoading === "strategy" ? "Thinking…" : "Draft with AI"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={
                    aiLoading !== null || !profileHasBrandSignal(draft)
                  }
                  onClick={() => void runTaglineAi()}
                  title={
                    !profileHasBrandSignal(draft)
                      ? "Add a bit of brand context first"
                      : undefined
                  }
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {aiLoading === "taglines" ? "…" : "Taglines only"}
                </Button>
              </div>
            </div>
            {aiError ? (
              <p
                className="mb-3 rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                role="alert"
              >
                {aiError}
              </p>
            ) : null}
            {strategyPack ? (
              <div className="mb-4 space-y-3 rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs">
                <p className="font-medium text-foreground">AI pack — tap to apply</p>
                {strategyPack.voiceRationale ? (
                  <p className="text-muted-foreground">
                    <span className="text-foreground/90">Voice: </span>
                    {BRAND_VOICE_OPTIONS.includes(
                      strategyPack.suggestedVoice as BrandVoice
                    )
                      ? VOICE_LABELS[strategyPack.suggestedVoice as BrandVoice]
                      : strategyPack.suggestedVoice}
                    {" — "}
                    {strategyPack.voiceRationale}
                  </p>
                ) : null}
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Mission options
                  </p>
                  <ChipRow
                    items={strategyPack.missionOptions}
                    onPick={(v) => setDraft((d) => ({ ...d, brandNarrative: v }))}
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Taglines
                  </p>
                  <ChipRow
                    items={strategyPack.taglines}
                    onPick={(v) => setDraft((d) => ({ ...d, brandTagline: v }))}
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Visual rules
                  </p>
                  <ChipRow
                    items={strategyPack.visualIdentityBullets}
                    onPick={(v) =>
                      setDraft((d) => ({
                        ...d,
                        visualIdentityRules: d.visualIdentityRules
                          ? `${d.visualIdentityRules.trim()}\n• ${v}`
                          : `• ${v}`,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}
            {taglineChips?.length ? (
              <div className="mb-2">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Tagline suggestions
                </p>
                <ChipRow
                  items={taglineChips}
                  onPick={(v) => setDraft((d) => ({ ...d, brandTagline: v }))}
                />
              </div>
            ) : null}
          </section>

          <section className="glass-panel rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight">
                Core identity
              </h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <FieldLabel htmlFor="brandName">Brand name</FieldLabel>
                <Input
                  id="brandName"
                  value={draft.brandName}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, brandName: e.target.value }))
                  }
                  placeholder="e.g. Northwind Coffee"
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel
                  htmlFor="brandTagline"
                  hint="Short claim for lockups — same field the Studio agent uses."
                >
                  Tagline / claim
                </FieldLabel>
                <Textarea
                  id="brandTagline"
                  value={draft.brandTagline}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, brandTagline: e.target.value }))
                  }
                  placeholder="One sharp line…"
                  className="min-h-[72px] resize-y text-sm"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel
                  htmlFor="brandNarrative"
                  hint="What is the core story customers should feel?"
                >
                  Brand narrative / mission
                </FieldLabel>
                <Textarea
                  id="brandNarrative"
                  value={draft.brandNarrative}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, brandNarrative: e.target.value }))
                  }
                  placeholder="We exist to…"
                  className="min-h-[120px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel
                  htmlFor="targetAudience"
                  hint="Who you serve — segments, psychographics, or jobs-to-be-done."
                >
                  Target audience
                </FieldLabel>
                <Textarea
                  id="targetAudience"
                  value={draft.targetAudience}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, targetAudience: e.target.value }))
                  }
                  placeholder="Design-forward founders, 28–45, urban…"
                  className="min-h-[100px] resize-y"
                />
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight">
                Voice &amp; visuals
              </h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <FieldLabel htmlFor="brandVoice">Brand voice</FieldLabel>
                <select
                  id="brandVoice"
                  value={draft.brandVoice}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      brandVoice: e.target.value as BrandVoice,
                    }))
                  }
                  className={cn(
                    "flex h-10 w-full max-w-md rounded-md border border-input bg-background/50 px-3 py-2 text-sm",
                    "ring-offset-background backdrop-blur-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                  )}
                >
                  {BRAND_VOICE_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {VOICE_LABELS[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <FieldLabel
                  htmlFor="typographyStyleId"
                  hint="Default lettering style for Studio image prompts — editable per session in Studio."
                >
                  Default poster typography
                </FieldLabel>
                <select
                  id="typographyStyleId"
                  value={draft.typographyStyleId}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      typographyStyleId: e.target.value,
                    }))
                  }
                  className={cn(
                    "flex h-10 w-full max-w-md rounded-md border border-input bg-background/50 px-3 py-2 text-sm",
                    "ring-offset-background backdrop-blur-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                  )}
                >
                  {AD_TYPOGRAPHY_STYLES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <FieldLabel
                  htmlFor="visualIdentityRules"
                  hint="Lighting, palette, typography, subjects to avoid, etc."
                >
                  Visual identity rules
                </FieldLabel>
                <Textarea
                  id="visualIdentityRules"
                  value={draft.visualIdentityRules}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      visualIdentityRules: e.target.value,
                    }))
                  }
                  placeholder="Always use warm, directional light. Avoid neon accents…"
                  className="min-h-[120px] resize-y"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {savedFlash ? (
                <span className="font-medium text-emerald-400/90">
                  Saved to this browser.
                </span>
              ) : (
                "Save to persist in this browser. Studio reads the same profile live after save."
              )}
            </p>
            <Button
              type="button"
              size="lg"
              className="w-full shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.45)] sm:w-auto"
              onClick={onSave}
            >
              Save brand identity
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
