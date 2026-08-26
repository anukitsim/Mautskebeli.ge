import Image from "next/image";

// Natural color, no overlay — same treatment as CardImage now. The violet duotone
// blend was dropped: it read as a pink cast over real thumbnails once seen across
// a full grid, not a deliberate identity device. Play mark is a custom SVG triangle
// (not a Unicode glyph, which renders inconsistently across platforms and looks
// like a default app icon) — small, bottom-left, outline-weight, in paper white.
export default function VideoThumb({ src, alt, sizes }) {
  if (!src) {
    return <div className="aspect-video w-full bg-mau-surface" />;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-mau-surface">
      <Image
        src={src}
        alt={alt || ""}
        fill
        sizes={sizes || "(max-width: 768px) 50vw, 25vw"}
        className="object-cover"
      />
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 opacity-90 transition-opacity duration-300 group-hover:opacity-100">
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none" className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          <path d="M0.5 0.8v11.4c0 .7.8 1.1 1.4.7l9-5.7c.5-.4.5-1.1 0-1.4l-9-5.7C1.3-.3.5.1.5.8Z" fill="#F2ECEA" />
        </svg>
      </div>
    </div>
  );
}
