import { NextResponse } from "next/server";
import {
  hasDatabase,
  persistItemImages,
  readWardrobe,
  writeWardrobe,
} from "@/lib/db";
import { defaultState } from "@/lib/wardrobe-default";
import type { WardrobeState } from "@/lib/types";

export const maxDuration = 60;

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json({ mode: "local", state: defaultState() });
  }
  const state = await readWardrobe();
  return NextResponse.json({ mode: "db", state });
}

export async function PUT(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ mode: "local" });
  }
  let state: WardrobeState;
  try {
    state = (await request.json()) as WardrobeState;
  } catch {
    return NextResponse.json({ error: "Invalid wardrobe payload." }, { status: 400 });
  }
  const persisted = await persistItemImages(state);
  await writeWardrobe(persisted);
  return NextResponse.json({ mode: "db", state: persisted });
}
