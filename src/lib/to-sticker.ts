export async function stickerApiConfigured() {
  try {
    const response = await fetch("/api/sticker");
    const data = (await response.json()) as { configured?: boolean };
    return Boolean(data.configured);
  } catch {
    return false;
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to shrink this sticker."));
    image.src = src;
  });
}

export async function shrinkSticker(src: string, maxEdge = 900) {
  const image = await loadImage(src);
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webp = canvas.toDataURL("image/webp", 0.82);
  if (webp.startsWith("data:image/webp") && webp.length < src.length) return webp;
  const png = canvas.toDataURL("image/png");
  return png.length < src.length ? png : src;
}

async function dataUrlToFile(dataUrl: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  if (!blob.size) return null;
  const mime = blob.type || "image/jpeg";
  const extension = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  return new File([blob], `photo.${extension}`, { type: mime });
}

async function compressPhoto(src: string, maxEdge = 1280) {
  if (!src.startsWith("data:image/jpeg") && !src.startsWith("data:image/jpg")) {
    return src;
  }
  const image = await loadImage(src);
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

async function readResponseJson(response: Response) {
  const text = await response.text();
  if (!text) {
    throw new Error(
      `Could not store this photo (${response.status || "empty response"}). Try a smaller image.`,
    );
  }
  try {
    return JSON.parse(text) as { url?: string; error?: string };
  } catch {
    throw new Error("Could not store this photo. Try a smaller image.");
  }
}

export async function persistImage(image: string) {
  if (!image.startsWith("data:")) return image;
  const compressed = await compressPhoto(image);
  const file = await dataUrlToFile(compressed);
  let response: Response;
  if (file) {
    const body = new FormData();
    body.append("image", file);
    response = await fetch("/api/media", { method: "POST", body });
  } else {
    response = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: compressed }),
    });
  }
  const data = await readResponseJson(response);
  if (!response.ok || !data.url) {
    throw new Error(data.error || "Could not store this photo.");
  }
  return data.url;
}

export async function convertToSticker(image: string) {
  const response = await fetch("/api/sticker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image }),
  });
  const data = (await response.json()) as { image?: string; error?: string };
  if (!response.ok || !data.image) {
    throw new Error(data.error || "OpenAI could not isolate that garment.");
  }
  let sticker = data.image;
  try {
    sticker = await shrinkSticker(data.image);
  } catch {
    sticker = data.image;
  }
  return persistImage(sticker);
}
