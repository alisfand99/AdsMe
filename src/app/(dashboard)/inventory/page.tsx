import type { Metadata } from "next";
import { Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Product catalog and narratives — coming soon.",
};

export default function InventoryPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950 px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-white/10 bg-zinc-950/70 p-10 text-center shadow-xl backdrop-blur-xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-primary">
          <Package className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Product catalog with specs and narratives will live here. This module is
          on the roadmap for the Marketing OS rollout.
        </p>
      </div>
    </div>
  );
}
