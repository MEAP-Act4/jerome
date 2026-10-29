"use client";

/**
 * Client-side image preparation for the tutor's photo attachments.
 *
 * Phone photos are often 4-10 MB, which is too large to send as a base64 data
 * URL and far more resolution than the model needs. We downscale to a sensible
 * maximum edge and re-encode as JPEG before sending. The result is a data URL
 * that both the API and the persisted chat history can store safely.
 */

export const MAX_ATTACHMENTS = 3;
export const MAX_IMAGE_DATA_URL_LENGTH = 5_500_000;

const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const DIMENSION_STEPS = [1400, 1100, 900, 720];

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("I couldn't read that image."));
    reader.readAsDataURL(file);
  });
}

async function loadSource(
  file: File
): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Fall through to the <img> loader below.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("I couldn't open that image."));
      element.src = url;
    });
    return {
      source: image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareImageAttachment(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error("Please attach a JPG, PNG, or WebP photo.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("That photo is too large. Please use one under 12 MB.");
  }

  try {
    const { source, width, height } = await loadSource(file);
    if (!width || !height) throw new Error("I couldn't read that image.");

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser couldn't process that image.");

    for (const maxDimension of DIMENSION_STEPS) {
      const scale = Math.min(1, maxDimension / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));

      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.82, 0.72, 0.62, 0.52]) {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH) return dataUrl;
      }
    }

    throw new Error("That photo is still too large after resizing. Try a smaller one.");
  } catch (error) {
    // Small screenshots may fail in canvas on unusual browsers; send the
    // original data URL if it is already within the limit.
    try {
      const original = await readAsDataUrl(file);
      if (original.length <= MAX_IMAGE_DATA_URL_LENGTH) return original;
    } catch {
      // Ignore and report the original error below.
    }

    throw error instanceof Error
      ? error
      : new Error("I couldn't process that image. Try another one.");
  }
}
