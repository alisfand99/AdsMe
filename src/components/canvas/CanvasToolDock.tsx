"use client";

import {
  ChevronDown,
  ChevronUp,
  RotateCw,
  SlidersHorizontal,
  Sparkles,
  SunMedium,
  Video,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import type { CanvasSceneAdjustments } from "@/lib/canvas/canvas-adjustments";
import { DEFAULT_CANVAS_ADJUSTMENTS } from "@/lib/canvas/canvas-adjustments";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function baselineMarkerPercent(
  baseline: number | null | undefined,
  min: number,
  max: number
): number | null {
  if (baseline == null || !Number.isFinite(baseline)) return null;
  const t = (baseline - min) / (max - min);
  if (t < -0.02 || t > 1.02) return null;
  return Math.min(100, Math.max(0, t * 100));
}

function LabeledRange({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
  disabled,
  baselineValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
  disabled?: boolean;
  /** Vision-estimated value for the current frame (faded tick on track). */
  baselineValue?: number | null;
}) {
  const pct = baselineMarkerPercent(baselineValue, min, max);
  return (
    <div className={cn("space-y-1", disabled && "opacity-40")}>
      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground/90">
          {step >= 1 ? Math.round(value) : value.toFixed(2)}
          {suffix}
        </span>
      </div>
      <div className="relative flex h-4 items-center">
        {pct != null ? (
          <span
            className="pointer-events-none absolute top-1/2 z-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/35 bg-violet-400/25 shadow-[0_0_6px_rgba(139,92,246,0.35)]"
            style={{ left: `${pct}%` }}
            title="Estimated from current image (Gemini)"
            aria-hidden
          />
        ) : null}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-[1] h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-primary disabled:cursor-not-allowed [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      </div>
    </div>
  );
}

type CanvasToolDockProps = {
  adjustments: CanvasSceneAdjustments;
  /** Inferred scene for the visible frame — slider ticks only; does not warp the photo. */
  baselineScene?: CanvasSceneAdjustments | null;
  onChange: (next: CanvasSceneAdjustments) => void;
  onApplyRender: () => void;
  applyDisabled: boolean;
  applyLoading: boolean;
  /** 3D gizmo — only mounted while the panel is expanded. */
  scenePreview?: ReactNode;
  className?: string;
};

export function CanvasToolDock({
  adjustments,
  baselineScene = null,
  onChange,
  onApplyRender,
  applyDisabled,
  applyLoading,
  scenePreview,
  className,
}: CanvasToolDockProps) {
  const [open, setOpen] = useState(false);

  const patch = (partial: Partial<CanvasSceneAdjustments>) =>
    onChange({ ...adjustments, ...partial });

  return (
    <div
      className={cn(
        "border-t border-white/10 bg-zinc-950/95 backdrop-blur-md",
        className
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] font-medium text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground max-lg:px-2 max-lg:py-1.5 max-lg:text-[10px]"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          Scene tools
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="border-t border-white/5">
          {scenePreview ?? null}
          <div className="space-y-3 px-3 pb-3 pt-2 max-lg:space-y-2 max-lg:px-2 max-lg:pb-2 max-lg:pt-1.5">
          <div className="grid gap-3 sm:grid-cols-2 max-lg:grid-cols-1 max-lg:gap-2">
            <div className="space-y-2.5 rounded-lg border border-white/10 bg-black/25 p-2.5 max-lg:space-y-2 max-lg:p-2">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary max-lg:text-[9px]">
                <Video className="h-3 w-3" />
                Camera &amp; framing
              </p>
              <LabeledRange
                label="Framing (zoom)"
                value={adjustments.framingZoom}
                min={0.55}
                max={1.45}
                step={0.01}
                baselineValue={baselineScene?.framingZoom}
                onChange={(framingZoom) => patch({ framingZoom })}
                disabled={applyDisabled}
              />
              <LabeledRange
                label="Orbit yaw"
                value={adjustments.orbitYawDeg}
                min={-48}
                max={48}
                step={1}
                suffix="°"
                baselineValue={baselineScene?.orbitYawDeg}
                onChange={(orbitYawDeg) => patch({ orbitYawDeg })}
                disabled={applyDisabled}
              />
              <LabeledRange
                label="Camera pitch"
                value={adjustments.orbitPitchDeg}
                min={-28}
                max={28}
                step={1}
                suffix="°"
                baselineValue={baselineScene?.orbitPitchDeg}
                onChange={(orbitPitchDeg) => patch({ orbitPitchDeg })}
                disabled={applyDisabled}
              />
              <LabeledRange
                label="Subject roll"
                value={adjustments.subjectRollDeg}
                min={-22}
                max={22}
                step={1}
                suffix="°"
                baselineValue={baselineScene?.subjectRollDeg}
                onChange={(subjectRollDeg) => patch({ subjectRollDeg })}
                disabled={applyDisabled}
              />
            </div>
            <div className="space-y-2.5 rounded-lg border border-white/10 bg-black/25 p-2.5 max-lg:space-y-2 max-lg:p-2">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90 max-lg:text-[9px]">
                <SunMedium className="h-3 w-3" />
                Key light
              </p>
              <LabeledRange
                label="Azimuth"
                value={adjustments.lightAzimuthDeg}
                min={0}
                max={360}
                step={2}
                suffix="°"
                baselineValue={baselineScene?.lightAzimuthDeg}
                onChange={(lightAzimuthDeg) => patch({ lightAzimuthDeg })}
                disabled={applyDisabled}
              />
              <LabeledRange
                label="Elevation"
                value={adjustments.lightElevationDeg}
                min={8}
                max={82}
                step={1}
                suffix="°"
                baselineValue={baselineScene?.lightElevationDeg}
                onChange={(lightElevationDeg) => patch({ lightElevationDeg })}
                disabled={applyDisabled}
              />
              <LabeledRange
                label="Shadow hardness"
                value={adjustments.lightHardness}
                min={0}
                max={1}
                step={0.02}
                baselineValue={baselineScene?.lightHardness}
                onChange={(lightHardness) => patch({ lightHardness })}
                disabled={applyDisabled}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 max-lg:gap-1.5">
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-xs max-lg:h-7 max-lg:text-[11px]"
              disabled={applyDisabled || applyLoading}
              onClick={onApplyRender}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {applyLoading ? "Composing…" : "Apply & render"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs max-lg:h-7 max-lg:text-[11px]"
              disabled={applyDisabled || applyLoading}
              onClick={() =>
                onChange(
                  baselineScene
                    ? { ...baselineScene }
                    : { ...DEFAULT_CANVAS_ADJUSTMENTS }
                )
              }
            >
              <RotateCw className="h-3.5 w-3.5" />
              {baselineScene ? "Match image est." : "Reset sliders"}
            </Button>
          </div>
          <p className="border-t border-white/5 pt-2.5 text-[9px] leading-relaxed text-muted-foreground/90 max-lg:pt-2 max-lg:text-[8px] max-lg:leading-snug">
            Scene controls only enrich the camera-and-lighting wording in your
            generation prompt—they are not executed as a deterministic 3D rig.
            The model treats that text as interpretive direction; pixel-accurate
            or numerically exact reproduction of every adjustment is not
            guaranteed.
          </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
