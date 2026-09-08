"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ItemForm } from "@/components/item-form";
import { LoadingScreen, PageHeader } from "@/components/page-header";
import { useWardrobe } from "@/context/wardrobe-context";

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { items, ready, updateItem } = useWardrobe();
  const item = items.find((entry) => entry.id === id);

  if (!ready) return <LoadingScreen />;
  if (!item) {
    return <p className="text-muted-foreground">This piece could not be found.</p>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Edit"
        title={item.name}
        description="Adjust the details whenever the piece changes."
      />
      <ItemForm
        initial={item}
        submitLabel="Save changes"
        onSubmit={(values) => {
          updateItem(item.id, values);
          toast.success("Piece updated.");
          router.push(`/wardrobe/${item.id}`);
        }}
      />
    </div>
  );
}
