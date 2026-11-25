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
    buildQuestion: (drugs) => `What prescription drugs, OTC medications, or supplements interact with ${drugs.join(", ") || "this medication"}?`,
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
    buildQuestion: (drugs) => `What is the recommended dosage and how should I take ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "missed_overdose",
    group: "Uses, Dosage & How to Take",
    shortTitle: "What should I do for a missed dose or accidental overdose?",
    buildQuestion: (drugs) => `What should I do if I miss a dose or take too much of ${drugs.join(", ") || "this medication"}?`,
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
    buildQuestion: (drugs) => `What are the important warnings and contraindications (who should not take ${drugs.join(", ") || "this medication"})?`,
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
    buildQuestion: (drugs) => `What patient counseling or Medication Guide instructions apply to ${drugs.join(", ") || "this medication"}?`,
  },
  {
    id: "storage",
    group: "Side Effects & Safety",
    shortTitle: "How should I store this medication?",
    buildQuestion: (drugs) => `How should I store ${drugs.join(", ") || "this medication"}?`,
  },
]

export interface MedQaSourceLink {
  drugName: string
  labelTitle: string
  manufacturer: string
  effectiveDate: string
  dailyMedUrl: string
}

export interface MedQaAnswerSection {
  heading: string
  body: string
  tone?: "info" | "warning" | "match"
}

export interface MedQaHistoryEntry {
  id: string
  createdAt: string
  question: string
  topicId: MedQuestionTopicId
  drugs: string[]
  summaryVerdict: string
  sections: MedQaAnswerSection[]
  sources: MedQaSourceLink[]
}

export const MED_QA_HISTORY_KEY = "slh_med_qa_history_v1"

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

/**
 * Also mirrors the Q&A into the Health Hub Dr. AI localStorage history ('health-ai-history-v2')
 * so the user's question & DailyMed answer appear in Dr. AI history too with zero network calls.
 */
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
      ...entry.sections.map((s) => `\n**${s.heading}**\n${s.body}`),
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
        {
          id: `${entry.id}-u`,
          role: "user",
          content: entry.question,
          timestamp: nowIso,
        },
        {
          id: `${entry.id}-a`,
          role: "ai",
          content: aiMarkdown,
          urgency: "info",
          timestamp: nowIso,
          sources: entry.sources.map((s) => `DailyMed: ${s.labelTitle}`),
        },
      ],
    }

    window.localStorage.setItem("health-ai-history-v2", JSON.stringify([newConv, ...list].slice(0, 50)))
  } catch {
    // Ignore
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
  "has", "about", "tell", "me", "please", "official", "indications", "patient", "guide", "counseling",
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

  // 1. Check drugs explicitly mentioned in the question from user's saved medications first
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

  // 2. Include explicitly selected drug chips
  for (const d of selectedDrugs) {
    addUnique(d)
  }

  // 3. Extract any additional non-stopword candidate drug names typed in the question (e.g. comma/and-separated drug names)
  const cleaned = question.replace(/[?!.;:()[\]"]/g, " ")
  const rawTokens = cleaned.split(/[\s,/]+/).filter(Boolean)
  for (const tok of rawTokens) {
    const cleanTok = tok.trim()
    if (cleanTok.length < 3) continue
    if (/^\d/.test(cleanTok)) continue
    if (STOP_WORDS.has(cleanTok.toLowerCase())) continue
    addUnique(cleanTok)
  }

  return found.slice(0, 5)
}

function extractMatchingParagraphs(texts: Array<string | undefined>, keywords: string[]): string[] {
  const loweredKeys = keywords
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k.length >= 3)
  if (loweredKeys.length === 0) return []

  const matches: string[] = []
  const seen = new Set<string>()

  for (const raw of texts) {
    if (!raw) continue
    const chunks = raw.split(/\n{2,}|(?<=\.)\s+(?=[A-Z•\-])/)
    for (const chunk of chunks) {
      const c = chunk.trim()
      if (c.length < 15) continue
      const cLow = c.toLowerCase()
      if (loweredKeys.some((kw) => cLow.includes(kw))) {
        const key = cLow.slice(0, 120)
        if (!seen.has(key)) {
          seen.add(key)
          matches.push(c)
        }
      }
    }
  }
  return matches
}

function buildSearchKeywordsForDrug(label: OfficialDrugLabel, fallbackName: string): string[] {
  const keys = new Set<string>()
  const add = (s?: string) => {
    if (!s) return
    for (const part of s.split(/[,;/()]+/)) {
      const clean = part
        .replace(/\b(tartrate|hydrochloride|hcl|sodium|calcium|potassium|besylate|maleate|succinate|fumarate|mesylate|sulfate|acetate|phosphate|citrate|tablets?|capsules?|oral)\b/gi, " ")
        .trim()
      if (clean.length >= 4) keys.add(clean.toLowerCase())
    }
  }
  add(fallbackName)
  add(label.genericName)
  for (const b of label.brandNames.slice(0, 4)) add(b)
  // Also include meaningful pharmacologic class stems (e.g. "sedative", "statin", "cyclosporine", "fibrate", "cns depressant")
  for (const cls of (label.drugClass || "").split(/[;,]/)) {
    const clean = cls.replace(/\b(inhibitor|inhibitors|agent|agents|drug|drugs|receptor|antagonist|agonist)\b/gi, "").trim()
    if (clean.length >= 5) keys.add(clean.toLowerCase())
  }
  return Array.from(keys)
}

export async function answerMedicationQuestionFromDailyMed(params: {
  question: string
  selectedDrugs: string[]
  explicitTopicId?: MedQuestionTopicId | ""
  savedMeds: Array<{ title?: string; item_metadata?: { genericName?: string } }>
}): Promise<MedQaHistoryEntry> {
  const drugs = extractDrugNamesFromQuestion(params.question, params.selectedDrugs, params.savedMeds)
  if (drugs.length === 0) {
    throw new Error("Please select or type at least one medication name so DailyMed can look up its official label.")
  }

  const topicId: MedQuestionTopicId =
    params.explicitTopicId || inferTopicFromQuestion(params.question, drugs.length)

  // Look up official DailyMed / FDA labels in parallel
  const lookupResults = await Promise.all(
    drugs.map(async (drugName) => {
      const savedMatch = params.savedMeds.find(
        (m) => (m.title || "").toLowerCase().includes(drugName.toLowerCase())
      )
      const genericHint = savedMatch?.item_metadata?.genericName || ""
      try {
        const res = await fetchOfficialDrugLabels(drugName, genericHint)
        return { drugName, label: res.labels[0] || null }
      } catch {
        return { drugName, label: null }
      }
    })
  )

  const foundItems = lookupResults.filter((x): x is { drugName: string; label: OfficialDrugLabel } => Boolean(x.label))
  const missingNames = lookupResults.filter((x) => !x.label).map((x) => x.drugName)

  if (foundItems.length === 0) {
    throw new Error(
      `Could not find an official DailyMed / FDA label for "${drugs.join(", ")}". Check the spelling or enter the generic drug name.`
    )
  }

  const sources: MedQaSourceLink[] = foundItems.map(({ drugName, label }) => ({
    drugName,
    labelTitle: label.title,
    manufacturer: label.manufacturer,
    effectiveDate: label.effectiveDate,
    dailyMedUrl: label.dailyMedUrl,
  }))

  const sections: MedQaAnswerSection[] = []
  let summaryVerdict = ""

  // MULTI-DRUG INTERACTION CROSS-CHECK
  if (topicId === "together_interactions" && foundItems.length >= 2) {
    const crossMatches: MedQaAnswerSection[] = []

    for (let i = 0; i < foundItems.length; i++) {
      for (let j = 0; j < foundItems.length; j++) {
        if (i === j) continue
        const sourceDrug = foundItems[i]
        const targetDrug = foundItems[j]
        const targetKeywords = buildSearchKeywordsForDrug(targetDrug.label, targetDrug.drugName)
        const hits = extractMatchingParagraphs(
          [
            sourceDrug.label.boxedWarningText,
            sourceDrug.label.contraindicationsText,
            sourceDrug.label.interactionsText,
            sourceDrug.label.warningsText,
            sourceDrug.label.patientCounselingText,
          ],
          targetKeywords
        )

        if (hits.length > 0) {
          crossMatches.push({
            heading: `Direct Label Match: ${sourceDrug.label.title} mentions ${targetDrug.drugName}`,
            body: hits.slice(0, 4).join("\n\n"),
            tone: "match",
          })
        }
      }
    }

    const pairNames = foundItems.map((f) => f.drugName).join(" + ")
    if (crossMatches.length > 0) {
      summaryVerdict = `Interaction details found in the official DailyMed label(s) for ${pairNames}. Review the matched label warnings below and consult your doctor or pharmacist before combining.`
      sections.push(...crossMatches)
    } else {
      summaryVerdict = `No direct interaction between ${foundItems
        .map((f) => f.drugName)
        .join(" and ")} is listed by name in their official DailyMed / FDA prescribing labels. Always review each medication's full Drug Interactions & Warnings below and confirm with your pharmacist or prescriber.`
    }

    for (const { drugName, label } of foundItems) {
      const parts = [
        label.drugClass ? `Drug Class: ${label.drugClass}` : "",
        label.boxedWarningText ? `BOXED WARNING:\n${label.boxedWarningText}` : "",
        label.contraindicationsText ? `Do Not Use / Contraindications:\n${label.contraindicationsText}` : "",
        label.interactionsText
          ? `Official Drug Interactions:\n${label.interactionsText}`
          : "No dedicated Drug Interactions section is listed on this label; see Warnings below.",
        !label.interactionsText && label.warningsText ? `Warnings:\n${label.warningsText}` : "",
      ].filter(Boolean)

      sections.push({
        heading: `${drugName} (${label.title}) — DailyMed Interactions & Warnings`,
        body: parts.join("\n\n"),
        tone: label.boxedWarningText ? "warning" : "info",
      })
    }
  } else {
    // SINGLE OR PER-DRUG TOPIC LOOKUP
    for (const { drugName, label } of foundItems) {
      const prefix = foundItems.length > 1 ? `${drugName} — ` : ""

      switch (topicId) {
        case "drug_interactions":
        case "together_interactions": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed drug interaction information for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.interactionsText) {
            sections.push({
              heading: `${prefix}Official Drug Interactions`,
              body: label.interactionsText,
              tone: "info",
            })
          }
          if (label.contraindicationsText) {
            sections.push({
              heading: `${prefix}Contraindications (Do Not Combine / Use)`,
              body: label.contraindicationsText,
              tone: "warning",
            })
          }
          if (!label.interactionsText && label.warningsText) {
            sections.push({
              heading: `${prefix}Warnings & Precautions`,
              body: label.warningsText,
              tone: "warning",
            })
          }
          break
        }

        case "food_alcohol": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed food, alcohol, and administration guidance for ${foundItems.map((f) => f.drugName).join(", ")}.`
          const hits = extractMatchingParagraphs(
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
            sections.push({
              heading: `${prefix}Food, Alcohol & Beverage Mentions on Label`,
              body: hits.slice(0, 6).join("\n\n"),
              tone: "match",
            })
          } else {
            sections.push({
              heading: `${prefix}Food, Alcohol & Beverage Mentions`,
              body: "No specific food, grapefruit, or alcohol restriction sentence was matched automatically — review Dosage & Administration and Warnings below.",
              tone: "info",
            })
          }
          if (label.dosageAdminText) {
            sections.push({ heading: `${prefix}Dosage & Administration`, body: label.dosageAdminText })
          }
          if (label.interactionsText) {
            sections.push({ heading: `${prefix}Drug Interactions`, body: label.interactionsText })
          }
          break
        }

        case "uses": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed uses and indications for ${foundItems.map((f) => f.drugName).join(", ")}.`
          sections.push({
            heading: `${prefix}Uses & Indications`,
            body: label.usesText || "Indications section not listed on this label.",
          })
          if (label.drugClass) {
            sections.push({ heading: `${prefix}Pharmacologic Class`, body: label.drugClass })
          }
          break
        }

        case "dosage": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed dosage and administration instructions for ${foundItems.map((f) => f.drugName).join(", ")}.`
          sections.push({
            heading: `${prefix}Dosage & Administration`,
            body:
              label.dosageAdminText ||
              label.patientCounselingText ||
              "Detailed dosing instructions are not separated on this label; follow your prescription label and prescriber's directions.",
          })
          break
        }

        case "missed_overdose": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed missed-dose and overdosage guidance for ${foundItems.map((f) => f.drugName).join(", ")}.`
          const missedHits = extractMatchingParagraphs(
            [label.patientCounselingText, label.dosageAdminText, label.warningsText],
            ["miss", "missed", "forget", "forgot", "skip"]
          )
          if (missedHits.length > 0) {
            sections.push({
              heading: `${prefix}Missed Dose Instructions from Label`,
              body: missedHits.slice(0, 4).join("\n\n"),
              tone: "match",
            })
          }
          if (label.overdosageText) {
            sections.push({
              heading: `${prefix}Overdosage`,
              body: label.overdosageText,
              tone: "warning",
            })
          }
          if (missedHits.length === 0 && !label.overdosageText && label.dosageAdminText) {
            sections.push({
              heading: `${prefix}Dosage & Administration`,
              body: label.dosageAdminText,
            })
          }
          break
        }

        case "side_effects": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed adverse reactions (side effects) for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.boxedWarningText) {
            sections.push({
              heading: `${prefix}Boxed Warning`,
              body: label.boxedWarningText,
              tone: "warning",
            })
          }
          sections.push({
            heading: `${prefix}Adverse Reactions / Side Effects`,
            body: label.sideEffectsText || "Side effects section not listed on this label.",
          })
          break
        }

        case "warnings_contraindications": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed warnings and contraindications for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.boxedWarningText) {
            sections.push({
              heading: `${prefix}Boxed Warning`,
              body: label.boxedWarningText,
              tone: "warning",
            })
          }
          if (label.contraindicationsText) {
            sections.push({
              heading: `${prefix}Contraindications (Who Should NOT Take It)`,
              body: label.contraindicationsText,
              tone: "warning",
            })
          }
          sections.push({
            heading: `${prefix}Warnings & Precautions`,
            body: label.warningsText || "Warnings section not listed on this label.",
            tone: "warning",
          })
          break
        }

        case "pregnancy": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed pregnancy and breastfeeding information for ${foundItems.map((f) => f.drugName).join(", ")}.`
          sections.push({
            heading: `${prefix}Pregnancy & Breastfeeding (Lactation)`,
            body:
              label.pregnancyText ||
              "No dedicated pregnancy or lactation section is separated on this label; consult your healthcare provider.",
          })
          break
        }

        case "mechanism": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed clinical pharmacology & mechanism of action for ${foundItems.map((f) => f.drugName).join(", ")}.`
          if (label.drugClass) {
            sections.push({ heading: `${prefix}Pharmacologic Class`, body: label.drugClass })
          }
          sections.push({
            heading: `${prefix}How It Works (Mechanism of Action)`,
            body: label.mechanismText || label.usesText || "Mechanism of action not listed on this label.",
          })
          break
        }

        case "patient_guide": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed patient counseling / Medication Guide information for ${foundItems.map((f) => f.drugName).join(", ")}.`
          sections.push({
            heading: `${prefix}Patient Counseling & Medication Guide`,
            body:
              label.patientCounselingText ||
              label.warningsText ||
              label.usesText ||
              "No separate patient counseling section on this label.",
          })
          break
        }

        case "storage": {
          summaryVerdict =
            summaryVerdict ||
            `Official DailyMed storage and handling details for ${foundItems.map((f) => f.drugName).join(", ")}.`
          sections.push({
            heading: `${prefix}Storage & How Supplied`,
            body:
              label.storageText ||
              "No separate storage section found on this label; check your pharmacy bottle or full DailyMed label.",
          })
          break
        }
      }
    }
  }

  if (missingNames.length > 0) {
    sections.push({
      heading: "Unmatched Name(s)",
      body: `No official DailyMed / FDA label matched: ${missingNames.join(", ")}. Check spelling or use the generic name.`,
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
    sections,
    sources,
  }
}
