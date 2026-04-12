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

const STORAGE_KEY = "heroframe-brand-profile-v1";

export const BRAND_VOICE_OPTIONS = [
  "professional",
  "playful",
  "luxury",
  "minimalist",
  "bold",
] as const;

export type BrandVoice = (typeof BRAND_VOICE_OPTIONS)[number];

export type BrandProfile = {
  brandName: string;
  brandNarrative: string;
  targetAudience: string;
  brandVoice: BrandVoice;
  visualIdentityRules: string;
};

const defaultProfile: BrandProfile = {
  brandName: "",
  brandNarrative: "",
  targetAudience: "",
  brandVoice: "professional",
  visualIdentityRules: "",
};

function parseStored(json: string | null): BrandProfile | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json) as Partial<BrandProfile>;
    if (typeof v !== "object" || v === null) return null;
    const voice = BRAND_VOICE_OPTIONS.includes(v.brandVoice as BrandVoice)
      ? (v.brandVoice as BrandVoice)
      : defaultProfile.brandVoice;
    return {
      brandName: typeof v.brandName === "string" ? v.brandName : "",
      brandNarrative: typeof v.brandNarrative === "string" ? v.brandNarrative : "",
      targetAudience: typeof v.targetAudience === "string" ? v.targetAudience : "",
      brandVoice: voice,
      visualIdentityRules:
        typeof v.visualIdentityRules === "string" ? v.visualIdentityRules : "",
    };
  } catch {
    return null;
  }
}

type BrandContextValue = {
  profile: BrandProfile;
  saveProfile: (next: BrandProfile) => void;
};

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BrandProfile>(defaultProfile);
  useEffect(() => {
    const stored = parseStored(
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    );
    if (stored) setProfile(stored);
  }, []);

  const saveProfile = useCallback((next: BrandProfile) => {
    setProfile(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }, []);

  const value = useMemo(
    () => ({
      profile,
      saveProfile,
    }),
    [profile, saveProfile]
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
