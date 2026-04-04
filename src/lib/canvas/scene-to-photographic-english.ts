/**
 * Maps slider / JSON scene controls to plain photographic language for image models
 * (distances in cm, degrees, left/right relative to camera and product).
 */

import {
  canvasAdjustmentsEqual,
  type CanvasSceneAdjustments,
} from "@/lib/canvas/canvas-adjustments";

import type { AdCreativeContext } from "@/lib/ai/types";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Apparent lens-to-hero distance (illustrative cm, consistent across UI range). */
export function approximateCameraDistanceCm(framingZoom: number): number {
  const z = clamp(framingZoom, 0.55, 1.45);
  return Math.round(72 / z);
}

function describeYaw(orbitYawDeg: number): string {
  const y = clamp(orbitYawDeg, -48, 48);
  if (Math.abs(y) < 2) {
    return "head-on / symmetric hero (minimal horizontal orbit)";
  }
  const mag = Math.abs(Math.round(y));
  if (y < 0) {
    return `camera shifted about ${mag}° toward the product's RIGHT side of the set (you see more of the product's LEFT face from the lens)`;
  }
  return `camera shifted about ${mag}° toward the product's LEFT side of the set (you see more of the product's RIGHT face from the lens)`;
}

function describePitch(orbitPitchDeg: number): string {
  const p = clamp(orbitPitchDeg, -28, 28);
  if (Math.abs(p) < 2) {
    return "lens near mid-height on the hero, nearly level";
  }
  const mag = Math.abs(Math.round(p));
  if (p > 0) {
    return `camera raised: look down onto the hero by roughly ${mag}° (higher / three-quarter down)`;
  }
  return `camera lowered: slight upward angle toward the hero by roughly ${mag}° (hero angle)`;
}

function describeRoll(subjectRollDeg: number): string {
  const r = clamp(subjectRollDeg, -22, 22);
  if (Math.abs(r) < 1) return "product upright in the frame (no intentional roll)";
  const mag = Math.abs(Math.round(r));
  const dir = r > 0 ? "clockwise" : "counter-clockwise";
  return `hero rotated about ${mag}° ${dir} in the picture plane`;
}

/**
 * Key light azimuth: 0° = from camera-right of set; 90° = from behind camera toward subject;
 * 180° = camera-left; 270° = toward camera / frontal.
 */
function describeLightAzimuth(lightAzimuthDeg: number): string {
  const d = ((lightAzimuthDeg % 360) + 360) % 360;
  const rounded = Math.round(d);
  let sector: string;
  if (d >= 337.5 || d < 22.5) {
    sector = "from the CAMERA-RIGHT side of the set (key skims in from the photographer's right)";
  } else if (d < 67.5) {
    sector = "from front-right (between camera-right and behind camera)";
  } else if (d < 112.5) {
    sector = "from BEHIND the camera, toward the subject (backlight / rim tendency)";
  } else if (d < 157.5) {
    sector = "from behind-left (between back and camera-left)";
  } else if (d < 202.5) {
    sector = "from the CAMERA-LEFT side of the set";
  } else if (d < 247.5) {
    sector = "from front-left (between camera-left and toward lens)";
  } else if (d < 292.5) {
    sector = "from in front / toward the camera (fill or frontal key)";
  } else {
    sector = "from front-right-of-lens (wrap toward camera-right)";
  }
  return `dominant key light direction ${rounded}° in our rig (${sector})`;
}

function describeElevation(lightElevationDeg: number): string {
  const e = clamp(lightElevationDeg, 8, 82);
  const er = Math.round(e);
  if (e < 22) return `key light very low, about ${er}° above the horizon (grazing / long shadows)`;
  if (e < 48) return `key light at a medium height, about ${er}° above the horizon`;
  if (e < 68) return `key light fairly high, about ${er}° above the horizon (clean modeling)`;
  return `key light high / top-ish, about ${er}° above the horizon (near overhead feel)`;
}

function describeHardness(lightHardness: number): string {
  const h = clamp(lightHardness, 0, 1);
  if (h < 0.28) return "very soft wrap light, shadow edges almost imperceptible";
  if (h < 0.55) return "moderately soft shadows, gradual falloff";
  if (h < 0.78) return "medium-hard key, readable shadow edges";
  return "hard key, crisp shadow edges and higher contrast";
}

export type ScenePhotographicSnapshot = {
  distanceCm: number;
  yawText: string;
  pitchText: string;
  rollText: string;
  lightAzimuthText: string;
  elevationText: string;
  hardnessText: string;
};

export function sceneToPhotographicSnapshot(
  adj: CanvasSceneAdjustments
): ScenePhotographicSnapshot {
  return {
    distanceCm: approximateCameraDistanceCm(adj.framingZoom),
    yawText: describeYaw(adj.orbitYawDeg),
    pitchText: describePitch(adj.orbitPitchDeg),
    rollText: describeRoll(adj.subjectRollDeg),
    lightAzimuthText: describeLightAzimuth(adj.lightAzimuthDeg),
    elevationText: describeElevation(adj.lightElevationDeg),
    hardnessText: describeHardness(adj.lightHardness),
  };
}

function formatSnapshotBullets(s: ScenePhotographicSnapshot): string {
  return [
    `• Lens-to-hero distance (illustrative): about ${s.distanceCm} cm (higher zoom number = closer / tighter).`,
    `• Horizontal orbit: ${s.yawText}.`,
    `• Camera height / tilt: ${s.pitchText}.`,
    `• Product in frame: ${s.rollText}.`,
    `• Key light: ${s.lightAzimuthText}. ${s.elevationText}. ${s.hardnessText}.`,
  ].join("\n");
}

function brandPreserveLine(ctx: AdCreativeContext | undefined): string {
  if (!ctx) {
    return "Keep every pixel of layout, product, and on-image type from the reference unless a line below explicitly changes framing or light.";
  }
  const bits: string[] = [];
  if (ctx.brandName.trim()) bits.push(`brand “${ctx.brandName.trim()}”`);
  if (ctx.brandTagline.trim()) bits.push(`tagline text`);
  const b = bits.length
    ? `Preserve visible ${bits.join(" and ")} as in the reference.`
    : "Preserve visible logos and headline areas as in the reference.";
  return `${b} Style: ${ctx.adVisualStyleName}; type: ${ctx.typographyStyleLabel}.`;
}

/**
 * Full English prompt for image-to-image: no internal parameter names — only human distances/angles.
 */
export function buildPhotographicSceneEditPrompt(
  baseline: CanvasSceneAdjustments | null,
  target: CanvasSceneAdjustments,
  creativeContext?: AdCreativeContext
): string {
  const t = sceneToPhotographicSnapshot(target);
  const head =
    "Use the attached reference image as the complete visual base. Do not re-invent the campaign layout from scratch. ";

  const brand = brandPreserveLine(creativeContext);

  if (!baseline || canvasAdjustmentsEqual(baseline, target)) {
    return (
      head +
      brand +
      "\n\nApply this TARGET camera and lighting setup:\n" +
      formatSnapshotBullets(t)
    );
  }

  const b = sceneToPhotographicSnapshot(baseline);
  const dDist = t.distanceCm - b.distanceCm;
  const distMove =
    Math.abs(dDist) < 4
      ? "Keep roughly the same lens-to-hero distance."
      : dDist < 0
        ? `Move the camera CLOSER to the hero by about ${Math.abs(dDist)} cm (tighter crop, stronger presence).`
        : `Move the camera FARTHER from the hero by about ${dDist} cm (wider frame, more breathing room).`;

  const dYaw = target.orbitYawDeg - baseline.orbitYawDeg;
  const yawMove =
    Math.abs(dYaw) < 2
      ? "Leave horizontal orbit almost unchanged."
      : `Shift horizontal camera orbit by about ${Math.round(dYaw)}° (negative = more toward product's right in our rig). New state: ${t.yawText}`;

  const dPitch = target.orbitPitchDeg - baseline.orbitPitchDeg;
  const pitchMove =
    Math.abs(dPitch) < 2
      ? "Keep lens height / vertical aim almost the same."
      : `Adjust camera height / down-tilt by about ${Math.round(dPitch)}° vs the estimate. New state: ${t.pitchText}`;

  const dRoll = target.subjectRollDeg - baseline.subjectRollDeg;
  const rollMove =
    Math.abs(dRoll) < 1.5
      ? "Product roll: nearly unchanged."
      : `Change hero roll in the picture plane by about ${Math.round(dRoll)}°. New state: ${t.rollText}.`;

  const dAz = ((target.lightAzimuthDeg - baseline.lightAzimuthDeg + 540) % 360) - 180;
  const lightMove =
    Math.abs(dAz) < 5 && Math.abs(target.lightElevationDeg - baseline.lightElevationDeg) < 4
      ? "Key light direction: small tweak only — see target block below."
      : `Swing the dominant key light horizontally by about ${Math.round(Math.abs(dAz))}° (signed rig azimuth). Was ~${Math.round(baseline.lightAzimuthDeg)}°, target ~${Math.round(target.lightAzimuthDeg)}° — final: ${t.lightAzimuthText}`;

  const elevMove =
    Math.abs(target.lightElevationDeg - baseline.lightElevationDeg) < 3
      ? `Elevation stays near ${Math.round(baseline.lightElevationDeg)}°.`
      : `Raise or lower the key: was about ${Math.round(baseline.lightElevationDeg)}° above horizon, target about ${Math.round(target.lightElevationDeg)}° — ${t.elevationText}`;

  const hardMove =
    Math.abs(target.lightHardness - baseline.lightHardness) < 0.06
      ? `Shadow character similar (${t.hardnessText}).`
      : `Shadow hardness: move from previous estimate toward ${t.hardnessText}.`;

  return [
    head + brand,
    "",
    "ESTIMATED CURRENT (from analysis of the reference image):",
    formatSnapshotBullets(b),
    "",
    "CHANGES TO APPLY (then match TARGET below):",
    `• ${distMove}`,
    `• ${yawMove}`,
    `• ${pitchMove}`,
    `• ${rollMove}`,
    `• ${lightMove}`,
    `• ${elevMove}`,
    `• ${hardMove}`,
    "",
    "TARGET SETUP (after all edits):",
    formatSnapshotBullets(t),
  ].join("\n");
}

export function summarizeSceneDelta(
  baseline: CanvasSceneAdjustments | null,
  target: CanvasSceneAdjustments
): string {
  if (!baseline) {
    return `Camera ~${approximateCameraDistanceCm(target.framingZoom)}cm; relight ${Math.round(target.lightAzimuthDeg)}°`;
  }
  const parts: string[] = [];
  const dd = approximateCameraDistanceCm(target.framingZoom) - approximateCameraDistanceCm(baseline.framingZoom);
  if (Math.abs(dd) >= 4) parts.push(dd < 0 ? "closer" : "wider");
  if (Math.abs(target.orbitYawDeg - baseline.orbitYawDeg) >= 4) parts.push("orbit");
  if (Math.abs(target.lightAzimuthDeg - baseline.lightAzimuthDeg) >= 8) parts.push("key light swing");
  if (Math.abs(target.lightHardness - baseline.lightHardness) >= 0.12) parts.push("shadow hardness");
  return parts.length ? parts.join(", ") : "Fine scene tweak";
}
