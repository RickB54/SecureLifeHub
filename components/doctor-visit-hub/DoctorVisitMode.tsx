"use client"

import React from "react"
import {
  Printer,
  X,
  Calendar,
  AlertTriangle,
  Pill,
  UserCheck,
  HelpCircle,
  FileCheck2,
  Share2,
  Clock,
  ShieldAlert,
  MapPin,
  CheckCircle2,
} from "lucide-react"
import {
  HealthProfile,
  HealthQuestion,
  HealthLetter,
  HealthReferral,
  HealthVisitSummary,
  DoctorOption,
  VisitOption,
  MedicationSummary,
  formatDateOnly,
} from "./doctor-visit-types"

interface DoctorVisitModeProps {
  onClose: () => void
  profile: HealthProfile
  nextAppt: VisitOption | null
  medications: MedicationSummary[]
  doctors: DoctorOption[]
  questions: HealthQuestion[]
  letters: HealthLetter[]
  referrals: HealthReferral[]
  visitSummaries?: HealthVisitSummary[]
  theme?: string
}

export default function DoctorVisitMode({
  onClose,
  profile,
  nextAppt,
  medications,
  doctors,
  questions,
  letters,
  referrals,
  visitSummaries = [],
  theme = "dark",
}: DoctorVisitModeProps) {
  const handlePrint = () => {
    window.print()
  }

  const unansweredQuestions = questions.filter((q) => !q.answered)
  const answeredQuestions = questions.filter((q) => q.answered)
  const activeLetters = letters.filter((l) => l.status === "needed" || l.status === "requested")
  const activeReferrals = referrals.filter((r) => r.status === "needed" || r.status === "requested" || r.status === "scheduled")

  const apptDateStr = nextAppt?.date
    ? new Date(nextAppt.date).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null

  return (
    <div className="fixed inset-0 z-[100040] bg-black text-white overflow-y-auto overscroll-contain">
      {/* PRINT-ONLY STYLES */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print, .no-print * {
            display: none !important;
          }
          .doctor-visit-print-container {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .doctor-visit-print-container * {
            color: #000000 !important;
            border-color: #cccccc !important;
            box-shadow: none !important;
          }
          .print-section {
            page-break-inside: avoid;
            margin-bottom: 24px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 16px !important;
          }
        }
      `}</style>

      {/* TOP BAR (Hidden on Print) */}
      <header className="sticky top-0 z-30 bg-black/95 border-b border-white/20 px-4 md:px-8 py-3.5 flex items-center justify-between backdrop-blur-md no-print">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
            Visit Mode Active
          </span>
          <span className="hidden sm:inline text-sm text-gray-400 font-medium">
            High Contrast &bull; Large Text &bull; Read-Only
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Exit Visit Mode"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT (Single Scroll) */}
      <main className="doctor-visit-print-container max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-8 pb-24 text-base md:text-lg">
        {/* Title Block for Print / Top */}
        <div className="border-b border-white/20 pb-4">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center justify-between">
            <span>Doctor Visit Summary</span>
            <span className="text-sm font-normal text-gray-400">
              {new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
            </span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">
            Secure Life Hub Patient Overview &bull; Prepared for Consultation
          </p>
        </div>

        {/* 1. NEXT APPOINTMENT (If present) */}
        {nextAppt && (
          <section className="print-section p-6 rounded-2xl bg-zinc-950 border-2 border-blue-500/50 shadow-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-blue-400 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Current / Next Appointment
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Confirmed Visit
              </span>
            </div>

            <div className="text-xl md:text-2xl font-black text-white">
              {nextAppt.doctor || nextAppt.title}
            </div>

            <div className="flex items-center gap-2 text-gray-300 text-base md:text-lg font-semibold">
              <Clock className="h-5 w-5 text-blue-400 shrink-0" />
              <span>{apptDateStr || nextAppt.date}</span>
            </div>

            {nextAppt.location && (
              <div className="flex items-center gap-2 text-gray-300 text-base">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                <span>{nextAppt.location}</span>
              </div>
            )}

            {nextAppt.notes && (
              <div className="mt-2 p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-base">
                <span className="font-bold text-gray-400 block text-xs uppercase mb-1">
                  Visit Purpose / Notes:
                </span>
                {nextAppt.notes}
              </div>
            )}
          </section>
        )}

        {/* 2. CRITICAL ALERTS: ALLERGIES & CONDITIONS */}
        <section className="print-section grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Allergies */}
          <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-rose-500/50 space-y-2">
            <span className="text-xs font-black tracking-widest uppercase text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-400" /> Allergies
            </span>
            <p className="text-xl md:text-2xl font-black text-rose-100">
              {profile.allergies || "No known drug allergies reported"}
            </p>
          </div>

          {/* Conditions */}
          <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-amber-500/50 space-y-2">
            <span className="text-xs font-black tracking-widest uppercase text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-400" /> Medical Conditions
            </span>
            <p className="text-xl md:text-2xl font-black text-amber-100">
              {profile.conditions || "None listed"}
            </p>
          </div>
        </section>

        {/* 3. CURRENT MEDICATIONS */}
        <section className="print-section p-6 rounded-2xl bg-zinc-950 border-2 border-white/20 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-black tracking-widest uppercase text-purple-400 flex items-center gap-2">
              <Pill className="h-4 w-4" /> Current Medications ({medications.length})
            </span>
            <span className="text-xs text-gray-400">Active Prescriptions</span>
          </div>

          {medications.length === 0 ? (
            <p className="text-gray-400 italic text-base">No active medications registered.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {medications.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-white">{m.name}</h4>
                    {m.dose && (
                      <p className="text-base font-semibold text-purple-300">{m.dose}</p>
                    )}
                    {m.instructions && (
                      <p className="text-sm text-gray-400 mt-0.5">{m.instructions}</p>
                    )}
                  </div>
                  {m.frequency && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-semibold text-gray-300 shrink-0">
                      {m.frequency}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. QUESTIONS FOR DOCTOR */}
        <section className="print-section p-6 rounded-2xl bg-zinc-950 border-2 border-indigo-500/50 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-black tracking-widest uppercase text-indigo-400 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> Questions for the Doctor ({unansweredQuestions.length} pending)
            </span>
            <span className="text-xs text-gray-400">Ask During Consultation</span>
          </div>

          {questions.length === 0 ? (
            <p className="text-gray-400 italic text-base">No questions added yet.</p>
          ) : (
            <div className="space-y-3">
              {unansweredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg md:text-xl font-bold text-white">{q.question}</p>
                    {q.doctor_name && (
                      <p className="text-xs text-indigo-300 mt-1">For: {q.doctor_name}</p>
                    )}
                    {q.answer_notes && (
                      <p className="text-sm text-gray-300 mt-1 italic pl-2 border-l-2 border-indigo-500/40">
                        Notes: {q.answer_notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {answeredQuestions.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Already Answered / Resolved ({answeredQuestions.length})
                  </span>
                  <div className="space-y-2 opacity-60">
                    {answeredQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-2.5 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="line-through text-gray-300 font-medium">{q.question}</span>
                          {q.answer_notes && (
                            <p className="text-xs text-gray-400 mt-0.5">Answer: {q.answer_notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 5. CARE TEAM & INSURANCE */}
        <section className="print-section grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insurance & Emergency */}
          <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-white/20 space-y-3">
            <span className="text-xs font-black tracking-widest uppercase text-teal-400 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4" /> Insurance & Emergency
            </span>
            <div className="space-y-2 text-base">
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold block">Insurance Provider:</span>
                <span className="font-bold text-white text-lg">
                  {profile.insurance_provider || "Not specified"}
                </span>
                {profile.insurance_id && (
                  <span className="text-teal-300 text-sm block font-mono">ID: {profile.insurance_id}</span>
                )}
              </div>
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs text-gray-400 uppercase font-bold block">Emergency Contact:</span>
                <span className="font-bold text-white">
                  {profile.emergency_contact_name || "None listed"}
                </span>
                {profile.emergency_contact_phone && (
                  <span className="text-gray-300 block text-sm">
                    {profile.emergency_contact_phone}{" "}
                    {profile.emergency_contact_relation && `(${profile.emergency_contact_relation})`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* My Doctors */}
          <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-white/20 space-y-3">
            <span className="text-xs font-black tracking-widest uppercase text-blue-400 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4" /> Care Team ({doctors.length})
            </span>
            {doctors.length === 0 ? (
              <p className="text-gray-400 italic text-sm">No doctors listed in My Doctors.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {doctors.slice(0, 5).map((d) => (
                  <div key={d.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm">
                    <p className="font-bold text-white">{d.name}</p>
                    <p className="text-xs text-blue-300">{d.specialty || "Primary Care / Specialist"}</p>
                    {d.phone && <p className="text-xs text-gray-400">{d.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. LETTERS & REFERRALS STATUS */}
        {(activeLetters.length > 0 || activeReferrals.length > 0) && (
          <section className="print-section p-6 rounded-2xl bg-zinc-950 border-2 border-white/20 space-y-3">
            <span className="text-xs font-black tracking-widest uppercase text-amber-400 flex items-center gap-1.5">
              <Share2 className="h-4 w-4" /> Pending Letters & Referrals
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeLetters.map((l) => (
                <div key={l.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                  <span className="text-xs font-bold uppercase text-blue-400">Letter: {l.status}</span>
                  <p className="font-bold text-white">{l.doctor_name || "Doctor Letter"}</p>
                  {l.notes && <p className="text-xs text-gray-300 mt-1">{l.notes}</p>}
                </div>
              ))}
              {activeReferrals.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                  <span className="text-xs font-bold uppercase text-purple-400">Referral: {r.status}</span>
                  <p className="font-bold text-white">{r.specialist_name}</p>
                  <p className="text-xs text-purple-200">{r.specialty}</p>
                  {r.reason && <p className="text-xs text-gray-300 mt-1">{r.reason}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. VISIT SUMMARIES (Read-Only) */}
        {visitSummaries.length > 0 && (
          <section className="print-section p-6 rounded-2xl bg-zinc-950 border-2 border-white/20 space-y-4">
            <span className="text-xs font-black tracking-widest uppercase text-blue-400 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4" /> Visit Summaries ({visitSummaries.length})
            </span>
            <div className="space-y-4">
              {visitSummaries.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-base md:text-lg">{s.title}</h3>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>{s.date_type ? `${s.date_type}: ` : ""}{formatDateOnly(s.date)}</span>
                      {s.doctor_name && <span>&bull; Dr. {s.doctor_name}</span>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{s.summary_text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
