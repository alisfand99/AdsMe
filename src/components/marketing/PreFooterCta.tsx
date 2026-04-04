"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PreFooterCta() {
  return (
    <motion.section
      id="cta"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-20 max-w-5xl"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-950 p-8 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] sm:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-3xl"
          aria-hidden
        />
        <div className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Next step
          </p>
          <h2 className="mx-auto mt-2 max-w-xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Put your product in the frame — then let the campaign catch up.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            No credit card wall in this build: jump into the studio and see how
            direction, layout, and iteration fit together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="gap-2 rounded-full px-8" asChild>
              <Link href="/studio">
                Launch studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="glass" className="rounded-full px-6" asChild>
              <Link href="/#features">Back to features</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
