"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Layers,
  MessageSquare,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";

import { SiteHeaderLogo } from "@/components/brand/SiteHeaderLogo";
import { HeroMarketingVisual } from "@/components/marketing/HeroMarketingVisual";
import { PreFooterCta } from "@/components/marketing/PreFooterCta";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const features = [
  {
    icon: Wand2,
    title: "Agentic upload",
    body: "Gemini vision analyzes color, material, and category — then proposes three creative directions.",
  },
  {
    icon: Sparkles,
    title: "Prompt expansion",
    body: 'Type "make it luxury" — Gemini expands it into a high-fidelity image brief.',
  },
  {
    icon: Layers,
    title: "Product-safe generation",
    body: "Google image pipeline: creative backgrounds while preserving product integrity.",
  },
  {
    icon: MessageSquare,
    title: "Conversational iteration",
    body: "Chat to nudge lighting, copy, and parameters with full history-aware stubs.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-fuchsia-600/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(63 63 70 / 0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(63 63 70 / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <SiteHeaderLogo />
        <nav className="flex items-center gap-2">
          <Button size="sm" className="text-xs gap-1" asChild>
            <Link href="/studio">
              Start creating
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <motion.div
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI product ad studio
          </motion.p>
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
          >
            Product in frame.{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-200 bg-clip-text text-transparent">
              Campaign in flow
            </span>
            .
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mx-auto mt-6 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Less prompt-hacking, more art direction: structured controls,
            iteration history, and outputs tuned for commercial layouts.
          </motion.p>
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button size="lg" className="gap-2 rounded-full px-8" asChild>
              <Link href="/studio">
                Launch studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="glass"
              className="rounded-full px-6"
              asChild
            >
              <a href="#features">Explore features</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.35,
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <HeroMarketingVisual />
        </motion.div>

        <Separator className="my-20 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <section id="features" className="mx-auto max-w-5xl scroll-mt-24">
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Product pillars
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-2xl font-semibold tracking-tight">
            Built for agentic creative workflows
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group rounded-xl border border-white/10 bg-zinc-900/30 p-5 backdrop-blur-md transition-colors hover:border-white/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <PreFooterCta />
      </main>

      <SiteFooter />
    </div>
  );
}
