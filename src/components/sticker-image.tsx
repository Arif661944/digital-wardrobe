"use client";

import { useEffect, useState } from "react";
import { ItemImage } from "@/components/item-image";
import { imageToSticker } from "@/lib/sticker";

const cache = new Map<string, string>();
const CACHE_VERSION = "sticker-v2";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function StickerImage({ src, alt, className }: Props) {
  const cacheKey = `${CACHE_VERSION}:${src}`;
  const [sticker, setSticker] = useState(cache.get(cacheKey) ?? "");

  useEffect(() => {
    if (!src) return;
    const key = `${CACHE_VERSION}:${src}`;
    const cached = cache.get(key);
    if (cached) {
      setSticker(cached);
      return;
    }
    let cancelled = false;
    imageToSticker(src)
      .then((next) => {
        cache.set(key, next);
        if (!cancelled) setSticker(next);
      })
      .catch(() => {
        if (!cancelled) setSticker(src);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <ItemImage
      src={sticker || src}
      alt={alt}
      className={className}
    />
  );
}
