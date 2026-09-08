import { NextResponse } from "next/server";
import { hasBlobStore, hasDatabase, uploadBytes, uploadDataUrl } from "@/lib/db";

export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function storeImage(bytes: Buffer, mime: string) {
  if (!hasBlobStore()) {
    if (hasDatabase()) {
      return jsonError(
        "Photos cannot be stored without Blob storage. Add BLOB_READ_WRITE_TOKEN in Vercel.",
        503,
      );
    }
    return NextResponse.json({
      url: `data:${mime};base64,${bytes.toString("base64")}`,
    });
  }
  const url = await uploadBytes(bytes, mime);
  return NextResponse.json({ url });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("image");
      if (!(file instanceof File) || file.size === 0) {
        return jsonError("Missing image.", 400);
      }
      const mime = file.type || "image/jpeg";
      const bytes = Buffer.from(await file.arrayBuffer());
      return await storeImage(bytes, mime);
    }

    const payload = (await request.json()) as { image?: string };
    const image = payload.image ?? "";
    if (!image) return jsonError("Missing image.", 400);
    if (!image.startsWith("data:")) {
      return NextResponse.json({ url: image });
    }
    if (!hasBlobStore() && hasDatabase()) {
      return jsonError(
        "Photos cannot be stored without Blob storage. Add BLOB_READ_WRITE_TOKEN in Vercel.",
        503,
      );
    }
    const url = await uploadDataUrl(image);
    return NextResponse.json({ url });
  } catch {
    return jsonError("Could not store this photo.", 400);
  }
}
