"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { AppSelect } from "@/components/app-select";
import { OutfitCollage } from "@/components/outfit-collage";
import { LoadingScreen, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/context/wardrobe-context";
import { outfitItemIds } from "@/lib/outfit";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfWeek(date: Date) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() - ((next.getDay() + 6) % 7));
  return next;
}

function addDays(key: string, days: number) {
  const next = dateFromKey(key);
  next.setDate(next.getDate() + days);
  return dateKey(next);
}

export default function CalendarPage() {
  const { items, outfits, calendar, ready, scheduleOutfit, removeScheduledOutfit, markOutfitWorn } = useWardrobe();
  const today = dateKey(new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(today);
  const week = useMemo(
    () => Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + offset);
      return date;
    }),
    [weekStart],
  );

  const selectedEntry = calendar.find((entry) => entry.date === selectedDate);
  const selectedOutfit = selectedEntry ? outfits.find((outfit) => outfit.id === selectedEntry.outfitId) : undefined;
  const repeatedItems = selectedOutfit
    ? items.filter((item) => {
        if (!outfitItemIds(selectedOutfit).includes(item.id)) return false;
        return calendar.some((entry) => {
          if (entry.date < addDays(selectedDate, -7) || entry.date >= selectedDate) return false;
          const previousOutfit = outfits.find((outfit) => outfit.id === entry.outfitId);
          return previousOutfit ? outfitItemIds(previousOutfit).includes(item.id) : false;
        });
      })
    : [];

  function moveWeek(offset: number) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + offset * 7);
    setWeekStart(next);
    setSelectedDate(dateKey(next));
  }

  if (!ready) return <LoadingScreen />;

  const startLabel = week[0].toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = week[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const selectedLabel = dateFromKey(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const isFuture = selectedDate > today;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Plan ahead" title="Weekly calendar" description="Build a week of looks from the pieces you already own." />

      <section className="rounded-[2rem] bg-card p-4 ring-1 ring-foreground/6 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label="Previous week" onClick={() => moveWeek(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="font-heading text-center text-2xl sm:text-3xl">{startLabel} – {endLabel}</h2>
          <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label="Next week" onClick={() => moveWeek(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-flow-col auto-cols-[minmax(9.75rem,1fr)] gap-3 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-7 lg:overflow-visible">
          {week.map((date) => {
            const key = dateKey(date);
            const entry = calendar.find((calendarEntry) => calendarEntry.date === key);
            const outfit = entry ? outfits.find((look) => look.id === entry.outfitId) : undefined;
            const selected = key === selectedDate;
            return (
              <button key={key} type="button" onClick={() => setSelectedDate(key)} className={`overflow-hidden rounded-2xl text-left ring-2 transition ${selected ? "ring-foreground" : "ring-transparent hover:ring-foreground/15"}`}>
                <div className={`flex items-center justify-between px-3 py-3 ${selected ? "bg-foreground text-background" : "bg-[#f6f1e8]"}`}>
                  <div>
                    <p className={`text-[10px] tracking-[0.16em] uppercase ${selected ? "text-background/65" : "text-muted-foreground"}`}>{date.toLocaleDateString(undefined, { weekday: "short" })}</p>
                    <p className="font-heading text-xl">{date.getDate()}</p>
                  </div>
                  {key === today ? <span className={`size-2 rounded-full ${selected ? "bg-background" : "bg-foreground"}`} /> : null}
                </div>
                {outfit ? (
                  <>
                    <OutfitCollage outfit={outfit} items={items} className="aspect-[3/4]" />
                    <div className="min-h-14 bg-card px-3 py-3">
                      <p className="truncate font-heading text-base">{outfit.name}</p>
                      <p className={`mt-1 text-xs ${entry?.wornAt ? "text-emerald-700" : "text-muted-foreground"}`}>{entry?.wornAt ? "✓ Worn" : "Planned"}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center bg-[#fbfaf7] px-4 text-center text-xs leading-relaxed text-muted-foreground">Tap to plan a look</div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] bg-card p-6 ring-1 ring-foreground/6 sm:p-8">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{selectedLabel}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-3xl">Plan a look</h2>
          {selectedOutfit ? <p className="text-sm text-muted-foreground">{selectedEntry?.wornAt ? "Marked as worn" : "Ready to wear"}</p> : null}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          {outfits.length ? (
            <div className="space-y-2">
              <label htmlFor="scheduled-outfit" className="text-sm font-medium">Outfit</label>
              <AppSelect
                id="scheduled-outfit"
                value={selectedEntry?.outfitId ?? "none"}
                onValueChange={(outfitId) => {
                  if (outfitId === "none") removeScheduledOutfit(selectedDate);
                  else scheduleOutfit(selectedDate, outfitId);
                }}
                items={[{ value: "none", label: "No outfit planned" }, ...outfits.map((outfit) => ({ value: outfit.id, label: outfit.name }))]}
              />
            </div>
          ) : <p className="rounded-2xl bg-[#f6f1e8] px-4 py-4 text-sm text-muted-foreground">Create an outfit before scheduling it here.</p>}
          {selectedOutfit ? (
            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-full" disabled={isFuture} onClick={() => markOutfitWorn(selectedDate)}>
                <Check className="size-4" />
                {selectedEntry?.wornAt ? "Undo worn" : "Mark as worn"}
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => removeScheduledOutfit(selectedDate)}>
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>
          ) : null}
        </div>
        {repeatedItems.length ? <p className="mt-5 rounded-2xl border border-amber-700/15 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">Repeat check: {repeatedItems.map((item) => item.name).join(", ")} appeared in the previous 7 days.</p> : null}
        {selectedOutfit && isFuture ? <p className="mt-4 text-xs text-muted-foreground">You can mark this look worn on or after its scheduled day.</p> : null}
      </section>
    </div>
  );
}
