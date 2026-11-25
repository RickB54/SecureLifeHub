"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

export const DEFAULT_VITAL_ORDER = [
  "bp",
  "weight",
  "temp",
  "ox",
  "hr",
  "gluc",
  "sleep",
  "sleep_score",
  "water",
  "cal",
  "steps",
  "activity",
] as const

export type VitalId = (typeof DEFAULT_VITAL_ORDER)[number]

export interface VitalsLayoutState {
  customOrder: string[]
  hiddenIds: string[]
  entriesFirst: boolean
  expandedIds: Record<string, boolean>
}

const LAYOUT_STORAGE_KEY = "slh_vitals_layout_prefs_v1"

const DEFAULT_LAYOUT_STATE: VitalsLayoutState = {
  customOrder: [...DEFAULT_VITAL_ORDER],
  hiddenIds: [],
  entriesFirst: false,
  expandedIds: {},
}

function normalizeOrder(order?: unknown): string[] {
  const validSet = new Set<string>(DEFAULT_VITAL_ORDER)
  const seen = new Set<string>()
  const result: string[] = []
  if (Array.isArray(order)) {
    for (const item of order) {
      const id = String(item)
      if (validSet.has(id) && !seen.has(id)) {
        seen.add(id)
        result.push(id)
      }
    }
  }
  for (const defId of DEFAULT_VITAL_ORDER) {
    if (!seen.has(defId)) {
      seen.add(defId)
      result.push(defId)
    }
  }
  return result
}

function readLayoutFromStorage(): VitalsLayoutState {
  if (typeof window === "undefined") return DEFAULT_LAYOUT_STATE
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (!raw) return DEFAULT_LAYOUT_STATE
    const parsed = JSON.parse(raw)
    const validSet = new Set<string>(DEFAULT_VITAL_ORDER)
    const hiddenIds: string[] = Array.from(
      new Set<string>(parsed?.hiddenIds ? parsed.hiddenIds.map(String).filter((id: string) => validSet.has(id)) : [])
    )
    const expandedIds: Record<string, boolean> = {}
    if (parsed?.expandedIds && typeof parsed.expandedIds === "object") {
      for (const [k, v] of Object.entries(parsed.expandedIds)) {
        if (validSet.has(k) && Boolean(v)) expandedIds[k] = true
      }
    }
    return {
      customOrder: normalizeOrder(parsed?.customOrder),
      hiddenIds,
      entriesFirst: Boolean(parsed?.entriesFirst),
      expandedIds,
    }
  } catch {
    return DEFAULT_LAYOUT_STATE
  }
}

export function applyVitalOrdering(
  customOrder: string[],
  entriesFirst: boolean,
  hasEntriesSet: Set<string>
): string[] {
  const base = normalizeOrder(customOrder)
  if (!entriesFirst) return base
  const withEntries: string[] = []
  const empty: string[] = []
  for (const id of base) {
    if (hasEntriesSet.has(id)) withEntries.push(id)
    else empty.push(id)
  }
  return [...withEntries, ...empty]
}

export function useVitalsLayoutPrefs(hasEntriesSet: Set<string>) {
  // Initialized to DEFAULT_LAYOUT_STATE on both server and first client render;
  // localStorage is read inside useEffect so there is zero hydration mismatch.
  const [state, setState] = useState<VitalsLayoutState>(DEFAULT_LAYOUT_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(readLayoutFromStorage())
    setHydrated(true)
  }, [])

  const persist = useCallback((updater: (prev: VitalsLayoutState) => VitalsLayoutState) => {
    setState((prev) => {
      const next = updater(prev)
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(next))
        } catch {
          // Ignore quota errors
        }
      }
      return next
    })
  }, [])

  const orderedAllIds = useMemo(
    () => applyVitalOrdering(state.customOrder, state.entriesFirst, hasEntriesSet),
    [state.customOrder, state.entriesFirst, hasEntriesSet]
  )

  const hiddenSet = useMemo(() => new Set(state.hiddenIds), [state.hiddenIds])

  const visibleOrderedIds = useMemo(
    () => orderedAllIds.filter((id) => !hiddenSet.has(id)),
    [orderedAllIds, hiddenSet]
  )

  const toggleCardExpanded = useCallback(
    (id: string) => {
      persist((prev) => {
        const nextExpanded = { ...prev.expandedIds }
        if (nextExpanded[id]) delete nextExpanded[id]
        else nextExpanded[id] = true
        return { ...prev, expandedIds: nextExpanded }
      })
    },
    [persist]
  )

  const setAllVisibleExpanded = useCallback(
    (expand: boolean) => {
      persist((prev) => {
        const currentVisible = applyVitalOrdering(prev.customOrder, prev.entriesFirst, hasEntriesSet).filter(
          (id) => !prev.hiddenIds.includes(id)
        )
        const nextExpanded = { ...prev.expandedIds }
        for (const id of currentVisible) {
          if (expand) nextExpanded[id] = true
          else delete nextExpanded[id]
        }
        return { ...prev, expandedIds: nextExpanded }
      })
    },
    [persist, hasEntriesSet]
  )

  const toggleVitalHidden = useCallback(
    (id: string) => {
      persist((prev) => {
        const exists = prev.hiddenIds.includes(id)
        const hiddenIds = exists ? prev.hiddenIds.filter((x) => x !== id) : [...prev.hiddenIds, id]
        return { ...prev, hiddenIds }
      })
    },
    [persist]
  )

  const setEntriesFirst = useCallback(
    (entriesFirst: boolean) => {
      persist((prev) => ({ ...prev, entriesFirst }))
    },
    [persist]
  )

  const setCustomOrder = useCallback(
    (nextOrder: string[]) => {
      persist((prev) => ({ ...prev, customOrder: normalizeOrder(nextOrder) }))
    },
    [persist]
  )

  const moveInCustomOrder = useCallback(
    (id: string, direction: "up" | "down") => {
      persist((prev) => {
        const base = normalizeOrder(prev.customOrder)
        if (!prev.entriesFirst) {
          const idx = base.indexOf(id)
          const swapIdx = direction === "up" ? idx - 1 : idx + 1
          if (idx < 0 || swapIdx < 0 || swapIdx >= base.length) return prev
          const copy = [...base]
          ;[copy[idx], copy[swapIdx]] = [copy[swapIdx], copy[idx]]
          return { ...prev, customOrder: copy }
        }
        // When entriesFirst is active, move within the item's own group (with-entries or empty)
        const isWithEntries = hasEntriesSet.has(id)
        const groupIndices = base
          .map((itemId, idx) => ({ itemId, idx }))
          .filter((x) => hasEntriesSet.has(x.itemId) === isWithEntries)
        const posInGroup = groupIndices.findIndex((x) => x.itemId === id)
        const targetPosInGroup = direction === "up" ? posInGroup - 1 : posInGroup + 1
        if (posInGroup < 0 || targetPosInGroup < 0 || targetPosInGroup >= groupIndices.length) return prev
        const idxA = groupIndices[posInGroup].idx
        const idxB = groupIndices[targetPosInGroup].idx
        const copy = [...base]
        ;[copy[idxA], copy[idxB]] = [copy[idxB], copy[idxA]]
        return { ...prev, customOrder: copy }
      })
    },
    [persist, hasEntriesSet]
  )

  const resetToDefault = useCallback(() => {
    persist(() => ({
      customOrder: [...DEFAULT_VITAL_ORDER],
      hiddenIds: [],
      entriesFirst: false,
      expandedIds: {},
    }))
  }, [persist])

  return {
    state,
    hydrated,
    orderedAllIds,
    visibleOrderedIds,
    hiddenSet,
    toggleCardExpanded,
    setAllVisibleExpanded,
    toggleVitalHidden,
    setEntriesFirst,
    setCustomOrder,
    moveInCustomOrder,
    resetToDefault,
  }
}

// ---------- Date String Splitting Helpers (NO Timezone Shift) ----------

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export interface SplitVitalDateParts {
  year: number
  month: number // 1-12
  day: number // 1-31
  hour: number | null
  minute: number | null
  dayKey: string // YYYY-MM-DD
}

/**
 * Splits a date or datetime string ("YYYY-MM-DD", "YYYY-MM-DDTHH:mm", etc.) directly
 * without `new Date(...)` UTC shifts.
 */
export function splitVitalDate(raw?: unknown): SplitVitalDateParts | null {
  if (!raw) return null
  const str = String(raw).trim()
  if (!str) return null

  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/)
  if (m) {
    const year = Number(m[1])
    const month = Number(m[2])
    const day = Number(m[3])
    const hour = m[4] !== undefined ? Number(m[4]) : null
    const minute = m[5] !== undefined ? Number(m[5]) : null
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const pad = (n: number) => String(n).padStart(2, "0")
      return {
        year,
        month,
        day,
        hour: hour !== null && hour >= 0 && hour <= 23 ? hour : null,
        minute: minute !== null && minute >= 0 && minute <= 59 ? minute : null,
        dayKey: `${year}-${pad(month)}-${pad(day)}`,
      }
    }
  }

  // Fallback only for legacy non-ISO strings
  const d = new Date(str)
  if (isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const pad = (n: number) => String(n).padStart(2, "0")
  return {
    year,
    month,
    day,
    hour: d.getHours(),
    minute: d.getMinutes(),
    dayKey: `${year}-${pad(month)}-${pad(day)}`,
  }
}

export function formatVitalDateNoShift(
  raw?: unknown,
  opts?: { includeYear?: boolean; includeTime?: boolean }
): string {
  const parts = splitVitalDate(raw)
  if (!parts) return raw ? String(raw) : ""
  const base = opts?.includeYear
    ? `${SHORT_MONTHS[parts.month - 1]} ${parts.day}, ${parts.year}`
    : `${SHORT_MONTHS[parts.month - 1]} ${parts.day}`

  if (opts?.includeTime && parts.hour !== null && parts.minute !== null) {
    // Omit 00:00 if it came from a midnight-only entry
    if (parts.hour === 0 && parts.minute === 0 && !String(raw).includes("T00:00")) {
      return base
    }
    const suffix = parts.hour >= 12 ? "PM" : "AM"
    const h12 = parts.hour % 12 || 12
    const mm = String(parts.minute).padStart(2, "0")
    return `${base} ${h12}:${mm} ${suffix}`
  }
  return base
}

export function getTodayDateStringNoShift(): string {
  const now = new Date()
  const m = SHORT_MONTHS[now.getMonth()]
  return `${m} ${now.getDate()}, ${now.getFullYear()}`
}

export type VitalsExportRange = "30d" | "90d" | "all"

export function filterEntriesByDateRange<T extends { item_metadata?: { date?: any } }>(
  entries: T[],
  range: VitalsExportRange
): T[] {
  if (range === "all") return entries
  const days = range === "30d" ? 30 : 90
  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days)
  const pad = (n: number) => String(n).padStart(2, "0")
  const cutoffKey = `${cutoff.getFullYear()}-${pad(cutoff.getMonth() + 1)}-${pad(cutoff.getDate())}`

  return entries.filter((entry) => {
    const parts = splitVitalDate(entry?.item_metadata?.date)
    if (!parts) return false
    return parts.dayKey >= cutoffKey
  })
}
