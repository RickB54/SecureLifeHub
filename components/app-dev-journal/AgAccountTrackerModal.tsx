// @ts-nocheck
"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
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
  HelpCircle,
  Play,
  CheckCircle,
  Calendar,
  StickyNote,
  AppWindow,
  Copy,
  ExternalLink,
} from "lucide-react"
import { formatDate } from "./journal/dates"
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
export const AGENTS_STORAGE_KEY = "slh-ag-tracker-agents"
const NOTES_MIGRATED_KEY = "slh-ag-tracker-notes-migrated"
const OUT_MIGRATED_KEY = "slh-ag-tracker-out-migrated-v1"
const NOTES_EXPANDED_KEY = "slh-ag-tracker-notes-expanded"
const EXPANDED_ROWS_KEY = "slh-ag-tracker-expanded-rows"
const DAY_FILTER_KEY = "slh-ag-tracker-dayfilter"
const SORT_MODE_KEY = "slh-ag-tracker-sort"
const ACTIVE_TAB_KEY = "slh-ag-tracker-activetab"

const DEFAULT_AGENTS = ["Gemini", "Claude"]

export type LineStatus = "In use" | "Low" | "Out" | "Done" | ""

export interface TrackerRowLine {
  id: string
  googleAccount: string
  usedOn: string
  nextAvailable: string
  status?: LineStatus
  notes: string
  isCustomGoogleAccount?: boolean
  agent: string
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
  day?: string
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

// Format local ISO string to MM-DD-YYYY h:mm AM/PM (nowrap, full date visible)
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

// Format date only as MM-DD-YYYY
export function formatDisplayDateOnly(isoStr: string): string {
  if (!isoStr) return ""
  const datePart = isoStr.split("T")[0]
  const parts = datePart?.split("-")
  if (!parts || parts.length !== 3) return isoStr
  return `${parts[1]}-${parts[2]}-${parts[0]}`
}

export function getTodayFormatted(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${d.getFullYear()}`
}

// Day tracking helpers
function getLocalDateStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isToday(isoStr: string): boolean {
  if (!isoStr) return false
  return isoStr.startsWith(getLocalDateStr())
}

function isYesterday(isoStr: string): boolean {
  if (!isoStr) return false
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const pad = (n: number) => String(n).padStart(2, "0")
  const ys = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`
  return isoStr.startsWith(ys)
}

export function dayChip(isoStr: string): string {
  if (!isoStr) return ""
  if (isToday(isoStr)) return "Today"
  if (isYesterday(isoStr)) return "Yesterday"
  const parts = isoStr.split("T")[0]?.split("-") || []
  if (parts.length >= 3) return `${parts[1]}-${parts[2]}`
  return ""
}

// Ready chip
export function readyChip(isoStr: string): { label: string; cls: string } {
  if (!isoStr) return { label: "—", cls: "" }
  const ms = new Date(isoStr).getTime()
  const nowMs = Date.now()
  if (isNaN(ms)) return { label: "—", cls: "" }
  const diffMs = ms - nowMs
  if (diffMs <= 0) return { label: "Ready now", cls: "ag-chip-green" }
  const hrs = diffMs / (1000 * 60 * 60)
  const totalMins = Math.floor(diffMs / (1000 * 60))
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const label = h > 0 ? `${h}h ${m}m` : `${m}m`
  if (hrs <= 6) return { label: `Ready in ${label}`, cls: "ag-chip-amber" }
  return { label: `Ready in ${label}`, cls: "ag-chip-red" }
}

// Load custom agents from localStorage
function loadCustomAgents(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(AGENTS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveCustomAgents(agents: string[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents))
  } catch {}
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
      agent: "Gemini",
    },
    {
      id: "l2-" + Math.random().toString(36).substring(2, 9),
      googleAccount: "",
      usedOn: "",
      nextAvailable: "",
      status: "",
      notes: "",
      agent: "Claude",
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
    day: toLocalIsoString(new Date()).slice(0, 10),
  }
}

// Migration helper
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
      lines: (row.lines || []).map((line: any, lIdx: number) => {
        let { usedOn, notes, nextAvailableDate, nextAvailable, status, agent } = line
        let currentNotes = notes || ""

        if (usedOn && typeof usedOn === "string" && usedOn.trim() !== "") {
          const isDatePattern = /^\d{4}-\d{2}-\d{2}/.test(usedOn.trim())
          if (!isDatePattern) {
            const entry = `Used On: ${usedOn.trim()}`
            currentNotes = currentNotes ? `${currentNotes}\n${entry}` : entry
            usedOn = ""
          }
        }

        const nextVal = nextAvailable || nextAvailableDate || ""

        // Auto-assign agent for migration: line 1 = Gemini, line 2 = Claude
        let migratedAgent = agent || ""
        if (!migratedAgent) {
          if (lIdx === 0) migratedAgent = "Gemini"
          else if (lIdx === 1) migratedAgent = "Claude"
          else migratedAgent = ""
        }

        let lineStatus = status || ""
        if (lineStatus === "Out") lineStatus = "Done"

        return {
          id: line.id || "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: line.googleAccount || "",
          usedOn: usedOn || "",
          nextAvailable: nextVal,
          status: lineStatus as LineStatus,
          notes: currentNotes,
          isCustomGoogleAccount: Boolean(line.isCustomGoogleAccount),
          agent: migratedAgent,
        }
      }),
    })),
  }))

  return {
    trackers: migratedTrackers
      .map((tr: any) => {
        if (tr.day) return tr
        // Find newest usedOn date across all lines
        let newestDate = ""
        for (const row of tr.rows || []) {
          for (const line of row.lines || []) {
            if (line.usedOn && line.usedOn > newestDate) newestDate = line.usedOn
          }
        }
        const day = newestDate ? newestDate.slice(0, 10) : toLocalIsoString(new Date()).slice(0, 10)
        return { ...tr, day }
      })
      .sort((a: any, b: any) => (a.day || "").localeCompare(b.day || "")),
    activeTrackerIndex: typeof rawObj.activeTrackerIndex === "number" ? rawObj.activeTrackerIndex : 0,
    options: {
      customGoogleAccounts: Array.isArray(rawObj.options?.customGoogleAccounts)
        ? rawObj.options.customGoogleAccounts
        : [],
      accountResetHours: rawObj.options?.accountResetHours || {},
    },
  }
}

// Convert any status === "Out" to "Done" recursively in object/arrays
function convertOutToDoneInObject(obj: any): any {
  if (!obj) return obj
  if (Array.isArray(obj)) {
    return obj.map(convertOutToDoneInObject)
  }
  if (typeof obj === "object") {
    const res: Record<string, any> = {}
    for (const k of Object.keys(obj)) {
      if (k === "status" && obj[k] === "Out") {
        res[k] = "Done"
      } else {
        res[k] = convertOutToDoneInObject(obj[k])
      }
    }
    return res
  }
  return obj
}

// One-time migration: every saved line, History snapshot, and carry-over record with status Out becomes Done
function checkAndMigrateOutStatus(storageData: AgTrackerStorageData): AgTrackerStorageData {
  if (typeof window === "undefined") return storageData
  try {
    const alreadyMigrated = localStorage.getItem(OUT_MIGRATED_KEY)
    if (alreadyMigrated === "true") return storageData

    // 1. Migrate current trackers
    let hasAnyChanges = false
    const updatedTrackers = storageData.trackers.map((tracker) => ({
      ...tracker,
      rows: (tracker.rows || []).map((row) => ({
        ...row,
        lines: (row.lines || []).map((line) => {
          if (line.status === "Out") {
            hasAnyChanges = true
            return { ...line, status: "Done" as LineStatus }
          }
          return line
        }),
      })),
    }))

    // 2. Migrate History snapshots
    try {
      const historyRaw = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (historyRaw) {
        const historyArr = JSON.parse(historyRaw)
        if (Array.isArray(historyArr)) {
          const updatedHistory = historyArr.map((item: any) => convertOutToDoneInObject(item))
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
        }
      }
    } catch (e) {
      console.warn("Failed to migrate history snapshots from Out to Done:", e)
    }

    // 3. Migrate Carryover data
    try {
      const carryoverRaw = localStorage.getItem(CARRYOVER_STORAGE_KEY)
      if (carryoverRaw) {
        const carryoverObj = JSON.parse(carryoverRaw)
        if (carryoverObj && typeof carryoverObj === "object") {
          const updatedCarryover = convertOutToDoneInObject(carryoverObj)
          localStorage.setItem(CARRYOVER_STORAGE_KEY, JSON.stringify(updatedCarryover))
        }
      }
    } catch (e) {
      console.warn("Failed to migrate carryover data from Out to Done:", e)
    }

    localStorage.setItem(OUT_MIGRATED_KEY, "true")
    if (hasAnyChanges) {
      const nextData = { ...storageData, trackers: updatedTrackers }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData))
      return nextData
    }
  } catch (err) {
    console.warn("Failed Out->Done status migration:", err)
  }
  return storageData
}

// One-time migration: append non-empty line notes to Tracker Notes as [Account – Agent – MM-DD-YYYY]: text
function checkAndMigrateLineNotes(storageData: AgTrackerStorageData): AgTrackerStorageData {
  if (typeof window === "undefined") return storageData
  try {
    const alreadyMigrated = localStorage.getItem(NOTES_MIGRATED_KEY)
    if (alreadyMigrated === "true") return storageData

    let hasAnyChanges = false
    const updatedTrackers = storageData.trackers.map((tracker) => {
      const notesToAppend: string[] = []
      tracker.rows.forEach((row) => {
        row.lines.forEach((line) => {
          if (line.notes && line.notes.trim()) {
            const dateStr = line.usedOn ? formatDisplayDateOnly(line.usedOn) : getTodayFormatted()
            const agentStr = line.agent || "Unassigned"
            notesToAppend.push(`[${row.label} – ${agentStr} – ${dateStr}]: ${line.notes.trim()}`)
          }
        })
      })

      if (notesToAppend.length > 0) {
        hasAnyChanges = true
        const separator = tracker.trackerNotes && tracker.trackerNotes.trim() ? "\n\n" : ""
        return {
          ...tracker,
          trackerNotes: (tracker.trackerNotes ? tracker.trackerNotes + separator : "") + notesToAppend.join("\n\n"),
        }
      }
      return tracker
    })

    localStorage.setItem(NOTES_MIGRATED_KEY, "true")
    if (hasAnyChanges) {
      const nextData = { ...storageData, trackers: updatedTrackers }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData))
      return nextData
    }
  } catch (err) {
    console.warn("Failed line notes migration:", err)
  }
  return storageData
}

function getInitialData(): AgTrackerStorageData {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const migrated = migrateStorageData(parsed)
        const notesMigrated = checkAndMigrateLineNotes(migrated)
        const res = checkAndMigrateOutStatus(notesMigrated)

        // Check if an active tab was remembered
        const rememberedTabId = localStorage.getItem(ACTIVE_TAB_KEY)
        if (rememberedTabId && Array.isArray(res.trackers)) {
          const foundIdx = res.trackers.findIndex((t: any) => t.id === rememberedTabId)
          if (foundIdx >= 0) {
            res.activeTrackerIndex = foundIdx
          }
        }
        return res
      }
    } catch (err) {
      console.warn("Failed to read tracker data from localStorage:", err)
    }
  }

  const base = {
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
  return checkAndMigrateLineNotes(base)
}

interface AgAccountTrackerModalProps {
  isOpen: boolean
  onClose: () => void
  theme?: string
}

interface FullScreenNotesState {
  title: string
  value: string
  customCallback?: (val: string) => void
}

function loadExpandedRows(): Record<string, boolean> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(EXPANDED_ROWS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
  }
  return {}
}

function getTabDisplayName(tracker: AccountTracker): string {
  const dayDate = tracker.day ? tracker.day : toLocalIsoString(new Date()).slice(0, 10)
  const parts = dayDate.split("-")
  const dayFormatted = parts.length === 3 ? `${parts[1]}-${parts[2]}-${parts[0]}` : dayDate
  const app = tracker.appName?.trim() || ""
  if (!app) return dayFormatted
  const appTruncated = app.length > 14 ? app.slice(0, 14) + "…" : app
  return `${dayFormatted} – ${appTruncated}`
}

function getTabFullTitle(tracker: AccountTracker): string {
  const dayDate = tracker.day ? tracker.day : toLocalIsoString(new Date()).slice(0, 10)
  const parts = dayDate.split("-")
  const dayFormatted = parts.length === 3 ? `${parts[1]}-${parts[2]}-${parts[0]}` : dayDate
  const app = tracker.appName?.trim() || ""
  return app ? `${dayFormatted} – ${app}` : dayFormatted
}

function saveExpandedRows(map: Record<string, boolean>) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(EXPANDED_ROWS_KEY, JSON.stringify(map))
    } catch {}
  }
}

// ============================================================
// STATUS BADGE RENDERER
// ============================================================
function renderStatusBadge(status: string | undefined) {
  if (!status) return <span className="ag-status-empty-chip">Status</span>
  const displayStatus = status === "Out" ? "Done" : status
  const cls =
    displayStatus === "In use" ? "ag-status-badge ag-status-inuse"
    : displayStatus === "Low" ? "ag-status-badge ag-status-low"
    : displayStatus === "Done" ? "ag-status-badge ag-status-done"
    : "ag-status-badge"
  return <span className={cls}>{displayStatus}</span>
}

// ============================================================
// ANCHORED STATUS POPUP MENU
// ============================================================
function StatusPopupMenu({
  pos,
  currentStatus,
  onSelect,
  onClose,
}: {
  pos: { top: number; left: number }
  currentStatus: string
  onSelect: (st: string) => void
  onClose: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const options: { label: string; value: string; color: string }[] = [
    { label: "In use", value: "In use", color: "#34d399" },
    { label: "Low", value: "Low", color: "#fbbf24" },
    { label: "Done", value: "Done", color: "#f87171" },
    { label: "Clear", value: "", color: "#9ca3af" },
  ]

  return (
    <div
      ref={menuRef}
      className="ag-status-popup-menu"
      style={{
        position: "fixed",
        top: Math.min(pos.top, window.innerHeight - 170),
        left: Math.min(pos.left, window.innerWidth - 130),
        zIndex: 100002,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          className={`ag-status-popup-item ${currentStatus === opt.value ? "active" : ""}`}
          onClick={() => {
            onSelect(opt.value)
            onClose()
          }}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: opt.color }} />
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

// ============================================================
// AGENT COMBOBOX (standalone helper)
// ============================================================
function AgentCombobox({
  value,
  customAgents,
  onChangeAgent,
  onCustomAgentsChange,
}: {
  value: string
  customAgents: string[]
  onChangeAgent: (v: string) => void
  onCustomAgentsChange: (agents: string[]) => void
}) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customInput, setCustomInput] = useState("")
  const [showManage, setShowManage] = useState(false)
  const [editingAgent, setEditingAgent] = useState<{ original: string; current: string } | null>(null)

  const allAgentOptions = [...DEFAULT_AGENTS, ...customAgents]

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === "__other__") {
      setShowCustomInput(true)
    } else if (val === "__manage__") {
      setShowManage(true)
    } else {
      setShowCustomInput(false)
      onChangeAgent(val)
    }
  }

  function commitCustom() {
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (!allAgentOptions.includes(trimmed)) {
      const updated = [...customAgents, trimmed]
      onCustomAgentsChange(updated)
    }
    onChangeAgent(trimmed)
    setShowCustomInput(false)
    setCustomInput("")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {showManage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200000,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowManage(false)}
        >
          <div
            style={{
              background: "var(--card, #1e1e1e)",
              border: "1px solid var(--border, rgba(255,255,255,0.2))",
              borderRadius: "0.5rem",
              padding: "1rem",
              minWidth: "300px",
              maxWidth: "400px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <strong>Manage Agent Options</strong>
              <button type="button" className="ag-tracker-btn ag-tracker-btn-icon" onClick={() => setShowManage(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            {customAgents.length === 0 && (
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #9ca3af)" }}>No custom agents yet.</p>
            )}
            {customAgents.map((ag) => (
              <div key={ag} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                {editingAgent?.original === ag ? (
                  <>
                    <input
                      className="ag-tracker-input"
                      style={{ flex: 1, fontSize: "0.8125rem", padding: "0.2rem 0.4rem" }}
                      value={editingAgent.current}
                      onChange={(e) => setEditingAgent({ ...editingAgent, current: e.target.value })}
                    />
                    <button
                      type="button"
                      className="ag-tracker-btn ag-tracker-btn-primary"
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                      onClick={() => {
                        const trimmed = editingAgent.current.trim()
                        if (!trimmed) return
                        const updated = customAgents.map((a) => (a === ag ? trimmed : a))
                        onCustomAgentsChange(updated)
                        if (value === ag) onChangeAgent(trimmed)
                        setEditingAgent(null)
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ag-tracker-btn"
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                      onClick={() => setEditingAgent(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: "0.875rem" }}>{ag}</span>
                    <button
                      type="button"
                      className="ag-tracker-btn ag-tracker-btn-icon"
                      onClick={() => setEditingAgent({ original: ag, current: ag })}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="ag-tracker-btn ag-tracker-btn-danger ag-tracker-btn-icon"
                      onClick={() => {
                        const updated = customAgents.filter((a) => a !== ag)
                        onCustomAgentsChange(updated)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
            <button
              type="button"
              className="ag-tracker-btn ag-tracker-btn-primary"
              style={{ marginTop: "0.75rem", width: "100%", justifyContent: "center" }}
              onClick={() => setShowManage(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <select
        className="ag-tracker-select"
        style={{ fontSize: "0.75rem", padding: "0.2rem 0.3rem" }}
        value={allAgentOptions.includes(value) ? value : (value ? "__other_val__" : "")}
        onChange={handleSelectChange}
      >
        <option value="">(None)</option>
        {allAgentOptions.map((ag) => (
          <option key={ag} value={ag}>{ag}</option>
        ))}
        {value && !allAgentOptions.includes(value) && (
          <option value="__other_val__">{value}</option>
        )}
        <option value="__other__">Other… (type custom)</option>
        <option value="__manage__">Manage options…</option>
      </select>

      {showCustomInput && (
        <div style={{ display: "flex", gap: "4px" }}>
          <input
            className="ag-tracker-input"
            style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", flex: 1 }}
            placeholder="Custom agent name..."
            value={customInput}
            autoFocus
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitCustom()
              if (e.key === "Escape") { setShowCustomInput(false); setCustomInput("") }
            }}
          />
          <button
            type="button"
            className="ag-tracker-btn ag-tracker-btn-primary"
            style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
            onClick={commitCustom}
          >
            OK
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// DATE EDIT POPOVER — portal-rendered, anchored to clicked cell
// ============================================================
function DateEditPopover({
  field,
  initialVal,
  pos,
  onSave,
  onClose,
}: {
  field: "usedOn" | "nextAvailable"
  initialVal: string
  pos: { top: number; left: number }
  onSave: (val: string) => void
  onClose: () => void
}) {
  const popRef = useRef<HTMLDivElement>(null)
  const [dtVal, setDtVal] = useState(initialVal)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  function applyPreset(preset: string) {
    const now = new Date()
    let d: Date | null = null
    if (preset === "Time-Stamp") d = now
    else if (preset === "In 1 hour") d = new Date(now.getTime() + 3600000)
    else if (preset === "In 6 hours") d = new Date(now.getTime() + 6 * 3600000)
    else if (preset === "In 12 hours") d = new Date(now.getTime() + 12 * 3600000)
    else if (preset === "In 24 hours") d = new Date(now.getTime() + 24 * 3600000)
    else if (preset === "Tomorrow (same time)") d = new Date(now.getTime() + 24 * 3600000)
    else if (preset === "In 7 days") d = new Date(now.getTime() + 7 * 24 * 3600000)
    else if (preset === "Clear") { onSave(""); onClose(); return }
    if (d) { const v = toLocalIsoString(d); setDtVal(v); onSave(v); onClose() }
  }

  const usedOnPresets = ["Time-Stamp", "Clear"]
  const nextAvailPresets = ["Time-Stamp", "In 1 hour", "In 6 hours", "In 12 hours", "In 24 hours", "Tomorrow (same time)", "In 7 days", "Clear"]
  const presets = field === "usedOn" ? usedOnPresets : nextAvailPresets

  const safeTop = Math.min(pos.top, window.innerHeight - 220)
  const safeLeft = Math.min(pos.left, window.innerWidth - 240)

  const root = (typeof document !== "undefined" && (document.querySelector(".journal-root") as HTMLElement | null)) || document.body

  return createPortal(
    <div
      ref={popRef}
      className="ag-date-popover"
      style={{ position: "fixed", top: safeTop, left: safeLeft, zIndex: 100003 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {field === "usedOn" ? "Used On" : "Next Available"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              className="ag-tracker-btn"
              style={{ fontSize: "0.7rem", padding: "2px 7px", whiteSpace: "nowrap" }}
              onClick={() => applyPreset(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <input
            type="datetime-local"
            className="ag-tracker-input"
            style={{ fontSize: "0.7rem", padding: "2px 4px", flex: 1 }}
            value={dtVal}
            onChange={(e) => setDtVal(e.target.value)}
          />
          <button
            type="button"
            className="ag-tracker-btn ag-tracker-btn-primary"
            style={{ fontSize: "0.7rem", padding: "2px 8px", whiteSpace: "nowrap" }}
            onClick={() => { if (dtVal) { onSave(dtVal); onClose() } }}
          >
            Set
          </button>
        </div>
      </div>
    </div>,
    root
  )
}

// ============================================================
// COMPACT SUB-ROW for a single agent in an account block
// ============================================================
function AgentSubRow({
  agentName,
  row,
  rIdx,
  onStartAgent,
  onDoneAgent,
  onOpenStatusMenu,
  onEditDate,
  onNoteIcon,
}: {
  agentName: string
  row: TrackerRow
  rIdx: number
  onStartAgent: (rIdx: number, agentName: string) => void
  onDoneAgent: (rIdx: number, agentName: string) => void
  onOpenStatusMenu: (rIdx: number, agentName: string, rect: DOMRect) => void
  onEditDate: (rIdx: number, agentName: string, field: "usedOn" | "nextAvailable", rect: DOMRect) => void
  onNoteIcon: (rIdx: number, agentName: string) => void
}) {
  const agentLines = row.lines.filter((l) => l.agent === agentName)
  // Newest non-empty Used On
  let newestUsedOn = ""
  // Newest non-empty Next Available
  let newestNextAvail = ""
  let latestStatus: LineStatus = ""

  for (const line of agentLines) {
    if (line.usedOn && (!newestUsedOn || line.usedOn > newestUsedOn)) {
      newestUsedOn = line.usedOn
    }
    if (line.nextAvailable && (!newestNextAvail || line.nextAvailable > newestNextAvail)) {
      newestNextAvail = line.nextAvailable
    }
    if (line.status) {
      latestStatus = line.status
    }
  }

  const dc = newestUsedOn ? dayChip(newestUsedOn) : ""
  const rc = newestNextAvail ? readyChip(newestNextAvail) : { label: "—", cls: "" }

  const statusBtnRef = useRef<HTMLButtonElement>(null)

  const usedOnTdRef = useRef<HTMLTableCellElement>(null)
  const nextAvailTdRef = useRef<HTMLTableCellElement>(null)

  return (
    <>
      {/* Agent name */}
      <td className="ag-subrow-td" style={{ width: "70px", minWidth: "70px", maxWidth: "70px", whiteSpace: "nowrap" }}>
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: agentName === "Gemini" ? "#60a5fa" : agentName === "Claude" ? "#a78bfa" : "#6ee7b7",
          }}
        >
          {agentName}
        </span>
      </td>

      {/* Status badge - clickable opens menu */}
      <td className="ag-subrow-td" style={{ width: "90px", minWidth: "90px", maxWidth: "90px" }}>
        <button
          ref={statusBtnRef}
          type="button"
          className="ag-status-trigger-btn"
          onClick={() => {
            if (statusBtnRef.current) {
              onOpenStatusMenu(rIdx, agentName, statusBtnRef.current.getBoundingClientRect())
            }
          }}
          title="Click to change status"
        >
          {renderStatusBadge(latestStatus)}
        </button>
      </td>

      {/* Used On + day chip — click to edit */}
      <td
        ref={usedOnTdRef}
        className="ag-subrow-td ag-date-clickable"
        style={{ width: "220px", minWidth: "220px", maxWidth: "220px", whiteSpace: "nowrap" }}
        title="Click to edit Used On date"
        onClick={() => {
          if (usedOnTdRef.current) {
            onEditDate(rIdx, agentName, "usedOn", usedOnTdRef.current.getBoundingClientRect())
          }
        }}
      >
        {!newestUsedOn ? (
          <span style={{ color: "#4b5563" }}>—</span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "nowrap" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, whiteSpace: "nowrap" }}>
              {formatDisplayDateTime(newestUsedOn)}
            </span>
            {dc && (
              <span className={`ag-day-chip ${dc === "Today" ? "ag-day-today" : "ag-day-yesterday"}`}>
                {dc}
              </span>
            )}
          </span>
        )}
      </td>

      {/* Next Available + ready chip — click to edit */}
      <td
        ref={nextAvailTdRef}
        className="ag-subrow-td ag-date-clickable"
        style={{ width: "270px", minWidth: "270px", maxWidth: "270px", whiteSpace: "nowrap" }}
        title="Click to edit Next Available date"
        onClick={() => {
          if (nextAvailTdRef.current) {
            onEditDate(rIdx, agentName, "nextAvailable", nextAvailTdRef.current.getBoundingClientRect())
          }
        }}
      >
        {!newestNextAvail ? (
          <span style={{ color: "#4b5563" }}>—</span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "nowrap" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, whiteSpace: "nowrap" }}>
              {formatDisplayDateTime(newestNextAvail)}
            </span>
            {rc.label !== "—" && (
              <span className={`ag-ready-chip ${rc.cls}`}>{rc.label}</span>
            )}
          </span>
        )}
      </td>

      {/* Start / Done buttons */}
      <td className="ag-subrow-td" style={{ width: "90px", minWidth: "90px", maxWidth: "90px" }}>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <button
            type="button"
            className="ag-subrow-btn ag-subrow-btn-start"
            title={`Start ${agentName} for ${row.label} (Sets In use + now)`}
            onClick={() => onStartAgent(rIdx, agentName)}
          >
            <Play className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="ag-subrow-btn ag-subrow-btn-done"
            title={`Mark ${agentName} Done for ${row.label}`}
            onClick={() => onDoneAgent(rIdx, agentName)}
          >
            <CheckCircle className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="ag-subrow-btn"
            title={`Add note for ${row.label} – ${agentName}`}
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "4px", padding: "2px 3px", cursor: "pointer", display: "flex", alignItems: "center" }}
            onClick={() => onNoteIcon && onNoteIcon(rIdx, agentName)}
          >
            <StickyNote className="h-3 w-3" style={{ color: "#a78bfa" }} />
          </button>
        </div>
      </td>
    </>
  )
}

// ============================================================
// EXPANDED ROW SECTION (one compact row per line, NO NOTES)
// ============================================================
function ExpandedRowSection({
  row,
  rIdx,
  customAgents,
  googleAccountOptions,
  onAddLine,
  onDeleteLine,
  onUpdateLine,
  onUsedOnChoice,
  onNextAvailableChoice,
  onLabelChange,
  onCollapse,
  onCustomAgentsChange,
}: {
  row: TrackerRow
  rIdx: number
  customAgents: string[]
  googleAccountOptions: string[]
  onAddLine: (rIdx: number) => void
  onDeleteLine: (rIdx: number, lIdx: number) => void
  onUpdateLine: (rIdx: number, lIdx: number, field: keyof TrackerRowLine, value: any) => void
  onUsedOnChoice: (rIdx: number, lIdx: number, choice: string) => void
  onNextAvailableChoice: (rIdx: number, lIdx: number, choice: string) => void
  onLabelChange: (rIdx: number, label: string) => void
  onCollapse: () => void
  onCustomAgentsChange: (agents: string[]) => void
}) {
  return (
    <div className="ag-expanded-section">
      {/* Row label editor */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #9ca3af)" }}>Row label:</span>
        <input
          className="ag-tracker-input"
          style={{ fontWeight: 700, fontSize: "0.875rem", maxWidth: "200px" }}
          value={row.label}
          onChange={(e) => onLabelChange(rIdx, e.target.value)}
          title="Edit row label"
        />
        <button
          type="button"
          className="ag-tracker-btn"
          onClick={() => onAddLine(rIdx)}
          style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
        >
          <Plus className="h-3 w-3" /> Add Line
        </button>
        <button
          type="button"
          className="ag-tracker-btn"
          onClick={onCollapse}
          style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", marginLeft: "auto" }}
        >
          <ChevronUp className="h-3.5 w-3.5" /> Collapse Row
        </button>
      </div>

      {row.lines.map((line, lIdx) => (
        <div key={line.id} className="ag-expanded-line-row">
          {/* Line number + add/del beside */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px", minWidth: "55px", flexShrink: 0 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted-foreground, #9ca3af)", width: "16px" }}>
              #{lIdx + 1}
            </span>
            {row.lines.length > 1 && (
              <button
                type="button"
                className="ag-tracker-btn ag-tracker-btn-danger ag-tracker-btn-icon"
                onClick={() => onDeleteLine(rIdx, lIdx)}
                title="Delete line"
                style={{ padding: "2px" }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Agent combobox */}
          <div style={{ minWidth: "125px", flexShrink: 0 }}>
            <AgentCombobox
              value={line.agent || ""}
              customAgents={customAgents}
              onChangeAgent={(v) => onUpdateLine(rIdx, lIdx, "agent", v)}
              onCustomAgentsChange={onCustomAgentsChange}
            />
          </div>

          {/* Google Account select (uncut full values) */}
          <div style={{ minWidth: "140px", flexShrink: 0 }}>
            {line.isCustomGoogleAccount ? (
              <div style={{ display: "flex", gap: "3px" }}>
                <input
                  className="ag-tracker-input"
                  style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem" }}
                  placeholder="Custom..."
                  value={line.googleAccount}
                  onChange={(e) => onUpdateLine(rIdx, lIdx, "googleAccount", e.target.value)}
                />
                <button
                  type="button"
                  className="ag-tracker-btn ag-tracker-btn-icon"
                  onClick={() => onUpdateLine(rIdx, lIdx, "isCustomGoogleAccount", false)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <select
                className="ag-tracker-select"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.3rem", width: "100%" }}
                value={line.googleAccount}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "__custom__") {
                    onUpdateLine(rIdx, lIdx, "isCustomGoogleAccount", true)
                  } else {
                    onUpdateLine(rIdx, lIdx, "googleAccount", val)
                  }
                }}
              >
                <option value="">(Account)</option>
                {googleAccountOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="__custom__">Other…</option>
              </select>
            )}
          </div>

          {/* Status select */}
          <div style={{ minWidth: "84px", flexShrink: 0 }}>
            <select
              className="ag-tracker-select"
              style={{ fontSize: "0.75rem", padding: "0.2rem 0.3rem" }}
              value={line.status || ""}
              onChange={(e) => onUpdateLine(rIdx, lIdx, "status", e.target.value)}
            >
              <option value="">(Status)</option>
              <option value="In use">In use</option>
              <option value="Low">Low</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Used On: quick choice + datetime picker */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "190px", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "3px" }}>
              <select
                className="ag-tracker-select"
                style={{ fontSize: "0.7rem", padding: "0.15rem 0.25rem", width: "85px" }}
                defaultValue=""
                onChange={(e) => { onUsedOnChoice(rIdx, lIdx, e.target.value); e.target.value = "" }}
              >
                <option value="" disabled>Used Quick…</option>
                <option value="Time-Stamp">Time-Stamp</option>
                <option value="Clear">Clear</option>
              </select>
              <input
                type="datetime-local"
                className="ag-tracker-input"
                style={{ fontSize: "0.7rem", padding: "0.15rem 0.25rem", flex: 1 }}
                value={line.usedOn}
                onChange={(e) => onUpdateLine(rIdx, lIdx, "usedOn", e.target.value)}
              />
            </div>
            {line.usedOn && (
              <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground, #9ca3af)", whiteSpace: "nowrap" }}>
                {formatDisplayDateTime(line.usedOn)} {dayChip(line.usedOn) ? `(${dayChip(line.usedOn)})` : ""}
              </span>
            )}
          </div>

          {/* Next Available: quick choice + datetime picker */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "220px", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "3px" }}>
              <select
                className="ag-tracker-select"
                style={{ fontSize: "0.7rem", padding: "0.15rem 0.25rem", width: "85px" }}
                defaultValue=""
                onChange={(e) => { onNextAvailableChoice(rIdx, lIdx, e.target.value); e.target.value = "" }}
              >
                <option value="" disabled>Next Quick…</option>
                <option value="Time-Stamp">Time-Stamp</option>
                <option value="In 1 hour">In 1 hour</option>
                <option value="In 6 hours">In 6 hours</option>
                <option value="In 12 hours">In 12 hours</option>
                <option value="In 24 hours">In 24 hours</option>
                <option value="Tomorrow (same time)">Tomorrow</option>
                <option value="In 7 days">In 7 days</option>
                <option value="Clear">Clear</option>
              </select>
              <input
                type="datetime-local"
                className="ag-tracker-input"
                style={{ fontSize: "0.7rem", padding: "0.15rem 0.25rem", flex: 1 }}
                value={line.nextAvailable}
                onChange={(e) => onUpdateLine(rIdx, lIdx, "nextAvailable", e.target.value)}
              />
            </div>
            {line.nextAvailable && (
              <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground, #9ca3af)", whiteSpace: "nowrap" }}>
                {formatDisplayDateTime(line.nextAvailable)} ({readyChip(line.nextAvailable).label})
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// CURRENT APP MODAL & HELPERS
// ============================================================
function parseRequestDateMs(val?: string): number {
  if (!val) return 0
  const m = String(val).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (m) {
    const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]))
    return Number.isNaN(d.getTime()) ? 0 : d.getTime()
  }
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? 0 : d.getTime()
}

function toLocalHostHref(val: string): string {
  if (!val || val.trim() === "" || val === "—") return ""
  const t = val.trim()
  if (/^https?:\/\//i.test(t)) return t
  if (/^\d+$/.test(t)) return `http://localhost:${t}`
  if (/^localhost/i.test(t)) return `http://${t}`
  return `http://${t}`
}

function toPublishedHref(val: string): string {
  if (!val || val.trim() === "" || val === "—") return ""
  const t = val.trim()
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

interface CurrentAppModalProps {
  isOpen: boolean
  onClose: () => void
  theme?: string
}

export function CurrentAppModal({ isOpen, onClose, theme = "dark" }: CurrentAppModalProps) {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const copyTimerRef = useRef<any>(null)

  // Escape key handler: closes ONLY this popup and stops propagation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [isOpen, onClose])

  // Fresh read from localStorage whenever dialog opens
  useEffect(() => {
    if (!isOpen) return
    let projs: any[] = []
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("projects") : null
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) projs = parsed
      }
    } catch {}
    setProjects(projs)

    if (projs.length > 0) {
      const lastId = typeof window !== "undefined" ? localStorage.getItem("journal-last-record") : null
      let target = lastId ? projs.find((p) => p.id === lastId) : null
      if (!target) {
        // Sort by newest Last Request Date (currentRequestDate)
        const sorted = [...projs].sort((a, b) => {
          return parseRequestDateMs(b.currentRequestDate) - parseRequestDateMs(a.currentRequestDate)
        })
        target = sorted[0] || projs[0]
      }
      setSelectedId(target?.id || projs[0]?.id || "")
    } else {
      setSelectedId("")
    }
  }, [isOpen])

  // Cleanup copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  if (!isOpen) return null

  const root =
    (typeof document !== "undefined" &&
      (document.querySelector(".journal-root") as HTMLElement | null)) ||
    (typeof document !== "undefined" ? document.body : null)

  if (!root) return null

  const selectedProject = projects.find((p) => p.id === selectedId) || projects[0]

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text || text === "—") return
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {})
      } else {
        const ta = document.createElement("textarea")
        ta.value = text
        ta.style.position = "fixed"
        ta.style.opacity = "0"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      }
    } catch {}
    setCopiedField(fieldKey)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => {
      setCopiedField(null)
    }, 1600)
  }

  // Format fields for selected project
  const platformsStr = Array.isArray(selectedProject?.platforms)
    ? selectedProject.platforms.filter(Boolean).join(", ")
    : (selectedProject?.platforms || "")
  const aiAgentsStr = Array.isArray(selectedProject?.aiAgents)
    ? selectedProject.aiAgents.filter(Boolean).join(", ")
    : (selectedProject?.aiAgents || "")
  const keepStr = Array.isArray(selectedProject?.googleKeepAccounts)
    ? selectedProject.googleKeepAccounts.filter(Boolean).join(", ")
    : (selectedProject?.googleKeepAccounts || "")
  const accountsStr = Array.isArray(selectedProject?.userNames)
    ? selectedProject.userNames.filter(Boolean).join(", ")
    : (selectedProject?.userNames || "")
  const cloudStr = Array.isArray(selectedProject?.cloudServices)
    ? selectedProject.cloudServices.filter(Boolean).join("; ")
    : (selectedProject?.cloudServices || "")

  const formattedDate = selectedProject?.currentRequestDate
    ? (formatDate(selectedProject.currentRequestDate) || selectedProject.currentRequestDate)
    : ""

  const localHostVal = selectedProject?.localHost || ""
  const localHostLink = toLocalHostHref(localHostVal)

  const publishedVal = selectedProject?.publishedUrl || ""
  const publishedLink = toPublishedHref(publishedVal)

  const previewDirVal = selectedProject?.previewUrl || ""

  return createPortal(
    <div
      className="ag-tracker-modal-dialog-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Current App"
      style={{ zIndex: 100060 }}
    >
      <div
        className={`ag-tracker-modal-dialog ag-current-app-dialog journal-theme-${theme}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(92vw, 760px)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div className="ag-tracker-modal-dialog-header">
          <div className="flex items-center gap-2">
            <AppWindow className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Current App
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {projects.length > 0 && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="ag-switch-app-select"
                  className="text-xs text-slate-300 font-medium whitespace-nowrap"
                >
                  Switch app:
                </label>
                <select
                  id="ag-switch-app-select"
                  className="ag-tracker-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.5rem",
                    maxWidth: "240px",
                    height: "26px",
                  }}
                  title="Switch viewed app (view-only)"
                >
                  {projects.map((p, idx) => (
                    <option key={p.id || idx} value={p.id}>
                      {p.appName || `App #${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              className="ag-tracker-btn ag-tracker-btn-icon"
              onClick={onClose}
              title="Close (Esc)"
              style={{ height: "26px", width: "26px" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="ag-current-app-body">
          {projects.length === 0 ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "1rem" }}>
              No apps in the Journal yet.
            </div>
          ) : (
            <div className="ag-current-app-card">
              <div className="ag-current-app-grid">
                {/* LEFT COLUMN */}
                <div>
                  {/* Title */}
                  <div className="ag-current-app-row ag-current-app-row-header">
                    <h2
                      className="text-xl font-bold text-white truncate"
                      title={selectedProject?.appName || "Untitled App"}
                      style={{ fontSize: "1.25rem", margin: 0 }}
                    >
                      {selectedProject?.appName || "Untitled App"}
                    </h2>
                  </div>

                  {/* Platforms */}
                  <div className="ag-current-app-row">
                    <div className="flex items-baseline gap-1.5 min-w-0" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#3b82f6" }} className="font-semibold flex-shrink-0">
                        Platforms:
                      </span>
                      <span className="text-slate-100 break-words">
                        {platformsStr || "—"}
                      </span>
                    </div>
                  </div>

                  {/* AI Agents */}
                  <div className="ag-current-app-row">
                    <div className="flex items-baseline gap-1.5 min-w-0" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#3b82f6" }} className="font-semibold flex-shrink-0">
                        AI Agents:
                      </span>
                      <span className="text-slate-100 break-words">
                        {aiAgentsStr || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Google Keep */}
                  <div className="ag-current-app-row">
                    <div className="flex items-baseline gap-1.5 min-w-0" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#eab308" }} className="font-semibold flex-shrink-0">
                        Google Keep:
                      </span>
                      <span className="text-slate-100 break-words">
                        {keepStr || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Google Account */}
                  <div className="ag-current-app-row" style={{ borderBottom: "none" }}>
                    <div className="flex items-baseline gap-1.5 min-w-0" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#c084fc" }} className="font-semibold flex-shrink-0">
                        Google Account:
                      </span>
                      <span className="text-slate-100 break-words">
                        {accountsStr || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div>
                  {/* Last Request Date */}
                  <div className="ag-current-app-row ag-current-app-row-header">
                    <div className="flex items-baseline gap-1.5 min-w-0" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#eab308" }} className="font-semibold flex-shrink-0">
                        Last Request Date:
                      </span>
                      <span className="text-slate-100 truncate">
                        {formattedDate || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Project Dir */}
                  <div className="ag-current-app-row">
                    <div className="flex items-baseline gap-1.5 min-w-0 flex-1" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#f97316" }} className="font-semibold flex-shrink-0">
                        Project Dir:
                      </span>
                      <span className="text-slate-100 break-all">
                        {previewDirVal || "—"}
                      </span>
                    </div>
                    {previewDirVal ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(previewDirVal, "dir")}
                        className="ag-current-app-copy-btn flex-shrink-0"
                        title="Copy Project Dir"
                        aria-label="Copy Project Dir"
                      >
                        {copiedField === "dir" ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ) : null}
                  </div>

                  {/* Local Host */}
                  <div className="ag-current-app-row">
                    <div className="flex items-baseline gap-1.5 min-w-0 flex-1" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#2dd4bf" }} className="font-semibold flex-shrink-0">
                        Local Host:
                      </span>
                      {localHostLink ? (
                        <a
                          href={localHostLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-100 hover:underline hover:text-teal-300 break-all inline-flex items-center gap-1 group"
                          title={`Open ${localHostLink} in new tab`}
                        >
                          <span>{localHostVal}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-teal-400/80 group-hover:text-teal-300 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-100 break-all">
                          {localHostVal || "—"}
                        </span>
                      )}
                    </div>
                    {localHostVal ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(localHostVal, "localhost")}
                        className="ag-current-app-copy-btn flex-shrink-0"
                        title="Copy Local Host"
                        aria-label="Copy Local Host"
                      >
                        {copiedField === "localhost" ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ) : null}
                  </div>

                  {/* Published URL */}
                  <div className="ag-current-app-row">
                    <div className="flex items-baseline gap-1.5 min-w-0 flex-1" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#f87171" }} className="font-semibold flex-shrink-0">
                        Published URL:
                      </span>
                      {publishedLink ? (
                        <a
                          href={publishedLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-100 hover:underline hover:text-rose-300 break-all inline-flex items-center gap-1 group"
                          title={`Open ${publishedLink} in new tab`}
                        >
                          <span>{publishedVal}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-rose-400/80 group-hover:text-rose-300 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-100 break-all">
                          {publishedVal || "—"}
                        </span>
                      )}
                    </div>
                    {publishedVal ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(publishedVal, "published")}
                        className="ag-current-app-copy-btn flex-shrink-0"
                        title="Copy Published URL"
                        aria-label="Copy Published URL"
                      >
                        {copiedField === "published" ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ) : null}
                  </div>

                  {/* Cloud Services */}
                  <div className="ag-current-app-row" style={{ borderBottom: "none" }}>
                    <div className="flex items-baseline gap-1.5 min-w-0" style={{ fontSize: "16px" }}>
                      <span style={{ color: "#3b82f6" }} className="font-semibold flex-shrink-0">
                        Cloud Services:
                      </span>
                      <span className="text-slate-100 break-words">
                        {cloudStr || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            fontSize: "0.75rem",
            color: "#94a3b8",
          }}
        >
          <span>Pulled live from your Dev Journal records.</span>
          <button
            type="button"
            className="ag-tracker-btn"
            onClick={onClose}
            style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    root
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================
function AgAccountTrackerModalInner({
  isOpen,
  onClose,
  theme: propTheme,
}: AgAccountTrackerModalProps) {
  const [theme, setTheme] = useState<string>(() => {
    if (propTheme) return propTheme
    try {
      const raw = localStorage.getItem("journal-settings")
      if (raw) return JSON.parse(raw).theme || "dark"
    } catch {}
    return "dark"
  })

  useEffect(() => {
    if (propTheme) setTheme(propTheme)
  }, [propTheme])

  const [data, setData] = useState<AgTrackerStorageData>(getInitialData)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved")
  const [manageOptionsOpen, setManageOptionsOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [quickLogOpen, setQuickLogOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [currentAppOpen, setCurrentAppOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>(loadExpandedRows)

  const [notesExpanded, setNotesExpanded] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(NOTES_EXPANDED_KEY) === "true"
    }
    return false
  })

  const [dayFilter, setDayFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(DAY_FILTER_KEY) || "all"
    }
    return "all"
  })

  const [sortMode, setSortMode] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem(SORT_MODE_KEY) || "manual"
    return "manual"
  })

  const [customAgents, setCustomAgents] = useState<string[]>(loadCustomAgents)
  const [nowTick, setNowTick] = useState(Date.now())
  const [highlightRowKey, setHighlightRowKey] = useState<string | null>(null)
  const [statusMenu, setStatusMenu] = useState<{
    rIdx: number
    agentName: string
    currentStatus: string
    pos: { top: number; left: number }
  } | null>(null)

  const [quickLogAccount, setQuickLogAccount] = useState("")
  const [quickLogResetChoice, setQuickLogResetChoice] = useState("default")
  const [quickLogCustomHours, setQuickLogCustomHours] = useState(24)
  const [toast, setToast] = useState<{ message: string; account: string } | null>(null)

  const [newOptionInput, setNewOptionInput] = useState("")
  const [fullScreenNotes, setFullScreenNotes] = useState<FullScreenNotesState | null>(null)
  const [dateEditPopover, setDateEditPopover] = useState<{
    rIdx: number
    agentName: string
    field: "usedOn" | "nextAvailable"
    initialVal: string
    pos: { top: number; left: number }
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Re-evaluate every 60s & at midnight
  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  // History list
  const historyList = useMemo(() => {
    if (!historyOpen || typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }, [historyOpen])

  // Journal app names
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

  // Save custom agents to localStorage
  useEffect(() => {
    saveCustomAgents(customAgents)
  }, [customAgents])

  // Save day filter
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DAY_FILTER_KEY, dayFilter)
    }
  }, [dayFilter])

  // Save sort mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SORT_MODE_KEY, sortMode)
    }
  }, [sortMode])

  // Save notes expanded state
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTES_EXPANDED_KEY, notesExpanded ? "true" : "false")
    }
  }, [notesExpanded])

  // Debounced auto-save
  const triggerSave = useCallback((newData: AgTrackerStorageData) => {
    setSaveStatus("saving")
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
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

  const handleImmediateClose = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {}
    }
    onClose()
  }, [data, onClose])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dateEditPopover !== null) { setDateEditPopover(null); return }
        if (statusMenu !== null) { setStatusMenu(null); return }
        if (toast !== null) { setToast(null); return }
        if (helpOpen) { setHelpOpen(false); return }
        if (quickLogOpen) { setQuickLogOpen(false); return }
        if (historyOpen) { setHistoryOpen(false); return }
        if (reportsOpen) { setReportsOpen(false); return }
        if (fullScreenNotes !== null) { setFullScreenNotes(null); return }
        if (manageOptionsOpen) { setManageOptionsOpen(false); return }
        handleImmediateClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, dateEditPopover, statusMenu, toast, quickLogOpen, historyOpen, reportsOpen, fullScreenNotes, manageOptionsOpen, helpOpen, handleImmediateClose])

  // Active tracker
  const activeIndex = Math.min(Math.max(0, data.activeTrackerIndex), Math.max(0, data.trackers.length - 1))
  const currentTracker = data.trackers[activeIndex] || data.trackers[0]

  // Save active tab to localStorage
  useEffect(() => {
    if (currentTracker?.id && typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_TAB_KEY, currentTracker.id)
    }
  }, [currentTracker?.id])

  const updateCurrentTracker = (updater: (prev: AccountTracker) => AccountTracker) => {
    updateData((prev) => {
      const newTrackers = [...prev.trackers]
      newTrackers[activeIndex] = updater(newTrackers[activeIndex])
      return { ...prev, trackers: newTrackers }
    })
  }

  // Account readiness calc
  const { readyCount, currentlyActiveAccount, bestNextAccount } = useMemo(() => {
    const nowMs = Date.now()
    const allAccounts = googleAccountOptions
    let activeAccount = ""
    let latestActiveTime = 0

    const stats = allAccounts.map((acct) => {
      let timesUsed = 0, latestUsedMs = 0, latestNextMs = 0, latestLineStatus = ""
      for (const tr of data.trackers) {
        for (const row of tr.rows || []) {
          for (const line of row.lines || []) {
            const lineAcct = line.googleAccount?.trim() || row.label.trim()
            if (lineAcct === acct) {
              if (line.usedOn) {
                timesUsed++
                const uTime = new Date(line.usedOn).getTime()
                if (uTime > latestUsedMs) { latestUsedMs = uTime; latestLineStatus = line.status || "" }
              } else if (line.status && !latestLineStatus) { latestLineStatus = line.status }
              if (line.nextAvailable) {
                const nTime = new Date(line.nextAvailable).getTime()
                if (nTime > latestNextMs) latestNextMs = nTime
              }
            }
          }
        }
      }
      // "Done" never counts as currently using
      if ((latestLineStatus === "In use" || latestLineStatus === "Low") && latestUsedMs > latestActiveTime) {
        latestActiveTime = latestUsedMs
        activeAccount = acct
      }
      const isReadyNow = (latestNextMs > 0 && latestNextMs <= nowMs) || (latestNextMs === 0 && timesUsed === 0)
      return { acct, timesUsed, latestUsedMs, latestNextMs, isReadyNow }
    })

    const readyNowAccounts = stats.filter((s) => s.isReadyNow)
    let best = ""
    if (readyNowAccounts.length > 0) {
      const neverUsed = readyNowAccounts.filter((s) => s.timesUsed === 0)
      if (neverUsed.length > 0) { best = neverUsed[0].acct }
      else { readyNowAccounts.sort((a, b) => a.latestUsedMs - b.latestUsedMs); best = readyNowAccounts[0].acct }
    } else {
      const waiting = stats.filter((s) => s.latestNextMs > nowMs)
      if (waiting.length > 0) { waiting.sort((a, b) => a.latestNextMs - b.latestNextMs); best = waiting[0].acct }
      else if (allAccounts.length > 0) { best = allAccounts[0] }
    }
    return { readyCount: readyNowAccounts.length, currentlyActiveAccount: activeAccount, bestNextAccount: best }
  }, [googleAccountOptions, data.trackers])

  // Today strip data
  const todayStripData = useMemo(() => {
    const rows = currentTracker.rows
    const agentNames = ["Gemini", "Claude"]
    let usedTodayCount = 0
    const finishChips: { account: string; agent: string }[] = []
    let nextAccount = ""

    for (const row of rows) {
      const linesByAgent: Record<string, TrackerRowLine[]> = {}
      for (const ag of agentNames) {
        linesByAgent[ag] = row.lines.filter((l) => l.agent === ag)
      }

      // Count any line used today
      const anyUsedToday = row.lines.some((l) => l.usedOn && isToday(l.usedOn))
      if (anyUsedToday) usedTodayCount++

      const geminiLatest = linesByAgent["Gemini"].sort((a, b) => (b.usedOn || "").localeCompare(a.usedOn || ""))[0]
      const claudeLatest = linesByAgent["Claude"].sort((a, b) => (b.usedOn || "").localeCompare(a.usedOn || ""))[0]

      const geminiUsedToday = geminiLatest && isToday(geminiLatest.usedOn)
      const claudeUsedToday = claudeLatest && isToday(claudeLatest.usedOn)
      const geminiDone = geminiLatest && geminiLatest.status === "Done"
      const claudeDone = claudeLatest && claudeLatest.status === "Done"

      if (geminiUsedToday && !claudeUsedToday && !claudeDone) {
        finishChips.push({ account: row.label, agent: "Claude" })
      } else if (claudeUsedToday && !geminiUsedToday && !geminiDone) {
        finishChips.push({ account: row.label, agent: "Gemini" })
      }

      if (!nextAccount && !anyUsedToday) {
        const allDone = row.lines.every((l) => l.status === "Done")
        if (!allDone) nextAccount = row.label
      }
    }

    return { usedTodayCount, finishChips, nextAccount }
  }, [currentTracker.rows, nowTick])

  // Day filter logic
  const filteredRows = useMemo(() => {
    if (dayFilter === "all") return currentTracker.rows
    return currentTracker.rows.filter((row) => {
      const anyUsedToday = row.lines.some((l) => l.usedOn && isToday(l.usedOn))
      const allDone = row.lines.every((l) => l.status === "Done")
      if (dayFilter === "used-today") return anyUsedToday
      if (dayFilter === "not-used-today") return !anyUsedToday && !allDone
      if (dayFilter === "finish-today") {
        const agentNames = ["Gemini", "Claude"]
        const linesByAgent: Record<string, TrackerRowLine[]> = {}
        for (const ag of agentNames) linesByAgent[ag] = row.lines.filter((l) => l.agent === ag)
        const geminiLatest = linesByAgent["Gemini"].sort((a, b) => (b.usedOn || "").localeCompare(a.usedOn || ""))[0]
        const claudeLatest = linesByAgent["Claude"].sort((a, b) => (b.usedOn || "").localeCompare(a.usedOn || ""))[0]
        const geminiUsedToday = geminiLatest && isToday(geminiLatest.usedOn)
        const claudeUsedToday = claudeLatest && isToday(claudeLatest.usedOn)
        const geminiDone = geminiLatest && geminiLatest.status === "Done"
        const claudeDone = claudeLatest && claudeLatest.status === "Done"
        return (geminiUsedToday && !claudeUsedToday && !claudeDone) ||
               (claudeUsedToday && !geminiUsedToday && !geminiDone)
      }
      return true
    })
  }, [currentTracker.rows, dayFilter, nowTick])

  // Sort logic across accounts
  const sortedFilteredRows = useMemo(() => {
    if (sortMode === "manual") return filteredRows

    const getTimestamps = (row: TrackerRow) => {
      let latestUsed = ""
      let latestNext = ""
      for (const line of row.lines) {
        if (line.usedOn && (!latestUsed || line.usedOn > latestUsed)) {
          latestUsed = line.usedOn
        }
        if (line.nextAvailable && (!latestNext || line.nextAvailable > latestNext)) {
          latestNext = line.nextAvailable
        }
      }
      return { latestUsed, latestNext }
    }

    const rowsWithMeta = filteredRows.map((row, origIdx) => ({
      row,
      origIdx,
      ...getTimestamps(row),
    }))

    rowsWithMeta.sort((a, b) => {
      if (sortMode === "used-oldest") {
        if (!a.latestUsed && !b.latestUsed) return a.origIdx - b.origIdx
        if (!a.latestUsed) return -1
        if (!b.latestUsed) return 1
        const cmp = a.latestUsed.localeCompare(b.latestUsed)
        return cmp !== 0 ? cmp : a.origIdx - b.origIdx
      }
      if (sortMode === "used-newest") {
        if (!a.latestUsed && !b.latestUsed) return a.origIdx - b.origIdx
        if (!a.latestUsed) return 1
        if (!b.latestUsed) return -1
        const cmp = b.latestUsed.localeCompare(a.latestUsed)
        return cmp !== 0 ? cmp : a.origIdx - b.origIdx
      }
      if (sortMode === "next-soonest") {
        if (!a.latestNext && !b.latestNext) return a.origIdx - b.origIdx
        if (!a.latestNext) return 1
        if (!b.latestNext) return -1
        const cmp = a.latestNext.localeCompare(b.latestNext)
        return cmp !== 0 ? cmp : a.origIdx - b.origIdx
      }
      return a.origIdx - b.origIdx
    })

    return rowsWithMeta.map((item) => item.row)
  }, [filteredRows, sortMode])

  // Scroll and highlight row helper
  const triggerRowHighlight = useCallback((rowKey: string) => {
    setHighlightRowKey(rowKey)
    const el = document.getElementById(`row-${rowKey}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
    setTimeout(() => {
      setHighlightRowKey(null)
    }, 1500)
  }, [])

  // Freeze order during active editing (when popover or status menu is open)
  const [displayRows, setDisplayRows] = useState(sortedFilteredRows)
  const prevRowsOrderRef = useRef<string[]>([])

  useEffect(() => {
    if (statusMenu === null && dateEditPopover === null) {
      setDisplayRows(sortedFilteredRows)
      // Check if order changed and highlight accounts that moved
      const newOrder = sortedFilteredRows.map((r) => r.label)
      const prevOrder = prevRowsOrderRef.current
      if (prevOrder.length > 0 && prevOrder.join(",") !== newOrder.join(",")) {
        for (let i = 0; i < newOrder.length; i++) {
          if (newOrder[i] !== prevOrder[i]) {
            const actualIdx = currentTracker.rows.findIndex((r) => r.label === newOrder[i])
            if (actualIdx >= 0) {
              const rKey = `row-${actualIdx}-${newOrder[i].replace(/\s+/g, "_")}`
              triggerRowHighlight(rKey)
              break
            }
          }
        }
      }
      prevRowsOrderRef.current = newOrder
    }
  }, [sortedFilteredRows, statusMenu, dateEditPopover, currentTracker.rows, triggerRowHighlight])

  // Handlers
  const handleAddTracker = () => {
    updateData((prev) => {
      const nextIndex = prev.trackers.length
      const newTracker = createDefaultTracker(nextIndex)
      newTracker.day = toLocalIsoString(new Date()).slice(0, 10)

      // Carry over Next Available from the current or most recent tracker
      const srcTracker = prev.trackers[prev.activeTrackerIndex] || prev.trackers[prev.trackers.length - 1]
      if (srcTracker) {
        newTracker.rows = newTracker.rows.map((newRow) => {
          const srcRow = srcTracker.rows.find((r) => r.label.trim() === newRow.label.trim())
          if (!srcRow) return newRow
          let bestNext = ""
          for (const line of srcRow.lines) {
            if (line.nextAvailable && (!bestNext || line.nextAvailable > bestNext)) {
              bestNext = line.nextAvailable
            }
          }
          if (bestNext) {
            const updatedLines = [...newRow.lines]
            updatedLines[0] = { ...updatedLines[0], nextAvailable: bestNext }
            return { ...newRow, lines: updatedLines }
          }
          return newRow
        })
      }

      const updatedTrackers = [...prev.trackers, newTracker]
      // Sort trackers by day (oldest left, newest right)
      updatedTrackers.sort((a, b) => (a.day || "").localeCompare(b.day || ""))
      const newActiveIdx = updatedTrackers.findIndex((t) => t.id === newTracker.id)
      return { ...prev, trackers: updatedTrackers, activeTrackerIndex: newActiveIdx >= 0 ? newActiveIdx : nextIndex }
    })
  }

  const handleDeleteTracker = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.trackers.length <= 1) { alert("At least one tracker must be kept."); return }
    const trackerToDelete = data.trackers[indexToDelete]
    const name = trackerToDelete.appName || trackerToDelete.title
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    updateData((prev) => {
      const newTrackers = prev.trackers.filter((_, idx) => idx !== indexToDelete)
      let newActive = prev.activeTrackerIndex
      if (newActive >= newTrackers.length) newActive = newTrackers.length - 1
      return { ...prev, trackers: newTrackers, activeTrackerIndex: newActive }
    })
  }

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
          agent: "",
        },
      ]
      newRows[rowIndex] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  const handleDeleteLine = (rowIndex: number, lineIndex: number) => {
    updateCurrentTracker((tracker) => {
      const newRows = [...tracker.rows]
      const targetRow = { ...newRows[rowIndex] }
      if (targetRow.lines.length <= 1) {
        targetRow.lines = [{
          id: "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: "", usedOn: "", nextAvailable: "", status: "", notes: "", agent: "",
        }]
      } else {
        targetRow.lines = targetRow.lines.filter((_, idx) => idx !== lineIndex)
      }
      newRows[rowIndex] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  const handleUpdateLine = (rowIndex: number, lineIndex: number, field: keyof TrackerRowLine, value: any) => {
    updateCurrentTracker((tracker) => {
      const newRows = [...tracker.rows]
      const targetRow = { ...newRows[rowIndex] }
      const newLines = [...targetRow.lines]
      const updatedLine = { ...newLines[lineIndex], [field]: value }
      if (field === "status" && value === "Done" && !updatedLine.nextAvailable) {
        const now = new Date()
        const acctName = updatedLine.googleAccount?.trim() || targetRow.label.trim()
        const resetHours = data.options?.accountResetHours?.[acctName] ?? 24
        const nextDate = new Date(now.getTime() + resetHours * 3600 * 1000)
        updatedLine.nextAvailable = toLocalIsoString(nextDate)
      }
      newLines[lineIndex] = updatedLine
      targetRow.lines = newLines
      newRows[rowIndex] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  const handleUsedOnChoice = (rowIndex: number, lineIndex: number, choice: string) => {
    if (!choice || choice === "Quick Choice…") return
    let nextVal = ""
    if (choice === "Time-Stamp") nextVal = toLocalIsoString(new Date())
    else if (choice === "Clear") nextVal = ""
    handleUpdateLine(rowIndex, lineIndex, "usedOn", nextVal)
  }

  const handleNextAvailableChoice = (rowIndex: number, lineIndex: number, choice: string) => {
    if (!choice || choice === "Quick Choice…") return
    const now = new Date()
    let nextVal = ""
    if (choice === "Time-Stamp") nextVal = toLocalIsoString(now)
    else if (choice === "In 1 hour") nextVal = toLocalIsoString(new Date(now.getTime() + 1 * 60 * 60 * 1000))
    else if (choice === "In 6 hours") nextVal = toLocalIsoString(new Date(now.getTime() + 6 * 60 * 60 * 1000))
    else if (choice === "In 12 hours") nextVal = toLocalIsoString(new Date(now.getTime() + 12 * 60 * 60 * 1000))
    else if (choice === "In 24 hours") nextVal = toLocalIsoString(new Date(now.getTime() + 24 * 60 * 60 * 1000))
    else if (choice === "Tomorrow (same time)") {
      const t = new Date(now); t.setDate(t.getDate() + 1); nextVal = toLocalIsoString(t)
    } else if (choice === "In 7 days") {
      const t = new Date(now); t.setDate(t.getDate() + 7); nextVal = toLocalIsoString(t)
    } else if (choice === "Clear") nextVal = ""
    handleUpdateLine(rowIndex, lineIndex, "nextAvailable", nextVal)
  }

  // Quick Status change with rules:
  // "In use fills an empty Used On with now. Done fills an empty Next Available with now + account reset hours. Never overwrite an existing date."
  const handleStatusChangeWithRules = (rIdx: number, agentName: string, newStatus: string) => {
    const now = new Date()
    const nowIso = toLocalIsoString(now)
    updateCurrentTracker((tracker) => {
      const newRows = [...tracker.rows]
      const targetRow = { ...newRows[rIdx] }
      const newLines = [...targetRow.lines]

      let agentLineIdx = -1
      for (let i = newLines.length - 1; i >= 0; i--) {
        if (newLines[i].agent === agentName) { agentLineIdx = i; break }
      }

      if (agentLineIdx !== -1) {
        const line = { ...newLines[agentLineIdx] }
        line.status = newStatus as LineStatus
        if (newStatus === "In use" && !line.usedOn) {
          line.usedOn = nowIso
        }
        if (newStatus === "Done" && !line.nextAvailable) {
          const acctName = line.googleAccount?.trim() || targetRow.label.trim()
          const resetHours = data.options?.accountResetHours?.[acctName] ?? 24
          const nextDate = new Date(now.getTime() + resetHours * 3600 * 1000)
          line.nextAvailable = toLocalIsoString(nextDate)
        }
        newLines[agentLineIdx] = line
      } else {
        let usedOn = ""
        let nextAvailable = ""
        if (newStatus === "In use") usedOn = nowIso
        if (newStatus === "Done") {
          const acctName = targetRow.label.trim()
          const resetHours = data.options?.accountResetHours?.[acctName] ?? 24
          const nextDate = new Date(now.getTime() + resetHours * 3600 * 1000)
          nextAvailable = toLocalIsoString(nextDate)
        }
        newLines.push({
          id: "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: "",
          usedOn,
          nextAvailable,
          status: newStatus as LineStatus,
          notes: "",
          agent: agentName,
        })
      }

      targetRow.lines = newLines
      newRows[rIdx] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  // Start button: In use + Used On now (creates line if none)
  const handleStartAgent = (rIdx: number, agentName: string) => {
    const nowIso = toLocalIsoString(new Date())
    updateCurrentTracker((tracker) => {
      const newRows = [...tracker.rows]
      const targetRow = { ...newRows[rIdx] }
      const newLines = [...targetRow.lines]

      let agentLineIdx = -1
      for (let i = newLines.length - 1; i >= 0; i--) {
        if (newLines[i].agent === agentName) { agentLineIdx = i; break }
      }

      if (agentLineIdx !== -1) {
        newLines[agentLineIdx] = {
          ...newLines[agentLineIdx],
          usedOn: nowIso,
          status: "In use",
        }
      } else {
        newLines.push({
          id: "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: "",
          usedOn: nowIso,
          nextAvailable: "",
          status: "In use",
          notes: "",
          agent: agentName,
        })
      }

      targetRow.lines = newLines
      newRows[rIdx] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  // Done button: status Done (creates line if none, fills Next Available with now + reset hours if empty)
  const handleDoneAgent = (rIdx: number, agentName: string) => {
    const now = new Date()
    updateCurrentTracker((tracker) => {
      const newRows = [...tracker.rows]
      const targetRow = { ...newRows[rIdx] }
      const newLines = [...targetRow.lines]

      let agentLineIdx = -1
      for (let i = newLines.length - 1; i >= 0; i--) {
        if (newLines[i].agent === agentName) { agentLineIdx = i; break }
      }

      if (agentLineIdx !== -1) {
        const line = { ...newLines[agentLineIdx] }
        line.status = "Done"
        if (!line.nextAvailable) {
          const acctName = line.googleAccount?.trim() || targetRow.label.trim()
          const resetHours = data.options?.accountResetHours?.[acctName] ?? 24
          const nextDate = new Date(now.getTime() + resetHours * 3600 * 1000)
          line.nextAvailable = toLocalIsoString(nextDate)
        }
        newLines[agentLineIdx] = line
      } else {
        const acctName = targetRow.label.trim()
        const resetHours = data.options?.accountResetHours?.[acctName] ?? 24
        const nextDate = new Date(now.getTime() + resetHours * 3600 * 1000)
        newLines.push({
          id: "l-" + Math.random().toString(36).substring(2, 9),
          googleAccount: "",
          usedOn: "",
          nextAvailable: toLocalIsoString(nextDate),
          status: "Done",
          notes: "",
          agent: agentName,
        })
      }

      targetRow.lines = newLines
      newRows[rIdx] = targetRow
      return { ...tracker, rows: newRows }
    })
  }

  // Date edit popover — open
  const handleEditDate = useCallback(
    (rIdx: number, agentName: string, field: "usedOn" | "nextAvailable", rect: DOMRect) => {
      const tracker = data.trackers[data.activeTrackerIndex]
      if (!tracker) return
      const row = tracker.rows[rIdx]
      if (!row) return
      const agentLines = row.lines.filter((l) => l.agent === agentName)
      let currentVal = ""
      if (field === "usedOn") {
        for (const l of agentLines) if (l.usedOn && (!currentVal || l.usedOn > currentVal)) currentVal = l.usedOn
      } else {
        for (const l of agentLines) if (l.nextAvailable && (!currentVal || l.nextAvailable > currentVal)) currentVal = l.nextAvailable
      }
      setDateEditPopover({
        rIdx,
        agentName,
        field,
        initialVal: currentVal,
        pos: { top: rect.bottom + 4, left: rect.left },
      })
    },
    [data]
  )

  // Date edit popover — save
  const handleSaveDateEdit = useCallback(
    (rIdx: number, agentName: string, field: "usedOn" | "nextAvailable", val: string) => {
      updateCurrentTracker((tracker) => {
        const newRows = tracker.rows.map((r) => ({ ...r, lines: r.lines.map((l) => ({ ...l })) }))
        const row = newRows[rIdx]
        if (!row) return tracker
        const agentLines = row.lines.filter((l) => l.agent === agentName)
        // Find the line that owns the displayed date (or last agent line, or create new)
        let targetLineIdx = -1
        if (field === "usedOn") {
          let best = ""
          for (let i = 0; i < row.lines.length; i++) {
            const l = row.lines[i]
            if (l.agent === agentName && l.usedOn && (!best || l.usedOn > best)) { best = l.usedOn; targetLineIdx = i }
          }
        } else {
          let best = ""
          for (let i = 0; i < row.lines.length; i++) {
            const l = row.lines[i]
            if (l.agent === agentName && l.nextAvailable && (!best || l.nextAvailable > best)) { best = l.nextAvailable; targetLineIdx = i }
          }
        }
        if (targetLineIdx === -1) {
          // Fall back to any agent line
          for (let i = 0; i < row.lines.length; i++) {
            if (row.lines[i].agent === agentName) { targetLineIdx = i; break }
          }
        }
        if (targetLineIdx === -1) {
          // Create a new line for this agent
          row.lines.push({
            id: "l-" + Math.random().toString(36).substring(2, 9),
            googleAccount: "",
            usedOn: field === "usedOn" ? val : "",
            nextAvailable: field === "nextAvailable" ? val : "",
            status: "",
            notes: "",
            agent: agentName,
          })
        } else {
          row.lines[targetLineIdx] = { ...row.lines[targetLineIdx], [field]: val }
        }
        return { ...tracker, rows: newRows }
      })
    },
    [updateCurrentTracker]
  )

  // Quick Log
  const handleQuickLogStarted = (accountName: string) => {
    if (!accountName) return
    const nowIso = toLocalIsoString(new Date())
    updateCurrentTracker((tr) => {
      const newRows = [...tr.rows]
      let targetRowIdx = newRows.findIndex((r) => r.label.trim().toLowerCase() === accountName.trim().toLowerCase())
      if (targetRowIdx === -1) targetRowIdx = 0
      const targetRow = { ...newRows[targetRowIdx] }
      const newLines = [...targetRow.lines]
      const emptyLineIdx = newLines.findIndex((l) => !l.usedOn && !l.googleAccount && !l.status)
      if (emptyLineIdx !== -1) {
        newLines[emptyLineIdx] = { ...newLines[emptyLineIdx], googleAccount: accountName, usedOn: nowIso, status: "In use" }
      } else {
        newLines.push({ id: "l-" + Math.random().toString(36).substring(2, 9), googleAccount: accountName, usedOn: nowIso, nextAvailable: "", status: "In use", notes: "", agent: "" })
      }
      targetRow.lines = newLines; newRows[targetRowIdx] = targetRow
      return { ...tr, rows: newRows }
    })
    setQuickLogOpen(false); setToast(null)
  }

  const handleQuickLogOutOfTokens = (accountName: string) => {
    if (!accountName) return
    const now = new Date(); const nowIso = toLocalIsoString(now)
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
      let targetRowIdx = newRows.findIndex((r) => r.label.trim().toLowerCase() === accountName.trim().toLowerCase())
      if (targetRowIdx === -1) targetRowIdx = 0
      const targetRow = { ...newRows[targetRowIdx] }
      const newLines = [...targetRow.lines]
      let foundInUseIdx = -1
      for (let i = newLines.length - 1; i >= 0; i--) {
        const line = newLines[i]
        const lineAcct = line.googleAccount?.trim() || targetRow.label.trim()
        if (lineAcct === accountName && line.status === "In use") { foundInUseIdx = i; break }
      }
      if (foundInUseIdx !== -1) {
        newLines[foundInUseIdx] = { ...newLines[foundInUseIdx], status: "Done", nextAvailable: nextAvailIso }
      } else {
        newLines.push({ id: "l-" + Math.random().toString(36).substring(2, 9), googleAccount: accountName, usedOn: nowIso, nextAvailable: nextAvailIso, status: "Done", notes: "", agent: "" })
      }
      targetRow.lines = newLines; newRows[targetRowIdx] = targetRow
      return { ...tr, rows: newRows }
    })
    setQuickLogOpen(false)
    if (bestNextAccount && bestNextAccount !== accountName) {
      setToast({ message: `Switch to: ${bestNextAccount}`, account: bestNextAccount })
    }
  }

  const handleQuickLogRunningLow = (accountName: string) => {
    if (!accountName) return
    const nowIso = toLocalIsoString(new Date())
    updateCurrentTracker((tr) => {
      const newRows = [...tr.rows]
      let targetRowIdx = newRows.findIndex((r) => r.label.trim().toLowerCase() === accountName.trim().toLowerCase())
      if (targetRowIdx === -1) targetRowIdx = 0
      const targetRow = { ...newRows[targetRowIdx] }
      const newLines = [...targetRow.lines]
      let foundInUseIdx = -1
      for (let i = newLines.length - 1; i >= 0; i--) {
        const line = newLines[i]
        const lineAcct = line.googleAccount?.trim() || targetRow.label.trim()
        if (lineAcct === accountName && line.status === "In use") { foundInUseIdx = i; break }
      }
      if (foundInUseIdx !== -1) {
        newLines[foundInUseIdx] = { ...newLines[foundInUseIdx], status: "Low" }
      } else {
        newLines.push({ id: "l-" + Math.random().toString(36).substring(2, 9), googleAccount: accountName, usedOn: nowIso, nextAvailable: "", status: "Low", notes: "", agent: "" })
      }
      targetRow.lines = newLines; newRows[targetRowIdx] = targetRow
      return { ...tr, rows: newRows }
    })
    setQuickLogOpen(false)
  }

  const handleQuickLogDone = (accountName: string) => {
    if (!accountName) return
    updateCurrentTracker((tr) => {
      const newRows = [...tr.rows]
      let targetRowIdx = newRows.findIndex((r) => r.label.trim().toLowerCase() === accountName.trim().toLowerCase())
      if (targetRowIdx === -1) targetRowIdx = 0
      const targetRow = { ...newRows[targetRowIdx] }
      const newLines = [...targetRow.lines]
      let foundIdx = -1
      for (let i = newLines.length - 1; i >= 0; i--) {
        if (newLines[i].status === "In use" || newLines[i].status === "Low") { foundIdx = i; break }
      }
      if (foundIdx !== -1) {
        newLines[foundIdx] = { ...newLines[foundIdx], status: "Done" }
      }
      targetRow.lines = newLines; newRows[targetRowIdx] = targetRow
      return { ...tr, rows: newRows }
    })
    setQuickLogOpen(false)
  }

  // New Cycle
  const handleStartNewCycle = () => {
    const confirmed = window.confirm(
      "Start a new cycle? Entries will be archived and the lines cleared. Each account's last used, next available, and status are carried over so the reports keep working."
    )
    if (!confirmed) return

    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const archiveFilename = `AG-Tracker-Archive-${dateStr}.json`

    try {
      const archiveData = { archiveDate: now.toISOString(), archiveFilename, trackers: data.trackers, options: data.options }
      const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url; a.download = archiveFilename
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    } catch (err) { console.warn("Archive download warning:", err) }

    try {
      const existingHistoryRaw = localStorage.getItem(HISTORY_STORAGE_KEY)
      let hl = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : []
      if (!Array.isArray(hl)) hl = []
      const newSnapshot = { id: "snapshot-" + Date.now(), date: now.toISOString(), archiveFilename, data: JSON.parse(JSON.stringify(data)) }
      hl.unshift(newSnapshot); hl = hl.slice(0, 10)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(hl))
    } catch (err) { console.error("Failed to save tracker history snapshot:", err) }

    // Carryover per account+agent key
    try {
      const carryOverMap: Record<string, any> = {}
      for (const tr of data.trackers) {
        const appName = tr.appName || tr.title
        for (const row of tr.rows || []) {
          for (const line of row.lines || []) {
            const ag = line.agent || ""
            const acct = line.googleAccount?.trim() || row.label.trim()
            const key = `${acct}::${ag}`
            if (line.usedOn) {
              const existing = carryOverMap[key]
              const uTime = new Date(line.usedOn).getTime()
              if (!existing || uTime > new Date(existing.usedOn || 0).getTime()) {
                carryOverMap[key] = { accountName: acct, agent: ag, usedOn: line.usedOn, nextAvailable: line.nextAvailable, status: line.status, appName }
              }
            }
          }
        }
      }
      localStorage.setItem(CARRYOVER_STORAGE_KEY, JSON.stringify(carryOverMap))
    } catch (err) { console.error("Failed to save carryover data:", err) }

    const clearedTrackers: AccountTracker[] = data.trackers.map((tr) => ({
      ...tr,
      rows: tr.rows.map((row) => ({ ...row, lines: createDefaultLines() })),
      trackerNotes: "",
    }))
    const newData: AgTrackerStorageData = { ...data, trackers: clearedTrackers }
    setData(newData); localStorage.setItem(STORAGE_KEY, JSON.stringify(newData)); setSaveStatus("saved")
    alert("New cycle started! Lines cleared and accounts carried over.")
  }

  const handleRestoreSnapshot = (snapshotData: AgTrackerStorageData) => {
    if (!window.confirm("Restore this cycle? Current tracker data will be replaced.")) return
    setData(snapshotData); localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshotData))
    setSaveStatus("saved"); setHistoryOpen(false); alert("Cycle restored successfully.")
  }

  const handleExportJson = () => {
    try {
      const historyData = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]")
      const carryOverData = JSON.parse(localStorage.getItem(CARRYOVER_STORAGE_KEY) || "{}")
      const exportPayload = { ...data, history: historyData, carryover: carryOverData }
      const jsonStr = JSON.stringify(exportPayload, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url
      a.download = `ag-account-tracker-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    } catch (err) { alert("Failed to export JSON: " + String(err)) }
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)
        if (!Array.isArray(parsed.trackers)) throw new Error("Invalid tracker backup format: missing trackers list.")
        if (!window.confirm("Importing this backup will overwrite current trackers. Continue?")) {
          if (fileInputRef.current) fileInputRef.current.value = ""; return
        }
        const migrated = migrateStorageData(parsed)
        if (Array.isArray(parsed.history)) {
          const migratedHistory = convertOutToDoneInObject(parsed.history)
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(migratedHistory))
        }
        if (parsed.carryover && typeof parsed.carryover === "object") {
          const migratedCarryover = convertOutToDoneInObject(parsed.carryover)
          localStorage.setItem(CARRYOVER_STORAGE_KEY, JSON.stringify(migratedCarryover))
        }
        setData(migrated); localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        setSaveStatus("saved"); alert("AG Account Tracker data imported successfully!")
      } catch (err) { alert("Failed to import file: " + String(err)) }
      finally { if (fileInputRef.current) fileInputRef.current.value = "" }
    }
    reader.readAsText(file)
  }

  const handleDayChange = useCallback(
    (newDay: string) => {
      const currentId = currentTracker.id
      updateData((prev) => {
        const updated = prev.trackers.map((tr) => (tr.id === currentId ? { ...tr, day: newDay } : tr))
        // Re-order tabs by day: oldest on left, newest on right
        updated.sort((a, b) => (a.day || "").localeCompare(b.day || ""))
        const newActiveIdx = updated.findIndex((tr) => tr.id === currentId)
        return {
          ...prev,
          trackers: updated,
          activeTrackerIndex: newActiveIdx >= 0 ? newActiveIdx : 0,
        }
      })
    },
    [currentTracker?.id, updateData]
  )

  const handleNoteIcon = useCallback(
    (rIdx: number, agentName: string) => {
      const row = currentTracker.rows[rIdx]
      if (!row) return
      const todayStr = getTodayFormatted()
      const header = `[${row.label} – ${todayStr}]:`
      const existing = currentTracker.trackerNotes || ""

      // Only one timestamp per account per day
      if (!existing.includes(`[${row.label} – ${todayStr}`)) {
        const sep = existing.trim() ? (existing.endsWith("\n") ? "\n" : "\n\n") : ""
        const updated = existing + sep + header + " "
        updateCurrentTracker((tr) => ({ ...tr, trackerNotes: updated }))
      }
      setNotesExpanded(true)
      setTimeout(() => {
        if (notesTextareaRef.current) {
          notesTextareaRef.current.focus()
          const len = notesTextareaRef.current.value.length
          notesTextareaRef.current.setSelectionRange(len, len)
        }
      }, 60)
    },
    [currentTracker, updateCurrentTracker]
  )

  const handlePrintPdf = useCallback(() => {
    const win = window.open("", "_blank")
    if (!win) {
      alert("Please allow popups in your browser to view and print the PDF report.")
      return
    }

    const allTrackers = data.trackers

    const buildTrackerHtml = (tracker: AccountTracker) => {
      const dayDate = tracker.day ? tracker.day : toLocalIsoString(new Date()).slice(0, 10)
      const parts = dayDate.split("-")
      const dayFormatted = parts.length === 3 ? `${parts[1]}-${parts[2]}-${parts[0]}` : dayDate
      const appTitle = tracker.appName ? `${dayFormatted} – ${tracker.appName}` : dayFormatted

      const getTimestamps = (row: TrackerRow) => {
        let latestUsed = ""
        let latestNext = ""
        for (const line of row.lines) {
          if (line.usedOn && (!latestUsed || line.usedOn > latestUsed)) latestUsed = line.usedOn
          if (line.nextAvailable && (!latestNext || line.nextAvailable > latestNext)) latestNext = line.nextAvailable
        }
        return { latestUsed, latestNext }
      }

      const rowsCopy = [...tracker.rows].map((row, origIdx) => ({
        row,
        origIdx,
        ...getTimestamps(row),
      }))

      if (sortMode === "used-oldest") {
        rowsCopy.sort((a, b) => {
          if (!a.latestUsed && !b.latestUsed) return a.origIdx - b.origIdx
          if (!a.latestUsed) return -1
          if (!b.latestUsed) return 1
          const cmp = a.latestUsed.localeCompare(b.latestUsed)
          return cmp !== 0 ? cmp : a.origIdx - b.origIdx
        })
      } else if (sortMode === "used-newest") {
        rowsCopy.sort((a, b) => {
          if (!a.latestUsed && !b.latestUsed) return a.origIdx - b.origIdx
          if (!a.latestUsed) return 1
          if (!b.latestUsed) return -1
          const cmp = b.latestUsed.localeCompare(a.latestUsed)
          return cmp !== 0 ? cmp : a.origIdx - b.origIdx
        })
      } else if (sortMode === "next-soonest") {
        rowsCopy.sort((a, b) => {
          if (!a.latestNext && !b.latestNext) return a.origIdx - b.origIdx
          if (!a.latestNext) return 1
          if (!b.latestNext) return -1
          const cmp = a.latestNext.localeCompare(b.latestNext)
          return cmp !== 0 ? cmp : a.origIdx - b.origIdx
        })
      }

      const rowsHtml = rowsCopy
        .map(({ row }, blockIdx) => {
          const bgBand = blockIdx % 2 === 0 ? "#131d33" : "#1a2744"

          const geminiLines = row.lines.filter((l) => l.agent === "Gemini")
          const claudeLines = row.lines.filter((l) => l.agent === "Claude")

          const getAgentData = (lines: TrackerRowLine[]) => {
            let usedOn = ""
            let nextAvail = ""
            let status = ""
            for (const l of lines) {
              if (l.usedOn && (!usedOn || l.usedOn > usedOn)) usedOn = l.usedOn
              if (l.nextAvailable && (!nextAvail || l.nextAvailable > nextAvail)) nextAvail = l.nextAvailable
              if (l.status) status = l.status === "Out" ? "Done" : l.status
            }
            return { usedOn, nextAvail, status }
          }

          const gem = getAgentData(geminiLines)
          const cld = getAgentData(claudeLines)

          const formatBadge = (status: string) => {
            if (!status) return `<span style="color:#64748b;font-size:11px;font-weight:600">Status</span>`
            let bg = "rgba(100,116,139,0.2)"
            let color = "#94a3b8"
            let border = "rgba(100,116,139,0.3)"
            if (status === "In use") {
              bg = "rgba(16,185,129,0.2)"
              color = "#6ee7b7"
              border = "rgba(16,185,129,0.4)"
            } else if (status === "Low") {
              bg = "rgba(245,158,11,0.2)"
              color = "#fcd34d"
              border = "rgba(245,158,11,0.4)"
            } else if (status === "Done") {
              bg = "rgba(239,68,68,0.2)"
              color = "#fca5a5"
              border = "rgba(239,68,68,0.4)"
            }
            return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;background:${bg};color:${color};border:1px solid ${border};letter-spacing:0.02em">${status.toUpperCase()}</span>`
          }

          const formatChip = (dateStr: string, isNext: boolean) => {
            if (!dateStr) return `<span style="color:#64748b">—</span>`
            const formatted = formatDisplayDateTime(dateStr)
            if (!isNext) {
              const dc = dayChip(dateStr)
              const chipHtml = dc
                ? `<span style="display:inline-block;margin-left:6px;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:${
                    dc === "Today" ? "rgba(59,130,246,0.25)" : "rgba(156,163,175,0.2)"
                  };color:${dc === "Today" ? "#93c5fd" : "#d1d5db"};border:1px solid ${
                    dc === "Today" ? "rgba(59,130,246,0.4)" : "rgba(156,163,175,0.3)"
                  }">${dc}</span>`
                : ""
              return `<span style="font-size:12px;font-weight:500;white-space:nowrap">${formatted}${chipHtml}</span>`
            } else {
              const rc = readyChip(dateStr)
              const chipHtml =
                rc.label !== "—"
                  ? `<span style="display:inline-block;margin-left:6px;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:${
                      rc.cls.includes("ready") ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"
                    };color:${rc.cls.includes("ready") ? "#6ee7b7" : "#fca5a5"};border:1px solid ${
                      rc.cls.includes("ready") ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"
                    }">${rc.label}</span>`
                  : ""
              return `<span style="font-size:12px;font-weight:500;white-space:nowrap">${formatted}${chipHtml}</span>`
            }
          }

          return `
            <tr style="background:${bgBand}">
              <td rowspan="2" style="width:150px;padding:6px 10px;border-bottom:1px solid #334155;border-right:1px solid #334155;vertical-align:middle;font-weight:700;font-size:13px;color:#ffffff">
                ${row.label}
              </td>
              <td style="width:70px;padding:5px 8px;border-bottom:1px solid rgba(51,65,85,0.4);border-right:1px solid #334155;font-weight:700;font-size:12px;color:#60a5fa">
                Gemini
              </td>
              <td style="width:90px;padding:5px 8px;border-bottom:1px solid rgba(51,65,85,0.4);border-right:1px solid #334155">
                ${formatBadge(gem.status)}
              </td>
              <td style="width:220px;padding:5px 8px;border-bottom:1px solid rgba(51,65,85,0.4);border-right:1px solid #334155">
                ${formatChip(gem.usedOn, false)}
              </td>
              <td style="width:270px;padding:5px 8px;border-bottom:1px solid rgba(51,65,85,0.4)">
                ${formatChip(gem.nextAvail, true)}
              </td>
            </tr>
            <tr style="background:${bgBand}">
              <td style="width:70px;padding:5px 8px;border-bottom:1px solid #334155;border-right:1px solid #334155;font-weight:700;font-size:12px;color:#a78bfa">
                Claude
              </td>
              <td style="width:90px;padding:5px 8px;border-bottom:1px solid #334155;border-right:1px solid #334155">
                ${formatBadge(cld.status)}
              </td>
              <td style="width:220px;padding:5px 8px;border-bottom:1px solid #334155;border-right:1px solid #334155">
                ${formatChip(cld.usedOn, false)}
              </td>
              <td style="width:270px;padding:5px 8px;border-bottom:1px solid #334155">
                ${formatChip(cld.nextAvail, true)}
              </td>
            </tr>
          `
        })
        .join("")

      return `
        <div class="tracker-page-block" data-tracker-id="${tracker.id}" style="padding:16px;max-width:980px;margin:0 auto 30px auto;background:#0f172a;border-radius:10px;border:1px solid #334155;box-shadow:0 10px 25px rgba(0,0,0,0.5)">
          <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid #334155">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#ffffff">AG ACCOUNT TRACKER</span>
              <span style="font-size:12px;font-weight:600;padding:2px 8px;border-radius:9999px;background:rgba(59,130,246,0.2);color:#93c5fd;border:1px solid rgba(59,130,246,0.3)">${appTitle}</span>
            </div>
            <span style="font-size:12px;color:#94a3b8">Printed: ${new Date().toLocaleDateString()}</span>
          </div>

          <table style="width:100%;border-collapse:collapse;table-layout:fixed;border:1px solid #334155;border-radius:6px;overflow:hidden">
            <thead>
              <tr style="background:#090d16;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.05em">
                <th style="width:150px;padding:8px;text-align:left;border-bottom:2px solid #334155;border-right:1px solid #334155">Row</th>
                <th style="width:70px;padding:8px;text-align:left;border-bottom:2px solid #334155;border-right:1px solid #334155">Agent</th>
                <th style="width:90px;padding:8px;text-align:left;border-bottom:2px solid #334155;border-right:1px solid #334155">Status</th>
                <th style="width:220px;padding:8px;text-align:left;border-bottom:2px solid #334155;border-right:1px solid #334155">Used On</th>
                <th style="width:270px;padding:8px;text-align:left;border-bottom:2px solid #334155">Next Available</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          ${
            tracker.trackerNotes
              ? `
            <div style="margin-top:14px;padding:12px;background:#090d16;border-radius:6px;border:1px solid #334155">
              <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">Tracker Notes:</div>
              <pre style="margin:0;font-size:12px;line-height:1.5;white-space:pre-wrap;font-family:inherit;color:#e2e8f0">${tracker.trackerNotes}</pre>
            </div>
          `
              : ""
          }
        </div>
      `
    }

    const currentTrackerOnly = buildTrackerHtml(currentTracker)
    const allTrackersHtml = allTrackers.map((tr) => buildTrackerHtml(tr)).join("")

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AG Account Tracker – PDF Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background: #060913;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .btn {
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid rgba(255,255,255,0.2);
      background: #1e293b;
      color: #f1f5f9;
      transition: all 0.15s ease;
    }
    .btn:hover { background: #334155; }
    .btn-primary {
      background: #2563eb;
      border-color: #3b82f6;
      color: #ffffff;
    }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-active {
      background: rgba(59,130,246,0.3) !important;
      border-color: #3b82f6 !important;
      color: #93c5fd !important;
    }
    @media print {
      body { padding: 0 !important; background: #0f172a !important; }
      .no-print { display: none !important; }
      .tracker-page-block {
        page-break-after: always !important;
        break-after: page !important;
        margin: 0 !important;
        padding: 16px !important;
        border: none !important;
        box-shadow: none !important;
      }
      .tracker-page-block:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="btn btn-primary" onclick="window.print()">🖨 Print / Save as PDF</button>
      <span style="font-size:12px;color:#94a3b8">View:</span>
      <button id="btn-all" class="btn btn-active" onclick="showAll()">All Blocks (${allTrackers.length})</button>
      <button id="btn-current" class="btn" onclick="showCurrent()">Current Block Only</button>
    </div>
    <span style="font-size:12px;color:#94a3b8">Tip: In print preview, choose "Save as PDF" and check "Background graphics".</span>
  </div>

  <div id="container-all">${allTrackersHtml}</div>
  <div id="container-current" style="display:none">${currentTrackerOnly}</div>

  <script>
    function showAll() {
      document.getElementById('container-all').style.display = 'block';
      document.getElementById('container-current').style.display = 'none';
      document.getElementById('btn-all').classList.add('btn-active');
      document.getElementById('btn-current').classList.remove('btn-active');
    }
    function showCurrent() {
      document.getElementById('container-all').style.display = 'none';
      document.getElementById('container-current').style.display = 'block';
      document.getElementById('btn-current').classList.add('btn-active');
      document.getElementById('btn-all').classList.remove('btn-active');
    }
  </script>
</body>
</html>`

    win.document.open()
    win.document.write(fullHtml)
    win.document.close()
  }, [data.trackers, currentTracker, sortMode])

  const handleAddCustomGoogleAccount = () => {
    const trimmed = newOptionInput.trim(); if (!trimmed) return
    updateData((prev) => {
      const existing = prev.options.customGoogleAccounts || []
      if (existing.includes(trimmed)) return prev
      return { ...prev, options: { ...prev.options, customGoogleAccounts: [...existing, trimmed], accountResetHours: { ...(prev.options.accountResetHours || {}), [trimmed]: 24 } } }
    })
    setNewOptionInput("")
  }

  const handleDeleteCustomGoogleAccount = (optToDelete: string) => {
    updateData((prev) => {
      const existing = prev.options.customGoogleAccounts || []
      const updatedHours = { ...(prev.options.accountResetHours || {}) }
      delete updatedHours[optToDelete]
      return { ...prev, options: { ...prev.options, customGoogleAccounts: existing.filter((item) => item !== optToDelete), accountResetHours: updatedHours } }
    })
  }

  const handleUpdateResetHours = (accountName: string, hours: number) => {
    updateData((prev) => ({
      ...prev,
      options: { ...prev.options, accountResetHours: { ...(prev.options.accountResetHours || {}), [accountName]: Math.max(1, hours || 24) } }
    }))
  }

  const handleOpenFullScreenTrackerNotes = () => {
    setFullScreenNotes({
      title: `${currentTracker.appName || currentTracker.title} – Tracker Notes`,
      value: currentTracker.trackerNotes || "",
      customCallback: (newVal) => updateCurrentTracker((tr) => ({ ...tr, trackerNotes: newVal })),
    })
  }

  const handleAppendTodayToNotes = () => {
    const todayStr = getTodayFormatted()
    const heading = `${todayStr}: `
    const existing = currentTracker.trackerNotes || ""
    const separator = existing.trim() ? (existing.endsWith("\n") ? "\n" : "\n\n") : ""
    const updated = existing + separator + heading

    updateCurrentTracker((tr) => ({ ...tr, trackerNotes: updated }))
    setNotesExpanded(true)

    setTimeout(() => {
      if (notesTextareaRef.current) {
        notesTextareaRef.current.focus()
        notesTextareaRef.current.setSelectionRange(updated.length, updated.length)
      }
    }, 50)
  }

  const getRowKey = (row: any, rIdx: number): string =>
    row.id || `row-${rIdx}-${(row.label || `acct-${rIdx}`).replace(/\s+/g, "_")}`

  const toggleRowExpand = (rowKey: string) => {
    setExpandedRows((prev) => {
      const next = { ...prev, [rowKey]: !prev[rowKey] }
      saveExpandedRows(next); return next
    })
  }

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {}
    currentTracker.rows.forEach((r, idx) => { next[getRowKey(r, idx)] = true })
    setExpandedRows(next); saveExpandedRows(next)
  }

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {}
    currentTracker.rows.forEach((r, idx) => { next[getRowKey(r, idx)] = false })
    setExpandedRows(next); saveExpandedRows(next)
  }

  const handleUpdateAccountFromReport = useCallback(
    (accountName: string, updates: { status?: LineStatus; usedOn?: string; nextAvailable?: string; notes?: string }) => {
      updateCurrentTracker((tr) => {
        let targetRowIndex = -1, targetLineIndex = -1
        for (let r = 0; r < tr.rows.length; r++) {
          for (let l = 0; l < tr.rows[r].lines.length; l++) {
            const line = tr.rows[r].lines[l]
            const lineAccount = line.googleAccount?.trim() || tr.rows[r].label?.trim()
            if (lineAccount === accountName) { targetRowIndex = r; targetLineIndex = l; break }
          }
          if (targetRowIndex !== -1) break
        }
        if (targetRowIndex === -1) {
          const r = tr.rows.findIndex((row) => row.label.trim() === accountName.trim())
          if (r !== -1) { targetRowIndex = r; targetLineIndex = 0 }
        }
        const newRows = tr.rows.map((r) => ({ ...r, lines: r.lines.map((l) => ({ ...l })) }))
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
            agent: "",
          })
        }
        return { ...tr, rows: newRows }
      })
    },
    [updateCurrentTracker]
  )

  // Render row in compact 16-row view: 2 sub-rows (Gemini + Claude) for each account
  function renderCompactAccountRows(row: TrackerRow, rIdx: number, actualRIdx: number) {
    const rowKey = getRowKey(row, actualRIdx)
    const isExpanded = Boolean(expandedRows[rowKey])
    const isHighlighted = highlightRowKey === rowKey

    let latestUsedOn = ""
    for (const l of row.lines) {
      if (l.usedOn && (!latestUsedOn || l.usedOn > latestUsedOn)) latestUsedOn = l.usedOn
    }

    const usedTodayBorder = row.lines.some((l) => l.usedOn && isToday(l.usedOn))

    // Finish agent tag
    const geminiLines = row.lines.filter((l) => l.agent === "Gemini")
    const claudeLines = row.lines.filter((l) => l.agent === "Claude")
    const geminiLatest = geminiLines.sort((a, b) => (b.usedOn || "").localeCompare(a.usedOn || ""))[0]
    const claudeLatest = claudeLines.sort((a, b) => (b.usedOn || "").localeCompare(a.usedOn || ""))[0]
    const geminiUsedToday = geminiLatest && isToday(geminiLatest.usedOn)
    const claudeUsedToday = claudeLatest && isToday(claudeLatest.usedOn)
    const geminiDone = geminiLatest && geminiLatest.status === "Done"
    const claudeDone = claudeLatest && claudeLatest.status === "Done"
    let finishTag = ""
    if (geminiUsedToday && !claudeUsedToday && !claudeDone) finishTag = "Claude"
    else if (claudeUsedToday && !geminiUsedToday && !geminiDone) finishTag = "Gemini"

    const isNextAccount = todayStripData.nextAccount === row.label
    const extraLines = row.lines.length - 2

    return (
      <React.Fragment key={rowKey}>
        <tr
          id={`row-${rowKey}`}
          className={`ag-subrow ${usedTodayBorder ? "ag-row-blue-border" : ""} ${isHighlighted ? "ag-row-highlight" : ""}`}
        >
          {/* Account label cell (spans 2 sub-rows when collapsed) */}
          <td
            className="ag-subrow-account-cell"
            rowSpan={isExpanded ? 1 : 2}
            style={{ verticalAlign: "middle", width: "150px", minWidth: "150px", maxWidth: "150px" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontWeight: 700, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{row.label}</span>
                {extraLines > 0 && (
                  <span style={{ fontSize: "0.65rem", padding: "0 4px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", color: "#9ca3af" }}>
                    +{extraLines}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.65rem", color: latestUsedOn ? (isToday(latestUsedOn) ? "#60a5fa" : "#9ca3af") : "#4b5563", whiteSpace: "nowrap" }}>
                {latestUsedOn ? `Last: ${formatDisplayDateTime(latestUsedOn)}` : "Never used"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", flexWrap: "wrap", marginTop: "1px" }}>
                {finishTag && (
                  <span style={{ fontSize: "0.6rem", padding: "1px 4px", background: "rgba(245,158,11,0.2)", color: "#fcd34d", borderRadius: "3px", whiteSpace: "nowrap" }}>
                    Finish {finishTag}
                  </span>
                )}
                {isNextAccount && (
                  <span style={{ fontSize: "0.6rem", padding: "1px 4px", background: "rgba(16,185,129,0.2)", color: "#6ee7b7", borderRadius: "3px", whiteSpace: "nowrap" }}>
                    Next
                  </span>
                )}
                <button
                  type="button"
                  className="ag-tracker-btn"
                  style={{ fontSize: "0.65rem", padding: "0px 4px", marginLeft: "auto" }}
                  onClick={() => toggleRowExpand(rowKey)}
                  title={isExpanded ? "Collapse row editor" : "Expand row editor"}
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </td>

          {/* Gemini sub-row */}
          <AgentSubRow
            agentName="Gemini"
            row={row}
            rIdx={actualRIdx}
            onStartAgent={handleStartAgent}
            onDoneAgent={handleDoneAgent}
            onOpenStatusMenu={(ri, ag, rect) => {
              const currentStatus = row.lines.filter((l) => l.agent === ag).sort((a, b) => (b.usedOn || "").localeCompare(a.usedOn || ""))[0]?.status || ""
              setStatusMenu({ rIdx: ri, agentName: ag, currentStatus, pos: { top: rect.bottom + 2, left: rect.left } })
            }}
            onEditDate={handleEditDate}
            onNoteIcon={handleNoteIcon}
          />
        </tr>

        <tr className={`ag-subrow ${isHighlighted ? "ag-row-highlight" : ""}`}>
          {/* Claude sub-row */}
          <AgentSubRow
            agentName="Claude"
            row={row}
            rIdx={actualRIdx}
            onStartAgent={handleStartAgent}
            onDoneAgent={handleDoneAgent}
            onOpenStatusMenu={(ri, ag, rect) => {
              const currentStatus = row.lines.filter((l) => l.agent === ag).sort((a, b) => (b.usedOn || "").localeCompare(a.usedOn || ""))[0]?.status || ""
              setStatusMenu({ rIdx: ri, agentName: ag, currentStatus, pos: { top: rect.bottom + 2, left: rect.left } })
            }}
            onEditDate={handleEditDate}
            onNoteIcon={handleNoteIcon}
          />
        </tr>

        {isExpanded && (
          <tr>
            <td colSpan={6} style={{ padding: "0", background: "rgba(59,130,246,0.04)" }}>
              <ExpandedRowSection
                row={row}
                rIdx={actualRIdx}
                customAgents={customAgents}
                googleAccountOptions={googleAccountOptions}
                onAddLine={handleAddLine}
                onDeleteLine={handleDeleteLine}
                onUpdateLine={handleUpdateLine}
                onUsedOnChoice={handleUsedOnChoice}
                onNextAvailableChoice={handleNextAvailableChoice}
                onLabelChange={(ri, label) => updateCurrentTracker((tr) => { const newRows = [...tr.rows]; newRows[ri] = { ...newRows[ri], label }; return { ...tr, rows: newRows } })}
                onCollapse={() => toggleRowExpand(rowKey)}
                onCustomAgentsChange={(agents) => setCustomAgents(agents)}
              />
            </td>
          </tr>
        )}
      </React.Fragment>
    )
  }

  // ============================================================
  // RENDER
  // ============================================================
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
        <input type="file" ref={fileInputRef} onChange={handleImportJson} accept=".json,application/json" style={{ display: "none" }} />

        {/* Centered Dialog Container */}
        <div
          className={`ag-tracker-dialog journal-theme-${theme}`}
          onClick={(e) => e.stopPropagation()}
          style={{ width: "min(98vw, 1400px)", height: "96vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {/* TOAST NOTIFICATION */}
          {toast && (
            <div className="ag-toast-container">
              <span>{toast.message}</span>
              <button type="button" className="ag-toast-btn" onClick={() => handleQuickLogStarted(toast.account)}>Log started</button>
              <button type="button" className="ag-tracker-btn-icon" onClick={() => setToast(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ROW 1: COMBINED HEADER (44px)
              Merged: Title + Tabs + App Name + Actions
          ══════════════════════════════════════════════════ */}
          <header className="ag-tracker-header" style={{ height: "44px", minHeight: "44px", maxHeight: "44px", flexShrink: 0, padding: "0 0.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0, flex: "1 1 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                <FileSpreadsheet className="h-4 w-4 text-blue-400" />
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground, #ffffff)", whiteSpace: "nowrap" }}>
                  AG Tracker
                </span>
              </div>

              {/* Tabs list */}
              <div className="ag-tracker-tabs-list" style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                {data.trackers.map((tracker, idx) => {
                  const isActive = idx === activeIndex
                  const displayName = getTabDisplayName(tracker)
                  const fullTitle = getTabFullTitle(tracker)
                  return (
                    <button
                      key={tracker.id}
                      type="button"
                      className={`ag-tracker-tab ${isActive ? "active" : ""}`}
                      style={{ fontSize: "0.75rem", padding: "0.15rem 0.45rem", height: "24px" }}
                      onClick={() => updateData((prev) => ({ ...prev, activeTrackerIndex: idx }))}
                      title={fullTitle}
                    >
                      <span className="truncate max-w-[120px]">{displayName}</span>
                      {data.trackers.length > 1 && (
                        <span
                          className="ag-tracker-tab-close"
                          onClick={(e) => handleDeleteTracker(idx, e)}
                          title={`Delete ${fullTitle}`}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </button>
                  )
                })}
                <button
                  type="button"
                  className="ag-tracker-btn"
                  onClick={handleAddTracker}
                  title="Add a new tracker block"
                  style={{ fontSize: "0.7rem", padding: "0.15rem 0.35rem", height: "24px" }}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* App Name input */}
              <div style={{ display: "flex", alignItems: "center", gap: "3px", minWidth: 0, flexShrink: 1 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground, #9ca3af)", whiteSpace: "nowrap" }}>App:</span>
                <input
                  id="ag-tracker-appname-input"
                  list="journal-app-names-datalist"
                  className="ag-tracker-input"
                  style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem", height: "24px", width: "90px", minWidth: "65px" }}
                  placeholder="App name..."
                  value={currentTracker.appName}
                  onChange={(e) => updateCurrentTracker((tr) => ({ ...tr, appName: e.target.value }))}
                />
                <datalist id="journal-app-names-datalist">
                  {journalAppNames.map((name) => <option key={name} value={name} />)}
                </datalist>
                {journalAppNames.length > 0 && (
                  <select
                    aria-label="Pick from Journal Apps"
                    className="ag-tracker-select"
                    style={{ fontSize: "0.7rem", padding: "0.1rem 0.3rem", height: "24px", width: "auto" }}
                    value={journalAppNames.includes(currentTracker.appName) ? currentTracker.appName : ""}
                    onChange={(e) => { if (e.target.value) updateCurrentTracker((tr) => ({ ...tr, appName: e.target.value })) }}
                  >
                    <option value="">Choose...</option>
                    {journalAppNames.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                )}
                <input
                  type="date"
                  aria-label="Tracker Date"
                  className="ag-tracker-input"
                  style={{ fontSize: "0.7rem", padding: "0.1rem 0.25rem", height: "24px", width: "105px", flexShrink: 0 }}
                  value={currentTracker.day || ""}
                  onChange={(e) => handleDayChange(e.target.value)}
                  title="Tracker day (changing re-orders tabs by day)"
                />
              </div>

              <span
                className={`ag-tracker-save-badge ${saveStatus === "saving" ? "saving" : "saved"}`}
                style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", flexShrink: 0 }}
                title={saveStatus === "saving" ? "Saving changes..." : "All changes saved locally"}
              >
                {saveStatus === "saving" ? <>Saving...</> : <><Check className="h-3 w-3" /> Saved</>}
              </span>
            </div>

            {/* Action buttons (scroll horizontally on small widths, no wrap) */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, overflowX: "auto", whiteSpace: "nowrap" }}>
              <button
                type="button"
                className="ag-tracker-btn font-bold text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                onClick={() => setQuickLogOpen(true)}
                title="Quick Log"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.45rem", height: "26px" }}
              >
                <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>Quick Log</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn"
                onClick={() => setReportsOpen(true)}
                title="Reports"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.45rem", height: "26px" }}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Reports</span>
                <span className="ag-report-count-badge" style={{ fontSize: "0.65rem", padding: "0 4px" }}>
                  {readyCount} ready
                </span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={handleStartNewCycle}
                title="New Cycle"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "26px" }}
              >
                <RotateCcw className="h-3.5 w-3.5 text-sky-400" />
                <span>New Cycle</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={() => setHistoryOpen(true)}
                title="History"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "26px" }}
              >
                <History className="h-3.5 w-3.5 text-purple-400" />
                <span>History</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={handlePrintPdf}
                title="Print or Save as PDF (full color report)"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "26px" }}
              >
                <Printer className="h-3.5 w-3.5" />
                <span>PDF</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={handleExportJson}
                title="Export JSON"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "26px" }}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility"
                onClick={() => fileInputRef.current?.click()}
                title="Import JSON"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "26px" }}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn ag-btn-utility ag-btn-current-app"
                onClick={() => setCurrentAppOpen(true)}
                title="Show the app I'm working on"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "26px" }}
              >
                <AppWindow className="h-3.5 w-3.5 text-sky-400" />
                <span>Current App</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn font-semibold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                onClick={() => setHelpOpen(true)}
                title="Help"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "26px" }}
              >
                <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Help</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn ag-tracker-btn-icon"
                onClick={handleImmediateClose}
                title="Close (Esc)"
                style={{ height: "26px", width: "26px" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* ══════════════════════════════════════════════════
              ROW 2: PINNED TOOLBAR (30px sticky)
          ══════════════════════════════════════════════════ */}
          <div
            className="ag-tracker-table-toolbar"
            style={{
              height: "30px",
              minHeight: "30px",
              maxHeight: "30px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              padding: "0 0.75rem",
              position: "sticky",
              top: 0,
              zIndex: 15,
              backgroundColor: "var(--card, #1a1a1a)",
              borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <button
                type="button"
                className="ag-tracker-btn"
                style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", height: "24px" }}
                onClick={handleExpandAll}
                title="Expand all accounts"
              >
                <ChevronDown className="h-3 w-3" />
                <span>Expand All</span>
              </button>
              <button
                type="button"
                className="ag-tracker-btn"
                style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", height: "24px" }}
                onClick={handleCollapseAll}
                title="Collapse all accounts"
              >
                <ChevronUp className="h-3 w-3" />
                <span>Collapse All</span>
              </button>
              <select
                className="ag-tracker-select"
                style={{ fontSize: "0.75rem", padding: "0.1rem 0.4rem", height: "24px", width: "auto" }}
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                title="Filter accounts by day status"
              >
                <option value="all">Day filter: All</option>
                <option value="used-today">Used today</option>
                <option value="not-used-today">Not used today</option>
                <option value="finish-today">Finish today</option>
              </select>
              <select
                className="ag-tracker-select"
                style={{ fontSize: "0.75rem", padding: "0.1rem 0.4rem", height: "24px", width: "auto" }}
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                title="Order accounts by when they were last used or when they're ready again."
              >
                <option value="manual">Sort: Manual order</option>
                <option value="used-oldest">Last used: oldest first</option>
                <option value="used-newest">Last used: newest first</option>
                <option value="next-soonest">Next available: soonest first</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <button
                type="button"
                className="ag-tracker-btn text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", height: "24px" }}
                onClick={() => setHelpOpen(true)}
              >
                <HelpCircle className="h-3 w-3" />
                <span>Process Guide</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              ROW 3: TODAY STRIP (30px sticky)
          ══════════════════════════════════════════════════ */}
          <div
            className="ag-today-strip"
            style={{
              height: "30px",
              minHeight: "30px",
              maxHeight: "30px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 0.75rem",
              overflowX: "auto",
              backgroundColor: "var(--card, #1e1e1e)",
              borderBottom: "1px solid var(--border, rgba(255,255,255,0.08))",
              position: "sticky",
              top: "30px",
              zIndex: 14,
            }}
          >
            <span className="ag-today-chip ag-today-chip-blue" style={{ whiteSpace: "nowrap" }}>
              Used today: {todayStripData.usedTodayCount}
            </span>

            {todayStripData.finishChips.map((chip, idx) => {
              const rowKey = `row-${currentTracker.rows.findIndex((r) => r.label === chip.account)}-${chip.account.replace(/\s+/g, "_")}`
              return (
                <span
                  key={`${chip.account}-${chip.agent}-${idx}`}
                  className="ag-today-chip ag-today-chip-amber"
                  style={{ whiteSpace: "nowrap", cursor: "pointer" }}
                  title="Click to scroll to row; click again to start agent"
                  onClick={() => {
                    const rIdx = currentTracker.rows.findIndex((r) => r.label === chip.account)
                    if (rIdx >= 0) {
                      if (highlightRowKey === rowKey) {
                        handleStartAgent(rIdx, chip.agent)
                      } else {
                        triggerRowHighlight(rowKey)
                      }
                    }
                  }}
                >
                  Finish: {chip.account} → {chip.agent}
                </span>
              )
            })}

            {todayStripData.nextAccount ? (
              <span
                className="ag-today-chip ag-today-chip-green"
                style={{ whiteSpace: "nowrap", cursor: "pointer" }}
                title="Next recommended account; click to scroll"
                onClick={() => {
                  const rIdx = currentTracker.rows.findIndex((r) => r.label === todayStripData.nextAccount)
                  if (rIdx >= 0) {
                    const rowKey = `row-${rIdx}-${todayStripData.nextAccount.replace(/\s+/g, "_")}`
                    triggerRowHighlight(rowKey)
                  }
                }}
              >
                Next: {todayStripData.nextAccount}
              </span>
            ) : (
              <span className="ag-today-chip ag-today-chip-grey" style={{ whiteSpace: "nowrap" }}>
                All accounts used today
              </span>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              MAIN TABLE: 26px header + 16 compact sub-rows
              (NO Notes column - fits all 16 rows without scroll)
          ══════════════════════════════════════════════════ */}
          <div style={{ flex: "1 1 auto", overflowY: "auto", overflowX: "auto", minHeight: 0 }}>
            <table className="ag-tracker-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              {/* Sticky Column Headers (26px) */}
              <thead>
                <tr style={{ position: "sticky", top: 0, zIndex: 12, background: "var(--card, #1a1a1a)", height: "26px" }}>
                  <th className="ag-tracker-th" style={{ width: "150px", minWidth: "150px", maxWidth: "150px", fontSize: "0.75rem", padding: "2px 6px" }}>Row</th>
                  <th className="ag-tracker-th" style={{ width: "70px", minWidth: "70px", maxWidth: "70px", fontSize: "0.75rem", padding: "2px 6px" }}>Agent</th>
                  <th className="ag-tracker-th" style={{ width: "90px", minWidth: "90px", maxWidth: "90px", fontSize: "0.75rem", padding: "2px 6px" }}>Status</th>
                  <th className="ag-tracker-th" style={{ width: "220px", minWidth: "220px", maxWidth: "220px", fontSize: "0.75rem", padding: "2px 6px" }}>Used On</th>
                  <th className="ag-tracker-th" style={{ width: "270px", minWidth: "270px", maxWidth: "270px", fontSize: "0.75rem", padding: "2px 6px" }}>Next Available</th>
                  <th className="ag-tracker-th" style={{ width: "90px", minWidth: "90px", maxWidth: "90px", fontSize: "0.75rem", padding: "2px 6px" }}>Action</th>
                </tr>
              </thead>

              {/* 16 Compact Sub-Rows (8 accounts × 2 agents, 28-30px each) */}
              <tbody>
                {displayRows.map((row, rIdx) => {
                  const actualRIdx = currentTracker.rows.indexOf(row)
                  return renderCompactAccountRows(row, rIdx, actualRIdx >= 0 ? actualRIdx : rIdx)
                })}
              </tbody>
            </table>
          </div>

          {/* ══════════════════════════════════════════════════
              TRACKER NOTES PANEL (Docked at bottom)
              Collapsed by default to a one-line preview.
              Includes "+ Today" button and Full Screen.
          ══════════════════════════════════════════════════ */}
          <div className="ag-notes-panel" style={{ flexShrink: 0, borderTop: "1px solid var(--border, rgba(255,255,255,0.12))", background: "var(--card, #1a1a1a)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 0.75rem",
                height: "28px",
                cursor: "pointer",
              }}
              onClick={() => setNotesExpanded(!notesExpanded)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, whiteSpace: "nowrap" }}>Tracker Notes</span>
                {!notesExpanded && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted-foreground, #9ca3af)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "500px",
                    }}
                  >
                    {currentTracker.trackerNotes
                      ? currentTracker.trackerNotes.split("\n")[0]
                      : "No notes yet. Click to expand or add notes..."}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                {/* + Today Button */}
                <button
                  type="button"
                  className="ag-tracker-btn"
                  style={{ padding: "0.1rem 0.45rem", fontSize: "0.7rem", height: "22px" }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAppendTodayToNotes()
                  }}
                  title="Append today's date heading (MM-DD-YYYY:) and focus editor"
                >
                  <Calendar className="h-3 w-3 text-blue-400" />
                  <span>+ Today</span>
                </button>

                {/* Full Screen Button */}
                <button
                  type="button"
                  className="ag-tracker-btn"
                  style={{ padding: "0.1rem 0.45rem", fontSize: "0.7rem", height: "22px" }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenFullScreenTrackerNotes()
                  }}
                  title="Open full screen notes editor"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>Full Screen</span>
                </button>

                {/* Chevron */}
                <div style={{ padding: "2px" }}>
                  {notesExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            </div>

            {notesExpanded && (
              <div style={{ padding: "0.25rem 0.75rem 0.5rem" }}>
                <textarea
                  ref={notesTextareaRef}
                  className="ag-tracker-bottom-notes-textarea"
                  style={{ width: "100%", height: "80px", fontSize: "0.8125rem", resize: "vertical" }}
                  placeholder="General notes for this tracker... (Use '+ Today' to add a dated entry)"
                  value={currentTracker.trackerNotes}
                  onChange={(e) => updateCurrentTracker((tr) => ({ ...tr, trackerNotes: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* PRINT ONLY CLEAN AREA (No per-line Notes) */}
          <div className="ag-tracker-print-area" style={{ display: "none" }}>
            <div className="ag-tracker-print-header">
              <span className="ag-tracker-print-title">AG Account Tracker</span>
              <span className="ag-tracker-print-appname">App Name: {currentTracker.appName || "_______________________"}</span>
            </div>
            <table className="ag-tracker-print-table">
              <thead>
                <tr>
                  <th className="ag-tracker-print-th" style={{ width: "15%" }}>Row</th>
                  <th className="ag-tracker-print-th" style={{ width: "12%" }}>Agent</th>
                  <th className="ag-tracker-print-th" style={{ width: "23%" }}>Google Account</th>
                  <th className="ag-tracker-print-th" style={{ width: "25%" }}>Used On / Status</th>
                  <th className="ag-tracker-print-th" style={{ width: "25%" }}>Next Available</th>
                </tr>
              </thead>
              <tbody>
                {currentTracker.rows.map((row) =>
                  row.lines.map((line, lIdx) => (
                    <tr key={line.id}>
                      {lIdx === 0 && (
                        <td className="ag-tracker-print-td" rowSpan={row.lines.length} style={{ fontWeight: "bold", verticalAlign: "middle" }}>
                          {row.label}
                        </td>
                      )}
                      <td className="ag-tracker-print-td">{line.agent || "—"}</td>
                      <td className="ag-tracker-print-td">{line.googleAccount || "—"}</td>
                      <td className="ag-tracker-print-td">
                        {formatDisplayDateTime(line.usedOn) || "—"}{" "}
                        {line.status && `[${line.status}]`}{" "}
                        {line.usedOn && dayChip(line.usedOn) ? `(${dayChip(line.usedOn)})` : ""}
                      </td>
                      <td className="ag-tracker-print-td">
                        {formatDisplayDateTime(line.nextAvailable) || "—"}{" "}
                        {line.nextAvailable && readyChip(line.nextAvailable).label !== "—" ? `[${readyChip(line.nextAvailable).label}]` : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {currentTracker.trackerNotes && (
              <div className="ag-tracker-print-notes-section">
                <div className="ag-tracker-print-notes-title">Tracker Notes:</div>
                <div className="ag-tracker-print-notes-text">{currentTracker.trackerNotes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Status Popup Menu */}
      {statusMenu && (
        <StatusPopupMenu
          pos={statusMenu.pos}
          currentStatus={statusMenu.currentStatus}
          onSelect={(status) => {
            handleStatusChangeWithRules(statusMenu.rIdx, statusMenu.agentName, status)
          }}
          onClose={() => setStatusMenu(null)}
        />
      )}

      {/* Date Edit Popover */}
      {dateEditPopover && (
        <DateEditPopover
          field={dateEditPopover.field}
          initialVal={dateEditPopover.initialVal}
          pos={dateEditPopover.pos}
          onSave={(val) => handleSaveDateEdit(dateEditPopover.rIdx, dateEditPopover.agentName, dateEditPopover.field, val)}
          onClose={() => setDateEditPopover(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════
          QUICK LOG POPUP
      ══════════════════════════════════════════════════ */}
      {quickLogOpen && (
        <div className="ag-tracker-modal-dialog-overlay" onClick={() => setQuickLogOpen(false)}>
          <div className={`ag-quick-log-card journal-theme-${theme}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="ag-tracker-modal-dialog-header">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                Quick Log Account Status
              </h3>
              <button type="button" className="ag-tracker-btn ag-tracker-btn-icon" onClick={() => setQuickLogOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Select Account:</label>
                <select className="ag-tracker-select font-semibold text-base py-2" value={quickLogAccount} onChange={(e) => setQuickLogAccount(e.target.value)}>
                  {googleAccountOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2.5">
                <button type="button" className="ag-quick-log-btn-big ag-quick-log-btn-green" onClick={() => handleQuickLogStarted(quickLogAccount)}>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span>Started using</span>
                </button>
                <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-red-500/25 bg-red-500/5">
                  <div className="flex items-center gap-2">
                    <button type="button" className="ag-quick-log-btn-big ag-quick-log-btn-red flex-1" onClick={() => handleQuickLogOutOfTokens(quickLogAccount)}>
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span>Out of tokens</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Reset in:</span>
                    <select className="ag-tracker-select text-xs py-1" value={quickLogResetChoice} onChange={(e) => setQuickLogResetChoice(e.target.value)}>
                      <option value="default">{data.options?.accountResetHours?.[quickLogAccount] ?? 24}h (Account Default)</option>
                      <option value="5">5 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                      <option value="72">3 days (72h)</option>
                      <option value="168">7 days (168h)</option>
                      <option value="custom">Custom hours...</option>
                    </select>
                    {quickLogResetChoice === "custom" && (
                      <input type="number" className="ag-tracker-input text-xs w-16 py-1" min="1" value={quickLogCustomHours} onChange={(e) => setQuickLogCustomHours(Number(e.target.value))} />
                    )}
                  </div>
                </div>
                <button type="button" className="ag-quick-log-btn-big ag-quick-log-btn-amber" onClick={() => handleQuickLogRunningLow(quickLogAccount)}>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span>Running low</span>
                </button>
                <button
                  type="button"
                  className="ag-quick-log-btn-big"
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    color: "#a5b4fc",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1rem",
                    borderRadius: "0.375rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => handleQuickLogDone(quickLogAccount)}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" style={{ display: "inline-block" }} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          HISTORY MODAL
      ══════════════════════════════════════════════════ */}
      {historyOpen && (
        <div className="ag-tracker-modal-dialog-overlay" onClick={() => setHistoryOpen(false)}>
          <div className={`ag-tracker-modal-dialog journal-theme-${theme}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="ag-tracker-modal-dialog-header">
              <h3 className="text-base font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-purple-400" />Past Cycle Archives
              </h3>
              <button type="button" className="ag-tracker-btn ag-tracker-btn-icon" onClick={() => setHistoryOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="ag-tracker-modal-dialog-body">
              {historyList.length === 0 ? (
                <div className="text-sm text-gray-500 p-4 text-center">No archived cycles saved yet. Use &quot;New Cycle&quot; to archive and start fresh.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {historyList.map((item, idx) => (
                    <div key={item.id || idx} className="ag-history-item">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{item.archiveFilename || `Cycle ${idx + 1}`}</span>
                        <span className="text-xs text-gray-400">{new Date(item.date).toLocaleString()}</span>
                      </div>
                      <button type="button" className="ag-tracker-btn ag-tracker-btn-primary" onClick={() => handleRestoreSnapshot(item.data)}>Restore</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.1))" }}>
              <button type="button" className="ag-tracker-btn" onClick={() => setHistoryOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          FULL-SCREEN NOTES EDITOR (Tracker Notes)
      ══════════════════════════════════════════════════ */}
      {fullScreenNotes !== null && (
        <div className={`ag-tracker-fullscreen-editor journal-theme-${theme}`} role="dialog" aria-modal="true">
          <div className="ag-tracker-fullscreen-header">
            <h3 className="ag-tracker-fullscreen-title">{fullScreenNotes.title}</h3>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button type="button" className="ag-tracker-btn ag-tracker-btn-primary" onClick={() => setFullScreenNotes(null)}>Done</button>
              <button type="button" className="ag-tracker-btn ag-tracker-btn-icon" onClick={() => setFullScreenNotes(null)} title="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <textarea
            className="ag-tracker-fullscreen-textarea"
            placeholder="Type your detailed notes here..."
            value={fullScreenNotes.value}
            onChange={(e) => {
              const val = e.target.value
              setFullScreenNotes((prev) => (prev ? { ...prev, value: val } : null))
              if (fullScreenNotes.customCallback) fullScreenNotes.customCallback(val)
            }}
            autoFocus
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MANAGE GOOGLE ACCOUNT OPTIONS MODAL
      ══════════════════════════════════════════════════ */}
      {manageOptionsOpen && (
        <div className="ag-tracker-modal-dialog-overlay" onClick={() => setManageOptionsOpen(false)}>
          <div className={`ag-tracker-modal-dialog journal-theme-${theme}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="ag-tracker-modal-dialog-header">
              <h3 className="text-base font-bold">Manage Google Account Options</h3>
              <button type="button" className="ag-tracker-btn ag-tracker-btn-icon" onClick={() => setManageOptionsOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="ag-tracker-modal-dialog-body">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input className="ag-tracker-input" placeholder="Add new Google account option..." value={newOptionInput} onChange={(e) => setNewOptionInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAddCustomGoogleAccount() }} />
                <button type="button" className="ag-tracker-btn ag-tracker-btn-primary" onClick={handleAddCustomGoogleAccount}><Plus className="h-4 w-4" /> Add</button>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">Account Reset Times (Hours until tokens recover):</p>
                <div className="ag-tracker-options-list">
                  {googleAccountOptions.map((opt) => (
                    <div key={opt} className="ag-tracker-option-item">
                      <span className="text-sm font-semibold">{opt}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">Reset:</span>
                        <input type="number" className="ag-tracker-input text-xs w-16 py-1 text-center" min="1" value={data.options?.accountResetHours?.[opt] ?? 24} onChange={(e) => handleUpdateResetHours(opt, Number(e.target.value))} />
                        <span className="text-xs text-gray-400">hrs</span>
                        {!DEFAULT_ROW_LABELS.includes(opt) && (
                          <button type="button" className="ag-tracker-btn ag-tracker-btn-danger ag-tracker-btn-icon ml-1" onClick={() => handleDeleteCustomGoogleAccount(opt)} title="Delete custom option">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.1))" }}>
              <button type="button" className="ag-tracker-btn" onClick={() => setManageOptionsOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS */}
      <AgAccountTrackerReports
        isOpen={reportsOpen}
        onClose={() => setReportsOpen(false)}
        trackers={data.trackers}
        onUpdateAccountData={handleUpdateAccountFromReport}
        theme={theme}
      />

      {/* HELP */}
      <AgAccountTrackerHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} theme={theme} />

      {/* CURRENT APP */}
      <CurrentAppModal isOpen={currentAppOpen} onClose={() => setCurrentAppOpen(false)} theme={theme} />
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
