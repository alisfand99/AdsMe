import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { BrandProvider } from "@/contexts/brand-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <BrandProvider>
      <AppShell>{children}</AppShell>
    </BrandProvider>
  );
}
