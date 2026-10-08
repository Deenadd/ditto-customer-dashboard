import { recentVisits, recordVisit, visitsConnected, type Device } from "@/lib/visits";

/* POST: a browser starting a visit. GET: the list for the controls panel
   (Shift+Option+C on the home page). Never cached. */

const devices: Device[] = ["phone", "tablet", "desktop"];

export async function POST(request: Request) {
  if (!visitsConnected()) return Response.json({ connected: false }, { status: 503 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }
  const { visitor, device, page } = body ?? {};
  const valid =
    typeof visitor === "string" &&
    /^[A-Za-z0-9-]{8,64}$/.test(visitor) &&
    devices.includes(device as Device) &&
    typeof page === "string" &&
    page.startsWith("/") &&
    page.length <= 120;
  if (!valid) return Response.json({ error: "That isn't a visit." }, { status: 400 });
  try {
    return Response.json({ user: await recordVisit(visitor, device as Device, page) });
  } catch {
    return Response.json({ error: "Couldn't record the visit." }, { status: 502 });
  }
}

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  if (!visitsConnected()) return Response.json({ connected: false }, { headers });
  try {
    return Response.json({ connected: true, ...(await recentVisits()) }, { headers });
  } catch {
    return Response.json({ connected: true, error: "Couldn't load the visits." }, { status: 502, headers });
  }
}
