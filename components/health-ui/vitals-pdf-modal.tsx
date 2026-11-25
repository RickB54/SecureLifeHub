"use client"

import React, { useState, useEffect, useMemo } from "react"
import { X, FileDown, Printer } from "lucide-react"
import { toast } from "sonner"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"
import { VitalsExportRange, filterEntriesByDateRange } from "@/lib/vitalsLayoutPrefs"
import {
  VITALS_PDF_PREFS_KEY,
  VitalExportBlockInput,
  VitalsPdfOptions,
  downloadVitalsPdf,
  printVitalsReport,
} from "@/lib/vitalsPdfExport"
import { MED_EXPORT_PREFS_KEY } from "@/lib/medication-export"

interface VitalsPdfModalProps {
  isOpen: boolean
  onClose: () => void
  orderedBlocks: VitalExportBlockInput[]
}

export function VitalsPdfModal({ isOpen, onClose, orderedBlocks }: VitalsPdfModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [includeChart, setIncludeChart] = useState(true)
  const [includeReferenceBands, setIncludeReferenceBands] = useState(false)
  const [includeHistoryTable, setIncludeHistoryTable] = useState(true)
  const [range, setRange] = useState<VitalsExportRange>("30d")
  const [patientName, setPatientName] = useState("")
  const [prefsLoaded, setPrefsLoaded] = useState(false)

  // Load saved patient name on mount (localStorage on this device only)
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(VITALS_PDF_PREFS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed?.patientName === "string") setPatientName(parsed.patientName)
      } else {
        const medRaw = window.localStorage.getItem(MED_EXPORT_PREFS_KEY)
        if (medRaw) {
          const medParsed = JSON.parse(medRaw)
          if (typeof medParsed?.patientName === "string") setPatientName(medParsed.patientName)
        }
      }
    } catch {
      // Ignore storage errors
    }
    setPrefsLoaded(true)
  }, [])

  // Persist patientName locally when changed
  useEffect(() => {
    if (!prefsLoaded || typeof window === "undefined") return
    try {
      window.localStorage.setItem(VITALS_PDF_PREFS_KEY, JSON.stringify({ patientName }))
    } catch {
      // Ignore storage errors
    }
  }, [patientName, prefsLoaded])

  // Whenever dialog opens, default selection to "Only vitals with entries"
  useEffect(() => {
    if (!isOpen) return
    const withEntries = orderedBlocks.filter((b) => b.allEntries.length > 0).map((b) => b.id)
    setSelectedIds(withEntries)
    // Default range to 30d when recent entries exist, otherwise "all" so older logs still appear right away
    const anyRecent30 = orderedBlocks.some((b) => filterEntriesByDateRange(b.allEntries, "30d").length > 0)
    setRange(anyRecent30 || withEntries.length === 0 ? "30d" : "all")
  }, [isOpen, orderedBlocks])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  if (!isOpen) return null

  const toggleVital = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const selectAll = () => {
    setSelectedIds(orderedBlocks.map((b) => b.id))
  }

  const selectOnlyWithEntries = () => {
    setSelectedIds(orderedBlocks.filter((b) => b.allEntries.length > 0).map((b) => b.id))
  }

  const buildOptions = (): VitalsPdfOptions => ({
    selectedVitalIds: orderedBlocks.map((b) => b.id).filter((id) => selectedSet.has(id)),
    includeChart,
    includeReferenceBands,
    includeHistoryTable,
    range,
    patientName,
  })

  const handleDownload = () => {
    const opts = buildOptions()
    if (opts.selectedVitalIds.length === 0) {
      toast.error("Select at least one vital to include")
      return
    }
    downloadVitalsPdf(orderedBlocks, opts)
    toast.success("Vital Signs Report PDF downloaded")
  }

  const handlePrint = () => {
    const opts = buildOptions()
    if (opts.selectedVitalIds.length === 0) {
      toast.error("Select at least one vital to include")
      return
    }
    printVitalsReport(orderedBlocks, opts)
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92dvh] flex flex-col bg-[#141418] border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <FileDown className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold">Save / Print Vital Signs Report</h3>
            <FieldHelpPopover
              title="Vital Signs Report (PDF & Print)"
              content="Generates a Letter-size report directly in your browser with zero server calls. Vitals appear in your arranged order, with dates formatted without timezone shifts."
            />
          </div>
          <HealthTooltip content="Close">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Vital Signs PDF dialog"
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </HealthTooltip>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* 1. Vitals Checklist */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Vitals to include ({selectedIds.length}/{orderedBlocks.length})
              </span>
              <div className="flex items-center gap-1.5">
                <HealthTooltip content="Check only vitals that have at least one logged entry">
                  <button
                    type="button"
                    onClick={selectOnlyWithEntries}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 cursor-pointer"
                  >
                    Only vitals with entries
                  </button>
                </HealthTooltip>
                <HealthTooltip content="Check all vitals">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 cursor-pointer"
                  >
                    Select all
                  </button>
                </HealthTooltip>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {orderedBlocks.map((b) => {
                const checked = selectedSet.has(b.id)
                const rangeCount = filterEntriesByDateRange(b.allEntries, range).length
                return (
                  <label
                    key={b.id}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      checked
                        ? "bg-blue-500/15 border-blue-500/40 text-white"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVital(b.id)}
                        className="h-3.5 w-3.5 rounded border-gray-600 bg-black/60 text-blue-500 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <span className="font-semibold truncate">{b.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 shrink-0">
                      {b.allEntries.length === 0 ? "0" : rangeCount}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 2. Report Options */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-300">Report options</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChart}
                  onChange={(e) => setIncludeChart(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-black/60 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <span>Include line chart</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeReferenceBands}
                  onChange={(e) => setIncludeReferenceBands(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-black/60 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <span>Include reference bands</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={includeHistoryTable}
                  onChange={(e) => setIncludeHistoryTable(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-black/60 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <span>Include history table (date, value, context)</span>
              </label>
            </div>

            {/* Date range for chart & history table */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-gray-300 font-medium">Date range</span>
              <div
                role="group"
                aria-label="Report date range"
                className="inline-flex rounded-lg border border-white/15 bg-black/50 p-0.5"
              >
                {(
                  [
                    { id: "30d", label: "Last 30 days" },
                    { id: "90d", label: "Last 90 days" },
                    { id: "all", label: "All" },
                  ] as const
                ).map((opt) => (
                  <HealthTooltip key={opt.id} content={`Include readings from ${opt.label.toLowerCase()}`}>
                    <button
                      type="button"
                      onClick={() => setRange(opt.id)}
                      aria-pressed={range === opt.id}
                      className={`px-2.5 h-7 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        range === opt.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </HealthTooltip>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Optional Patient Name */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="vitals-pdf-patient-name" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Patient name (optional)
              </label>
              <span className="text-[10px] text-gray-500">Remembered on this device</span>
            </div>
            <input
              id="vitals-pdf-patient-name"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full h-9 px-3 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 bg-black/30 flex flex-wrap items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <HealthTooltip content="Open a print-ready Letter view in your browser">
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handlePrint}
              className="h-9 px-3.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
          </HealthTooltip>
          <HealthTooltip content="Download Letter-size Vital Signs Report PDF">
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleDownload}
              className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          </HealthTooltip>
        </div>
      </div>
    </div>
  )
}
