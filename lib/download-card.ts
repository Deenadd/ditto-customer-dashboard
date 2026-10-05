import { isLightCard, type CardPalette } from "@/components/dashboard/card-config";
import type { ActivePolicy } from "@/lib/dashboard-data";

/*
 * The policy card's front, drawn on a canvas and saved as a PNG: the frame's
 * radial gradient, the insurer and policy, and the four facts on the white
 * inset. Drawn rather than screenshotted, so it looks the same from every
 * browser. 3× the on-screen 365 × 237, so it stays sharp when zoomed.
 */
const S = 3;
const W = 365 * S;
const H = 237 * S;
const FONT = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Inter, Roboto, sans-serif`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function downloadPolicyCard(policy: ActivePolicy, palette: CardPalette) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const light = isLightCard(palette);

  /* The frame. */
  roundRect(ctx, 0, 0, W, H, 16 * S);
  ctx.save();
  ctx.clip();
  const cx = (palette.focusX / 100) * W;
  const cy = (palette.focusY / 100) * H;
  const radius = Math.hypot(W, H) * 0.75 * palette.spread;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, palette.center);
  gradient.addColorStop(palette.midAt / 100, palette.mid);
  gradient.addColorStop(1, palette.edge);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  /* The three rings from the card's top-right corner. */
  ctx.strokeStyle = palette.wave;
  ctx.lineWidth = 1.5 * S;
  [36, 62, 88].forEach((r, i) => {
    ctx.globalAlpha = 0.55 - i * 0.15;
    ctx.beginPath();
    ctx.arc(W + 6 * S, -10 * S, r * S, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  /* The insurer's mark, in a white ring on a coloured card. */
  const logoSize = 40 * S;
  const lx = 16 * S;
  const ly = 16 * S;
  if (!light) {
    roundRect(ctx, lx - 2 * S, ly - 2 * S, logoSize + 4 * S, logoSize + 4 * S, 12 * S);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }
  const logo = policy.insurer === "care" ? await loadImage("/dashboard/insurer-care.png") : null;
  roundRect(ctx, lx, ly, logoSize, logoSize, 10 * S);
  ctx.fillStyle = policy.insurer === "care" ? "#fbdf00" : "#fce0c8";
  ctx.fill();
  if (logo) {
    ctx.save();
    roundRect(ctx, lx, ly, logoSize, logoSize, 10 * S);
    ctx.clip();
    ctx.drawImage(logo, lx, ly, logoSize, logoSize);
    ctx.restore();
  }

  ctx.fillStyle = light ? "#1d1d1f" : "#ffffff";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${16 * S}px ${FONT}`;
  ctx.fillText(policy.name, 68 * S, 34 * S, W - 84 * S);
  ctx.font = `500 ${12 * S}px ${FONT}`;
  if (light) ctx.fillStyle = "#6e6e73";
  ctx.fillText(policy.kind, 68 * S, 51 * S);

  /* The white inset and its facts. */
  const ix = 8 * S;
  const iy = 70 * S;
  if (!light) {
    roundRect(ctx, ix, iy, W - 16 * S, H - iy - 8 * S, 12 * S);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 8 * S;
    ctx.shadowOffsetY = 2 * S;
    ctx.fill();
    ctx.shadowColor = "transparent";
  }

  const fields = [
    { label: "Policy number", value: policy.policyNumber },
    { label: "Sum insured", value: policy.sumInsured },
    { label: "Coverage type", value: policy.coverageType },
    policy.term,
  ];
  fields.forEach((f, i) => {
    const x = (i % 2 === 0 ? 28 : 199) * S;
    const y = (i < 2 ? 108 : 176) * S;
    ctx.fillStyle = "#6e6e73";
    ctx.font = `400 ${12 * S}px ${FONT}`;
    ctx.fillText(f.label, x, y);
    ctx.fillStyle = "#1d1d1f";
    ctx.font = `600 ${14 * S}px ${FONT}`;
    ctx.fillText(f.value, x, y + 22 * S, 160 * S);
  });
  ctx.restore();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ditto-${policy.kind.toLowerCase().replace(/\s+/g, "-")}-card-${policy.policyNumber}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
