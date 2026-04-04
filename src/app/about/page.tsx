import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "HeroFrame AI — product overview and the tools used to build this experience.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-xs" asChild>
          <Link href="/">← Home</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">About HeroFrame AI</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          HeroFrame AI is a product ad studio experiment: structured creative
          controls, vision-backed analysis, and chat-style iteration on a dark,
          layout-focused canvas.
        </p>

        <h2 className="mt-12 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Built with
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-foreground/90">
          <li>
            <span className="text-muted-foreground">Framework:</span> Next.js
            14 (App Router)
          </li>
          <li>
            <span className="text-muted-foreground">UI:</span> Tailwind CSS,
            shadcn-style primitives, Framer Motion
          </li>
          <li>
            <span className="text-muted-foreground">Agent &amp; vision:</span>{" "}
            Gemini (Google AI) for analysis, prompt expansion, and conversational
            flows
          </li>
          <li>
            <span className="text-muted-foreground">Images:</span> optional
            Google image pipeline / Replicate where configured
          </li>
        </ul>

        <p className="mt-10 text-xs text-muted-foreground">
          This page exists so the marketing site stays user-facing; technical
          credits live here instead of the main footer.
        </p>

        <div className="mt-10">
          <Button asChild>
            <Link href="/studio">Open studio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
