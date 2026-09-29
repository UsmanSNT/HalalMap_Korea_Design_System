import { createHash } from "node:crypto";

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const json = (response, status, body, headers = {}) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(body));
};

/** Reads a JSON body, enforcing a byte limit (default 16 KB, like the original server). */
export const readJson = async (request, limit = 16_384) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, "Payload too large", "payload_too_large");
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON body", "invalid_json");
  }
};

/** Client IP; only honours X-Forwarded-For when TRUST_PROXY=1 (i.e. running behind a known reverse proxy). */
export const clientIp = (request) => {
  if (process.env.TRUST_PROXY === "1") {
    const forwarded = String(request.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
    if (forwarded) return forwarded;
  }
  return request.socket?.remoteAddress ?? "unknown";
};

/** One-way hash so IPs are never stored in clear text. */
export const hashIdentifier = (value) =>
  createHash("sha256").update(`halalmap:${value}`).digest("hex").slice(0, 24);

/** Fixed-window in-memory limiter: `check(key)` returns false when the caller is over the limit. */
export const createRateLimiter = ({ windowMs, max }) => {
  const hits = new Map();
  return {
    check(key, now = Date.now()) {
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        return true;
      }
      entry.count += 1;
      return entry.count <= max;
    },
  };
};

export const intParam = (value, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

export const floatParam = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseJsonColumn = (value, fallback = []) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};
