export const CATEGORIES = [
  "Tops",
  "T-Shirts",
  "Shirts",
  "Blouses",
  "Sweaters",
  "Hoodies",
  "Dresses",
  "Skirts",
  "Pants",
  "Jeans",
  "Shorts",
  "Jackets",
  "Coats",
  "Shoes",
  "Bags",
  "Accessories",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SEASONS = [
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
  "All Season",
] as const;

export type Season = (typeof SEASONS)[number];

export const COLORS = [
  "Black",
  "White",
  "Ivory",
  "Cream",
  "Beige",
  "Tan",
  "Camel",
  "Brown",
  "Grey",
  "Charcoal",
  "Navy",
  "Blue",
  "Sage",
  "Olive",
  "Green",
  "Burgundy",
  "Blush",
  "Gold",
  "Silver",
  "Floral",
] as const;

export type ColorName = (typeof COLORS)[number];

export type ClothingItem = {
  id: string;
  name: string;
  category: Category;
  color: string;
  seasons: Season[];
  /** Legacy single season from older saves. Prefer `seasons`. */
  season?: Season;
  brand: string;
  size: string;
  notes: string;
  image: string;
  /** Additional local or remote photos. `image` remains the cover photo. */
  images?: string[];
  favorite: boolean;
  createdAt: string;
};

export type OutfitSlots = {
  topId: string | null;
  bottomId: string | null;
  dressId: string | null;
  shoesId: string | null;
  bagId: string | null;
  accessoryId: string | null;
  outerwearId: string | null;
};

export type Outfit = {
  id: string;
  name: string;
  notes: string;
  favorite: boolean;
  createdAt: string;
  slots: OutfitSlots;
};

export type CalendarEntry = {
  id: string;
  date: string;
  outfitId: string;
  wornAt: string | null;
};

export type Settings = {
  displayName: string;
};

export type WardrobeState = {
  items: ClothingItem[];
  outfits: Outfit[];
  calendar: CalendarEntry[];
  settings: Settings;
};
