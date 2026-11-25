"use client"

import React from "react"
import {
  ArrowLeft,
  Edit,
  Pill,
  Clock,
  Calendar,
  User,
  Shield,
  AlertCircle,
  FileText,
  Sparkles,
  Check,
  X,
  ExternalLink,
  Trash2,
  Printer,
  FileDown,
} from "lucide-react"
import type { DoctorOption, FacilityOption } from "./health-field-helpers"
import { HealthTooltip } from "./health-tooltip"
import type { PillCountEstimate } from "@/lib/pill-count"
import {
  UNCATEGORIZED_MED_CATEGORY,
  extractNormalizedMedicationData,
  type LabelValueField,
} from "@/lib/medication-export"

interface MedicationDetailViewProps {
  medication: any
  doctors: DoctorOption[]
  facilities?: FacilityOption[]
  pillIcon: React.ReactNode
  isTracked: boolean
  isLowStock: boolean
  pillEstimate?: PillCountEstimate | null
  currentDose: string
  onBack: () => void
  onEdit: () => void
  onRefill?: () => void
  onExport?: () => void
  onLookupDrug?: (name: string) => void
  onOpenDoctors?: () => void
  onDeleteLogEntry?: (logType: "taken" | "skipped", index: number) => void
}

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-2 border-b border-white/5 last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-100 sm:text-right break-words whitespace-pre-wrap">{value}</span>
    </div>
  )
}

function renderFieldRows(
  rows: LabelValueField[],
  overrideRender?: Partial<Record<string, React.ReactNode>>
) {
  return rows.map((row) => (
    <DetailRow
      key={row.key}
      label={row.label}
      value={overrideRender && row.key in overrideRender ? overrideRender[row.key] : row.value}
    />
  ))
}

export default function MedicationDetailView({
  medication,
  doctors,
  facilities = [],
  pillIcon,
  onBack,
  onEdit,
  onRefill,
  onExport,
  onLookupDrug,
  onOpenDoctors,
  onDeleteLogEntry,
}: MedicationDetailViewProps) {
  // Single shared source of fields (identical to Full Details & Quick Reference export)
  const data = extractNormalizedMedicationData(medication, doctors, facilities)
  const safetyList = data.safetyRows(true)

  return (
    <div className="fixed inset-0 z-[100] bg-[#121212] text-white flex flex-col overflow-hidden">
      {/* Sticky Compact Header */}
      <header className="sticky top-0 z-10 bg-[#181818]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <HealthTooltip content="Back to Medications list">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </HealthTooltip>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {onExport && (
            <>
              <HealthTooltip content="Print this medication">
                <button
                  type="button"
                  onClick={onExport}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Print medication"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </HealthTooltip>
              <HealthTooltip content="Export PDF or copy plain text for this medication">
                <button
                  type="button"
                  onClick={onExport}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Export PDF"
                >
                  <FileDown className="h-4 w-4" />
                </button>
              </HealthTooltip>
            </>
          )}
          {onLookupDrug && (
            <HealthTooltip content="Look up clinical uses, side effects, and interactions">
              <button
                type="button"
                onClick={() => onLookupDrug(data.name)}
                aria-label="Look up AI Drug Info"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/25 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Med Info</span>
              </button>
            </HealthTooltip>
          )}
          <HealthTooltip content="Edit medication fields, category, schedule, or pill count">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          </HealthTooltip>
          <HealthTooltip content="Close detail view">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </HealthTooltip>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Top Identity Strip */}
          <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {pillIcon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  {data.name}
                </h1>
                {data.category && data.category !== UNCATEGORIZED_MED_CATEGORY && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {data.category}
                  </span>
                )}
                {data.isLowStock && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    <AlertCircle className="h-3 w-3" /> Low Stock
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                {data.dosage && <span className="text-gray-200 font-medium">{data.dosage}</span>}
                {data.dosage && data.form && <span>&bull;</span>}
                {data.form && <span>{data.form}</span>}
                {(data.dosage || data.form) && data.frequency && <span>&bull;</span>}
                {data.frequency && <span>{data.frequency}</span>}
                {data.genericName && (
                  <>
                    <span>&bull;</span>
                    <span className="italic">{data.genericName}</span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* 1. Medication Overview */}
          {data.overviewRows.length > 0 && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5" /> Medication Overview
              </h2>
              {renderFieldRows(data.overviewRows)}
            </section>
          )}

          {/* 2. Schedule & Dosing */}
          {(data.scheduleRows.length > 0 ||
            data.doseScheduleRows.length > 0 ||
            data.adherenceEntries.length > 0) && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Schedule &amp; Dosing
              </h2>
              {renderFieldRows(data.scheduleRows)}

              {/* Periodic Dose Schedule Table */}
              {data.doseScheduleRows.length > 0 && (
                <div className="pt-3 mt-2 border-t border-white/10 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
                    Periodic Dose Schedule
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {data.doseScheduleRows.map((dr, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-gray-200">{dr.dayLabel}</div>
                          {dr.dateLabel && <div className="text-[10px] text-gray-400">{dr.dateLabel}</div>}
                        </div>
                        <span className="font-bold text-purple-300">{dr.quantityLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adherence Log */}
              {data.adherenceEntries.length > 0 && (
                <div className="pt-3 mt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Adherence Log ({data.adherenceEntries.length})
                    </span>
                    <span className="inline-flex items-center gap-3 text-xs">
                      {data.takenCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Check className="h-3.5 w-3.5" /> Taken {data.takenCount}x
                        </span>
                      )}
                      {data.skippedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <X className="h-3.5 w-3.5" /> Skipped {data.skippedCount}x
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {data.adherenceEntries.map((entry) => (
                      <div
                        key={`${entry.logType}-${entry.index}-${entry.timestamp}`}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                              entry.logType === "taken"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {entry.logType === "taken" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            {entry.logType === "taken" ? "Taken" : "Skipped"}
                          </span>
                          <span className="text-gray-200 truncate">{entry.formattedTime}</span>
                        </div>
                        {onDeleteLogEntry && (
                          <HealthTooltip content="Delete this adherence log entry">
                            <button
                              type="button"
                              onClick={() => onDeleteLogEntry(entry.logType, entry.index)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                              aria-label="Delete log entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </HealthTooltip>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 3. Prescriber & Pharmacy */}
          {data.prescriberPharmacyRows.length > 0 && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Prescriber &amp; Pharmacy
              </h2>
              {renderFieldRows(data.prescriberPharmacyRows, {
                ...(data.doctorName && onOpenDoctors
                  ? {
                      doctor: (
                        <HealthTooltip content="Open provider in My Doctors">
                          <button
                            type="button"
                            onClick={onOpenDoctors}
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 cursor-pointer"
                          >
                            <span>{data.doctorName}</span>
                            {data.doctorSpecialty && (
                              <span className="text-gray-400 no-underline text-xs">
                                ({data.doctorSpecialty})
                              </span>
                            )}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </HealthTooltip>
                      ),
                    }
                  : {}),
              })}
            </section>
          )}

          {/* 4. Inventory & Refills — ONLY shown when pill tracking is ON */}
          {data.isTracked && data.inventoryRows.length > 0 && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Inventory &amp; Refills (Estimate)
                </h2>
                {onRefill && (
                  <HealthTooltip content="Record a refill and reset the remaining pill count baseline to today">
                    <button
                      type="button"
                      onClick={onRefill}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Refill
                    </button>
                  </HealthTooltip>
                )}
              </div>
              {renderFieldRows(data.inventoryRows)}
            </section>
          )}

          {/* 5. Safety, Instructions & Private Notes */}
          {(safetyList.length > 0 || data.medInfoText) && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Safety, Instructions &amp; Notes
              </h2>
              {renderFieldRows(safetyList)}
              {data.medInfoText && (
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-200 space-y-1 mt-2">
                  <div className="font-semibold text-blue-300">Saved Medication Reference Info</div>
                  <p className="whitespace-pre-wrap">{data.medInfoText}</p>
                </div>
              )}
            </section>
          )}

          <div className="flex items-center gap-2 text-[11px] text-gray-400 px-1 pt-1">
            <Shield className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span>Verify with your pharmacist or doctor.</span>
          </div>
        </div>
      </main>
    </div>
  )
}
