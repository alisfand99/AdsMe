import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const productLinks = [
  { href: "/studio", label: "Studio" },
  { href: "/#features", label: "Features" },
  { href: "/about", label: "About & stack" },
] as const;

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative z-10 border-t border-white/10 bg-zinc-950/80",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-block text-lg font-semibold tracking-tight text-foreground transition hover:text-primary"
            >
              HeroFrame<span className="text-muted-foreground"> AI</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Product-first ad layouts, agent-assisted briefs, and iteration
              you can ship — built for teams who care how the frame looks.
            </p>
            <Button size="sm" className="mt-6 gap-1.5 rounded-full" asChild>
              <Link href="/studio">
                Start creating
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:col-span-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Product
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {productLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-foreground/90 transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Legal
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {legalLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-foreground/90 transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:col-span-2 lg:col-span-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Ready when you are
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Open the studio, drop a product shot, and iterate with the agent
                on your timeline.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
              <Link href="/studio">Launch studio</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} HeroFrame AI. All rights reserved.
          </p>
          <p className="sm:text-right">
            Stack &amp; integrations detailed on{" "}
            <Link href="/about" className="text-foreground/80 underline-offset-4 transition hover:text-primary hover:underline">
              About
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
