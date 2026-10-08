import { Redis } from "@upstash/redis";

/**
 * Who has visited the prototype, kept in Upstash Redis (the Vercel
 * Marketplace integration sets KV_REST_API_URL and KV_REST_API_TOKEN; plain
 * Upstash names work too). Anonymous: each browser gets a number, User 1,
 * User 2…, from a random id it keeps; a visit is one browsing session, with
 * when, the kind of device and the first page. No names, no IP addresses.
 * Server only. Without the keys it reports itself not connected.
 */
export type Device = "phone" | "tablet" | "desktop";
export type Visit = { user: number; at: number; device: Device; page: string };

const KEYS = {
  users: "visits:users",
  userCount: "visits:user-count",
  total: "visits:total",
  log: "visits:log",
};
/* The log keeps the latest thousand visits; the totals count them all. */
const KEEP = 1000;

let client: Redis | null | undefined;
function redis() {
  if (client === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    client = url && token ? new Redis({ url, token }) : null;
  }
  return client;
}

export const visitsConnected = () => redis() !== null;

/** Records a visit and returns the visitor's number. */
export async function recordVisit(visitor: string, device: Device, page: string) {
  const db = redis();
  if (!db) throw new Error("Visits aren't connected");
  let user = await db.hget<number>(KEYS.users, visitor);
  if (user == null) {
    const next = await db.incr(KEYS.userCount);
    /* Two first visits at once from one browser: the first number sticks. */
    user = (await db.hsetnx(KEYS.users, visitor, next)) ? next : await db.hget<number>(KEYS.users, visitor);
  }
  const visit: Visit = { user: Number(user), at: Date.now(), device, page };
  await db.lpush(KEYS.log, visit);
  await db.ltrim(KEYS.log, 0, KEEP - 1);
  await db.incr(KEYS.total);
  return visit.user;
}

/** The latest visits, newest first, with how many people and visits in all. */
export async function recentVisits(limit = 100) {
  const db = redis();
  if (!db) throw new Error("Visits aren't connected");
  const [visits, people, total] = await Promise.all([
    db.lrange<Visit>(KEYS.log, 0, limit - 1),
    db.get<number>(KEYS.userCount),
    db.get<number>(KEYS.total),
  ]);
  return { visits, people: Number(people ?? 0), total: Number(total ?? 0) };
}
