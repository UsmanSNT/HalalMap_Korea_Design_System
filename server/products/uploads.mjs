import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { uploadsDir } from "../db.mjs";
import { HttpError } from "../lib/http.mjs";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/;
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MIME_BY_EXT = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
export const UPLOAD_NAME = /^[a-f0-9]{32}\.(?:jpg|png|webp)$/;

/** Verifies the real file type from magic bytes instead of trusting the declared MIME type. */
export const sniffImageType = (buffer) => {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.length > 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
};

export const decodeImageDataUrl = (dataUrl) => {
  if (typeof dataUrl !== "string") throw new HttpError(400, "Image must be a data URL", "invalid_image");
  const match = DATA_URL.exec(dataUrl);
  if (!match) throw new HttpError(400, "Only JPEG, PNG or WebP images are accepted", "invalid_image");
  const buffer = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
  if (buffer.length === 0) throw new HttpError(400, "Image is empty", "invalid_image");
  if (buffer.length > MAX_IMAGE_BYTES) throw new HttpError(413, "Image is larger than 4 MB", "image_too_large");
  const type = sniffImageType(buffer);
  if (!type || type !== match[1]) throw new HttpError(400, "Image content does not match its type", "invalid_image");
  return { buffer, mime: type };
};

/**
 * Stores an uploaded image under a content-hash file name. Returns the file name.
 * `kind` is part of the hash so an ingredient photo can never share a (public) file with a product photo.
 */
export const saveImage = (dataUrl, kind = "image") => {
  const { buffer, mime } = decodeImageDataUrl(dataUrl);
  mkdirSync(uploadsDir, { recursive: true });
  const name = `${createHash("sha256").update(`${kind}:`).update(buffer).digest("hex").slice(0, 32)}.${EXTENSIONS[mime]}`;
  const path = resolve(uploadsDir, name);
  if (!existsSync(path)) writeFileSync(path, buffer, { mode: 0o640 });
  return name;
};

export const readUpload = (name) => {
  if (!UPLOAD_NAME.test(name)) return null;
  const path = resolve(uploadsDir, name);
  if (!existsSync(path)) return null;
  return { buffer: readFileSync(path), mime: MIME_BY_EXT[name.split(".").pop()] };
};

export const uploadUrl = (name) => (name ? `/api/uploads/${name}` : null);
