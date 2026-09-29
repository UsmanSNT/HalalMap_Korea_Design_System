import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "../db.mjs";
import { createApi } from "../app.mjs";
import { seedProductKnowledge } from "../products/seed.mjs";
import { RulesetCache } from "../products/rules/ruleset.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const fixture = (name) => JSON.parse(readFileSync(resolve(here, "fixtures", name), "utf8"));

/** The committed OpenStreetMap place snapshot (server/seed/places/osm-kr.json). */
export const fixtureSnapshot = () => JSON.parse(readFileSync(resolve(here, "..", "seed", "places", "osm-kr.json"), "utf8"));

export const makeKnowledgeDb = () => {
  const db = openDatabase(":memory:");
  seedProductKnowledge(db);
  return { db, cache: new RulesetCache(db) };
};

/** A fetch stand-in that records calls and answers from a routing function. */
export const fakeFetch = (handler) => {
  const calls = [];
  const impl = async (url, init) => {
    calls.push(String(url));
    const result = await handler(String(url), init);
    if (result instanceof Response) return result;
    return new Response(JSON.stringify(result.body ?? {}), { status: result.status ?? 200, headers: { "Content-Type": "application/json" } });
  };
  impl.calls = calls;
  return impl;
};

/** `snapshots: true` also loads the committed open-data place snapshots (off by default so tests start from the demo places). */
export const startApp = async ({ fetchImpl = fakeFetch(() => ({ status: 404 })), env = {}, snapshots = false } = {}) => {
  const db = openDatabase(":memory:");
  const server = createApi({ db, fetchImpl, env: { ...env }, seedSnapshots: snapshots });
  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, { method = "GET", body, token, headers = {} } = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const type = response.headers.get("content-type") ?? "";
    return { status: response.status, body: type.includes("json") ? await response.json() : Buffer.from(await response.arrayBuffer()), headers: response.headers };
  };
  const login = async (email = "admin@halalmap.test", password = "Admin123!") => (await request("/api/auth/login", { method: "POST", body: { email, password } })).body.token;
  return { db, base, request, login, fetchImpl, close: () => new Promise((done) => server.close(done)) };
};

// 1x1 PNG
export const TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
