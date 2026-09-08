"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loadState, saveState } from "@/lib/storage";
import { SAMPLE_ITEMS, SAMPLE_OUTFITS } from "@/lib/sample-data";
import { toast } from "sonner";
import type {
  CalendarEntry,
  ClothingItem,
  Outfit,
  Settings,
  WardrobeState,
} from "@/lib/types";

type WardrobeContextValue = WardrobeState & {
  ready: boolean;
  addItem: (item: Omit<ClothingItem, "id" | "createdAt">) => ClothingItem;
  updateItem: (id: string, patch: Partial<ClothingItem>) => void;
  deleteItem: (id: string) => void;
  toggleItemFavorite: (id: string) => void;
  addOutfit: (outfit: Omit<Outfit, "id" | "createdAt">) => Outfit;
  updateOutfit: (id: string, patch: Partial<Outfit>) => void;
  deleteOutfit: (id: string) => void;
  toggleOutfitFavorite: (id: string) => void;
  scheduleOutfit: (date: string, outfitId: string) => void;
  removeScheduledOutfit: (date: string) => void;
  markOutfitWorn: (date: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  restoreSample: () => void;
};

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WardrobeState>({
    items: [],
    outfits: [],
    calendar: [],
    settings: { displayName: "love" },
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadState().then((next) => {
      if (cancelled) return;
      setState(next);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      void saveState(state).catch(() => {
        toast.error("Could not save the wardrobe. Check the database connection.");
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [ready, state]);

  const addItem = useCallback((item: Omit<ClothingItem, "id" | "createdAt">) => {
    const next: ClothingItem = {
      ...item,
      id: createId("item"),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, items: [next, ...prev.items] }));
    return next;
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<ClothingItem>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...patch, id: item.id } : item,
      ),
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
      outfits: prev.outfits.map((outfit) => ({
        ...outfit,
        slots: {
          topId: outfit.slots.topId === id ? null : outfit.slots.topId,
          bottomId: outfit.slots.bottomId === id ? null : outfit.slots.bottomId,
          dressId: outfit.slots.dressId === id ? null : outfit.slots.dressId,
          shoesId: outfit.slots.shoesId === id ? null : outfit.slots.shoesId,
          bagId: outfit.slots.bagId === id ? null : outfit.slots.bagId,
          accessoryId:
            outfit.slots.accessoryId === id ? null : outfit.slots.accessoryId,
          outerwearId:
            outfit.slots.outerwearId === id ? null : outfit.slots.outerwearId,
        },
      })),
    }));
  }, []);

  const toggleItemFavorite = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item,
      ),
    }));
  }, []);

  const addOutfit = useCallback((outfit: Omit<Outfit, "id" | "createdAt">) => {
    const next: Outfit = {
      ...outfit,
      id: createId("outfit"),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, outfits: [next, ...prev.outfits] }));
    return next;
  }, []);

  const updateOutfit = useCallback((id: string, patch: Partial<Outfit>) => {
    setState((prev) => ({
      ...prev,
      outfits: prev.outfits.map((outfit) =>
        outfit.id === id ? { ...outfit, ...patch, id: outfit.id } : outfit,
      ),
    }));
  }, []);

  const deleteOutfit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      outfits: prev.outfits.filter((outfit) => outfit.id !== id),
      calendar: prev.calendar.filter((entry) => entry.outfitId !== id),
    }));
  }, []);

  const toggleOutfitFavorite = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      outfits: prev.outfits.map((outfit) =>
        outfit.id === id ? { ...outfit, favorite: !outfit.favorite } : outfit,
      ),
    }));
  }, []);

  const scheduleOutfit = useCallback((date: string, outfitId: string) => {
    setState((prev) => {
      const existing = prev.calendar.find((entry) => entry.date === date);
      const next: CalendarEntry = existing
        ? { ...existing, outfitId, wornAt: null }
        : { id: createId("calendar"), date, outfitId, wornAt: null };
      return {
        ...prev,
        calendar: existing
          ? prev.calendar.map((entry) => (entry.date === date ? next : entry))
          : [...prev.calendar, next],
      };
    });
  }, []);

  const removeScheduledOutfit = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      calendar: prev.calendar.filter((entry) => entry.date !== date),
    }));
  }, []);

  const markOutfitWorn = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      calendar: prev.calendar.map((entry) =>
        entry.date === date
          ? { ...entry, wornAt: entry.wornAt ? null : new Date().toISOString() }
          : entry,
      ),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const restoreSample = useCallback(() => {
    setState({
      items: SAMPLE_ITEMS,
      outfits: SAMPLE_OUTFITS,
      calendar: [],
      settings: { displayName: "love" },
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      ready,
      addItem,
      updateItem,
      deleteItem,
      toggleItemFavorite,
      addOutfit,
      updateOutfit,
      deleteOutfit,
      toggleOutfitFavorite,
      scheduleOutfit,
      removeScheduledOutfit,
      markOutfitWorn,
      updateSettings,
      restoreSample,
    }),
    [
      state,
      ready,
      addItem,
      updateItem,
      deleteItem,
      toggleItemFavorite,
      addOutfit,
      updateOutfit,
      deleteOutfit,
      toggleOutfitFavorite,
      scheduleOutfit,
      removeScheduledOutfit,
      markOutfitWorn,
      updateSettings,
      restoreSample,
    ],
  );

  return (
    <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext);
  if (!ctx) {
    throw new Error("useWardrobe must be used within WardrobeProvider");
  }
  return ctx;
}
