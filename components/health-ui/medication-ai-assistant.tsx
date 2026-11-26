"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
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
  Search,
  ListPlus,
  Building2,
} from "lucide-react"
import { toast } from "sonner"
import { trimLabelPreview } from "@/lib/drug-database"
import {
  MAX_QA_DRUGS,
  POPULAR_MED_QUESTIONS,
  PopularMedQuestionTemplate,
  MedQuestionTopicId,
  MedQaHistoryEntry,
  MedQaAnswerSection,
  loadMedQaHistory,
  saveMedQaHistory,
  savePreferredLabelChoice,
  mirrorMedQaToHealthAiHistory,
  fetchDrugNameSuggestionsClient,
  answerMedicationQuestionFromDailyMed,
} from "@/lib/medication-qa"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"

interface MedicationAiAssistantPanelProps {
  medRecords: any[]
  onClose?: () => void
}

function renderHighlightedText(text: string, terms?: string[]) {
  if (!terms || terms.length === 0) return text
  const cleanTerms = Array.from(new Set(terms.map((t) => t.trim()).filter((t) => t.length >= 3)))
  if (cleanTerms.length === 0) return text

  const escaped = cleanTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length)
  const regex = new RegExp(`(${escaped.join("|")})`, "gi")
  const parts = text.split(regex)

  return parts.map((part, idx) => {
    const isMatch = cleanTerms.some((t) => t.toLowerCase() === part.toLowerCase())
    if (isMatch) {
      return (
        <mark key={idx} className="bg-amber-400/30 text-amber-100 rounded px-0.5 font-semibold">
          {part}
        </mark>
      )
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>
  })
}

function ExpandableSectionBody({ section }: { section: MedQaAnswerSection }) {
  const [expanded, setExpanded] = useState(false)
  const { preview, isTrimmed } = trimLabelPreview(section.body, 550)

  const toneCls =
    section.tone === "boxed"
      ? "border-red-500/45 bg-red-950/35"
      : section.tone === "match"
      ? "border-orange-500/45 bg-orange-500/10"
      : section.tone === "warning"
      ? "border-amber-500/35 bg-amber-500/10"
      : "border-white/10 bg-black/30"

  const displayedText = expanded || !isTrimmed ? section.body : preview

  return (
    <div className={`rounded-xl border p-3 space-y-1.5 ${toneCls}`}>
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          {(section.tone === "warning" || section.tone === "boxed" || section.tone === "match") && (
            <AlertTriangle
              className={`h-3.5 w-3.5 shrink-0 ${
                section.tone === "boxed"
                  ? "text-red-400"
                  : section.tone === "match"
                  ? "text-orange-400"
                  : "text-amber-400"
              }`}
            />
          )}
          <span>{section.heading}</span>
        </div>
        {section.sourceLabel && (
          <span className="text-[10px] text-gray-400">{section.sourceLabel}</span>
        )}
      </div>

      <div className="text-xs text-gray-200 whitespace-pre-line leading-relaxed">
        {renderHighlightedText(displayedText, section.matchedTerms)}
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
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<MedQuestionTopicId | "">("")
  const [questionText, setQuestionText] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeAnswer, setActiveAnswer] = useState<MedQaHistoryEntry | null>(null)
  const [history, setHistory] = useState<MedQaHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(true)
  const [openHistoryIds, setOpenHistoryIds] = useState<Record<string, boolean>>({})
  const suggestBoxRef = useRef<HTMLDivElement | null>(null)

  // Hydrate history and default drug selection on mount
  useEffect(() => {
    setHistory(loadMedQaHistory())
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

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (suggestBoxRef.current && !suggestBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  // Debounced DailyMed / openFDA drug name suggestions (3+ chars)
  useEffect(() => {
    const q = customDrugInput.trim()
    if (q.length < 3) {
      setSuggestions([])
      setSuggestLoading(false)
      return
    }
    let cancelled = false
    setSuggestLoading(true)
    const timer = window.setTimeout(async () => {
      const items = await fetchDrugNameSuggestionsClient(q)
      if (cancelled) return
      setSuggestions(items)
      setSuggestLoading(false)
      setShowSuggestions(true)
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [customDrugInput])

  const syncQuestionToDrugs = (nextDrugs: string[], topicOverride?: MedQuestionTopicId | "") => {
    const topic = topicOverride !== undefined ? topicOverride : selectedTopicId
    if (!topic) return
    const tpl = POPULAR_MED_QUESTIONS.find((q) => q.id === topic)
    if (tpl) {
      setQuestionText(tpl.buildQuestion(nextDrugs))
    }
  }

  const addDrugToList = (rawName: string) => {
    const parts = rawName
      .split(/[,;]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length === 0) return

    setSelectedDrugs((prev) => {
      const next = [...prev]
      let hitLimit = false
      for (const p of parts) {
        if (next.some((d) => d.toLowerCase() === p.toLowerCase())) continue
        if (next.length >= MAX_QA_DRUGS) {
          hitLimit = true
          break
        }
        next.push(p)
      }
      if (hitLimit) {
        toast.info(`You can check up to ${MAX_QA_DRUGS} drugs at once.`)
      }
      const nextTopic =
        !selectedTopicId && next.length >= 2
          ? "together_interactions"
          : selectedTopicId
      if (nextTopic !== selectedTopicId) setSelectedTopicId(nextTopic)
      syncQuestionToDrugs(next, nextTopic)
      return next
    })
    setCustomDrugInput("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  const removeDrugFromList = (name: string) => {
    setSelectedDrugs((prev) => {
      const next = prev.filter((d) => d.toLowerCase() !== name.toLowerCase())
      syncQuestionToDrugs(next)
      return next
    })
  }

  const handleAddAllSavedMeds = () => {
    if (savedMedNames.length === 0) {
      toast.info("You have no saved medications yet — type any drug name above.")
      return
    }
    setSelectedDrugs((prev) => {
      const next = [...prev]
      let truncated = false
      for (const name of savedMedNames) {
        if (next.some((d) => d.toLowerCase() === name.toLowerCase())) continue
        if (next.length >= MAX_QA_DRUGS) {
          truncated = true
          break
        }
        next.push(name)
      }
      if (truncated) {
        toast.info(`Added up to the ${MAX_QA_DRUGS}-drug limit.`)
      }
      const nextTopic: MedQuestionTopicId | "" =
        next.length >= 2 ? "together_interactions" : selectedTopicId || "uses"
      setSelectedTopicId(nextTopic)
      syncQuestionToDrugs(next, nextTopic)
      return next
    })
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

  const runDailyMedQuery = async (opts?: {
    overrideQuestion?: string
    overrideDrugs?: string[]
    overrideTopicId?: MedQuestionTopicId | ""
    labelOverrides?: Record<string, string>
    replaceEntryId?: string
  }) => {
    let effectiveDrugs = [...(opts?.overrideDrugs ?? selectedDrugs)]
    if (!opts?.overrideDrugs && customDrugInput.trim()) {
      for (const part of customDrugInput.split(/[,;]+/).map((p) => p.trim()).filter(Boolean)) {
        if (effectiveDrugs.length >= MAX_QA_DRUGS) break
        if (!effectiveDrugs.some((d) => d.toLowerCase() === part.toLowerCase())) {
          effectiveDrugs.push(part)
        }
      }
      setSelectedDrugs(effectiveDrugs)
      setCustomDrugInput("")
      setShowSuggestions(false)
    }

    const topicToUse = opts?.overrideTopicId !== undefined ? opts.overrideTopicId : selectedTopicId
    const finalQuestion =
      (opts?.overrideQuestion ?? questionText).trim() ||
      (topicToUse
        ? POPULAR_MED_QUESTIONS.find((q) => q.id === topicToUse)?.buildQuestion(effectiveDrugs) || ""
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
        explicitTopicId: topicToUse,
        savedMeds: medRecords,
        labelOverrides: opts?.labelOverrides,
      })

      setActiveAnswer(entry)
      setHistory((prev) => {
        const next = opts?.replaceEntryId
          ? [entry, ...prev.filter((item) => item.id !== opts.replaceEntryId)].slice(0, 100)
          : [entry, ...prev].slice(0, 100)
        saveMedQaHistory(next)
        return next
      })
      mirrorMedQaToHealthAiHistory(entry)
      if (!opts?.replaceEntryId) {
        toast.success("Official DailyMed answer retrieved and saved to your Q&A history")
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not retrieve DailyMed label answer")
    } finally {
      setLoading(false)
    }
  }

  const handleChooseLabelForDrug = async (drugName: string, newLabelId: string) => {
    savePreferredLabelChoice(drugName, newLabelId)
    if (!activeAnswer) return
    await runDailyMedQuery({
      overrideQuestion: activeAnswer.question,
      overrideDrugs: activeAnswer.drugs,
      overrideTopicId: activeAnswer.topicId,
      labelOverrides: { [drugName.toLowerCase()]: newLabelId },
      replaceEntryId: activeAnswer.id,
    })
    toast.success(`Switched label for ${drugName} (remembered on this device)`)
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
      ...entry.sections.map((s) => `${s.heading}${s.sourceLabel ? ` (${s.sourceLabel})` : ""}:\n${s.body}`),
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

  const unselectedSavedMeds = savedMedNames.filter(
    (name) => !selectedDrugs.some((d) => d.toLowerCase() === name.toLowerCase())
  )

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
            content="Type any generic or brand drug name (live suggestions appear after 3 characters) or add your saved medications — up to 5 drugs at once. Pick a popular question or type your own. For interactions, labels are cross-checked by generic name, brand names, and FDA pharmacologic class terms, and complete safety sections are always included."
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

      {/* Step 1: Any Drug Search with Debounced Suggestions + Up to 5 Chips + Add All My Medications */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Drugs to check ({selectedDrugs.length}/{MAX_QA_DRUGS})
          </span>
          {savedMedNames.length > 0 && (
            <HealthTooltip content={`Add all of your saved medications (up to ${MAX_QA_DRUGS} at once)`}>
              <button
                type="button"
                onClick={handleAddAllSavedMeds}
                className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-[11px] font-semibold text-blue-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <ListPlus className="h-3.5 w-3.5" />
                <span>Add all my medications</span>
              </button>
            </HealthTooltip>
          )}
        </div>

        {/* Search any drug box with live suggestions */}
        <div ref={suggestBoxRef} className="relative">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={customDrugInput}
                disabled={selectedDrugs.length >= MAX_QA_DRUGS}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                onChange={(e) => setCustomDrugInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (customDrugInput.trim()) addDrugToList(customDrugInput)
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false)
                  }
                }}
                placeholder={
                  selectedDrugs.length >= MAX_QA_DRUGS
                    ? `Limit of ${MAX_QA_DRUGS} drugs reached — remove one to add another`
                    : "Type any drug name (generic or brand, e.g. Lisinopril, Advil)..."
                }
                aria-label="Search any drug name (generic or brand)"
                className="w-full h-9 pl-8 pr-8 rounded-xl bg-[#1c2233] border border-white/15 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              {suggestLoading && (
                <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <HealthTooltip content="Add this drug to your check list (up to 5 drugs)">
              <button
                type="button"
                disabled={!customDrugInput.trim() || selectedDrugs.length >= MAX_QA_DRUGS}
                onClick={() => addDrugToList(customDrugInput)}
                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add drug</span>
              </button>
            </HealthTooltip>
          </div>

          {/* Debounced suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 z-30 rounded-xl border border-white/15 bg-[#161b29] shadow-2xl overflow-hidden max-h-52 overflow-y-auto custom-scrollbar">
              {suggestions.map((sug) => {
                const alreadyAdded = selectedDrugs.some((d) => d.toLowerCase() === sug.toLowerCase())
                return (
                  <button
                    key={sug}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addDrugToList(sug)}
                    className="w-full px-3 py-2 text-left text-xs text-gray-100 hover:bg-blue-600/25 disabled:opacity-45 flex items-center justify-between gap-2 border-b border-white/5 last:border-b-0 cursor-pointer"
                  >
                    <span className="font-medium truncate">{sug}</span>
                    <span className="text-[10px] text-blue-300 shrink-0">
                      {alreadyAdded ? "Added" : "+ Add"}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Drug Chips (each with an "x" to remove) */}
        {selectedDrugs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedDrugs.map((drug) => (
              <span
                key={drug}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/30 border border-blue-400/55 text-blue-100"
              >
                <span>{drug}</span>
                <HealthTooltip content={`Remove ${drug}`}>
                  <button
                    type="button"
                    onClick={() => removeDrugFromList(drug)}
                    aria-label={`Remove ${drug}`}
                    className="rounded-full p-0.5 hover:bg-white/20 text-blue-200 hover:text-white cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </HealthTooltip>
              </span>
            ))}
          </div>
        )}

        {/* Quick-add pills for unselected saved medications */}
        {unselectedSavedMeds.length > 0 && selectedDrugs.length < MAX_QA_DRUGS && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-gray-500">Your meds:</span>
            {unselectedSavedMeds.map((name) => (
              <HealthTooltip key={name} content={`Add ${name} to check list`}>
                <button
                  type="button"
                  onClick={() => addDrugToList(name)}
                  className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-2.5 w-2.5" />
                  <span>{name}</span>
                </button>
              </HealthTooltip>
            ))}
          </div>
        )}
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
                runDailyMedQuery()
              }
            }}
            className="flex-1 h-9 px-3 bg-[#1c2233] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <HealthTooltip content="Fetch the official answer from DailyMed / FDA labels and save to your Q&A history">
            <button
              type="button"
              disabled={loading}
              onClick={() => runDailyMedQuery()}
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
            <div className="text-xs font-bold text-blue-300">Question: {activeAnswer.question}</div>
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

          {/* Headline Verdict Banner — Amber notice when not found by name, Warning when matched, NEVER green */}
          <div
            className={`rounded-xl border px-3 py-2.5 text-xs leading-relaxed flex items-start gap-2 ${
              activeAnswer.verdictTone === "amber"
                ? "border-amber-500/50 bg-amber-500/15 text-amber-100"
                : activeAnswer.verdictTone === "warning"
                ? "border-orange-500/50 bg-orange-500/15 text-orange-100"
                : "border-blue-500/30 bg-blue-500/10 text-gray-100"
            }`}
          >
            {(activeAnswer.verdictTone === "amber" || activeAnswer.verdictTone === "warning") && (
              <AlertTriangle
                className={`h-4 w-4 shrink-0 mt-0.5 ${
                  activeAnswer.verdictTone === "amber" ? "text-amber-400" : "text-orange-400"
                }`}
              />
            )}
            <span className="font-medium">{activeAnswer.summaryVerdict}</span>
          </div>

          {/* Multi-Label Chooser (when several official labels match a drug; remembered per drug in localStorage) */}
          {activeAnswer.sources.some((s) => (s.availableLabels?.length || 0) > 1) && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-300">
                <Building2 className="h-3.5 w-3.5 text-blue-400" />
                <span>Choose FDA / DailyMed Label (remembered on this device)</span>
              </div>
              <div className="space-y-1.5">
                {activeAnswer.sources
                  .filter((s) => (s.availableLabels?.length || 0) > 1)
                  .map((src) => (
                    <div key={src.drugName} className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                      <span className="font-semibold text-blue-200 sm:w-28 shrink-0 truncate">
                        {src.drugName}:
                      </span>
                      <HealthTooltip content={`Select which manufacturer's label to use for ${src.drugName}`}>
                        <select
                          aria-label={`Select label for ${src.drugName}`}
                          value={src.selectedLabelId}
                          onChange={(e) => handleChooseLabelForDrug(src.drugName, e.target.value)}
                          className="flex-1 h-8 px-2.5 rounded-lg bg-[#1c2233] border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                          style={{ colorScheme: "dark" }}
                        >
                          {src.availableLabels!.map((opt) => (
                            <option key={opt.id} value={opt.id} className="bg-[#181d2c]">
                              {opt.title} — {opt.manufacturer}
                              {opt.effectiveDate ? ` (${opt.effectiveDate})` : ""}
                            </option>
                          ))}
                        </select>
                      </HealthTooltip>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Complete Expandable Label Sections */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {activeAnswer.sections.map((sec, idx) => (
              <ExpandableSectionBody key={`${activeAnswer.id}-${sec.heading}-${idx}`} section={sec} />
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

        {showHistory &&
          (history.length === 0 ? (
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
                        <p
                          className={`text-[11px] line-clamp-2 ${
                            item.verdictTone === "amber"
                              ? "text-amber-200/90"
                              : item.verdictTone === "warning"
                              ? "text-orange-200/90"
                              : "text-gray-400"
                          }`}
                        >
                          {item.summaryVerdict}
                        </p>
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
          ))}
      </div>
    </div>
  )
}
