"use client";

import type { LucideIcon } from "lucide-react";
import {
  Fingerprint,
  Menu,
  Megaphone,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { SiteHeaderLogo } from "@/components/brand/SiteHeaderLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV: NavItem[] = [
  { href: "/brand", label: "Brand", icon: Fingerprint },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/studio", label: "Studio", icon: Wand2 },
  { href: "/marketing-room", label: "Marketing Room", icon: Megaphone },
];

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-2",
        active
          ? "border-primary/35 bg-primary/15 text-primary shadow-[0_0_24px_-8px_hsl(var(--primary)/0.5)]"
          : "text-muted-foreground hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-transform",
          active && "scale-105",
          !active && "group-hover:text-foreground"
        )}
        strokeWidth={active ? 2.25 : 1.85}
      />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentTitle = useMemo(() => {
    const hit = NAV.find(
      (n) => pathname === n.href || pathname.startsWith(`${n.href}/`)
    );
    return hit?.label ?? "Workspace";
  }, [pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen w-full bg-zinc-950 text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative z-30 hidden shrink-0 flex-col border-r border-white/10 bg-zinc-950/85 shadow-[4px_0_32px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:flex",
          collapsed ? "w-[76px]" : "w-[260px]"
        )}
      >
        <div className="flex h-[52px] shrink-0 items-center border-b border-white/10 px-2.5">
          {!collapsed ? (
            <SiteHeaderLogo className="min-w-0 [&_img]:h-7 [&_img]:max-w-[200px]" />
          ) : (
            <Link
              href="/"
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary ring-offset-zinc-950 transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              aria-label="HeroFrame AI — Home"
              title="Home"
            >
              <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2 pt-3" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="border-t border-white/10 p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "w-full justify-start gap-2 text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[200] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(300px,88vw)] flex-col border-r border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
            <div className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3">
              <span className="text-sm font-semibold tracking-tight">
                Menu
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                onClick={closeMobile}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
              aria-label="Main"
            >
              {NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={false}
                  onNavigate={closeMobile}
                />
              ))}
            </nav>
            <div className="border-t border-white/10 p-3">
              <Link
                href="/"
                onClick={closeMobile}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Marketing site
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar — drawer avoids clashing with Studio bottom nav */}
        <header className="sticky top-0 z-[90] flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-zinc-950/90 px-2 shadow-lg backdrop-blur-xl lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[13px] font-semibold tracking-tight">
              {currentTitle}
            </p>
          </div>
          <div className="flex min-w-0 max-w-[140px] shrink-0 justify-end">
            <SiteHeaderLogo className="[&_img]:h-6 [&_img]:max-w-[min(100%,132px)]" />
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
