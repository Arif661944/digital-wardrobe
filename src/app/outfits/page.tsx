"use client";

import { OutfitCard } from "@/components/outfit-card";
import { LoadingScreen, PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/button-link";
import { useWardrobe } from "@/context/wardrobe-context";

export default function OutfitsPage() {
  const { outfits, items, ready, toggleOutfitFavorite } = useWardrobe();

  if (!ready) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        eyebrow="Looks"
        title="Outfits"
        description="Compose a look from tops, bottoms, dresses, shoes, bags, and the quiet extras."
        action={
          <ButtonLink href="/outfits/new" className="h-11 rounded-full px-5">
            New outfit
          </ButtonLink>
        }
      />
      {outfits.length === 0 ? (
        <p className="rounded-3xl bg-card px-5 py-16 text-center text-muted-foreground ring-1 ring-foreground/6">
          No looks yet. Start with two pieces you already love together.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              items={items}
              onToggleFavorite={toggleOutfitFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
