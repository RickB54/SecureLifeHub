/**
 * compression.ts
 *
 * Lightweight Gzip compression/decompression utilities using Web Standard CompressionStream.
 * Compresses string values, encodes to Base64, and prefixes with "gz1:".
 * Gracefully falls back to plain text if CompressionStream is unsupported.
 */

export async function gzipCompress(text: string): Promise<string> {
  if (typeof text !== "string" || text.length === 0) return text

  if (typeof CompressionStream === "undefined") {
    return text // fallback to uncompressed
  }

  try {
    const encoder = new TextEncoder()
    const encodedData = encoder.encode(text)

    const blob = new Blob([encodedData])
    const stream = blob.stream().pipeThrough(new CompressionStream("gzip"))
    const compressedBuffer = await new Response(stream).arrayBuffer()

    const bytes = new Uint8Array(compressedBuffer)
    let binary = ""
    const chunkSize = 8192
    for (let i = 0; i < bytes.byteLength; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(i, i + chunkSize) as unknown as number[]
      )
    }

    return "gz1:" + btoa(binary)
  } catch (err) {
    console.warn("Gzip compression failed, falling back to plain text:", err)
    return text
  }
}

export async function gzipDecompress(data: string): Promise<string> {
  if (typeof data !== "string" || !data.startsWith("gz1:")) {
    return data // uncompressed or not prefixed
  }

  if (typeof DecompressionStream === "undefined") {
    console.warn("DecompressionStream unsupported in environment")
    return data
  }

  try {
    const base64 = data.slice(4)
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const blob = new Blob([bytes])
    const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"))
    return await new Response(stream).text()
  } catch (err) {
    console.error("Gzip decompression failed:", err)
    return data
  }
}

export async function getContentHash(text: string): Promise<string> {
  if (!text) return "empty"

  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    } catch {
      // Fallback below
    }
  }

  // FNV-1a 32-bit hash fallback
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}

export function getByteLength(str: string): number {
  if (!str) return 0
  return new Blob([str]).size
}
