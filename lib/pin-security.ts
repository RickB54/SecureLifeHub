export const PIN_RESET_FLAG = "pin_reset_1234_done"
export const SECURITY_SETTINGS_KEY = "hub_security_settings"

export const ALL_LOCK_MODULE_IDS = [
  "passwords",
  "type-diary",
  "financial-cards",
  "type-budget",
  "type-health-records",
  "type-vehicles",
  "type-business",
  "type-assets",
  "type-digital-life",
  "type-subscriptions",
  "type-secure-notes",
  "type-media",
  "type-goals",
  "type-knowledge",
  "type-travel",
]

/**
 * One-time reset that sets the PIN for ALL module locks to "1234",
 * overwriting any existing PINs. Stored flag "pin_reset_1234_done" guarantees
 * it runs only once and never overwrites PINs the user changes afterward.
 */
export function ensurePinReset1234(): void {
  if (typeof window === "undefined") return
  try {
    const isDone = localStorage.getItem(PIN_RESET_FLAG)
    if (isDone) return

    let current: Record<string, { isLocked: boolean; pin: string }> = {}
    const raw = localStorage.getItem(SECURITY_SETTINGS_KEY)
    if (raw) {
      try {
        current = JSON.parse(raw)
      } catch (e) {}
    }

    const updated: Record<string, { isLocked: boolean; pin: string }> = { ...current }
    for (const modId of ALL_LOCK_MODULE_IDS) {
      const existing = updated[modId] || { isLocked: false, pin: "1234" }
      updated[modId] = {
        ...existing,
        pin: "1234",
      }
    }

    localStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(updated))
    localStorage.setItem(PIN_RESET_FLAG, "true")
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new Event("hub_security_settings_changed"))
    }
  } catch (e) {
    console.error("Failed to run one-time PIN reset", e)
  }
}

/**
 * Verify whether an entered PIN matches expected PIN (handles direct match,
 * default fallback 1234, and SHA-256 hashed comparison).
 */
export async function verifyPin(enteredPin: string, expectedPin?: string): Promise<boolean> {
  const cleanEntered = enteredPin.trim()
  const cleanExpected = (expectedPin || "1234").trim()

  // 1. Direct string comparison
  if (cleanEntered === cleanExpected) return true

  // 2. Default fallback if expectedPin is empty or 1234
  if ((!expectedPin || expectedPin === "1234") && cleanEntered === "1234") return true

  // 3. SHA-256 hash comparison if expectedPin is a 64-char hex hash
  if (cleanExpected.length === 64) {
    try {
      const enc = new TextEncoder().encode(cleanEntered)
      const hashBuf = await crypto.subtle.digest("SHA-256", enc)
      const hex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
      if (hex.toLowerCase() === cleanExpected.toLowerCase()) return true
    } catch (e) {}
  }

  return false
}
