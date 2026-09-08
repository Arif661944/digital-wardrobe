"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Heart,
  LayoutGrid,
  Plus,
  Settings,
  Shirt,
  Sparkles,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/wardrobe", label: "My Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Sparkles },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, desktopOnly: true },
  { href: "/add", label: "Add Item", icon: Plus },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = NAV.filter(
  (item) => item.href !== "/settings" && !item.desktopOnly,
);

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-foreground/6 bg-[#f6f1e8]/80 px-6 py-8 backdrop-blur-xl lg:flex">
        <Link href="/" className="mb-10">
          <p className="text-[11px] tracking-[0.32em] text-muted-foreground uppercase">
            Private atelier
          </p>
          <h1 className="font-heading mt-1 text-4xl tracking-tight">{APP_NAME}</h1>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-foreground text-background shadow-sm"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="text-xs leading-relaxed text-muted-foreground">
          A quiet place for her wardrobe — pieces, looks, and little favorites.
        </p>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-foreground/6 bg-background/80 px-5 py-4 backdrop-blur-xl lg:hidden">
        <Link href="/">
          <p className="text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            Private atelier
          </p>
          <p className="font-heading text-2xl leading-none">{APP_NAME}</p>
        </Link>
        <Link
          href="/settings"
          className="inline-flex size-10 items-center justify-center rounded-full bg-card ring-1 ring-foreground/8"
          aria-label="Settings"
        >
          <Settings className="size-4" />
        </Link>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-5 pt-6 pb-28 lg:px-10 lg:pt-10 lg:pb-16">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-foreground/8 bg-background/90 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] tracking-wide",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-full",
                    active && "bg-foreground text-background",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {item.label.replace("My ", "")}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
