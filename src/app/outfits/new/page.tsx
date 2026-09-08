"use client";

import { OutfitBuilder } from "@/components/outfit-builder";
import { PageHeader } from "@/components/page-header";

export default function NewOutfitPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Composer"
        title="New outfit"
        description="Layer a top or a dress, then finish with shoes, a bag, and something gold."
      />
      <OutfitBuilder />
    </div>
  );
}
