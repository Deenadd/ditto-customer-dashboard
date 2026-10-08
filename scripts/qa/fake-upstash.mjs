#!/usr/bin/env node
/*
 * A stand-in for Upstash Redis's REST API, in memory, for testing the visit
 * log without the real database: only the commands lib/visits.ts uses.
 *
 *   node scripts/qa/fake-upstash.mjs 8079 &
 *   UPSTASH_REDIS_REST_URL=http://127.0.0.1:8079 UPSTASH_REDIS_REST_TOKEN=test npx next start -p 3123
 */
import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 8079);
const strings = new Map();
const hashes = new Map();
const lists = new Map();
const hash = (k) => hashes.get(k) ?? hashes.set(k, new Map()).get(k);
const list = (k) => lists.get(k) ?? lists.set(k, []).get(k);
const range = (items, start, stop) => items.slice(start, stop < 0 ? items.length + stop + 1 : stop + 1);

function run([name, key, ...args]) {
  switch (String(name).toLowerCase()) {
    case "get": return strings.get(key) ?? null;
    case "incr": { const n = Number(strings.get(key) ?? 0) + 1; strings.set(key, String(n)); return n; }
    case "hget": return hash(key).get(String(args[0])) ?? null;
    case "hsetnx": { const h = hash(key); if (h.has(String(args[0]))) return 0; h.set(String(args[0]), String(args[1])); return 1; }
    case "lpush": { const l = list(key); for (const v of args) l.unshift(typeof v === "string" ? v : JSON.stringify(v)); return l.length; }
    case "ltrim": { lists.set(key, range(list(key), Number(args[0]), Number(args[1]))); return "OK"; }
    case "lrange": return range(list(key), Number(args[0]), Number(args[1]));
    default: throw new Error(`fake-upstash: ${name} isn't supported`);
  }
}

const encode = (v) => (typeof v === "string" && v !== "OK" ? Buffer.from(v).toString("base64") : Array.isArray(v) ? v.map(encode) : v);

createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const base64 = String(req.headers["upstash-encoding"] ?? "").toLowerCase() === "base64";
    const reply = (result) => ({ result: base64 ? encode(result) : result });
    try {
      const parsed = JSON.parse(body || "[]");
      const out = req.url?.startsWith("/pipeline") || req.url?.startsWith("/multi-exec") ? parsed.map((c) => reply(run(c))) : reply(run(parsed));
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(out));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: String(error.message) }));
    }
  });
}).listen(port, "127.0.0.1", () => console.log(`fake upstash on ${port}`));
