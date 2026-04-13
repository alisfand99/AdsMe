import type { Metadata } from "next";

import { InventoryView } from "./inventory-view";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Product catalog and narratives for HeroFrame AI.",
};

export default function InventoryPage() {
  return <InventoryView />;
}
