const MAX_EDGE = 720;
const BG_THRESHOLD = 92;
const OUTLINE = 4;

function nearBackground(
  data: Uint8ClampedArray,
  index: number,
  bg: { r: number; g: number; b: number },
) {
  const dr = Math.abs(data[index] - bg.r);
  const dg = Math.abs(data[index + 1] - bg.g);
  const db = Math.abs(data[index + 2] - bg.b);
  return dr + dg + db < BG_THRESHOLD;
}

function floodFromSeed(
  data: Uint8ClampedArray,
  original: Uint8ClampedArray,
  width: number,
  height: number,
  seedX: number,
  seedY: number,
  consumed: Uint8Array,
) {
  const seedIndex = (seedY * width + seedX) * 4;
  if (original[seedIndex + 3] < 8) return;
  const seed = {
    r: original[seedIndex],
    g: original[seedIndex + 1],
    b: original[seedIndex + 2],
  };
  const stack = [seedY * width + seedX];
  const local = new Uint8Array(width * height);

  while (stack.length) {
    const pixel = stack.pop();
    if (pixel === undefined) break;
    if (local[pixel] || consumed[pixel]) continue;
    local[pixel] = 1;
    const index = pixel * 4;
    if (!nearBackground(original, index, seed)) continue;
    consumed[pixel] = 1;
    data[index + 3] = 0;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) stack.push(pixel - 1);
    if (x + 1 < width) stack.push(pixel + 1);
    if (y > 0) stack.push(pixel - width);
    if (y + 1 < height) stack.push(pixel + width);
  }
}

function floodClearBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const original = new Uint8ClampedArray(data);
  const consumed = new Uint8Array(width * height);
  const step = Math.max(1, Math.floor(Math.min(width, height) / 48));

  for (let x = 0; x < width; x += step) {
    floodFromSeed(data, original, width, height, x, 0, consumed);
    floodFromSeed(data, original, width, height, x, height - 1, consumed);
  }
  for (let y = 0; y < height; y += step) {
    floodFromSeed(data, original, width, height, 0, y, consumed);
    floodFromSeed(data, original, width, height, width - 1, y, consumed);
  }
}

function addWhiteOutline(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const opaque = new Uint8Array(width * height);
  for (let i = 0; i < opaque.length; i += 1) {
    opaque[i] = data[i * 4 + 3] > 24 ? 1 : 0;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      if (opaque[pixel]) continue;
      let ring = false;
      for (let dy = -OUTLINE; dy <= OUTLINE && !ring; dy += 1) {
        for (let dx = -OUTLINE; dx <= OUTLINE; dx += 1) {
          if (dx * dx + dy * dy > OUTLINE * OUTLINE) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (opaque[ny * width + nx]) {
            ring = true;
            break;
          }
        }
      }
      if (!ring) continue;
      const index = pixel * 4;
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = 255;
    }
  }
}

function cropToSubject(canvas: HTMLCanvasElement, data: ImageData) {
  const { width, height } = canvas;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data.data[(y * width + x) * 4 + 3] < 12) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX <= minX || maxY <= minY) return canvas;
  const pad = OUTLINE + 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const cropped = document.createElement("canvas");
  cropped.width = cropW;
  cropped.height = cropH;
  cropped.getContext("2d")?.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
  return cropped;
}

export async function imageToSticker(src: string): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const next = new Image();
    if (!src.startsWith("data:")) next.crossOrigin = "anonymous";
    next.onload = () => resolve(next);
    next.onerror = () => reject(new Error("Unable to load sticker image."));
    next.src = src;
  });

  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return src;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let transparent = 0;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] < 12) transparent += 1;
  }
  const alreadyCutout = transparent / (canvas.width * canvas.height) > 0.18;

  if (!alreadyCutout) {
    const snapshot = new Uint8ClampedArray(imageData.data);
    floodClearBackground(imageData.data, canvas.width, canvas.height);
    let opaque = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 24) opaque += 1;
    }
    if (opaque / (canvas.width * canvas.height) < 0.08) {
      imageData.data.set(snapshot);
    }
  }
  addWhiteOutline(imageData.data, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
  return cropToSubject(canvas, imageData).toDataURL("image/png");
}
