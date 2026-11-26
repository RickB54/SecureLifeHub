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
  Star,
  Tag,
  User,
  FileDown,
  Printer,
  Upload,
  Download,
  GitCompare,
  PlusCircle,
  StickyNote,
} from "lucide-react"
import { toast } from "sonner"
import { fetchOfficialDrugLabels, trimLabelPreview } from "@/lib/drug-database"
import {
  MAX_QA_DRUGS,
  MAX_LOOKUP_PILLS,
  MED_QA_LABEL_DISCLAIMER,
  POPULAR_MED_QUESTIONS,
  PopularMedQuestionTemplate,
  MedQuestionTopicId,
  MedQaHistoryEntry,
  MedQaAnswerSection,
  loadMedQaHistory,
  saveMedQaHistory,
  loadLookupPills,
  saveLookupPills,
  loadSavedPersonNames,
  rememberPersonName,
  savePreferredLabelChoice,
  mirrorMedQaToHealthAiHistory,
  fetchDrugNameSuggestionsClient,
  answerMedicationQuestionFromDailyMed,
} from "@/lib/medication-qa"
import {
  buildMedQaPlainText,
  downloadMedQaPdf,
  printMedQaEntries,
  downloadMedQaBackupJson,
  parseMedQaBackupJson,
} from "@/lib/medication-qa-export"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"

export interface AddMedicationPrefillPayload {
  name: string
  genericName?: string
  drugClass?: string
  purpose?: string
  sideEffects?: string
  interactions?: string
}

interface MedicationAiAssistantPanelProps {
  medRecords: any[]
  onClose?: () => void
  onAddToMedications?: (prefill: AddMedicationPrefillPayload) => void
}

function condenseField(raw: string, maxLen: number): string {
  const clean = (raw || "").replace(/\s+/g, " ").trim()
  if (clean.length <= maxLen) return clean
  const slice = clean.slice(0, maxLen)
  const dotIdx = slice.lastIndexOf(". ")
  if (dotIdx > maxLen * 0.45) return slice.slice(0, dotIdx + 1).trim()
  const sp = slice.lastIndexOf(" ")
  return `${(sp > maxLen * 0.6 ? slice.slice(0, sp) : slice).trim()}…`
}

function renderHighlightedText(text: string, terms?: string[]) {
  if (!terms || terms.length === 0) return text
  const cleanTerms = Array.from(new Set(terms.map((t) => t.trim()).filter((t) => t.length >= 3)))
  if (cleanTerms.length === 0) return text

  const escaped = cleanTerms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
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
        {section.sourceLabel && <span className="text-[10px] text-gray-400">{section.sourceLabel}</span>}
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
          {expanded ? "Show less" : "Show full section"}
        </button>
      )}
    </div>
  )
}

export function MedicationAiAssistantPanel({
  medRecords,
  onClose,
  onAddToMedications,
}: MedicationAiAssistantPanelProps) {
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

  // Lookup-only pills (dashed, stored in localStorage up to 20, NEVER saved to Supabase)
  const [lookupPills, setLookupPills] = useState<string[]>([])
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([])
  const [customDrugInput, setCustomDrugInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addingMedDrug, setAddingMedDrug] = useState<string | null>(null)

  // Question controls
  const [selectedTopicId, setSelectedTopicId] = useState<MedQuestionTopicId | "">("")
  const [questionText, setQuestionText] = useState("")
  const [forPersonInput, setForPersonInput] = useState("Me")
  const [savedPeople, setSavedPeople] = useState<string[]>(["Me"])
  const [saveToHistory, setSaveToHistory] = useState(true)
  const [loading, setLoading] = useState(false)
  const [activeAnswer, setActiveAnswer] = useState<MedQaHistoryEntry | null>(null)

  // Manage My Questions (history + search/filter/sort/select/export/import)
  const [history, setHistory] = useState<MedQaHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(true)
  const [openHistoryIds, setOpenHistoryIds] = useState<Record<string, boolean>>({})
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Record<string, boolean>>({})
  const [historySearch, setHistorySearch] = useState("")
  const [filterPerson, setFilterPerson] = useState("all")
  const [filterStarredOnly, setFilterStarredOnly] = useState(false)
  const [filterTag, setFilterTag] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [editingMetaId, setEditingMetaId] = useState<string | null>(null)
  const [tagDraftById, setTagDraftById] = useState<Record<string, string>>({})

  const suggestBoxRef = useRef<HTMLDivElement | null>(null)
  const importFileRef = useRef<HTMLInputElement | null>(null)

  // Hydrate from localStorage on mount (zero hydration mismatch)
  useEffect(() => {
    setHistory(loadMedQaHistory())
    setLookupPills(loadLookupPills())
    setSavedPeople(loadSavedPersonNames())
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

  // Close suggestions dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (suggestBoxRef.current && !suggestBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  // Debounced fuzzy suggestions while typing (3+ chars)
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
    if (tpl) setQuestionText(tpl.buildQuestion(nextDrugs))
  }

  const toggleSelectDrug = (name: string) => {
    setSelectedDrugs((prev) => {
      const exists = prev.some((d) => d.toLowerCase() === name.toLowerCase())
      if (exists) {
        const next = prev.filter((d) => d.toLowerCase() !== name.toLowerCase())
        syncQuestionToDrugs(next)
        return next
      }
      if (prev.length >= MAX_QA_DRUGS) {
        toast.info(`You can select up to ${MAX_QA_DRUGS} drugs at once.`)
        return prev
      }
      const next = [...prev, name]
      syncQuestionToDrugs(next)
      return next
    })
  }

  const addLookupPill = (rawName: string) => {
    const parts = rawName
      .split(/[,;]+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 2)
    if (parts.length === 0) return

    let nextLookups = [...lookupPills]
    let nextSelected = [...selectedDrugs]
    let hitSelectionCap = false
    let hitLookupCap = false

    for (const p of parts) {
      const isSaved = savedMedNames.some((s) => s.toLowerCase() === p.toLowerCase())
      if (!isSaved && !nextLookups.some((l) => l.toLowerCase() === p.toLowerCase())) {
        if (nextLookups.length >= MAX_LOOKUP_PILLS) {
          hitLookupCap = true
        } else {
          nextLookups = [p, ...nextLookups]
        }
      }
      if (!nextSelected.some((d) => d.toLowerCase() === p.toLowerCase())) {
        if (nextSelected.length >= MAX_QA_DRUGS) {
          hitSelectionCap = true
        } else {
          nextSelected.push(p)
        }
      }
    }

    if (hitLookupCap) toast.info(`Lookup-only pill limit (${MAX_LOOKUP_PILLS}) reached — delete one or clear lookups.`)
    if (hitSelectionCap) toast.info(`You can select up to ${MAX_QA_DRUGS} drugs at once.`)

    setLookupPills(nextLookups)
    saveLookupPills(nextLookups)
    setSelectedDrugs(nextSelected)
    syncQuestionToDrugs(nextSelected)
    setCustomDrugInput("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  const deleteLookupPill = (name: string) => {
    const nextLookups = lookupPills.filter((l) => l.toLowerCase() !== name.toLowerCase())
    setLookupPills(nextLookups)
    saveLookupPills(nextLookups)
    setSelectedDrugs((prev) => {
      const next = prev.filter((d) => d.toLowerCase() !== name.toLowerCase())
      syncQuestionToDrugs(next)
      return next
    })
  }

  const handleClearLookups = () => {
    if (lookupPills.length === 0) return
    const lookupLowSet = new Set(lookupPills.map((l) => l.toLowerCase()))
    setLookupPills([])
    saveLookupPills([])
    setSelectedDrugs((prev) => {
      const next = prev.filter((d) => !lookupLowSet.has(d.toLowerCase()))
      syncQuestionToDrugs(next)
      return next
    })
    toast.success("Cleared all lookup-only pills")
  }

  const handleCompareLookupWithAllSaved = async (lookupName: string) => {
    const combined: string[] = [lookupName]
    for (const s of savedMedNames) {
      if (combined.length >= MAX_QA_DRUGS) break
      if (!combined.some((c) => c.toLowerCase() === s.toLowerCase())) combined.push(s)
    }
    setSelectedDrugs(combined)
    const tpl = POPULAR_MED_QUESTIONS.find((q) => q.id === "together_interactions")!
    const q = tpl.buildQuestion(combined)
    setSelectedTopicId("together_interactions")
    setQuestionText(q)
    await runDailyMedQuery({
      overrideQuestion: q,
      overrideDrugs: combined,
      overrideTopicId: "together_interactions",
    })
  }

  const handleAddLookupToMyMedications = async (lookupName: string) => {
    if (!onAddToMedications) return
    setAddingMedDrug(lookupName)
    try {
      const parenMatch = lookupName.match(/\(([^)]+)\)/)
      const genericHint = parenMatch ? parenMatch[1].trim() : ""
      const cleanName = lookupName.replace(/\([^)]*\)/g, " ").trim() || lookupName
      const res = await fetchOfficialDrugLabels(cleanName, genericHint)
      const label = res.labels[0]
      if (!label) {
        onAddToMedications({ name: cleanName, genericName: genericHint || undefined })
        toast.info(`Opened Add Medication form for "${cleanName}" — click Save when ready.`)
        return
      }
      onAddToMedications({
        name: cleanName,
        genericName: label.genericName || genericHint || undefined,
        drugClass: label.drugClass || undefined,
        purpose: label.usesText ? condenseField(label.usesText, 380) : undefined,
        sideEffects: label.sideEffectsText ? condenseField(label.sideEffectsText, 600) : undefined,
        interactions: label.interactionsText ? condenseField(label.interactionsText, 600) : undefined,
      })
      toast.success(`Prefilled Add Medication form from DailyMed label — nothing is saved until you click Save.`)
    } catch {
      onAddToMedications({ name: lookupName.replace(/\([^)]*\)/g, " ").trim() || lookupName })
    } finally {
      setAddingMedDrug(null)
    }
  }

  const handleAddAllSavedMeds = () => {
    if (savedMedNames.length === 0) {
      toast.info("You have no saved medications yet — type any drug name above.")
      return
    }
    setSelectedDrugs((prev) => {
      const next = [...prev]
      let capped = false
      for (const name of savedMedNames) {
        if (next.some((d) => d.toLowerCase() === name.toLowerCase())) continue
        if (next.length >= MAX_QA_DRUGS) {
          capped = true
          break
        }
        next.push(name)
      }
      if (capped) toast.info(`Selected up to the ${MAX_QA_DRUGS}-drug limit.`)
      syncQuestionToDrugs(next)
      return next
    })
  }

  const handleSelectPopularQuestion = (topicIdStr: string) => {
    const topicId = topicIdStr as MedQuestionTopicId | ""
    setSelectedTopicId(topicId)
    if (!topicId) return
    const tpl = POPULAR_MED_QUESTIONS.find((q) => q.id === topicId)
    if (tpl) setQuestionText(tpl.buildQuestion(selectedDrugs))
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
      const typedParts = customDrugInput
        .split(/[,;]+/)
        .map((p) => p.trim())
        .filter((p) => p.length >= 2)
      let nextLookups = [...lookupPills]
      for (const part of typedParts) {
        if (!savedMedNames.some((s) => s.toLowerCase() === part.toLowerCase()) && !nextLookups.some((l) => l.toLowerCase() === part.toLowerCase()) && nextLookups.length < MAX_LOOKUP_PILLS) {
          nextLookups = [part, ...nextLookups]
        }
        if (effectiveDrugs.length < MAX_QA_DRUGS && !effectiveDrugs.some((d) => d.toLowerCase() === part.toLowerCase())) {
          effectiveDrugs.push(part)
        }
      }
      setLookupPills(nextLookups)
      saveLookupPills(nextLookups)
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
      toast.error("Type a question or choose one from the Popular Questions dropdown.")
      return
    }

    const personClean = forPersonInput.trim() || "Me"
    setSavedPeople(rememberPersonName(personClean))

    setLoading(true)
    try {
      const entry = await answerMedicationQuestionFromDailyMed({
        question: finalQuestion,
        selectedDrugs: effectiveDrugs,
        explicitTopicId: topicToUse,
        savedMeds: medRecords,
        labelOverrides: opts?.labelOverrides,
        forPerson: personClean,
      })

      setActiveAnswer(entry)

      // Only store in localStorage history when "Save this answer to history" is ON and at least one label matched
      if (saveToHistory && entry.sources.length > 0) {
        setHistory((prev) => {
          const next = opts?.replaceEntryId
            ? [entry, ...prev.filter((item) => item.id !== opts.replaceEntryId)].slice(0, 200)
            : [entry, ...prev].slice(0, 200)
          saveMedQaHistory(next)
          return next
        })
        mirrorMedQaToHealthAiHistory(entry)
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not retrieve DailyMed label answer")
    } finally {
      setLoading(false)
    }
  }

  const handleDidYouMeanClick = async (misspelledName: string, replacementName: string) => {
    // Replace misspelled pill in lookupPills & selectedDrugs and re-run immediately
    const nextLookups = Array.from(
      new Set([
        replacementName,
        ...lookupPills.filter((l) => l.toLowerCase() !== misspelledName.toLowerCase()),
      ])
    ).slice(0, MAX_LOOKUP_PILLS)
    setLookupPills(nextLookups)
    saveLookupPills(nextLookups)

    const nextSelected = selectedDrugs.map((d) =>
      d.toLowerCase() === misspelledName.toLowerCase() ? replacementName : d
    )
    if (!nextSelected.some((d) => d.toLowerCase() === replacementName.toLowerCase())) {
      nextSelected.push(replacementName)
    }
    setSelectedDrugs(nextSelected)

    const nextQ = (activeAnswer?.question || questionText).replace(
      new RegExp(misspelledName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
      replacementName
    )
    setQuestionText(nextQ)
    await runDailyMedQuery({
      overrideQuestion: nextQ,
      overrideDrugs: nextSelected,
      overrideTopicId: activeAnswer?.topicId || selectedTopicId,
    })
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

  // ---------- Manage My Questions Handlers ----------
  const updateHistoryEntry = (id: string, patch: Partial<MedQaHistoryEntry>) => {
    setHistory((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      saveMedQaHistory(next)
      return next
    })
    if (patch.forPerson) {
      setSavedPeople(rememberPersonName(patch.forPerson))
    }
  }

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id)
      saveMedQaHistory(next)
      return next
    })
    setSelectedHistoryIds((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    if (activeAnswer?.id === id) setActiveAnswer(null)
  }

  const handleDeleteAllForPerson = (person: string) => {
    const count = history.filter((h) => h.forPerson.toLowerCase() === person.toLowerCase()).length
    if (count === 0) return
    if (!confirm(`Delete all ${count} saved question(s) for "${person}"? This cannot be undone.`)) return
    setHistory((prev) => {
      const next = prev.filter((h) => h.forPerson.toLowerCase() !== person.toLowerCase())
      saveMedQaHistory(next)
      return next
    })
    setSelectedHistoryIds({})
    setFilterPerson("all")
    toast.success(`Deleted all ${count} question(s) for ${person}`)
  }

  const allPeopleInHistory = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of savedPeople) map.set(p.toLowerCase(), p)
    for (const h of history) {
      const p = (h.forPerson || "Me").trim()
      if (p) map.set(p.toLowerCase(), p)
    }
    return Array.from(map.values())
  }, [savedPeople, history])

  const allTagsInHistory = useMemo(() => {
    const set = new Set<string>()
    for (const h of history) {
      for (const t of h.tags || []) set.add(t)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [history])

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase()
    return history
      .filter((item) => {
        if (filterPerson !== "all" && item.forPerson.toLowerCase() !== filterPerson.toLowerCase()) return false
        if (filterStarredOnly && !item.starred) return false
        if (filterTag !== "all" && !(item.tags || []).some((t) => t.toLowerCase() === filterTag.toLowerCase())) {
          return false
        }
        if (!q) return true
        return (
          item.question.toLowerCase().includes(q) ||
          item.summaryVerdict.toLowerCase().includes(q) ||
          item.forPerson.toLowerCase().includes(q) ||
          item.note.toLowerCase().includes(q) ||
          item.drugs.some((d) => d.toLowerCase().includes(q)) ||
          (item.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          item.sections.some((s) => s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        // Starred entries always pinned to top
        if (a.starred !== b.starred) return a.starred ? -1 : 1
        const ta = new Date(a.createdAt).getTime()
        const tb = new Date(b.createdAt).getTime()
        return sortOrder === "oldest" ? ta - tb : tb - ta
      })
  }, [history, historySearch, filterPerson, filterStarredOnly, filterTag, sortOrder])

  const selectedEntries = useMemo(
    () => filteredHistory.filter((item) => Boolean(selectedHistoryIds[item.id])),
    [filteredHistory, selectedHistoryIds]
  )

  const handleExportBackupFile = () => {
    downloadMedQaBackupJson({
      version: 1,
      exportedAt: new Date().toISOString(),
      history,
      lookupPills,
      people: allPeopleInHistory,
    })
    toast.success("Exported Q&A history and lookup pills to JSON file")
  }

  const handleImportBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const text = await file.text()
      const imported = parseMedQaBackupJson(text)
      if (imported.history.length === 0 && imported.lookupPills.length === 0) {
        toast.error("No Q&A history or lookup pills found in that file.")
        return
      }
      // Merge without duplicates by id
      setHistory((prev) => {
        const seen = new Set(prev.map((x) => x.id))
        const merged = [...prev]
        for (const item of imported.history) {
          if (!seen.has(item.id)) {
            seen.add(item.id)
            merged.push(item)
          }
        }
        saveMedQaHistory(merged)
        return merged
      })
      if (imported.lookupPills.length > 0) {
        setLookupPills((prev) => {
          const merged = Array.from(new Set([...prev, ...imported.lookupPills])).slice(0, MAX_LOOKUP_PILLS)
          saveLookupPills(merged)
          return merged
        })
      }
      for (const p of imported.people) rememberPersonName(p)
      setSavedPeople(loadSavedPersonNames())
      toast.success(`Imported ${imported.history.length} question(s) into this browser`)
    } catch {
      toast.error("Could not read backup file. Please choose a valid JSON export file.")
    }
  }

  const groupedTemplates = useMemo(() => {
    const groups: Array<{ name: PopularMedQuestionTemplate["group"]; items: PopularMedQuestionTemplate[] }> = [
      { name: "Interactions & Mixing", items: [] },
      { name: "How to Take & Monitoring", items: [] },
      { name: "Side Effects & Safety", items: [] },
    ]
    for (const q of POPULAR_MED_QUESTIONS) {
      const g = groups.find((x) => x.name === q.group)
      if (g) g.items.push(q)
    }
    return groups
  }, [])

  return (
    <div className="mb-3 p-3.5 rounded-2xl bg-[#131826] border border-blue-500/30 space-y-3.5 text-white shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
          <h3 className="text-sm font-bold text-blue-200 truncate">
            DailyMed Medication Q&amp;A &amp; Interaction Checker
          </h3>
          <FieldHelpPopover
            title="Free-Form DailyMed Q&A & Lookup Pills"
            content="Type any drug (generic or brand, with fuzzy spelling suggestions) to create a dashed Lookup-only pill (never saved to your database). Tap solid saved-med pills or dashed lookup pills to select up to 6 at once, then ask any free-form question or pick a Popular Question. Answers come straight from official DailyMed / FDA labels and are stored only in this browser."
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
            Stored only in this browser
          </span>
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
      </div>

      {/* STEP 1: Saved Meds (solid pills) + Lookup-Only Pills (dashed pills) + Fuzzy Search Box */}
      <div className="space-y-2.5 rounded-xl border border-white/10 bg-black/25 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
            Select Drugs ({selectedDrugs.length}/{MAX_QA_DRUGS} selected)
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {savedMedNames.length > 0 && (
              <HealthTooltip content={`Select all saved medications (up to ${MAX_QA_DRUGS} at once)`}>
                <button
                  type="button"
                  onClick={handleAddAllSavedMeds}
                  className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-[11px] font-semibold text-blue-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ListPlus className="h-3 w-3" />
                  <span>Add all my medications</span>
                </button>
              </HealthTooltip>
            )}
            {lookupPills.length > 0 && (
              <HealthTooltip content="Remove all dashed Lookup-only pills from this browser">
                <button
                  type="button"
                  onClick={handleClearLookups}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 text-[11px] font-semibold text-gray-300 hover:text-red-300 cursor-pointer"
                >
                  Clear lookups
                </button>
              </HealthTooltip>
            )}
          </div>
        </div>

        {/* + Any other drug... input with fuzzy suggestions */}
        <div ref={suggestBoxRef} className="relative">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={customDrugInput}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                onChange={(e) => setCustomDrugInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (customDrugInput.trim()) addLookupPill(customDrugInput)
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false)
                  }
                }}
                placeholder="+ Any other drug (generic or brand, e.g. Promacta, Lisinopril)..."
                aria-label="Add any drug for lookup only"
                className="w-full h-9 pl-8 pr-8 rounded-xl bg-[#1c2233] border border-white/15 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {suggestLoading && (
                <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <HealthTooltip content="Add as a dashed Lookup-only pill (stored only in this browser, never saved to your medications)">
              <button
                type="button"
                disabled={!customDrugInput.trim()}
                onClick={() => addLookupPill(customDrugInput)}
                className="h-9 px-3 rounded-xl bg-purple-600/25 hover:bg-purple-600/35 disabled:opacity-40 border border-dashed border-purple-400/60 text-xs font-semibold text-purple-100 inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Lookup pill</span>
              </button>
            </HealthTooltip>
          </div>

          {/* Fuzzy Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 z-30 rounded-xl border border-white/15 bg-[#161b29] shadow-2xl overflow-hidden max-h-52 overflow-y-auto custom-scrollbar">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => addLookupPill(sug)}
                  className="w-full px-3 py-2 text-left text-xs text-gray-100 hover:bg-purple-600/25 flex items-center justify-between gap-2 border-b border-white/5 last:border-b-0 cursor-pointer"
                >
                  <span className="font-medium truncate">{sug}</span>
                  <span className="text-[10px] text-purple-300 shrink-0">+ Lookup pill</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Saved Medications: Solid Pills (toggle selection only, cannot be deleted here) */}
        {savedMedNames.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              My Medications (solid — tap to select)
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {savedMedNames.map((name) => {
                const isSelected = selectedDrugs.some((d) => d.toLowerCase() === name.toLowerCase())
                return (
                  <HealthTooltip key={name} content={isSelected ? `Deselect ${name}` : `Select ${name}`}>
                    <button
                      type="button"
                      onClick={() => toggleSelectDrug(name)}
                      aria-pressed={isSelected}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-600/35 border-blue-400 text-white shadow-sm"
                          : "bg-white/[0.06] border-white/15 text-gray-300 hover:text-white"
                      }`}
                    >
                      {name}
                    </button>
                  </HealthTooltip>
                )
              })}
            </div>
          </div>
        )}

        {/* Lookup-Only Pills: Dashed Pills (never saved as medication; tap select, x delete, Compare, Add to my meds) */}
        {lookupPills.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300/80">
              Lookup Only ({lookupPills.length}/{MAX_LOOKUP_PILLS} — dashed, never saved to your medications)
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {lookupPills.map((pill) => {
                const isSelected = selectedDrugs.some((d) => d.toLowerCase() === pill.toLowerCase())
                return (
                  <div
                    key={pill}
                    className={`inline-flex items-center gap-1 rounded-full border border-dashed pl-2.5 pr-1 py-0.5 text-xs transition-colors ${
                      isSelected
                        ? "bg-purple-600/30 border-purple-400 text-purple-100"
                        : "bg-purple-500/10 border-purple-400/45 text-purple-200/80 hover:border-purple-400"
                    }`}
                  >
                    <HealthTooltip content={isSelected ? `Deselect Lookup-only pill "${pill}"` : `Select Lookup-only pill "${pill}"`}>
                      <button
                        type="button"
                        onClick={() => toggleSelectDrug(pill)}
                        className="font-semibold cursor-pointer"
                      >
                        {pill}
                      </button>
                    </HealthTooltip>
                    <span className="text-[9px] uppercase tracking-wider text-purple-300/70 px-1">Lookup</span>

                    {savedMedNames.length > 0 && (
                      <HealthTooltip content={`Compare ${pill} with all my medications`}>
                        <button
                          type="button"
                          onClick={() => handleCompareLookupWithAllSaved(pill)}
                          aria-label={`Compare ${pill} with all my medications`}
                          className="p-1 rounded-full hover:bg-white/15 text-blue-300 hover:text-white cursor-pointer"
                        >
                          <GitCompare className="h-3 w-3" />
                        </button>
                      </HealthTooltip>
                    )}

                    {onAddToMedications && (
                      <HealthTooltip content={`Add ${pill} to my medications (opens Add Med form prefilled from label; nothing saves until you click Save)`}>
                        <button
                          type="button"
                          disabled={addingMedDrug === pill}
                          onClick={() => handleAddLookupToMyMedications(pill)}
                          aria-label={`Add ${pill} to my medications`}
                          className="p-1 rounded-full hover:bg-white/15 text-emerald-300 hover:text-white cursor-pointer disabled:opacity-50"
                        >
                          {addingMedDrug === pill ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <PlusCircle className="h-3 w-3" />
                          )}
                        </button>
                      </HealthTooltip>
                    )}

                    <HealthTooltip content={`Delete Lookup-only pill "${pill}"`}>
                      <button
                        type="button"
                        onClick={() => deleteLookupPill(pill)}
                        aria-label={`Delete lookup pill ${pill}`}
                        className="p-1 rounded-full hover:bg-red-500/30 text-purple-200 hover:text-red-200 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </HealthTooltip>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Popular Questions Dropdown + Large Free-Form Question Box + For + Save toggle */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2 space-y-1">
            <label
              htmlFor="popular-med-questions-select"
              className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block"
            >
              Popular Questions
            </label>
            <HealthTooltip content="Pick a common question or leave blank to type any free-form question below">
              <select
                id="popular-med-questions-select"
                value={selectedTopicId}
                onChange={(e) => handleSelectPopularQuestion(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#1c2233] border border-white/15 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ colorScheme: "dark" }}
              >
                <option value="">Choose a popular question (or type any question below)...</option>
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

          <div className="space-y-1">
            <label htmlFor="qa-for-person-input" className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              For:
            </label>
            <HealthTooltip content="Who this question is for (e.g. Me, Mom). Names are remembered on this device.">
              <input
                id="qa-for-person-input"
                type="text"
                list="med-qa-people-list"
                value={forPersonInput}
                onChange={(e) => setForPersonInput(e.target.value)}
                placeholder="Me, Mom..."
                className="w-full h-9 px-3 rounded-xl bg-[#1c2233] border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </HealthTooltip>
            <datalist id="med-qa-people-list">
              {allPeopleInHistory.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Large Free-Form Question Box */}
        <textarea
          rows={3}
          placeholder="Type any question about the selected drug(s)... e.g. 'Should this be taken on an empty stomach or away from dairy/calcium? What liver blood tests are needed? Is it safe for an 88-year-old?'"
          value={questionText}
          onChange={(e) => {
            setQuestionText(e.target.value)
            setSelectedTopicId("")
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !loading) {
              e.preventDefault()
              runDailyMedQuery()
            }
          }}
          className="w-full p-3 bg-[#1c2233] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <HealthTooltip content="When checked, this question and DailyMed answer are saved in your browser's local history. Uncheck to view without saving.">
            <label className="inline-flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToHistory}
                onChange={(e) => setSaveToHistory(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-black/60 text-blue-500 focus:ring-blue-500 cursor-pointer"
              />
              <span>Save this answer to history</span>
            </label>
          </HealthTooltip>

          <HealthTooltip content="Search official DailyMed / FDA prescribing labels for the selected drug(s)">
            <button
              type="button"
              disabled={loading}
              onClick={() => runDailyMedQuery()}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching DailyMed...</span>
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

      {/* LATEST ANSWER CARD */}
      {activeAnswer && (
        <div className="rounded-xl border border-blue-400/35 bg-[#0d111c] p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-bold text-blue-300">
                Question ({activeAnswer.forPerson}): {activeAnswer.question}
              </div>
              {!saveToHistory && (
                <div className="text-[10px] text-amber-300">Not saved to history (Save checkbox was off).</div>
              )}
            </div>
            <HealthTooltip content="Copy question and official DailyMed answer">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(buildMedQaPlainText([activeAnswer]))
                  toast.success("Copied to clipboard")
                }}
                aria-label="Copy answer"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white shrink-0 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </HealthTooltip>
          </div>

          {/* Headline Verdict Banner */}
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

          {/* Missing Drug(s) + "Did you mean ...?" tappable suggestions */}
          {activeAnswer.missingDrugs && activeAnswer.missingDrugs.length > 0 && (
            <div className="space-y-2">
              {activeAnswer.missingDrugs.map((miss) => (
                <div
                  key={miss.name}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-2 text-xs text-amber-100"
                >
                  <div>{miss.message}</div>
                  {miss.didYouMean.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-amber-200">Did you mean:</span>
                      {miss.didYouMean.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleDidYouMeanClick(miss.name, sug)}
                          className="px-2.5 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400/35 border border-amber-400/50 text-amber-50 font-semibold text-xs cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Multi-Label Chooser (remembered per drug in localStorage) */}
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
                      <span className="font-semibold text-blue-200 sm:w-28 shrink-0 truncate">{src.drugName}:</span>
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
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Expandable Label Sections */}
          {activeAnswer.sections.length > 0 && (
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
              {activeAnswer.sections.map((sec, idx) => (
                <ExpandableSectionBody key={`${activeAnswer.id}-${sec.heading}-${idx}`} section={sec} />
              ))}
            </div>
          )}

          {/* DailyMed Links + Required Disclaimer */}
          <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px]">
            {activeAnswer.sources.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-400 font-semibold">Full label on DailyMed:</span>
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
            )}
            <div className="text-[11px] text-amber-200/85 font-medium">{MED_QA_LABEL_DISCLAIMER}</div>
          </div>
        </div>
      )}

      {/* STEP 3: MANAGE MY QUESTIONS (Local History Manager + Bulk PDF / Print / Copy + JSON Export / Import) */}
      <div className="pt-2 border-t border-white/10 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-200 hover:text-white cursor-pointer"
          >
            <History className="h-3.5 w-3.5 text-blue-400" />
            <span>Manage My Questions ({history.length})</span>
            {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {/* JSON Backup Export / Import */}
          <div className="flex flex-wrap items-center gap-1.5">
            <HealthTooltip content="Export all saved Q&A history and lookup pills to a JSON backup file">
              <button
                type="button"
                onClick={handleExportBackupFile}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>Export all to a file</span>
              </button>
            </HealthTooltip>
            <HealthTooltip content="Import previously exported Q&A history JSON into this browser">
              <button
                type="button"
                onClick={() => importFileRef.current?.click()}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Upload className="h-3 w-3" />
                <span>Import</span>
              </button>
            </HealthTooltip>
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackupFile}
              className="hidden"
            />
          </div>
        </div>

        {showHistory && (
          <div className="space-y-2.5">
            {/* Search, Filter by Person, Starred, Tag, Sort */}
            {history.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search questions, drugs, tags, notes..."
                      className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <HealthTooltip content="Filter history by person (For:)">
                    <select
                      aria-label="Filter by person"
                      value={filterPerson}
                      onChange={(e) => setFilterPerson(e.target.value)}
                      className="h-8 px-2 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-200 cursor-pointer"
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="all">All people</option>
                      {allPeopleInHistory.map((p) => (
                        <option key={p} value={p}>
                          For: {p}
                        </option>
                      ))}
                    </select>
                  </HealthTooltip>

                  <HealthTooltip content="Show starred (pinned) questions only">
                    <button
                      type="button"
                      onClick={() => setFilterStarredOnly((prev) => !prev)}
                      aria-pressed={filterStarredOnly}
                      className={`h-8 px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                        filterStarredOnly
                          ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                          : "bg-black/40 border-white/10 text-gray-300 hover:text-white"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${filterStarredOnly ? "fill-amber-400 text-amber-400" : ""}`} />
                      <span>Starred</span>
                    </button>
                  </HealthTooltip>

                  {allTagsInHistory.length > 0 && (
                    <HealthTooltip content="Filter history by tag">
                      <select
                        aria-label="Filter by tag"
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="h-8 px-2 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-200 cursor-pointer"
                        style={{ colorScheme: "dark" }}
                      >
                        <option value="all">All tags</option>
                        {allTagsInHistory.map((t) => (
                          <option key={t} value={t}>
                            #{t}
                          </option>
                        ))}
                      </select>
                    </HealthTooltip>
                  )}

                  <HealthTooltip content="Sort saved questions by date (starred always pinned on top)">
                    <select
                      aria-label="Sort questions by date"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                      className="h-8 px-2 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-200 cursor-pointer"
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  </HealthTooltip>
                </div>

                {/* Selection Bulk Bar + Delete all for <person> */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected =
                          filteredHistory.length > 0 &&
                          filteredHistory.every((h) => Boolean(selectedHistoryIds[h.id]))
                        if (allSelected) {
                          setSelectedHistoryIds({})
                        } else {
                          const map: Record<string, boolean> = {}
                          for (const h of filteredHistory) map[h.id] = true
                          setSelectedHistoryIds(map)
                        }
                      }}
                      className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer"
                    >
                      {filteredHistory.length > 0 &&
                      filteredHistory.every((h) => Boolean(selectedHistoryIds[h.id]))
                        ? "Unselect all"
                        : `Select all (${filteredHistory.length})`}
                    </button>

                    {selectedEntries.length > 0 && (
                      <>
                        <HealthTooltip content="Export selected Q&As to Letter-size PDF">
                          <button
                            type="button"
                            onClick={() => {
                              downloadMedQaPdf(selectedEntries)
                              toast.success(`Exported ${selectedEntries.length} Q&A(s) to PDF`)
                            }}
                            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileDown className="h-3 w-3" />
                            <span>Export PDF ({selectedEntries.length})</span>
                          </button>
                        </HealthTooltip>
                        <HealthTooltip content="Print selected Q&As">
                          <button
                            type="button"
                            onClick={() => printMedQaEntries(selectedEntries)}
                            className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Print</span>
                          </button>
                        </HealthTooltip>
                        <HealthTooltip content="Copy selected Q&As as text">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(buildMedQaPlainText(selectedEntries))
                              toast.success(`Copied ${selectedEntries.length} Q&A(s)`)
                            }}
                            className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </button>
                        </HealthTooltip>
                      </>
                    )}
                  </div>

                  {filterPerson !== "all" && (
                    <HealthTooltip content={`Delete every saved question for ${filterPerson}`}>
                      <button
                        type="button"
                        onClick={() => handleDeleteAllForPerson(filterPerson)}
                        className="px-2 py-1 rounded-md bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete all for {filterPerson}</span>
                      </button>
                    </HealthTooltip>
                  )}
                </div>
              </div>
            )}

            {/* History List */}
            {filteredHistory.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                {history.length === 0
                  ? "Saved questions and DailyMed answers appear here (stored only in this browser)."
                  : "No saved questions match your current search or filters."}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {filteredHistory.map((item) => {
                  const isExpanded = Boolean(openHistoryIds[item.id])
                  const isChecked = Boolean(selectedHistoryIds[item.id])
                  const isEditingMeta = editingMetaId === item.id
                  const d = new Date(item.createdAt)
                  const dateStr = isNaN(d.getTime())
                    ? ""
                    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border px-3 py-2 space-y-2 ${
                        item.starred ? "border-amber-500/35 bg-amber-950/15" : "border-white/10 bg-black/35"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setSelectedHistoryIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                          }
                          aria-label={`Select question ${item.question}`}
                          className="mt-1 h-3.5 w-3.5 rounded border-gray-600 bg-black/60 text-blue-500 cursor-pointer shrink-0"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setOpenHistoryIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                          }
                          className="flex-1 min-w-0 text-left space-y-1 cursor-pointer"
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-100">{item.question}</span>
                            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-semibold text-gray-200 inline-flex items-center gap-0.5">
                              <User className="h-2.5 w-2.5" />
                              {item.forPerson}
                            </span>
                            {item.drugs.map((dr) => (
                              <span
                                key={dr}
                                className="px-1.5 py-0.2 rounded bg-blue-500/15 border border-blue-500/25 text-[10px] font-semibold text-blue-300"
                              >
                                {dr}
                              </span>
                            ))}
                            {(item.tags || []).map((tg) => (
                              <span
                                key={tg}
                                className="px-1.5 py-0.2 rounded bg-purple-500/15 border border-purple-500/25 text-[10px] text-purple-200"
                              >
                                #{tg}
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
                          {item.note.trim() && (
                            <p className="text-[11px] text-emerald-300/90 italic line-clamp-1">
                              Note: {item.note}
                            </p>
                          )}
                        </button>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <HealthTooltip content={item.starred ? "Unstar" : "Star to pin to top"}>
                            <button
                              type="button"
                              onClick={() => updateHistoryEntry(item.id, { starred: !item.starred })}
                              aria-label="Star question"
                              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-amber-300 cursor-pointer"
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  item.starred ? "fill-amber-400 text-amber-400" : ""
                                }`}
                              />
                            </button>
                          </HealthTooltip>
                          <HealthTooltip content="Edit person, tags, and private note">
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditingMeta) {
                                  setEditingMetaId(null)
                                } else {
                                  setTagDraftById((prev) => ({
                                    ...prev,
                                    [item.id]: (item.tags || []).join(", "),
                                  }))
                                  setEditingMetaId(item.id)
                                }
                              }}
                              aria-label="Edit tags and note"
                              className={`p-1 rounded hover:bg-white/10 cursor-pointer ${
                                isEditingMeta ? "text-blue-300 bg-white/10" : "text-gray-400 hover:text-white"
                              }`}
                            >
                              <StickyNote className="h-3.5 w-3.5" />
                            </button>
                          </HealthTooltip>
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

                      {/* Inline Edit For / Tags / Private Note */}
                      {isEditingMeta && (
                        <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">
                              For:
                            </label>
                            <input
                              type="text"
                              list="med-qa-people-list"
                              value={item.forPerson}
                              onChange={(e) => updateHistoryEntry(item.id, { forPerson: e.target.value })}
                              className="w-full h-7 px-2 rounded-md bg-black/50 border border-white/15 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">
                              Tags (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={tagDraftById[item.id] ?? (item.tags || []).join(", ")}
                              onChange={(e) => {
                                const val = e.target.value
                                setTagDraftById((prev) => ({ ...prev, [item.id]: val }))
                                const parsed = val
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean)
                                updateHistoryEntry(item.id, { tags: parsed })
                              }}
                              placeholder="e.g. liver, mom, follow-up"
                              className="w-full h-7 px-2 rounded-md bg-black/50 border border-white/15 text-xs text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">
                              Private note
                            </label>
                            <textarea
                              rows={2}
                              value={item.note}
                              onChange={(e) => updateHistoryEntry(item.id, { note: e.target.value })}
                              placeholder="Add a personal note (stays only in this browser)..."
                              className="w-full p-2 rounded-md bg-black/50 border border-white/15 text-xs text-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* Expanded Full Answer */}
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
                          <div className="text-[10px] text-amber-200/80">{MED_QA_LABEL_DISCLAIMER}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
