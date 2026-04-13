import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { BrandProvider } from "@/contexts/brand-context";
import { InventoryProvider } from "@/contexts/inventory-context";
import { MarketingProvider } from "@/contexts/marketing-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <BrandProvider>
      <InventoryProvider>
        <MarketingProvider>
          <AppShell>{children}</AppShell>
        </MarketingProvider>
      </InventoryProvider>
    </BrandProvider>
  );
}
