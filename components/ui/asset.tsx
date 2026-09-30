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
