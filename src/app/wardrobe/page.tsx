"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClothingCard } from "@/components/clothing-card";
import { AppSelect } from "@/components/app-select";
import { LoadingScreen, PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { useWardrobe } from "@/context/wardrobe-context";
import { CATEGORIES, COLORS, SEASONS } from "@/lib/types";

function parseCategory(value: string | null) {
  if (value && CATEGORIES.includes(value as (typeof CATEGORIES)[number])) {
    return value;
  }
  return "all";
}

function WardrobeGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryFromUrl = parseCategory(searchParams.get("category"));
  const { items, ready, toggleItemFavorite } = useWardrobe();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categoryFromUrl);
  const [color, setColor] = useState("all");
  const [season, setSeason] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  function updateCategory(value: string) {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("category");
    else params.set("category", value);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        if (color !== "all" && item.color !== color) return false;
        if (season !== "all" && item.season !== season) return false;
        if (favoritesOnly === "yes" && !item.favorite) return false;
        if (!q) return true;
        return [item.name, item.brand, item.category, item.color, item.notes]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        const delta =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sort === "oldest" ? delta : -delta;
      });
  }, [items, query, category, color, season, favoritesOnly, sort]);

  if (!ready) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        eyebrow="Closet"
        title="My wardrobe"
        description="Search, filter, and linger over every piece."
      />

      <div className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, brand, color…"
          className="h-11 rounded-2xl md:col-span-2 xl:col-span-2"
        />
        <AppSelect
          value={category}
          onValueChange={updateCategory}
          items={[
            { value: "all", label: "All categories" },
            ...CATEGORIES.map((entry) => ({ value: entry, label: entry })),
          ]}
        />
        <AppSelect
          value={color}
          onValueChange={setColor}
          items={[
            { value: "all", label: "All colors" },
            ...COLORS.map((entry) => ({ value: entry, label: entry })),
          ]}
        />
        <AppSelect
          value={season}
          onValueChange={setSeason}
          items={[
            { value: "all", label: "All seasons" },
            ...SEASONS.map((entry) => ({ value: entry, label: entry })),
          ]}
        />
        <div className="grid grid-cols-2 gap-3 xl:contents">
          <AppSelect
            value={favoritesOnly}
            onValueChange={setFavoritesOnly}
            items={[
              { value: "all", label: "All pieces" },
              { value: "yes", label: "Favorites" },
            ]}
          />
          <AppSelect
            value={sort}
            onValueChange={setSort}
            items={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-3xl bg-card px-5 py-16 text-center text-muted-foreground ring-1 ring-foreground/6">
          No pieces match these filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onToggleFavorite={toggleItemFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WardrobePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WardrobeGrid />
    </Suspense>
  );
}
