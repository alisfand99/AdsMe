import { getAdTypographyStyle } from "@/lib/ad/typography-styles";
import {
  BRAND_VOICE_OPTIONS,
  type BrandVoice,
} from "@/lib/brand/brand-profile-types";

import type {
  MarketingAssistantAction,
  MarketingAssistantBrandPatch,
  MarketingAssistantCalendarChannel,
  MarketingAssistantResult,
} from "./types";

const MAX_ACTIONS = 12;
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
  webhookUrl: 2048,
  calendarTitle: 240,
  calendarNotes: 4000,
  scheduledAt: 80,
} as const;

const CALENDAR_CHANNELS: MarketingAssistantCalendarChannel[] = [
  "instagram",
  "linkedin",
  "facebook",
  "tiktok",
];

export type SanitizeAssistantOptions = {
  latestUserImageCount: number;
  validInventoryProductIds: Set<string>;
  validCalendarPostIds: Set<string>;
};

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

function coerceChannel(
  raw: string | undefined
): MarketingAssistantCalendarChannel | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  return CALENDAR_CHANNELS.includes(v as MarketingAssistantCalendarChannel)
    ? (v as MarketingAssistantCalendarChannel)
    : undefined;
}

function coerceCalendarStatus(
  raw: string | undefined
): "draft" | "scheduled" | "published" | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  if (v === "draft" || v === "scheduled" || v === "published") return v;
  return undefined;
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
  options: SanitizeAssistantOptions
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
    if (include && options.latestUserImageCount < 1) include = false;
    return {
      type: "add_inventory_product",
      name,
      narrative,
      specs,
      includeLatestUserImage: include,
    };
  }

  if (type === "update_inventory_product") {
    const productId = String(r.productId ?? "").trim();
    if (!productId || !options.validInventoryProductIds.has(productId))
      return null;
    const name =
      typeof r.productName === "string"
        ? clip(r.productName, L.productName)
        : typeof r.name === "string"
          ? clip(r.name, L.productName)
          : undefined;
    const narrative =
      typeof r.productNarrative === "string"
        ? clip(r.productNarrative, L.productNarrative)
        : typeof r.narrative === "string"
          ? clip(r.narrative, L.productNarrative)
          : undefined;
    const specs =
      typeof r.productSpecs === "string"
        ? clip(r.productSpecs, L.productSpecs)
        : typeof r.specs === "string"
          ? clip(r.specs, L.productSpecs)
          : undefined;
    let include = Boolean(r.includeLatestUserImage);
    if (include && options.latestUserImageCount < 1) include = false;
    const clearImage = Boolean(r.clearProductImage ?? r.clearImage);
    if (
      name === undefined &&
      narrative === undefined &&
      specs === undefined &&
      !include &&
      !clearImage
    ) {
      return null;
    }
    return {
      type: "update_inventory_product",
      productId,
      name,
      narrative,
      specs,
      includeLatestUserImage: include || undefined,
      clearImage: clearImage || undefined,
    };
  }

  if (type === "remove_inventory_product") {
    const productId = String(r.productId ?? "").trim();
    if (!productId || !options.validInventoryProductIds.has(productId))
      return null;
    return { type: "remove_inventory_product", productId };
  }

  if (type === "set_marketing_webhook") {
    const url = clip(
      String(r.webhookUrl ?? r.n8nWebhookUrl ?? r.url ?? ""),
      L.webhookUrl
    );
    if (!/^https?:\/\//i.test(url)) return null;
    return { type: "set_marketing_webhook", url };
  }

  if (type === "add_calendar_post") {
    const title = clip(String(r.calendarTitle ?? r.title ?? ""), L.calendarTitle);
    const channel = coerceChannel(
      String(r.calendarChannel ?? r.channel ?? "")
    );
    const scheduledAt = clip(
      String(r.calendarScheduledAt ?? r.scheduledAt ?? ""),
      L.scheduledAt
    );
    if (!title || !channel || !scheduledAt) return null;
    const status =
      coerceCalendarStatus(String(r.calendarStatus ?? r.status ?? "")) ??
      "draft";
    const notes = clip(
      String(r.calendarNotes ?? r.notes ?? ""),
      L.calendarNotes
    );
    return {
      type: "add_calendar_post",
      title,
      channel,
      scheduledAt,
      status,
      notes,
    };
  }

  if (type === "update_calendar_post") {
    const postId = String(r.postId ?? "").trim();
    if (!postId || !options.validCalendarPostIds.has(postId)) return null;
    const title =
      typeof r.calendarTitle === "string"
        ? clip(r.calendarTitle, L.calendarTitle)
        : typeof r.title === "string"
          ? clip(r.title, L.calendarTitle)
          : undefined;
    const channel = coerceChannel(
      String(r.calendarChannel ?? r.channel ?? "")
    );
    const scheduledAt =
      typeof r.calendarScheduledAt === "string"
        ? clip(r.calendarScheduledAt, L.scheduledAt)
        : typeof r.scheduledAt === "string"
          ? clip(r.scheduledAt, L.scheduledAt)
          : undefined;
    const status = coerceCalendarStatus(
      String(r.calendarStatus ?? r.status ?? "")
    );
    let notes: string | undefined;
    if (typeof r.calendarNotes === "string")
      notes = clip(r.calendarNotes, L.calendarNotes);
    else if (typeof r.notes === "string") notes = clip(r.notes, L.calendarNotes);
    if (
      title === undefined &&
      channel === undefined &&
      scheduledAt === undefined &&
      status === undefined &&
      notes === undefined
    ) {
      return null;
    }
    return {
      type: "update_calendar_post",
      postId,
      title,
      channel,
      scheduledAt,
      status,
      notes,
    };
  }

  if (type === "remove_calendar_post") {
    const postId = String(r.postId ?? "").trim();
    if (!postId || !options.validCalendarPostIds.has(postId)) return null;
    return { type: "remove_calendar_post", postId };
  }

  return null;
}

export function sanitizeMarketingAssistantResult(
  raw: unknown,
  options: SanitizeAssistantOptions
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
    const a = parseOneAction(row, options);
    if (a) actions.push(a);
  }
  return {
    assistantMessage:
      assistantMessage ||
      (actions.length ? "Proposed changes are ready — review and tap Apply." : "I could not produce a safe reply."),
    actions,
  };
}
