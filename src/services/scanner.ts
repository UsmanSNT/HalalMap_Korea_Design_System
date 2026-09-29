// Camera barcode scanning for the mobile browser.
//   1. Native BarcodeDetector (Chrome/Android, Safari 17+ on some platforms) when available.
//   2. ZXing (@zxing/library, loaded lazily) everywhere else, e.g. iOS Safari and desktop Chrome on Linux.
// Formats: EAN-13, EAN-8, UPC-A, UPC-E and QR (only GS1 Digital Link QR codes identify a product).

import { acceptableBarcode } from "./barcode";

export type ScanMode = "native" | "zxing";
export type ScanEvent = { code: string; format: string; mode: ScanMode };

type BarcodeDetectorLike = {
  detect(source: CanvasImageSource): Promise<{ rawValue: string; format: string }[]>;
};
type BarcodeDetectorCtor = { new (options: { formats: string[] }): BarcodeDetectorLike; getSupportedFormats?: () => Promise<string[]> };

const WANTED_NATIVE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code"];

const nativeDetector = async (): Promise<BarcodeDetectorLike | null> => {
  const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  if (!Ctor) return null;
  try {
    const supported = (await Ctor.getSupportedFormats?.()) ?? WANTED_NATIVE_FORMATS;
    const formats = WANTED_NATIVE_FORMATS.filter((format) => supported.includes(format));
    // A "native" detector that cannot read EAN codes (some desktop builds) is useless: use ZXing instead.
    if (!formats.includes("ean_13")) return null;
    return new Ctor({ formats });
  } catch {
    return null;
  }
};

type ZXing = typeof import("@zxing/library");

const loadZxing = async () => {
  const zxing: ZXing = await import("@zxing/library");
  const hints = new Map<import("@zxing/library").DecodeHintType, unknown>();
  hints.set(zxing.DecodeHintType.POSSIBLE_FORMATS, [
    zxing.BarcodeFormat.EAN_13,
    zxing.BarcodeFormat.EAN_8,
    zxing.BarcodeFormat.UPC_A,
    zxing.BarcodeFormat.UPC_E,
    zxing.BarcodeFormat.QR_CODE,
  ]);
  hints.set(zxing.DecodeHintType.TRY_HARDER, true);
  const reader = new zxing.MultiFormatReader();
  reader.setHints(hints);
  return { zxing, reader };
};

const formatName = (format: string | number, zxing?: ZXing): string =>
  typeof format === "number" && zxing ? zxing.BarcodeFormat[format] ?? String(format) : String(format).toUpperCase();

export type ScannerHandle = { mode: ScanMode; stop: () => void; setTorch: (on: boolean) => Promise<boolean>; torchSupported: boolean };

/**
 * Starts the camera on `video` and calls `onScan` once per accepted barcode (a code must be read on two
 * consecutive frames and pass the GTIN check). Throws with `name` = NotAllowedError/NotFoundError/… on camera problems.
 */
export const startCameraScan = async (video: HTMLVideoElement, onScan: (event: ScanEvent) => void): Promise<ScannerHandle> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error("Camera API is not available (needs HTTPS or localhost)"), { name: "NotSupportedError" });
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
  });
  video.srcObject = stream;
  video.setAttribute("playsinline", "true");
  video.muted = true;
  await video.play().catch(() => undefined);

  const track = stream.getVideoTracks()[0];
  const capabilities = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean; focusMode?: string[] };
  if (capabilities.focusMode?.includes("continuous")) {
    await track.applyConstraints({ advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet] }).catch(() => undefined);
  }

  let stopped = false;
  let timer = 0;
  let last: string | null = null;
  let mode: ScanMode = "native";
  const canvas = document.createElement("canvas");

  const accept = (raw: string, format: string, currentMode: ScanMode) => {
    const code = acceptableBarcode(raw);
    if (!code) return;
    if (last === code) {
      stopped = true;
      onScan({ code, format, mode: currentMode });
    } else last = code;
  };

  const native = await nativeDetector();
  if (native) {
    mode = "native";
    const tick = async () => {
      if (stopped) return;
      try {
        if (video.readyState >= 2) {
          const found = await native.detect(video);
          if (found[0]) accept(found[0].rawValue, formatName(found[0].format), "native");
          else last = null;
        }
      } catch {
        /* a failed frame is not fatal */
      }
      if (!stopped) timer = window.setTimeout(tick, 120);
    };
    timer = window.setTimeout(tick, 120);
  } else {
    mode = "zxing";
    const { zxing, reader } = await loadZxing();
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const tick = () => {
      if (stopped) return;
      try {
        if (context && video.readyState >= 2 && video.videoWidth > 0) {
          // Analyse the central band where the user aims the barcode (faster and less noisy than the full frame).
          const width = Math.min(video.videoWidth, 900);
          const scale = width / video.videoWidth;
          canvas.width = width;
          canvas.height = Math.round(video.videoHeight * scale);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const source = new zxing.HTMLCanvasElementLuminanceSource(canvas);
          const bitmap = new zxing.BinaryBitmap(new zxing.HybridBinarizer(source));
          try {
            const result = reader.decodeWithState(bitmap);
            accept(result.getText(), formatName(result.getBarcodeFormat(), zxing), "zxing");
          } catch {
            last = null; // NotFoundException on most frames
          }
        }
      } finally {
        if (!stopped) timer = window.setTimeout(tick, 150);
      }
    };
    timer = window.setTimeout(tick, 150);
  }

  return {
    mode,
    torchSupported: Boolean(capabilities.torch),
    setTorch: async (on: boolean) => {
      try {
        await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
        return true;
      } catch {
        return false;
      }
    },
    stop: () => {
      stopped = true;
      window.clearTimeout(timer);
      stream.getTracks().forEach((t) => t.stop());
      // A newer scan session may already own this <video> (React StrictMode / retry): never clear its stream.
      if (video.srcObject === stream) video.srcObject = null;
    },
  };
};

/** Decodes a barcode from a photo (gallery upload). Tries the original and a few scaled versions. */
export const decodeBarcodeFromFile = async (file: File): Promise<ScanEvent | null> => {
  const bitmap = await createImageBitmap(file);
  const native = await nativeDetector();
  if (native) {
    const found = await native.detect(bitmap).catch(() => []);
    for (const item of found) {
      const code = acceptableBarcode(item.rawValue);
      if (code) return { code, format: formatName(item.format), mode: "native" };
    }
  }
  const { zxing, reader } = await loadZxing();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  for (const maxSide of [1600, 1000, 2400]) {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    try {
      const result = reader.decodeWithState(new zxing.BinaryBitmap(new zxing.HybridBinarizer(new zxing.HTMLCanvasElementLuminanceSource(canvas))));
      const code = acceptableBarcode(result.getText());
      if (code) return { code, format: formatName(result.getBarcodeFormat(), zxing), mode: "zxing" };
    } catch {
      /* try the next scale */
    }
  }
  return null;
};
