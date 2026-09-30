import { Asset } from "@/components/ui/asset";

type Layer = {
  src: string;
  inset: string;
  width: string;
  height: string;
  opacity?: number;
};

/*
 * The contour lines behind an active policy card (Group 86278). Figma draws
 * them as a rotated, skewed group, and exports each layer with the maths to
 * put it back: a sized box per layer, and inside it a child whose width and
 * height are the hypotenuse of the box's own container units. These are the
 * exported values, unchanged.
 */
const wide = {
  width: "hypot(23.2543cqw, 75.3132cqh)",
  height: "hypot(-76.7457cqw, 24.6868cqh)",
};
const middle = {
  width: "hypot(23.2353cqw, 75.2933cqh)",
  height: "hypot(-76.7647cqw, 24.7067cqh)",
};
const narrow = {
  width: "hypot(23.2608cqw, 75.3199cqh)",
  height: "hypot(-76.7392cqw, 24.6801cqh)",
};
const smallest = {
  width: "hypot(23.2482cqw, 75.3068cqh)",
  height: "hypot(-76.7518cqw, 24.6932cqh)",
};

function policyLayers(muted: boolean): Layer[] {
  const tone = muted ? "-inactive" : "";
  return [
    {
      src: `/dashboard/topo/policy-base${tone}.png`,
      inset: "-99.16% -48.22% 29.98% 47.67%",
      opacity: 0.15,
      ...wide,
    },
    {
      src: `/dashboard/topo/policy-1${tone}.svg`,
      inset: "-79.39% -36.59% 49.57% 59.39%",
      ...middle,
    },
    {
      src: `/dashboard/topo/policy-2${tone}.svg`,
      inset: "-61.86% -23.7% 69.9% 69.06%",
      ...narrow,
    },
  ];
}

function memberLayers(muted: boolean): Layer[] {
  const tone = muted ? "-inactive" : "";
  return [
    {
      src: `/dashboard/topo/members-base${tone}.png`,
      inset: "29.11% -48.22% -98.29% 47.67%",
      opacity: 0.2,
      ...wide,
    },
    {
      src: `/dashboard/topo/members-1${tone}.svg`,
      inset: "48.88% -36.59% -78.7% 59.39%",
      ...middle,
    },
    {
      src: `/dashboard/topo/members-2${tone}.svg`,
      inset: "83.36% -13.63% -41.42% 79.13%",
      ...smallest,
    },
    {
      src: `/dashboard/topo/members-3${tone}.svg`,
      inset: "66.41% -23.7% -58.37% 69.06%",
      ...narrow,
    },
  ];
}

export function Topography({
  variant,
  muted = false,
}: {
  variant: "policy" | "members";
  muted?: boolean;
}) {
  const layers = variant === "policy" ? policyLayers(muted) : memberLayers(muted);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {layers.map((layer) => (
        <div
          key={layer.src}
          className="absolute flex items-center justify-center"
          style={{ inset: layer.inset, containerType: "size" }}
        >
          <div
            className="relative flex-none"
            style={{
              width: layer.width,
              height: layer.height,
              transform: "rotate(74.22deg) skewX(3.58deg)",
              opacity: layer.opacity,
            }}
          >
            <Asset src={layer.src} className="absolute inset-0 size-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
