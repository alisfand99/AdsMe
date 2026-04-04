/**
 * Lightweight CSS-only studio preview for the marketing homepage (no images, no R3F).
 */
export function HeroStudioMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
        <span className="h-2 w-2 rounded-full bg-red-500/75 sm:h-2.5 sm:w-2.5" />
        <span className="h-2 w-2 rounded-full bg-amber-400/75 sm:h-2.5 sm:w-2.5" />
        <span className="h-2 w-2 rounded-full bg-emerald-500/75 sm:h-2.5 sm:w-2.5" />
        <span className="ml-2 font-mono text-[9px] text-muted-foreground sm:text-[10px]">
          heroframe / studio
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Left — assets */}
        <aside className="hidden border-r border-white/10 p-3 md:block md:p-4">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Assets
          </p>
          <div className="mb-3 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-2 py-3 text-center">
            <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5">
              <span className="text-[10px] text-muted-foreground">↑</span>
            </div>
            <p className="text-[8px] text-muted-foreground">Drop product</p>
          </div>
          <p className="mb-1.5 text-[8px] font-medium uppercase tracking-wide text-muted-foreground/80">
            Visual style
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { a: "from-violet-500/40", b: "to-fuchsia-900/50", l: "Noir" },
              { a: "from-sky-500/30", b: "to-zinc-900/60", l: "Clean" },
              { a: "from-amber-500/35", b: "to-stone-900/55", l: "Warm" },
              { a: "from-emerald-500/25", b: "to-zinc-950/70", l: "Shelf" },
            ].map((t) => (
              <div
                key={t.l}
                className="overflow-hidden rounded-md border border-white/10 bg-black/20"
              >
                <div
                  className={`aspect-[4/5] bg-gradient-to-br ${t.a} ${t.b}`}
                />
                <p className="px-1 py-1 text-[7px] font-medium text-foreground/90">
                  {t.l}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* Center — canvas */}
        <div className="relative flex min-h-[240px] flex-col items-center justify-center border-white/10 p-4 sm:min-h-[280px] sm:p-6 md:border-r">
          <div className="relative w-full max-w-[220px] overflow-hidden rounded-xl border border-white/12 bg-gradient-to-br from-zinc-800/90 via-zinc-900 to-zinc-950 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(139,92,246,0.12),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_90%,rgba(244,114,182,0.08),transparent)]" />

            <div className="relative flex flex-col items-center px-4 pb-5 pt-6">
              <div className="mb-3 text-center">
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-violet-200/70">
                  Lumen &amp; Co.
                </p>
                <div className="mx-auto mt-1.5 h-1.5 w-24 rounded-full bg-white/10" />
                <div className="mx-auto mt-1 h-1 w-16 rounded-full bg-white/[0.06]" />
              </div>

              {/* CSS product — minimal bottle */}
              <div className="relative my-2 flex flex-col items-center">
                <div className="h-2 w-5 rounded-t-sm bg-gradient-to-b from-zinc-400/50 to-zinc-500/40" />
                <div className="h-24 w-14 rounded-b-2xl rounded-t-md bg-gradient-to-b from-amber-900/85 via-amber-950/90 to-zinc-950 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.4)] ring-1 ring-white/10" />
                <div className="absolute bottom-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/15 to-transparent blur-sm" />
              </div>

              <p className="mt-2 text-center text-[7px] font-medium uppercase tracking-widest text-muted-foreground">
                Editorial luxury
              </p>
            </div>
          </div>
          <p className="mt-3 text-[9px] text-muted-foreground/80">Live canvas</p>
        </div>

        {/* Right — agent */}
        <aside className="hidden flex-col p-3 md:flex md:p-4">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Agent
          </p>
          <div className="mb-2 rounded-lg border border-white/10 bg-black/25 p-2">
            <p className="mb-1 text-[7px] uppercase tracking-wide text-primary/90">
              Brief
            </p>
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded bg-white/10" />
              <div className="h-1.5 w-[92%] rounded bg-white/[0.07]" />
              <div className="h-1.5 w-[78%] rounded bg-white/[0.06]" />
            </div>
          </div>
          <div className="mb-2 flex gap-1">
            <span className="rounded-md bg-primary/20 px-2 py-1 text-[7px] font-medium text-primary">
              Expand
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[7px] text-muted-foreground">
              Generate
            </span>
          </div>
          <div className="flex-1 rounded-lg border border-white/10 bg-black/20 p-2">
            <p className="mb-1.5 text-[7px] font-medium uppercase tracking-wide text-muted-foreground">
              Iteration
            </p>
            <div className="space-y-1.5">
              <div className="ml-2 rounded-md border border-white/10 bg-violet-500/10 px-2 py-1.5 text-[7px] leading-snug text-muted-foreground">
                Pull key light left…
              </div>
              <div className="mr-2 rounded-md border border-white/5 bg-white/[0.04] px-2 py-1.5 text-[7px] leading-snug text-muted-foreground/80">
                Updated render v3
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              <div className="h-6 flex-1 rounded-md border border-white/10 bg-white/[0.03]" />
              <div className="h-6 w-6 rounded-md border border-primary/30 bg-primary/10" />
            </div>
          </div>
        </aside>

        {/* Mobile: slim agent strip */}
        <div className="col-span-full border-t border-white/10 px-4 py-2 md:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[7px] text-primary">
                Agent
              </span>
              <span className="rounded border border-white/10 px-1.5 py-0.5 text-[7px] text-muted-foreground">
                Chat
              </span>
            </div>
            <div className="h-1 flex-1 max-w-[120px] rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
