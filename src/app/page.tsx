"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Layers,
  MessageSquare,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";

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
    body: "Replicate-ready pipeline placeholder: creative backgrounds while preserving product integrity.",
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
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
            <Zap className="h-4 w-4 text-primary" />
          </span>
          <span className="text-sm font-semibold tracking-tight">AdsMe</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/studio">Open studio</Link>
          </Button>
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
            AI Product Ad Creative Studio
          </motion.p>
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
          >
            Canvas-first ads that{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-200 bg-clip-text text-transparent">
              feel like Flair
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
            Upload a product, let the agent propose directions, expand prompts, and
            iterate in chat — polished dark UI, glass panels, and motion throughout.
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
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-3 font-mono text-[10px] text-muted-foreground">
                adsme / studio — preview
              </span>
            </div>
            <div className="grid gap-0 md:grid-cols-[1fr_1.4fr_1fr]">
              <div className="hidden border-r border-white/10 p-4 md:block">
                <div className="mb-3 h-3 w-20 rounded shimmer-bg" />
                <div className="space-y-2">
                  <div className="h-16 rounded-lg border border-white/10 bg-white/[0.03]" />
                  <div className="h-14 rounded-lg border border-white/10 bg-white/[0.03]" />
                  <div className="h-14 rounded-lg border border-white/10 bg-white/[0.03]" />
                </div>
              </div>
              <div className="flex min-h-[280px] items-center justify-center border-white/10 p-8 md:border-r">
                <div className="relative aspect-[4/5] w-full max-w-[200px] rounded-xl border border-white/15 bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-xl">
                  <div className="absolute inset-4 rounded-lg border border-dashed border-white/20" />
                  <Sparkles className="absolute bottom-4 right-4 h-5 w-5 text-primary/80" />
                </div>
              </div>
              <div className="hidden p-4 md:block">
                <div className="mb-3 h-3 w-24 rounded shimmer-bg" />
                <div className="h-24 rounded-lg border border-white/10 bg-white/[0.03]" />
                <div className="mt-2 h-20 rounded-lg border border-white/10 bg-white/[0.03]" />
              </div>
            </div>
          </div>
        </motion.div>

        <Separator
          id="features"
          className="my-20 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        <section className="mx-auto max-w-5xl">
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
      </main>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-muted-foreground">
        <p>AdsMe — Next.js 14, Tailwind, shadcn-style UI, Framer Motion.</p>
        <p className="mt-1">Gemini (Google AI) for agent logic; Replicate for image generation.</p>
      </footer>
    </div>
  );
}
