import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { normalizeItem } from "./seasons";
import { defaultState } from "./wardrobe-default";
import type { ClothingItem, WardrobeState } from "./types";

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function hasBlobStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function sqlClient() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is missing.");
  return neon(url);
}

export async function ensureWardrobeTable() {
  const sql = sqlClient();
  await sql`
    CREATE TABLE IF NOT EXISTS wardrobe (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at timestamptz DEFAULT now()
    )
  `;
}

export async function readWardrobe(): Promise<WardrobeState> {
  await ensureWardrobeTable();
  const sql = sqlClient();
  const rows = await sql`SELECT data FROM wardrobe WHERE id = 'default' LIMIT 1`;
  const data = rows[0]?.data as WardrobeState | undefined;
  if (!data?.items) return defaultState();
  return normalizeState({
    items: Array.isArray(data.items) ? data.items : defaultState().items,
    outfits: Array.isArray(data.outfits) ? data.outfits : defaultState().outfits,
    calendar: Array.isArray(data.calendar) ? data.calendar : [],
    settings: {
      displayName: data.settings?.displayName ?? "love",
    },
  });
}

export function normalizeState(state: WardrobeState): WardrobeState {
  return {
    ...state,
    items: state.items.map(normalizeItem),
  };
}

function hasEmbeddedImages(state: WardrobeState) {
  return state.items.some(
    (item) =>
      item.image.startsWith("data:") ||
      item.images?.some((image) => image.startsWith("data:")),
  );
}

export async function writeWardrobe(state: WardrobeState) {
  await ensureWardrobeTable();
  const sql = sqlClient();
  const data = JSON.parse(JSON.stringify(normalizeState(state))) as WardrobeState;
  await sql`
    INSERT INTO wardrobe (id, data, updated_at)
    VALUES ('default', ${data}, now())
    ON CONFLICT (id)
    DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
}

function extensionFor(mime: string) {
  if (mime.includes("webp")) return "webp";
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  return "png";
}

export async function uploadBytes(bytes: Buffer, mime: string) {
  if (!hasBlobStore()) {
    return `data:${mime};base64,${bytes.toString("base64")}`;
  }
  const blob = await put(`wardrobe/${crypto.randomUUID()}.${extensionFor(mime)}`, bytes, {
    access: "public",
    addRandomSuffix: true,
    contentType: mime,
  });
  return blob.url;
}

export async function uploadDataUrl(dataUrl: string) {
  if (!dataUrl.startsWith("data:")) return dataUrl;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return dataUrl;
  return uploadBytes(Buffer.from(match[2], "base64"), match[1]);
}

export async function persistItemImages(state: WardrobeState): Promise<WardrobeState> {
  if (!hasBlobStore()) {
    if (hasEmbeddedImages(state) && hasDatabase()) {
      throw new Error(
        "Photos cannot be saved without Blob storage. Add BLOB_READ_WRITE_TOKEN in Vercel.",
      );
    }
    return normalizeState(state);
  }
  const items: ClothingItem[] = [];
  for (const item of state.items) {
    const image = await uploadDataUrl(item.image);
    const extras = item.images?.length
      ? await Promise.all(item.images.map(uploadDataUrl))
      : image
        ? [image]
        : [];
    items.push(normalizeItem({ ...item, image, images: extras }));
  }
  return { ...state, items };
}
