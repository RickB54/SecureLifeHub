"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Sparkles,
  ExternalLink,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  X,
  Copy,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { trimLabelPreview } from "@/lib/drug-database"
import {
  POPULAR_MED_QUESTIONS,
  PopularMedQuestionTemplate,
  MedQuestionTopicId,
  MedQaHistoryEntry,
  MedQaAnswerSection,
  loadMedQaHistory,
  saveMedQaHistory,
  mirrorMedQaToHealthAiHistory,
  answerMedicationQuestionFromDailyMed,
} from "@/lib/medication-qa"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"

interface MedicationAiAssistantPanelProps {
  medRecords: any[]
  onClose?: () => void
}

function ExpandableSectionBody({ section }: { section: MedQaAnswerSection }) {
  const [expanded, setExpanded] = useState(false)
  const { preview, isTrimmed } = trimLabelPreview(section.body, 650)

  const toneCls =
    section.tone === "warning"
      ? "border-amber-500/35 bg-amber-500/10"
      : section.tone === "match"
      ? "border-emerald-500/35 bg-emerald-500/10"
      : "border-white/10 bg-black/30"

  return (
    <div className={`rounded-xl border p-3 space-y-1.5 ${toneCls}`}>
      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
        {section.tone === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
        {section.tone === "match" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
        <span>{section.heading}</span>
      </div>
      <div className="text-xs text-gray-200 whitespace-pre-line leading-relaxed">
        {expanded || !isTrimmed ? section.body : preview}
      </div>
      {isTrimmed && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-[11px] font-semibold text-blue-300 hover:text-blue-200 cursor-pointer"
        >
          {expanded ? "Show less" : "Show full DailyMed text"}
        </button>
      )}
    </div>
  )
}

export function MedicationAiAssistantPanel({ medRecords, onClose }: MedicationAiAssistantPanelProps) {
  const savedMedNames = useMemo(() => {
    const seen = new Set<string>()
    const list: string[] = []
    for (const m of medRecords) {
      const name = String(m?.title || "").trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        list.push(name)
      }
    }
    return list
  }, [medRecords])

  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([])
  const [customDrugInput, setCustomDrugInput] = useState("")
  const [selectedTopicId, setSelectedTopicId] = useState<MedQuestionTopicId | "">("")
  const [questionText, setQuestionText] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeAnswer, setActiveAnswer] = useState<MedQaHistoryEntry | null>(null)
  const [history, setHistory] = useState<MedQaHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(true)
  const [openHistoryIds, setOpenHistoryIds] = useState<Record<string, boolean>>({})

  // Hydrate history and default drug selection on mount
  useEffect(() => {
    const saved = loadMedQaHistory()
    setHistory(saved)
    if (savedMedNames.length > 0 && selectedDrugs.length === 0) {
      const defaults = savedMedNames.slice(0, 2)
      setSelectedDrugs(defaults)
      const defTopic: MedQuestionTopicId = defaults.length >= 2 ? "together_interactions" : "uses"
      const tpl = POPULAR_MED_QUESTIONS.find((q) => q.id === defTopic)
      setSelectedTopicId(defTopic)
      if (tpl) setQuestionText(tpl.buildQuestion(defaults))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleDrugChip = (name: string) => {
    setSelectedDrugs((prev) => {
      const exists = prev.some((d) => d.toLowerCase() === name.toLowerCase())
      const next = exists ? prev.filter((d) => d.toLowerCase() !== name.toLowerCase()) : [...prev, name]
      if (selectedTopicId) {
        const tpl = POPULAR_MED_QUESTIONS.find((q) => q.id === selectedTopicId)
        if (tpl && next.length > 0) {
          setQuestionText(tpl.buildQuestion(next))
        }
      }
      return next
    })
  }

  const handleAddCustomDrug = () => {
    const clean = customDrugInput.trim()
    if (!clean) return
    const parts = clean
      .split(/[,;]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    setSelectedDrugs((prev) => {
      const next = [...prev]
      for (const p of parts) {
        if (!next.some((d) => d.toLowerCase() === p.toLowerCase())) next.push(p)
      }
      if (selectedTopicId) {
        const tpl = POPULAR_MED_QUESTIONS.find((q) => q.id === selectedTopicId)
        if (tpl && next.length > 0) {
          setQuestionText(tpl.buildQuestion(next))
        }
      }
      return next
    })
    setCustomDrugInput("")
  }

  const handleSelectPopularQuestion = (topicIdStr: string) => {
    const topicId = topicIdStr as MedQuestionTopicId | ""
    setSelectedTopicId(topicId)
    if (!topicId) return
    const tpl = POPULAR_MED_QUESTIONS.find((q) => q.id === topicId)
    if (tpl) {
      setQuestionText(tpl.buildQuestion(selectedDrugs))
    }
  }

  const handleAskDailyMed = async () => {
    // Also fold in any un-submitted text typed in customDrugInput
    let effectiveDrugs = [...selectedDrugs]
    if (customDrugInput.trim()) {
      for (const part of customDrugInput.split(/[,;]+/).map((p) => p.trim()).filter(Boolean)) {
        if (!effectiveDrugs.some((d) => d.toLowerCase() === part.toLowerCase())) {
          effectiveDrugs.push(part)
        }
      }
      setSelectedDrugs(effectiveDrugs)
      setCustomDrugInput("")
    }

    const finalQuestion =
      questionText.trim() ||
      (selectedTopicId
        ? POPULAR_MED_QUESTIONS.find((q) => q.id === selectedTopicId)?.buildQuestion(effectiveDrugs) || ""
        : "")

    if (!finalQuestion.trim()) {
      toast.error("Choose a popular question from the dropdown or type your question first.")
      return
    }

    setLoading(true)
    try {
      const entry = await answerMedicationQuestionFromDailyMed({
        question: finalQuestion,
        selectedDrugs: effectiveDrugs,
        explicitTopicId: selectedTopicId,
        savedMeds: medRecords,
      })

      setActiveAnswer(entry)
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 100)
        saveMedQaHistory(next)
        return next
      })
      mirrorMedQaToHealthAiHistory(entry)
      toast.success("Official DailyMed answer retrieved and saved to your Q&A history")
    } catch (err: any) {
      toast.error(err?.message || "Could not retrieve DailyMed label answer")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id)
      saveMedQaHistory(next)
      return next
    })
    if (activeAnswer?.id === id) setActiveAnswer(null)
  }

  const handleClearAllHistory = () => {
    if (!confirm("Clear your saved medication Question & Answer history on this device?")) return
    setHistory([])
    saveMedQaHistory([])
    toast.success("Medication Q&A history cleared")
  }

  const handleCopyEntry = (entry: MedQaHistoryEntry) => {
    const plain = [
      `Question: ${entry.question}`,
      `Summary: ${entry.summaryVerdict}`,
      "",
      ...entry.sections.map((s) => `${s.heading}:\n${s.body}`),
      "",
      ...entry.sources.map((src) => `DailyMed Source (${src.labelTitle}): ${src.dailyMedUrl}`),
    ].join("\n\n")
    navigator.clipboard.writeText(plain)
    toast.success("Answer copied to clipboard")
  }

  const groupedTemplates = useMemo(() => {
    const groups: Array<{ name: PopularMedQuestionTemplate["group"]; items: PopularMedQuestionTemplate[] }> = [
      { name: "Interactions & Mixing", items: [] },
      { name: "Uses, Dosage & How to Take", items: [] },
      { name: "Side Effects & Safety", items: [] },
    ]
    for (const q of POPULAR_MED_QUESTIONS) {
      const g = groups.find((x) => x.name === q.group)
      if (g) g.items.push(q)
    }
    return groups
  }, [])

  return (
    <div className="mb-3 p-3.5 rounded-2xl bg-[#131826] border border-blue-500/30 space-y-3 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
          <h3 className="text-sm font-bold text-blue-200 truncate">
            DailyMed Medication Q&amp;A &amp; Interaction Checker
          </h3>
          <FieldHelpPopover
            title="Official DailyMed Medication Q&A"
            content="Select one or more medications (from your list or type any drug name), pick a popular question from the dropdown or type your own, and click Get DailyMed Answer. Answers come directly from official NLM DailyMed / FDA prescribing labels and are automatically saved in your Question & Answer History."
          />
        </div>
        {onClose && (
          <HealthTooltip content="Close Medication Q&A panel">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Medication Q&A panel"
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </HealthTooltip>
        )}
      </div>

      {/* Step 1: Select Medication(s) — saved meds chips + any custom drug input */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1">
            Medications:
          </span>
          {savedMedNames.map((name) => {
            const active = selectedDrugs.some((d) => d.toLowerCase() === name.toLowerCase())
            return (
              <HealthTooltip key={name} content={active ? `Remove ${name} from question` : `Include ${name} in question`}>
                <button
                  type="button"
                  onClick={() => toggleDrugChip(name)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    active
                      ? "bg-blue-600/30 border-blue-400/60 text-blue-100"
                      : "bg-white/[0.04] border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {name}
                </button>
              </HealthTooltip>
            )
          })}

          {/* Extra custom drugs not in savedMedNames */}
          {selectedDrugs
            .filter((d) => !savedMedNames.some((s) => s.toLowerCase() === d.toLowerCase()))
            .map((extra) => (
              <span
                key={extra}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-600/30 border border-purple-400/50 text-purple-100"
              >
                <span>{extra}</span>
                <button
                  type="button"
                  onClick={() => toggleDrugChip(extra)}
                  aria-label={`Remove ${extra}`}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

          {/* Add any drug input */}
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={customDrugInput}
              onChange={(e) => setCustomDrugInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddCustomDrug()
                }
              }}
              placeholder="+ Any other drug..."
              aria-label="Add any drug name for DailyMed lookup"
              className="h-7 w-36 sm:w-44 px-2.5 rounded-full bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            {customDrugInput.trim() && (
              <HealthTooltip content="Add drug to selection">
                <button
                  type="button"
                  onClick={handleAddCustomDrug}
                  className="h-7 px-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </HealthTooltip>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Popular Medication Questions Dropdown */}
      <div className="space-y-2">
        <div className="space-y-1">
          <label
            htmlFor="popular-med-questions-select"
            className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block"
          >
            Popular Medication Questions
          </label>
          <HealthTooltip content="Choose a popular medication or drug-interaction question to fill in automatically">
            <select
              id="popular-med-questions-select"
              value={selectedTopicId}
              onChange={(e) => handleSelectPopularQuestion(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-[#1c2233] border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              style={{ colorScheme: "dark" }}
            >
              <option value="">Select a popular question (or type your own below)...</option>
              {groupedTemplates.map((grp) => (
                <optgroup key={grp.name} label={grp.name} className="bg-[#181d2c] text-gray-200">
                  {grp.items.map((item) => (
                    <option key={item.id} value={item.id} className="bg-[#181d2c] text-white">
                      {selectedDrugs.length > 0 ? item.buildQuestion(selectedDrugs) : item.shortTitle}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </HealthTooltip>
        </div>

        {/* Editable Question Input + AI Assistant Submit Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="Or type any question about a drug, dosage, side effects, or interactions..."
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value)
              setSelectedTopicId("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                e.preventDefault()
                handleAskDailyMed()
              }
            }}
            className="flex-1 h-9 px-3 bg-[#1c2233] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <HealthTooltip content="Fetch the official answer from DailyMed / FDA labels and save to your Q&A history">
            <button
              type="button"
              disabled={loading}
              onClick={handleAskDailyMed}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking DailyMed...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>AI Assistant</span>
                </>
              )}
            </button>
          </HealthTooltip>
        </div>
      </div>

      {/* Latest Answer Card */}
      {activeAnswer && (
        <div className="rounded-xl border border-blue-400/35 bg-[#0d111c] p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-bold text-blue-300">Question: {activeAnswer.question}</div>
              <div className="text-xs text-gray-100 font-medium leading-relaxed">
                {activeAnswer.summaryVerdict}
              </div>
            </div>
            <HealthTooltip content="Copy question and official DailyMed answer">
              <button
                type="button"
                onClick={() => handleCopyEntry(activeAnswer)}
                aria-label="Copy answer"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white shrink-0 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </HealthTooltip>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {activeAnswer.sections.map((sec, idx) => (
              <ExpandableSectionBody key={`${sec.heading}-${idx}`} section={sec} />
            ))}
          </div>

          {/* Official DailyMed Links */}
          {activeAnswer.sources.length > 0 && (
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-400 font-semibold">Official DailyMed Labels:</span>
                {activeAnswer.sources.map((src) => (
                  <a
                    key={`${src.drugName}-${src.dailyMedUrl}`}
                    href={src.dailyMedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-semibold"
                  >
                    <span>{src.labelTitle}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
              <span className="text-[10px] text-gray-500">
                Official label wording only — confirm personalized advice with your pharmacist or doctor.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Saved Question & Answer History */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
          >
            <History className="h-3.5 w-3.5 text-blue-400" />
            <span>Question &amp; Answer History ({history.length})</span>
            {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {history.length > 0 && (
            <HealthTooltip content="Clear all saved Q&A history on this device">
              <button
                type="button"
                onClick={handleClearAllHistory}
                className="text-[11px] text-gray-400 hover:text-red-400 inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear history</span>
              </button>
            </HealthTooltip>
          )}
        </div>

        {showHistory && (
          history.length === 0 ? (
            <p className="text-xs text-gray-500 italic">
              Questions you ask here are automatically recorded with their official DailyMed answers.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {history.map((item) => {
                const isExpanded = Boolean(openHistoryIds[item.id])
                const d = new Date(item.createdAt)
                const dateStr = isNaN(d.getTime())
                  ? ""
                  : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHistoryIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        }
                        className="flex-1 min-w-0 text-left space-y-0.5 cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-100">{item.question}</span>
                          {item.drugs.map((dr) => (
                            <span
                              key={dr}
                              className="px-1.5 py-0.2 rounded bg-blue-500/15 border border-blue-500/25 text-[10px] font-semibold text-blue-300"
                            >
                              {dr}
                            </span>
                          ))}
                          {dateStr && <span className="text-[10px] text-gray-500">· {dateStr}</span>}
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2">{item.summaryVerdict}</p>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <HealthTooltip content={isExpanded ? "Collapse answer" : "Expand full answer"}>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenHistoryIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                            }
                            aria-label="Toggle history answer"
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </HealthTooltip>
                        <HealthTooltip content="Copy Q&A">
                          <button
                            type="button"
                            onClick={() => handleCopyEntry(item)}
                            aria-label="Copy history item"
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </HealthTooltip>
                        <HealthTooltip content="Delete from history">
                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            aria-label="Delete history item"
                            className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </HealthTooltip>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        {item.sections.map((sec, idx) => (
                          <ExpandableSectionBody key={`${item.id}-${idx}`} section={sec} />
                        ))}
                        {item.sources.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                            <span className="text-gray-400 font-semibold">DailyMed:</span>
                            {item.sources.map((src) => (
                              <a
                                key={`${item.id}-${src.dailyMedUrl}`}
                                href={src.dailyMedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-300 hover:underline"
                              >
                                <span>{src.labelTitle}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
