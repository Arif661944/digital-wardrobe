"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { OutfitCollage } from "@/components/outfit-collage";
import { resolveOutfitItems } from "@/lib/outfit";
import type { ClothingItem, Outfit } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  outfit: Outfit;
  items: ClothingItem[];
  onToggleFavorite: (id: string) => void;
};

export function OutfitCard({ outfit, items, onToggleFavorite }: Props) {
  const pieces = resolveOutfitItems(outfit, items).slice(0, 4);

  return (
    <article className="group relative">
      <Link
        href={`/outfits/${outfit.id}`}
        className="block overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/5 shadow-[0_18px_40px_-28px_rgba(40,32,24,0.35)] transition duration-300 hover:-translate-y-1"
      >
        <OutfitCollage
          outfit={outfit}
          items={items}
          className="aspect-[3/4]"
        />
        <div className="space-y-1 px-4 py-4">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {pieces.length} pieces
          </p>
          <h3 className="font-heading text-xl">{outfit.name}</h3>
        </div>
      </Link>
      <button
        type="button"
        aria-label={
          outfit.favorite ? "Unfavorite outfit" : "Favorite outfit"
        }
        onClick={(event) => {
          event.preventDefault();
          onToggleFavorite(outfit.id);
        }}
        className={cn(
          "absolute top-3 right-3 z-10 inline-flex size-10 items-center justify-center rounded-full backdrop-blur-md transition",
          outfit.favorite
            ? "bg-white/90 text-[#8a4a4a]"
            : "bg-white/70 text-foreground/50 hover:text-foreground",
        )}
      >
        <Heart className={cn("size-4", outfit.favorite && "fill-current")} />
      </button>
    </article>
  );
}
