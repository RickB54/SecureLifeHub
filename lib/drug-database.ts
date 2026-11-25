"use client"

// Official FDA / DailyMed label types & 7-day browser localStorage cache.
// Hand-written drug entries have been retired so only official FDA/DailyMed label text is shown.

export interface OfficialDrugLabel {
  id: string
  setId: string
  title: string
  genericName: string
  brandNames: string[]
  drugClass: string
  manufacturer: string
  effectiveDate: string
  rawEffectiveTime?: string
  dailyMedUrl: string
  usesText: string
  dosageAdminText?: string
  contraindicationsText?: string
  mechanismText: string
  sideEffectsText: string
  interactionsText: string
  boxedWarningText: string
  warningsText: string
  pregnancyText: string
  overdosageText?: string
  storageText?: string
  patientCounselingText?: string
}

export interface DrugLabelLookupResult {
  query: string
  labels: OfficialDrugLabel[]
  fromCache?: boolean
}

const CACHE_PREFIX = "slh_fda_drug_label_v2:"
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface CachedLabelEntry {
  savedAt: number
  labels: OfficialDrugLabel[]
}

function makeCacheKey(name: string, genericName?: string): string {
  const n = (name || "").trim().toLowerCase()
  const g = (genericName || "").trim().toLowerCase()
  return `${CACHE_PREFIX}${n}__${g}`
}

function readCachedLabels(key: string): OfficialDrugLabel[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedLabelEntry
    if (!parsed || typeof parsed.savedAt !== "number" || !Array.isArray(parsed.labels)) {
      localStorage.removeItem(key)
      return null
    }
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return parsed.labels
  } catch {
    return null
  }
}

function writeCachedLabels(key: string, labels: OfficialDrugLabel[]): void {
  if (typeof window === "undefined" || labels.length === 0) return
  try {
    const payload: CachedLabelEntry = {
      savedAt: Date.now(),
      labels,
    }
    localStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Queries /api/drug-label (openFDA + DailyMed) ONLY on user action.
 * Caches matching official labels in localStorage for 7 days (never uses Supabase).
 */
export async function fetchOfficialDrugLabels(
  name: string,
  genericName = "",
  bypassCache = false
): Promise<DrugLabelLookupResult> {
  const cleanName = (name || "").trim()
  const cleanGeneric = (genericName || "").trim()
  const key = makeCacheKey(cleanName, cleanGeneric)

  if (!bypassCache) {
    const cached = readCachedLabels(key)
    if (cached && cached.length > 0) {
      return {
        query: cleanName || cleanGeneric,
        labels: cached,
        fromCache: true,
      }
    }
  }

  const params = new URLSearchParams()
  if (cleanName) params.set("name", cleanName)
  if (cleanGeneric) params.set("generic", cleanGeneric)

  const res = await fetch(`/api/drug-label?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(`Lookup failed (${res.status})`)
  }

  const data = await res.json()
  const labels: OfficialDrugLabel[] = Array.isArray(data?.labels) ? data.labels : []

  if (labels.length > 0) {
    writeCachedLabels(key, labels)
  }

  return {
    query: cleanName || cleanGeneric,
    labels,
    fromCache: false,
  }
}

export function trimLabelPreview(text: string, maxChars = 600): { preview: string; isTrimmed: boolean } {
  const clean = (text || "").trim()
  if (clean.length <= maxChars) {
    return { preview: clean, isTrimmed: false }
  }
  const slice = clean.slice(0, maxChars)
  const lastSpace = slice.lastIndexOf(" ")
  const cut = lastSpace > maxChars * 0.7 ? slice.slice(0, lastSpace) : slice
  return {
    preview: `${cut.trim()}…`,
    isTrimmed: true,
  }
}
