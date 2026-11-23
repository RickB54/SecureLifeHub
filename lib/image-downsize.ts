"use client"

export interface PreparedAttachment {
  file: File
  dataUrl?: string
  originalBytes: number
  finalBytes: number
  isImage: boolean
  sizeSummary: string
}

const MAX_NON_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_IMAGE_DIMENSION = 1600
const TARGET_IMAGE_BYTES = 300 * 1024 // 300 KB

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not read image file."))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality)
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read compressed image."))
    reader.readAsDataURL(blob)
  })
}

/**
 * Downsizes images in the browser:
 * - Longest side <= 1600px
 * - Converts to WebP (fallback JPEG) at quality ~0.7, stepping down to aim under 300 KB
 * - Rejects non-image files (e.g. PDF) over 5 MB with a clear message
 */
export async function prepareHealthAttachment(
  file: File,
  options?: { includeDataUrl?: boolean }
): Promise<PreparedAttachment> {
  const originalBytes = file.size
  const isImage = file.type.startsWith("image/")

  if (!isImage) {
    if (originalBytes > MAX_NON_IMAGE_BYTES) {
      throw new Error(
        `File is too large (${formatBytes(originalBytes)}). Non-image files (like PDFs) must be 5 MB or smaller.`
      )
    }
    const dataUrl = options?.includeDataUrl ? await blobToDataUrl(file) : undefined
    return {
      file,
      dataUrl,
      originalBytes,
      finalBytes: originalBytes,
      isImage: false,
      sizeSummary: `Ready (${formatBytes(originalBytes)})`,
    }
  }

  const img = await loadImageFromFile(file)
  let { width, height } = img
  const longest = Math.max(width, height)
  if (longest > MAX_IMAGE_DIMENSION) {
    const scale = MAX_IMAGE_DIMENSION / longest
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Browser canvas unavailable for image resizing.")
  ctx.drawImage(img, 0, 0, width, height)

  // Prefer WebP if supported, otherwise JPEG
  let targetMime = "image/webp"
  let bestBlob = await canvasToBlob(canvas, targetMime, 0.72)
  if (!bestBlob || bestBlob.type !== "image/webp") {
    targetMime = "image/jpeg"
    bestBlob = await canvasToBlob(canvas, targetMime, 0.72)
  }

  // Step down quality to aim under 300 KB
  const qualities = [0.62, 0.52, 0.42]
  for (const q of qualities) {
    if (bestBlob && bestBlob.size <= TARGET_IMAGE_BYTES) break
    const candidate = await canvasToBlob(canvas, targetMime, q)
    if (candidate && (!bestBlob || candidate.size < bestBlob.size)) {
      bestBlob = candidate
    }
  }

  if (!bestBlob) {
    throw new Error("Failed to compress image.")
  }

  const ext = targetMime === "image/webp" ? "webp" : "jpg"
  const baseName = file.name.replace(/\.[^/.]+$/, "")
  const resizedFile = new File([bestBlob], `${baseName}.${ext}`, {
    type: targetMime,
    lastModified: Date.now(),
  })

  const finalBytes = resizedFile.size
  const sizeSummary = `Saved ${formatBytes(finalBytes)} (was ${formatBytes(originalBytes)})`
  const dataUrl = options?.includeDataUrl ? await blobToDataUrl(resizedFile) : undefined

  return {
    file: resizedFile,
    dataUrl,
    originalBytes,
    finalBytes,
    isImage: true,
    sizeSummary,
  }
}
