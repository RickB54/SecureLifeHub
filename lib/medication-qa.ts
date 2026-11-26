"use client"

import { OfficialDrugLabel, fetchOfficialDrugLabels } from "./drug-database"

export type MedQuestionTopicId =
  | "free_form"
  | "together_interactions"
  | "drug_interactions"
  | "food_timing"
  | "blood_tests"
  | "serious_side_effects"
  | "older_adults"
  | "missed_dose"
  | "uses"
  | "dosage"
  | "warnings_contraindications"
  | "pregnancy"
  | "mechanism"
  | "patient_guide"
  | "storage"

export interface PopularMedQuestionTemplate {
  id: MedQuestionTopicId
  group: "Interactions & Mixing" | "How to Take & Monitoring" | "Side Effects & Safety"
  shortTitle: string
  multiDrug?: boolean
  buildQuestion: (drugs: string[]) => string
}

export const MAX_QA_DRUGS = 6
export const MAX_LOOKUP_PILLS = 20
export const MED_QA_LABEL_DISCLAIMER =
  "Label wording only. Ask the prescriber or pharmacist about the patient's situation."

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
    id: "food_timing",
    group: "How to Take & Monitoring",
    shortTitle: "How to take it (food, dairy, alcohol, and timing)",
    buildQuestion: (drugs) =>
      `How should I take ${drugs.join(", ") || "this medication"} with food, empty stomach, dairy, calcium, alcohol, or timing?`,
  },
  {
    id: "blood_tests",
    group: "How to Take & Monitoring",
    shortTitle: "What blood tests or monitoring are needed?",
    buildQuestion: (drugs) =>
      `What blood tests, liver tests, or lab monitoring are needed while taking ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "missed_dose",
    group: "How to Take & Monitoring",
    shortTitle: "What to do about a missed dose (or accidental overdose)",
    buildQuestion: (drugs) =>
      `What should I do about a missed dose or accidental overdose of ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "uses",
    group: "How to Take & Monitoring",
    shortTitle: "What is this medication used for (official indications)?",
    buildQuestion: (drugs) => `What is ${drugs.join(", ") || "this medication"} used for?`,
  },
  {
    id: "dosage",
    group: "How to Take & Monitoring",
    shortTitle: "What is the recommended dosage?",
    buildQuestion: (drugs) => `What is the recommended dosage of ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "serious_side_effects",
    group: "Side Effects & Safety",
    shortTitle: "Serious side effects to watch for (and common side effects)",
    buildQuestion: (drugs) =>
      `What are the serious side effects to watch for and common adverse reactions of ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "older_adults",
    group: "Side Effects & Safety",
    shortTitle: "Safety in older adults (geriatric use)",
    buildQuestion: (drugs) =>
      `Is ${drugs.join(", ") || "this medication"} safe in older adults or elderly patients (geriatric use)?`,
  },
  {
    id: "warnings_contraindications",
    group: "Side Effects & Safety",
    shortTitle: "Important warnings and who should NOT take it",
    buildQuestion: (drugs) =>
      `What are the important warnings and contraindications (who should not take ${drugs.join(", ") || "this medication"})?`,
  },
  {
    id: "pregnancy",
    group: "Side Effects & Safety",
    shortTitle: "Safety during pregnancy or breastfeeding",
    buildQuestion: (drugs) => `Is ${drugs.join(", ") || "this medication"} safe during pregnancy or breastfeeding?`,
  },
  {
    id: "mechanism",
    group: "Side Effects & Safety",
    shortTitle: "How does this medication work in the body?",
    buildQuestion: (drugs) => `How does ${drugs.join(", ") || "this medication"} work in the body?`,
  },
  {
    id: "patient_guide",
    group: "Side Effects & Safety",
    shortTitle: "Patient counseling & Medication Guide highlights",
    buildQuestion: (drugs) =>
      `What patient counseling or Medication Guide points apply to ${drugs.join(", ") || "this medication"}?`,
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

export interface MedQaMissingDrugInfo {
  name: string
  message: string
  didYouMean: string[]
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
  missingDrugs?: MedQaMissingDrugInfo[]
  // Manage My Questions metadata (stored locally in this browser)
  forPerson: string
  starred: boolean
  tags: string[]
  note: string
}

export const MED_QA_HISTORY_KEY = "slh_med_qa_history_v1"
export const MED_QA_LOOKUP_PILLS_KEY = "slh_med_qa_lookup_pills_v1"
export const MED_QA_PEOPLE_KEY = "slh_med_qa_people_v1"
const LABEL_CHOICE_STORAGE_KEY = "slh_med_qa_label_choices_v1"

export function loadLookupPills(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(MED_QA_LOOKUP_PILLS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return Array.from(
      new Set<string>(parsed.map((x) => String(x || "").trim()).filter((x) => x.length >= 2))
    ).slice(0, MAX_LOOKUP_PILLS)
  } catch {
    return []
  }
}

export function saveLookupPills(pills: string[]) {
  if (typeof window === "undefined") return
  try {
    const clean = Array.from(
      new Set<string>(pills.map((x) => x.trim()).filter((x) => x.length >= 2))
    ).slice(0, MAX_LOOKUP_PILLS)
    window.localStorage.setItem(MED_QA_LOOKUP_PILLS_KEY, JSON.stringify(clean))
  } catch {
    // Ignore
  }
}

export function loadSavedPersonNames(): string[] {
  if (typeof window === "undefined") return ["Me"]
  try {
    const raw = window.localStorage.getItem(MED_QA_PEOPLE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed) ? parsed.map((s) => String(s || "").trim()).filter(Boolean) : []
    const seen = new Map<string, string>([["me", "Me"]])
    for (const p of list) {
      const k = p.toLowerCase()
      if (!seen.has(k)) seen.set(k, p)
    }
    return Array.from(seen.values())
  } catch {
    return ["Me"]
  }
}

export function rememberPersonName(name: string): string[] {
  const clean = name.trim() || "Me"
  const current = loadSavedPersonNames()
  if (!current.some((p) => p.toLowerCase() === clean.toLowerCase())) {
    const next = [...current, clean].slice(0, 30)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(MED_QA_PEOPLE_KEY, JSON.stringify(next))
      } catch {
        // Ignore
      }
    }
    return next
  }
  return current
}

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
    // Ignore
  }
}

export function normalizeHistoryEntry(raw: any): MedQaHistoryEntry {
  return {
    id: String(raw?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    createdAt: String(raw?.createdAt || new Date().toISOString()),
    question: String(raw?.question || ""),
    topicId: (raw?.topicId as MedQuestionTopicId) || "free_form",
    drugs: Array.isArray(raw?.drugs) ? raw.drugs.map(String) : [],
    summaryVerdict: String(raw?.summaryVerdict || ""),
    verdictTone: raw?.verdictTone === "amber" || raw?.verdictTone === "warning" ? raw.verdictTone : "info",
    sections: Array.isArray(raw?.sections) ? raw.sections : [],
    sources: Array.isArray(raw?.sources) ? raw.sources : [],
    missingDrugs: Array.isArray(raw?.missingDrugs) ? raw.missingDrugs : undefined,
    forPerson: typeof raw?.forPerson === "string" && raw.forPerson.trim() ? raw.forPerson.trim() : "Me",
    starred: Boolean(raw?.starred),
    tags: Array.isArray(raw?.tags)
      ? Array.from(new Set<string>(raw.tags.map((t: any) => String(t || "").trim()).filter(Boolean)))
      : [],
    note: typeof raw?.note === "string" ? raw.note : "",
  }
}

export function loadMedQaHistory(): MedQaHistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(MED_QA_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeHistoryEntry) : []
  } catch {
    return []
  }
}

export function saveMedQaHistory(entries: MedQaHistoryEntry[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(MED_QA_HISTORY_KEY, JSON.stringify(entries.slice(0, 200)))
  } catch {
    // Ignore
  }
}

export function mirrorMedQaToHealthAiHistory(entry: MedQaHistoryEntry) {
  if (typeof window === "undefined") return
  try {
    const raw = window.localStorage.getItem("health-ai-history-v2")
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) return

    const aiMarkdown = [
      `**Official DailyMed / FDA Answer** (For: ${entry.forPerson})`,
      ``,
      `**Summary:** ${entry.summaryVerdict}`,
      ...entry.sections.map((s) => `\n**${s.heading}**${s.sourceLabel ? `\n_${s.sourceLabel}_` : ""}\n${s.body}`),
      entry.sources.length > 0
        ? `\n**Official DailyMed Sources:**\n${entry.sources
            .map((src) => `- ${src.labelTitle} (${src.manufacturer}): ${src.dailyMedUrl}`)
            .join("\n")}`
        : "",
      `\n_${MED_QA_LABEL_DISCLAIMER}_`,
    ]
      .filter(Boolean)
      .join("\n")

    const nowIso = entry.createdAt || new Date().toISOString()
    const newConv = {
      id: `med-qa-${entry.id}`,
      title: entry.question.slice(0, 60),
      topics: ["Medications", "DailyMed", entry.forPerson, ...entry.drugs],
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
  "me", "it", "its", "this", "that", "these", "those", "drug", "drugs", "medication", "medications",
  "med", "meds", "pill", "pills", "tablet", "tablets", "capsule", "capsules", "how", "should",
  "do", "does", "if", "any", "other", "between", "have", "has", "about", "tell", "please",
  "she", "he", "her", "his", "mom", "dad", "patient", "year", "years", "old", "while", "when",
  "would", "could", "will", "be", "been", "being", "need", "needed", "needs", "watch", "know",
])

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

  for (const d of selectedDrugs) addUnique(d)

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

  addTerm(fallbackName.replace(/\([^)]*\)/g, " ").trim())
  const parenMatch = fallbackName.match(/\(([^)]+)\)/)
  if (parenMatch) addTerm(parenMatch[1])

  for (const part of (label.genericName || "").split(/[,;/]+/)) addTerm(part)
  for (const brand of (label.brandNames || []).slice(0, 6)) addTerm(brand)

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
      const low = base.toLowerCase()
      if (low.includes("central nervous system depressant")) addTerm("CNS depressant")
      if (low.includes("nonsteroidal anti-inflammatory")) addTerm("NSAID")
      if (low.includes("hmg-coa reductase inhibitor")) addTerm("statin")
      if (low.includes("selective serotonin reuptake inhibitor")) addTerm("SSRI")
      if (low.includes("serotonin and norepinephrine reuptake inhibitor")) addTerm("SNRI")
      if (low.includes("angiotensin converting enzyme inhibitor")) addTerm("ACE inhibitor")
      if (low.includes("proton pump inhibitor")) addTerm("PPI")
      if (low.includes("gaba") && (low.includes("agonist") || low.includes("modulator"))) {
        addTerm("sedative")
        addTerm("hypnotic")
        addTerm("CNS depressant")
      }
    }
  }

  const candidates: SearchTermCandidate[] = []
  for (const [, displayTerm] of termMap) {
    const pattern = new RegExp(`\\b${escapeRegExp(displayTerm)}s?\\b`, "i")
    candidates.push({ term: displayTerm, pattern })
  }
  return candidates
}

interface MatchedPassageHit {
  text: string
  sectionName: string
  matchedTerms: string[]
}

function findMatchedPassagesInLabel(label: OfficialDrugLabel, candidates: SearchTermCandidate[]): MatchedPassageHit[] {
  if (candidates.length === 0) return []
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
        if (m && m[0] && !matchedInChunk.some((t) => t.toLowerCase() === m[0].toLowerCase())) {
          matchedInChunk.push(m[0])
        }
      }
      if (matchedInChunk.length > 0) {
        const dedupKey = `${sec.name}__${chunk.toLowerCase().slice(0, 110)}`
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey)
          hits.push({ text: chunk, sectionName: sec.name, matchedTerms: matchedInChunk })
        }
      }
    }
  }
  return hits
}

// ---------- Free-Form Question Keyword & Synonym Scoring Engine ----------

interface SynonymRule {
  triggers: RegExp[]
  synonyms: string[]
  boostSections: string[]
}

const FREE_FORM_SYNONYM_RULES: SynonymRule[] = [
  {
    triggers: [/\b(empty stomach|food|meal|meals|dairy|calcium|milk|yogurt|cheese|iron|magnesium|zinc|antacid|timing|when to take|morning|night|bedtime|before|after eating|grapefruit|alcohol|drink)\b/i],
    synonyms: ["empty stomach", "food", "meal", "dairy", "calcium", "iron", "magnesium", "polyvalent", "cation", "antacid", "hours before", "hours after", "alcohol", "grapefruit", "administration"],
    boostSections: ["dosage", "interactions", "medguide", "counseling"],
  },
  {
    triggers: [/\b(elderly|older|geriatric|senior|seniors|aging|aged|6[5-9]|[7-9]\d|10\d)\b/i],
    synonyms: ["geriatric", "elderly", "older", "65 years", "age", "aged"],
    boostSections: ["geriatric", "populations", "dosage", "warnings"],
  },
  {
    triggers: [/\b(liver|hepatic|cirrhosis|hepatotoxicity|jaundice|alt|ast|bilirubin)\b/i],
    synonyms: ["hepatic", "liver", "hepatotoxicity", "cirrhosis", "transaminase", "ALT", "AST", "bilirubin", "jaundice"],
    boostSections: ["hepatic", "populations", "warnings", "boxed", "dosage"],
  },
  {
    triggers: [/\b(kidney|kidneys|renal|dialysis|creatinine|egfr|ckd)\b/i],
    synonyms: ["renal", "kidney", "creatinine", "clearance", "dialysis", "impairment"],
    boostSections: ["renal", "populations", "dosage", "warnings"],
  },
  {
    triggers: [/\b(blood test|blood tests|monitoring|monitor|lab|labs|cbc|platelet|platelets|blood count|liver test|test|tests|check)\b/i],
    synonyms: ["monitor", "monitoring", "blood", "laboratory", "CBC", "platelet", "hepatic", "liver", "weekly", "monthly", "prior to"],
    boostSections: ["warnings", "dosage", "boxed", "counseling"],
  },
  {
    triggers: [/\b(miss|missed|forget|forgot|skip|skipped|late dose)\b/i],
    synonyms: ["missed", "miss", "forget", "skip", "next scheduled", "double dose", "two doses"],
    boostSections: ["dosage", "medguide", "counseling"],
  },
  {
    triggers: [/\b(overdose|too much|extra dose|poison)\b/i],
    synonyms: ["overdosage", "overdose", "excessive", "poison", "emergency"],
    boostSections: ["overdosage", "warnings"],
  },
  {
    triggers: [/\b(serious|severe|dangerous|watch for|side effect|side effects|adverse|reaction|reactions|rash|bleed|bleeding|clot|clots|thrombosis|cataract)\b/i],
    synonyms: ["serious", "severe", "adverse", "reaction", "warning", "discontinue", "bleeding", "thrombosis", "rash", "call your doctor"],
    boostSections: ["boxed", "warnings", "side_effects", "medguide"],
  },
  {
    triggers: [/\b(pregnant|pregnancy|breastfeed|breastfeeding|nursing|lactation|baby|fetus|fertility)\b/i],
    synonyms: ["pregnancy", "pregnant", "lactation", "breastfeeding", "fetal", "embryo", "nursing", "milk"],
    boostSections: ["pregnancy", "populations", "warnings"],
  },
  {
    triggers: [/\b(store|storage|temperature|refrigerate|fridge|moisture|keep|light|shelf)\b/i],
    synonyms: ["store", "storage", "room temperature", "20°C", "25°C", "moisture", "light", "original container"],
    boostSections: ["storage", "medguide"],
  },
  {
    triggers: [/\b(contraindicat|not take|should not|cannot take|avoid|allergy|allergic)\b/i],
    synonyms: ["contraindicated", "do not", "avoid", "hypersensitivity", "allergic"],
    boostSections: ["contraindications", "warnings", "boxed"],
  },
  {
    triggers: [/\b(used for|indication|indications|treat|treats|purpose|what is .* for)\b/i],
    synonyms: ["indicated", "treatment", "patients with", "used to treat"],
    boostSections: ["uses", "medguide"],
  },
  {
    triggers: [/\b(how does .* work|mechanism|pharmacology|class)\b/i],
    synonyms: ["mechanism", "receptor", "inhibits", "agonist", "antagonist", "binds"],
    boostSections: ["mechanism", "uses"],
  },
  {
    triggers: [/\b(interact|interaction|interactions|mix|combine|together|supplement|supplements|herb|herbal)\b/i],
    synonyms: ["interaction", "interactions", "concomitant", "coadministration", "CYP", "inhibitor", "inducer"],
    boostSections: ["interactions", "contraindications", "warnings"],
  },
]

interface LabelSectionEntry {
  key: string
  name: string
  text: string
  tone?: "info" | "warning" | "boxed"
}

function getAllSearchableSections(label: OfficialDrugLabel): LabelSectionEntry[] {
  const list: LabelSectionEntry[] = []
  const add = (key: string, name: string, text?: string, tone?: "info" | "warning" | "boxed") => {
    const clean = (text || "").trim()
    if (clean) list.push({ key, name, text: clean, tone })
  }
  add("uses", "Indications and Usage", label.usesText, "info")
  add("dosage", "Dosage and Administration", label.dosageAdminText, "info")
  add("contraindications", "Contraindications", label.contraindicationsText, "warning")
  add("warnings", "Warnings and Precautions", label.warningsText, "warning")
  add("side_effects", "Adverse Reactions", label.sideEffectsText, "info")
  add("interactions", "Drug Interactions", label.interactionsText, "info")
  add("geriatric", "Geriatric Use", label.geriatricUseText, "info")
  add("hepatic", "Hepatic Impairment", label.hepaticImpairmentText, "warning")
  add("renal", "Renal Impairment", label.renalImpairmentText, "info")
  add("pregnancy", "Pregnancy & Breastfeeding", label.pregnancyText, "info")
  add("populations", "Use in Specific Populations", label.specificPopulationsText, "info")
  add("overdosage", "Overdosage", label.overdosageText, "warning")
  add("storage", "How Supplied / Storage", label.storageText, "info")
  add("counseling", "Patient Counseling Information", label.patientCounselingText, "info")
  add("medguide", "Medication Guide", label.medGuideText, "info")
  add("mechanism", "Mechanism of Action", label.mechanismText, "info")
  return list
}

function buildBestPassageSnippet(fullText: string, matchedTerms: string[], maxLen = 650): string {
  if (fullText.length <= maxLen || matchedTerms.length === 0) return fullText
  const lowerTerms = matchedTerms.map((t) => t.toLowerCase())
  const paragraphs = fullText.split(/\n{2,}/)
  const matchingParas = paragraphs.filter((p) => {
    const low = p.toLowerCase()
    return lowerTerms.some((t) => low.includes(t))
  })
  if (matchingParas.length > 0) {
    // Lead with the highest-relevance paragraphs, followed by full text when expanded
    const rest = paragraphs.filter((p) => !matchingParas.includes(p))
    return [...matchingParas, ...rest].join("\n\n")
  }
  return fullText
}

function scoreFreeFormSectionsForDrug(
  question: string,
  drugName: string,
  label: OfficialDrugLabel,
  explicitTopicId?: MedQuestionTopicId | ""
): {
  topSections: MedQaAnswerSection[]
  hadMatch: boolean
} {
  const sourceDesc = `${label.title} (${label.manufacturer}${label.effectiveDate ? `, ${label.effectiveDate}` : ""})`
  const allSections = getAllSearchableSections(label)

  // Extract raw question words (excluding stopwords and the drug's own name)
  const drugNameLow = drugName.toLowerCase()
  const rawTokens = question
    .replace(/[?!.;:,()[\]"]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t.toLowerCase()) && !drugNameLow.includes(t.toLowerCase()))

  const synonymTerms = new Set<string>()
  const sectionBoosts: Record<string, number> = {}

  for (const rule of FREE_FORM_SYNONYM_RULES) {
    if (rule.triggers.some((rx) => rx.test(question))) {
      for (const s of rule.synonyms) synonymTerms.add(s)
      rule.boostSections.forEach((secKey, idx) => {
        sectionBoosts[secKey] = (sectionBoosts[secKey] || 0) + Math.max(4, 14 - idx * 3)
      })
    }
  }

  // Explicit popular-question topic boost
  const topicBoostMap: Partial<Record<MedQuestionTopicId, string[]>> = {
    food_timing: ["dosage", "interactions", "medguide", "counseling"],
    blood_tests: ["warnings", "dosage", "counseling"],
    missed_dose: ["dosage", "medguide", "counseling", "overdosage"],
    serious_side_effects: ["warnings", "side_effects", "medguide"],
    older_adults: ["geriatric", "populations", "dosage", "warnings"],
    uses: ["uses", "medguide"],
    dosage: ["dosage", "counseling"],
    warnings_contraindications: ["contraindications", "warnings", "interactions"],
    pregnancy: ["pregnancy", "populations"],
    mechanism: ["mechanism", "uses"],
    patient_guide: ["medguide", "counseling"],
    storage: ["storage", "medguide"],
    drug_interactions: ["interactions", "contraindications", "warnings"],
  }
  if (explicitTopicId && topicBoostMap[explicitTopicId]) {
    topicBoostMap[explicitTopicId]!.forEach((secKey, idx) => {
      sectionBoosts[secKey] = (sectionBoosts[secKey] || 0) + Math.max(8, 22 - idx * 4)
    })
  }

  const scored = allSections.map((sec) => {
    const lowerText = sec.text.toLowerCase()
    let score = sectionBoosts[sec.key] || 0
    const matchedTerms: string[] = []

    const addMatched = (t: string) => {
      if (!matchedTerms.some((x) => x.toLowerCase() === t.toLowerCase())) {
        matchedTerms.push(t)
      }
    }

    for (const tok of rawTokens) {
      const rx = new RegExp(`\\b${escapeRegExp(tok)}`, "i")
      if (rx.test(sec.text)) {
        score += 8
        addMatched(tok)
      }
    }

    for (const syn of synonymTerms) {
      if (lowerText.includes(syn.toLowerCase())) {
        score += 4
        addMatched(syn)
      }
    }

    return { sec, score, matchedTerms }
  })

  const positive = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score)

  if (positive.length === 0) {
    // Fallback: list closest related sections without inventing any answer
    const fallbackOrder = ["uses", "dosage", "warnings", "interactions", "medguide", "counseling"]
    const closest = fallbackOrder
      .map((k) => allSections.find((s) => s.key === k))
      .filter((s): s is LabelSectionEntry => Boolean(s))
      .slice(0, 3)

    return {
      hadMatch: false,
      topSections: closest.map((s) => ({
        heading: `${drugName} — ${s.name}`,
        body: s.text,
        tone: s.tone || "info",
        sourceLabel: sourceDesc,
        drugGroup: drugName,
      })),
    }
  }

  const top3 = positive.slice(0, 3)
  return {
    hadMatch: true,
    topSections: top3.map(({ sec, matchedTerms }) => ({
      heading: `${drugName} — ${sec.name}`,
      body: buildBestPassageSnippet(sec.text, matchedTerms),
      tone: sec.tone || (matchedTerms.length > 0 ? "match" : "info"),
      sourceLabel: sourceDesc,
      matchedTerms,
      drugGroup: drugName,
    })),
  }
}

function appendCompleteSafetySections(
  sections: MedQaAnswerSection[],
  drugName: string,
  label: OfficialDrugLabel,
  alreadyHeadings?: Set<string>
) {
  const sourceDesc = `${label.title} (${label.manufacturer}${label.effectiveDate ? `, ${label.effectiveDate}` : ""})`
  const has = alreadyHeadings || new Set<string>()
  const pushIfNew = (heading: string, body?: string, tone: MedQaAnswerSection["tone"] = "info") => {
    if (!body || has.has(heading.toLowerCase())) return
    has.add(heading.toLowerCase())
    sections.push({ heading, body, tone, sourceLabel: sourceDesc, drugGroup: drugName })
  }

  pushIfNew(`${drugName} — Boxed Warning`, label.boxedWarningText, "boxed")
  pushIfNew(`${drugName} — Contraindications`, label.contraindicationsText, "warning")
  pushIfNew(`${drugName} — Drug Interactions`, label.interactionsText, "info")
  pushIfNew(`${drugName} — Warnings and Precautions`, label.warningsText, "warning")
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
  forPerson?: string
}): Promise<MedQaHistoryEntry> {
  const drugs = extractDrugNamesFromQuestion(params.question, params.selectedDrugs, params.savedMeds)
  if (drugs.length === 0) {
    throw new Error("Please select or add at least one drug pill above so DailyMed can look up its official label.")
  }

  const qLower = params.question.toLowerCase()
  const isMultiDrugInteraction =
    drugs.length >= 2 &&
    (params.explicitTopicId === "together_interactions" ||
      (!params.explicitTopicId &&
        (qLower.includes("together") || qLower.includes("interact") || qLower.includes("mix") || qLower.includes("combine"))))

  const topicId: MedQuestionTopicId = isMultiDrugInteraction
    ? "together_interactions"
    : params.explicitTopicId || "free_form"

  const preferredChoices = {
    ...loadPreferredLabelChoices(),
    ...(params.labelOverrides || {}),
  }

  const lookupResults = await Promise.all(
    drugs.map(async (drugName) => {
      const savedMatch = params.savedMeds.find((m) =>
        (m.title || "").toLowerCase().includes(drugName.toLowerCase())
      )
      const parenMatch = drugName.match(/\(([^)]+)\)/)
      const genericHint = savedMatch?.item_metadata?.genericName || (parenMatch ? parenMatch[1].trim() : "")
      const cleanLookupName = drugName.replace(/\([^)]*\)/g, " ").trim() || drugName

      try {
        const res = await fetchOfficialDrugLabels(cleanLookupName, genericHint)
        const labels = res.labels || []
        const prefId = preferredChoices[drugName.toLowerCase()]
        const chosen = (prefId ? labels.find((l) => l.id === prefId || l.setId === prefId) : null) || labels[0] || null
        return { drugName, label: chosen, allLabels: labels, didYouMean: res.didYouMean || [] }
      } catch {
        return { drugName, label: null, allLabels: [] as OfficialDrugLabel[], didYouMean: [] as string[] }
      }
    })
  )

  const foundItems = lookupResults.filter(
    (x): x is { drugName: string; label: OfficialDrugLabel; allLabels: OfficialDrugLabel[]; didYouMean: string[] } =>
      Boolean(x.label)
  )
  const missingDrugs: MedQaMissingDrugInfo[] = lookupResults
    .filter((x) => !x.label)
    .map((x) => ({
      name: x.drugName,
      message: formatNotFoundLabelMessage(x.drugName),
      didYouMean: x.didYouMean,
    }))

  const forPerson = (params.forPerson || "Me").trim() || "Me"

  if (foundItems.length === 0) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      question: params.question.trim(),
      topicId,
      drugs,
      summaryVerdict: missingDrugs.map((m) => m.message).join(" "),
      verdictTone: "amber",
      sections: [],
      sources: [],
      missingDrugs,
      forPerson,
      starred: false,
      tags: [],
      note: "",
    }
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

  if (isMultiDrugInteraction && foundItems.length >= 2) {
    // 1. Cross-check Drug Interactions, Contraindications, Warnings & Precautions across pairs
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

    for (const { drugName, label } of foundItems) {
      appendCompleteSafetySections(sections, drugName, label)
    }
  } else {
    // FREE-FORM / POPULAR QUESTION SCORING across all 12+ SPL sections
    let anyMatched = false
    for (const { drugName, label } of foundItems) {
      const sourceDesc = `${label.title} (${label.manufacturer}${label.effectiveDate ? `, ${label.effectiveDate}` : ""})`
      // Always show Boxed Warning at the top if present
      if (label.boxedWarningText) {
        sections.push({
          heading: `${drugName} — Boxed Warning`,
          body: label.boxedWarningText,
          tone: "boxed",
          sourceLabel: sourceDesc,
          drugGroup: drugName,
        })
      }

      const { topSections, hadMatch } = scoreFreeFormSectionsForDrug(
        params.question,
        drugName,
        label,
        params.explicitTopicId
      )
      if (hadMatch) anyMatched = true
      sections.push(...topSections)
    }

    if (anyMatched) {
      summaryVerdict = `Top matching official DailyMed label sections for ${formatDrugListForHeadline(
        foundItems.map((f) => f.drugName)
      )}.`
      verdictTone = "info"
    } else {
      summaryVerdict = `No close match found. Closest sections:`
      verdictTone = "amber"
    }
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
    ...(missingDrugs.length > 0 ? { missingDrugs } : {}),
    forPerson,
    starred: false,
    tags: [],
    note: "",
  }
}
