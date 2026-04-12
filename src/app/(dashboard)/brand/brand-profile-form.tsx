"use client";

import { motion } from "framer-motion";
import { Fingerprint, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import {
  BRAND_VOICE_OPTIONS,
  type BrandProfile,
  type BrandVoice,
  useBrand,
} from "@/contexts/brand-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function BrandProfileForm() {
  const { profile, saveProfile } = useBrand();
  const [draft, setDraft] = useState<BrandProfile>(profile);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const onSave = () => {
    saveProfile(draft);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950">
      <header className="shrink-0 border-b border-white/10 bg-zinc-950/80 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_28px_-10px_hsl(var(--primary)/0.55)]">
              <Fingerprint className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                Brand Profile
              </h1>
              <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
                Your global identity, voice, and visual guardrails — used across
                the Marketing OS.
              </p>
            </div>
          </div>
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
                "Stored locally in this browser until you connect a workspace."
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
