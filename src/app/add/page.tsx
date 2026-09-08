"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ItemForm } from "@/components/item-form";
import { PageHeader } from "@/components/page-header";
import { useWardrobe } from "@/context/wardrobe-context";

export default function AddItemPage() {
  const router = useRouter();
  const { addItem } = useWardrobe();

  return (
    <div>
      <PageHeader
        eyebrow="New piece"
        title="Add item"
        description="Photograph it, name it, and give it a place in the closet."
      />
      <ItemForm
        submitLabel="Save to wardrobe"
        onSubmit={(values) => {
          const created = addItem(values);
          toast.success("Added to the wardrobe.");
          router.push(`/wardrobe/${created.id}`);
        }}
      />
    </div>
  );
}
