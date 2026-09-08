import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
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
  return {
    items: Array.isArray(data.items) ? data.items : defaultState().items,
    outfits: Array.isArray(data.outfits) ? data.outfits : defaultState().outfits,
    calendar: Array.isArray(data.calendar) ? data.calendar : [],
    settings: {
      displayName: data.settings?.displayName ?? "love",
    },
  };
}

export async function writeWardrobe(state: WardrobeState) {
  await ensureWardrobeTable();
  const sql = sqlClient();
  const payload = JSON.stringify(state);
  await sql`
    INSERT INTO wardrobe (id, data, updated_at)
    VALUES ('default', ${payload}::jsonb, now())
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

export async function uploadDataUrl(dataUrl: string) {
  if (!dataUrl.startsWith("data:")) return dataUrl;
  if (!hasBlobStore()) return dataUrl;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return dataUrl;
  const mime = match[1];
  const bytes = Buffer.from(match[2], "base64");
  const blob = await put(`wardrobe/${crypto.randomUUID()}.${extensionFor(mime)}`, bytes, {
    access: "public",
    addRandomSuffix: true,
    contentType: mime,
  });
  return blob.url;
}

export async function persistItemImages(state: WardrobeState): Promise<WardrobeState> {
  if (!hasBlobStore()) return state;
  const items: ClothingItem[] = [];
  for (const item of state.items) {
    const image = await uploadDataUrl(item.image);
    const extras = item.images?.length ? await Promise.all(item.images.map(uploadDataUrl)) : image ? [image] : [];
    items.push({ ...item, image, images: extras });
  }
  return { ...state, items };
}
