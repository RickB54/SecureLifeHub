"use client"

import React from "react"
import {
  ArrowLeft,
  Edit,
  Pill,
  Clock,
  Calendar,
  User,
  Building2,
  Shield,
  AlertCircle,
  FileText,
  Sparkles,
  Check,
  X,
  ExternalLink,
} from "lucide-react"
import { format } from "date-fns"
import type { DoctorOption, FacilityOption } from "./health-field-helpers"
import { resolveDoctorInfo, resolveFacilityInfo } from "@/lib/health-store"
import type { PillCountEstimate } from "@/lib/pill-count"

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
  onLookupDrug?: (name: string) => void
  onOpenDoctors?: () => void
}

function safeDate(val?: string | null, fmt = "PPP") {
  if (!val) return ""
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return format(d, fmt)
  } catch {
    return val
  }
}

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-2 border-b border-white/5 last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-100 sm:text-right break-words">{value}</span>
    </div>
  )
}

export default function MedicationDetailView({
  medication,
  doctors,
  facilities = [],
  pillIcon,
  isTracked,
  isLowStock,
  pillEstimate,
  currentDose,
  onBack,
  onEdit,
  onRefill,
  onLookupDrug,
  onOpenDoctors,
}: MedicationDetailViewProps) {
  const meta = medication?.item_metadata || {}
  const docInfo = resolveDoctorInfo(
    meta.doctor_id,
    { name: meta.prescribedBy },
    doctors
  )
  const facInfo = resolveFacilityInfo(
    meta.facility_id,
    { name: meta.facility_name || docInfo.location },
    facilities
  )

  const hasClinical = Boolean(
    meta.genericName ||
      meta.drugClass ||
      meta.purpose ||
      meta.sideEffects ||
      meta.interactions ||
      meta.rxInstructions
  )

  const hasSchedule = Boolean(
    meta.frequency ||
      meta.nextDose ||
      meta.startDate ||
      meta.endDate ||
      meta.lastTaken ||
      (Array.isArray(meta.reminders) && meta.reminders.length > 0) ||
      (Array.isArray(meta.takenLog) && meta.takenLog.length > 0) ||
      (Array.isArray(meta.skippedLog) && meta.skippedLog.length > 0)
  )

  const hasCareTeam = Boolean(docInfo.name || facInfo.name || meta.pharmacy)

  const hasNotes = Boolean(meta.notes || meta.aiDrugInfo)

  return (
    <div className="fixed inset-0 z-40 bg-[#121212] text-white flex flex-col overflow-hidden">
      {/* Sticky Compact Header */}
      <header className="sticky top-0 z-10 bg-[#181818]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {onLookupDrug && (
            <button
              type="button"
              onClick={() => onLookupDrug(medication.title)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/25 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI Info</span>
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
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
                  {medication.title}
                </h1>
                {isLowStock && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    <AlertCircle className="h-3 w-3" /> Low Stock
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                {meta.dosage && <span className="text-gray-200 font-medium">{meta.dosage}</span>}
                {meta.dosage && meta.frequency && <span>&bull;</span>}
                {meta.frequency && <span>{meta.frequency}</span>}
                {meta.genericName && (
                  <>
                    <span>&bull;</span>
                    <span className="italic">{meta.genericName}</span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Clinical Overview */}
          {hasClinical && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5" /> Clinical Details
              </h2>
              <DetailRow label="Generic Name" value={meta.genericName} />
              <DetailRow label="Drug Class" value={meta.drugClass} />
              <DetailRow label="Purpose" value={meta.purpose} />
              <DetailRow label="RX Instructions" value={meta.rxInstructions} />
              <DetailRow label="Common Side Effects" value={meta.sideEffects} />
              <DetailRow label="Drug Interactions" value={meta.interactions} />
            </section>
          )}

          {/* Schedule & Dosing */}
          {hasSchedule && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Schedule &amp; Dosing
              </h2>
              <DetailRow label="Frequency" value={meta.frequency} />
              <DetailRow label="Current Dose" value={currentDose} />
              <DetailRow
                label="Next Dose"
                value={meta.nextDose ? safeDate(meta.nextDose, "MMM d, yyyy 'at' h:mm a") : ""}
              />
              {Array.isArray(meta.reminders) && meta.reminders.length > 0 && (
                <DetailRow label="Reminder Times" value={meta.reminders.join(", ")} />
              )}
              <DetailRow
                label="Start Date"
                value={meta.startDate ? safeDate(meta.startDate, "MMM d, yyyy") : ""}
              />
              <DetailRow
                label="End Date"
                value={meta.endDate ? safeDate(meta.endDate, "MMM d, yyyy") : ""}
              />
              <DetailRow
                label="Last Taken"
                value={meta.lastTaken ? safeDate(meta.lastTaken, "MMM d, yyyy 'at' h:mm a") : ""}
              />
              {(meta.takenLog?.length > 0 || meta.skippedLog?.length > 0) && (
                <DetailRow
                  label="Adherence Log"
                  value={
                    <span className="inline-flex items-center gap-3 text-xs">
                      {meta.takenLog?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Check className="h-3.5 w-3.5" /> Taken {meta.takenLog.length}x
                        </span>
                      )}
                      {meta.skippedLog?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <X className="h-3.5 w-3.5" /> Skipped {meta.skippedLog.length}x
                        </span>
                      )}
                    </span>
                  }
                />
              )}
            </section>
          )}

          {/* Prescriber & Pharmacy */}
          {hasCareTeam && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Prescriber &amp; Pharmacy
              </h2>
              {docInfo.name && (
                <DetailRow
                  label="Prescribing Doctor"
                  value={
                    onOpenDoctors ? (
                      <button
                        type="button"
                        onClick={onOpenDoctors}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 cursor-pointer"
                      >
                        <span>{docInfo.name}</span>
                        {docInfo.specialty && (
                          <span className="text-gray-400 no-underline text-xs">({docInfo.specialty})</span>
                        )}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    ) : (
                      docInfo.name
                    )
                  }
                />
              )}
              {facInfo.name && <DetailRow label="Facility" value={facInfo.name} />}
              {facInfo.address && <DetailRow label="Facility Address" value={facInfo.address} />}
              {docInfo.phone && <DetailRow label="Doctor Phone" value={docInfo.phone} />}
              <DetailRow label="Pharmacy" value={meta.pharmacy} />
            </section>
          )}

          {/* Inventory & Refills — ONLY shown when pill tracking is ON */}
          {isTracked && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Inventory &amp; Refills (Estimate)
                </h2>
                {onRefill && (
                  <button
                    type="button"
                    onClick={onRefill}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Refill
                  </button>
                )}
              </div>
              <DetailRow
                label="Estimated Remaining"
                value={`Est. ${pillEstimate?.remaining ?? meta.quantity ?? 0} left`}
              />
              {pillEstimate?.runOutDateStr && (
                <DetailRow
                  label="Estimated Run-Out"
                  value={`Runs out about ${pillEstimate.runOutDateStr}`}
                />
              )}
              <DetailRow label="Pills per Dose" value={`${meta.pillsPerDose ?? 1}`} />
              <DetailRow label="Total Quantity (Bottle)" value={meta.totalQuantity ? `${meta.totalQuantity}` : ""} />
              <DetailRow label="Low-Stock Alert At" value={`≤ ${meta.lowStockThreshold ?? 5}`} />
              <DetailRow
                label="Refill Date"
                value={meta.refillDate ? safeDate(meta.refillDate, "MMM d, yyyy") : ""}
              />
            </section>
          )}

          {/* Notes & AI Info */}
          {hasNotes && (
            <section className="rounded-xl bg-[#1a1a1a] border border-white/10 p-4 space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Notes &amp; Reference
              </h2>
              {meta.notes && (
                <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {meta.notes}
                </p>
              )}
              {meta.aiDrugInfo && (
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-200 space-y-1">
                  <div className="font-semibold text-blue-300">Saved AI Drug Info</div>
                  <p className="whitespace-pre-wrap">{typeof meta.aiDrugInfo === "string" ? meta.aiDrugInfo : JSON.stringify(meta.aiDrugInfo)}</p>
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
