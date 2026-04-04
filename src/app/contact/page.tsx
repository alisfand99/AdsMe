import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact HeroFrame AI (placeholder).",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-xs" asChild>
          <Link href="/">← Home</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Placeholder — add a form, support email, or calendar link when you are
          ready to take inbound messages.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          For now, continue in the{" "}
          <Link href="/studio" className="text-primary underline-offset-4 hover:underline">
            studio
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
