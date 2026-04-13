"use client";

import {
  CalendarDays,
  Megaphone,
  Radio,
  Webhook,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type CalendarPost,
  type MarketingChannelId,
  useMarketing,
} from "@/contexts/marketing-context";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
  { id: "channels" as const, label: "Channels", icon: Radio },
  { id: "integrations" as const, label: "Integrations", icon: Webhook },
];

const CHANNELS: { id: MarketingChannelId; label: string; body: string }[] = [
  {
    id: "instagram",
    label: "Instagram",
    body: "Static + Reels cover exports — connect Meta later.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    body: "B2B thought leadership and launch posts.",
  },
  {
    id: "facebook",
    label: "Facebook",
    body: "Community and paid reach.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    body: "Short hooks and native captions.",
  },
];

export function MarketingRoomView() {
  const { posts, settings, addPost, removePost, setSettings } = useMarketing();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("calendar");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [channel, setChannel] = useState<MarketingChannelId>("instagram");
  const [notes, setNotes] = useState("");
  const [webhookBusy, setWebhookBusy] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState<string | null>(null);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      ),
    [posts]
  );

  const onAddPost = () => {
    const t = title.trim();
    if (!t || !scheduledAt) return;
    addPost({
      title: t,
      channel,
      scheduledAt,
      status: "draft",
      notes: notes.trim() || undefined,
    });
    setTitle("");
    setScheduledAt("");
    setNotes("");
  };

  const testWebhook = async () => {
    const url = settings.n8nWebhookUrl.trim();
    setWebhookMsg(null);
    if (!url.startsWith("http")) {
      setWebhookMsg("Enter a valid https URL to test.");
      return;
    }
    setWebhookBusy(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "heroframe-marketing-room",
          event: "ping",
          at: Date.now(),
        }),
      });
      setSettings({ lastWebhookTestAt: Date.now() });
      setWebhookMsg(
        res.ok
          ? `OK (${res.status}) — check your n8n execution log.`
          : `Responded ${res.status} — workflow may still have run depending on n8n.`
      );
    } catch (e) {
      setWebhookMsg(
        e instanceof Error ? e.message : "Request failed (CORS or network)."
      );
    } finally {
      setWebhookBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950">
      <header className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-5xl items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-primary">
            <Megaphone className="h-5 w-5" strokeWidth={1.85} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Marketing Room
            </h1>
            <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
              Calendar, channels, and n8n hand-offs — local prototype for the
              distribution pillar.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-black/25 p-1 backdrop-blur-md">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition-colors sm:text-sm",
                  active
                    ? "bg-primary/20 text-primary shadow-inner"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === "calendar" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <section className="glass-panel h-fit rounded-2xl p-5">
              <h2 className="mb-3 text-sm font-semibold">Schedule draft</h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Spring launch hero"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Date &amp; time
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) =>
                      setChannel(e.target.value as MarketingChannelId)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Hook ideas, CTA, link…"
                    className="min-h-[72px] resize-y text-sm"
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={onAddPost}
                  disabled={!title.trim() || !scheduledAt}
                >
                  Add to calendar
                </Button>
              </div>
            </section>

            <section className="glass-panel min-h-[280px] rounded-2xl p-5">
              <h2 className="mb-3 text-sm font-semibold">
                Upcoming ({sortedPosts.length})
              </h2>
              {sortedPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing scheduled — add a draft or wire Studio exports here later.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sortedPosts.map((row: CalendarPost) => (
                    <li
                      key={row.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {row.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {row.channel} ·{" "}
                          {new Date(row.scheduledAt).toLocaleString()} ·{" "}
                          {row.status}
                        </p>
                        {row.notes ? (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {row.notes}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => removePost(row.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}

        {tab === "channels" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {CHANNELS.map((c) => (
              <div
                key={c.id}
                className="glass-panel rounded-2xl p-5 transition hover:border-primary/25"
              >
                <p className="text-sm font-semibold">{c.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                  OAuth &amp; posting API — roadmap
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "integrations" ? (
          <section className="glass-panel max-w-xl rounded-2xl p-5 sm:p-6">
            <h2 className="mb-1 text-sm font-semibold">n8n webhook</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              POST JSON payloads to your workflow when you wire automations from
              Studio or this room.
            </p>
            <Input
              value={settings.n8nWebhookUrl}
              onChange={(e) =>
                setSettings({ n8nWebhookUrl: e.target.value })
              }
              placeholder="https://your-n8n.example/webhook/…"
              className="mb-3"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={webhookBusy}
                onClick={() => void testWebhook()}
              >
                {webhookBusy ? "Sending…" : "Send test ping"}
              </Button>
            </div>
            {settings.lastWebhookTestAt ? (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Last test:{" "}
                {new Date(settings.lastWebhookTestAt).toLocaleString()}
              </p>
            ) : null}
            {webhookMsg ? (
              <p className="mt-2 text-xs text-foreground/90">{webhookMsg}</p>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
