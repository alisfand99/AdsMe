"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BRAND_VOICE_OPTIONS,
  type BrandProfile,
  type BrandVoice,
  defaultBrandProfile,
} from "@/lib/brand/brand-profile-types";
import { getAdTypographyStyle } from "@/lib/ad/typography-styles";

const STORAGE_KEY = "heroframe-brand-profile-v2";
const LEGACY_STORAGE_KEY = "heroframe-brand-profile-v1";

export type { BrandProfile, BrandVoice };
export { BRAND_VOICE_OPTIONS };

function coerceVoice(v: unknown): BrandVoice {
  if (
    typeof v === "string" &&
    BRAND_VOICE_OPTIONS.includes(v as BrandVoice)
  ) {
    return v as BrandVoice;
  }
  return defaultBrandProfile.brandVoice;
}

function parseStored(json: string | null): BrandProfile | null {
  if (!json) return null;
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    if (typeof raw !== "object" || raw === null) return null;
    const typoId =
      typeof raw.typographyStyleId === "string" &&
      getAdTypographyStyle(raw.typographyStyleId)
        ? raw.typographyStyleId
        : defaultBrandProfile.typographyStyleId;
    return {
      ...defaultBrandProfile,
      brandName: typeof raw.brandName === "string" ? raw.brandName : "",
      brandTagline: typeof raw.brandTagline === "string" ? raw.brandTagline : "",
      brandNarrative:
        typeof raw.brandNarrative === "string" ? raw.brandNarrative : "",
      targetAudience:
        typeof raw.targetAudience === "string" ? raw.targetAudience : "",
      brandVoice: coerceVoice(raw.brandVoice),
      visualIdentityRules:
        typeof raw.visualIdentityRules === "string"
          ? raw.visualIdentityRules
          : "",
      typographyStyleId: typoId,
    };
  } catch {
    return null;
  }
}

type BrandContextValue = {
  profile: BrandProfile;
  saveProfile: (next: BrandProfile) => void;
  patchProfile: (partial: Partial<BrandProfile>) => void;
};

const BrandContext = createContext<BrandContextValue | null>(null);

function readInitialProfile(): BrandProfile {
  if (typeof window === "undefined") return defaultBrandProfile;
  const cur = parseStored(localStorage.getItem(STORAGE_KEY));
  if (cur) return cur;
  const legacy = parseStored(localStorage.getItem(LEGACY_STORAGE_KEY));
  if (legacy) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    } catch {
      /* ignore */
    }
    return legacy;
  }
  return defaultBrandProfile;
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BrandProfile>(defaultBrandProfile);

  useEffect(() => {
    setProfile(readInitialProfile());
  }, []);

  const persist = useCallback((next: BrandProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }, []);

  const saveProfile = useCallback(
    (next: BrandProfile) => {
      setProfile(next);
      persist(next);
    },
    [persist]
  );

  const patchProfile = useCallback(
    (partial: Partial<BrandProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...partial };
        if (
          partial.typographyStyleId != null &&
          !getAdTypographyStyle(partial.typographyStyleId)
        ) {
          next.typographyStyleId = prev.typographyStyleId;
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      profile,
      saveProfile,
      patchProfile,
    }),
    [profile, saveProfile, patchProfile]
  );

  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
