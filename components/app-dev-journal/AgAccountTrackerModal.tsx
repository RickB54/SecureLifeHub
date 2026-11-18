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
} from "lucide-react"

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

export interface TrackerRowLine {
  id: string
  googleAccount: string
  usedOn: string // Stored as ISO local string (YYYY-MM-DDTHH:mm)
  nextAvailable: string // Stored as ISO local string (YYYY-MM-DDTHH:mm)
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
}

export interface AgTrackerStorageData {
  trackers: AccountTracker[]
  activeTrackerIndex: number
  options: TrackerOptions
}

// Convert Date to local ISO string (YYYY-MM-DDTHH:mm)
function toLocalIsoString(d: Date): string {
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
      notes: "",
    },
    {
      id: "l2-" + Math.random().toString(36).substring(2, 9),
      googleAccount: "",
      usedOn: "",
      nextAvailable: "",
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
      options: { customGoogleAccounts: [] },
    }
  }

  const migratedTrackers = rawObj.trackers.map((tr: any) => ({
    ...tr,
    rows: (tr.rows || []).map((row: any) => ({
      ...row,
      lines: (row.lines || []).map((line: any) => {
        let { usedOn, notes, nextAvailableDate, nextAvailable } = line
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

        // Migrate nextAvailable
        const nextVal = nextAvailable || nextAvailableDate || ""

        return {
          id: line.id || "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: line.googleAccount || "",
          usedOn: usedOn || "",
          nextAvailable: nextVal,
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
    },
  }
}

interface AgAccountTrackerModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FullScreenNotesState {
  title: string
  value: string
  rowIndex?: number
  lineIndex?: number
  isTrackerNotes?: boolean
}

export default function AgAccountTrackerModal({
  isOpen,
  onClose,
}: AgAccountTrackerModalProps) {
  const [data, setData] = useState<AgTrackerStorageData>(getInitialData)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved")
  const [manageOptionsOpen, setManageOptionsOpen] = useState(false)
  const [newOptionInput, setNewOptionInput] = useState("")
  const [editingOption, setEditingOption] = useState<{ original: string; current: string } | null>(null)
  const [fullScreenNotes, setFullScreenNotes] = useState<FullScreenNotesState | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Escape key handler: closes full-screen editor -> manage options -> tracker
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
  }, [isOpen, fullScreenNotes, manageOptionsOpen, handleImmediateClose])

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
        // Clear instead of removing
        targetRow.lines = [
          {
            id: "l-" + Math.random().toString(36).substring(2, 9),
            googleAccount: "",
            usedOn: "",
            nextAvailable: "",
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
      // Leave value unchanged, user will edit the datetime-local picker
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

  // Export JSON
  const handleExportJson = () => {
    try {
      const jsonStr = JSON.stringify(data, null, 2)
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

  // Import JSON
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

  // Manage Google Account Options
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
        },
      }
    })
    setNewOptionInput("")
  }

  const handleDeleteCustomGoogleAccount = (optToDelete: string) => {
    updateData((prev) => {
      const existing = prev.options.customGoogleAccounts || []
      return {
        ...prev,
        options: {
          ...prev.options,
          customGoogleAccounts: existing.filter((item) => item !== optToDelete),
        },
      }
    })
  }

  const handleRenameCustomGoogleAccount = (oldVal: string, newVal: string) => {
    const trimmed = newVal.trim()
    if (!trimmed || trimmed === oldVal) {
      setEditingOption(null)
      return
    }

    updateData((prev) => {
      const existing = prev.options.customGoogleAccounts || []
      return {
        ...prev,
        options: {
          ...prev.options,
          customGoogleAccounts: existing.map((item) => (item === oldVal ? trimmed : item)),
        },
      }
    })
    setEditingOption(null)
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

    if (fullScreenNotes.isTrackerNotes) {
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

  if (!isOpen) return null

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
          className="ag-tracker-dialog"
          onClick={(e) => e.stopPropagation()}
        >
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
            </div>

            <div className="ag-tracker-header-actions">
              <button
                type="button"
                className="ag-tracker-btn"
                onClick={handlePrint}
                title="Print clean table formatted for US Letter"
                aria-label="Print"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>

              <button
                type="button"
                className="ag-tracker-btn"
                onClick={handleExportJson}
                title="Export all trackers as JSON backup"
                aria-label="Export JSON"
              >
                <Download className="h-4 w-4" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                className="ag-tracker-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Import tracker backup from JSON file"
                aria-label="Import JSON"
              >
                <Upload className="h-4 w-4" />
                <span>Import JSON</span>
              </button>

              <button
                type="button"
                className="ag-tracker-btn ag-tracker-btn-icon"
                onClick={handleImmediateClose}
                title="Close tracker (Esc)"
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
              <table className="ag-tracker-table">
                <thead>
                  <tr>
                    <th className="ag-tracker-th" style={{ width: "110px" }}>Row</th>
                    <th className="ag-tracker-th" style={{ width: "165px" }}>Google Account</th>
                    <th className="ag-tracker-th" style={{ width: "165px" }}>Used On</th>
                    <th className="ag-tracker-th" style={{ width: "165px" }}>Next Available</th>
                    <th className="ag-tracker-th" style={{ width: "360px" }}>Notes</th>
                    <th className="ag-tracker-th" style={{ width: "45px", textAlign: "center" }}>Act</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTracker.rows.map((row, rIdx) => (
                    <React.Fragment key={row.id}>
                      {row.lines.map((line, lIdx) => (
                        <tr key={line.id} className="ag-tracker-tr">
                          {/* Row Label (spans all lines of this row) */}
                          {lIdx === 0 && (
                            <td
                              className="ag-tracker-td ag-tracker-row-label-cell"
                              rowSpan={row.lines.length}
                            >
                              <input
                                className="ag-tracker-row-label-input"
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

                          {/* Used On Column: Quick Choice dropdown + datetime-local picker */}
                          <td className="ag-tracker-td">
                            <div className="ag-tracker-datetime-group">
                              <select
                                className="ag-tracker-select"
                                defaultValue=""
                                onChange={(e) => {
                                  handleUsedOnChoice(rIdx, lIdx, e.target.value)
                                  e.target.value = "" // Reset back to Quick Choice…
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
                              {line.usedOn && (
                                <span className="ag-tracker-datetime-display">
                                  {formatDisplayDateTime(line.usedOn)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Next Available Column: Quick Choice dropdown + datetime-local picker */}
                          <td className="ag-tracker-td">
                            <div className="ag-tracker-datetime-group">
                              <select
                                className="ag-tracker-select"
                                defaultValue=""
                                onChange={(e) => {
                                  handleNextAvailableChoice(rIdx, lIdx, e.target.value)
                                  e.target.value = "" // Reset back to Quick Choice…
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

                          {/* Notes Column: Fixed 340px wide by 150px high, scrollbar, resize handle + Maximize2 button */}
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
                  ))}
                </tbody>
              </table>
            </section>

            {/* MOBILE CARDS VIEW (< 768px strictly) */}
            <section className="ag-tracker-mobile-cards">
              {currentTracker.rows.map((row, rIdx) => (
                <div key={row.id} className="ag-tracker-mobile-row-card">
                  <div className="ag-tracker-mobile-row-header">
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

                      {/* Used On */}
                      <div className="ag-tracker-mobile-field">
                        <label className="ag-tracker-mobile-label">Used On:</label>
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

                      {/* Notes with Maximize2 button */}
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
              ))}
            </section>

            {/* BOTTOM TRACKER NOTES (Fixed 150px high, scrollbar, resize handle + Maximize2) */}
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

            {/* PRINT ONLY CLEAN AREA (Formatted for US Letter matching original PDF) */}
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
                    <th className="ag-tracker-print-th" style={{ width: "18%" }}>Used On</th>
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
                          {formatDisplayDateTime(line.usedOn) || "—"}
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

      {/* FULL-SCREEN NOTES EDITOR (Covering everything, z-[999999]) */}
      {fullScreenNotes !== null && (
        <div className="ag-tracker-fullscreen-editor" role="dialog" aria-modal="true">
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
            className="ag-tracker-modal-dialog"
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
                  Custom Saved Options (Persisted Across Sessions):
                </p>
                <div className="ag-tracker-options-list">
                  {(data.options.customGoogleAccounts || []).length === 0 ? (
                    <div className="text-xs text-gray-500 p-2 text-center">
                      No custom options added yet.
                    </div>
                  ) : (
                    data.options.customGoogleAccounts.map((opt) => (
                      <div key={opt} className="ag-tracker-option-item">
                        {editingOption?.original === opt ? (
                          <div style={{ display: "flex", gap: "0.25rem", flex: 1 }}>
                            <input
                              className="ag-tracker-input"
                              value={editingOption.current}
                              onChange={(e) =>
                                setEditingOption({ original: opt, current: e.target.value })
                              }
                              autoFocus
                            />
                            <button
                              type="button"
                              className="ag-tracker-btn ag-tracker-btn-primary"
                              onClick={() =>
                                handleRenameCustomGoogleAccount(opt, editingOption.current)
                              }
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="ag-tracker-btn"
                              onClick={() => setEditingOption(null)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm">{opt}</span>
                            <div style={{ display: "flex", gap: "0.25rem" }}>
                              <button
                                type="button"
                                className="ag-tracker-btn ag-tracker-btn-icon"
                                onClick={() =>
                                  setEditingOption({ original: opt, current: opt })
                                }
                                title="Rename option"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="ag-tracker-btn ag-tracker-btn-danger ag-tracker-btn-icon"
                                onClick={() => handleDeleteCustomGoogleAccount(opt)}
                                title="Delete option"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">
                  Default / Built-in Options:
                </p>
                <div className="text-xs text-gray-500">
                  {DEFAULT_ROW_LABELS.join(", ")}
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
    </>
  )
}
