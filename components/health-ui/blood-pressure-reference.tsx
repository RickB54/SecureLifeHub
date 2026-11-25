"use client"

import React, { useMemo } from "react"
import { useVitalsProfile } from "@/lib/vitalsProfile"
import { BarChart3, ChevronDown, ChevronUp, AlertTriangle, HelpCircle } from "lucide-react"
import {
  BP_REF,
  BpSex,
  BpGoalCategoryKey,
  getBpAgeGroup,
  classifyAdultBp,
  parseBpReadingValue,
  formatBpReadingShortDate,
} from "@/lib/bpReference"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"


interface BloodPressureReferenceProps {
  isOpen: boolean
  onToggle: () => void
  latestBpRecord?: any
  theme?: string
  onOpenHelp?: () => void
}

interface GoalRow {
  key: BpGoalCategoryKey
  name: string
  rule: string
  dotClass: string
  barClass: string
  activeBorderClass: string
  badgeClass: string
  note?: string
}

const GOAL_CATEGORIES: GoalRow[] = [
  {
    key: "normal",
    name: "Normal",
    rule: "Less than 120 AND less than 80",
    dotClass: "bg-emerald-500",
    barClass: "bg-emerald-500/85",
    activeBorderClass: "border-emerald-500/50 bg-emerald-500/10",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    key: "elevated",
    name: "Elevated",
    rule: "120-129 AND less than 80",
    dotClass: "bg-yellow-400",
    barClass: "bg-yellow-400/85",
    activeBorderClass: "border-yellow-400/50 bg-yellow-400/10",
    badgeClass: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30",
  },
  {
    key: "stage1",
    name: "Stage 1 hypertension",
    rule: "130-139 OR 80-89",
    dotClass: "bg-orange-500",
    barClass: "bg-orange-500/85",
    activeBorderClass: "border-orange-500/50 bg-orange-500/10",
    badgeClass: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  },
  {
    key: "stage2",
    name: "Stage 2 hypertension",
    rule: "140 or higher OR 90 or higher",
    dotClass: "bg-red-500",
    barClass: "bg-red-500/85",
    activeBorderClass: "border-red-500/50 bg-red-500/10",
    badgeClass: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  {
    key: "severe",
    name: "Severe",
    rule: "Higher than 180 and/or higher than 120",
    dotClass: "bg-red-900 ring-1 ring-red-400/60",
    barClass: "bg-red-900",
    activeBorderClass: "border-red-500/70 bg-red-950/60",
    badgeClass: "bg-red-950/90 text-red-200 border-red-500/50",
    note: "Contact your doctor. If you have chest pain, shortness of breath, weakness, vision or speech changes, call emergency services.",
  },
]

interface PercentileScaleBarProps {
  label: string
  stats: { mean: number; p5: number; p25: number; p50: number; p75: number; p95: number }
  scaleMin: number
  scaleMax: number
  accentBandClass: string
  accentTickClass: string
  userValue?: number | null
}

function PercentileScaleBar({
  label,
  stats,
  scaleMin,
  scaleMax,
  accentBandClass,
  accentTickClass,
  userValue,
}: PercentileScaleBarProps) {
  const toPct = (val: number) => {
    const clamped = Math.max(scaleMin, Math.min(scaleMax, val))
    return ((clamped - scaleMin) / (scaleMax - scaleMin)) * 100
  }

  const fullLeft = toPct(stats.p5)
  const fullWidth = Math.max(2, toPct(stats.p95) - fullLeft)
  const midLeft = toPct(stats.p25)
  const midWidth = Math.max(2, toPct(stats.p75) - midLeft)
  const meanPct = toPct(stats.mean)
  const userPct = typeof userValue === "number" && userValue > 0 ? toPct(userValue) : null

  return (
    <div className="space-y-1 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
        <span className="font-semibold text-gray-200">{label}</span>
        <span className="text-gray-400 font-mono text-[10px]">
          Middle {stats.p25}–{stats.p75} · Avg {stats.mean} · Full {stats.p5}–{stats.p95}
        </span>
      </div>
      <HealthTooltip
        content={`${label} (mm Hg) — Usual full range (5th–95th): ${stats.p5}–${stats.p95} · Typical middle range (25th–75th): ${stats.p25}–${stats.p75} · Average: ${stats.mean} (median ${stats.p50})`}
      >
        <div
          className="relative h-4 w-full rounded-full bg-white/[0.04] border border-white/10 overflow-hidden cursor-default"
          role="img"
          aria-label={`${label} typical range bar: usual full range ${stats.p5} to ${stats.p95}, typical middle range ${stats.p25} to ${stats.p75}, average ${stats.mean}`}
        >
          {/* Usual full range (5th-95th) */}
          <div
            className="absolute top-1 bottom-1 rounded-full bg-white/15"
            style={{ left: `${fullLeft}%`, width: `${fullWidth}%` }}
          />
          {/* Typical middle range (25th-75th) */}
          <div
            className={`absolute top-0.5 bottom-0.5 rounded-full ${accentBandClass}`}
            style={{ left: `${midLeft}%`, width: `${midWidth}%` }}
          />
          {/* Average (mean) tick */}
          <div
            className={`absolute top-0 bottom-0 w-0.5 ${accentTickClass}`}
            style={{ left: `${meanPct}%` }}
          />
          {/* Optional user reading dot */}
          {userPct !== null && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-rose-500 shadow"
              style={{ left: `${userPct}%` }}
            />
          )}
        </div>
      </HealthTooltip>
    </div>
  )
}

export function BloodPressureReference({
  isOpen,
  onToggle,
  latestBpRecord,
  theme = "dark",
  onOpenHelp,
}: BloodPressureReferenceProps) {
  // Shared "My Profile" (age & sex) used by every Vitals reference — no separate copies.
  const { profile, updateProfile } = useVitalsProfile()
  const ageInput = profile.age
  const setAgeInput = (age: string) => updateProfile({ age })
  const sex: BpSex = profile.sex === "female" ? "female" : "male"
  const hasSex = profile.sex === "male" || profile.sex === "female"
  const setSex = (next: BpSex) => updateProfile({ sex: next })

  const parsedAge = useMemo(() => {
    const trimmed = ageInput.trim()
    if (trimmed === "") return null
    const num = Number(trimmed)
    if (!Number.isFinite(num)) return null
    return Math.floor(num)
  }, [ageInput])

  const isUnder18 = parsedAge !== null && parsedAge >= 0 && parsedAge < 18
  const isValidAdult = parsedAge !== null && parsedAge >= 18 && parsedAge <= 125

  const latestParsed = useMemo(() => {
    const rawVal = latestBpRecord?.item_metadata?.value
    const coords = parseBpReadingValue(rawVal)
    if (!coords) return null
    const classification = classifyAdultBp(coords.sys, coords.dia)
    const dateLabel = formatBpReadingShortDate(latestBpRecord?.item_metadata?.date)
    return {
      ...coords,
      classification,
      dateLabel,
    }
  }, [latestBpRecord])

  const isLight = theme === "light"

  const adultAgeGroup = isValidAdult && parsedAge !== null ? getBpAgeGroup(parsedAge) : "40-59"
  const typicalRef = BP_REF[sex][adultAgeGroup]
  const activeGoalRow = latestParsed
    ? GOAL_CATEGORIES.find((r) => r.key === latestParsed.classification.key)
    : null

  return (
    <div className={`mt-4 pt-3 border-t ${isLight ? "border-gray-200" : "border-white/10"} min-w-0`}>
      {/* Collapsible Trigger Bar */}
      <div className="flex items-center justify-between gap-2">
        <HealthTooltip
          content={
            isOpen
              ? "Collapse Blood Pressure Reference"
              : "View 2025 AHA/ACC goal categories and typical blood pressure ranges by age & sex"
          }
        >
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className={`flex-1 min-w-0 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
              isOpen
                ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                : isLight
                ? "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-200"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <BarChart3 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span className="text-xs font-bold truncate">Blood Pressure Reference</span>
            </span>
            {isOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            )}
          </button>
        </HealthTooltip>

        {onOpenHelp && (
          <HealthTooltip content="Open Help guide for Blood Pressure Reference">
            <button
              type="button"
              onClick={onOpenHelp}
              aria-label="Blood Pressure Reference Help"
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </HealthTooltip>
        )}
      </div>

      {/* Collapsible Body */}
      {isOpen && (
        <div
          className={`mt-3 rounded-xl border p-3 sm:p-4 space-y-4 min-w-0 overflow-x-hidden ${
            isLight ? "bg-gray-50 border-gray-200 text-gray-900" : "bg-[#0d0d12] border-white/10 text-gray-100"
          }`}
        >
          {/* 1. CONTROLS: Age & Sex (localStorage on this device only) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label htmlFor="bp-ref-age-input" className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Age
                </label>
                <HealthTooltip content="Enter age in years (saved only in this browser). Adult reference applies to ages 18+.">
                  <input
                    id="bp-ref-age-input"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={125}
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value)}
                    className={`w-16 h-8 px-2 rounded-lg border text-xs font-mono font-bold focus:outline-none focus:border-rose-500 ${
                      isLight
                        ? "bg-white border-gray-300 text-gray-900"
                        : "bg-black/60 border-white/15 text-white"
                    }`}
                  />
                </HealthTooltip>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sex</span>
                <div
                  role="group"
                  aria-label="Select sex for typical blood pressure comparison"
                  className="inline-flex rounded-lg border border-white/15 bg-black/50 p-0.5"
                >
                  <HealthTooltip content="Show typical survey readings for adult men">
                    <button
                      type="button"
                      onClick={() => setSex("male")}
                      aria-pressed={sex === "male"}
                      className={`px-2.5 h-7 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        sex === "male"
                          ? "bg-rose-500/25 text-rose-200 border border-rose-500/40"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Male
                    </button>
                  </HealthTooltip>
                  <HealthTooltip content="Show typical survey readings for adult women">
                    <button
                      type="button"
                      onClick={() => setSex("female")}
                      aria-pressed={sex === "female"}
                      className={`px-2.5 h-7 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        sex === "female"
                          ? "bg-rose-500/25 text-rose-200 border border-rose-500/40"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Female
                    </button>
                  </HealthTooltip>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span>Shared My Profile · this device only</span>
              <FieldHelpPopover
                title="How Blood Pressure Reference Works"
                content="Part A shows the 2025 AHA/ACC clinical goal categories, which are the same for all adults (18+) regardless of age or sex. Part B shows typical survey measurements by age and sex from CDC/NHANES — these are descriptive averages, not a clinical target. Your Age and Sex choices stay in localStorage on this device with zero network traffic."
              />
            </div>
          </div>

          {/* UNDER 18 GUARD: Show ONLY pediatric message and NO numbers */}
          {isUnder18 ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-100 leading-relaxed">
              Healthy blood pressure for children and teens depends on age, sex and height. Ask your pediatrician.
            </div>
          ) : !isValidAdult ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-gray-300">
              Enter a valid age to view blood pressure reference information.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
              {/* 2. PART A: GOAL CATEGORIES (same for ALL adults, 2025 AHA/ACC) */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                        Part A · Goal Categories (All Adults)
                      </h5>
                      <FieldHelpPopover
                        title="2025 AHA/ACC Goal Categories"
                        content="Goal categories are identical for all adults 18 and older (they do not change with age or sex). Readings are in mm Hg (Systolic / Diastolic). When top and bottom numbers fall into different categories, the higher category applies."
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      2025 AHA/ACC adult guideline (mm Hg, systolic / diastolic)
                    </p>
                  </div>
                </div>

                {/* User's Most Recent Reading Marker */}
                <div
                  className={`rounded-lg border px-2.5 py-2 text-xs flex flex-wrap items-center justify-between gap-1.5 ${
                    activeGoalRow
                      ? activeGoalRow.activeBorderClass
                      : "border-white/10 bg-black/40 text-gray-400"
                  }`}
                >
                  {latestParsed && activeGoalRow ? (
                    <>
                      <span className="font-semibold text-gray-100">
                        Your last:{" "}
                        <span className="font-mono font-bold text-white">
                          {latestParsed.sys}/{latestParsed.dia}
                        </span>
                        {latestParsed.dateLabel ? ` on ${latestParsed.dateLabel}` : ""} -{" "}
                        <span className="font-bold">{latestParsed.classification.rangeSummary}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeGoalRow.badgeClass}`}
                      >
                        {activeGoalRow.name}
                      </span>
                    </>
                  ) : (
                    <span>No blood pressure readings logged yet.</span>
                  )}
                </div>

                {/* Color-coded Stacked Category Bar */}
                <div className="space-y-1">
                  <div
                    className="grid grid-cols-5 gap-1 h-2.5 w-full rounded-full overflow-hidden p-0.5 bg-black/50 border border-white/10"
                    role="img"
                    aria-label="Color-coded adult blood pressure categories from Normal to Severe"
                  >
                    {GOAL_CATEGORIES.map((cat) => {
                      const isUserCat = latestParsed?.classification.key === cat.key
                      return (
                        <HealthTooltip key={cat.key} content={`${cat.name}: ${cat.rule} mm Hg`}>
                          <div
                            className={`h-full rounded-full transition-all ${cat.barClass} ${
                              isUserCat ? "ring-2 ring-white scale-y-125" : "opacity-75 hover:opacity-100"
                            }`}
                          />
                        </HealthTooltip>
                      )
                    })}
                  </div>
                </div>

                {/* Goal Category Rows */}
                <div className="space-y-1.5">
                  {GOAL_CATEGORIES.map((cat) => {
                    const isUserCat = latestParsed?.classification.key === cat.key
                    return (
                      <div
                        key={cat.key}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                          isUserCat
                            ? cat.activeBorderClass
                            : "border-white/5 bg-black/30"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                          <span className="inline-flex items-center gap-2 font-semibold text-gray-100 min-w-0">
                            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cat.dotClass}`} />
                            <span>{cat.name}</span>
                            {isUserCat && (
                              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/15 text-white font-bold">
                                Last reading
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-[11px] text-gray-300">{cat.rule}</span>
                        </div>
                        {cat.note && (
                          <p className="mt-1 text-[11px] text-red-200/95 leading-snug flex items-start gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                            <span>{cat.note}</span>
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Low BP Rule-of-Thumb Note */}
                <p
                  className={`text-[11px] leading-snug rounded-lg px-2.5 py-1.5 border ${
                    latestParsed?.classification.isLowRuleOfThumb
                      ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
                      : "border-white/5 bg-black/25 text-gray-400"
                  }`}
                >
                  Readings below about 90/60 may be low; tell your doctor if you feel dizzy or faint.
                </p>
              </div>

              {/* 3. PART B: TYPICAL READINGS FOR SELECTED AGE & SEX */}
              {!hasSex ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-100 min-w-0 space-y-1">
                  <div className="font-semibold">Typical readings by age and sex</div>
                  <div>Choose Male or Female above (shared My Profile) to see typical readings for your age and sex.</div>
                </div>
              ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3 min-w-0 flex flex-col justify-between">
                <div className="space-y-3 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h5 className="text-xs font-bold text-gray-100">
                          Typical readings for a {parsedAge}-year-old {sex === "male" ? "man" : "woman"}
                        </h5>
                        <FieldHelpPopover
                          title="Typical Survey Ranges vs Clinical Goal"
                          content="These numbers come from US adults (age group 18–39, 40–59, or 60+) who were not taking blood pressure medication and measured below 140/90. Typical middle range is the 25th–75th percentile; usual full range is the 5th–95th percentile."
                        />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300">
                        Group {adultAgeGroup}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[11px] text-amber-200/95 bg-amber-500/10 border border-amber-500/25 rounded-lg px-2.5 py-1.5 leading-snug">
                      These are what typical US adults without high blood pressure measured. They are NOT a target. The goal for all adults is the Normal category above.
                    </p>
                  </div>

                  {/* Visual Percentile Range Bars */}
                  <div className="space-y-2.5 pt-0.5">
                    <PercentileScaleBar
                      label="Systolic (top)"
                      stats={typicalRef.sys}
                      scaleMin={85}
                      scaleMax={150}
                      accentBandClass="bg-rose-500/55 border border-rose-400/50"
                      accentTickClass="bg-rose-200"
                      userValue={latestParsed?.sys ?? null}
                    />
                    <PercentileScaleBar
                      label="Diastolic (bottom)"
                      stats={typicalRef.dia}
                      scaleMin={40}
                      scaleMax={100}
                      accentBandClass="bg-blue-500/55 border border-blue-400/50"
                      accentTickClass="bg-blue-200"
                      userValue={latestParsed?.dia ?? null}
                    />
                  </div>

                  {/* Compact Typical Range Table (zero horizontal scroll) */}
                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <table className="w-full table-fixed text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/[0.04] border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-400">
                          <th className="py-1.5 px-2 font-bold w-[48%]">Measure (mm Hg)</th>
                          <th className="py-1.5 px-2 font-bold text-right w-[26%]">Systolic</th>
                          <th className="py-1.5 px-2 font-bold text-right w-[26%]">Diastolic</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        <tr>
                          <td className="py-1.5 px-2 font-sans text-gray-200">
                            Typical middle range <span className="text-gray-400 text-[10px]">(25th–75th)</span>
                          </td>
                          <td className="py-1.5 px-2 text-right text-rose-200 font-semibold">
                            {typicalRef.sys.p25}–{typicalRef.sys.p75}
                          </td>
                          <td className="py-1.5 px-2 text-right text-blue-200 font-semibold">
                            {typicalRef.dia.p25}–{typicalRef.dia.p75}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 font-sans text-gray-200">
                            Average <span className="text-gray-400 text-[10px]">(mean · 50th)</span>
                          </td>
                          <td className="py-1.5 px-2 text-right text-gray-100">
                            {typicalRef.sys.mean} <span className="text-gray-400 text-[10px]">({typicalRef.sys.p50})</span>
                          </td>
                          <td className="py-1.5 px-2 text-right text-gray-100">
                            {typicalRef.dia.mean} <span className="text-gray-400 text-[10px]">({typicalRef.dia.p50})</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 font-sans text-gray-200">
                            Usual full range <span className="text-gray-400 text-[10px]">(5th–95th)</span>
                          </td>
                          <td className="py-1.5 px-2 text-right text-gray-300">
                            {typicalRef.sys.p5}–{typicalRef.sys.p95}
                          </td>
                          <td className="py-1.5 px-2 text-right text-gray-300">
                            {typicalRef.dia.p5}–{typicalRef.dia.p95}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Source Note */}
                <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                  Source: CDC/NCHS National Health Statistics Reports No. 35 (2011), NHANES 2001-2008, adults not taking blood pressure medication with readings below 140/90. Data is older, group ranges are broad, and it is not medical advice.
                </p>
              </div>
              )}
            </div>
          )}

          {/* Footer Disclaimer */}
          <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 leading-snug">
            Reference only, not a diagnosis. A diagnosis of high blood pressure needs several readings and a clinician.
          </div>
        </div>
      )}
    </div>
  )
}
