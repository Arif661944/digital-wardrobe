"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ItemImage } from "@/components/item-image";
import { colorSwatch } from "@/lib/constants";
import type { ClothingItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  item: ClothingItem;
  onToggleFavorite: (id: string) => void;
};

export function ClothingCard({ item, onToggleFavorite }: Props) {
  return (
    <article className="group relative">
      <Link
        href={`/wardrobe/${item.id}`}
        className="block overflow-hidden rounded-3xl bg-card shadow-[0_1px_0_rgba(40,32,24,0.04),0_18px_40px_-28px_rgba(40,32,24,0.35)] ring-1 ring-foreground/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(40,32,24,0.4)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#efe8dc]">
          <ItemImage
            src={item.image}
            alt={item.name}
            className={`h-full w-full transition duration-700 group-hover:scale-[1.04] ${item.image.startsWith("data:image/png") ? "object-contain p-4" : "object-cover"}`}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-80" />
        </div>
        <div className="space-y-2 px-4 py-4">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {item.category}
          </p>
          <h3 className="font-heading text-lg leading-tight text-foreground">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="size-3 rounded-full ring-1 ring-foreground/10"
              style={{ backgroundColor: colorSwatch(item.color) }}
            />
            <span>{item.color}</span>
            <span className="text-foreground/20">·</span>
            <span>{item.season}</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label={item.favorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleFavorite(item.id);
        }}
        className={cn(
          "absolute top-3 right-3 z-10 inline-flex size-10 items-center justify-center rounded-full backdrop-blur-md transition",
          item.favorite
            ? "bg-white/90 text-[#8a4a4a]"
            : "bg-white/70 text-foreground/50 hover:text-foreground",
        )}
      >
        <Heart className={cn("size-4", item.favorite && "fill-current")} />
      </button>
    </article>
  );
}
