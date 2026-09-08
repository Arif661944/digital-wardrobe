import { NextResponse } from "next/server";

export const maxDuration = 120;

const GARMENT_STICKER_PROMPT = `Isolate ONLY the clothing garment from this photo as a clean product cutout.

Remove the person completely: face, skin, hair, body, hands, legs, and pose.
Do not keep a mannequin, ghost body, or silhouette of the wearer.
Keep the real garment's color, fabric, pattern, and shape.
Do not invent extra accessories or a new outfit.

Give the garment a thin, even white outline around its edges, like a WhatsApp sticker.
Keep everything outside that outline fully transparent. Do not add a white background, glow, or drop shadow.
Present a single clothing item, ready to use as a sticker.`;

function dataUrlToBlob(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data.");
  const mime = match[1];
  const bytes = Buffer.from(match[2], "base64");
  return { mime, bytes };
}

async function editWithModel(
  bytes: Buffer,
  mime: string,
  apiKey: string,
  model: string,
) {
  const form = new FormData();
  form.append("model", model);
  form.append(
    "image",
    new Blob([new Uint8Array(bytes)], { type: mime }),
    mime.includes("png") ? "item.png" : "item.jpg",
  );
  form.append("prompt", GARMENT_STICKER_PROMPT);
  form.append("background", "transparent");
  form.append("output_format", "png");
  form.append("quality", "medium");
  form.append("size", "1024x1024");
  form.append("input_fidelity", "high");

  return fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });
}

async function readApiError(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as {
      error?: { message?: string };
      message?: string;
    };
    return json.error?.message || json.message || text.slice(0, 280);
  } catch {
    return text.slice(0, 280) || `OpenAI error ${response.status}`;
  }
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Add OPENAI_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 },
    );
  }

  let payload: { image?: string };
  try {
    payload = (await request.json()) as { image?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!payload.image?.startsWith("data:")) {
    return NextResponse.json({ error: "Send a photo to convert." }, { status: 400 });
  }

  let mime: string;
  let bytes: Buffer;
  try {
    ({ mime, bytes } = dataUrlToBlob(payload.image));
  } catch {
    return NextResponse.json({ error: "Could not read that photo." }, { status: 400 });
  }

  let response = await editWithModel(bytes, mime, apiKey, "gpt-image-1.5");
  if (!response.ok) {
    const firstError = await readApiError(response);
    if (/model|not found|does not exist/i.test(firstError)) {
      response = await editWithModel(bytes, mime, apiKey, "gpt-image-1");
    } else {
      return NextResponse.json({ error: firstError }, { status: 502 });
    }
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: await readApiError(response) },
      { status: 502 },
    );
  }

  const json = (await response.json()) as {
    data?: { b64_json?: string }[];
  };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json(
      { error: "OpenAI did not return a sticker image." },
      { status: 502 },
    );
  }

  return NextResponse.json({ image: `data:image/png;base64,${b64}` });
}
