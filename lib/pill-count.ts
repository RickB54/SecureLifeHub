"use client"

import { addDays, differenceInCalendarDays, format } from "date-fns"

export type CountStartOption = "now" | "after_today" | "tomorrow"

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

export function getCountBaselineDateForOption(
  option: CountStartOption = "now",
  now: Date = new Date()
): string {
  if (option === "after_today" || option === "tomorrow") {
    // Local midnight at start of tomorrow: nothing subtracted today; tomorrow's doses are first subtracted
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).toISOString()
  }
  return now.toISOString()
}

export function getDefaultReminderForFrequency(frequency?: string): string | null {
  const f = (frequency || "").toLowerCase().trim()
  if (f.includes("morning")) return "09:00"
  if (f.includes("afternoon")) return "13:00"
  if (f.includes("evening")) return "18:00"
  if (f.includes("bedtime")) return "21:00"
  return null
}

export function getDayIntervalFromFrequency(frequency?: string): number {
  const f = (frequency || "").toLowerCase().trim()
  if (f.includes("every other day")) return 2
  if (f.includes("weekly") || f.includes("once a week") || f.includes("1x a week")) return 7
  const everyDays = f.match(/every\s+(\d+)\s*day/i)
  if (everyDays) {
    const n = parseInt(everyDays[1], 10)
    if (n > 0) return n
  }
  return 1
}

function getDosesPerDayFromFrequency(frequency?: string): { dosesPerDay: number; isAsNeeded: boolean } {
  const f = (frequency || "").toLowerCase().trim()
  if (!f || f.includes("as needed") || f === "prn") {
    return { dosesPerDay: 0, isAsNeeded: true }
  }
  if (f.includes("every other day")) return { dosesPerDay: 0.5, isAsNeeded: false }
  if (f.includes("four") || f.includes("4x") || f.includes("4 times")) return { dosesPerDay: 4, isAsNeeded: false }
  if (f.includes("three") || f.includes("3x") || f.includes("3 times")) return { dosesPerDay: 3, isAsNeeded: false }
  if (f.includes("twice") || f.includes("2x") || f.includes("2 times") || f.includes("bid")) return { dosesPerDay: 2, isAsNeeded: false }
  if (f.includes("once") || f.includes("daily") || f.includes("1x") || f === "qd") return { dosesPerDay: 1, isAsNeeded: false }

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

export function isMedAsNeeded(meta?: any): boolean {
  return getDosesPerDayFromFrequency(meta?.frequency).isAsNeeded
}

function parseLocalDate(val?: string | null): Date | null {
  if (!val) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const [y, m, d] = val.trim().split("-").map(Number)
    return new Date(y, m - 1, d)
  }
  const parsed = new Date(val)
  return isNaN(parsed.getTime()) ? null : parsed
}

export function parseReminderTimes(reminders?: any): Array<{ hh: number; mm: number }> {
  if (!Array.isArray(reminders)) return []
  const result: Array<{ hh: number; mm: number }> = []
  for (const r of reminders) {
    if (typeof r !== "string") continue
    const m = r.trim().match(/^(\d{1,2}):(\d{2})$/)
    if (!m) continue
    const hh = parseInt(m[1], 10)
    const mm = parseInt(m[2], 10)
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
      result.push({ hh, mm })
    }
  }
  return result.sort((a, b) => a.hh * 60 + a.mm - (b.hh * 60 + b.mm))
}

export function getEffectiveReminderTimes(meta?: any): Array<{ hh: number; mm: number }> {
  const parsed = parseReminderTimes(meta?.reminders)
  if (parsed.length > 0) return parsed
  const def = getDefaultReminderForFrequency(meta?.frequency)
  return def ? parseReminderTimes([def]) : []
}

export function formatReminderTime12h(hh: number, mm: number): string {
  const period = hh >= 12 ? "PM" : "AM"
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`
}

/**
 * Computes the next scheduled dose ISO string strictly from Reminder Times + Frequency (local time).
 * Never uses the medication's creation/save timestamp when reminder times or time-of-day frequency exist.
 */
export function getScheduledNextDose(
  meta?: any,
  fromDate: Date = new Date(),
  isTakeAction = false
): string | null {
  if (!meta) return null
  if (isMedAsNeeded(meta)) return null

  const reminderTimes = getEffectiveReminderTimes(meta)
  const dayInterval = getDayIntervalFromFrequency(meta.frequency)
  const anchorDate = parseLocalDate(meta.startDate || meta.scheduleStartDate)

  if (reminderTimes.length > 0) {
    const baseDay = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())

    // If user just tapped Take on a 1-slot/day med, jump forward by dayInterval (1, 2, or 7 days)
    if (isTakeAction && reminderTimes.length === 1) {
      const nextDay = addDays(baseDay, dayInterval)
      nextDay.setHours(reminderTimes[0].hh, reminderTimes[0].mm, 0, 0)
      return nextDay.toISOString()
    }

    // Search forward up to dayInterval + 1 days for the next valid reminder slot after fromDate
    for (let offset = 0; offset <= Math.max(dayInterval, 7); offset++) {
      const candidateDay = addDays(baseDay, offset)
      if (dayInterval > 1 && anchorDate) {
        const anchorDay = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate())
        const diff = differenceInCalendarDays(candidateDay, anchorDay)
        if (diff < 0 || diff % dayInterval !== 0) continue
      }
      for (const rem of reminderTimes) {
        const slot = new Date(
          candidateDay.getFullYear(),
          candidateDay.getMonth(),
          candidateDay.getDate(),
          rem.hh,
          rem.mm,
          0,
          0
        )
        if (slot.getTime() > fromDate.getTime() + 60000) {
          return slot.toISOString()
        }
      }
    }

    const fallback = addDays(baseDay, dayInterval)
    fallback.setHours(reminderTimes[0].hh, reminderTimes[0].mm, 0, 0)
    return fallback.toISOString()
  }

  return null
}

/**
 * Pure client-side pill count estimator (zero daily DB writes / zero cron).
 * Drops at each scheduled dose time (local time), not at midnight.
 * Skipped doses after countBaselineDate do not count.
 * For "as needed" meds, reduces only via Take (meta.quantity).
 */
export function calculatePillCountEstimate(meta?: any, now: Date = new Date()): PillCountEstimate | null {
  if (!isMedTracked(meta)) return null

  const pillsPerDose = Math.max(0.25, parseFloat(meta.pillsPerDose ?? "1") || 1)
  const threshold = parseFloat(meta.lowStockThreshold ?? "5")
  const safeThreshold = isNaN(threshold) ? 5 : threshold
  const { dosesPerDay, isAsNeeded } = getDosesPerDayFromFrequency(meta.frequency)

  const baseline = parseFloat(meta.countBaseline ?? meta.quantity ?? "0") || 0
  const baselineDate = parseLocalDate(meta.countBaselineDate) || now

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
      isLowStock: currentQty <= safeThreshold,
      isAsNeeded: true,
    }
  }

  const startDate = parseLocalDate(meta.startDate)
  const endDate = parseLocalDate(meta.endDate)
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const effectiveStartTs = Math.max(
    baselineDate.getTime(),
    startDate ? startDate.getTime() : 0
  )
  const endOfTreatmentTs = endDate
    ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).getTime()
    : Infinity
  const effectiveEndTs = Math.min(now.getTime(), endOfTreatmentTs)

  const validReminders = getEffectiveReminderTimes(meta)
  const dayInterval = getDayIntervalFromFrequency(meta.frequency)
  const schedule: Array<{ dayIndex: number; quantity: number }> = Array.isArray(meta.doseSchedule)
    ? meta.doseSchedule
    : []
  const scheduleStart = parseLocalDate(meta.scheduleStartDate || meta.startDate)

  let dailyRate =
    validReminders.length > 0
      ? (validReminders.length / dayInterval) * pillsPerDose
      : dosesPerDay * pillsPerDose
  if (schedule.length > 0) {
    const avgSched =
      schedule.reduce((acc, s) => acc + (parseFloat(String(s.quantity)) || 0), 0) / schedule.length
    if (avgSched > 0) dailyRate = avgSched
  }

  let consumedPills = 0

  if (effectiveEndTs >= effectiveStartTs) {
    const startLocal = new Date(effectiveStartTs)
    const startDay = new Date(startLocal.getFullYear(), startLocal.getMonth(), startLocal.getDate())
    const endLocal = new Date(effectiveEndTs)
    const endDay = new Date(endLocal.getFullYear(), endLocal.getMonth(), endLocal.getDate())
    const anchorDay = startDate
      ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      : startDay

    if (validReminders.length > 0) {
      // Exact local-time reminder-slot counting: drops at each scheduled dose time, not midnight
      const totalDays = Math.max(0, differenceInCalendarDays(endDay, startDay))
      for (let i = 0; i <= totalDays; i++) {
        const d = addDays(startDay, i)
        if (dayInterval > 1) {
          const diff = differenceInCalendarDays(d, anchorDay)
          if (diff < 0 || diff % dayInterval !== 0) continue
        }
        let perSlotPills = pillsPerDose
        if (schedule.length > 0 && scheduleStart) {
          const dayIdx = differenceInCalendarDays(d, scheduleStart) + 1
          const entry = schedule.find((s) => Number(s.dayIndex) === dayIdx)
          if (entry) {
            perSlotPills = (parseFloat(String(entry.quantity)) || 0) / validReminders.length
          }
        }
        for (const rem of validReminders) {
          const slotTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), rem.hh, rem.mm, 0, 0).getTime()
          if (slotTs >= effectiveStartTs && slotTs <= effectiveEndTs) {
            consumedPills += perSlotPills
          }
        }
      }
    } else {
      // Fallback when no reminder times or time-of-day frequency are configured
      const isMidnightStart =
        startLocal.getHours() === 0 &&
        startLocal.getMinutes() === 0 &&
        startLocal.getSeconds() === 0
      const elapsedDays = isMidnightStart
        ? differenceInCalendarDays(endDay, startDay) + 1
        : Math.max(0, differenceInCalendarDays(endDay, startDay))

      if (schedule.length > 0 && scheduleStart && elapsedDays > 0) {
        for (let i = 0; i < elapsedDays; i++) {
          const d = addDays(startDay, i)
          const dayIdx = differenceInCalendarDays(d, scheduleStart) + 1
          const entry = schedule.find((s) => Number(s.dayIndex) === dayIdx)
          if (entry) {
            consumedPills += parseFloat(String(entry.quantity)) || 0
          } else {
            consumedPills += dosesPerDay * pillsPerDose
          }
        }
      } else {
        consumedPills = elapsedDays * dosesPerDay * pillsPerDose
      }
    }

    // Skipped doses recorded in [effectiveStartTs, effectiveEndTs] do not reduce remaining pills
    const skippedCount = Array.isArray(meta.skippedLog)
      ? meta.skippedLog.filter((s: any) => {
          const ts = parseLocalDate(s?.timestamp || s)
          return ts && ts.getTime() >= effectiveStartTs && ts.getTime() <= effectiveEndTs
        }).length
      : 0

    consumedPills = Math.max(0, consumedPills - skippedCount * pillsPerDose)
  }

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
    isLowStock: remaining <= safeThreshold,
    isAsNeeded: false,
  }
}

export function isMedLowStockCalculated(meta?: any): boolean {
  const est = calculatePillCountEstimate(meta)
  return Boolean(est?.isLowStock)
}
