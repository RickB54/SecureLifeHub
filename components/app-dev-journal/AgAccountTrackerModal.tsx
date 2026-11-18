// @ts-nocheck
"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import {
  X,
  Plus,
  Trash2,
  Printer,
  Download,
  Upload,
  Check,
  Edit2,
  FileSpreadsheet,
  Maximize2,
  BarChart3,
  Zap,
  RotateCcw,
  History,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Palette,
  HelpCircle,
} from "lucide-react"
import AgAccountTrackerReports from "./AgAccountTrackerReports"
import AgAccountTrackerHelpModal from "./AgAccountTrackerHelpModal"
import TrackerErrorBoundary from "./TrackerErrorBoundary"

// Default row labels from the printable PDF
export const DEFAULT_ROW_LABELS = [
  "Retro Rick",
  "RB54",
  "RB",
  "15D",
  "RAS",
  "PAD",
  "RJB",
  "PDS",
]

const STORAGE_KEY = "slh-ag-account-tracker-v1"
const HISTORY_STORAGE_KEY = "slh-ag-tracker-history"
const CARRYOVER_STORAGE_KEY = "slh-ag-tracker-carryover"

export type LineStatus = "In use" | "Low" | "Out" | ""

export interface TrackerRowLine {
  id: string
  googleAccount: string
  usedOn: string // Stored as ISO local string (YYYY-MM-DDTHH:mm)
  nextAvailable: string // Stored as ISO local string (YYYY-MM-DDTHH:mm)
  status?: LineStatus
  notes: string
  isCustomGoogleAccount?: boolean
}

export interface TrackerRow {
  id: string
  label: string
  lines: TrackerRowLine[]
}

export interface AccountTracker {
  id: string
  title: string
  appName: string
  rows: TrackerRow[]
  trackerNotes: string
}

export interface TrackerOptions {
  customGoogleAccounts: string[]
  accountResetHours?: Record<string, number>
}

export interface AgTrackerStorageData {
  trackers: AccountTracker[]
  activeTrackerIndex: number
  options: TrackerOptions
}

// Convert Date to local ISO string (YYYY-MM-DDTHH:mm)
export function toLocalIsoString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Format local ISO string to MM-DD-YYYY h:mm AM/PM for display and printing
export function formatDisplayDateTime(isoStr: string): string {
  if (!isoStr) return ""
  const parts = isoStr.split("T")
  const dateParts = parts[0]?.split("-")
  if (!dateParts || dateParts.length !== 3) return isoStr

  const year = dateParts[0]
  const month = dateParts[1]
  const day = dateParts[2]

  if (parts.length < 2 || !parts[1]) {
    return `${month}-${day}-${year}`
  }

  const timeParts = parts[1].split(":")
  let hours = parseInt(timeParts[0] || "0", 10)
  const minutes = timeParts[1] || "00"
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12

  return `${month}-${day}-${year} ${hours}:${minutes} ${ampm}`
}

function createDefaultLines(): TrackerRowLine[] {
  return [
    {
      id: "l1-" + Math.random().toString(36).substring(2, 9),
      googleAccount: "",
      usedOn: "",
      nextAvailable: "",
      status: "",
      notes: "",
    },
    {
      id: "l2-" + Math.random().toString(36).substring(2, 9),
      googleAccount: "",
      usedOn: "",
      nextAvailable: "",
      status: "",
      notes: "",
    },
  ]
}

function createDefaultTracker(index: number): AccountTracker {
  return {
    id: "tracker-" + Date.now() + "-" + index,
    title: `Tracker ${index + 1}`,
    appName: "",
    rows: DEFAULT_ROW_LABELS.map((label, rIdx) => ({
      id: "r-" + rIdx + "-" + Math.random().toString(36).substring(2, 7),
      label,
      lines: createDefaultLines(),
    })),
    trackerNotes: "",
  }
}

// Migration helper: Converts any non-date old Used On value to "Used On: <value>" in that line's Notes
function migrateStorageData(rawObj: any): AgTrackerStorageData {
  if (!rawObj || !Array.isArray(rawObj.trackers)) {
    return {
      trackers: [
        createDefaultTracker(0),
        createDefaultTracker(1),
        createDefaultTracker(2),
        createDefaultTracker(3),
      ],
      activeTrackerIndex: 0,
      options: { customGoogleAccounts: [], accountResetHours: {} },
    }
  }

  const migratedTrackers = rawObj.trackers.map((tr: any) => ({
    ...tr,
    rows: (tr.rows || []).map((row: any, rIdx: number) => ({
      ...row,
      id: row.id || `row-${rIdx}-${(row.label || `acct-${rIdx}`).replace(/\s+/g, "_")}`,
      label: row.label || DEFAULT_ROW_LABELS[rIdx] || `Account ${rIdx + 1}`,
      lines: (row.lines || []).map((line: any) => {
        let { usedOn, notes, nextAvailableDate, nextAvailable, status } = line
        let currentNotes = notes || ""

        // Check if usedOn is an old app name (not a date string)
        if (usedOn && typeof usedOn === "string" && usedOn.trim() !== "") {
          const isDatePattern = /^\d{4}-\d{2}-\d{2}/.test(usedOn.trim())
          if (!isDatePattern) {
            const entry = `Used On: ${usedOn.trim()}`
            currentNotes = currentNotes ? `${currentNotes}\n${entry}` : entry
            usedOn = ""
          }
        }

        const nextVal = nextAvailable || nextAvailableDate || ""

        return {
          id: line.id || "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: line.googleAccount || "",
          usedOn: usedOn || "",
          nextAvailable: nextVal,
          status: status || "",
          notes: currentNotes,
          isCustomGoogleAccount: Boolean(line.isCustomGoogleAccount),
        }
      }),
    })),
  }))

  return {
    trackers: migratedTrackers,
    activeTrackerIndex: typeof rawObj.activeTrackerIndex === "number" ? rawObj.activeTrackerIndex : 0,
    options: {
      customGoogleAccounts: Array.isArray(rawObj.options?.customGoogleAccounts)
        ? rawObj.options.customGoogleAccounts
        : [],
      accountResetHours: rawObj.options?.accountResetHours || {},
    },
  }
}

function getInitialData(): AgTrackerStorageData {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return migrateStorageData(parsed)
      }
    } catch (err) {
      console.warn("Failed to read tracker data from localStorage:", err)
    }
  }

  return {
    trackers: [
      createDefaultTracker(0),
      createDefaultTracker(1),
      createDefaultTracker(2),
      createDefaultTracker(3),
    ],
    activeTrackerIndex: 0,
    options: {
      customGoogleAccounts: [],
      accountResetHours: {},
    },
  }
}

interface AgAccountTrackerModalProps {
  isOpen: boolean
  onClose: () => void
  theme?: string
  onThemeChange?: (theme: string) => void
}

interface FullScreenNotesState {
  title: string
  value: string
  rowIndex?: number
  lineIndex?: number
  isTrackerNotes?: boolean
  customCallback?: (val: string) => void
}

const EXPANDED_ROWS_KEY = "slh-ag-tracker-expanded-rows"

function loadExpandedRows(): Record<string, boolean> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(EXPANDED_ROWS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
  }
  return {}
}

function saveExpandedRows(map: Record<string, boolean>) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(EXPANDED_ROWS_KEY, JSON.stringify(map))
    } catch {}
  }
}

function AgAccountTrackerModalInner({
  isOpen,
  onClose,
  theme: propTheme,
  onThemeChange,
}: AgAccountTrackerModalProps) {
  const [theme, setTheme] = useState<string>(() => {
    if (propTheme) return propTheme
    try {
      const raw = localStorage.getItem("journal-settings")
      if (raw) return JSON.parse(raw).theme || "dark"
    } catch {}
    return "dark"
  })
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

  useEffect(() => {
    if (propTheme) setTheme(propTheme)
  }, [propTheme])

  const handleSelectTheme = (newTheme: string) => {
    setTheme(newTheme)
    if (onThemeChange) {
      onThemeChange(newTheme)
    } else {
      try {
        const raw = localStorage.getItem("journal-settings")
        const current = raw ? JSON.parse(raw) : {}
        current.theme = newTheme
        localStorage.setItem("journal-settings", JSON.stringify(current))
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("slh_journal_theme_changed", { detail: { theme: newTheme } }))
        window.dispatchEvent(new CustomEvent("slh_remount_journal"))
      }
    }
  }
  const [data, setData] = useState<AgTrackerStorageData>(getInitialData)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved")
  const [manageOptionsOpen, setManageOptionsOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [quickLogOpen, setQuickLogOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>(loadExpandedRows)

  const [quickLogAccount, setQuickLogAccount] = useState("")
  const [quickLogResetChoice, setQuickLogResetChoice] = useState("default")
  const [quickLogCustomHours, setQuickLogCustomHours] = useState(24)
  const [toast, setToast] = useState<{ message: string; account: string } | null>(null)

  const [newOptionInput, setNewOptionInput] = useState("")
  const [editingOption, setEditingOption] = useState<{ original: string; current: string } | null>(null)
  const [fullScreenNotes, setFullScreenNotes] = useState<FullScreenNotesState | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load history list unconditionally at top
  const historyList = useMemo(() => {
    if (!historyOpen || typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }, [historyOpen])

  // Load project app names from Journal's localStorage key "projects"
  const journalAppNames = useMemo(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem("projects")
      if (!raw) return []
      const list = JSON.parse(raw)
      if (!Array.isArray(list)) return []
      const names = list.map((p: any) => p?.appName).filter(Boolean)
      return Array.from(new Set(names)) as string[]
    } catch {
      return []
    }
  }, [isOpen])

  // Google Account options
  const googleAccountOptions = useMemo(() => {
    const base = [...DEFAULT_ROW_LABELS]
    const custom = data.options.customGoogleAccounts || []
    return Array.from(new Set([...base, ...custom]))
  }, [data.options.customGoogleAccounts])

  // Set initial quick log account
  useEffect(() => {
    if (googleAccountOptions.length > 0 && !quickLogAccount) {
      setQuickLogAccount(googleAccountOptions[0])
    }
  }, [googleAccountOptions, quickLogAccount])

  // Debounced auto-save (500ms)
  const triggerSave = useCallback((newData: AgTrackerStorageData) => {
    setSaveStatus("saving")

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
        setSaveStatus("saved")
      } catch (err) {
        console.error("Failed to auto-save tracker data:", err)
      }
    }, 500)
  }, [])

  const updateData = useCallback(
    (updater: (prev: AgTrackerStorageData) => AgTrackerStorageData) => {
      setData((prev) => {
        const next = updater(prev)
        triggerSave(next)
        return next
      })
    },
    [triggerSave]
  )

  // Safe close: no confirmation needed because all data is auto-saved
  const handleImmediateClose = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {}
    }
    onClose()
  }, [data, onClose])

  // Escape key handler: closes sub-dialogs first -> then tracker
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (toast !== null) {
          setToast(null)
          return
        }
        if (helpOpen) {
          setHelpOpen(false)
          return
        }
        if (quickLogOpen) {
          setQuickLogOpen(false)
          return
        }
        if (historyOpen) {
          setHistoryOpen(false)
          return
        }
        if (reportsOpen) {
          setReportsOpen(false)
          return
        }
        if (fullScreenNotes !== null) {
          setFullScreenNotes(null)
          return
        }
        if (manageOptionsOpen) {
          setManageOptionsOpen(false)
          return
        }
        handleImmediateClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, toast, quickLogOpen, historyOpen, reportsOpen, fullScreenNotes, manageOptionsOpen, handleImmediateClose])

  // Active tracker
  const activeIndex = Math.min(
    Math.max(0, data.activeTrackerIndex),
    Math.max(0, data.trackers.length - 1)
  )
  const currentTracker = data.trackers[activeIndex] || data.trackers[0]

  // Update current tracker
  const updateCurrentTracker = (updater: (prev: AccountTracker) => AccountTracker) => {
    updateData((prev) => {
      const newTrackers = [...prev.trackers]
      newTrackers[activeIndex] = updater(newTrackers[activeIndex])
      return { ...prev, trackers: newTrackers }
    })
  }

  // Account Readiness & Currently Active Calculation across all trackers
  const { readyCount, currentlyActiveAccount, bestNextAccount } = useMemo(() => {
    const nowMs = Date.now()
    const allAccounts = googleAccountOptions

    let activeAccount = ""
    let latestActiveTime = 0

    // Gather latest times for all accounts
    const stats = allAccounts.map((acct) => {
      let timesUsed = 0
      let latestUsedMs = 0
      let latestNextMs = 0
      let latestLineStatus = ""

      for (const tr of data.trackers) {
        for (const row of tr.rows || []) {
          for (const line of row.lines || []) {
            const lineAcct = line.googleAccount?.trim() || row.label.trim()
            if (lineAcct === acct) {
              if (line.usedOn) {
                timesUsed++
                const uTime = new Date(line.usedOn).getTime()
                if (uTime > latestUsedMs) {
                  latestUsedMs = uTime
                  latestLineStatus = line.status || ""
                }
              } else if (line.status && !latestLineStatus) {
                latestLineStatus = line.status
              }

              if (line.nextAvailable) {
                const nTime = new Date(line.nextAvailable).getTime()
                if (nTime > latestNextMs) {
                  latestNextMs = nTime
                }
              }
            }
          }
        }
      }

      // Check if currently active (In use or Low, and not Out)
      if (
        (latestLineStatus === "In use" || latestLineStatus === "Low") &&
        latestUsedMs > latestActiveTime
      ) {
        latestActiveTime = latestUsedMs
        activeAccount = acct
      }

      const isReadyNow =
        (latestNextMs > 0 && latestNextMs <= nowMs) ||
        (latestNextMs === 0 && timesUsed === 0)

      return {
        acct,
        timesUsed,
        latestUsedMs,
        latestNextMs,
        isReadyNow,
      }
    })

    const readyNowAccounts = stats.filter((s) => s.isReadyNow)

    // Best pick logic: Ready now, preferring never-used, then the one used longest ago
    let best = ""
    if (readyNowAccounts.length > 0) {
      const neverUsed = readyNowAccounts.filter((s) => s.timesUsed === 0)
      if (neverUsed.length > 0) {
        best = neverUsed[0].acct
      } else {
        readyNowAccounts.sort((a, b) => a.latestUsedMs - b.latestUsedMs)
        best = readyNowAccounts[0].acct
      }
    } else {
      // If none ready now, pick soonest ready
      const waiting = stats.filter((s) => s.latestNextMs > nowMs)
      if (waiting.length > 0) {
        waiting.sort((a, b) => a.latestNextMs - b.latestNextMs)
        best = waiting[0].acct
      } else if (allAccounts.length > 0) {
        best = allAccounts[0]
      }
    }

    return {
      readyCount: readyNowAccounts.length,
      currentlyActiveAccount: activeAccount,
      bestNextAccount: best,
    }
  }, [googleAccountOptions, data.trackers])

  // Add new tracker tab
  const handleAddTracker = () => {
    updateData((prev) => {
      const nextIndex = prev.trackers.length
      const newTracker = createDefaultTracker(nextIndex)
      return {
        ...prev,
        trackers: [...prev.trackers, newTracker],
        activeTrackerIndex: nextIndex,
      }
    })
  }

  // Delete tracker tab
  const handleDeleteTracker = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.trackers.length <= 1) {
      alert("At least one tracker must be kept.")
      return
    }

    const trackerToDelete = data.trackers[indexToDelete]
    const name = trackerToDelete.appName || trackerToDelete.title
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    updateData((prev) => {
      const newTrackers = prev.trackers.filter((_, idx) => idx !== indexToDelete)
      let newActive = prev.activeTrackerIndex
      if (newActive >= newTrackers.length) {
        newActive = newTrackers.length - 1
      }
      return {
        ...prev,
        trackers: newTrackers,
        activeTrackerIndex: newActive,
      }
    })
  }

  // Add line to row
  const handleAddLine = (rowIndex: number) => {
    updateCurrentTracker((tracker) => {
      const newRows = [...tracker.rows]
      const targetRow = { ...newRows[rowIndex] }
      targetRow.lines = [
        ...targetRow.lines,
        {
          id: "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: "",
          usedOn: "",
          nextAvailable: "",
          status: "",
          notes: "",
        },
      ]
      newRows[rowIndex] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  // Delete line from row
  const handleDeleteLine = (rowIndex: number, lineIndex: number) => {
    updateCurrentTracker((tracker) => {
      const newRows = [...tracker.rows]
      const targetRow = { ...newRows[rowIndex] }
      if (targetRow.lines.length <= 1) {
        targetRow.lines = [
          {
            id: "l-" + Math.random().toString(36).substring(2, 9),
            googleAccount: "",
            usedOn: "",
            nextAvailable: "",
            status: "",
            notes: "",
          },
        ]
      } else {
        targetRow.lines = targetRow.lines.filter((_, idx) => idx !== lineIndex)
      }
      newRows[rowIndex] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  // Update line field
  const handleUpdateLine = (
    rowIndex: number,
    lineIndex: number,
    field: keyof TrackerRowLine,
    value: any
  ) => {
    updateCurrentTracker((tracker) => {
      const newRows = [...tracker.rows]
      const targetRow = { ...newRows[rowIndex] }
      const newLines = [...targetRow.lines]
      newLines[lineIndex] = { ...newLines[lineIndex], [field]: value }
      targetRow.lines = newLines
      newRows[rowIndex] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  // Handle Quick Choice for USED ON
  const handleUsedOnChoice = (
    rowIndex: number,
    lineIndex: number,
    choice: string
  ) => {
    if (!choice || choice === "Quick Choice…") return

    let nextVal = ""
    if (choice === "Time-Stamp") {
      nextVal = toLocalIsoString(new Date())
    } else if (choice === "Clear") {
      nextVal = ""
    } else if (choice === "Custom date/time") {
      return
    }

    handleUpdateLine(rowIndex, lineIndex, "usedOn", nextVal)
  }

  // Handle Quick Choice for NEXT AVAILABLE
  const handleNextAvailableChoice = (
    rowIndex: number,
    lineIndex: number,
    choice: string
  ) => {
    if (!choice || choice === "Quick Choice…") return

    const now = new Date()
    let nextVal = ""

    if (choice === "Time-Stamp") {
      nextVal = toLocalIsoString(now)
    } else if (choice === "In 1 hour") {
      nextVal = toLocalIsoString(new Date(now.getTime() + 1 * 60 * 60 * 1000))
    } else if (choice === "In 6 hours") {
      nextVal = toLocalIsoString(new Date(now.getTime() + 6 * 60 * 60 * 1000))
    } else if (choice === "In 12 hours") {
      nextVal = toLocalIsoString(new Date(now.getTime() + 12 * 60 * 60 * 1000))
    } else if (choice === "In 24 hours") {
      nextVal = toLocalIsoString(new Date(now.getTime() + 24 * 60 * 60 * 1000))
    } else if (choice === "Tomorrow (same time)") {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      nextVal = toLocalIsoString(tomorrow)
    } else if (choice === "In 7 days") {
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextVal = toLocalIsoString(nextWeek)
    } else if (choice === "Clear") {
      nextVal = ""
    } else if (choice === "Custom date/time") {
      return
    }

    handleUpdateLine(rowIndex, lineIndex, "nextAvailable", nextVal)
  }

  // QUICK LOG ACTIONS
  const handleQuickLogStarted = (accountName: string) => {
    if (!accountName) return
    const nowIso = toLocalIsoString(new Date())

    updateCurrentTracker((tr) => {
      const newRows = [...tr.rows]
      // Find row matching accountName or default
      let targetRowIdx = newRows.findIndex(
        (r) => r.label.trim().toLowerCase() === accountName.trim().toLowerCase()
      )
      if (targetRowIdx === -1) targetRowIdx = 0

      const targetRow = { ...newRows[targetRowIdx] }
      const newLines = [...targetRow.lines]

      // Check if an empty line exists in this row
      const emptyLineIdx = newLines.findIndex(
        (l) => !l.usedOn && !l.googleAccount && !l.status
      )

      if (emptyLineIdx !== -1) {
        newLines[emptyLineIdx] = {
          ...newLines[emptyLineIdx],
          googleAccount: accountName,
          usedOn: nowIso,
          status: "In use",
        }
      } else {
        newLines.push({
          id: "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: accountName,
          usedOn: nowIso,
          nextAvailable: "",
          status: "In use",
          notes: "",
        })
      }

      targetRow.lines = newLines
      newRows[targetRowIdx] = targetRow
      return { ...tr, rows: newRows }
    })

    setQuickLogOpen(false)
    setToast(null)
  }

  const handleQuickLogOutOfTokens = (accountName: string) => {
    if (!accountName) return
    const now = new Date()
    const nowIso = toLocalIsoString(now)

    // Calculate reset hours
    let resetHours = data.options?.accountResetHours?.[accountName] ?? 24
    if (quickLogResetChoice === "5") resetHours = 5
    else if (quickLogResetChoice === "12") resetHours = 12
    else if (quickLogResetChoice === "24") resetHours = 24
    else if (quickLogResetChoice === "72") resetHours = 72
    else if (quickLogResetChoice === "168") resetHours = 168
    else if (quickLogResetChoice === "custom") resetHours = quickLogCustomHours || 24

    const nextAvailDate = new Date(now.getTime() + resetHours * 3600 * 1000)
    const nextAvailIso = toLocalIsoString(nextAvailDate)

    updateCurrentTracker((tr) => {
      const newRows = [...tr.rows]
      let targetRowIdx = newRows.findIndex(
        (r) => r.label.trim().toLowerCase() === accountName.trim().toLowerCase()
      )
      if (targetRowIdx === -1) targetRowIdx = 0

      const targetRow = { ...newRows[targetRowIdx] }
      const newLines = [...targetRow.lines]

      // Check if latest line for this account is "In use"
      let foundInUseIdx = -1
      for (let i = newLines.length - 1; i >= 0; i--) {
        const line = newLines[i]
        const lineAcct = line.googleAccount?.trim() || targetRow.label.trim()
        if (lineAcct === accountName && line.status === "In use") {
          foundInUseIdx = i
          break
        }
      }

      if (foundInUseIdx !== -1) {
        newLines[foundInUseIdx] = {
          ...newLines[foundInUseIdx],
          status: "Out",
          nextAvailable: nextAvailIso,
        }
      } else {
        newLines.push({
          id: "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: accountName,
          usedOn: nowIso,
          nextAvailable: nextAvailIso,
          status: "Out",
          notes: "",
        })
      }

      targetRow.lines = newLines
      newRows[targetRowIdx] = targetRow
      return { ...tr, rows: newRows }
    })

    setQuickLogOpen(false)

    // Trigger toast recommending next account
    if (bestNextAccount && bestNextAccount !== accountName) {
      setToast({
        message: `Switch to: ${bestNextAccount}`,
        account: bestNextAccount,
      })
    }
  }

  const handleQuickLogRunningLow = (accountName: string) => {
    if (!accountName) return
    const nowIso = toLocalIsoString(new Date())

    updateCurrentTracker((tr) => {
      const newRows = [...tr.rows]
      let targetRowIdx = newRows.findIndex(
        (r) => r.label.trim().toLowerCase() === accountName.trim().toLowerCase()
      )
      if (targetRowIdx === -1) targetRowIdx = 0

      const targetRow = { ...newRows[targetRowIdx] }
      const newLines = [...targetRow.lines]

      // Check if latest line for this account is "In use"
      let foundInUseIdx = -1
      for (let i = newLines.length - 1; i >= 0; i--) {
        const line = newLines[i]
        const lineAcct = line.googleAccount?.trim() || targetRow.label.trim()
        if (lineAcct === accountName && line.status === "In use") {
          foundInUseIdx = i
          break
        }
      }

      if (foundInUseIdx !== -1) {
        newLines[foundInUseIdx] = {
          ...newLines[foundInUseIdx],
          status: "Low",
        }
      } else {
        newLines.push({
          id: "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: accountName,
          usedOn: nowIso,
          nextAvailable: "",
          status: "Low",
          notes: "",
        })
      }

      targetRow.lines = newLines
      newRows[targetRowIdx] = targetRow
      return { ...tr, rows: newRows }
    })

    setQuickLogOpen(false)
  }

  // NEW CYCLE WORKFLOW
  const handleStartNewCycle = () => {
    const confirmed = window.confirm(
      "Start a new cycle? Entries will be archived and the lines cleared. Each account's last used, next available, and status are carried over so the reports keep working."
    )
    if (!confirmed) return

    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const archiveFilename = `AG-Tracker-Archive-${dateStr}.json`

    // 1. Auto-download JSON backup
    try {
      const archiveData = {
        archiveDate: now.toISOString(),
        archiveFilename,
        trackers: data.trackers,
        options: data.options,
      }
      const blob = new Blob([JSON.stringify(archiveData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = archiveFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.warn("Archive download warning:", err)
    }

    // 2. Save snapshot in localStorage "slh-ag-tracker-history" (keep 10 most recent)
    try {
      const existingHistoryRaw = localStorage.getItem(HISTORY_STORAGE_KEY)
      let historyList = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : []
      if (!Array.isArray(historyList)) historyList = []

      const newSnapshot = {
        id: "snapshot-" + Date.now(),
        date: now.toISOString(),
        archiveFilename,
        data: JSON.parse(JSON.stringify(data)),
      }
      historyList.unshift(newSnapshot)
      historyList = historyList.slice(0, 10)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyList))
    } catch (err) {
      console.error("Failed to save tracker history snapshot:", err)
    }

    // 3. Save each account's latest Used On, Next Available, status, and appName in "slh-ag-tracker-carryover"
    try {
      const carryOverMap: Record<string, any> = {}
      for (const acct of googleAccountOptions) {
        let latestUsedMs = 0
        let latestUsedIso = ""
        let latestUsedApp = ""
        let latestNextMs = 0
        let latestNextIso = ""
        let latestStatus = ""

        for (const tr of data.trackers) {
          const appName = tr.appName || tr.title
          for (const row of tr.rows || []) {
            for (const line of row.lines || []) {
              const lineAcct = line.googleAccount?.trim() || row.label.trim()
              if (lineAcct === acct) {
                if (line.usedOn) {
                  const uTime = new Date(line.usedOn).getTime()
                  if (uTime > latestUsedMs) {
                    latestUsedMs = uTime
                    latestUsedIso = line.usedOn
                    latestUsedApp = appName
                    latestStatus = line.status || ""
                  }
                } else if (line.status && !latestStatus) {
                  latestStatus = line.status
                }

                if (line.nextAvailable) {
                  const nTime = new Date(line.nextAvailable).getTime()
                  if (nTime > latestNextMs) {
                    latestNextMs = nTime
                    latestNextIso = line.nextAvailable
                  }
                }
              }
            }
          }
        }

        if (latestUsedIso || latestNextIso || latestStatus) {
          carryOverMap[acct] = {
            accountName: acct,
            usedOn: latestUsedIso,
            nextAvailable: latestNextIso,
            status: latestStatus,
            appName: latestUsedApp,
          }
        }
      }
      localStorage.setItem(CARRYOVER_STORAGE_KEY, JSON.stringify(carryOverMap))
    } catch (err) {
      console.error("Failed to save carryover data:", err)
    }

    // 4. Clear every line in every tracker, keeping App Names, row labels, dropdown options, and settings
    const clearedTrackers: AccountTracker[] = data.trackers.map((tr) => ({
      ...tr,
      rows: tr.rows.map((row) => ({
        ...row,
        lines: createDefaultLines(),
      })),
      trackerNotes: "",
    }))

    const newData: AgTrackerStorageData = {
      ...data,
      trackers: clearedTrackers,
    }

    setData(newData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    setSaveStatus("saved")
    alert("New cycle started! Lines cleared and accounts carried over.")
  }

  // Restore history snapshot
  const handleRestoreSnapshot = (snapshotData: AgTrackerStorageData) => {
    if (!window.confirm("Restore this cycle? Current tracker data will be replaced.")) return

    setData(snapshotData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshotData))
    setSaveStatus("saved")
    setHistoryOpen(false)
    alert("Cycle restored successfully.")
  }

  // Export JSON (Includes History & Carryover)
  const handleExportJson = () => {
    try {
      const historyData = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]")
      const carryOverData = JSON.parse(localStorage.getItem(CARRYOVER_STORAGE_KEY) || "{}")

      const exportPayload = {
        ...data,
        history: historyData,
        carryover: carryOverData,
      }

      const jsonStr = JSON.stringify(exportPayload, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ag-account-tracker-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert("Failed to export JSON: " + String(err))
    }
  }

  // Import JSON (Restores History & Carryover if present)
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)
        if (!Array.isArray(parsed.trackers)) {
          throw new Error("Invalid tracker backup format: missing trackers list.")
        }
        if (!window.confirm("Importing this backup will overwrite current trackers. Are you sure you want to continue?")) {
          if (fileInputRef.current) fileInputRef.current.value = ""
          return
        }

        const migrated = migrateStorageData(parsed)

        // Restore history & carryover if present
        if (Array.isArray(parsed.history)) {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(parsed.history))
        }
        if (parsed.carryover && typeof parsed.carryover === "object") {
          localStorage.setItem(CARRYOVER_STORAGE_KEY, JSON.stringify(parsed.carryover))
        }

        setData(migrated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        setSaveStatus("saved")
        alert("AG Account Tracker data imported successfully!")
      } catch (err) {
        alert("Failed to import file: " + String(err))
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsText(file)
  }

  // Print Tracker
  const handlePrint = () => {
    window.print()
  }

  // Manage Google Account Options & Reset Hours
  const handleAddCustomGoogleAccount = () => {
    const trimmed = newOptionInput.trim()
    if (!trimmed) return

    updateData((prev) => {
      const existing = prev.options.customGoogleAccounts || []
      if (existing.includes(trimmed)) return prev
      return {
        ...prev,
        options: {
          ...prev.options,
          customGoogleAccounts: [...existing, trimmed],
          accountResetHours: {
            ...(prev.options.accountResetHours || {}),
            [trimmed]: 24,
          },
        },
      }
    })
    setNewOptionInput("")
  }

  const handleDeleteCustomGoogleAccount = (optToDelete: string) => {
    updateData((prev) => {
      const existing = prev.options.customGoogleAccounts || []
      const updatedHours = { ...(prev.options.accountResetHours || {}) }
      delete updatedHours[optToDelete]
      return {
        ...prev,
        options: {
          ...prev.options,
          customGoogleAccounts: existing.filter((item) => item !== optToDelete),
          accountResetHours: updatedHours,
        },
      }
    })
  }

  const handleUpdateResetHours = (accountName: string, hours: number) => {
    updateData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        accountResetHours: {
          ...(prev.options.accountResetHours || {}),
          [accountName]: Math.max(1, hours || 24),
        },
      },
    }))
  }

  // Handle Full-Screen Notes Editing
  const handleOpenFullScreenLineNotes = (rowIndex: number, lineIndex: number) => {
    const row = currentTracker.rows[rowIndex]
    const line = row.lines[lineIndex]
    setFullScreenNotes({
      title: `${row.label} – Line ${lineIndex + 1} – Notes`,
      value: line.notes || "",
      rowIndex,
      lineIndex,
      isTrackerNotes: false,
    })
  }

  const handleOpenFullScreenTrackerNotes = () => {
    setFullScreenNotes({
      title: `${currentTracker.appName || currentTracker.title} – Tracker Notes`,
      value: currentTracker.trackerNotes || "",
      isTrackerNotes: true,
    })
  }

  const handleFullScreenNotesChange = (newVal: string) => {
    if (!fullScreenNotes) return
    setFullScreenNotes((prev) => (prev ? { ...prev, value: newVal } : null))

    if (fullScreenNotes.customCallback) {
      fullScreenNotes.customCallback(newVal)
    } else if (fullScreenNotes.isTrackerNotes) {
      updateCurrentTracker((tr) => ({ ...tr, trackerNotes: newVal }))
    } else if (
      typeof fullScreenNotes.rowIndex === "number" &&
      typeof fullScreenNotes.lineIndex === "number"
    ) {
      handleUpdateLine(
        fullScreenNotes.rowIndex,
        fullScreenNotes.lineIndex,
        "notes",
        newVal
      )
    }
  }

  const getRowKey = (row: any, rIdx: number): string => {
    return row.id || `row-${rIdx}-${(row.label || `acct-${rIdx}`).replace(/\s+/g, "_")}`
  }

  const toggleRowExpand = (rowKey: string) => {
    setExpandedRows((prev) => {
      const next = { ...prev, [rowKey]: !prev[rowKey] }
      saveExpandedRows(next)
      return next
    })
  }

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {}
    currentTracker.rows.forEach((r, idx) => {
      next[getRowKey(r, idx)] = true
    })
    setExpandedRows(next)
    saveExpandedRows(next)
  }

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {}
    currentTracker.rows.forEach((r, idx) => {
      next[getRowKey(r, idx)] = false
    })
    setExpandedRows(next)
    saveExpandedRows(next)
  }

  const handleUpdateAccountFromReport = useCallback(
    (
      accountName: string,
      updates: {
        status?: LineStatus
        usedOn?: string
        nextAvailable?: string
        notes?: string
      }
    ) => {
      updateCurrentTracker((tr) => {
        let targetRowIndex = -1
        let targetLineIndex = -1

        for (let r = 0; r < tr.rows.length; r++) {
          for (let l = 0; l < tr.rows[r].lines.length; l++) {
            const line = tr.rows[r].lines[l]
            const lineAccount = line.googleAccount?.trim() || tr.rows[r].label?.trim()
            if (lineAccount === accountName) {
              targetRowIndex = r
              targetLineIndex = l
              break
            }
          }
          if (targetRowIndex !== -1) break
        }

        if (targetRowIndex === -1) {
          const r = tr.rows.findIndex((row) => row.label.trim() === accountName.trim())
          if (r !== -1) {
            targetRowIndex = r
            targetLineIndex = 0
          }
        }

        const newRows = tr.rows.map((r) => ({
          ...r,
          lines: r.lines.map((l) => ({ ...l })),
        }))

        if (targetRowIndex !== -1 && targetLineIndex !== -1) {
          const line = newRows[targetRowIndex].lines[targetLineIndex]
          if (updates.status !== undefined) line.status = updates.status
          if (updates.usedOn !== undefined) line.usedOn = updates.usedOn
          if (updates.nextAvailable !== undefined) line.nextAvailable = updates.nextAvailable
          if (updates.notes !== undefined) line.notes = updates.notes
          if (!line.googleAccount) line.googleAccount = accountName
        } else if (newRows.length > 0) {
          newRows[0].lines.push({
            id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            googleAccount: accountName,
            usedOn: updates.usedOn || "",
            nextAvailable: updates.nextAvailable || "",
            status: updates.status || "",
            notes: updates.notes || "",
          })
        }

        return { ...tr, rows: newRows }
      })
    },
    [updateCurrentTracker]
  )

  return (
    <>
      {/* Centered Dialog Backdrop Container */}
      <div
        className="ag-tracker-backdrop"
        onClick={handleImmediateClose}
        role="dialog"
        aria-modal="true"
        aria-label="AG Account Tracker"
      >
        {/* Hidden File Input for JSON Restore */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportJson}
          accept=".json,application/json"
          style={{ display: "none" }}
        />

        {/* Centered Dialog Container */}
        <div
          className={`ag-tracker-dialog journal-theme-${theme}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOAST NOTIFICATION */}
          {toast && (
            <div className="ag-toast-container">
              <span>{toast.message}</span>
              <button
                type="button"
                className="ag-toast-btn"
                onClick={() => handleQuickLogStarted(toast.account)}
              >
                Log started
              </button>
              <button
                type="button"
                className="ag-tracker-btn-icon text-gray-400 hover:text-white"
                onClick={() => setToast(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* DIALOG HEADER */}
          <header className="ag-tracker-header">
            <div className="ag-tracker-header-left">
              <h2 className="ag-tracker-title">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                AG Account Tracker
              </h2>

              <span
                className={`ag-tracker-save-badge ${saveStatus === "saving" ? "saving" : "saved"}`}
                title={saveStatus === "saving" ? "Saving changes..." : "All changes saved locally"}
              >
                {saveStatus === "saving" ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Check className="h-3 w-3" /> Saved
                  </>
                )}
              </span>

              {/* Currently Using Chip (Hidden on mobile) */}
              {currentlyActiveAccount && (
                <div className="ag-tracker-active-chip hidden sm:inline-flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Currently using: <strong className="text-white">{currentlyActiveAccount}</strong>
                </div>
              )}
            </div>

            <div className="ag-tracker-header-actions">
              {/* THEME SELECTOR BUTTON */}
              <div className="relative inline-block">
                <button
                  type="button"
                  className="ag-tracker-btn font-semibold"
                  onClick={() => setThemeMenuOpen((prev) => !prev)}
                  title={`Current Theme: ${theme.toUpperCase()} (Click to change)`}
                  aria-label="Display Theme"
                >
                  <Palette className="h-4 w-4 text-pink-400" />
                  <span className="capitalize">{theme === "oled" ? "OLED" : theme}</span>
                  <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                </button>
                {themeMenuOpen && (
                  <div
                    className="ag-theme-menu-dropdown absolute right-0 mt-1 z-50 py-1 rounded-md shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      { id: "dark", label: "Dark" },
                      { id: "light", label: "Light" },
                      { id: "oled", label: "OLED" },
                      { id: "cyberpunk", label: "Cyberpunk" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`ag-theme-menu-item flex items-center justify-between w-full px-3 py-1.5 text-xs text-left ${
                          theme === opt.id ? "active font-bold text-sky-400" : ""
                        }`}
                        onClick={() => {
                          handleSelectTheme(opt.id)
                          setThemeMenuOpen(false)
                        }}
                      >
                        <span>{opt.label}</span>
                        {theme === opt.id && <Check className="h-3 w-3 text-sky-400 ml-2" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* QUICK LOG BUTTON */}
              <button
                type="button"
                className="ag-tracker-btn ag-quick-log-trigger-btn font-bold text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                onClick={() => setQuickLogOpen(true)}
                title="Quick log account status (Started, Out of tokens, Low)"
                aria-label="Quick Log"
              >
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>Quick Log</span>
              </button>

              {/* REPORTS BUTTON WITH READY NOW COUNT BADGE */}
              <button
                type="button"
                className="ag-tracker-btn"
                onClick={() => setReportsOpen(true)}
                title="View account usage and next available reports"
                aria-label="Reports"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Reports</span>
                <span className="ag-report-count-badge">
                  {readyCount} ready
                </span>
              </button>

              {/* NEW CYCLE BUTTON */}
              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={handleStartNewCycle}
                title="Archive current cycle and clear entries while preserving account statuses"
                aria-label="New Cycle"
              >
                <RotateCcw className="h-4 w-4 text-sky-400" />
                <span>New Cycle</span>
              </button>

              {/* HISTORY BUTTON */}
              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={() => setHistoryOpen(true)}
                title="View and restore past cycles"
                aria-label="History"
              >
                <History className="h-4 w-4 text-purple-400" />
                <span>History</span>
              </button>

              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={handlePrint}
                title="Print clean table formatted for US Letter"
                aria-label="Print"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>

              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={handleExportJson}
                title="Export all trackers as JSON backup"
                aria-label="Export JSON"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>

              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={() => fileInputRef.current?.click()}
                title="Import tracker backup from JSON file"
                aria-label="Import JSON"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>

              {/* HELP & GUIDE BUTTON */}
              <button
                type="button"
                className="ag-tracker-btn font-semibold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                onClick={() => setHelpOpen(true)}
                title="Help Guide: Step-by-step instructions and complete explanation of the AG Tracker process"
                aria-label="Help & Guide"
              >
                <HelpCircle className="h-4 w-4 text-emerald-400" />
                <span>Help</span>
              </button>

              <button
                type="button"
                className="ag-tracker-btn ag-tracker-btn-icon"
                onClick={handleImmediateClose}
                title="Close tracker (Esc) - all changes auto-saved"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* TABS SWITCHER BAR */}
          <nav className="ag-tracker-tabs-bar" aria-label="Trackers Tabs">
            <div className="ag-tracker-tabs-list">
              {data.trackers.map((tracker, idx) => {
                const isActive = idx === activeIndex
                const displayName = tracker.appName
                  ? `${idx + 1}. ${tracker.appName}`
                  : `Tracker ${idx + 1}`

                return (
                  <button
                    key={tracker.id}
                    type="button"
                    className={`ag-tracker-tab ${isActive ? "active" : ""}`}
                    onClick={() => updateData((prev) => ({ ...prev, activeTrackerIndex: idx }))}
                    title={displayName}
                  >
                    <span>{displayName}</span>
                    {data.trackers.length > 1 && (
                      <span
                        className="ag-tracker-tab-close"
                        onClick={(e) => handleDeleteTracker(idx, e)}
                        title={`Delete ${displayName}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="ag-tracker-btn ag-tracker-btn-primary"
              onClick={handleAddTracker}
              title="Add a new tracker block"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Tracker</span>
            </button>
          </nav>

          {/* SCROLLABLE MAIN CONTENT */}
          <main className="ag-tracker-content">
            {/* App Name Card */}
            <section className="ag-tracker-appname-card">
              <label htmlFor="ag-tracker-appname-input" className="ag-tracker-appname-label">
                App Name:
              </label>
              <div className="ag-tracker-appname-input-group">
                <input
                  id="ag-tracker-appname-input"
                  list="journal-app-names-datalist"
                  className="ag-tracker-input"
                  placeholder="Select an existing journal app or type a custom name..."
                  value={currentTracker.appName}
                  onChange={(e) =>
                    updateCurrentTracker((tr) => ({ ...tr, appName: e.target.value }))
                  }
                />
                <datalist id="journal-app-names-datalist">
                  {journalAppNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>

                {journalAppNames.length > 0 && (
                  <select
                    aria-label="Pick from Journal Apps"
                    className="ag-tracker-select"
                    style={{ width: "auto", minWidth: "160px" }}
                    value={journalAppNames.includes(currentTracker.appName) ? currentTracker.appName : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        updateCurrentTracker((tr) => ({ ...tr, appName: e.target.value }))
                      }
                    }}
                  >
                    <option value="">Choose App...</option>
                    {journalAppNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </section>

            {/* DESKTOP TABLE VIEW (Strictly 768px and wider) */}
            <section className="ag-tracker-table-container">
              {/* TABLE TOOLBAR: EXPAND / COLLAPSE ALL */}
              <div className="ag-tracker-table-toolbar">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="ag-tracker-btn text-xs py-1 px-2.5"
                    onClick={handleExpandAll}
                    title="Expand all account rows"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Expand All</span>
                  </button>
                  <button
                    type="button"
                    className="ag-tracker-btn text-xs py-1 px-2.5"
                    onClick={handleCollapseAll}
                    title="Collapse all account rows"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Collapse All</span>
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    Click any row to expand / edit details
                  </span>
                  <button
                    type="button"
                    className="ag-tracker-btn text-xs py-1 px-2.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                    onClick={() => setHelpOpen(true)}
                    title="Open Step-by-Step Process Guide & Help"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Process Guide &amp; Help</span>
                  </button>
                </div>
              </div>

              <table className="ag-tracker-table">
                <thead>
                  <tr>
                    <th className="ag-tracker-th" style={{ width: "110px" }} title="Row identifier and account cycle label matching the printable PDF tracking sheet">
                      Row
                    </th>
                    <th className="ag-tracker-th" style={{ width: "165px" }} title="Google account used for Antigravity (or select 'Manage Options...' to customize)">
                      Google Account
                    </th>
                    <th className="ag-tracker-th" style={{ width: "190px" }} title="Timestamp when development started with this account, and its current status (In use, Low, Out)">
                      Used On / Status
                    </th>
                    <th className="ag-tracker-th" style={{ width: "175px" }} title="Projected date and time when token quota resets (calculated automatically or via quick choices)">
                      Next Available
                    </th>
                    <th className="ag-tracker-th" style={{ width: "350px" }} title="Notes for this entry. Click the expand icon to edit in full screen.">
                      Notes
                    </th>
                    <th className="ag-tracker-th" style={{ width: "45px", textAlign: "center" }} title="Actions: Add line or delete line">
                      Act
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentTracker.rows.map((row, rIdx) => {
                    const rowKey = getRowKey(row, rIdx)
                    const isCollapsed = !expandedRows[rowKey]
                    let displayLine =
                      row.lines[0] || {
                        googleAccount: "",
                        usedOn: "",
                        nextAvailable: "",
                        status: "",
                        notes: "",
                      }
                    for (const l of row.lines) {
                      if (l.usedOn || l.status || l.nextAvailable) {
                        displayLine = l
                      }
                    }
                    const rowStatus = displayLine.status || ""
                    const statusBorderClass =
                      rowStatus === "In use"
                        ? "ag-tracker-row-inuse"
                        : rowStatus === "Low"
                        ? "ag-tracker-row-low"
                        : rowStatus === "Out"
                        ? "ag-tracker-row-out"
                        : ""

                    if (isCollapsed) {
                      return (
                        <tr
                          key={rowKey}
                          className={`ag-tracker-tr ag-tracker-row-collapsed ${statusBorderClass}`}
                          onClick={() => toggleRowExpand(rowKey)}
                          title="Click anywhere to expand row"
                        >
                          {/* Row Label */}
                          <td className="ag-tracker-td font-semibold">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 shrink-0">
                                <ChevronDown className="h-4 w-4" />
                              </div>
                              <span className="ag-tracker-row-title font-bold text-sm">{row.label}</span>
                              {row.lines.length > 1 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                                  {row.lines.length} lines
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Google Account */}
                          <td className="ag-tracker-td font-medium ag-tracker-row-account">
                            {displayLine.googleAccount || <span className="text-gray-400">—</span>}
                          </td>

                          {/* Used On / Status */}
                          <td className="ag-tracker-td">
                            <div className="flex items-center gap-1.5">
                              {displayLine.status && (
                                <span
                                  className={`ag-status-badge ${
                                    displayLine.status === "In use"
                                      ? "ag-status-inuse"
                                      : displayLine.status === "Low"
                                      ? "ag-status-low"
                                      : "ag-status-out"
                                  }`}
                                >
                                  {displayLine.status}
                                </span>
                              )}
                              <span className="text-xs text-gray-300">
                                {displayLine.usedOn ? formatDisplayDateTime(displayLine.usedOn) : "—"}
                              </span>
                            </div>
                          </td>

                          {/* Next Available */}
                          <td className="ag-tracker-td text-xs text-gray-300">
                            {displayLine.nextAvailable ? formatDisplayDateTime(displayLine.nextAvailable) : "—"}
                          </td>

                          {/* Notes Preview */}
                          <td className="ag-tracker-td">
                            <span className="text-xs text-gray-400 truncate block max-w-[320px]">
                              {displayLine.notes || "—"}
                            </span>
                          </td>

                          {/* Chevron Action */}
                          <td className="ag-tracker-td" style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="ag-tracker-btn text-xs py-0.5 px-2 text-blue-400 hover:text-blue-300 font-semibold"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleRowExpand(rowKey)
                              }}
                              title="Expand row"
                            >
                              Expand
                            </button>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <React.Fragment key={rowKey}>
                        {row.lines.map((line, lIdx) => (
                          <tr key={line.id} className={`ag-tracker-tr ${lIdx === 0 ? statusBorderClass : ""}`}>
                            {/* Row Label (spans all lines of this row) */}
                            {lIdx === 0 && (
                              <td
                                className="ag-tracker-td ag-tracker-row-label-cell"
                                rowSpan={row.lines.length}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <button
                                    type="button"
                                    className="p-1 rounded bg-gray-500/10 text-gray-400 hover:text-white shrink-0"
                                    onClick={() => toggleRowExpand(rowKey)}
                                    title="Collapse row"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </button>
                                  <input
                                    className="ag-tracker-row-label-input flex-1 min-w-0 font-bold"
                                    value={row.label}
                                    title="Click to edit row label"
                                    onChange={(e) => {
                                      const newLabel = e.target.value
                                      updateCurrentTracker((tr) => {
                                        const newRows = [...tr.rows]
                                        newRows[rIdx] = { ...newRows[rIdx], label: newLabel }
                                        return { ...tr, rows: newRows }
                                      })
                                    }}
                                  />
                                </div>
                                <div style={{ marginTop: "4px" }}>
                                  <button
                                    type="button"
                                    className="ag-tracker-btn ag-tracker-add-line-btn"
                                    onClick={() => handleAddLine(rIdx)}
                                    title="Add another line to this row"
                                  >
                                    <Plus className="h-3 w-3" /> Line
                                  </button>
                                </div>
                              </td>
                            )}

                          {/* Google Account Column */}
                          <td className="ag-tracker-td">
                            {line.isCustomGoogleAccount ? (
                              <div className="ag-tracker-custom-wrap">
                                <div className="ag-tracker-custom-row">
                                  <input
                                    className="ag-tracker-input"
                                    placeholder="Custom account..."
                                    value={line.googleAccount}
                                    onChange={(e) =>
                                      handleUpdateLine(rIdx, lIdx, "googleAccount", e.target.value)
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="ag-tracker-btn ag-tracker-btn-icon"
                                    onClick={() =>
                                      handleUpdateLine(rIdx, lIdx, "isCustomGoogleAccount", false)
                                    }
                                    title="Revert to dropdown"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <select
                                className="ag-tracker-select"
                                value={line.googleAccount}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (val === "__custom__") {
                                    handleUpdateLine(rIdx, lIdx, "isCustomGoogleAccount", true)
                                  } else if (val === "__manage__") {
                                    setManageOptionsOpen(true)
                                  } else {
                                    handleUpdateLine(rIdx, lIdx, "googleAccount", val)
                                  }
                                }}
                              >
                                <option value="">(None / Empty)</option>
                                <optgroup label="Account Options">
                                  {googleAccountOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Actions">
                                  <option value="__custom__">Other... (Type custom)</option>
                                  <option value="__manage__">⚙ Manage options...</option>
                                </optgroup>
                              </select>
                            )}
                          </td>

                          {/* Used On + Status Column */}
                          <td className="ag-tracker-td">
                            <div className="ag-tracker-datetime-group">
                              <select
                                className="ag-tracker-select"
                                defaultValue=""
                                onChange={(e) => {
                                  handleUsedOnChoice(rIdx, lIdx, e.target.value)
                                  e.target.value = ""
                                }}
                              >
                                <option value="" disabled>Quick Choice…</option>
                                <option value="Time-Stamp">Time-Stamp</option>
                                <option value="Custom date/time">Custom date/time</option>
                                <option value="Clear">Clear</option>
                              </select>
                              <input
                                type="datetime-local"
                                className="ag-tracker-input"
                                value={line.usedOn}
                                onChange={(e) =>
                                  handleUpdateLine(rIdx, lIdx, "usedOn", e.target.value)
                                }
                              />
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginTop: "2px" }}>
                                {line.status ? (
                                  <span
                                    className={`ag-status-badge ${
                                      line.status === "In use"
                                        ? "ag-status-inuse"
                                        : line.status === "Low"
                                        ? "ag-status-low"
                                        : "ag-status-out"
                                    }`}
                                  >
                                    {line.status}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                <select
                                  aria-label="Change status"
                                  className="ag-tracker-select"
                                  style={{ width: "auto", minWidth: "80px", padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
                                  value={line.status || ""}
                                  onChange={(e) =>
                                    handleUpdateLine(rIdx, lIdx, "status", e.target.value)
                                  }
                                >
                                  <option value="">(Status)</option>
                                  <option value="In use">In use</option>
                                  <option value="Low">Low</option>
                                  <option value="Out">Out</option>
                                </select>
                              </div>
                              {line.usedOn && (
                                <span className="ag-tracker-datetime-display">
                                  {formatDisplayDateTime(line.usedOn)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Next Available Column */}
                          <td className="ag-tracker-td">
                            <div className="ag-tracker-datetime-group">
                              <select
                                className="ag-tracker-select"
                                defaultValue=""
                                onChange={(e) => {
                                  handleNextAvailableChoice(rIdx, lIdx, e.target.value)
                                  e.target.value = ""
                                }}
                              >
                                <option value="" disabled>Quick Choice…</option>
                                <option value="Time-Stamp">Time-Stamp</option>
                                <option value="In 1 hour">In 1 hour</option>
                                <option value="In 6 hours">In 6 hours</option>
                                <option value="In 12 hours">In 12 hours</option>
                                <option value="In 24 hours">In 24 hours</option>
                                <option value="Tomorrow (same time)">Tomorrow (same time)</option>
                                <option value="In 7 days">In 7 days</option>
                                <option value="Custom date/time">Custom date/time</option>
                                <option value="Clear">Clear</option>
                              </select>
                              <input
                                type="datetime-local"
                                className="ag-tracker-input"
                                value={line.nextAvailable}
                                onChange={(e) =>
                                  handleUpdateLine(rIdx, lIdx, "nextAvailable", e.target.value)
                                }
                              />
                              {line.nextAvailable && (
                                <span className="ag-tracker-datetime-display">
                                  {formatDisplayDateTime(line.nextAvailable)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Notes Column */}
                          <td className="ag-tracker-td">
                            <div className="ag-tracker-notes-wrapper">
                              <button
                                type="button"
                                className="ag-tracker-notes-expand-btn"
                                onClick={() => handleOpenFullScreenLineNotes(rIdx, lIdx)}
                                title="Open full-screen notes editor"
                                aria-label="Expand Notes"
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                              </button>
                              <textarea
                                className="ag-tracker-notes-textarea"
                                placeholder="Notes for this entry..."
                                value={line.notes}
                                onChange={(e) =>
                                  handleUpdateLine(rIdx, lIdx, "notes", e.target.value)
                                }
                              />
                            </div>
                          </td>

                          {/* Line Action */}
                          <td className="ag-tracker-td" style={{ textAlign: "center" }}>
                            <div className="ag-tracker-line-actions">
                              {row.lines.length > 1 && (
                                <button
                                  type="button"
                                  className="ag-tracker-btn ag-tracker-btn-danger ag-tracker-btn-icon"
                                  onClick={() => handleDeleteLine(rIdx, lIdx)}
                                  title="Delete this line"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </section>

            {/* MOBILE CARDS VIEW (< 768px strictly) */}
            <section className="ag-tracker-mobile-cards">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="ag-tracker-btn text-xs py-1 px-2.5"
                    onClick={handleExpandAll}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Expand All</span>
                  </button>
                  <button
                    type="button"
                    className="ag-tracker-btn text-xs py-1 px-2.5"
                    onClick={handleCollapseAll}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Collapse All</span>
                  </button>
                </div>
              </div>

              {currentTracker.rows.map((row, rIdx) => {
                const rowKey = getRowKey(row, rIdx)
                const isCollapsed = !expandedRows[rowKey]
                let displayLine =
                  row.lines[0] || {
                    googleAccount: "",
                    usedOn: "",
                    nextAvailable: "",
                    status: "",
                    notes: "",
                  }
                for (const l of row.lines) {
                  if (l.usedOn || l.status || l.nextAvailable) displayLine = l
                }
                const rowStatus = displayLine.status || ""
                const statusBorderClass =
                  rowStatus === "In use"
                    ? "ag-tracker-row-inuse"
                    : rowStatus === "Low"
                    ? "ag-tracker-row-low"
                    : rowStatus === "Out"
                    ? "ag-tracker-row-out"
                    : ""

                if (isCollapsed) {
                  return (
                    <div
                      key={rowKey}
                      className={`ag-tracker-mobile-row-card ag-tracker-mobile-row-collapsed ${statusBorderClass}`}
                      onClick={() => toggleRowExpand(rowKey)}
                      style={{ cursor: "pointer", padding: "0.5rem 0.75rem" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold ag-tracker-row-title text-sm truncate">{row.label}</span>
                          {displayLine.googleAccount && (
                            <span className="text-xs text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded truncate">
                              {displayLine.googleAccount}
                            </span>
                          )}
                          {displayLine.status && (
                            <span
                              className={`ag-status-badge text-[11px] ${
                                displayLine.status === "In use"
                                  ? "ag-status-inuse"
                                  : displayLine.status === "Low"
                                  ? "ag-status-low"
                                  : "ag-status-out"
                              }`}
                            >
                              {displayLine.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-gray-400">
                            {displayLine.usedOn ? formatDisplayDateTime(displayLine.usedOn) : "—"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={rowKey} className={`ag-tracker-mobile-row-card ${statusBorderClass}`}>
                    <div className="ag-tracker-mobile-row-header">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <input
                          className="ag-tracker-row-label-input"
                          style={{ textAlign: "left", fontSize: "1rem" }}
                          value={row.label}
                          onChange={(e) => {
                            const newLabel = e.target.value
                            updateCurrentTracker((tr) => {
                              const newRows = [...tr.rows]
                              newRows[rIdx] = { ...newRows[rIdx], label: newLabel }
                              return { ...tr, rows: newRows }
                            })
                          }}
                        />
                        <button
                          type="button"
                          className="ag-tracker-btn-icon text-gray-400 hover:text-white p-1"
                          onClick={() => toggleRowExpand(rowKey)}
                          title="Collapse card"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="ag-tracker-btn ag-tracker-add-line-btn"
                        onClick={() => handleAddLine(rIdx)}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Line
                      </button>
                    </div>

                  {row.lines.map((line, lIdx) => (
                    <div key={line.id} className="ag-tracker-mobile-line-block">
                      {/* Google Account */}
                      <div className="ag-tracker-mobile-field">
                        <label className="ag-tracker-mobile-label">Google Account:</label>
                        {line.isCustomGoogleAccount ? (
                          <div className="ag-tracker-custom-row">
                            <input
                              className="ag-tracker-input"
                              placeholder="Custom account..."
                              value={line.googleAccount}
                              onChange={(e) =>
                                handleUpdateLine(rIdx, lIdx, "googleAccount", e.target.value)
                              }
                            />
                            <button
                              type="button"
                              className="ag-tracker-btn ag-tracker-btn-icon"
                              onClick={() =>
                                handleUpdateLine(rIdx, lIdx, "isCustomGoogleAccount", false)
                              }
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <select
                            className="ag-tracker-select"
                            value={line.googleAccount}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === "__custom__") {
                                handleUpdateLine(rIdx, lIdx, "isCustomGoogleAccount", true)
                              } else if (val === "__manage__") {
                                setManageOptionsOpen(true)
                              } else {
                                handleUpdateLine(rIdx, lIdx, "googleAccount", val)
                              }
                            }}
                          >
                            <option value="">(None)</option>
                            {googleAccountOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                            <option value="__custom__">Other... (Type custom)</option>
                            <option value="__manage__">⚙ Manage options...</option>
                          </select>
                        )}
                      </div>

                      {/* Used On + Status */}
                      <div className="ag-tracker-mobile-field">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <label className="ag-tracker-mobile-label">Used On / Status:</label>
                          {line.status && (
                            <span
                              className={`ag-status-badge ${
                                line.status === "In use"
                                  ? "ag-status-inuse"
                                  : line.status === "Low"
                                  ? "ag-status-low"
                                  : "ag-status-out"
                              }`}
                            >
                              {line.status}
                            </span>
                          )}
                        </div>
                        <select
                          className="ag-tracker-select"
                          defaultValue=""
                          onChange={(e) => {
                            handleUsedOnChoice(rIdx, lIdx, e.target.value)
                            e.target.value = ""
                          }}
                        >
                          <option value="" disabled>Quick Choice…</option>
                          <option value="Time-Stamp">Time-Stamp</option>
                          <option value="Custom date/time">Custom date/time</option>
                          <option value="Clear">Clear</option>
                        </select>
                        <input
                          type="datetime-local"
                          className="ag-tracker-input"
                          value={line.usedOn}
                          onChange={(e) =>
                            handleUpdateLine(rIdx, lIdx, "usedOn", e.target.value)
                          }
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <select
                            aria-label="Line status"
                            className="ag-tracker-select"
                            value={line.status || ""}
                            onChange={(e) =>
                              handleUpdateLine(rIdx, lIdx, "status", e.target.value)
                            }
                          >
                            <option value="">(No status)</option>
                            <option value="In use">In use</option>
                            <option value="Low">Low</option>
                            <option value="Out">Out</option>
                          </select>
                        </div>
                        {line.usedOn && (
                          <span className="ag-tracker-datetime-display">
                            {formatDisplayDateTime(line.usedOn)}
                          </span>
                        )}
                      </div>

                      {/* Next Available */}
                      <div className="ag-tracker-mobile-field">
                        <label className="ag-tracker-mobile-label">Next Available:</label>
                        <select
                          className="ag-tracker-select"
                          defaultValue=""
                          onChange={(e) => {
                            handleNextAvailableChoice(rIdx, lIdx, e.target.value)
                            e.target.value = ""
                          }}
                        >
                          <option value="" disabled>Quick Choice…</option>
                          <option value="Time-Stamp">Time-Stamp</option>
                          <option value="In 1 hour">In 1 hour</option>
                          <option value="In 6 hours">In 6 hours</option>
                          <option value="In 12 hours">In 12 hours</option>
                          <option value="In 24 hours">In 24 hours</option>
                          <option value="Tomorrow (same time)">Tomorrow (same time)</option>
                          <option value="In 7 days">In 7 days</option>
                          <option value="Custom date/time">Custom date/time</option>
                          <option value="Clear">Clear</option>
                        </select>
                        <input
                          type="datetime-local"
                          className="ag-tracker-input"
                          value={line.nextAvailable}
                          onChange={(e) =>
                            handleUpdateLine(rIdx, lIdx, "nextAvailable", e.target.value)
                          }
                        />
                        {line.nextAvailable && (
                          <span className="ag-tracker-datetime-display">
                            {formatDisplayDateTime(line.nextAvailable)}
                          </span>
                        )}
                      </div>

                      {/* Notes with Maximize2 */}
                      <div className="ag-tracker-mobile-field">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <label className="ag-tracker-mobile-label">Notes:</label>
                          <button
                            type="button"
                            className="ag-tracker-btn"
                            style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                            onClick={() => handleOpenFullScreenLineNotes(rIdx, lIdx)}
                          >
                            <Maximize2 className="h-3 w-3 mr-1 inline" /> Full Screen
                          </button>
                        </div>
                        <div className="ag-tracker-notes-wrapper">
                          <textarea
                            className="ag-tracker-notes-textarea"
                            placeholder="Notes for this entry..."
                            value={line.notes}
                            onChange={(e) =>
                              handleUpdateLine(rIdx, lIdx, "notes", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {row.lines.length > 1 && (
                        <div style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="ag-tracker-btn ag-tracker-btn-danger"
                            onClick={() => handleDeleteLine(rIdx, lIdx)}
                          >
                            <Trash2 className="h-4 w-4" /> Remove Line
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
            </section>

            {/* BOTTOM TRACKER NOTES */}
            <section className="ag-tracker-bottom-notes">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="ag-tracker-bottom-notes-input" className="ag-tracker-bottom-notes-label">
                  Tracker Notes:
                </label>
                <button
                  type="button"
                  className="ag-tracker-btn"
                  onClick={handleOpenFullScreenTrackerNotes}
                  title="Expand Tracker Notes"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Full Screen</span>
                </button>
              </div>
              <div className="ag-tracker-bottom-notes-wrapper">
                <textarea
                  id="ag-tracker-bottom-notes-input"
                  className="ag-tracker-bottom-notes-textarea"
                  placeholder="General notes for this tracker..."
                  value={currentTracker.trackerNotes}
                  onChange={(e) =>
                    updateCurrentTracker((tr) => ({ ...tr, trackerNotes: e.target.value }))
                  }
                />
              </div>
            </section>

            {/* PRINT ONLY CLEAN AREA */}
            <div className="ag-tracker-print-area" style={{ display: "none" }}>
              <div className="ag-tracker-print-header">
                <span className="ag-tracker-print-title">AG Account Tracker</span>
                <span className="ag-tracker-print-appname">
                  App Name: {currentTracker.appName || "_______________________"}
                </span>
              </div>

              <table className="ag-tracker-print-table">
                <thead>
                  <tr>
                    <th className="ag-tracker-print-th" style={{ width: "12%" }}>Row</th>
                    <th className="ag-tracker-print-th" style={{ width: "20%" }}>Google Account</th>
                    <th className="ag-tracker-print-th" style={{ width: "18%" }}>Used On / Status</th>
                    <th className="ag-tracker-print-th" style={{ width: "18%" }}>Next Available</th>
                    <th className="ag-tracker-print-th" style={{ width: "32%" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTracker.rows.map((row) =>
                    row.lines.map((line, lIdx) => (
                      <tr key={line.id}>
                        {lIdx === 0 && (
                          <td
                            className="ag-tracker-print-td"
                            rowSpan={row.lines.length}
                            style={{ fontWeight: "bold", verticalAlign: "middle" }}
                          >
                            {row.label}
                          </td>
                        )}
                        <td className="ag-tracker-print-td">{line.googleAccount || "—"}</td>
                        <td className="ag-tracker-print-td">
                          {formatDisplayDateTime(line.usedOn) || "—"}{" "}
                          {line.status && `[${line.status}]`}
                        </td>
                        <td className="ag-tracker-print-td">
                          {formatDisplayDateTime(line.nextAvailable) || "—"}
                        </td>
                        <td className="ag-tracker-print-td" style={{ minHeight: "40px" }}>
                          {line.notes || ""}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {currentTracker.trackerNotes && (
                <div className="ag-tracker-print-notes-section">
                  <div className="ag-tracker-print-notes-title">Tracker Notes:</div>
                  <div className="ag-tracker-print-notes-text">
                    {currentTracker.trackerNotes}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* QUICK LOG POPUP DIALOG */}
      {quickLogOpen && (
        <div
          className="ag-tracker-modal-dialog-overlay"
          onClick={() => setQuickLogOpen(false)}
        >
          <div
            className={`ag-quick-log-card journal-theme-${theme}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ag-tracker-modal-dialog-header">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                Quick Log Account Status
              </h3>
              <button
                type="button"
                className="ag-tracker-btn ag-tracker-btn-icon"
                onClick={() => setQuickLogOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Select Account:
                </label>
                <select
                  className="ag-tracker-select font-semibold text-base py-2"
                  value={quickLogAccount}
                  onChange={(e) => setQuickLogAccount(e.target.value)}
                >
                  {googleAccountOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* 1. STARTED USING */}
                <button
                  type="button"
                  className="ag-quick-log-btn-big ag-quick-log-btn-green"
                  onClick={() => handleQuickLogStarted(quickLogAccount)}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span>Started using</span>
                </button>

                {/* 2. OUT OF TOKENS */}
                <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-red-500/25 bg-red-500/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="ag-quick-log-btn-big ag-quick-log-btn-red flex-1"
                      onClick={() => handleQuickLogOutOfTokens(quickLogAccount)}
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span>Out of tokens</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Reset in:</span>
                    <select
                      className="ag-tracker-select text-xs py-1"
                      value={quickLogResetChoice}
                      onChange={(e) => setQuickLogResetChoice(e.target.value)}
                    >
                      <option value="default">
                        {data.options?.accountResetHours?.[quickLogAccount] ?? 24}h (Account Default)
                      </option>
                      <option value="5">5 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                      <option value="72">3 days (72h)</option>
                      <option value="168">7 days (168h)</option>
                      <option value="custom">Custom hours...</option>
                    </select>
                    {quickLogResetChoice === "custom" && (
                      <input
                        type="number"
                        className="ag-tracker-input text-xs w-16 py-1"
                        min="1"
                        value={quickLogCustomHours}
                        onChange={(e) => setQuickLogCustomHours(Number(e.target.value))}
                      />
                    )}
                  </div>
                </div>

                {/* 3. RUNNING LOW */}
                <button
                  type="button"
                  className="ag-quick-log-btn-big ag-quick-log-btn-amber"
                  onClick={() => handleQuickLogRunningLow(quickLogAccount)}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span>Running low</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL DIALOG */}
      {historyOpen && (
        <div
          className="ag-tracker-modal-dialog-overlay"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className={`ag-tracker-modal-dialog journal-theme-${theme}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ag-tracker-modal-dialog-header">
              <h3 className="text-base font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-purple-400" />
                Past Cycle Archives
              </h3>
              <button
                type="button"
                className="ag-tracker-btn ag-tracker-btn-icon"
                onClick={() => setHistoryOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="ag-tracker-modal-dialog-body">
              {historyList.length === 0 ? (
                <div className="text-sm text-gray-500 p-4 text-center">
                  No archived cycles saved yet. Use &quot;New Cycle&quot; to archive and start fresh.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {historyList.map((item, idx) => (
                    <div key={item.id || idx} className="ag-history-item">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {item.archiveFilename || `Cycle ${idx + 1}`}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="ag-tracker-btn ag-tracker-btn-primary"
                        onClick={() => handleRestoreSnapshot(item.data)}
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "0.75rem 1.25rem",
                borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.1))",
              }}
            >
              <button
                type="button"
                className="ag-tracker-btn"
                onClick={() => setHistoryOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN NOTES EDITOR */}
      {fullScreenNotes !== null && (
        <div className={`ag-tracker-fullscreen-editor journal-theme-${theme}`} role="dialog" aria-modal="true">
          <div className="ag-tracker-fullscreen-header">
            <h3 className="ag-tracker-fullscreen-title">{fullScreenNotes.title}</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="ag-tracker-btn ag-tracker-btn-primary"
                onClick={() => setFullScreenNotes(null)}
              >
                Done
              </button>
            </div>
          </div>
          <textarea
            className="ag-tracker-fullscreen-textarea"
            placeholder="Type your detailed notes here..."
            value={fullScreenNotes.value}
            onChange={(e) => handleFullScreenNotesChange(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* MANAGE GOOGLE ACCOUNT OPTIONS MODAL DIALOG */}
      {manageOptionsOpen && (
        <div
          className="ag-tracker-modal-dialog-overlay"
          onClick={() => setManageOptionsOpen(false)}
        >
          <div
            className={`ag-tracker-modal-dialog journal-theme-${theme}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ag-tracker-modal-dialog-header">
              <h3 className="text-base font-bold">Manage Google Account Options</h3>
              <button
                type="button"
                className="ag-tracker-btn ag-tracker-btn-icon"
                onClick={() => setManageOptionsOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="ag-tracker-modal-dialog-body">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="ag-tracker-input"
                  placeholder="Add new Google account option..."
                  value={newOptionInput}
                  onChange={(e) => setNewOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCustomGoogleAccount()
                  }}
                />
                <button
                  type="button"
                  className="ag-tracker-btn ag-tracker-btn-primary"
                  onClick={handleAddCustomGoogleAccount}
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">
                  Account Reset Times (Hours until tokens recover):
                </p>
                <div className="ag-tracker-options-list">
                  {googleAccountOptions.map((opt) => (
                    <div key={opt} className="ag-tracker-option-item">
                      <span className="text-sm font-semibold">{opt}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">Reset:</span>
                        <input
                          type="number"
                          className="ag-tracker-input text-xs w-16 py-1 text-center"
                          min="1"
                          value={data.options?.accountResetHours?.[opt] ?? 24}
                          onChange={(e) =>
                            handleUpdateResetHours(opt, Number(e.target.value))
                          }
                        />
                        <span className="text-xs text-gray-400">hrs</span>
                        {!(DEFAULT_ROW_LABELS.includes(opt)) && (
                          <button
                            type="button"
                            className="ag-tracker-btn ag-tracker-btn-danger ag-tracker-btn-icon ml-1"
                            onClick={() => handleDeleteCustomGoogleAccount(opt)}
                            title="Delete custom option"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "0.75rem 1.25rem",
                borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.1))",
              }}
            >
              <button
                type="button"
                className="ag-tracker-btn"
                onClick={() => setManageOptionsOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS POPUP DIALOG */}
      <AgAccountTrackerReports
        isOpen={reportsOpen}
        onClose={() => setReportsOpen(false)}
        trackers={data.trackers}
        onUpdateAccountData={handleUpdateAccountFromReport}
        onOpenNotesEditor={(title, value, onSave) => {
          setFullScreenNotes({
            title,
            value,
            customCallback: onSave,
          })
        }}
        theme={theme}
      />

      {/* PROCESS GUIDE & HELP POPUP DIALOG */}
      <AgAccountTrackerHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        theme={theme}
      />
    </>
  )
}

export default function AgAccountTrackerModal(props: AgAccountTrackerModalProps) {
  if (!props.isOpen) return null

  return (
    <TrackerErrorBoundary>
      <AgAccountTrackerModalInner {...props} />
    </TrackerErrorBoundary>
  )
}
