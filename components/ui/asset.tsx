import type { CSSProperties } from "react";

/**
 * An SVG exported from Figma, drawn as-is. These are icons and decorations at
 * fixed sizes, so they go straight to <img> instead of the image optimiser,
 * which would need SVG support switched on for no gain. Decorative by default.
 */
export function Asset({
  src,
  className = "",
  style,
  alt = "",
}: {
  src: string;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      className={`block max-w-none select-none ${className}`}
      style={style}
    />
  );
}

/**
 * A blurred glow from the Figma file. The SVG carries its blur, so it is
 * larger than the circle it draws: Figma places the circle and lets the image
 * spill out by 64.1% on every side.
 */
export function Glow({
  src,
  size = 156,
  bleed = "-64.1%",
  style,
}: {
  src: string;
  size?: number;
  bleed?: string;
  style: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{ width: size, height: size, ...style }}
    >
      <div className="absolute" style={{ inset: bleed }}>
        <Asset src={src} className="size-full" />
      </div>
    </div>
  );
}

export type Sparkle = {
  src: string;
  left: number;
  top: number;
  width: number;
  height?: number;
};

/** The scatter of stars or shields in a sidebar card's top-right corner. */
export function Sparkles({ items }: { items: Sparkle[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((item, index) => (
        <Asset
          key={index}
          src={item.src}
          className="absolute"
          style={{
            left: item.left,
            top: item.top,
            width: item.width,
            height: item.height ?? item.width,
          }}
        />
      ))}
    </div>
  );
}
