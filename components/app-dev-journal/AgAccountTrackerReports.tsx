// @ts-nocheck
"use client"

import React, { useState, useEffect, useMemo } from "react"
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
} from "lucide-react"
import {
  AccountTracker,
  DEFAULT_ROW_LABELS,
  formatDisplayDateTime,
} from "./AgAccountTrackerModal"

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

interface AgAccountTrackerReportsProps {
  isOpen: boolean
  onClose: () => void
  trackers: AccountTracker[]
}

export default function AgAccountTrackerReports({
  isOpen,
  onClose,
  trackers,
}: AgAccountTrackerReportsProps) {
  const [activeTab, setActiveTab] = useState<"used" | "nextAvailable">("used")
  const [prefs, setPrefs] = useState<ReportPrefs>(loadReportPrefs)
  const [nowMs, setNowMs] = useState(Date.now())

  // Refresh live countdown and relative times every 60 seconds
  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 60000)
    return () => clearInterval(timer)
  }, [isOpen])

  // Save prefs on change
  const updatePrefs = (updater: (prev: ReportPrefs) => ReportPrefs) => {
    setPrefs((prev) => {
      const next = updater(prev)
      saveReportPrefs(next)
      return next
    })
  }

  // Aggregate account usage and next available data live across ALL trackers + carryover
  const { accountStats, hasCarryOverData, currentlyActiveAccount } = useMemo(() => {
    const carryOverMap = loadCarryOverData()
    let foundCarryOver = false

    const accountNamesSet = new Set<string>(DEFAULT_ROW_LABELS)

    // Add carryover accounts
    for (const acct of Object.keys(carryOverMap)) {
      if (acct) {
        accountNamesSet.add(acct)
        foundCarryOver = true
      }
    }

    // Gather all distinct accounts from all lines in all trackers
    for (const tracker of trackers) {
      for (const row of tracker.rows || []) {
        for (const line of row.lines || []) {
          const acct = line.googleAccount?.trim() || row.label.trim()
          if (acct) accountNamesSet.add(acct)
        }
      }
    }

    // Find currently active account: latest line with "In use" or "Low" status and no subsequent "Out"
    let latestActiveAccount = ""
    let latestActiveTime = 0

    const list = Array.from(accountNamesSet).map((accountName) => {
      let timesUsed = 0
      let latestUsedIso = ""
      let latestUsedMs = 0
      let latestUsedApp = ""
      let latestLineStatus = ""

      let latestNextAvailableIso = ""
      let latestNextAvailableMs = 0

      // 1. Live lines in current trackers
      for (const tracker of trackers) {
        const appName = tracker.appName || tracker.title
        for (const row of tracker.rows || []) {
          for (const line of row.lines || []) {
            const lineAccount = line.googleAccount?.trim() || row.label.trim()
            if (lineAccount === accountName) {
              // Check Used On
              if (line.usedOn && line.usedOn.trim()) {
                timesUsed++
                const usedTime = new Date(line.usedOn).getTime()
                if (usedTime > latestUsedMs) {
                  latestUsedMs = usedTime
                  latestUsedIso = line.usedOn
                  latestUsedApp = appName
                  latestLineStatus = line.status || ""
                }
              } else if (line.status) {
                // Status set without Used On date
                if (!latestLineStatus) latestLineStatus = line.status
              }

              // Check Next Available (latest across its lines)
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

      // 2. Fall back to carry-over data if no live data or carryover is newer
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
        if (carry.status && !latestLineStatus) {
          latestLineStatus = carry.status
        }
      }

      // Check for currently active (In use or Low, and not Out)
      if (
        (latestLineStatus === "In use" || latestLineStatus === "Low") &&
        latestUsedMs > latestActiveTime
      ) {
        latestActiveTime = latestUsedMs
        latestActiveAccount = accountName
      }

      // Determine readiness status
      let nextStatusType: "ready" | "amber" | "red" | "nodate" = "nodate"
      let nextStatusLabel = "No date set"

      if (latestNextAvailableMs > 0) {
        if (latestNextAvailableMs <= nowMs) {
          nextStatusType = "ready"
          nextStatusLabel = "Ready now"
        } else {
          const diffMs = latestNextAvailableMs - nowMs
          if (diffMs <= 6 * 3600 * 1000) {
            nextStatusType = "amber"
          } else {
            nextStatusType = "red"
          }
          nextStatusLabel = formatTimeRemaining(latestNextAvailableMs, nowMs)
        }
      } else {
        if (timesUsed === 0) {
          nextStatusType = "ready"
          nextStatusLabel = "Ready now"
        } else {
          nextStatusType = "nodate"
          nextStatusLabel = "No date set"
        }
      }

      // Determine Time Since Used color
      let usedAgeType: "green" | "amber" | "red" | "blue" = "blue"
      if (latestUsedMs > 0) {
        const diffUsedHours = (nowMs - latestUsedMs) / (3600 * 1000)
        if (diffUsedHours >= 24) {
          usedAgeType = "green"
        } else if (diffUsedHours >= 6) {
          usedAgeType = "amber"
        } else {
          usedAgeType = "red"
        }
      } else {
        usedAgeType = "blue" // Not yet used
      }

      return {
        accountName,
        timesUsed,
        latestUsedIso,
        latestUsedMs,
        latestUsedApp,
        latestLineStatus,
        latestNextAvailableIso,
        latestNextAvailableMs,
        nextStatusType,
        nextStatusLabel,
        usedAgeType,
      }
    })

    return {
      accountStats: list,
      hasCarryOverData: foundCarryOver,
      currentlyActiveAccount: latestActiveAccount || "None",
    }
  }, [trackers, nowMs])

  // Split into Used and Not Yet Used accounts
  const usedAccounts = useMemo(() => {
    const filtered = accountStats.filter((a) => a.timesUsed > 0)
    return filtered.sort((a, b) => {
      if (prefs.usedSort === "oldest") {
        return a.latestUsedMs - b.latestUsedMs
      }
      return b.latestUsedMs - a.latestUsedMs
    })
  }, [accountStats, prefs.usedSort])

  const notYetUsedAccounts = useMemo(() => {
    const filtered = accountStats.filter((a) => a.timesUsed === 0)
    return filtered.sort((a, b) => a.accountName.localeCompare(b.accountName))
  }, [accountStats])

  // Last used account across everything
  const lastUsedOverall = useMemo(() => {
    let latest: (typeof accountStats)[0] | null = null
    for (const a of accountStats) {
      if (a.latestUsedMs > 0) {
        if (!latest || a.latestUsedMs > latest.latestUsedMs) {
          latest = a
        }
      }
    }
    return latest
  }, [accountStats])

  // Next Available accounts sorted
  const nextAvailableSorted = useMemo(() => {
    const list = [...accountStats]
    return list.sort((a, b) => {
      const aTime = a.latestNextAvailableMs || (a.timesUsed === 0 ? 1 : 9999999999999)
      const bTime = b.latestNextAvailableMs || (b.timesUsed === 0 ? 1 : 9999999999999)
      if (prefs.nextAvailableSort === "latest") {
        return bTime - aTime
      }
      return aTime - bTime
    })
  }, [accountStats, prefs.nextAvailableSort])

  // Next to use recommendation banner
  const nextToUseRecommendation = useMemo(() => {
    // 1. Ready now accounts
    const readyAccounts = accountStats.filter((a) => a.nextStatusType === "ready")
    if (readyAccounts.length > 0) {
      const unusedReady = readyAccounts.filter((a) => a.timesUsed === 0)
      if (unusedReady.length > 0) {
        unusedReady.sort((a, b) => a.accountName.localeCompare(b.accountName))
        return {
          type: "ready",
          text: `Next to use: ${unusedReady[0].accountName}`,
          subtext: "Ready now (Not yet used)",
        }
      }
      readyAccounts.sort((a, b) => a.latestUsedMs - b.latestUsedMs)
      return {
        type: "ready",
        text: `Next to use: ${readyAccounts[0].accountName}`,
        subtext: `Ready now (Last used ${formatTimeSince(readyAccounts[0].latestUsedIso, nowMs)})`,
      }
    }

    // 2. None ready now: find next ready
    const waitingAccounts = accountStats.filter((a) => a.latestNextAvailableMs > nowMs)
    if (waitingAccounts.length > 0) {
      waitingAccounts.sort((a, b) => a.latestNextAvailableMs - b.latestNextAvailableMs)
      const nextOne = waitingAccounts[0]
      return {
        type: "waiting",
        text: `Next ready: ${nextOne.accountName} at ${formatDisplayDateTime(nextOne.latestNextAvailableIso)}`,
        subtext: formatTimeRemaining(nextOne.latestNextAvailableMs, nowMs),
      }
    }

    return {
      type: "none",
      text: "All accounts available",
      subtext: "No pending timers",
    }
  }, [accountStats, nowMs])

  const readyCount = accountStats.filter((a) => a.nextStatusType === "ready").length
  const waitingCount = accountStats.filter(
    (a) => a.nextStatusType === "amber" || a.nextStatusType === "red"
  ).length

  const handlePrintReport = () => {
    window.print()
  }

  if (!isOpen) return null

  const generatedDateTime = formatDisplayDateTime(
    new Date(nowMs).toISOString().substring(0, 16)
  )

  const renderLineStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-500">—</span>
    if (status === "In use") {
      return <span className="ag-status-badge ag-status-inuse">In use</span>
    }
    if (status === "Low") {
      return <span className="ag-status-badge ag-status-low">Low</span>
    }
    if (status === "Out") {
      return <span className="ag-status-badge ag-status-out">Out</span>
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
      <div className="ag-report-dialog" onClick={(e) => e.stopPropagation()}>
        {/* HEADER BAR */}
        <header className="ag-report-header">
          <div className="ag-report-header-left">
            <h2 className="ag-report-title">
              AG Account Tracker Reports
            </h2>
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
              </button>
            </div>
          </div>

          <div className="ag-report-header-actions">
            <button
              type="button"
              className="ag-tracker-btn"
              onClick={handlePrintReport}
              title="Print report in landscape letter format"
            >
              <Printer className="h-4 w-4" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              className="ag-tracker-btn ag-tracker-btn-icon"
              onClick={onClose}
              title="Close reports (Esc)"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* PRINT ONLY HEADER */}
        <div className="ag-report-print-header" style={{ display: "none" }}>
          <div>
            <div className="ag-report-print-title">
              AG Account Tracker – {activeTab === "used" ? "Used Report" : "Next Available Report"}
            </div>
            <div className="ag-report-print-date">Generated: {generatedDateTime}</div>
            <div className="ag-report-print-last-used" style={{ fontWeight: "bold", marginTop: "4px" }}>
              Last Used Account:{" "}
              {lastUsedOverall
                ? `${lastUsedOverall.accountName} (${formatDisplayDateTime(lastUsedOverall.latestUsedIso)})`
                : "None"}
            </div>
            {hasCarryOverData && (
              <div style={{ fontSize: "9pt", fontStyle: "italic", marginTop: "2px" }}>
                * Includes carried-over data from previous cycle
              </div>
            )}
          </div>
        </div>

        {/* REPORT CONTENT BODY */}
        <main className="ag-report-content">
          {/* ============================================================== */}
          {/* TAB 1: USED REPORT                                            */}
          {/* ============================================================== */}
          {activeTab === "used" && (
            <div className="ag-report-tab-content">
              {/* Summary Strip */}
              <div className="ag-report-summary-strip">
                <div className="ag-report-stat-card">
                  <span className="ag-report-stat-label">Used Accounts</span>
                  <span className="ag-report-stat-value text-emerald-400">
                    {usedAccounts.length}
                  </span>
                </div>
                <div className="ag-report-stat-card">
                  <span className="ag-report-stat-label">Not Yet Used</span>
                  <span className="ag-report-stat-value text-blue-400">
                    {notYetUsedAccounts.length}
                  </span>
                </div>
                <div className="ag-report-stat-card" style={{ flex: 1.2 }}>
                  <span className="ag-report-stat-label">Currently Active</span>
                  <div className="ag-report-stat-highlight">
                    {currentlyActiveAccount !== "None" ? (
                      <span className="font-extrabold text-emerald-400 text-lg flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        {currentlyActiveAccount}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">None</span>
                    )}
                  </div>
                </div>
                <div className="ag-report-stat-card" style={{ flex: 1.5 }}>
                  <span className="ag-report-stat-label">Last Used Account</span>
                  <div className="ag-report-stat-highlight">
                    {lastUsedOverall ? (
                      <>
                        <span className="font-bold text-white">
                          {lastUsedOverall.accountName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDisplayDateTime(lastUsedOverall.latestUsedIso)} (
                          {formatTimeSince(lastUsedOverall.latestUsedIso, nowMs)})
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">No usage recorded yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* TABLE 1: USED ACCOUNTS */}
              <div className="ag-report-section">
                <div className="ag-report-section-header">
                  <h3 className="ag-report-section-title">
                    Used Accounts ({usedAccounts.length})
                  </h3>
                  <button
                    type="button"
                    className="ag-tracker-btn"
                    onClick={() =>
                      updatePrefs((p) => ({
                        ...p,
                        usedSort: p.usedSort === "newest" ? "oldest" : "newest",
                      }))
                    }
                    title="Toggle newest/oldest first"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>
                      Sort: {prefs.usedSort === "newest" ? "Newest First" : "Oldest First"}
                    </span>
                  </button>
                </div>

                {usedAccounts.length === 0 ? (
                  <div className="ag-report-empty-state">
                    No usage recorded yet across any accounts.
                  </div>
                ) : (
                  <div className="ag-report-table-wrap">
                    <table className="ag-report-table">
                      <thead>
                        <tr>
                          <th style={{ width: "40px" }}>#</th>
                          <th style={{ width: "18%" }}>Account</th>
                          <th style={{ width: "12%" }}>Status</th>
                          <th style={{ width: "22%" }}>Last Used</th>
                          <th style={{ width: "18%" }}>Time Since Used</th>
                          <th style={{ width: "20%" }}>App / Tracker Name</th>
                          <th style={{ width: "10%", textAlign: "center" }}>Times Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usedAccounts.map((acct, idx) => (
                          <tr key={acct.accountName} className="ag-report-tr">
                            <td className="text-muted">{idx + 1}</td>
                            <td className="font-bold">{acct.accountName}</td>
                            <td>{renderLineStatusBadge(acct.latestLineStatus)}</td>
                            <td>{formatDisplayDateTime(acct.latestUsedIso)}</td>
                            <td>
                              <span
                                className={`ag-report-badge ag-report-badge-${acct.usedAgeType}`}
                              >
                                {formatTimeSince(acct.latestUsedIso, nowMs)}
                              </span>
                            </td>
                            <td>{acct.latestUsedApp || "—"}</td>
                            <td style={{ textAlign: "center", fontWeight: "600" }}>
                              {acct.timesUsed}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile Card List (< 768px) */}
                    <div className="ag-report-mobile-cards">
                      {usedAccounts.map((acct, idx) => (
                        <div key={acct.accountName} className="ag-report-mobile-card">
                          <div className="ag-report-mobile-card-top">
                            <span className="font-bold text-white">
                              #{idx + 1} {acct.accountName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {renderLineStatusBadge(acct.latestLineStatus)}
                              <span
                                className={`ag-report-badge ag-report-badge-${acct.usedAgeType}`}
                              >
                                {formatTimeSince(acct.latestUsedIso, nowMs)}
                              </span>
                            </div>
                          </div>
                          <div className="ag-report-mobile-card-row">
                            <span className="ag-report-mobile-card-label">Last Used:</span>
                            <span>{formatDisplayDateTime(acct.latestUsedIso)}</span>
                          </div>
                          <div className="ag-report-mobile-card-row">
                            <span className="ag-report-mobile-card-label">Used On App:</span>
                            <span>{acct.latestUsedApp || "—"}</span>
                          </div>
                          <div className="ag-report-mobile-card-row">
                            <span className="ag-report-mobile-card-label">Times Used:</span>
                            <span className="font-bold">{acct.timesUsed}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TABLE 2: NOT YET USED (LEFT TO USE) */}
              <div className="ag-report-section">
                <div className="ag-report-section-header">
                  <h3 className="ag-report-section-title">
                    Not Yet Used (Left To Use) ({notYetUsedAccounts.length})
                  </h3>
                </div>

                {notYetUsedAccounts.length === 0 ? (
                  <div className="ag-report-empty-state">
                    All accounts have been used at least once!
                  </div>
                ) : (
                  <div className="ag-report-table-wrap">
                    <table className="ag-report-table">
                      <thead>
                        <tr>
                          <th style={{ width: "45px" }}>#</th>
                          <th style={{ width: "30%" }}>Account</th>
                          <th style={{ width: "20%" }}>Status</th>
                          <th style={{ width: "25%" }}>Availability</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notYetUsedAccounts.map((acct, idx) => (
                          <tr key={acct.accountName} className="ag-report-tr">
                            <td className="text-muted">{idx + 1}</td>
                            <td className="font-bold">{acct.accountName}</td>
                            <td>{renderLineStatusBadge(acct.latestLineStatus)}</td>
                            <td>
                              <span className="ag-report-badge ag-report-badge-blue">
                                Never used
                              </span>
                            </td>
                            <td className="text-muted">Available to be assigned</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile Card List (< 768px) */}
                    <div className="ag-report-mobile-cards">
                      {notYetUsedAccounts.map((acct, idx) => (
                        <div key={acct.accountName} className="ag-report-mobile-card">
                          <div className="ag-report-mobile-card-top">
                            <span className="font-bold text-white">
                              #{idx + 1} {acct.accountName}
                            </span>
                            <span className="ag-report-badge ag-report-badge-blue">
                              Never used
                            </span>
                          </div>
                          <div className="ag-report-mobile-card-row">
                            <span className="ag-report-mobile-card-label">Status:</span>
                            <span>{renderLineStatusBadge(acct.latestLineStatus)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: NEXT AVAILABLE REPORT                                  */}
          {/* ============================================================== */}
          {activeTab === "nextAvailable" && (
            <div className="ag-report-tab-content">
              {/* Summary Strip */}
              <div className="ag-report-summary-strip">
                <div className="ag-report-stat-card">
                  <span className="ag-report-stat-label">Ready Now</span>
                  <span className="ag-report-stat-value text-emerald-400">
                    {readyCount}
                  </span>
                </div>
                <div className="ag-report-stat-card">
                  <span className="ag-report-stat-label">Waiting</span>
                  <span className="ag-report-stat-value text-amber-400">
                    {waitingCount}
                  </span>
                </div>
                <div
                  className="ag-report-stat-card ag-report-recommendation-card"
                  style={{ flex: 2 }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" /> Recommendation
                  </div>
                  <div className="text-sm md:text-base font-extrabold text-white mt-0.5">
                    {nextToUseRecommendation.text}
                  </div>
                  <div className="text-xs text-gray-400">
                    {nextToUseRecommendation.subtext}
                  </div>
                </div>
              </div>

              {/* TABLE: NEXT AVAILABLE ACCOUNTS */}
              <div className="ag-report-section">
                <div className="ag-report-section-header">
                  <h3 className="ag-report-section-title">
                    Next Available Accounts ({nextAvailableSorted.length})
                  </h3>
                  <button
                    type="button"
                    className="ag-tracker-btn"
                    onClick={() =>
                      updatePrefs((p) => ({
                        ...p,
                        nextAvailableSort:
                          p.nextAvailableSort === "soonest" ? "latest" : "soonest",
                      }))
                    }
                    title="Toggle soonest/latest first"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>
                      Sort: {prefs.nextAvailableSort === "soonest" ? "Soonest First" : "Latest First"}
                    </span>
                  </button>
                </div>

                <div className="ag-report-table-wrap">
                  <table className="ag-report-table">
                    <thead>
                      <tr>
                        <th style={{ width: "40px" }}>#</th>
                        <th style={{ width: "20%" }}>Account</th>
                        <th style={{ width: "14%" }}>Status</th>
                        <th style={{ width: "22%" }}>Next Available</th>
                        <th style={{ width: "22%" }}>Availability</th>
                        <th style={{ width: "22%" }}>Last Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nextAvailableSorted.map((acct, idx) => (
                        <tr key={acct.accountName} className="ag-report-tr">
                          <td className="text-muted">{idx + 1}</td>
                          <td className="font-bold">{acct.accountName}</td>
                          <td>{renderLineStatusBadge(acct.latestLineStatus)}</td>
                          <td>
                            {acct.latestNextAvailableIso
                              ? formatDisplayDateTime(acct.latestNextAvailableIso)
                              : "No date set"}
                          </td>
                          <td>
                            <span
                              className={`ag-report-badge ag-report-badge-${acct.nextStatusType}`}
                            >
                              {acct.nextStatusLabel}
                            </span>
                          </td>
                          <td>
                            {acct.latestUsedIso
                              ? `${formatDisplayDateTime(acct.latestUsedIso)} (${formatTimeSince(acct.latestUsedIso, nowMs)})`
                              : "Never used"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Card List (< 768px) */}
                  <div className="ag-report-mobile-cards">
                    {nextAvailableSorted.map((acct, idx) => (
                      <div key={acct.accountName} className="ag-report-mobile-card">
                        <div className="ag-report-mobile-card-top">
                          <span className="font-bold text-white">
                            #{idx + 1} {acct.accountName}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {renderLineStatusBadge(acct.latestLineStatus)}
                            <span
                              className={`ag-report-badge ag-report-badge-${acct.nextStatusType}`}
                            >
                              {acct.nextStatusLabel}
                            </span>
                          </div>
                        </div>
                        <div className="ag-report-mobile-card-row">
                          <span className="ag-report-mobile-card-label">Next Available:</span>
                          <span>
                            {acct.latestNextAvailableIso
                              ? formatDisplayDateTime(acct.latestNextAvailableIso)
                              : "No date set"}
                          </span>
                        </div>
                        <div className="ag-report-mobile-card-row">
                          <span className="ag-report-mobile-card-label">Last Used:</span>
                          <span>
                            {acct.latestUsedIso
                              ? `${formatDisplayDateTime(acct.latestUsedIso)} (${formatTimeSince(acct.latestUsedIso, nowMs)})`
                              : "Never used"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
