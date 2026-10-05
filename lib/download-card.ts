import type { ActivePolicy } from "@/lib/dashboard-data";

/*
 * The policy card's front, drawn on a canvas and saved as a PNG: the white
 * card with its glow and a few contour lines, the insurer and policy, and
 * the four facts in the outlined panel. Drawn rather than screenshotted, so it looks the same from every
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

export async function downloadPolicyCard(policy: ActivePolicy) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  /* The white card, with its soft blue glow in the top-right corner. */
  roundRect(ctx, 0, 0, W, H, 22 * S);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.95, 0, 0, W * 0.95, 0, 150 * S);
  glow.addColorStop(0, "rgba(112,190,252,0.35)");
  glow.addColorStop(1, "rgba(112,190,252,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  /* A few contour lines, after the card's topography. */
  ctx.strokeStyle = "rgba(61,171,245,0.18)";
  ctx.lineWidth = 1.2 * S;
  [60, 95, 130].forEach((r) => {
    ctx.beginPath();
    ctx.arc(W + 20 * S, -30 * S, r * S, 0, Math.PI * 2);
    ctx.stroke();
  });

  /* The insurer's mark. */
  const logoSize = 44 * S;
  const lx = 16 * S;
  const ly = 16 * S;
  const logo = policy.insurer === "care" ? await loadImage("/dashboard/insurer-care.png") : null;
  roundRect(ctx, lx, ly, logoSize, logoSize, 11 * S);
  ctx.fillStyle = policy.insurer === "care" ? "#fbdf00" : "#fce0c8";
  ctx.fill();
  if (logo) {
    ctx.save();
    roundRect(ctx, lx, ly, logoSize, logoSize, 11 * S);
    ctx.clip();
    ctx.drawImage(logo, lx, ly, logoSize, logoSize);
    ctx.restore();
  }

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1d1d1f";
  ctx.font = `600 ${17 * S}px ${FONT}`;
  ctx.fillText(policy.name, 74 * S, 35 * S, W - 90 * S);
  ctx.font = `400 ${13 * S}px ${FONT}`;
  ctx.fillText(policy.kind, 74 * S, 53 * S);

  /* The outlined panel and its facts. */
  const ix = 8 * S;
  const iy = 74 * S;
  roundRect(ctx, ix, iy, W - 16 * S, H - iy - 8 * S, 14 * S);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.06)";
  ctx.shadowBlur = 10 * S;
  ctx.shadowOffsetY = 3 * S;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1 * S;
  ctx.stroke();

  const fields = [
    { label: "Policy number", value: policy.policyNumber },
    { label: "Sum insured", value: policy.sumInsured },
    { label: "Coverage type", value: policy.coverageType },
    policy.term,
  ];
  fields.forEach((f, i) => {
    const x = (i % 2 === 0 ? 28 : 199) * S;
    const y = (i < 2 ? 110 : 174) * S;
    ctx.fillStyle = "#6e6e73";
    ctx.font = `400 ${13 * S}px ${FONT}`;
    ctx.fillText(f.label, x, y);
    ctx.fillStyle = "#1d1d1f";
    ctx.font = `500 ${15 * S}px ${FONT}`;
    ctx.fillText(f.value, x, y + 23 * S, 160 * S);
  });
  ctx.restore();

  /* The card's hairline edge. */
  roundRect(ctx, 0.5 * S, 0.5 * S, W - 1 * S, H - 1 * S, 22 * S);
  ctx.strokeStyle = "rgba(0,0,0,0.07)";
  ctx.lineWidth = 1 * S;
  ctx.stroke();

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
