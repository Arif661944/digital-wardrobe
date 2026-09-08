import { NextResponse } from "next/server";
import { hasBlobStore, uploadDataUrl } from "@/lib/db";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!hasBlobStore()) {
    const payload = (await request.json().catch(() => null)) as { image?: string } | null;
    return NextResponse.json({ url: payload?.image ?? "" });
  }
  let image = "";
  try {
    const payload = (await request.json()) as { image?: string };
    image = payload.image ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid image." }, { status: 400 });
  }
  if (!image.startsWith("data:")) {
    return NextResponse.json({ url: image });
  }
  const url = await uploadDataUrl(image);
  return NextResponse.json({ url });
}
