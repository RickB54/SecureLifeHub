"use client"

import { OfficialDrugLabel, fetchOfficialDrugLabels } from "./drug-database"

export type MedQuestionTopicId =
  | "together_interactions"
  | "drug_interactions"
  | "food_alcohol"
  | "uses"
  | "dosage"
  | "missed_overdose"
  | "side_effects"
  | "warnings_contraindications"
  | "pregnancy"
  | "mechanism"
  | "patient_guide"
  | "storage"

export interface PopularMedQuestionTemplate {
  id: MedQuestionTopicId
  group: "Interactions & Mixing" | "Uses, Dosage & How to Take" | "Side Effects & Safety"
  shortTitle: string
  multiDrug?: boolean
  buildQuestion: (drugs: string[]) => string
}

export const MAX_QA_DRUGS = 5

export const POPULAR_MED_QUESTIONS: PopularMedQuestionTemplate[] = [
  {
    id: "together_interactions",
    group: "Interactions & Mixing",
    shortTitle: "Can I take these drugs together & what are their interactions?",
    multiDrug: true,
    buildQuestion: (drugs) => {
      if (drugs.length >= 2) {
        const list =
          drugs.length === 2
            ? `${drugs[0]} and ${drugs[1]}`
            : `${drugs.slice(0, -1).join(", ")}, and ${drugs[drugs.length - 1]}`
        return `Can I take ${list} together, and what are their interactions?`
      }
      const d = drugs[0] || "this medication"
      return `What other medications interact with ${d}, and can I take them together?`
    },
  },
  {
    id: "drug_interactions",
    group: "Interactions & Mixing",
    shortTitle: "What prescription drugs, OTC meds, or supplements interact with it?",
    buildQuestion: (drugs) =>
      `What prescription drugs, OTC medications, or supplements interact with ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "food_alcohol",
    group: "Interactions & Mixing",
    shortTitle: "Can I take it with food, alcohol, or grapefruit?",
    buildQuestion: (drugs) => `Can I take ${drugs.join(", ") || "this medication"} with food, alcohol, or grapefruit?`,
  },
  {
    id: "uses",
    group: "Uses, Dosage & How to Take",
    shortTitle: "What is this medication used for (official indications)?",
    buildQuestion: (drugs) => `What is ${drugs.join(", ") || "this medication"} used for?`,
  },
  {
    id: "dosage",
    group: "Uses, Dosage & How to Take",
    shortTitle: "What is the recommended dosage and how should I take it?",
    buildQuestion: (drugs) =>
      `What is the recommended dosage and how should I take ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "missed_overdose",
    group: "Uses, Dosage & How to Take",
    shortTitle: "What should I do for a missed dose or accidental overdose?",
    buildQuestion: (drugs) =>
      `What should I do if I miss a dose or take too much of ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "mechanism",
    group: "Uses, Dosage & How to Take",
    shortTitle: "How does this medication work in the body?",
    buildQuestion: (drugs) => `How does ${drugs.join(", ") || "this medication"} work in the body?`,
  },
  {
    id: "side_effects",
    group: "Side Effects & Safety",
    shortTitle: "What are the common and serious side effects?",
    buildQuestion: (drugs) => `What are the common and serious side effects of ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "warnings_contraindications",
    group: "Side Effects & Safety",
    shortTitle: "What are the important warnings and who should NOT take it?",
    buildQuestion: (drugs) =>
      `What are the important warnings and contraindications (who should not take ${drugs.join(", ") || "this medication"})?`,
  },
  {
    id: "pregnancy",
    group: "Side Effects & Safety",
    shortTitle: "Is it safe during pregnancy or breastfeeding?",
    buildQuestion: (drugs) => `Is ${drugs.join(", ") || "this medication"} safe during pregnancy or breastfeeding?`,
  },
  {
    id: "patient_guide",
    group: "Side Effects & Safety",
    shortTitle: "What key patient counseling / Medication Guide points apply?",
    buildQuestion: (drugs) =>
      `What patient counseling or Medication Guide instructions apply to ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "storage",
    group: "Side Effects & Safety",
    shortTitle: "How should I store this medication?",
    buildQuestion: (drugs) => `How should I store ${drugs.join(", ") || "this medication"}?`,
  },
]

export interface MedQaLabelChoiceOption {
  id: string
  title: string
  manufacturer: string
  effectiveDate: string
  dailyMedUrl: string
}

export interface MedQaSourceLink {
  drugName: string
  selectedLabelId: string
  labelTitle: string
  manufacturer: string
  effectiveDate: string
  dailyMedUrl: string
  availableLabels?: MedQaLabelChoiceOption[]
}

export interface MedQaAnswerSection {
  heading: string
  body: string
  tone?: "info" | "warning" | "match" | "boxed"
  sourceLabel?: string
  matchedTerms?: string[]
  drugGroup?: string
}

export interface MedQaHistoryEntry {
  id: string
  createdAt: string
  question: string
  topicId: MedQuestionTopicId
  drugs: string[]
  summaryVerdict: string
  verdictTone?: "amber" | "warning" | "info"
  sections: MedQaAnswerSection[]
  sources: MedQaSourceLink[]
}

export const MED_QA_HISTORY_KEY = "slh_med_qa_history_v1"
const LABEL_CHOICE_STORAGE_KEY = "slh_med_qa_label_choices_v1"

export function loadPreferredLabelChoices(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(LABEL_CHOICE_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function savePreferredLabelChoice(drugName: string, labelId: string) {
  if (typeof window === "undefined") return
  const key = drugName.trim().toLowerCase()
  if (!key || !labelId) return
  try {
    const current = loadPreferredLabelChoices()
    current[key] = labelId
    window.localStorage.setItem(LABEL_CHOICE_STORAGE_KEY, JSON.stringify(current))
  } catch {
    // Ignore storage quota errors
  }
}

export function loadMedQaHistory(): MedQaHistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(MED_QA_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveMedQaHistory(entries: MedQaHistoryEntry[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(MED_QA_HISTORY_KEY, JSON.stringify(entries.slice(0, 100)))
  } catch {
    // Ignore storage quota errors
  }
}

export function mirrorMedQaToHealthAiHistory(entry: MedQaHistoryEntry) {
  if (typeof window === "undefined") return
  try {
    const raw = window.localStorage.getItem("health-ai-history-v2")
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) return

    const aiMarkdown = [
      `**Official DailyMed / FDA Answer**`,
      ``,
      `**Summary:** ${entry.summaryVerdict}`,
      ...entry.sections.map((s) => `\n**${s.heading}**${s.sourceLabel ? `\n_${s.sourceLabel}_` : ""}\n${s.body}`),
      entry.sources.length > 0
        ? `\n**Official DailyMed Sources:**\n${entry.sources
            .map((src) => `- ${src.labelTitle} (${src.manufacturer}): ${src.dailyMedUrl}`)
            .join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n")

    const nowIso = entry.createdAt || new Date().toISOString()
    const newConv = {
      id: `med-qa-${entry.id}`,
      title: entry.question.slice(0, 60),
      topics: ["Medications", "DailyMed", ...entry.drugs],
      lastUpdated: nowIso,
      messages: [
        { id: `${entry.id}-u`, role: "user", content: entry.question, timestamp: nowIso },
        {
          id: `${entry.id}-a`,
          role: "ai",
          content: aiMarkdown,
          urgency: entry.verdictTone === "warning" || entry.verdictTone === "amber" ? "moderate" : "info",
          timestamp: nowIso,
          sources: entry.sources.map((s) => `DailyMed: ${s.labelTitle}`),
        },
      ],
    }

    const filtered = list.filter((c: any) => c?.id !== `med-qa-${entry.id}`)
    window.localStorage.setItem("health-ai-history-v2", JSON.stringify([newConv, ...filtered].slice(0, 50)))
  } catch {
    // Ignore
  }
}

export async function fetchDrugNameSuggestionsClient(prefix: string): Promise<string[]> {
  const clean = prefix.trim()
  if (clean.length < 3) return []
  try {
    const res = await fetch(`/api/drug-label?suggest=${encodeURIComponent(clean)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.suggestions) ? json.suggestions : []
  } catch {
    return []
  }
}

const STOP_WORDS = new Set([
  "can", "i", "take", "taking", "took", "together", "and", "or", "with", "what", "are", "is",
  "there", "their", "the", "a", "an", "of", "for", "to", "in", "on", "at", "by", "from", "my",
  "me", "it", "its", "this", "that", "these", "those", "interactions", "interaction", "interact",
  "drug", "drugs", "medication", "medications", "med", "meds", "pill", "pills", "tablet", "tablets",
  "capsule", "capsules", "side", "effects", "effect", "dosage", "dose", "doses", "used", "use",
  "uses", "how", "should", "do", "does", "if", "miss", "missed", "overdose", "much", "too",
  "safe", "during", "pregnancy", "pregnant", "breastfeeding", "nursing", "warnings", "warning",
  "contraindications", "who", "not", "store", "storage", "work", "works", "body", "food", "eat",
  "eating", "drink", "drinking", "alcohol", "grapefruit", "any", "other", "between", "have",
  "has", "about", "tell", "please", "official", "indications", "patient", "guide", "counseling",
  "common", "serious", "important", "recommended", "prescription", "otc", "supplements", "accidental",
])

export function inferTopicFromQuestion(question: string, drugCount: number): MedQuestionTopicId {
  const q = question.toLowerCase()
  if (q.includes("alcohol") || q.includes("grapefruit") || (q.includes("food") && !q.includes("fda"))) {
    return "food_alcohol"
  }
  if (q.includes("together") || (drugCount >= 2 && (q.includes("interact") || q.includes("mix") || q.includes("with")))) {
    return "together_interactions"
  }
  if (q.includes("interact") || q.includes("mix")) return drugCount >= 2 ? "together_interactions" : "drug_interactions"
  if (q.includes("miss") || q.includes("overdose") || q.includes("too much")) return "missed_overdose"
  if (q.includes("pregnant") || q.includes("pregnancy") || q.includes("breastfeed") || q.includes("lactat") || q.includes("nursing")) {
    return "pregnancy"
  }
  if (q.includes("store") || q.includes("storage") || q.includes("keep")) return "storage"
  if (q.includes("side effect") || q.includes("adverse") || q.includes("reaction")) return "side_effects"
  if (q.includes("warn") || q.includes("contraindicat") || q.includes("not take") || q.includes("avoid")) {
    return "warnings_contraindications"
  }
  if (q.includes("dosage") || q.includes("dose") || q.includes("how should i take") || q.includes("how to take")) {
    return "dosage"
  }
  if (q.includes("how does") || q.includes("mechanism") || q.includes("work")) return "mechanism"
  if (q.includes("counsel") || q.includes("medguide") || q.includes("medication guide")) return "patient_guide"
  if (q.includes("used for") || q.includes("indication") || q.includes("purpose") || q.includes("treat")) return "uses"
  return drugCount >= 2 ? "together_interactions" : "uses"
}

export function extractDrugNamesFromQuestion(
  question: string,
  selectedDrugs: string[],
  savedMeds: Array<{ title?: string; item_metadata?: { genericName?: string } }>
): string[] {
  const found: string[] = []
  const addUnique = (name?: string) => {
    const clean = (name || "").trim()
    if (!clean || clean.length < 2) return
    if (!found.some((f) => f.toLowerCase() === clean.toLowerCase())) {
      found.push(clean)
    }
  }

  // 1. Explicitly selected drug chips first (preserves user's chosen order)
  for (const d of selectedDrugs) {
    addUnique(d)
  }

  // 2. Saved medications mentioned in the question text
  const qLower = question.toLowerCase()
  for (const m of savedMeds) {
    const title = (m.title || "").trim()
    const baseTitle = title.replace(/\([^)]*\)/g, "").trim()
    const generic = (m.item_metadata?.genericName || "").trim()
    if (baseTitle && baseTitle.length >= 3 && qLower.includes(baseTitle.toLowerCase())) {
      addUnique(baseTitle)
    } else if (generic && generic.length >= 3 && qLower.includes(generic.toLowerCase())) {
      addUnique(generic)
    }
  }

  // 3. Any additional drug names typed directly in the question
  if (found.length === 0) {
    const cleaned = question.replace(/[?!.;:()[\]"]/g, " ")
    const rawTokens = cleaned.split(/[\s,/]+/).filter(Boolean)
    for (const tok of rawTokens) {
      const cleanTok = tok.trim()
      if (cleanTok.length < 3) continue
      if (/^\d/.test(cleanTok)) continue
      if (STOP_WORDS.has(cleanTok.toLowerCase())) continue
      addUnique(cleanTok)
    }
  }

  return found.slice(0, MAX_QA_DRUGS)
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

interface SearchTermCandidate {
  term: string
  pattern: RegExp
}

function buildDetailedSearchTermsForDrug(label: OfficialDrugLabel, fallbackName: string): SearchTermCandidate[] {
  const termMap = new Map<string, string>()

  const addTerm = (raw?: string) => {
    if (!raw) return
    const cleaned = raw
      .replace(/\[(?:EPC|MoA|CS|PE|Chemical\/Ingredient)\]/gi, " ")
      .replace(/\b(tartrate|hydrochloride|hcl|sodium|calcium|potassium|besylate|maleate|succinate|fumarate|mesylate|sulfate|acetate|phosphate|citrate|pamoate|monohydrate|dihydrate|tablets?|capsules?|oral|extended[- ]release)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (cleaned.length < 4) return
    const key = cleaned.toLowerCase()
    if (!termMap.has(key)) termMap.set(key, cleaned)
  }

  // 1. Generic name(s) & user-entered name
  addTerm(fallbackName)
  for (const part of (label.genericName || "").split(/[,;/]+/)) {
    addTerm(part)
  }

  // 2. Brand names
  for (const brand of (label.brandNames || []).slice(0, 6)) {
    addTerm(brand)
  }

  // 3. Pharmacologic class terms from openfda pharm_class_epc, pharm_class_moa, pharm_class_cs
  const rawClasses = [
    ...(label.pharmClassEpc || []),
    ...(label.pharmClassMoa || []),
    ...(label.pharmClassCs || []),
    ...(label.drugClass ? label.drugClass.split(/[;]+/) : []),
  ]

  for (const cls of rawClasses) {
    const base = cls
      .replace(/\[(?:EPC|MoA|CS|PE|Chemical\/Ingredient)\]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (base.length >= 4) {
      addTerm(base)
      // Common clinical abbreviations/synonyms directly derived from official EPC/MoA/CS phrases
      const low = base.toLowerCase()
      if (low.includes("central nervous system depressant")) {
        addTerm("CNS depressant")
      }
      if (low.includes("nonsteroidal anti-inflammatory")) {
        addTerm("NSAID")
      }
      if (low.includes("hmg-coa reductase inhibitor")) {
        addTerm("statin")
      }
      if (low.includes("selective serotonin reuptake inhibitor")) {
        addTerm("SSRI")
      }
      if (low.includes("serotonin and norepinephrine reuptake inhibitor")) {
        addTerm("SNRI")
      }
      if (low.includes("angiotensin converting enzyme inhibitor")) {
        addTerm("ACE inhibitor")
      }
      if (low.includes("proton pump inhibitor")) {
        addTerm("PPI")
      }
      if (low.includes("gaba") && (low.includes("agonist") || low.includes("modulator"))) {
        addTerm("sedative")
        addTerm("hypnotic")
        addTerm("CNS depressant")
      }
    }
  }

  // Compile word-boundary / optional-plural regexes so "CNS depressant" matches "CNS depressants"
  const candidates: SearchTermCandidate[] = []
  for (const [, displayTerm] of termMap) {
    const escaped = escapeRegExp(displayTerm)
    const pattern = new RegExp(`\\b${escaped}s?\\b`, "i")
    candidates.push({ term: displayTerm, pattern })
  }
  return candidates
}

interface MatchedPassageHit {
  text: string
  sectionName: string
  matchedTerms: string[]
}

function findMatchedPassagesInLabel(
  label: OfficialDrugLabel,
  candidates: SearchTermCandidate[]
): MatchedPassageHit[] {
  if (candidates.length === 0) return []

  // Search specifically Drug Interactions, Contraindications, Warnings and Precautions (plus Boxed Warning)
  const targetSections: Array<{ name: string; text?: string }> = [
    { name: "Drug Interactions", text: label.interactionsText },
    { name: "Contraindications", text: label.contraindicationsText },
    { name: "Warnings and Precautions", text: label.warningsText },
    { name: "Boxed Warning", text: label.boxedWarningText },
  ]

  const hits: MatchedPassageHit[] = []
  const seen = new Set<string>()

  for (const sec of targetSections) {
    if (!sec.text) continue
    const chunks = sec.text.split(/\n{2,}|(?<=\.)\s+(?=[A-Z•\-])/)
    for (const rawChunk of chunks) {
      const chunk = rawChunk.trim()
      if (chunk.length < 15) continue
      const matchedInChunk: string[] = []
      for (const cand of candidates) {
        const m = chunk.match(cand.pattern)
        if (m && m[0]) {
          if (!matchedInChunk.some((t) => t.toLowerCase() === m[0].toLowerCase())) {
            matchedInChunk.push(m[0])
          }
        }
      }
      if (matchedInChunk.length > 0) {
        const dedupKey = `${sec.name}__${chunk.toLowerCase().slice(0, 110)}`
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey)
          hits.push({
            text: chunk,
            sectionName: sec.name,
            matchedTerms: matchedInChunk,
          })
        }
      }
    }
  }

  return hits
}

function extractKeywordParagraphs(texts: Array<string | undefined>, keywords: string[]): { text: string; matchedTerms: string[] }[] {
  const loweredKeys = keywords.map((k) => k.toLowerCase().trim()).filter((k) => k.length >= 3)
  if (loweredKeys.length === 0) return []

  const results: { text: string; matchedTerms: string[] }[] = []
  const seen = new Set<string>()
  for (const raw of texts) {
    if (!raw) continue
    const chunks = raw.split(/\n{2,}|(?<=\.)\s+(?=[A-Z•\-])/)
    for (const chunk of chunks) {
      const c = chunk.trim()
      if (c.length < 15) continue
      const cLow = c.toLowerCase()
      const hitTerms = loweredKeys.filter((kw) => cLow.includes(kw))
      if (hitTerms.length > 0) {
        const key = cLow.slice(0, 120)
        if (!seen.has(key)) {
          seen.add(key)
          results.push({ text: c, matchedTerms: hitTerms })
        }
      }
    }
  }
  return results
}

function appendCompleteSafetySections(
  sections: MedQaAnswerSection[],
  drugName: string,
  label: OfficialDrugLabel,
  alreadyIncluded?: Set<string>
) {
  const sourceDesc = `${label.title} (${label.manufacturer}${label.effectiveDate ? `, ${label.effectiveDate}` : ""})`
  const skip = alreadyIncluded || new Set<string>()

  if (label.boxedWarningText && !skip.has("boxed")) {
    sections.push({
      heading: `${drugName} — Boxed Warning`,
      body: label.boxedWarningText,
      tone: "boxed",
      sourceLabel: sourceDesc,
      drugGroup: drugName,
    })
  }
  if (label.contraindicationsText && !skip.has("contraindications")) {
    sections.push({
      heading: `${drugName} — Contraindications`,
      body: label.contraindicationsText,
      tone: "warning",
      sourceLabel: sourceDesc,
      drugGroup: drugName,
    })
  }
  if (label.interactionsText && !skip.has("interactions")) {
    sections.push({
      heading: `${drugName} — Drug Interactions`,
      body: label.interactionsText,
      tone: "info",
      sourceLabel: sourceDesc,
      drugGroup: drugName,
    })
  }
  if (label.warningsText && !skip.has("warnings")) {
    sections.push({
      heading: `${drugName} — Warnings and Precautions`,
      body: label.warningsText,
      tone: "warning",
      sourceLabel: sourceDesc,
      drugGroup: drugName,
    })
  }
}

export function formatNotFoundLabelMessage(name: string): string {
  return `No official FDA label found for '${name}'. Supplements and some herbal products have no label.`
}

function formatDrugListForHeadline(names: string[]): string {
  if (names.length <= 1) return names[0] || ""
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`
}

export async function answerMedicationQuestionFromDailyMed(params: {
  question: string
  selectedDrugs: string[]
  explicitTopicId?: MedQuestionTopicId | ""
  savedMeds: Array<{ title?: string; item_metadata?: { genericName?: string } }>
  labelOverrides?: Record<string, string>
}): Promise<MedQaHistoryEntry> {
  const drugs = extractDrugNamesFromQuestion(params.question, params.selectedDrugs, params.savedMeds)
  if (drugs.length === 0) {
    throw new Error("Please select or type at least one medication name so DailyMed can look up its official label.")
  }

  const topicId: MedQuestionTopicId =
    params.explicitTopicId || inferTopicFromQuestion(params.question, drugs.length)

  const preferredChoices = {
    ...loadPreferredLabelChoices(),
    ...(params.labelOverrides || {}),
  }

  // Look up official DailyMed / FDA labels in parallel
  const lookupResults = await Promise.all(
    drugs.map(async (drugName) => {
      const savedMatch = params.savedMeds.find(
        (m) => (m.title || "").toLowerCase().includes(drugName.toLowerCase())
      )
      const genericHint = savedMatch?.item_metadata?.genericName || ""
      try {
        const res = await fetchOfficialDrugLabels(drugName, genericHint)
        const labels = res.labels || []
        const prefId = preferredChoices[drugName.toLowerCase()]
        const chosen = (prefId ? labels.find((l) => l.id === prefId || l.setId === prefId) : null) || labels[0] || null
        return { drugName, label: chosen, allLabels: labels }
      } catch {
        return { drugName, label: null, allLabels: [] as OfficialDrugLabel[] }
      }
    })
  )

  const foundItems = lookupResults.filter(
    (x): x is { drugName: string; label: OfficialDrugLabel; allLabels: OfficialDrugLabel[] } => Boolean(x.label)
  )
  const missingNames = lookupResults.filter((x) => !x.label).map((x) => x.drugName)

  if (foundItems.length === 0) {
    throw new Error(missingNames.map(formatNotFoundLabelMessage).join(" "))
  }

  const sources: MedQaSourceLink[] = foundItems.map(({ drugName, label, allLabels }) => ({
    drugName,
    selectedLabelId: label.id,
    labelTitle: label.title,
    manufacturer: label.manufacturer,
    effectiveDate: label.effectiveDate,
    dailyMedUrl: label.dailyMedUrl,
    availableLabels: allLabels.map((l) => ({
      id: l.id,
      title: l.title,
      manufacturer: l.manufacturer,
      effectiveDate: l.effectiveDate,
      dailyMedUrl: l.dailyMedUrl,
    })),
  }))

  const sections: MedQaAnswerSection[] = []
  let summaryVerdict = ""
  let verdictTone: "amber" | "warning" | "info" = "info"

  // MULTI-DRUG INTERACTION CROSS-CHECK (searches Drug Interactions, Contraindications, Warnings & Precautions)
  if (topicId === "together_interactions" && foundItems.length >= 2) {
    const crossMatches: MedQaAnswerSection[] = []

    for (let i = 0; i < foundItems.length; i++) {
      for (let j = 0; j < foundItems.length; j++) {
        if (i === j) continue
        const sourceDrug = foundItems[i]
        const targetDrug = foundItems[j]
        const targetCandidates = buildDetailedSearchTermsForDrug(targetDrug.label, targetDrug.drugName)
        const hits = findMatchedPassagesInLabel(sourceDrug.label, targetCandidates)

        for (const hit of hits.slice(0, 4)) {
          crossMatches.push({
            heading: `Matched in ${sourceDrug.drugName} label (${hit.sectionName}) — term: ${hit.matchedTerms.join(", ")}`,
            body: hit.text,
            tone: "match",
            sourceLabel: `From ${sourceDrug.label.title} (${sourceDrug.label.manufacturer}) · ${hit.sectionName}`,
            matchedTerms: hit.matchedTerms,
          })
        }
      }
    }

    const drugPairLabel = formatDrugListForHeadline(foundItems.map((f) => f.drugName))
    if (crossMatches.length > 0) {
      verdictTone = "warning"
      summaryVerdict = `Potential interaction or drug-class match found in official DailyMed label(s) for ${drugPairLabel}. Review each highlighted passage and complete label sections below, and confirm with your pharmacist or doctor.`
      sections.push(...crossMatches)
    } else {
      verdictTone = "amber"
      summaryVerdict = `Not found by name: ${drugPairLabel} are not named in each other's labels. This does NOT mean they are safe together. Labels often describe drug classes (for example 'CNS depressants') instead of naming each drug. Review the label sections below and ask your pharmacist.`
    }

    // COMPLETE SECTIONS: For every drug always show Boxed Warning, Contraindications, Drug Interactions, and Warnings and Precautions (each separately expandable)
    for (const { drugName, label } of foundItems) {
      appendCompleteSafetySections(sections, drugName, label)
    }
  } else {
    // SINGLE-DRUG OR TOPIC-SPECIFIC QUESTION
    for (const { drugName, label } of foundItems) {
      const sourceDesc = `${label.title} (${label.manufacturer}${label.effectiveDate ? `, ${label.effectiveDate}` : ""})`
      const alreadyIncluded = new Set<string>()

      switch (topicId) {
        case "drug_interactions":
        case "together_interactions": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed drug interactions and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          break
        }

        case "food_alcohol": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed food, alcohol, and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          const hits = extractKeywordParagraphs(
            [
              label.interactionsText,
              label.dosageAdminText,
              label.warningsText,
              label.boxedWarningText,
              label.patientCounselingText,
            ],
            ["alcohol", "food", "meal", "meals", "empty stomach", "grapefruit", "beverage", "drink", "milk"]
          )
          if (hits.length > 0) {
            for (const hit of hits.slice(0, 4)) {
              sections.push({
                heading: `${drugName} — Food / Alcohol Mention (${hit.matchedTerms.join(", ")})`,
                body: hit.text,
                tone: "match",
                sourceLabel: sourceDesc,
                matchedTerms: hit.matchedTerms,
                drugGroup: drugName,
              })
            }
          }
          if (label.dosageAdminText) {
            sections.push({
              heading: `${drugName} — Dosage & Administration`,
              body: label.dosageAdminText,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }

        case "uses": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed uses and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.usesText) {
            sections.push({
              heading: `${drugName} — Uses & Indications`,
              body: label.usesText,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          if (label.drugClass) {
            sections.push({
              heading: `${drugName} — Pharmacologic Class`,
              body: label.drugClass,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }

        case "dosage": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed dosage and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.dosageAdminText) {
            sections.push({
              heading: `${drugName} — Dosage & Administration`,
              body: label.dosageAdminText,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }

        case "missed_overdose": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed missed-dose, overdosage, and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          const missedHits = extractKeywordParagraphs(
            [label.patientCounselingText, label.dosageAdminText, label.warningsText],
            ["miss", "missed", "forget", "forgot", "skip"]
          )
          if (missedHits.length > 0) {
            for (const hit of missedHits.slice(0, 3)) {
              sections.push({
                heading: `${drugName} — Missed Dose Guidance`,
                body: hit.text,
                tone: "match",
                sourceLabel: sourceDesc,
                matchedTerms: hit.matchedTerms,
                drugGroup: drugName,
              })
            }
          }
          if (label.overdosageText) {
            sections.push({
              heading: `${drugName} — Overdosage`,
              body: label.overdosageText,
              tone: "warning",
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }

        case "side_effects": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed adverse reactions and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.sideEffectsText) {
            sections.push({
              heading: `${drugName} — Adverse Reactions / Side Effects`,
              body: label.sideEffectsText,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }

        case "warnings_contraindications": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed warnings, contraindications, and interactions for ${foundItems.map((f) => f.drugName).join(", ")}.`
          break
        }

        case "pregnancy": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed pregnancy, breastfeeding, and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.pregnancyText) {
            sections.push({
              heading: `${drugName} — Pregnancy & Breastfeeding (Lactation)`,
              body: label.pregnancyText,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }

        case "mechanism": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed mechanism of action and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.drugClass) {
            sections.push({
              heading: `${drugName} — Pharmacologic Class`,
              body: label.drugClass,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          if (label.mechanismText) {
            sections.push({
              heading: `${drugName} — How It Works (Mechanism of Action)`,
              body: label.mechanismText,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }

        case "patient_guide": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed patient counseling and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.patientCounselingText) {
            sections.push({
              heading: `${drugName} — Patient Counseling & Medication Guide`,
              body: label.patientCounselingText,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }

        case "storage": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed storage and safety sections for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.storageText) {
            sections.push({
              heading: `${drugName} — Storage & How Supplied`,
              body: label.storageText,
              sourceLabel: sourceDesc,
              drugGroup: drugName,
            })
          }
          break
        }
      }

      // Always include Boxed Warning, Contraindications, full Drug Interactions, and Warnings and Precautions when present
      appendCompleteSafetySections(sections, drugName, label, alreadyIncluded)
    }
  }

  for (const missing of missingNames) {
    sections.push({
      heading: `No Label Found — ${missing}`,
      body: formatNotFoundLabelMessage(missing),
      tone: "warning",
    })
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    question: params.question.trim(),
    topicId,
    drugs: foundItems.map((f) => f.drugName),
    summaryVerdict,
    verdictTone,
    sections,
    sources,
  }
}
