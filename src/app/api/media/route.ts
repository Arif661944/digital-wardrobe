import { NextResponse } from "next/server";
import {
  hasBlobStore,
  hasDatabase,
  uploadBlobFile,
  uploadDataUrl,
} from "@/lib/db";

export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isUpload(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "arrayBuffer" in value &&
      typeof (value as File).arrayBuffer === "function" &&
      typeof (value as File).size === "number" &&
      (value as File).size > 0,
  );
}

async function storeFile(file: Blob) {
  const mime = file.type || "image/jpeg";
  if (!hasBlobStore()) {
    if (hasDatabase()) {
      return jsonError(
        "Photos cannot be stored without Blob storage. Add BLOB_READ_WRITE_TOKEN in Vercel.",
        503,
      );
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    return NextResponse.json({
      url: `data:${mime};base64,${bytes.toString("base64")}`,
    });
  }
  const url = await uploadBlobFile(file, mime);
  return NextResponse.json({ url });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("image");
      if (!isUpload(file)) {
        return jsonError("Missing image.", 400);
      }
      return await storeFile(file);
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
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not store this photo.";
    return jsonError(message, 500);
  }
}
