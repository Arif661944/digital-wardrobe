import { SEASONS, type ClothingItem, type Season } from "./types";

const SPECIFIC_SEASONS = SEASONS.filter((season) => season !== "All Season");

export function itemSeasons(item: Pick<ClothingItem, "seasons" | "season">): Season[] {
  if (item.seasons?.length) return item.seasons;
  if (item.season) return [item.season];
  return ["All Season"];
}

export function itemMatchesSeason(
  item: Pick<ClothingItem, "seasons" | "season">,
  season: string,
) {
  if (season === "all") return true;
  const list = itemSeasons(item);
  if (list.includes("All Season")) return true;
  return list.includes(season as Season);
}

export function formatSeasons(item: Pick<ClothingItem, "seasons" | "season">) {
  return itemSeasons(item).join(" · ");
}

export function toggleSeasonSelection(current: Season[], season: Season): Season[] {
  if (season === "All Season") return ["All Season"];
  const withoutAll = current.filter((entry) => entry !== "All Season");
  const next = withoutAll.includes(season)
    ? withoutAll.filter((entry) => entry !== season)
    : [...withoutAll, season];
  const ordered = SPECIFIC_SEASONS.filter((entry) => next.includes(entry));
  return ordered.length ? ordered : ["All Season"];
}

export function normalizeItem<T extends ClothingItem>(item: T): T {
  const seasons = itemSeasons(item);
  return {
    ...item,
    seasons,
    season: seasons[0],
  };
}
