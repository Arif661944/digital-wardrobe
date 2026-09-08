"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ItemImage } from "@/components/item-image";
import { LoadingScreen } from "@/components/page-header";
import { ButtonLink } from "@/components/button-link";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/context/wardrobe-context";
import { colorSwatch } from "@/lib/constants";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { items, outfits, calendar, ready, deleteItem, toggleItemFavorite } = useWardrobe();
  const item = items.find((entry) => entry.id === id);
  const photos = item?.images?.length ? item.images : item?.image ? [item.image] : [];
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    setSelectedPhoto(0);
  }, [id]);
  const itemWearEntries = calendar.filter((entry) => {
    const outfit = outfits.find((look) => look.id === entry.outfitId);
    return entry.wornAt && outfit && Object.values(outfit.slots).includes(id);
  });
  const monthlyUsage = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date();
    date.setMonth(date.getMonth() - offset, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: date.toLocaleDateString(undefined, { month: "short" }),
      count: itemWearEntries.filter((entry) => entry.date.startsWith(monthKey)).length,
    };
  }).reverse();
  const currentMonthWears = monthlyUsage.at(-1)?.count ?? 0;

  if (!ready) return <LoadingScreen />;

  if (!item) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-4xl">This piece is gone</h1>
        <ButtonLink href="/wardrobe" className="rounded-full">
          Back to wardrobe
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="overflow-hidden rounded-[2rem] bg-[#efe8dc] ring-1 ring-foreground/6">
        <ItemImage
          src={photos[selectedPhoto] ?? item.image}
          alt={item.name}
          className={`aspect-[3/4] w-full ${item.image.startsWith("data:image/png") ? "object-contain p-8" : "object-cover"}`}
        />
        {photos.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto border-t border-foreground/6 p-3">
            {photos.map((photo, index) => (
              <button
                key={photo}
                type="button"
                onClick={() => setSelectedPhoto(index)}
                aria-label={`View photo ${index + 1}`}
                aria-pressed={selectedPhoto === index}
                className={`shrink-0 overflow-hidden rounded-xl ring-2 transition ${selectedPhoto === index ? "ring-foreground" : "ring-transparent"}`}
              >
                <ItemImage src={photo} alt="" className="size-16 object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="space-y-6">
        <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          {item.category}
        </p>
        <h1 className="font-heading text-5xl leading-tight">{item.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Meta
            label="Color"
            value={item.color}
            swatch={colorSwatch(item.color)}
          />
          <Meta label="Season" value={item.season} />
          {item.brand ? <Meta label="Brand" value={item.brand} /> : null}
          {item.size ? <Meta label="Size" value={item.size} /> : null}
          <Meta
            label="Favorite"
            value={item.favorite ? "Yes" : "Not yet"}
          />
        </div>
        {item.notes ? (
          <p className="max-w-xl text-base leading-relaxed text-foreground/75">
            {item.notes}
          </p>
        ) : null}
        <section className="rounded-3xl bg-card px-5 py-5 ring-1 ring-foreground/6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Wear history</p>
              <h2 className="font-heading mt-1 text-2xl">{currentMonthWears} wears this month</h2>
            </div>
            <span className="text-sm text-muted-foreground">{itemWearEntries.length} total</span>
          </div>
          <div className="mt-5 grid grid-cols-6 gap-2">
            {monthlyUsage.map((month) => (
              <div key={month.label} className="text-center">
                <div className="flex h-16 items-end rounded-xl bg-[#efe8dc] px-1.5">
                  <div
                    className="w-full rounded-t-lg bg-foreground/75 transition-[height]"
                    style={{ height: `${month.count ? Math.max(18, Math.min(100, month.count * 25)) : 4}%` }}
                    title={`${month.count} wears`}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{month.label}</p>
                <p className="text-xs font-medium">{month.count}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            className="h-11 rounded-full px-5"
            onClick={() => toggleItemFavorite(item.id)}
          >
            {item.favorite ? "Remove favorite" : "Add to favorites"}
          </Button>
          <ButtonLink
            href={`/wardrobe/${item.id}/edit`}
            variant="outline"
            className="h-11 rounded-full px-5"
          >
            Edit
          </ButtonLink>
          <Button
            variant="destructive"
            className="h-11 rounded-full px-5"
            onClick={() => {
              deleteItem(item.id);
              toast.success("Piece removed.");
              router.push("/wardrobe");
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  swatch,
}: {
  label: string;
  value: string;
  swatch?: string;
}) {
  return (
    <div className="rounded-full bg-card px-4 py-2 text-sm ring-1 ring-foreground/8">
      <span className="text-muted-foreground">{label} · </span>
      <span className="inline-flex items-center gap-2">
        {swatch ? (
          <span
            className="size-2.5 rounded-full ring-1 ring-foreground/10"
            style={{ backgroundColor: swatch }}
          />
        ) : null}
        {value}
      </span>
    </div>
  );
}
