"use client"

import { addDays, differenceInCalendarDays, format } from "date-fns"

export interface PillCountEstimate {
  tracked: boolean
  remaining: number
  baseline: number
  pillsPerDose: number
  dailyRate: number
  runOutDateStr: string | null
  isLowStock: boolean
  isAsNeeded: boolean
}

export function isMedTracked(meta?: any): boolean {
  if (!meta) return false
  if (typeof meta.trackInventory === "boolean") return meta.trackInventory
  return (parseFloat(meta.totalQuantity) || 0) > 0
}

function getDosesPerDayFromFrequency(frequency?: string): { dosesPerDay: number; isAsNeeded: boolean } {
  const f = (frequency || "").toLowerCase().trim()
  if (!f || f.includes("as needed") || f === "prn") {
    return { dosesPerDay: 0, isAsNeeded: true }
  }
  if (f.includes("four") || f.includes("4x") || f.includes("4 times")) return { dosesPerDay: 4, isAsNeeded: false }
  if (f.includes("three") || f.includes("3x") || f.includes("3 times")) return { dosesPerDay: 3, isAsNeeded: false }
  if (f.includes("twice") || f.includes("2x") || f.includes("2 times") || f.includes("bid")) return { dosesPerDay: 2, isAsNeeded: false }
  if (f.includes("once") || f.includes("1x") || f.includes("daily") || f.includes("qd")) return { dosesPerDay: 1, isAsNeeded: false }

  const everyHours = f.match(/every\s+(\d+(?:\.\d+)?)\s*(?:hr|hour)/i)
  if (everyHours) {
    const hrs = parseFloat(everyHours[1])
    if (hrs > 0) return { dosesPerDay: 24 / hrs, isAsNeeded: false }
  }

  const everyDays = f.match(/every\s+(\d+(?:\.\d+)?)\s*day/i)
  if (everyDays) {
    const days = parseFloat(everyDays[1])
    if (days > 0) return { dosesPerDay: 1 / days, isAsNeeded: false }
  }

  const weekly = f.match(/(\d+)\s*(?:x|times)?\s*(?:per|a)?\s*week|weekly/i)
  if (weekly) {
    const times = weekly[1] ? parseFloat(weekly[1]) : 1
    return { dosesPerDay: times / 7, isAsNeeded: false }
  }

  return { dosesPerDay: 1, isAsNeeded: false }
}

function parseLocalDate(val?: string | null): Date | null {
  if (!val) return null
  // Handle YYYY-MM-DD as local midnight to avoid UTC shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const [y, m, d] = val.trim().split("-").map(Number)
    return new Date(y, m - 1, d)
  }
  const parsed = new Date(val)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Pure client-side pill count estimator (zero daily DB writes / zero cron).
 * remaining = countBaseline - (scheduled doses since countBaselineDate * pillsPerDose)
 * Skipped doses after countBaselineDate do not count.
 * For "as needed" meds, reduces only via Take (meta.quantity).
 */
export function calculatePillCountEstimate(meta?: any, now: Date = new Date()): PillCountEstimate | null {
  if (!isMedTracked(meta)) return null

  const pillsPerDose = Math.max(0.25, parseFloat(meta.pillsPerDose ?? "1") || 1)
  const threshold = parseFloat(meta.lowStockThreshold ?? "5") || 5
  const { dosesPerDay, isAsNeeded } = getDosesPerDayFromFrequency(meta.frequency)

  const baseline = parseFloat(meta.countBaseline ?? meta.quantity ?? "0") || 0
  const baselineDate = parseLocalDate(meta.countBaselineDate)

  // As-needed medications reduce only when user taps Take (stored in meta.quantity)
  if (isAsNeeded) {
    const currentQty = Math.max(0, parseFloat(meta.quantity ?? baseline ?? "0") || 0)
    return {
      tracked: true,
      remaining: Math.round(currentQty * 100) / 100,
      baseline,
      pillsPerDose,
      dailyRate: 0,
      runOutDateStr: null,
      isLowStock: currentQty <= threshold,
      isAsNeeded: true,
    }
  }

  // Determine effective date window between baselineDate (or startDate) and today (clamped by endDate)
  const startDate = parseLocalDate(meta.startDate)
  const endDate = parseLocalDate(meta.endDate)
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const baseDay = baselineDate
    ? new Date(baselineDate.getFullYear(), baselineDate.getMonth(), baselineDate.getDate())
    : todayLocal

  let effectiveStart = baseDay
  if (startDate && startDate > effectiveStart) {
    effectiveStart = startDate
  }

  let effectiveEnd = todayLocal
  if (endDate && endDate < effectiveEnd) {
    effectiveEnd = endDate
  }

  const elapsedDays = Math.max(0, differenceInCalendarDays(effectiveEnd, effectiveStart))

  // Count skipped doses recorded on/after baselineDate
  const skippedCount = Array.isArray(meta.skippedLog)
    ? meta.skippedLog.filter((s: any) => {
        const ts = parseLocalDate(s?.timestamp || s)
        return ts && (!baselineDate || ts >= baselineDate)
      }).length
    : 0

  let consumedPills = 0
  let dailyRate = dosesPerDay * pillsPerDose

  // If Periodic Dose Schedule is configured, sum scheduled quantities for each elapsed day
  const schedule: Array<{ dayIndex: number; quantity: number }> = Array.isArray(meta.doseSchedule)
    ? meta.doseSchedule
    : []
  const scheduleStart = parseLocalDate(meta.scheduleStartDate || meta.startDate)

  if (schedule.length > 0 && scheduleStart && elapsedDays > 0) {
    for (let i = 0; i < elapsedDays; i++) {
      const d = addDays(effectiveStart, i)
      const dayIdx = differenceInCalendarDays(d, scheduleStart) + 1
      const entry = schedule.find((s) => Number(s.dayIndex) === dayIdx)
      if (entry) {
        consumedPills += parseFloat(String(entry.quantity)) || 0
      } else {
        consumedPills += dosesPerDay * pillsPerDose
      }
    }
    const avgSched =
      schedule.reduce((acc, s) => acc + (parseFloat(String(s.quantity)) || 0), 0) / schedule.length
    if (avgSched > 0) dailyRate = avgSched
  } else {
    consumedPills = elapsedDays * dosesPerDay * pillsPerDose
  }

  // Skipped doses do not reduce remaining pills
  consumedPills = Math.max(0, consumedPills - skippedCount * pillsPerDose)

  const remaining = Math.max(0, Math.round((baseline - consumedPills) * 100) / 100)

  let runOutDateStr: string | null = null
  if (remaining <= 0) {
    runOutDateStr = "Now (0 left)"
  } else if (dailyRate > 0) {
    const daysLeft = Math.ceil(remaining / dailyRate)
    const runOutDate = addDays(todayLocal, daysLeft)
    runOutDateStr = format(runOutDate, "MMM d, yyyy")
  }

  return {
    tracked: true,
    remaining,
    baseline,
    pillsPerDose,
    dailyRate,
    runOutDateStr,
    isLowStock: remaining <= threshold,
    isAsNeeded: false,
  }
}

export function isMedLowStockCalculated(meta?: any): boolean {
  const est = calculatePillCountEstimate(meta)
  return Boolean(est?.isLowStock)
}
