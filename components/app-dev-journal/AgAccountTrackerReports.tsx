// @ts-nocheck
"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import {
  X,
  Printer,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  AccountTracker,
  LineStatus,
  DEFAULT_ROW_LABELS,
  formatDisplayDateTime,
  dayChip,
} from "./AgAccountTrackerModal"
import AgAccountTrackerHelpModal from "./AgAccountTrackerHelpModal"
import TrackerErrorBoundary from "./TrackerErrorBoundary"

const PREFS_STORAGE_KEY = "slh-ag-report-prefs"
const CARRYOVER_STORAGE_KEY = "slh-ag-tracker-carryover"

interface ReportPrefs {
  usedSort: "newest" | "oldest"
  nextAvailableSort: "soonest" | "latest"
}

function loadReportPrefs(): ReportPrefs {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
  }
  return { usedSort: "newest", nextAvailableSort: "soonest" }
}

function saveReportPrefs(prefs: ReportPrefs) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs))
    } catch {}
  }
}

function loadCarryOverData(): Record<string, any> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CARRYOVER_STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
  }
  return {}
}

function formatTimeSince(isoStr: string, nowMs: number): string {
  const d = new Date(isoStr).getTime()
  if (isNaN(d)) return "—"
  const diffMs = Math.max(0, nowMs - d)
  const mins = Math.floor(diffMs / (60 * 1000))
  if (mins < 1) return "Just now"
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  const days = Math.floor(hours / 24)
  const remHours = hours % 24

  if (days > 0) {
    return `${days}d ${remHours}h ago`
  }
  if (hours > 0) {
    return `${hours}h ${remMins}m ago`
  }
  return `${mins}m ago`
}

function formatTimeRemaining(targetMs: number, nowMs: number): string {
  const diffMs = targetMs - nowMs
  if (diffMs <= 0) return "Ready now"
  const mins = Math.floor(diffMs / (60 * 1000))
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  const days = Math.floor(hours / 24)
  const remHours = hours % 24

  if (days > 0) {
    return `Ready in ${days}d ${remHours}h`
  }
  if (hours > 0) {
    return `Ready in ${hours}h ${remMins}m`
  }
  return `Ready in ${mins}m`
}

export interface AccountReportStat {
  accountName: string
  agents: string[]
  timesUsed: number
  latestUsedIso: string
  latestUsedMs: number
  latestUsedApp: string
  latestLineStatus: LineStatus
  latestNextAvailableIso: string
  latestNextAvailableMs: number
  effectiveNextMs: number
  nextStatusType: "ready" | "amber" | "red" | "none"
  nextStatusLabel: string
  usedAgeType: "green" | "amber" | "red" | "blue"
  notes: string
}

export interface AgAccountTrackerReportsProps {
  isOpen: boolean
  onClose: () => void
  trackers: AccountTracker[]
  onUpdateAccountData?: (
    accountName: string,
    updates: {
      status?: LineStatus
      usedOn?: string
      nextAvailable?: string
      notes?: string
    }
  ) => void
  onOpenNotesEditor?: (title: string, value: string, onSave: (val: string) => void) => void
  theme?: string
}

function AgAccountTrackerReportsInner({
  isOpen,
  onClose,
  trackers,
  onUpdateAccountData,
  onOpenNotesEditor,
  theme: propTheme,
}: AgAccountTrackerReportsProps) {
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
  const [activeTab, setActiveTab] = useState<"used" | "nextAvailable">("used")
  const [prefs, setPrefs] = useState<ReportPrefs>(loadReportPrefs)
  const [nowMs, setNowMs] = useState(Date.now())
  const [displayOrder, setDisplayOrder] = useState<string[]>([])
  const [expandedReportRows, setExpandedReportRows] = useState<Record<string, boolean>>({})
  const [helpOpen, setHelpOpen] = useState(false)

  // Refresh countdowns every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Save prefs on change
  const updatePrefs = (updater: (prev: ReportPrefs) => ReportPrefs) => {
    setPrefs((prev) => {
      const next = updater(prev)
      saveReportPrefs(next)
      return next
    })
  }

  // Aggregate account statistics live across all trackers and carryover
  const { accountStats, hasCarryOverData, currentlyActiveAccount } = useMemo(() => {
    const carryOverMap = loadCarryOverData()
    let foundCarryOver = false

    const accountNamesSet = new Set<string>(DEFAULT_ROW_LABELS)

    for (const acct of Object.keys(carryOverMap)) {
      if (acct) {
        accountNamesSet.add(acct)
        foundCarryOver = true
      }
    }

    for (const tracker of trackers) {
      for (const row of tracker.rows || []) {
        for (const line of row.lines || []) {
          const acct = line.googleAccount?.trim() || row.label?.trim()
          if (acct) accountNamesSet.add(acct)
        }
      }
    }

    let latestActiveAccount = ""
    let latestActiveTime = 0

    const list: AccountReportStat[] = Array.from(accountNamesSet).map((accountName) => {
      let timesUsed = 0
      const agentsSet = new Set<string>()
      let latestUsedIso = ""
      let latestUsedMs = 0
      let latestUsedApp = ""
      let latestLineStatus: LineStatus = ""
      let latestNotes = ""

      let latestNextAvailableIso = ""
      let latestNextAvailableMs = 0

      // Scan trackers
      for (const tracker of trackers) {
        const appName = tracker.appName || tracker.title
        for (const row of tracker.rows || []) {
          for (const line of row.lines || []) {
            const lineAccount = line.googleAccount?.trim() || row.label?.trim()
            if (lineAccount === accountName) {
              if (line.agent?.trim()) {
                agentsSet.add(line.agent.trim())
              }
              if (line.notes && !latestNotes) {
                latestNotes = line.notes
              }
              if (line.usedOn && line.usedOn.trim()) {
                timesUsed++
                const usedTime = new Date(line.usedOn).getTime()
                if (usedTime > latestUsedMs) {
                  latestUsedMs = usedTime
                  latestUsedIso = line.usedOn
                  latestUsedApp = appName
                  latestLineStatus = line.status || ""
                  if (line.notes) latestNotes = line.notes
                }
              } else if (line.status) {
                if (!latestLineStatus) latestLineStatus = line.status
                if (line.notes && !latestNotes) latestNotes = line.notes
              }

              if (line.nextAvailable && line.nextAvailable.trim()) {
                const nextTime = new Date(line.nextAvailable).getTime()
                if (nextTime > latestNextAvailableMs) {
                  latestNextAvailableMs = nextTime
                  latestNextAvailableIso = line.nextAvailable
                }
              }
            }
          }
        }
      }

      // Carryover fallback
      const carry = carryOverMap[accountName]
      if (carry) {
        if (carry.usedOn) {
          const carryUsedMs = new Date(carry.usedOn).getTime()
          if (carryUsedMs > latestUsedMs) {
            latestUsedMs = carryUsedMs
            latestUsedIso = carry.usedOn
            latestUsedApp = carry.appName || "Previous cycle"
            timesUsed++
            if (carry.status && !latestLineStatus) {
              latestLineStatus = carry.status
            }
          }
        }
        if (carry.nextAvailable) {
          const carryNextMs = new Date(carry.nextAvailable).getTime()
          if (carryNextMs > latestNextAvailableMs) {
            latestNextAvailableMs = carryNextMs
            latestNextAvailableIso = carry.nextAvailable
          }
        }
      }

      if (
        (latestLineStatus === "In use" || latestLineStatus === "Low") &&
        latestUsedMs >= latestActiveTime
      ) {
        latestActiveAccount = accountName
        latestActiveTime = latestUsedMs
      }

      // Next status calculations
      let effectiveNextMs = latestNextAvailableMs
      let nextStatusType: "ready" | "amber" | "red" | "none" = "none"
      let nextStatusLabel = "No date set"

      if (latestNextAvailableIso && !isNaN(latestNextAvailableMs)) {
        const diffMs = latestNextAvailableMs - nowMs
        if (diffMs <= 0) {
          nextStatusType = "ready"
          nextStatusLabel = "Ready now"
        } else if (diffMs <= 2 * 60 * 60 * 1000) {
          nextStatusType = "amber"
          nextStatusLabel = formatTimeRemaining(latestNextAvailableMs, nowMs)
        } else {
          nextStatusType = "red"
          nextStatusLabel = formatTimeRemaining(latestNextAvailableMs, nowMs)
        }
      } else {
        effectiveNextMs = 0
        nextStatusType = "ready"
        nextStatusLabel = "Ready now (No timer)"
      }

      let usedAgeType: "green" | "amber" | "red" | "blue" = "blue"
      if (latestUsedIso && !isNaN(latestUsedMs)) {
        const ageHours = (nowMs - latestUsedMs) / (60 * 60 * 1000)
        if (ageHours < 2) {
          usedAgeType = "green"
        } else if (ageHours < 24) {
          usedAgeType = "amber"
        } else {
          usedAgeType = "red"
        }
      } else {
        usedAgeType = "blue"
      }

      return {
        accountName,
        agents: agentsSet.size > 0 ? Array.from(agentsSet) : ["Gemini", "Claude"],
        timesUsed,
        latestUsedIso,
        latestUsedMs,
        latestUsedApp,
        latestLineStatus,
        latestNextAvailableIso,
        latestNextAvailableMs,
        effectiveNextMs,
        nextStatusType,
        nextStatusLabel,
        usedAgeType,
        notes: latestNotes,
      }
    })

    return {
      accountStats: list,
      hasCarryOverData: foundCarryOver,
      currentlyActiveAccount: latestActiveAccount,
    }
  }, [trackers, nowMs])

  // Sorting function
  const computeSortedNames = useCallback(
    (stats: AccountReportStat[], tab: "used" | "nextAvailable", sortPrefs: ReportPrefs) => {
      const copy = [...stats]
      if (tab === "used") {
        copy.sort((a, b) => {
          if (sortPrefs.usedSort === "oldest") {
            return a.latestUsedMs - b.latestUsedMs
          }
          return b.latestUsedMs - a.latestUsedMs
        })
      } else {
        copy.sort((a, b) => {
          if (sortPrefs.nextAvailableSort === "latest") {
            return b.effectiveNextMs - a.effectiveNextMs
          }
          return a.effectiveNextMs - b.effectiveNextMs
        })
      }
      return copy.map((a) => a.accountName)
    },
    []
  )

  // Initialize or recompute display order when tab or sort preferences change
  useEffect(() => {
    setDisplayOrder(computeSortedNames(accountStats, activeTab, prefs))
  }, [activeTab, prefs.usedSort, prefs.nextAvailableSort, computeSortedNames])

  // Re-sort only on blur (after user finishes interacting with an input)
  const handleFieldBlur = useCallback(() => {
    setTimeout(() => {
      setDisplayOrder(computeSortedNames(accountStats, activeTab, prefs))
    }, 250)
  }, [accountStats, activeTab, prefs, computeSortedNames])

  // Map displayOrder to current stats
  const orderedAccounts = useMemo(() => {
    const statMap = new Map(accountStats.map((s) => [s.accountName, s]))
    const ordered: AccountReportStat[] = []
    for (const name of displayOrder) {
      const item = statMap.get(name)
      if (item) ordered.push(item)
    }
    for (const item of accountStats) {
      if (!displayOrder.includes(item.accountName)) {
        ordered.push(item)
      }
    }
    return ordered
  }, [displayOrder, accountStats])

  const readyCount = accountStats.filter((a) => a.nextStatusType === "ready").length
  const waitingCount = accountStats.filter(
    (a) => a.nextStatusType === "amber" || a.nextStatusType === "red"
  ).length

  // Accordion row helpers
  const toggleReportRow = (accountName: string) => {
    setExpandedReportRows((prev) => ({
      ...prev,
      [accountName]: !prev[accountName],
    }))
  }

  const handleExpandAllReportRows = () => {
    const next: Record<string, boolean> = {}
    orderedAccounts.forEach((a) => {
      next[a.accountName] = true
    })
    setExpandedReportRows(next)
  }

  const handleCollapseAllReportRows = () => {
    setExpandedReportRows({})
  }

  // Quick choices for Used On
  const handleUsedOnQuickChoice = (accountName: string, choice: string) => {
    const now = new Date()
    let iso = ""
    if (choice === "now" || choice === "Time-Stamp") {
      iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "today-9am") {
      const d = new Date()
      d.setHours(9, 0, 0, 0)
      iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "yesterday") {
      const d = new Date(Date.now() - 24 * 60 * 60 * 1000)
      d.setHours(9, 0, 0, 0)
      iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "clear") {
      iso = ""
    }
    if (onUpdateAccountData) {
      onUpdateAccountData(accountName, { usedOn: iso })
    }
  }

  // Quick choices for Next Available
  const handleNextAvailableQuickChoice = (accountName: string, choice: string) => {
    const now = new Date()
    let iso = ""
    if (choice === "ready-now") {
      iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "+2h") {
      const d = new Date(now.getTime() + 2 * 3600000)
      iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "+4h") {
      const d = new Date(now.getTime() + 4 * 3600000)
      iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "+5h") {
      const d = new Date(now.getTime() + 5 * 3600000)
      iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "+8h") {
      const d = new Date(now.getTime() + 8 * 3600000)
      iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "+12h") {
      const d = new Date(now.getTime() + 12 * 3600000)
      iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "+24h" || choice === "Time-Stamp") {
      const d = new Date(now.getTime() + 24 * 3600000)
      iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .substring(0, 16)
    } else if (choice === "clear") {
      iso = ""
    }
    if (onUpdateAccountData) {
      onUpdateAccountData(accountName, { nextAvailable: iso })
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  const generatedDateTime = formatDisplayDateTime(
    new Date(nowMs).toISOString().substring(0, 16)
  )

  const renderLineStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-400">—</span>
    if (status === "In use") {
      return <span className="ag-status-badge ag-status-inuse">In use</span>
    }
    if (status === "Low") {
      return <span className="ag-status-badge ag-status-low">Low</span>
    }
    if (status === "Done" || status === "Out") {
      return <span className="ag-status-badge ag-status-done">Done</span>
    }
    return <span className="ag-report-badge ag-report-badge-nodate">{status}</span>
  }

  return (
    <div
      className="ag-report-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="AG Account Tracker Reports"
    >
      <div className={`ag-report-dialog journal-theme-${theme}`} onClick={(e) => e.stopPropagation()}>
        {/* HEADER BAR */}
        <header className="ag-report-header">
          <div className="ag-report-header-left">
            <h2 className="ag-report-title">AG Account Tracker Reports</h2>
            {hasCarryOverData && (
              <span className="ag-report-badge ag-report-badge-blue text-[11px]">
                Includes carried-over data
              </span>
            )}
            <div className="ag-report-tabs">
              <button
                type="button"
                className={`ag-report-tab-btn ${activeTab === "used" ? "active" : ""}`}
                onClick={() => setActiveTab("used")}
              >
                Used Report
              </button>
              <button
                type="button"
                className={`ag-report-tab-btn ${activeTab === "nextAvailable" ? "active" : ""}`}
                onClick={() => setActiveTab("nextAvailable")}
              >
                Next Available Report
                {readyCount > 0 && (
                  <span className="ag-report-tab-badge">{readyCount}</span>
                )}
              </button>
            </div>
          </div>

          <div className="ag-report-header-actions">
            <button
              type="button"
              className="ag-tracker-btn"
              onClick={handlePrintReport}
              title="Print active report"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              type="button"
              className="ag-tracker-btn text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
              onClick={() => setHelpOpen(true)}
              title="Help Guide: Step-by-step process and documentation"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              <span>Help</span>
            </button>
            <button
              type="button"
              className="ag-tracker-btn-icon"
              onClick={onClose}
              title="Close Reports (Esc)"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* PRINT ONLY HEADER (Strictly hidden on screen) */}
        <div className="ag-report-print-header">
          <div>
            <h1 className="text-xl font-bold">
              AG Account Tracker –{" "}
              {activeTab === "used" ? "Used Report" : "Next Available Report"}
            </h1>
            <div className="text-sm text-gray-600">Generated: {generatedDateTime}</div>
            {currentlyActiveAccount && (
              <div
                className="ag-report-print-last-used"
                style={{ fontWeight: "bold", marginTop: "4px" }}
              >
                Currently Using: {currentlyActiveAccount}
              </div>
            )}
          </div>
          <div className="text-right text-xs text-gray-500">
            Total Accounts: {accountStats.length} | Ready Now: {readyCount} | Waiting:{" "}
            {waitingCount}
          </div>
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="ag-report-main">
          {/* COMPACT SUMMARY STRIP */}
          <div className="ag-report-summary-strip">
            <div className="ag-report-stat-card">
              <span className="ag-report-stat-label">Total Accounts</span>
              <span className="ag-report-stat-value">{accountStats.length}</span>
            </div>
            <div className="ag-report-stat-card">
              <span className="ag-report-stat-label">Ready Now</span>
              <span className="ag-report-stat-value text-emerald-400 font-bold">
                {readyCount}
              </span>
            </div>
            <div className="ag-report-stat-card">
              <span className="ag-report-stat-label">Waiting</span>
              <span className="ag-report-stat-value text-amber-400 font-bold">
                {waitingCount}
              </span>
            </div>
            {currentlyActiveAccount && (
              <div className="ag-report-stat-card highlight">
                <span className="ag-report-stat-label">Currently Active</span>
                <span className="ag-report-stat-value ag-report-account-name truncate max-w-[140px]">
                  {currentlyActiveAccount}
                </span>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* TAB 1: USED REPORT                                           */}
          {/* ============================================================ */}
          {activeTab === "used" && (
            <div className="ag-report-tab-content">
              <div className="ag-report-section">
                <div className="ag-report-section-header">
                  <div className="flex items-center gap-3">
                    <h3 className="ag-report-section-title">
                      Used Accounts ({orderedAccounts.length})
                    </h3>
                    {/* ACCORDION EXPAND / COLLAPSE ALL BUTTONS */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        type="button"
                        className="ag-tracker-btn text-xs py-0.5 px-2"
                        onClick={handleExpandAllReportRows}
                        title="Expand all 8 account rows for full editing"
                      >
                        <ChevronDown className="h-3 w-3" />
                        <span>Expand All</span>
                      </button>
                      <button
                        type="button"
                        className="ag-tracker-btn text-xs py-0.5 px-2"
                        onClick={handleCollapseAllReportRows}
                        title="Collapse all 8 account rows"
                      >
                        <ChevronUp className="h-3 w-3" />
                        <span>Collapse All</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 hidden md:inline">
                      Click any row to expand / edit details
                    </span>
                    <button
                      type="button"
                      className="ag-tracker-btn text-xs py-1 px-2.5"
                      onClick={() =>
                        updatePrefs((p) => ({
                          ...p,
                          usedSort: p.usedSort === "newest" ? "oldest" : "newest",
                        }))
                      }
                      title="Toggle newest/oldest first"
                    >
                      <ArrowUpDown className="h-3 w-3" />
                      <span>
                        Sort:{" "}
                        {prefs.usedSort === "newest" ? "Newest First" : "Oldest First"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="ag-report-table-wrap">
                  <table className="ag-report-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36px" }}>#</th>
                        <th style={{ width: "140px" }}>Account</th>
                        <th style={{ width: "110px" }}>Status</th>
                        <th style={{ width: "230px" }}>Used On</th>
                        <th style={{ width: "120px" }}>Time Since</th>
                        <th style={{ width: "230px" }}>Next Available</th>
                        <th style={{ width: "50px", textAlign: "center" }}>Act</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedAccounts.map((acct, idx) => {
                        const isExpanded = Boolean(expandedReportRows[acct.accountName])

                        if (!isExpanded) {
                          // COLLAPSED ACCORDION ROW
                          return (
                            <tr
                              key={acct.accountName}
                              className="ag-report-tr ag-report-tr-collapsed cursor-pointer"
                              onClick={() => toggleReportRow(acct.accountName)}
                              title="Click to expand and edit account"
                            >
                              <td className="text-muted text-xs">{idx + 1}</td>
                              <td className="font-bold text-xs">
                                <div className="flex items-center gap-1.5 ag-report-account-name">
                                  <ChevronDown className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                  <span>{acct.accountName}</span>
                                </div>
                              </td>
                              <td>{renderLineStatusBadge(acct.latestLineStatus)}</td>
                              <td className="text-xs">
                                {acct.latestUsedIso ? (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <span>{formatDisplayDateTime(acct.latestUsedIso)}</span>
                                    {dayChip(acct.latestUsedIso) && (
                                      <span className={`ag-day-chip ${dayChip(acct.latestUsedIso) === "Today" ? "ag-day-today" : "ag-day-yesterday"}`}>
                                        {dayChip(acct.latestUsedIso)}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`ag-report-badge ag-report-badge-${acct.usedAgeType}`}
                                >
                                  {formatTimeSince(acct.latestUsedIso, nowMs)}
                                </span>
                              </td>
                              <td className="text-xs">
                                {acct.latestNextAvailableIso
                                  ? formatDisplayDateTime(acct.latestNextAvailableIso)
                                  : <span className="text-gray-400">—</span>}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  className="ag-tracker-btn text-xs py-0.5 px-1.5 text-blue-400 hover:text-blue-300"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleReportRow(acct.accountName)
                                  }}
                                  title="Expand row"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          )
                        }

                        // EXPANDED ACCORDION ROW (Full In-Place Editor)
                        return (
                          <tr
                            key={acct.accountName}
                            className="ag-report-tr ag-report-tr-expanded bg-blue-500/5"
                          >
                            <td className="text-muted text-xs">{idx + 1}</td>
                            <td className="font-bold text-xs">
                              <div
                                className="flex items-center gap-1.5 ag-report-account-name cursor-pointer"
                                onClick={() => toggleReportRow(acct.accountName)}
                                title="Click to collapse"
                              >
                                <ChevronUp className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                <span>{acct.accountName}</span>
                              </div>
                            </td>

                            {/* Editable Status */}
                            <td>
                              <select
                                aria-label={`Status for ${acct.accountName}`}
                                className="ag-tracker-select text-xs py-0.5 px-1.5"
                                value={acct.latestLineStatus || ""}
                                onChange={(e) => {
                                  if (onUpdateAccountData) {
                                    onUpdateAccountData(acct.accountName, {
                                      status: e.target.value as LineStatus,
                                    })
                                  }
                                }}
                                onBlur={handleFieldBlur}
                              >
                                <option value="">(—)</option>
                                <option value="In use">In use</option>
                                <option value="Low">Low</option>
                                <option value="Done">Done</option>
                              </select>
                            </td>

                            {/* Editable Used On */}
                            <td>
                              <div className="flex items-center gap-1">
                                <select
                                  aria-label="Quick Choice Used On"
                                  className="ag-tracker-select text-xs py-0.5 px-1 w-[80px]"
                                  defaultValue=""
                                  onChange={(e) => {
                                    handleUsedOnQuickChoice(
                                      acct.accountName,
                                      e.target.value
                                    )
                                    e.target.value = ""
                                  }}
                                  onBlur={handleFieldBlur}
                                >
                                  <option value="" disabled>
                                    Quick…
                                  </option>
                                  <option value="now">Now</option>
                                  <option value="today-9am">Today 9am</option>
                                  <option value="yesterday">Yesterday</option>
                                  <option value="clear">Clear</option>
                                </select>
                                <button
                                  type="button"
                                  className="ag-tracker-btn ag-tracker-btn-icon p-1"
                                  onClick={() =>
                                    handleUsedOnQuickChoice(acct.accountName, "now")
                                  }
                                  title="Stamp current time"
                                >
                                  <Zap className="h-3 w-3 text-amber-400" />
                                </button>
                                <input
                                  type="datetime-local"
                                  className="ag-tracker-input text-xs py-0.5 px-1 w-[125px]"
                                  value={acct.latestUsedIso || ""}
                                  onChange={(e) => {
                                    if (onUpdateAccountData) {
                                      onUpdateAccountData(acct.accountName, {
                                        usedOn: e.target.value,
                                      })
                                    }
                                  }}
                                  onBlur={handleFieldBlur}
                                />
                              </div>
                            </td>

                            {/* Time Since Badge */}
                            <td>
                              <span
                                className={`ag-report-badge ag-report-badge-${acct.usedAgeType}`}
                              >
                                {formatTimeSince(acct.latestUsedIso, nowMs)}
                              </span>
                            </td>

                            {/* Editable Next Available */}
                            <td>
                              <div className="flex items-center gap-1">
                                <select
                                  aria-label="Quick Choice Next Available"
                                  className="ag-tracker-select text-xs py-0.5 px-1 w-[80px]"
                                  defaultValue=""
                                  onChange={(e) => {
                                    handleNextAvailableQuickChoice(
                                      acct.accountName,
                                      e.target.value
                                    )
                                    e.target.value = ""
                                  }}
                                  onBlur={handleFieldBlur}
                                >
                                  <option value="" disabled>
                                    Quick…
                                  </option>
                                  <option value="ready-now">Ready now</option>
                                  <option value="+2h">+2 hrs</option>
                                  <option value="+4h">+4 hrs</option>
                                  <option value="+8h">+8 hrs</option>
                                  <option value="+12h">+12 hrs</option>
                                  <option value="+24h">+24 hrs</option>
                                  <option value="clear">Clear</option>
                                </select>
                                <button
                                  type="button"
                                  className="ag-tracker-btn ag-tracker-btn-icon p-1"
                                  onClick={() =>
                                    handleNextAvailableQuickChoice(
                                      acct.accountName,
                                      "+24h"
                                    )
                                  }
                                  title="Set +24h"
                                >
                                  <Clock className="h-3 w-3 text-sky-400" />
                                </button>
                                <input
                                  type="datetime-local"
                                  className="ag-tracker-input text-xs py-0.5 px-1 w-[125px]"
                                  value={acct.latestNextAvailableIso || ""}
                                  onChange={(e) => {
                                    if (onUpdateAccountData) {
                                      onUpdateAccountData(acct.accountName, {
                                        nextAvailable: e.target.value,
                                      })
                                    }
                                  }}
                                  onBlur={handleFieldBlur}
                                />
                              </div>
                            </td>

                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                className="ag-tracker-btn-icon text-gray-400 hover:text-white p-1"
                                onClick={() => toggleReportRow(acct.accountName)}
                                title="Collapse row"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {/* Mobile Card List (< 768px) */}
                  <div className="ag-report-mobile-cards">
                    {orderedAccounts.map((acct, idx) => {
                      const isExpanded = Boolean(expandedReportRows[acct.accountName])

                      return (
                        <div key={acct.accountName} className="ag-report-mobile-card">
                          <div
                            className="ag-report-mobile-card-top cursor-pointer"
                            onClick={() => toggleReportRow(acct.accountName)}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold ag-report-account-name flex items-center gap-1.5">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-blue-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-blue-400" />
                                )}
                                #{idx + 1} {acct.accountName}
                              </span>
                              <span className="text-[11px] text-gray-400 pl-5">
                                Agents: {acct.agents.join(", ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {renderLineStatusBadge(acct.latestLineStatus)}
                              <span
                                className={`ag-report-badge ag-report-badge-${acct.usedAgeType}`}
                              >
                                {formatTimeSince(acct.latestUsedIso, nowMs)}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-300 mt-1 pl-5 flex flex-col gap-1">
                            <div>
                              <span className="text-gray-400">Used On: </span>
                              <span>{acct.latestUsedIso ? formatDisplayDateTime(acct.latestUsedIso) : "—"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-gray-400">Next Available: </span>
                              <span>{acct.latestNextAvailableIso ? formatDisplayDateTime(acct.latestNextAvailableIso) : "—"}</span>
                              {acct.nextStatusLabel && (
                                <span className={`ag-report-badge ag-report-badge-${acct.nextStatusType} text-[10px] py-0 px-1`}>
                                  {acct.nextStatusLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-2.5 pt-2 border-t border-white/10 space-y-2">
                              <div className="ag-report-mobile-card-row">
                                <span className="ag-report-mobile-card-label">Status:</span>
                                <select
                                  className="ag-tracker-select text-sm py-1 px-2 w-auto"
                                  style={{ minHeight: "44px", fontSize: "16px" }}
                                  value={acct.latestLineStatus || ""}
                                  onChange={(e) => {
                                    if (onUpdateAccountData) {
                                      onUpdateAccountData(acct.accountName, {
                                        status: e.target.value as LineStatus,
                                      })
                                    }
                                  }}
                                >
                                  <option value="">(—)</option>
                                  <option value="In use">In use</option>
                                  <option value="Low">Low</option>
                                  <option value="Done">Done</option>
                                </select>
                              </div>

                              <div className="ag-report-mobile-card-row">
                                <span className="ag-report-mobile-card-label">Last Used:</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="datetime-local"
                                    className="ag-tracker-input text-sm py-1 px-2 w-[160px]"
                                    style={{ minHeight: "44px", fontSize: "16px" }}
                                    value={acct.latestUsedIso || ""}
                                    onChange={(e) => {
                                      if (onUpdateAccountData) {
                                        onUpdateAccountData(acct.accountName, {
                                          usedOn: e.target.value,
                                        })
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="ag-tracker-btn ag-tracker-btn-icon"
                                    style={{ minWidth: "44px", minHeight: "44px" }}
                                    onClick={() =>
                                      handleUsedOnQuickChoice(acct.accountName, "now")
                                    }
                                  >
                                    <Zap className="h-4 w-4 text-amber-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: NEXT AVAILABLE REPORT                                 */}
          {/* ============================================================ */}
          {activeTab === "nextAvailable" && (
            <div className="ag-report-tab-content">
              <div className="ag-report-section">
                <div className="ag-report-section-header">
                  <div className="flex items-center gap-3">
                    <h3 className="ag-report-section-title">
                      Next Available Accounts ({orderedAccounts.length})
                    </h3>
                    {/* ACCORDION EXPAND / COLLAPSE ALL BUTTONS */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        type="button"
                        className="ag-tracker-btn text-xs py-0.5 px-2"
                        onClick={handleExpandAllReportRows}
                        title="Expand all 8 account rows for full editing"
                      >
                        <ChevronDown className="h-3 w-3" />
                        <span>Expand All</span>
                      </button>
                      <button
                        type="button"
                        className="ag-tracker-btn text-xs py-0.5 px-2"
                        onClick={handleCollapseAllReportRows}
                        title="Collapse all 8 account rows"
                      >
                        <ChevronUp className="h-3 w-3" />
                        <span>Collapse All</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 hidden md:inline">
                      Click any row to expand / edit details
                    </span>
                    <button
                      type="button"
                      className="ag-tracker-btn text-xs py-1 px-2.5"
                      onClick={() =>
                        updatePrefs((p) => ({
                          ...p,
                          nextAvailableSort:
                            p.nextAvailableSort === "soonest" ? "latest" : "soonest",
                        }))
                      }
                      title="Toggle soonest/latest first"
                    >
                      <ArrowUpDown className="h-3 w-3" />
                      <span>
                        Sort:{" "}
                        {prefs.nextAvailableSort === "soonest"
                          ? "Soonest First"
                          : "Latest First"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="ag-report-table-wrap">
                  <table className="ag-report-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36px" }}>#</th>
                        <th style={{ width: "140px" }}>Account</th>
                        <th style={{ width: "110px" }}>Status</th>
                        <th style={{ width: "230px" }}>Next Available</th>
                        <th style={{ width: "140px" }}>Availability</th>
                        <th style={{ width: "230px" }}>Used On</th>
                        <th style={{ width: "50px", textAlign: "center" }}>Act</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedAccounts.map((acct, idx) => {
                        const isExpanded = Boolean(expandedReportRows[acct.accountName])

                        if (!isExpanded) {
                          // COLLAPSED ACCORDION ROW
                          return (
                            <tr
                              key={acct.accountName}
                              className="ag-report-tr ag-report-tr-collapsed cursor-pointer"
                              onClick={() => toggleReportRow(acct.accountName)}
                              title="Click to expand and edit account"
                            >
                              <td className="text-muted text-xs">{idx + 1}</td>
                              <td className="font-bold text-xs">
                                <div className="flex items-center gap-1.5 ag-report-account-name">
                                  <ChevronDown className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                  <span>{acct.accountName}</span>
                                </div>
                              </td>
                              <td>{renderLineStatusBadge(acct.latestLineStatus)}</td>
                              <td className="text-xs">
                                {acct.latestNextAvailableIso
                                  ? formatDisplayDateTime(acct.latestNextAvailableIso)
                                  : <span className="text-gray-400">—</span>}
                              </td>
                              <td>
                                <span
                                  className={`ag-report-badge ag-report-badge-${acct.nextStatusType}`}
                                >
                                  {acct.nextStatusLabel}
                                </span>
                              </td>
                              <td className="text-xs">
                                {acct.latestUsedIso ? (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <span>{formatDisplayDateTime(acct.latestUsedIso)}</span>
                                    {dayChip(acct.latestUsedIso) && (
                                      <span className={`ag-day-chip ${dayChip(acct.latestUsedIso) === "Today" ? "ag-day-today" : "ag-day-yesterday"}`}>
                                        {dayChip(acct.latestUsedIso)}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  className="ag-tracker-btn text-xs py-0.5 px-1.5 text-blue-400 hover:text-blue-300"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleReportRow(acct.accountName)
                                  }}
                                  title="Expand row"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          )
                        }

                        // EXPANDED ACCORDION ROW (Full In-Place Editor)
                        return (
                          <tr
                            key={acct.accountName}
                            className="ag-report-tr ag-report-tr-expanded bg-blue-500/5"
                          >
                            <td className="text-muted text-xs">{idx + 1}</td>
                            <td className="font-bold text-xs">
                              <div
                                className="flex items-center gap-1.5 ag-report-account-name cursor-pointer"
                                onClick={() => toggleReportRow(acct.accountName)}
                                title="Click to collapse"
                              >
                                <ChevronUp className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                <span>{acct.accountName}</span>
                              </div>
                            </td>

                            {/* Editable Status */}
                            <td>
                              <select
                                aria-label={`Status for ${acct.accountName}`}
                                className="ag-tracker-select text-xs py-0.5 px-1.5"
                                value={acct.latestLineStatus || ""}
                                onChange={(e) => {
                                  if (onUpdateAccountData) {
                                    onUpdateAccountData(acct.accountName, {
                                      status: e.target.value as LineStatus,
                                    })
                                  }
                                }}
                                onBlur={handleFieldBlur}
                              >
                                <option value="">(—)</option>
                                <option value="In use">In use</option>
                                <option value="Low">Low</option>
                                <option value="Done">Done</option>
                              </select>
                            </td>

                            {/* Editable Next Available */}
                            <td>
                              <div className="flex items-center gap-1">
                                <select
                                  aria-label="Quick Choice Next Available"
                                  className="ag-tracker-select text-xs py-0.5 px-1 w-[80px]"
                                  defaultValue=""
                                  onChange={(e) => {
                                    handleNextAvailableQuickChoice(
                                      acct.accountName,
                                      e.target.value
                                    )
                                    e.target.value = ""
                                  }}
                                  onBlur={handleFieldBlur}
                                >
                                  <option value="" disabled>
                                    Quick…
                                  </option>
                                  <option value="ready-now">Ready now</option>
                                  <option value="+2h">+2 hrs</option>
                                  <option value="+4h">+4 hrs</option>
                                  <option value="+8h">+8 hrs</option>
                                  <option value="+12h">+12 hrs</option>
                                  <option value="+24h">+24 hrs</option>
                                  <option value="clear">Clear</option>
                                </select>
                                <button
                                  type="button"
                                  className="ag-tracker-btn ag-tracker-btn-icon p-1"
                                  onClick={() =>
                                    handleNextAvailableQuickChoice(
                                      acct.accountName,
                                      "+24h"
                                    )
                                  }
                                  title="Set +24h"
                                >
                                  <Clock className="h-3 w-3 text-sky-400" />
                                </button>
                                <input
                                  type="datetime-local"
                                  className="ag-tracker-input text-xs py-0.5 px-1 w-[125px]"
                                  value={acct.latestNextAvailableIso || ""}
                                  onChange={(e) => {
                                    if (onUpdateAccountData) {
                                      onUpdateAccountData(acct.accountName, {
                                        nextAvailable: e.target.value,
                                      })
                                    }
                                  }}
                                  onBlur={handleFieldBlur}
                                />
                              </div>
                            </td>

                            {/* Availability Badge */}
                            <td>
                              <span
                                className={`ag-report-badge ag-report-badge-${acct.nextStatusType}`}
                              >
                                {acct.nextStatusLabel}
                              </span>
                            </td>

                            {/* Editable Used On */}
                            <td>
                              <div className="flex items-center gap-1">
                                <select
                                  aria-label="Quick Choice Used On"
                                  className="ag-tracker-select text-xs py-0.5 px-1 w-[80px]"
                                  defaultValue=""
                                  onChange={(e) => {
                                    handleUsedOnQuickChoice(
                                      acct.accountName,
                                      e.target.value
                                    )
                                    e.target.value = ""
                                  }}
                                  onBlur={handleFieldBlur}
                                >
                                  <option value="" disabled>
                                    Quick…
                                  </option>
                                  <option value="now">Now</option>
                                  <option value="today-9am">Today 9am</option>
                                  <option value="yesterday">Yesterday</option>
                                  <option value="clear">Clear</option>
                                </select>
                                <button
                                  type="button"
                                  className="ag-tracker-btn ag-tracker-btn-icon p-1"
                                  onClick={() =>
                                    handleUsedOnQuickChoice(acct.accountName, "now")
                                  }
                                  title="Stamp current time"
                                >
                                  <Zap className="h-3 w-3 text-amber-400" />
                                </button>
                                <input
                                  type="datetime-local"
                                  className="ag-tracker-input text-xs py-0.5 px-1 w-[125px]"
                                  value={acct.latestUsedIso || ""}
                                  onChange={(e) => {
                                    if (onUpdateAccountData) {
                                      onUpdateAccountData(acct.accountName, {
                                        usedOn: e.target.value,
                                      })
                                    }
                                  }}
                                  onBlur={handleFieldBlur}
                                />
                              </div>
                            </td>

                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                className="ag-tracker-btn-icon text-gray-400 hover:text-white p-1"
                                onClick={() => toggleReportRow(acct.accountName)}
                                title="Collapse row"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {/* Mobile Card List (< 768px) */}
                  <div className="ag-report-mobile-cards">
                    {orderedAccounts.map((acct, idx) => {
                      const isExpanded = Boolean(expandedReportRows[acct.accountName])

                      return (
                        <div key={acct.accountName} className="ag-report-mobile-card">
                          <div
                            className="ag-report-mobile-card-top cursor-pointer"
                            onClick={() => toggleReportRow(acct.accountName)}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold ag-report-account-name flex items-center gap-1.5">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-blue-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-blue-400" />
                                )}
                                #{idx + 1} {acct.accountName}
                              </span>
                              <span className="text-[11px] text-gray-400 pl-5">
                                Agents: {acct.agents.join(", ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {renderLineStatusBadge(acct.latestLineStatus)}
                              <span
                                className={`ag-report-badge ag-report-badge-${acct.nextStatusType}`}
                              >
                                {acct.nextStatusLabel}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-300 mt-1 pl-5 flex flex-col gap-1">
                            <div>
                              <span className="text-gray-400">Used On: </span>
                              <span>{acct.latestUsedIso ? formatDisplayDateTime(acct.latestUsedIso) : "—"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-gray-400">Next Available: </span>
                              <span>{acct.latestNextAvailableIso ? formatDisplayDateTime(acct.latestNextAvailableIso) : "—"}</span>
                              {acct.nextStatusLabel && (
                                <span className={`ag-report-badge ag-report-badge-${acct.nextStatusType} text-[10px] py-0 px-1`}>
                                  {acct.nextStatusLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-2.5 pt-2 border-t border-white/10 space-y-2">
                              <div className="ag-report-mobile-card-row">
                                <span className="ag-report-mobile-card-label">Next Available:</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="datetime-local"
                                    className="ag-tracker-input text-sm py-1 px-2 w-[160px]"
                                    style={{ minHeight: "44px", fontSize: "16px" }}
                                    value={acct.latestNextAvailableIso || ""}
                                    onChange={(e) => {
                                      if (onUpdateAccountData) {
                                        onUpdateAccountData(acct.accountName, {
                                          nextAvailable: e.target.value,
                                        })
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="ag-tracker-btn ag-tracker-btn-icon"
                                    style={{ minWidth: "44px", minHeight: "44px" }}
                                    onClick={() =>
                                      handleNextAvailableQuickChoice(
                                        acct.accountName,
                                        "+24h"
                                      )
                                    }
                                  >
                                    <Clock className="h-4 w-4 text-sky-400" />
                                  </button>
                                </div>
                              </div>

                              <div className="ag-report-mobile-card-row">
                                <span className="ag-report-mobile-card-label">Status:</span>
                                <select
                                  className="ag-tracker-select text-sm py-1 px-2 w-auto"
                                  style={{ minHeight: "44px", fontSize: "16px" }}
                                  value={acct.latestLineStatus || ""}
                                  onChange={(e) => {
                                    if (onUpdateAccountData) {
                                      onUpdateAccountData(acct.accountName, {
                                        status: e.target.value as LineStatus,
                                      })
                                    }
                                  }}
                                >
                                  <option value="">(—)</option>
                                  <option value="In use">In use</option>
                                  <option value="Low">Low</option>
                                  <option value="Done">Done</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* HELP GUIDE POPUP MODAL */}
      <AgAccountTrackerHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        theme={theme}
      />
    </div>
  )
}

export default function AgAccountTrackerReports(props: AgAccountTrackerReportsProps) {
  if (!props.isOpen) return null

  return (
    <TrackerErrorBoundary>
      <AgAccountTrackerReportsInner {...props} />
    </TrackerErrorBoundary>
  )
}
