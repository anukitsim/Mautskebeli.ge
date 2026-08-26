import Image from "next/image";

// Real photos, no color treatment — reserved for photo-based cards (news, article,
// free column, translate). Client call: photojournalism stays true to source;
// the violet identity is carried by the chip/border/type around the image, not on top of it.
// Video gets a different treatment — see VideoThumb.jsx.
export default function CardImage({ src, alt, sizes, priority = false }) {
  if (!src) {
    return <div className="aspect-video w-full bg-mau-surface" />;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-mau-surface">
      <Image
        src={src}
        alt={alt || ""}
        fill
        priority={priority}
        sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
        className="object-cover"
      />
    </div>
  );
}
