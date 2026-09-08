"use client";

import { toast } from "sonner";
import { ButtonLink } from "@/components/button-link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWardrobe } from "@/context/wardrobe-context";

export default function SettingsPage() {
  const { settings, updateSettings, restoreSample } = useWardrobe();

  return (
    <div className="max-w-xl">
      <PageHeader
        eyebrow="Atelier"
        title="Settings"
        description="A few quiet preferences. Everything stays on this device."
      />

      <div className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            value={settings.displayName}
            onChange={(event) =>
              updateSettings({ displayName: event.target.value })
            }
            className="h-11 rounded-2xl"
          />
          <p className="text-sm text-muted-foreground">
            Used in the welcome greeting on the dashboard.
          </p>
        </div>

        <div className="rounded-3xl bg-card px-5 py-5 ring-1 ring-foreground/6">
          <h2 className="font-heading text-2xl">Garment stickers</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Paste your OpenAI API key in `.env.local` as `OPENAI_API_KEY`, then
            restart the app. New photos are sent with a prompt that keeps only
            the clothing and removes the person wearing it.
          </p>
        </div>

        <div className="rounded-3xl bg-card px-5 py-5 ring-1 ring-foreground/6">
          <h2 className="font-heading text-2xl">Weekly calendar</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Plan looks for the week and mark what she actually wore.
          </p>
          <ButtonLink
            href="/calendar"
            variant="outline"
            className="mt-4 h-11 rounded-full px-5"
          >
            Open calendar
          </ButtonLink>
        </div>

        <div className="rounded-3xl bg-card px-5 py-5 ring-1 ring-foreground/6">
          <h2 className="font-heading text-2xl">Sample closet</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Restore the original women’s wardrobe and looks. This replaces the
            current closet on this browser.
          </p>
          <Button
            variant="outline"
            className="mt-4 h-11 rounded-full px-5"
            onClick={() => {
              restoreSample();
              toast.success("Sample wardrobe restored.");
            }}
          >
            Restore sample data
          </Button>
        </div>
      </div>
    </div>
  );
}
