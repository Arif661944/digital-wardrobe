"use client";

import { ItemImage } from "@/components/item-image";
import type { ClothingItem, Outfit } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  outfit: Outfit;
  items: ClothingItem[];
  className?: string;
};

type Layer = {
  key: string;
  item: ClothingItem;
  className: string;
  tilt: string;
};

function piece(outfit: Outfit, items: ClothingItem[], id: string | null) {
  if (!id) return undefined;
  return items.find((entry) => entry.id === id);
}

function collageLayers(outfit: Outfit, items: ClothingItem[]): Layer[] {
  const top = piece(outfit, items, outfit.slots.topId);
  const bottom = piece(outfit, items, outfit.slots.bottomId);
  const dress = piece(outfit, items, outfit.slots.dressId);
  const outerwear = piece(outfit, items, outfit.slots.outerwearId);
  const shoes = piece(outfit, items, outfit.slots.shoesId);
  const bag = piece(outfit, items, outfit.slots.bagId);
  const jewelry = piece(outfit, items, outfit.slots.accessoryId);
  const layers: Layer[] = [];
  const hasSeparateTopBottom = Boolean(top || bottom) && !dress;

  if (dress) {
    layers.push({
      key: `dress-${dress.id}`,
      item: dress,
      className: "left-[22%] top-[10%] z-20 h-[60%] w-[56%]",
      tilt: "rotate-[-2deg]",
    });
  }

  if (outerwear) {
    layers.push({
      key: `outerwear-${outerwear.id}`,
      item: outerwear,
      className: dress
        ? "left-[28%] top-[7%] z-10 h-[36%] w-[44%]"
        : "left-[26%] top-[6%] z-10 h-[34%] w-[48%]",
      tilt: "rotate-[3deg]",
    });
  }

  if (hasSeparateTopBottom && top) {
    layers.push({
      key: `top-${top.id}`,
      item: top,
      className: "left-[24%] top-[8%] z-20 h-[36%] w-[52%]",
      tilt: "rotate-[-1deg]",
    });
  }

  if (hasSeparateTopBottom && bottom) {
    layers.push({
      key: `bottom-${bottom.id}`,
      item: bottom,
      className: "left-[24%] top-[40%] z-20 h-[36%] w-[52%]",
      tilt: "rotate-[1.5deg]",
    });
  }

  if (jewelry) {
    layers.push({
      key: `jewelry-${jewelry.id}`,
      item: jewelry,
      className: "right-[3%] top-[3%] z-40 h-[22%] w-[26%]",
      tilt: "rotate-[8deg]",
    });
  }

  if (bag) {
    layers.push({
      key: `bag-${bag.id}`,
      item: bag,
      className: "left-[2%] top-[38%] z-30 h-[30%] w-[30%]",
      tilt: "rotate-[-7deg]",
    });
  }

  if (shoes) {
    layers.push({
      key: `shoes-${shoes.id}`,
      item: shoes,
      className: "bottom-[1%] left-[16%] z-40 h-[26%] w-[68%]",
      tilt: "rotate-[-3deg]",
    });
  }

  return layers;
}

export function OutfitCollage({ outfit, items, className }: Props) {
  const layers = collageLayers(outfit, items);

  if (!layers.length) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-[#f6f1e8] text-xs text-muted-foreground",
          className,
        )}
      >
        Empty look
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-[#fdfcf9]", className)}>
      {layers.map((layer) => (
        <div
          key={layer.key}
          className={cn(
            "absolute flex items-center justify-center",
            layer.className,
          )}
        >
          <ItemImage
            src={layer.item.image}
            alt={layer.item.name}
            className={cn(
              "max-h-full max-w-full object-contain drop-shadow-[0_10px_14px_rgba(40,32,24,0.22)]",
              layer.tilt,
            )}
          />
        </div>
      ))}
    </div>
  );
}
