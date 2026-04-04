import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy",
  description: "HeroFrame AI — privacy policy (placeholder).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-xs" asChild>
          <Link href="/">← Home</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          This is a placeholder page. A full privacy policy will go here before
          any production launch or data-heavy features.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Questions? Use the{" "}
          <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
            contact
          </Link>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
