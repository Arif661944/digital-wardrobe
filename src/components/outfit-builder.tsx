"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { ItemImage } from "@/components/item-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useWardrobe } from "@/context/wardrobe-context";
import {
  countSlots,
  EMPTY_SLOTS,
  itemsForSlot,
  SLOT_META,
  type SlotKey,
} from "@/lib/outfit";
import type { Outfit, OutfitSlots } from "@/lib/types";

type Props = {
  initial?: Outfit;
};

export function OutfitBuilder({ initial }: Props) {
  const router = useRouter();
  const { items, addOutfit, updateOutfit } = useWardrobe();
  const [name, setName] = useState(initial?.name ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [slots, setSlots] = useState<OutfitSlots>(
    initial?.slots ?? EMPTY_SLOTS,
  );

  const preview = useMemo(
    () =>
      SLOT_META.map((slot) => {
        const id = slots[slot.key];
        return {
          ...slot,
          item: id ? items.find((piece) => piece.id === id) : undefined,
        };
      }).filter((slot) => slot.item),
    [items, slots],
  );

  function setSlot(key: SlotKey, value: string) {
    setSlots((prev) => ({
      ...prev,
      [key]: value === "none" ? null : value,
    }));
  }

  function save() {
    if (!name.trim()) {
      toast.error("Name this look.");
      return;
    }
    if (countSlots(slots) < 1) {
      toast.error("Choose at least one piece.");
      return;
    }
    const payload = {
      name: name.trim(),
      notes: notes.trim(),
      favorite,
      slots,
    };
    if (initial) {
      updateOutfit(initial.id, payload);
      toast.success("Look updated.");
      router.push(`/outfits/${initial.id}`);
      return;
    }
    const created = addOutfit(payload);
    toast.success("Look saved.");
    router.push(`/outfits/${created.id}`);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[2rem] bg-card p-4 ring-1 ring-foreground/6">
          <p className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Preview
          </p>
          {preview.length === 0 ? (
            <div className="flex aspect-[3/4] items-center justify-center rounded-3xl bg-[#efe8dc] text-sm text-muted-foreground">
              Select pieces to compose a look
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {preview.map((slot) =>
                slot.item ? (
                  <div
                    key={slot.key}
                    className="overflow-hidden rounded-2xl bg-[#efe8dc]"
                  >
                    <ItemImage
                      src={slot.item.image}
                      alt={slot.item.name}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      {slot.label}
                    </p>
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="outfit-name">Outfit name</Label>
          <Input
            id="outfit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Gallery lunch"
            className="h-11 rounded-2xl"
          />
        </div>

        {SLOT_META.map((slot) => {
          const options = itemsForSlot(items, slot.key);
          const selectedId = slots[slot.key];
          return (
            <div key={slot.key} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <Label>{slot.label}</Label>
                {selectedId ? (
                  <button
                    type="button"
                    onClick={() => setSlot(slot.key, "none")}
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              {options.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {options.map((item) => {
                    const selected = item.id === selectedId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSlot(slot.key, selected ? "none" : item.id)}
                        className={`group relative overflow-hidden rounded-2xl bg-card text-left ring-2 transition ${selected ? "ring-foreground" : "ring-foreground/6 hover:ring-foreground/25"}`}
                      >
                        <ItemImage
                          src={item.image}
                          alt={item.name || `Untitled ${item.category}`}
                          className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                        <div className="px-3 py-2.5">
                          <p className="truncate text-sm font-medium">
                            {item.name.trim() || `Untitled ${item.category}`}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.color}</p>
                        </div>
                        {selected ? (
                          <span className="absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
                            <Check className="size-4" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-2xl bg-[#f6f1e8] px-4 py-3 text-sm text-muted-foreground">
                  No matching pieces in your wardrobe yet.
                </p>
              )}
            </div>
          );
        })}

        <div className="space-y-2">
          <Label htmlFor="outfit-notes">Notes</Label>
          <Textarea
            id="outfit-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Occasion, weather, how it felt…"
            className="min-h-24 rounded-2xl"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/6">
          <div>
            <p className="text-sm font-medium">Favorite look</p>
            <p className="text-sm text-muted-foreground">
              Pin this to the dashboard.
            </p>
          </div>
          <Switch
            checked={favorite}
            onCheckedChange={(checked) => setFavorite(Boolean(checked))}
          />
        </div>

        <Button
          type="button"
          onClick={save}
          className="h-12 w-full rounded-full text-base"
        >
          {initial ? "Save look" : "Save outfit"}
        </Button>
      </div>
    </div>
  );
}
