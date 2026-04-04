/**
 * Manual scene controls on the canvas — converted server-side into image prompt text.
 * Values are relative to a neutral "hero" framing unless noted.
 */
export type CanvasSceneAdjustments = {
  /** <1 = pull camera back / wider frame, >1 = tighter crop on hero */
  framingZoom: number;
  /** Orbit camera around subject: negative = from subject's right, positive = left */
  orbitYawDeg: number;
  /** Camera height: negative = lower / hero angle up, positive = higher looking down */
  orbitPitchDeg: number;
  /** Rotate hero product in the picture plane (Z), degrees */
  subjectRollDeg: number;
  /** Key light direction around subject (0° = camera-right of set, 90° = from behind camera toward subject) */
  lightAzimuthDeg: number;
  /** Key light elevation above horizon */
  lightElevationDeg: number;
  /** 0 = very soft wrap light, 1 = hard crisp shadow edges */
  lightHardness: number;
};

export const DEFAULT_CANVAS_ADJUSTMENTS: CanvasSceneAdjustments = {
  framingZoom: 1,
  orbitYawDeg: 0,
  orbitPitchDeg: 0,
  subjectRollDeg: 0,
  lightAzimuthDeg: 45,
  lightElevationDeg: 38,
  lightHardness: 0.45,
};

export function canvasAdjustmentsEqual(
  a: CanvasSceneAdjustments,
  b: CanvasSceneAdjustments
): boolean {
  const keys = Object.keys(a) as (keyof CanvasSceneAdjustments)[];
  return keys.every((k) => Math.abs(a[k] - b[k]) < 1e-6);
}

export function isCanvasAdjustmentsNeutral(
  adj: CanvasSceneAdjustments
): boolean {
  return canvasAdjustmentsEqual(adj, DEFAULT_CANVAS_ADJUSTMENTS);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Clamp vision/API output into the same ranges as the UI controls. */
export function clampCanvasSceneAdjustments(
  raw: Partial<CanvasSceneAdjustments> & Record<string, unknown>
): CanvasSceneAdjustments {
  const num = (k: keyof CanvasSceneAdjustments, d: number) => {
    const v = raw[k];
    return typeof v === "number" && Number.isFinite(v) ? v : d;
  };
  return {
    framingZoom: clamp(num("framingZoom", 1), 0.55, 1.45),
    orbitYawDeg: clamp(num("orbitYawDeg", 0), -48, 48),
    orbitPitchDeg: clamp(num("orbitPitchDeg", 0), -28, 28),
    subjectRollDeg: clamp(num("subjectRollDeg", 0), -22, 22),
    lightAzimuthDeg: ((n: number) => {
      let x = n % 360;
      if (x < 0) x += 360;
      return x;
    })(num("lightAzimuthDeg", 45)),
    lightElevationDeg: clamp(num("lightElevationDeg", 38), 8, 82),
    lightHardness: clamp(num("lightHardness", 0.45), 0, 1),
  };
}
