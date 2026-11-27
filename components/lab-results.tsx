"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  FileText,
  TrendingUp,
  Loader2,
  Info,
  HelpCircle,
  GitCompare,
  Calendar,
  User,
  RefreshCw,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"
import { useAuth } from "./auth-provider"
import {
  LAB_DISCLAIMER,
  LabDraft,
  LabExplanation,
  LabFlagStatus,
  LabReport,
  LabResultRow,
  LabTestAlias,
  LabTrendPoint,
} from "@/lib/lab-results-types"
import {
  deleteLabReport,
  fetchAllLabTrends,
  fetchLabAliases,
  fetchLabDrafts,
  fetchLabExplanation,
  fetchLabReportResults,
  fetchLabReportsPage,
  getOriginalLabFileSignedUrl,
} from "@/lib/lab-results-api"
import { parseComparatorAndNumber } from "@/lib/lab-results-rules"
import { VitalsSparkline } from "./health-ui/vitals-sparkline"
import { VITAL_TONE_STYLES } from "@/lib/vitalsReference"
import { LabUploadReview } from "./health-ui/lab-upload-review"
import { HealthTooltip } from "./health-ui/health-tooltip"

interface LabResultsPageProps {
  theme?: string
  onOpenHelp?: (targetId?: string) => void
  vitalsContext?: { latestBp?: string | null; latestBmi?: string | null }
  syncGlucoseToVital?: (entry: {
    value: string
    unit: string
    date: string
    context: string
    notes: string
  }) => Promise<void>
  onLabsChanged?: () => void
}

function getFlagBadgeStyle(status: LabFlagStatus, isBorderline: boolean) {
  if (status === "critical") return { label: "CRITICAL", className: VITAL_TONE_STYLES.red.chip }
  if (status === "high") return { label: "HIGH", className: VITAL_TONE_STYLES.orange.chip }
  if (status === "low") return { label: "LOW", className: VITAL_TONE_STYLES.orange.chip }
  if (status === "needs_review") return { label: "NEEDS REVIEW", className: VITAL_TONE_STYLES.yellow.chip }
  if (isBorderline) return { label: "BORDERLINE", className: VITAL_TONE_STYLES.yellow.chip }
  return { label: "NORMAL", className: VITAL_TONE_STYLES.green.chip }
}

function formatDistanceOutside(row: LabResultRow): string | null {
  if (row.value_numeric === null) return null
  if ((row.flag_status === "high" || row.flag_status === "critical") && row.reference_high !== null && row.value_numeric > row.reference_high) {
    const diff = Math.round((row.value_numeric - row.reference_high) * 100) / 100
    return `+${diff}${row.unit ? ` ${row.unit}` : ""} above range`
  }
  if ((row.flag_status === "low" || row.flag_status === "critical") && row.reference_low !== null && row.value_numeric < row.reference_low) {
    const diff = Math.round((row.reference_low - row.value_numeric) * 100) / 100
    return `-${diff}${row.unit ? ` ${row.unit}` : ""} below range`
  }
  return null
}

export default function LabResultsPage({
  onOpenHelp,
  vitalsContext,
  syncGlucoseToVital,
  onLabsChanged,
}: LabResultsPageProps) {
  const { user } = useAuth()
  const userId = user?.id || ""

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reports, setReports] = useState<LabReport[]>([])
  const [totalReports, setTotalReports] = useState(0)
  const [historyPage, setHistoryPage] = useState(0)
  const PAGE_SIZE = 10

  const [activeReport, setActiveReport] = useState<LabReport | null>(null)
  const [activeResults, setActiveResults] = useState<LabResultRow[]>([])
  const [loadingReportResults, setLoadingReportResults] = useState(false)

  // Compare to prior report
  const [compareReport, setCompareReport] = useState<LabReport | null>(null)
  const [compareResults, setCompareResults] = useState<LabResultRow[]>([])

  // Trends (ONE lightweight query for whole page)
  const [trends, setTrends] = useState<LabTrendPoint[]>([])
  const [trendSearch, setTrendSearch] = useState("")
  const [onlyFlaggedTrends, setOnlyFlaggedTrends] = useState(false)
  const [expandedTrendKey, setExpandedTrendKey] = useState<string | null>(null)

  // Drafts & Aliases
  const [drafts, setDrafts] = useState<LabDraft[]>([])
  const [userAliases, setUserAliases] = useState<LabTestAlias[]>([])

  // UI state: collapsible panels, expanded explanations (lazy loaded), narrative notes
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({})
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})
  const [loadedExplanations, setLoadedExplanations] = useState<Record<string, LabExplanation | null>>({})
  const [loadingExpKey, setLoadingExpKey] = useState<string | null>(null)
  const [showUploadPanel, setShowUploadPanel] = useState(true)

  // Initial single fetch per page visit (no polling, no realtime, no refetch on tab switch)
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    let mounted = true
    const load = async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const [pageRes, trendRows, draftRows, aliasRows] = await Promise.all([
          fetchLabReportsPage(userId, 0, PAGE_SIZE),
          fetchAllLabTrends(userId),
          fetchLabDrafts(userId),
          fetchLabAliases(userId),
        ])
        if (!mounted) return
        setReports(pageRes.reports)
        setTotalReports(pageRes.totalCount)
        setTrends(trendRows)
        setDrafts(draftRows)
        setUserAliases(aliasRows)

        if (pageRes.reports.length > 0) {
          setShowUploadPanel(false)
          const latest = pageRes.reports[0]
          setActiveReport(latest)
          setLoadingReportResults(true)
          const resRows = await fetchLabReportResults(userId, latest.id)
          if (mounted) {
            setActiveResults(resRows)
            const initialOpen: Record<string, boolean> = {}
            resRows.forEach((r) => {
              initialOpen[r.panel_name] = true
            })
            setOpenPanels(initialOpen)
            setLoadingReportResults(false)
          }
        }
      } catch (err: any) {
        if (mounted) setErrorMsg(err?.message || "Could not load lab results.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [userId])

  const openReport = async (rep: LabReport) => {
    setActiveReport(rep)
    setCompareReport(null)
    setCompareResults([])
    setLoadingReportResults(true)
    try {
      const rows = await fetchLabReportResults(userId, rep.id)
      setActiveResults(rows)
      const initialOpen: Record<string, boolean> = {}
      rows.forEach((r) => {
        initialOpen[r.panel_name] = true
      })
      setOpenPanels(initialOpen)
    } catch (err: any) {
      toast.error(err?.message || "Failed to load report results")
    } finally {
      setLoadingReportResults(false)
    }
  }

  const handleCompareToPrior = async (rep: LabReport) => {
    const idx = reports.findIndex((r) => r.id === rep.id)
    const prior = idx >= 0 && idx + 1 < reports.length ? reports[idx + 1] : null
    if (!prior) {
      toast.info("No earlier report available to compare.")
      return
    }
    if (compareReport?.id === prior.id) {
      setCompareReport(null)
      setCompareResults([])
      return
    }
    try {
      const rows = await fetchLabReportResults(userId, prior.id)
      setCompareReport(prior)
      setCompareResults(rows)
      toast.success(`Comparing with ${prior.lab_name} (${prior.date_collected || "Prior"})`)
    } catch (err: any) {
      toast.error(err?.message || "Could not load prior report")
    }
  }

  const handleViewOriginal = async (rep: LabReport) => {
    if (!rep.source_file_path) {
      toast.info("No original file was stored for this report.")
      return
    }
    try {
      const url = await getOriginalLabFileSignedUrl(rep.source_file_path)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err: any) {
      toast.error(err?.message || "Could not generate secure link")
    }
  }

  const handleDeleteReport = async (rep: LabReport) => {
    if (!confirm(`Delete ${rep.lab_name} report (${rep.date_collected || "No date"}) and its stored file?`)) return
    try {
      await deleteLabReport(userId, rep)
      const nextReports = reports.filter((r) => r.id !== rep.id)
      setReports(nextReports)
      setTotalReports((c) => Math.max(0, c - 1))
      if (activeReport?.id === rep.id) {
        if (nextReports.length > 0) openReport(nextReports[0])
        else {
          setActiveReport(null)
          setActiveResults([])
        }
      }
      const nextTrends = await fetchAllLabTrends(userId, true)
      setTrends(nextTrends)
      onLabsChanged?.()
      toast.success("Lab report and stored file deleted.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete report")
    }
  }

  const toggleRowExplanation = async (row: LabResultRow) => {
    const rowId = row.id || `${row.normalized_test_key}-${row.test_name}`
    const willOpen = !expandedRows[rowId]
    setExpandedRows((prev) => ({ ...prev, [rowId]: willOpen }))
    if (willOpen && !(row.normalized_test_key in loadedExplanations) && userId) {
      setLoadingExpKey(row.normalized_test_key)
      const exp = await fetchLabExplanation(userId, row.normalized_test_key)
      setLoadedExplanations((prev) => ({ ...prev, [row.normalized_test_key]: exp }))
      setLoadingExpKey(null)
    }
  }

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 0 || nextPage * PAGE_SIZE >= totalReports) return
    try {
      const res = await fetchLabReportsPage(userId, nextPage, PAGE_SIZE)
      setReports(res.reports)
      setTotalReports(res.totalCount)
      setHistoryPage(nextPage)
    } catch (err: any) {
      toast.error(err?.message || "Failed to load page")
    }
  }

  // Group active report results by panel
  const resultsByPanel = useMemo(() => {
    const map = new Map<string, LabResultRow[]>()
    for (const r of activeResults) {
      const arr = map.get(r.panel_name) || []
      arr.push(r)
      map.set(r.panel_name, arr)
    }
    return Array.from(map.entries())
  }, [activeResults])

  const flaggedInReport = useMemo(
    () =>
      activeResults.filter(
        (r) => r.flag_status === "critical" || r.flag_status === "high" || r.flag_status === "low"
      ),
    [activeResults]
  )

  const borderlineInReport = useMemo(
    () => activeResults.filter((r) => r.is_borderline && r.flag_status === "normal"),
    [activeResults]
  )

  const compareMap = useMemo(() => {
    const m = new Map<string, LabResultRow>()
    for (const r of compareResults) m.set(r.normalized_test_key, r)
    return m
  }, [compareResults])

  // Group trend points by normalized_test_key (detect unit mismatches cleanly)
  const trendCards = useMemo(() => {
    const map = new Map<string, LabTrendPoint[]>()
    for (const pt of trends) {
      const arr = map.get(pt.normalized_test_key) || []
      arr.push(pt)
      map.set(pt.normalized_test_key, arr)
    }

    const q = trendSearch.trim().toLowerCase()
    return Array.from(map.entries())
      .map(([key, pts]) => {
        const sorted = [...pts].sort((a, b) => (a.date_collected || "").localeCompare(b.date_collected || ""))
        const latest = sorted[sorted.length - 1]
        const distinctUnits = Array.from(new Set(sorted.map((p) => (p.unit || "").trim()).filter(Boolean)))
        const unitMismatch = distinctUnits.length > 1
        const isFlagged =
          latest.flag_status === "high" || latest.flag_status === "low" || latest.flag_status === "critical"
        return {
          key,
          testName: latest.test_name,
          panelName: latest.panel_name,
          points: sorted,
          latest,
          distinctUnits,
          unitMismatch,
          isFlagged,
        }
      })
      .filter((c) => {
        if (onlyFlaggedTrends && !c.isFlagged) return false
        if (!q) return true
        return (
          c.testName.toLowerCase().includes(q) ||
          c.panelName.toLowerCase().includes(q) ||
          c.key.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (a.isFlagged !== b.isFlagged) return a.isFlagged ? -1 : 1
        return a.testName.localeCompare(b.testName)
      })
  }, [trends, trendSearch, onlyFlaggedTrends])

  if (!userId) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Sign in to view and upload your Lab Results.
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-cyan-400" />
            Lab Results
            {onOpenHelp && (
              <button
                type="button"
                onClick={() => onOpenHelp("lab-results")}
                className="p-1 text-gray-500 hover:text-cyan-400 cursor-pointer"
                title="Lab Results Help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
          </h2>
          <p className="text-xs text-gray-400">
            Upload reports from any lab or paste text. Plain-language explanations, trends, and doctor prep.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadPanel((v) => !v)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          {showUploadPanel ? "Hide Upload / Queue" : `Upload / Add Lab${drafts.length > 0 ? ` (${drafts.length} pending)` : ""}`}
        </button>
      </div>

      {/* Upload, Batch Queue, Paste Text, Manual Entry, & Review Modal */}
      {(showUploadPanel || drafts.length > 0) && (
        <LabUploadReview
          userId={userId}
          drafts={drafts}
          setDrafts={setDrafts}
          userAliases={userAliases}
          onAliasesUpdated={setUserAliases}
          vitalsContext={vitalsContext}
          syncGlucoseToVital={syncGlucoseToVital}
          onReportSaved={async (saved) => {
            const [pageRes, trendRows] = await Promise.all([
              fetchLabReportsPage(userId, 0, PAGE_SIZE),
              fetchAllLabTrends(userId, true),
            ])
            setReports(pageRes.reports)
            setTotalReports(pageRes.totalCount)
            setHistoryPage(0)
            setTrends(trendRows)
            await openReport(saved)
            onLabsChanged?.()
          }}
        />
      )}

      {loading ? (
        <div className="p-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" /> Loading lab results...
        </div>
      ) : errorMsg ? (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : !activeReport ? (
        <div className="p-10 rounded-2xl bg-black border border-dashed border-white/15 text-center space-y-2">
          <FlaskConical className="h-10 w-10 text-gray-600 mx-auto" />
          <p className="text-sm font-bold text-gray-300">No lab reports saved yet</p>
          <p className="text-xs text-gray-500">
            Upload a LabCorp, Quest, or hospital PDF/image above, paste text, or add a result manually.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Report Header Bar */}
          <div className="rounded-2xl bg-black border border-white/15 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">{activeReport.lab_name}</h3>
                {activeReport.date_collected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300 font-semibold">
                    <Calendar className="h-3 w-3 text-cyan-400" /> Collected {activeReport.date_collected}
                  </span>
                )}
                {activeReport.fasting !== null && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300 font-semibold">
                    Fasting: {activeReport.fasting ? "Yes" : "No"}
                  </span>
                )}
                {activeReport.ordering_physician && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300">
                    <User className="h-3 w-3 text-teal-400" /> {activeReport.ordering_physician}
                  </span>
                )}
              </div>
              {compareReport && (
                <div className="text-[11px] text-cyan-300">
                  Comparing side-by-side against {compareReport.lab_name} ({compareReport.date_collected || "Prior"})
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {reports.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleCompareToPrior(activeReport)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border ${
                    compareReport
                      ? "bg-cyan-600/20 border-cyan-500/40 text-cyan-200"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                  }`}
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  {compareReport ? "Stop Compare" : "Compare to Prior"}
                </button>
              )}
              {activeReport.source_file_path && (
                <button
                  type="button"
                  onClick={() => handleViewOriginal(activeReport)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-blue-400" /> View Original
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDeleteReport(activeReport)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-gray-400 hover:text-red-300 cursor-pointer"
                title="Delete report and original file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 1. SUMMARY CARD */}
          {activeReport.summary_text && (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-cyan-500/30 p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
                  <Sparkles className="h-4 w-4" /> Plain-Language Summary
                </div>
                {activeReport.big_picture_json?.ai_fallback_used && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-semibold text-amber-300">
                    AI explanations are turned off until a Gemini key is added
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-100 leading-relaxed">{activeReport.summary_text}</p>
              <p className="text-[11px] text-gray-500 italic">{LAB_DISCLAIMER}</p>
            </div>
          )}

          {/* 2. BIG PICTURE */}
          {activeReport.big_picture_json && (
            <div className="rounded-2xl bg-black border border-white/15 p-4 sm:p-5 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Big Picture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* What's Good */}
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> What&apos;s Good
                  </div>
                  <ul className="space-y-1 text-xs text-gray-200 list-disc pl-4">
                    {(activeReport.big_picture_json.whats_good || []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                {/* What Needs Attention (Grouped by Body System) */}
                <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/25 space-y-2">
                  <div className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> What Needs Attention
                  </div>
                  {(activeReport.big_picture_json.needs_attention || []).length === 0 ? (
                    <p className="text-xs text-gray-400">No flagged results in this report.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeReport.big_picture_json.needs_attention.map((grp, i) => (
                        <div key={i} className="p-2 rounded-lg bg-black/40 border border-white/10 space-y-1">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{grp.system}</span>
                            {grp.urgent && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${VITAL_TONE_STYLES.red.chip}`}>
                                Contact doctor promptly
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-orange-200">{grp.tests.join(" • ")}</div>
                          <p className="text-[11px] text-gray-400">{grp.why_grouped}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* What to Bring Up With My Doctor */}
                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/25 space-y-2">
                  <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> What to Bring Up With My Doctor
                  </div>
                  <ol className="space-y-1 text-xs text-gray-200 list-decimal pl-4">
                    {(activeReport.big_picture_json.doctor_checklist || []).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                </div>

                {/* Where I Could Improve */}
                <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/25 space-y-2">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> Where I Could Improve (Ask Your Doctor First)
                  </div>
                  <ul className="space-y-1 text-xs text-gray-200 list-disc pl-4">
                    {(activeReport.big_picture_json.where_to_improve || []).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 italic">{LAB_DISCLAIMER}</p>
            </div>
          )}

          {/* 3. NEEDS ATTENTION STRIP */}
          {(flaggedInReport.length > 0 || borderlineInReport.length > 0) && (
            <div className="rounded-2xl bg-black border border-orange-500/30 p-4 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-orange-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Needs Attention ({flaggedInReport.length} flagged
                {borderlineInReport.length > 0 ? `, ${borderlineInReport.length} borderline info` : ""})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {flaggedInReport.map((row) => {
                  const badge = getFlagBadgeStyle(row.flag_status, row.is_borderline)
                  const dist = formatDistanceOutside(row)
                  return (
                    <div
                      key={row.id || row.test_name}
                      className={`p-3 rounded-xl border ${
                        row.flag_status === "critical"
                          ? "bg-red-500/10 border-red-500/35"
                          : "bg-orange-500/10 border-orange-500/30"
                      } space-y-1`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{row.test_name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border shrink-0 ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-base font-black text-white">
                        {row.value_text} <span className="text-xs font-normal text-gray-300">{row.unit}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Range: {row.reference_text || "None"} {dist ? `• ${dist}` : ""}
                      </div>
                    </div>
                  )
                })}
                {borderlineInReport.map((row) => (
                  <div
                    key={row.id || row.test_name}
                    className="p-3 rounded-xl border bg-amber-500/5 border-amber-500/25 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">{row.test_name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${VITAL_TONE_STYLES.yellow.chip}`}>
                        Borderline (Info)
                      </span>
                    </div>
                    <div className="text-base font-black text-white">
                      {row.value_text} <span className="text-xs font-normal text-gray-300">{row.unit}</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Edge of range ({row.reference_text}) — not flagged by lab
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. COLLAPSIBLE PANELS WITH EXPANDABLE "WHAT THIS MEANS" */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">
              Full Report Panels ({activeResults.length} tests)
            </h3>
            {loadingReportResults ? (
              <div className="p-8 rounded-2xl bg-black border border-white/10 text-center text-xs text-gray-400">
                <Loader2 className="h-4 w-4 inline mr-2 animate-spin" /> Loading results...
              </div>
            ) : (
              resultsByPanel.map(([panelName, rows]) => {
                const isOpen = openPanels[panelName] !== false
                const panelFlagged = rows.filter(
                  (r) => r.flag_status === "high" || r.flag_status === "low" || r.flag_status === "critical"
                ).length
                const panelOverview = activeReport.panel_overviews_json?.[panelName]

                return (
                  <div key={panelName} className="rounded-2xl bg-black border border-white/15 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenPanels((prev) => ({ ...prev, [panelName]: !isOpen }))}
                      className="w-full px-4 py-3 flex items-center justify-between gap-2 hover:bg-white/[0.03] cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-white truncate">{panelName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-gray-400">
                          {rows.length} tests
                        </span>
                        {panelFlagged > 0 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${VITAL_TONE_STYLES.orange.chip}`}>
                            {panelFlagged} flagged
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${VITAL_TONE_STYLES.green.chip}`}>
                            All normal
                          </span>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/10">
                        {panelOverview && (
                          <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/10 text-xs text-gray-300">
                            {panelOverview}
                          </div>
                        )}
                        <div className="divide-y divide-white/10">
                          {rows.map((row) => {
                            const rowId = row.id || `${row.normalized_test_key}-${row.test_name}`
                            const badge = getFlagBadgeStyle(row.flag_status, row.is_borderline)
                            const isExpOpen = Boolean(expandedRows[rowId])
                            const isNoteOpen = Boolean(expandedNotes[rowId])
                            const cachedExp = loadedExplanations[row.normalized_test_key]
                            const compareRow = compareMap.get(row.normalized_test_key)
                            const prevValStr = compareRow?.value_text || row.previous_value
                            const prevNum = prevValStr ? parseComparatorAndNumber(prevValStr).value_numeric : null
                            const trendDir =
                              prevNum !== null && row.value_numeric !== null
                                ? row.value_numeric > prevNum
                                  ? "up"
                                  : row.value_numeric < prevNum
                                  ? "down"
                                  : "same"
                                : null

                            return (
                              <div key={rowId} className="p-3.5 space-y-2 hover:bg-white/[0.015]">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs sm:text-sm font-bold text-white">{row.test_name}</span>
                                      {row.calculation_group && (
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-400">
                                          {row.calculation_group.toUpperCase()} variant
                                        </span>
                                      )}
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}>
                                        {badge.label}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                      <span>Range: {row.reference_text || "Not established"}</span>
                                      {prevValStr && (
                                        <span className="inline-flex items-center gap-0.5 text-gray-300">
                                          • Prev: {prevValStr}
                                          {row.previous_date ? ` (${row.previous_date})` : ""}
                                          {trendDir === "up" && <ArrowUpRight className="h-3 w-3 text-amber-400" />}
                                          {trendDir === "down" && <ArrowDownRight className="h-3 w-3 text-emerald-400" />}
                                          {trendDir === "same" && <Minus className="h-3 w-3 text-gray-500" />}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                      <div className="text-sm font-black text-white">
                                        {row.value_text}{" "}
                                        <span className="text-xs font-normal text-gray-400">{row.unit}</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleRowExplanation(row)}
                                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Info className="h-3 w-3" /> What this means
                                    </button>
                                  </div>
                                </div>

                                {/* Collapsed Lab Note / Narrative Interpretation */}
                                {row.notes && (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedNotes((prev) => ({ ...prev, [rowId]: !isNoteOpen }))}
                                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                                    >
                                      {isNoteOpen ? "Hide lab note / interpretation" : "Show lab note / interpretation"}
                                    </button>
                                    {isNoteOpen && (
                                      <div className="mt-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-gray-300 whitespace-pre-wrap">
                                        {row.notes}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Expandable "What this means" (Lazy loaded) */}
                                {isExpOpen && (
                                  <div className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-2 text-xs">
                                    {row.flag_status === "needs_review" ? (
                                      <p className="text-amber-300 font-semibold">
                                        This result needs checking first before an explanation can be shown.
                                      </p>
                                    ) : loadingExpKey === row.normalized_test_key ? (
                                      <div className="text-gray-400 flex items-center gap-2">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading plain-language explanation...
                                      </div>
                                    ) : (
                                      <>
                                        <div>
                                          <span className="font-bold text-cyan-300">What it is: </span>
                                          <span className="text-gray-200">
                                            {cachedExp?.what_it_is ||
                                              `${row.test_name} is a lab measurement that helps your doctor check how this part of your body is working.`}
                                          </span>
                                        </div>
                                        {row.personalized_line && (
                                          <div>
                                            <span className="font-bold text-white">Your result: </span>
                                            <span className="text-gray-200">{row.personalized_line}</span>
                                          </div>
                                        )}
                                        {(row.flag_status !== "normal" || row.is_borderline) && (
                                          <>
                                            {cachedExp?.what_abnormal_means && (
                                              <div>
                                                <span className="font-bold text-orange-300">What this can generally mean: </span>
                                                <span className="text-gray-300">{cachedExp.what_abnormal_means}</span>
                                              </div>
                                            )}
                                            {cachedExp?.factors_discussed && (
                                              <div>
                                                <span className="font-bold text-purple-300">Commonly discussed with doctors: </span>
                                                <span className="text-gray-300">{cachedExp.factors_discussed}</span>
                                              </div>
                                            )}
                                            {Array.isArray(cachedExp?.doctor_questions) && cachedExp!.doctor_questions.length > 0 && (
                                              <div>
                                                <span className="font-bold text-blue-300 block mb-1">Questions to ask your doctor:</span>
                                                <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                                                  {cachedExp!.doctor_questions.map((q, qi) => (
                                                    <li key={qi}>{q}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        <p className="text-[10px] text-gray-500 italic pt-1 border-t border-white/10">
                                          {LAB_DISCLAIMER}
                                          {activeReport.big_picture_json?.ai_fallback_used
                                            ? " • AI explanations are turned off until a Gemini key is added (showing built-in general reference text)."
                                            : ""}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* 5. LAB TRENDS SECTION (ONE lightweight query, Vitals card & flag badge styling) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Lab Trends ({trendCards.length} tests)
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={trendSearch}
                    onChange={(e) => setTrendSearch(e.target.value)}
                    placeholder="Search tests..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyFlaggedTrends}
                    onChange={(e) => setOnlyFlaggedTrends(e.target.checked)}
                    className="rounded border-white/20 bg-white/5"
                  />
                  <span>Show only flagged</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trendCards.map((card) => {
                const badge = getFlagBadgeStyle(card.latest.flag_status, card.latest.is_borderline)
                const numericPts = card.points
                  .filter((p) => p.value_numeric !== null)
                  .map((p) => ({
                    date: p.date_collected || "",
                    value: p.value_numeric as number,
                    source_kind: p.source_kind,
                  }))
                const isExpanded = expandedTrendKey === card.key

                return (
                  <div
                    key={card.key}
                    className={`rounded-2xl bg-black border border-white/15 p-3.5 space-y-2 transition-all ${
                      isExpanded ? "sm:col-span-2 lg:col-span-3 border-cyan-500/40" : "hover:border-white/30"
                    }`}
                  >
                    <div
                      onClick={() => setExpandedTrendKey(isExpanded ? null : card.key)}
                      className="flex items-center justify-between gap-2 cursor-pointer select-none"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black uppercase tracking-wider text-gray-200 truncate">
                          {card.testName}
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-base font-black text-white">{card.latest.value_text}</span>
                          <span className="text-xs text-gray-400">{card.latest.unit}</span>
                          <span className="text-[11px] text-gray-500 ml-1">
                            {card.latest.date_collected || ""}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-gray-500">{card.points.length} pts</span>
                          {card.unitMismatch && (
                            <HealthTooltip content={`Multiple units recorded (${card.distinctUnits.join(", ")}). Values are not converted.`}>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/35">
                                Unit mismatch
                              </span>
                            </HealthTooltip>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {numericPts.length > 0 && !card.unitMismatch && (
                          <VitalsSparkline
                            id={`lab-${card.key}`}
                            points={numericPts.map((p) => ({ value: p.value }))}
                            color={card.isFlagged ? "#f97316" : "#22d3ee"}
                          />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        {card.unitMismatch && (
                          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-xs text-amber-200">
                            Warning: This test appears in different units across reports ({card.distinctUnits.join(", ")}). Values are stored exactly as printed and not converted.
                          </div>
                        )}
                        {numericPts.length > 1 && !card.unitMismatch && (
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={numericPts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                                <YAxis stroke="#666" fontSize={10} domain={["auto", "auto"]} />
                                <RechartsTooltip
                                  contentStyle={{ backgroundColor: "#0b0d12", border: "1px solid #333", borderRadius: "10px", fontSize: "12px" }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={card.isFlagged ? "#f97316" : "#22d3ee"}
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        <div className="space-y-1 text-xs">
                          {[...card.points].reverse().map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0"
                            >
                              <span className="text-gray-400">
                                {p.date_collected || "No date"}
                                {p.source_kind === "previous_column" && (
                                  <span className="ml-1.5 text-[10px] text-cyan-400/80">(from previous-result column)</span>
                                )}
                              </span>
                              <span className="font-bold text-white">
                                {p.value_text} {p.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 6. PAGINATED REPORT HISTORY */}
          <div className="rounded-2xl bg-black border border-white/15 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Report History ({totalReports})
              </h3>
              {totalReports > PAGE_SIZE && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    disabled={historyPage === 0}
                    onClick={() => handlePageChange(historyPage - 1)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 disabled:opacity-40 text-gray-300 cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="text-gray-400">
                    Page {historyPage + 1} of {Math.ceil(totalReports / PAGE_SIZE)}
                  </span>
                  <button
                    type="button"
                    disabled={(historyPage + 1) * PAGE_SIZE >= totalReports}
                    onClick={() => handlePageChange(historyPage + 1)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 disabled:opacity-40 text-gray-300 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="divide-y divide-white/10">
              {reports.map((rep) => {
                const isSelected = activeReport?.id === rep.id
                return (
                  <div
                    key={rep.id}
                    className={`py-2.5 px-2 rounded-xl flex flex-wrap items-center justify-between gap-2 ${
                      isSelected ? "bg-cyan-500/10" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div
                      onClick={() => openReport(rep)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{rep.lab_name}</span>
                        <span className="text-xs text-gray-400">{rep.date_collected || "No date"}</span>
                        <span className="text-[10px] text-gray-500">{rep.total_results_count} tests</span>
                        {rep.flagged_count > 0 ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${VITAL_TONE_STYLES.orange.chip}`}>
                            {rep.flagged_count} flagged
                          </span>
                        ) : (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${VITAL_TONE_STYLES.green.chip}`}>
                            All normal
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openReport(rep)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-gray-200 cursor-pointer"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCompareToPrior(rep)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-cyan-300 cursor-pointer"
                      >
                        Compare
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(rep)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 cursor-pointer"
                        title="Delete report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
