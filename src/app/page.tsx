"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClothingCard } from "@/components/clothing-card";
import { LoadingScreen } from "@/components/page-header";
import { OutfitCard } from "@/components/outfit-card";
import { ButtonLink } from "@/components/button-link";
import { useWardrobe } from "@/context/wardrobe-context";
import { CATEGORIES } from "@/lib/types";

export default function DashboardPage() {
  const { items, outfits, settings, ready, toggleItemFavorite, toggleOutfitFavorite } =
    useWardrobe();

  if (!ready) return <LoadingScreen />;

  const favorites = items.filter((item) => item.favorite);
  const recent = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ).slice(0, 4);
  const favoriteLooks = outfits.filter((outfit) => outfit.favorite).slice(0, 3);
  const counts = CATEGORIES.map((category) => ({
    category,
    count: items.filter((item) => item.category === category).length,
  })).filter((entry) => entry.count > 0);

  const name = settings.displayName.trim() || "love";
  const hour = new Date().getHours();
  const hello =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#f3ebe0_0%,#efe4d4_45%,#e7ddd0_100%)] px-6 py-10 sm:px-10">
        <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          Welcome
        </p>
        <h1 className="font-heading mt-2 max-w-xl text-5xl leading-[1.05] text-balance sm:text-6xl">
          {hello}, {name}.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground/70">
          Her closet, quietly arranged — pieces she loves, looks she returns to,
          and space for whatever comes next.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/add" className="h-11 rounded-full px-5">
            Add a piece
          </ButtonLink>
          <ButtonLink
            href="/outfits/new"
            variant="outline"
            className="h-11 rounded-full px-5"
          >
            Compose a look
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Wardrobe" value={String(items.length)} hint="pieces saved" />
        <Stat
          label="Favorites"
          value={String(favorites.length)}
          hint="pieces she loves"
        />
        <Stat
          label="Looks"
          value={String(outfits.length)}
          hint={`${favoriteLooks.length} pinned`}
        />
      </section>

      <section>
        <SectionHead
          title="Categories"
          href="/wardrobe"
          linkLabel="Browse all"
        />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => {
            const count = items.filter((item) => item.category === category).length;
            return (
              <Link
                key={category}
                href={`/wardrobe?category=${encodeURIComponent(category)}`}
                className="min-w-36 shrink-0 rounded-3xl bg-card px-5 py-4 ring-1 ring-foreground/6 transition hover:-translate-y-0.5 hover:ring-foreground/15"
              >
                <p className="font-heading text-xl">{category}</p>
                <p className="text-sm text-muted-foreground">
                  {count} {count === 1 ? "piece" : "pieces"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHead title="Recently added" href="/wardrobe" />
        {recent.length === 0 ? (
          <EmptyLine text="Nothing in the closet yet." />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recent.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onToggleFavorite={toggleItemFavorite}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHead title="Favorite outfits" href="/favorites" />
        {favoriteLooks.length === 0 ? (
          <EmptyLine text="Pin a look to see it here." />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {favoriteLooks.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                items={items}
                onToggleFavorite={toggleOutfitFavorite}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHead title="Wardrobe mix" href="/wardrobe" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {counts.map((entry) => (
            <Link
              key={entry.category}
              href={`/wardrobe?category=${encodeURIComponent(entry.category)}`}
              className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/6"
            >
              <span>{entry.category}</span>
              <span className="text-muted-foreground">{entry.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.75rem] bg-card px-6 py-6 ring-1 ring-foreground/6">
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-heading mt-2 text-5xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function SectionHead({
  title,
  href,
  linkLabel = "See all",
}: {
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="font-heading text-3xl">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
      >
        {linkLabel}
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-3xl bg-card px-5 py-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/6">
      {text}
    </p>
  );
}
