"use client";

import { use } from "react";
import { OutfitBuilder } from "@/components/outfit-builder";
import { LoadingScreen, PageHeader } from "@/components/page-header";
import { useWardrobe } from "@/context/wardrobe-context";

export default function EditOutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { outfits, ready } = useWardrobe();
  const outfit = outfits.find((entry) => entry.id === id);

  if (!ready) return <LoadingScreen />;
  if (!outfit) {
    return <p className="text-muted-foreground">This look could not be found.</p>;
  }

  return (
    <div>
      <PageHeader eyebrow="Edit look" title={outfit.name} />
      <OutfitBuilder initial={outfit} />
    </div>
  );
}
