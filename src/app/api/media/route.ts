import { NextResponse } from "next/server";
import { hasBlobStore, hasDatabase, uploadDataUrl } from "@/lib/db";

export const maxDuration = 60;

export async function POST(request: Request) {
  let image = "";
  try {
    const payload = (await request.json()) as { image?: string };
    image = payload.image ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid image." }, { status: 400 });
  }

  if (!image) {
    return NextResponse.json({ error: "Missing image." }, { status: 400 });
  }
  if (!image.startsWith("data:")) {
    return NextResponse.json({ url: image });
  }

  if (!hasBlobStore()) {
    if (hasDatabase()) {
      return NextResponse.json(
        {
          error:
            "Photos cannot be stored without Blob storage. Add BLOB_READ_WRITE_TOKEN in Vercel.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ url: image });
  }

  const url = await uploadDataUrl(image);
  return NextResponse.json({ url });
}
