"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AppSelect } from "@/components/app-select";
import { ItemImage } from "@/components/item-image";
import { itemSeasons, toggleSeasonSelection } from "@/lib/seasons";
import { convertToSticker, persistImage, stickerApiConfigured } from "@/lib/to-sticker";
import { CATEGORIES, COLORS, SEASONS } from "@/lib/types";
import type { ClothingItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ItemFormValues = Omit<ClothingItem, "id" | "createdAt">;

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 12 * 1024 * 1024;

const emptyValues = (): ItemFormValues => ({
  name: "",
  category: "Tops",
  color: "Ivory",
  seasons: ["All Season"],
  brand: "",
  size: "",
  notes: "",
  image: "",
  images: [],
  favorite: false,
});

type Props = {
  initial?: ClothingItem;
  submitLabel: string;
  onSubmit: (values: ItemFormValues) => void;
};

export function ItemForm({ initial, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState<ItemFormValues>(
    initial
      ? {
          name: initial.name,
          category: initial.category,
          color: initial.color,
          seasons: itemSeasons(initial),
          brand: initial.brand,
          size: initial.size,
          notes: initial.notes,
          image: initial.image,
          images: initial.images?.length
            ? initial.images
            : initial.image
              ? [initial.image]
              : [],
          favorite: initial.favorite,
        }
      : emptyValues(),
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [converting, setConverting] = useState(false);
  const [makeSticker, setMakeSticker] = useState(true);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [imageUrl, setImageUrl] = useState(
    initial?.image && !initial.image.startsWith("data:") ? initial.image : "",
  );

  useEffect(() => {
    void stickerApiConfigured().then(setApiReady);
  }, []);

  async function preparePhoto(image: string) {
    if (!makeSticker) return persistImage(image);
    try {
      return await convertToSticker(image);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("OPENAI_API_KEY") || message.includes("not configured")) {
        return persistImage(image);
      }
      throw error;
    }
  }

  function update<K extends keyof ItemFormValues>(
    key: K,
    value: ItemFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function readAndCompress(file: File): Promise<string> {
    const source = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Unable to read this photo."));
      reader.readAsDataURL(file);
    });

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("Unable to prepare this photo."));
      next.src = source;
    });
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(1, 1600 / longestSide);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const available = MAX_PHOTOS - (values.images?.length ?? 0);
    if (available <= 0) {
      toast.error(`You can add up to ${MAX_PHOTOS} photos per item.`);
      return;
    }
    const selected = Array.from(files).slice(0, available);
    if (selected.some((file) => !file.type.startsWith("image/"))) {
      toast.error("Please choose image files only.");
      return;
    }
    if (selected.some((file) => file.size > MAX_FILE_SIZE)) {
      toast.error("Each photo must be smaller than 12 MB.");
      return;
    }

    setConverting(true);
    try {
      const compressed = await Promise.all(selected.map(readAndCompress));
      const newPhotos = await Promise.all(compressed.map(preparePhoto));
      setValues((prev) => {
        const images = [...(prev.images ?? []), ...newPhotos];
        return { ...prev, image: prev.image || images[0] || "", images };
      });
      if (files.length > available) {
        toast.message(`Only the first ${available} photos were added.`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "One or more photos could not be added.",
      );
    } finally {
      setConverting(false);
    }
  }

  async function convertPastedUrl() {
    const url = imageUrl.trim();
    if (!url.startsWith("http")) return;
    setConverting(true);
    try {
      const loaded = await new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          canvas.getContext("2d")?.drawImage(image, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.86));
        };
        image.onerror = () => reject(new Error("Could not load that image URL."));
        image.src = url;
      });
      const sticker = await preparePhoto(loaded);
      setValues((prev) => ({
        ...prev,
        image: sticker,
        images: [sticker, ...(prev.images ?? []).filter((entry) => entry !== sticker && entry !== url)],
      }));
      setImageUrl("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not convert that URL.");
    } finally {
      setConverting(false);
    }
  }

  function removePhoto(photo: string) {
    setValues((prev) => {
      const images = (prev.images ?? []).filter((entry) => entry !== photo);
      return { ...prev, image: prev.image === photo ? images[0] ?? "" : prev.image, images };
    });
  }

  function setCoverPhoto(photo: string) {
    setValues((prev) => ({ ...prev, image: photo }));
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      onSubmit={(event) => {
        event.preventDefault();
        if (!values.name.trim()) {
          toast.error("Give this piece a name.");
          return;
        }
        void (async () => {
          setConverting(true);
          try {
            const photos = values.images?.length
              ? values.images
              : values.image
                ? [values.image]
                : [];
            const stored = photos.length
              ? await Promise.all(photos.map(persistImage))
              : [];
            const coverIndex = Math.max(0, photos.indexOf(values.image));
            const cover = stored[coverIndex] ?? stored[0] ?? "";
            onSubmit({
              ...values,
              name: values.name.trim(),
              brand: values.brand.trim(),
              size: values.size.trim(),
              notes: values.notes.trim(),
              seasons: values.seasons.length ? values.seasons : ["All Season"],
              image: cover,
              images: stored,
            });
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Could not save these photos.",
            );
          } finally {
            setConverting(false);
          }
        })();
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/6">
          <div>
            <p className="text-sm font-medium">Sticker cutout</p>
            <p className="text-sm text-muted-foreground">
              Turn off to add a photo as-is for testing.
            </p>
          </div>
          <Switch
            checked={makeSticker}
            onCheckedChange={(checked) => setMakeSticker(Boolean(checked))}
            aria-label="Sticker cutout"
          />
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="block w-full overflow-hidden rounded-3xl bg-[#efe8dc] ring-1 ring-foreground/8 transition hover:ring-foreground/20"
        >
          <div className="relative aspect-[3/4] bg-[linear-gradient(45deg,#eadfce_25%,transparent_25%),linear-gradient(-45deg,#eadfce_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eadfce_75%),linear-gradient(-45deg,transparent_75%,#eadfce_75%)] bg-size-[18px_18px] bg-position-[0_0,0_9px,9px_-9px,-9px_0] bg-[#f7f1e8]">
            {values.image ? (
              <ItemImage
                src={values.image}
                alt="Preview"
                className="h-full w-full object-contain p-6"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
                <p className="font-heading text-2xl">Add photos</p>
                <p className="text-sm text-muted-foreground">
                  {makeSticker
                    ? "ChatGPT will keep only the garment as a sticker."
                    : "Photos are saved as they are, without a sticker cutout."}
                </p>
              </div>
            )}
            {converting ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#f7f1e8]/80">
                <p className="font-heading text-xl">
                  {makeSticker ? "Cutting sticker…" : "Adding photo…"}
                </p>
              </div>
            ) : null}
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void onFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        {values.images?.length ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {values.images.map((photo, index) => (
                <div key={photo} className="group relative aspect-square overflow-hidden rounded-2xl bg-[#efe8dc] ring-1 ring-foreground/8">
                  <button
                    type="button"
                    className="h-full w-full"
                    onClick={() => setCoverPhoto(photo)}
                    aria-label={`Use photo ${index + 1} as cover`}
                  >
                    <ItemImage src={photo} alt={`Photo ${index + 1}`} className="h-full w-full object-contain p-1" />
                  </button>
                  {values.image === photo ? (
                    <span className="absolute right-1 bottom-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white">Cover</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removePhoto(photo)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-1 right-1 inline-flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              {values.images.length < MAX_PHOTOS ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-foreground/20 text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
                  aria-label="Add more photos"
                >
                  <ImagePlus className="size-5" />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="image-url">Or paste an image URL</Label>
          <Input
            id="image-url"
            value={imageUrl}
            placeholder="https://"
            className="h-11 rounded-2xl"
            onChange={(event) => setImageUrl(event.target.value)}
            onBlur={() => void convertPastedUrl()}
          />
          {makeSticker && apiReady === false ? (
            <p className="text-sm text-muted-foreground">
              Paste your OpenAI key in `.env.local` as `OPENAI_API_KEY`, then restart the app.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {makeSticker
                ? "New photos are isolated with ChatGPT so only the garment remains."
                : "Sticker cutout is off. Photos will be stored without OpenAI."}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Item name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Ivory silk blouse"
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <AppSelect
            id="category"
            value={values.category}
            onValueChange={(value) =>
              update("category", value as ItemFormValues["category"])
            }
            items={CATEGORIES.map((category) => ({
              value: category,
              label: category,
            }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Seasons</Label>
          <p className="text-sm text-muted-foreground">
            Tick every season this piece can be worn.
          </p>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((season) => {
              const checked = values.seasons.includes(season);
              return (
                <button
                  key={season}
                  type="button"
                  onClick={() =>
                    update("seasons", toggleSeasonSelection(values.seasons, season))
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 transition",
                    checked
                      ? "bg-foreground text-background ring-foreground"
                      : "bg-card text-foreground ring-foreground/10 hover:ring-foreground/25",
                  )}
                  aria-pressed={checked}
                >
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded-sm border",
                      checked
                        ? "border-background/40 bg-background text-foreground"
                        : "border-foreground/25",
                    )}
                  >
                    {checked ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  {season}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <AppSelect
              id="color"
              value={
                COLORS.includes(values.color as (typeof COLORS)[number])
                  ? values.color
                  : "Ivory"
              }
              onValueChange={(value) => update("color", value)}
              items={COLORS.map((color) => ({ value: color, label: color }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={values.brand}
              onChange={(event) => update("brand", event.target.value)}
              placeholder="Sézane"
              className="h-11 rounded-2xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            value={values.size}
            onChange={(event) => update("size", event.target.value)}
            placeholder="S / 36 / 37"
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="How she wears it, fabric, care…"
            className="min-h-28 rounded-2xl"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/6">
          <div>
            <p className="text-sm font-medium">Favorite</p>
            <p className="text-sm text-muted-foreground">
              Keep this piece close.
            </p>
          </div>
          <Switch
            checked={values.favorite}
            onCheckedChange={(checked) => update("favorite", Boolean(checked))}
          />
        </div>

        <Button
          type="submit"
          disabled={converting}
          className="h-12 w-full rounded-full text-base"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
