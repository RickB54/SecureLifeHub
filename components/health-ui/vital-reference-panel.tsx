"use client"

import React from "react"
import { BarChart3, ChevronDown, ChevronUp, HelpCircle, Info } from "lucide-react"
import {
  VITAL_TONE_STYLES,
  VITALS_FOOTER_DISCLAIMER,
  CALORIE_REF,
  GLUCOSE_CONTEXT_OPTIONS,
  CalorieActivityLevel,
  GlucoseContextType,
} from "@/lib/vitalsReference"
import { VitalEvalResult, VerdictTone } from "@/lib/vitalsEvaluate"
import { useVitalsProfile } from "@/lib/vitalsProfile"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"
import { ProfileAgeInput, ProfileSexToggle, ProfileHeightInput } from "./vitals-profile-control"

const NEUTRAL_CHIP = "bg-white/5 text-gray-300 border-white/15"
const chipCls = (tone: VerdictTone) => (tone === "neutral" ? NEUTRAL_CHIP : VITAL_TONE_STYLES[tone].chip)
const dotCls = (tone: VerdictTone) => (tone === "neutral" ? "bg-gray-500" : VITAL_TONE_STYLES[tone].dot)

/** Small colored verdict chip shown on the vital card even when the panel is collapsed. */
export function VitalVerdictChip({ result }: { result: VitalEvalResult | null }) {
  if (!result?.verdict || result.blocker) return null
  return (
    <HealthTooltip content={`${result.verdict.line} ${VITALS_FOOTER_DISCLAIMER}`}>
      <span
        className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold leading-tight ${chipCls(result.verdict.tone)}`}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotCls(result.verdict.tone)}`} />
        <span className="truncate">{result.verdict.chip}</span>
      </span>
    </HealthTooltip>
  )
}

interface VitalReferencePanelProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  result: VitalEvalResult
  theme?: string
  onOpenHelp?: () => void
  onGlucoseContextChange?: (entryKey: string, ctx: GlucoseContextType) => void
}

export function VitalReferencePanel({
  title,
  isOpen,
  onToggle,
  result,
  theme = "dark",
  onOpenHelp,
  onGlucoseContextChange,
}: VitalReferencePanelProps) {
  const { profile, updateProfile } = useVitalsProfile()
  const isLight = theme === "light"

  return (
    <div className={`mt-4 pt-3 border-t ${isLight ? "border-gray-200" : "border-white/10"} min-w-0 relative z-10`}>
      <div className="flex items-center justify-between gap-2">
        <HealthTooltip content={isOpen ? `Collapse ${title} reference` : `View reference ranges for ${title}`}>
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
              <span className="text-xs font-bold truncate">{title} Reference</span>
            </span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
          </button>
        </HealthTooltip>
        {onOpenHelp && (
          <HealthTooltip content={`Open Help guide for the ${title} reference`}>
            <button
              type="button"
              onClick={onOpenHelp}
              aria-label={`${title} reference help`}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </HealthTooltip>
        )}
      </div>

      {isOpen && (
        <div
          className={`mt-3 rounded-xl border p-3 space-y-3 min-w-0 overflow-x-hidden text-left ${
            isLight ? "bg-gray-50 border-gray-200 text-gray-900" : "bg-[#0d0d12] border-white/10 text-gray-100"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-300">{title} reference</h5>
            <FieldHelpPopover title={`About the ${title} reference`} content={result.helpText} />
          </div>

          {/* Inline prompts for missing shared profile values */}
          {result.prompts.length > 0 && !result.blocker && (
            <div className="space-y-1.5">
              {result.prompts.map((p) => (
                <div key={p.field} className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[11px] text-sky-100 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 text-sky-300 shrink-0 mt-0.5" />
                    <span>{p.text}</span>
                  </div>
                  <div className="pl-5">
                    {p.field === "age" && <ProfileAgeInput compact />}
                    {p.field === "sex" && <ProfileSexToggle compact />}
                    {p.field === "height" && <ProfileHeightInput compact />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.blocker ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100 leading-relaxed">{result.blocker}</div>
          ) : (
            <>
              {result.leadNote && <p className="text-[11px] text-gray-300 leading-snug">{result.leadNote}</p>}

              {/* Calorie activity selector */}
              {result.showActivitySelector && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Activity level</span>
                    <FieldHelpPopover
                      title="Activity level"
                      content={(Object.keys(CALORIE_REF.activity) as CalorieActivityLevel[])
                        .map((k) => `${CALORIE_REF.activity[k].label}: ${CALORIE_REF.activity[k].definition}.`)
                        .join(" ")}
                    />
                  </div>
                  <div role="group" aria-label="Activity level" className="flex flex-wrap gap-1">
                    {(Object.keys(CALORIE_REF.activity) as CalorieActivityLevel[]).map((k) => (
                      <HealthTooltip key={k} content={`${CALORIE_REF.activity[k].label}: ${CALORIE_REF.activity[k].definition}`}>
                        <button
                          type="button"
                          onClick={() => updateProfile({ calorieActivity: k })}
                          aria-pressed={profile.calorieActivity === k}
                          className={`px-2 h-6 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                            profile.calorieActivity === k
                              ? "bg-rose-500/25 text-rose-200 border-rose-500/40"
                              : "bg-black/40 text-gray-400 border-white/10 hover:text-white"
                          }`}
                        >
                          {CALORIE_REF.activity[k].label}
                        </button>
                      </HealthTooltip>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500">{CALORIE_REF.activity[profile.calorieActivity].definition}.</p>
                </div>
              )}

              {/* Glucose context picker for entries without a logged context */}
              {result.glucoseContextPicker && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Latest reading context</span>
                  {result.glucoseContextPicker.fromLog ? (
                    <span className="px-2 py-0.5 rounded-md border border-white/15 bg-white/5 text-gray-200">{result.glucoseContextPicker.current}</span>
                  ) : (
                    <HealthTooltip content="This entry was logged without a context. Pick one to compare it (saved on this device only).">
                      <select
                        value={result.glucoseContextPicker.current || ""}
                        aria-label="Glucose reading context"
                        onChange={(e) =>
                          e.target.value &&
                          onGlucoseContextChange?.(result.glucoseContextPicker!.entryKey, e.target.value as GlucoseContextType)
                        }
                        className="h-7 rounded-md border border-white/15 bg-black/60 px-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                        style={{ colorScheme: "dark" }}
                      >
                        <option value="">Choose...</option>
                        {GLUCOSE_CONTEXT_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </HealthTooltip>
                  )}
                </div>
              )}

              {/* Latest marker + one-line verdict */}
              {result.marker && (
                <div
                  className={`rounded-lg border px-2.5 py-2 text-xs space-y-0.5 ${
                    result.verdict && result.verdict.tone !== "neutral"
                      ? VITAL_TONE_STYLES[result.verdict.tone].rowActive
                      : "border-white/10 bg-black/40"
                  }`}
                >
                  <div className="font-semibold text-gray-100">{result.marker}</div>
                  {result.verdict && <div className="text-gray-200">{result.verdict.line}</div>}
                </div>
              )}

              {/* Color-coded bands */}
              {result.bands.length > 0 && (
                <div className="space-y-1.5">
                  {result.bandsCaption && <div className="text-[11px] font-semibold text-gray-300">{result.bandsCaption}</div>}
                  <div
                    className="flex gap-1 h-2.5 w-full rounded-full overflow-hidden p-0.5 bg-black/50 border border-white/10"
                    role="img"
                    aria-label={`${title} reference bands`}
                  >
                    {result.bands.map((b) => (
                      <HealthTooltip key={b.key} content={`${b.label} (${b.rule})`}>
                        <div
                          className={`h-full flex-1 rounded-full ${VITAL_TONE_STYLES[b.tone].bar} ${
                            result.activeKey === b.key ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"
                          }`}
                        />
                      </HealthTooltip>
                    ))}
                  </div>
                  {result.bands.map((b) => {
                    const active = result.activeKey === b.key
                    return (
                      <div
                        key={b.key}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs ${active ? VITAL_TONE_STYLES[b.tone].rowActive : "border-white/5 bg-black/30"}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-0.5">
                          <span className="inline-flex items-start gap-2 min-w-0 font-semibold text-gray-100">
                            <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-0.5 ${VITAL_TONE_STYLES[b.tone].dot}`} />
                            <span className="break-words">{b.label}</span>
                            {active && (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 rounded bg-white/15 text-white font-bold shrink-0">Latest</span>
                            )}
                          </span>
                          <span className="font-mono text-[11px] text-gray-300">{b.rule}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Stats */}
              {result.stats.length > 0 && (
                <div className="space-y-1">
                  {result.stats.map((s, i) => (
                    <div key={`${s.label}-${i}`} className="flex flex-wrap items-start justify-between gap-x-2 text-[11px] rounded-md bg-white/[0.03] border border-white/5 px-2 py-1">
                      <span className="text-gray-400">{s.label}</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-100 text-right">
                        {s.tone && <span className={`h-2 w-2 rounded-full ${dotCls(s.tone)}`} />}
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tables */}
              {result.tables.map((t) => (
                <div key={t.title} className="space-y-1">
                  <div className="text-[11px] font-semibold text-gray-300">{t.title}</div>
                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <table className="w-full table-fixed text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-white/[0.04] border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-400">
                          {t.headers.map((h) => (
                            <th key={h} className="py-1 px-1.5 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {t.rows.map((row, ri) => (
                          <tr key={ri} className={t.highlight === ri ? "bg-rose-500/15 text-white font-semibold" : "text-gray-300"}>
                            {row.map((cell, ci) => (
                              <td key={ci} className={`py-1 px-1.5 break-words ${ci > 0 ? "font-mono" : ""}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {result.notes.map((n, i) => (
                <p key={i} className="text-[11px] leading-snug text-gray-400">
                  {n}
                </p>
              ))}
            </>
          )}

          {!result.blocker && result.source && <p className="text-[10px] text-gray-500 leading-relaxed">{result.source}</p>}
          <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 leading-snug">{VITALS_FOOTER_DISCLAIMER}</div>
        </div>
      )}
    </div>
  )
}
