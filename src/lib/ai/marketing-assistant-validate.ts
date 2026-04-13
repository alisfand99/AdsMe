import { getAdTypographyStyle } from "@/lib/ad/typography-styles";
import {
  BRAND_VOICE_OPTIONS,
  type BrandVoice,
} from "@/lib/brand/brand-profile-types";

import type {
  MarketingAssistantAction,
  MarketingAssistantBrandPatch,
  MarketingAssistantResult,
} from "./types";

const MAX_ACTIONS = 8;
const L = {
  brandName: 160,
  brandTagline: 400,
  brandNarrative: 6000,
  targetAudience: 4000,
  visualIdentityRules: 6000,
  productName: 200,
  productNarrative: 6000,
  productSpecs: 4000,
  message: 12000,
} as const;

function clip(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max);
}

function coerceVoice(v: string | undefined): BrandVoice | undefined {
  if (!v) return undefined;
  const x = v.trim().toLowerCase();
  return BRAND_VOICE_OPTIONS.includes(x as BrandVoice)
    ? (x as BrandVoice)
    : undefined;
}

function parseBrandPatchJson(raw: string | undefined): MarketingAssistantBrandPatch {
  if (!raw?.trim()) return {};
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (!o || typeof o !== "object") return {};
    const patch: MarketingAssistantBrandPatch = {};
    if (typeof o.brandName === "string")
      patch.brandName = clip(o.brandName, L.brandName);
    if (typeof o.brandTagline === "string")
      patch.brandTagline = clip(o.brandTagline, L.brandTagline);
    if (typeof o.brandNarrative === "string")
      patch.brandNarrative = clip(o.brandNarrative, L.brandNarrative);
    if (typeof o.targetAudience === "string")
      patch.targetAudience = clip(o.targetAudience, L.targetAudience);
    if (typeof o.brandVoice === "string") {
      const v = coerceVoice(o.brandVoice);
      if (v) patch.brandVoice = v;
    }
    if (typeof o.visualIdentityRules === "string")
      patch.visualIdentityRules = clip(o.visualIdentityRules, L.visualIdentityRules);
    if (typeof o.typographyStyleId === "string") {
      const id = clip(o.typographyStyleId, 80);
      if (getAdTypographyStyle(id)) patch.typographyStyleId = id;
    }
    return patch;
  } catch {
    return {};
  }
}

function parseOneAction(
  row: unknown,
  latestUserImageCount: number
): MarketingAssistantAction | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const type = String(r.type ?? r.kind ?? "")
    .trim()
    .toLowerCase();
  if (type === "noop" || type === "none" || !type) return null;

  if (type === "update_brand") {
    let patch: MarketingAssistantBrandPatch = {};
    if (typeof r.brandPatchJson === "string") {
      patch = parseBrandPatchJson(r.brandPatchJson);
    } else if (r.brandPatch && typeof r.brandPatch === "object") {
      patch = parseBrandPatchJson(JSON.stringify(r.brandPatch));
    }
    if (Object.keys(patch).length === 0) return null;
    return { type: "update_brand", patch };
  }

  if (type === "add_inventory_product") {
    const name = clip(String(r.productName ?? r.name ?? ""), L.productName);
    if (!name) return null;
    const narrative = clip(
      String(r.productNarrative ?? r.narrative ?? ""),
      L.productNarrative
    );
    const specs = clip(String(r.productSpecs ?? r.specs ?? ""), L.productSpecs);
    let include = Boolean(r.includeLatestUserImage);
    if (include && latestUserImageCount < 1) include = false;
    return {
      type: "add_inventory_product",
      name,
      narrative,
      specs,
      includeLatestUserImage: include,
    };
  }

  return null;
}

export function sanitizeMarketingAssistantResult(
  raw: unknown,
  latestUserImageCount: number
): MarketingAssistantResult {
  if (!raw || typeof raw !== "object") {
    return { assistantMessage: "Invalid assistant response.", actions: [] };
  }
  const o = raw as Record<string, unknown>;
  const assistantMessage = clip(
    String(o.assistantMessage ?? ""),
    L.message
  );
  const list = Array.isArray(o.actions) ? o.actions : [];
  const actions: MarketingAssistantAction[] = [];
  for (const row of list.slice(0, MAX_ACTIONS)) {
    const a = parseOneAction(row, latestUserImageCount);
    if (a) actions.push(a);
  }
  return {
    assistantMessage:
      assistantMessage ||
      (actions.length ? "Done." : "I could not produce a safe reply."),
    actions,
  };
}
