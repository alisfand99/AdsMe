import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms",
  description: "HeroFrame AI — terms of use (placeholder).",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-xs" asChild>
          <Link href="/">← Home</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Terms of use</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Placeholder — terms of service will be published here for any public or
          commercial release.
        </p>
      </div>
    </div>
  );
}
