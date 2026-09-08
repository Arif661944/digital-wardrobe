"use client";

import { ClothingCard } from "@/components/clothing-card";
import { LoadingScreen, PageHeader } from "@/components/page-header";
import { OutfitCard } from "@/components/outfit-card";
import { useWardrobe } from "@/context/wardrobe-context";

export default function FavoritesPage() {
  const { items, outfits, ready, toggleItemFavorite, toggleOutfitFavorite } =
    useWardrobe();

  if (!ready) return <LoadingScreen />;

  const favoriteItems = items.filter((item) => item.favorite);
  const favoriteOutfits = outfits.filter((outfit) => outfit.favorite);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Loved"
        title="Favorites"
        description="The pieces and looks she reaches for without thinking."
      />

      <section>
        <h2 className="font-heading mb-5 text-3xl">Favorite clothing</h2>
        {favoriteItems.length === 0 ? (
          <p className="rounded-3xl bg-card px-5 py-12 text-center text-sm text-muted-foreground ring-1 ring-foreground/6">
            Tap the heart on any piece to collect it here.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {favoriteItems.map((item) => (
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
        <h2 className="font-heading mb-5 text-3xl">Favorite outfits</h2>
        {favoriteOutfits.length === 0 ? (
          <p className="rounded-3xl bg-card px-5 py-12 text-center text-sm text-muted-foreground ring-1 ring-foreground/6">
            Save a look you love and it will live here.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteOutfits.map((outfit) => (
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
    </div>
  );
}
