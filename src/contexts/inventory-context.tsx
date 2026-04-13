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
  /** Optional SKU or internal code */
  sku: string;
  narrative: string;
  specs: string;
  /** Long-form notes: pricing hints, variants, links… */
  notes: string;
  /** Optional primary / cover image (Studio & list thumbnail prefer this). */
  imageDataUrl: string | null;
  /** Additional reference shots (data URLs; keep files reasonably small). */
  galleryDataUrls: string[];
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
        const galleryRaw = r.galleryDataUrls;
        const galleryDataUrls =
          Array.isArray(galleryRaw) && galleryRaw.length
            ? galleryRaw.filter(
                (u): u is string => typeof u === "string" && u.startsWith("data:image/")
              )
            : [];
        return {
          id,
          name,
          sku: typeof r.sku === "string" ? r.sku : "",
          narrative: typeof r.narrative === "string" ? r.narrative : "",
          specs: typeof r.specs === "string" ? r.specs : "",
          notes: typeof r.notes === "string" ? r.notes : "",
          imageDataUrl:
            typeof r.imageDataUrl === "string" ? r.imageDataUrl : null,
          galleryDataUrls,
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
