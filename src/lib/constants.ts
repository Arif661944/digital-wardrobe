import type { Category } from "./types";

export const APP_NAME = "Atelier";
export const STORAGE_KEY = "atelier-wardrobe-v1";

export const TOP_CATEGORIES: Category[] = [
  "Tops",
  "T-Shirts",
  "Shirts",
  "Blouses",
  "Sweaters",
  "Hoodies",
];

export const BOTTOM_CATEGORIES: Category[] = [
  "Skirts",
  "Pants",
  "Jeans",
  "Shorts",
];

export const OUTERWEAR_CATEGORIES: Category[] = ["Jackets", "Coats"];

export const COLOR_SWATCH: Record<string, string> = {
  Black: "#1c1917",
  White: "#fafaf9",
  Ivory: "#f4efe6",
  Cream: "#efe6d5",
  Beige: "#d9cbb8",
  Tan: "#c4a484",
  Camel: "#c19a6b",
  Brown: "#6f4e37",
  Grey: "#a8a29e",
  Charcoal: "#44403c",
  Navy: "#1e2a4a",
  Blue: "#6b8cae",
  Sage: "#9caf88",
  Olive: "#6b705c",
  Green: "#4a7c59",
  Burgundy: "#7a3045",
  Blush: "#e8c4c4",
  Gold: "#c6a667",
  Silver: "#c0c0c0",
  Floral: "#d4a5a5",
};

export function colorSwatch(color: string) {
  return COLOR_SWATCH[color] ?? "#d6d3d1";
}
