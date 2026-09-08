import { SAMPLE_ITEMS, SAMPLE_OUTFITS } from "./sample-data";
import type { WardrobeState } from "./types";

export const defaultState = (): WardrobeState => ({
  items: SAMPLE_ITEMS,
  outfits: SAMPLE_OUTFITS,
  calendar: [],
  settings: { displayName: "love" },
});
