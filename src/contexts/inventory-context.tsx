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

const STORAGE_KEY = "heroframe-inventory-products-v1";

export type InventoryProduct = {
  id: string;
  name: string;
  narrative: string;
  specs: string;
  /** Optional primary image as data URL (keep small for localStorage). */
  imageDataUrl: string | null;
  createdAt: number;
};

type InventoryContextValue = {
  products: InventoryProduct[];
  addProduct: (p: Omit<InventoryProduct, "id" | "createdAt">) => InventoryProduct;
  updateProduct: (id: string, patch: Partial<InventoryProduct>) => void;
  removeProduct: (id: string) => void;
  getProduct: (id: string) => InventoryProduct | undefined;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

function load(): InventoryProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const r = row as Record<string, unknown>;
        const id = typeof r.id === "string" ? r.id : "";
        const name = typeof r.name === "string" ? r.name : "";
        if (!id || !name) return null;
        return {
          id,
          name,
          narrative: typeof r.narrative === "string" ? r.narrative : "",
          specs: typeof r.specs === "string" ? r.specs : "",
          imageDataUrl:
            typeof r.imageDataUrl === "string" ? r.imageDataUrl : null,
          createdAt:
            typeof r.createdAt === "number" ? r.createdAt : Date.now(),
        } satisfies InventoryProduct;
      })
      .filter((x): x is InventoryProduct => x != null);
  } catch {
    return [];
  }
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<InventoryProduct[]>([]);

  useEffect(() => {
    setProducts(load());
  }, []);

  const persist = useCallback((next: InventoryProduct[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const addProduct = useCallback(
    (p: Omit<InventoryProduct, "id" | "createdAt">) => {
      const row: InventoryProduct = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setProducts((prev) => {
        const next = [row, ...prev];
        persist(next);
        return next;
      });
      return row;
    },
    [persist]
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<InventoryProduct>) => {
      setProducts((prev) => {
        const next = prev.map((x) => (x.id === id ? { ...x, ...patch } : x));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeProduct = useCallback(
    (id: string) => {
      setProducts((prev) => {
        const next = prev.filter((x) => x.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const getProduct = useCallback(
    (id: string) => products.find((x) => x.id === id),
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      addProduct,
      updateProduct,
      removeProduct,
      getProduct,
    }),
    [products, addProduct, updateProduct, removeProduct, getProduct]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
