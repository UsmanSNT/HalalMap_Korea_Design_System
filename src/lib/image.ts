const MAX_SIDE_PX = 1280;
const MAX_BYTES = 2.5 * 1024 * 1024;

/**
 * Re-encodes any phone photo as a JPEG no larger than 1280px and under ~2.5 MB.
 * Drawing to a canvas also drops EXIF metadata (including GPS location) and applies the camera orientation.
 */
export async function compressToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas_unavailable");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.7, 0.55, 0.4]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= MAX_BYTES) return blob;
    }
    throw new Error("image_too_large");
  } finally {
    bitmap.close();
  }
}
