import {
  BOTTOM_CATEGORIES,
  OUTERWEAR_CATEGORIES,
  TOP_CATEGORIES,
} from "./constants";
import type { Category, ClothingItem, Outfit, OutfitSlots } from "./types";

export const EMPTY_SLOTS: OutfitSlots = {
  topId: null,
  bottomId: null,
  dressId: null,
  shoesId: null,
  bagId: null,
  accessoryId: null,
  outerwearId: null,
};

export type SlotKey = keyof OutfitSlots;

export const SLOT_META: {
  key: SlotKey;
  label: string;
  match: (category: Category) => boolean;
}[] = [
  {
    key: "topId",
    label: "Tops",
    match: (c) => TOP_CATEGORIES.includes(c),
  },
  {
    key: "bottomId",
    label: "Bottoms",
    match: (c) => BOTTOM_CATEGORIES.includes(c),
  },
  {
    key: "dressId",
    label: "Dresses",
    match: (c) => c === "Dresses",
  },
  {
    key: "outerwearId",
    label: "Jackets & coats",
    match: (c) => OUTERWEAR_CATEGORIES.includes(c),
  },
  {
    key: "shoesId",
    label: "Shoes",
    match: (c) => c === "Shoes",
  },
  {
    key: "bagId",
    label: "Bags",
    match: (c) => c === "Bags",
  },
  {
    key: "accessoryId",
    label: "Accessories",
    match: (c) => c === "Accessories",
  },
];

export function itemsForSlot(items: ClothingItem[], key: SlotKey) {
  const meta = SLOT_META.find((s) => s.key === key);
  if (!meta) return [];
  return items.filter((item) => meta.match(item.category));
}

export function outfitItemIds(outfit: Outfit) {
  return Object.values(outfit.slots).filter((id): id is string => Boolean(id));
}

export function resolveOutfitItems(outfit: Outfit, items: ClothingItem[]) {
  return outfitItemIds(outfit)
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is ClothingItem => Boolean(item));
}

export function countSlots(slots: OutfitSlots) {
  return Object.values(slots).filter(Boolean).length;
}
