import imageCompression from "browser-image-compression"

const MAX_DIMENSION_PX = 512
const TARGET_MAX_SIZE_MB = 0.3
const OUTPUT_TYPE = "image/webp"

/**
 * Resizes/re-encodes a logo client-side before upload. Runs in a Web Worker
 * (useWebWorker: true) so it never blocks the form's input thread.
 */
export async function compressLogoImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: MAX_DIMENSION_PX,
    maxSizeMB: TARGET_MAX_SIZE_MB,
    useWebWorker: true,
    fileType: OUTPUT_TYPE,
    initialQuality: 0.8,
  })
}
