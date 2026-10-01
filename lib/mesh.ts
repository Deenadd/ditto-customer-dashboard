/**
 * A mesh gradient as a set of colour points. Each point is a soft ellipse of
 * its colour, solid at the centre and fading out by `size` (% of the surface);
 * stacked, they blend into a mesh. Positions are % across and down.
 */
export type MeshPoint = {
  id: string;
  x: number;
  y: number;
  color: string;
  /** Radius as % of the surface. */
  size: number;
  /** Strength at the centre, 0 to 1. */
  strength: number;
};

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

/** CSS background layers, first on top. Each fades to its own colour at 0
    alpha, so the edges blend without a grey seam. */
export function meshLayers(points: MeshPoint[], recolor: (hex: string) => string = (hex) => hex) {
  return [...points].reverse().map((point) => {
    const color = rgb(recolor(point.color));
    return `radial-gradient(${point.size}% ${point.size}% at ${point.x}% ${point.y}%, rgb(${color} / ${point.strength}) 0%, rgb(${color} / ${point.strength * 0.5}) 40%, rgb(${color} / 0) 100%)`;
  });
}

export const newPointId = () => Math.random().toString(36).slice(2, 8);
