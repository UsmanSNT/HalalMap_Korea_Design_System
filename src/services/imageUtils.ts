// Photo helpers: downscale + re-encode before OCR/upload so phone photos (often 5-12 MB) stay small.

const loadBitmap = async (file: Blob): Promise<ImageBitmap> => {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return createImageBitmap(file);
  }
};

const drawScaled = async (file: Blob, maxSide: number) => {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas;
};

const toBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))), "image/jpeg", quality));

export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });

/** JPEG data URL of at most `maxSide` px, for uploads (server limit is 4 MB per image). */
export const imageToUploadDataUrl = async (file: Blob, maxSide = 1600, quality = 0.82): Promise<string> => {
  const canvas = await drawScaled(file, maxSide);
  let blob = await toBlob(canvas, quality);
  if (blob.size > 3_500_000) blob = await toBlob(canvas, 0.6);
  return blobToDataUrl(blob);
};

/** Grayscale + contrast stretch of a label photo; makes small Korean print easier for OCR. */
export const imageForOcr = async (file: Blob, maxSide = 2000): Promise<HTMLCanvasElement> => {
  const canvas = await drawScaled(file, maxSide);
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  let min = 255;
  let max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
    if (gray < min) min = gray;
    if (gray > max) max = gray;
  }
  const range = Math.max(1, max - min);
  for (let i = 0; i < data.length; i += 4) {
    const stretched = ((data[i] - min) / range) * 255;
    data[i] = data[i + 1] = data[i + 2] = stretched;
  }
  context.putImageData(image, 0, 0);
  return canvas;
};
