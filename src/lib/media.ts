export function displayImageSrc(src: string) {
  if (!src) return src;
  if (src.startsWith("data:") || src.startsWith("/")) return src;
  try {
    const host = new URL(src).hostname;
    if (host.endsWith("blob.vercel-storage.com")) {
      return `/api/media/view?url=${encodeURIComponent(src)}`;
    }
  } catch {
    return src;
  }
  return src;
}
