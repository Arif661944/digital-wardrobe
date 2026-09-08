"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ItemImage } from "@/components/item-image";
import { LoadingScreen } from "@/components/page-header";
import { ButtonLink } from "@/components/button-link";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/context/wardrobe-context";
import { SLOT_META, resolveOutfitItems } from "@/lib/outfit";

export default function OutfitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { outfits, items, ready, deleteOutfit, toggleOutfitFavorite } =
    useWardrobe();
  const outfit = outfits.find((entry) => entry.id === id);

  if (!ready) return <LoadingScreen />;
  if (!outfit) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-4xl">Look not found</h1>
        <ButtonLink href="/outfits" className="rounded-full">
          Back to outfits
        </ButtonLink>
      </div>
    );
  }

  const pieces = resolveOutfitItems(outfit, items);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            Outfit
          </p>
          <h1 className="font-heading mt-1 text-5xl">{outfit.name}</h1>
          {outfit.notes ? (
            <p className="mt-3 max-w-xl text-muted-foreground">{outfit.notes}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            className="h-11 rounded-full px-5"
            onClick={() => toggleOutfitFavorite(outfit.id)}
          >
            {outfit.favorite ? "Remove favorite" : "Favorite look"}
          </Button>
          <ButtonLink
            href={`/outfits/${outfit.id}/edit`}
            variant="outline"
            className="h-11 rounded-full px-5"
          >
            Edit
          </ButtonLink>
          <Button
            variant="destructive"
            className="h-11 rounded-full px-5"
            onClick={() => {
              deleteOutfit(outfit.id);
              toast.success("Look removed.");
              router.push("/outfits");
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SLOT_META.map((slot) => {
          const itemId = outfit.slots[slot.key];
          const item = itemId
            ? items.find((piece) => piece.id === itemId)
            : undefined;
          if (!item) return null;
          return (
            <Link
              key={slot.key}
              href={`/wardrobe/${item.id}`}
              className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/6 transition hover:-translate-y-0.5"
            >
              <ItemImage
                src={item.image}
                alt={item.name}
                className="aspect-[3/4] w-full object-cover"
              />
              <div className="px-4 py-3">
                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                  {slot.label}
                </p>
                <p className="font-heading text-xl">{item.name}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {pieces.length === 0 ? (
        <p className="text-muted-foreground">
          This look has no remaining pieces.
        </p>
      ) : null}
    </div>
  );
}
