import { NextResponse } from "next/server";
import { isVercelBlobUrl, readBlobFile } from "@/lib/db";

export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url") ?? "";
  if (!isVercelBlobUrl(url)) {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }
  const result = await readBlobFile(url);
  if (!result?.stream) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }
  const contentType =
    "contentType" in result.blob && result.blob.contentType
      ? result.blob.contentType
      : "image/jpeg";
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=86400, immutable",
    },
  });
}
