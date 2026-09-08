"use client";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function ItemImage({ src, alt, className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/placeholder-garment.svg"}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.src = "/placeholder-garment.svg";
      }}
    />
  );
}
