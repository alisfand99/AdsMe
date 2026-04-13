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

const STORAGE_KEY = "heroframe-marketing-room-v1";

export type MarketingChannelId = "instagram" | "linkedin" | "facebook" | "tiktok";

export type CalendarPost = {
  id: string;
  title: string;
  channel: MarketingChannelId;
  scheduledAt: string;
  status: "draft" | "scheduled" | "published";
  notes?: string;
};

export type MarketingSettings = {
  n8nWebhookUrl: string;
  lastWebhookTestAt: number | null;
};

type MarketingState = {
  posts: CalendarPost[];
  settings: MarketingSettings;
};

type MarketingContextValue = MarketingState & {
  addPost: (p: Omit<CalendarPost, "id">) => CalendarPost;
  updatePost: (id: string, patch: Partial<CalendarPost>) => void;
  removePost: (id: string) => void;
  setSettings: (s: Partial<MarketingSettings>) => void;
};

const defaultSettings: MarketingSettings = {
  n8nWebhookUrl: "",
  lastWebhookTestAt: null,
};

const emptyState: MarketingState = {
  posts: [],
  settings: defaultSettings,
};

const MarketingContext = createContext<MarketingContextValue | null>(null);

function load(): MarketingState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const v = JSON.parse(raw) as Partial<MarketingState>;
    return {
      posts: Array.isArray(v.posts) ? v.posts : [],
      settings: {
        ...defaultSettings,
        ...(typeof v.settings === "object" && v.settings ? v.settings : {}),
      },
    };
  } catch {
    return emptyState;
  }
}

function persist(state: MarketingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function MarketingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MarketingState>(emptyState);

  useEffect(() => {
    setState(load());
  }, []);

  const commit = useCallback((updater: (prev: MarketingState) => MarketingState) => {
    setState((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, []);

  const addPost = useCallback(
    (p: Omit<CalendarPost, "id">) => {
      const row: CalendarPost = { ...p, id: crypto.randomUUID() };
      commit((prev) => ({
        ...prev,
        posts: [row, ...prev.posts],
      }));
      return row;
    },
    [commit]
  );

  const updatePost = useCallback(
    (id: string, patch: Partial<CalendarPost>) => {
      commit((prev) => ({
        ...prev,
        posts: prev.posts.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
    },
    [commit]
  );

  const removePost = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        posts: prev.posts.filter((x) => x.id !== id),
      }));
    },
    [commit]
  );

  const setSettings = useCallback(
    (patch: Partial<MarketingSettings>) => {
      commit((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
      }));
    },
    [commit]
  );

  const value = useMemo(
    () => ({
      ...state,
      addPost,
      updatePost,
      removePost,
      setSettings,
    }),
    [state, addPost, updatePost, removePost, setSettings]
  );

  return (
    <MarketingContext.Provider value={value}>
      {children}
    </MarketingContext.Provider>
  );
}

export function useMarketing() {
  const ctx = useContext(MarketingContext);
  if (!ctx) throw new Error("useMarketing must be used within MarketingProvider");
  return ctx;
}
