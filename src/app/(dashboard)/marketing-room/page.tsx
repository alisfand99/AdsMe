import type { Metadata } from "next";
import { Megaphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing Room",
  description: "Distribution, integrations, and calendar — coming soon.",
};

export default function MarketingRoomPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950 px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-white/10 bg-zinc-950/70 p-10 text-center shadow-xl backdrop-blur-xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-primary">
          <Megaphone className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Marketing Room</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Distribution, n8n integrations, and your social calendar will anchor
          here. Shipping in a later pillar of the Marketing OS.
        </p>
      </div>
    </div>
  );
}
