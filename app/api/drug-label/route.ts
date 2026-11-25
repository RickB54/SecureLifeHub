import { NextRequest, NextResponse } from "next/server"

const OPENFDA_URL = "https://api.fda.gov/drug/label.json"
const DAILYMED_SPLS_URL = "https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json"

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function formatFdaEffectiveDate(raw?: string | null): string {
  if (!raw) return ""
  const digits = String(raw).trim().replace(/[^0-9]/g, "")
  if (digits.length >= 8) {
    const y = Number(digits.slice(0, 4))
    const m = Number(digits.slice(4, 6))
    const d = Number(digits.slice(6, 8))
    if (y >= 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`
    }
  }
  return String(raw).trim()
}

/**
 * Normalizes whitespace in official FDA SPL text without rewriting or inventing any wording.
 */
function cleanLabelSectionText(arr?: unknown): string {
  if (!arr) return ""
  const parts = Array.isArray(arr) ? arr : [arr]
  const raw = parts
    .filter((p) => typeof p === "string" && p.trim().length > 0)
    .map((p) => String(p).trim())
    .join("\n\n")

  if (!raw) return ""

  return raw
    .replace(/\r\n/g, "\n")
    // Strip leading numeric SPL section header only when duplicated right at start (e.g. "1 INDICATIONS AND USAGE ")
    .replace(/^\s*\d+(\.\d+)?\s+[A-Z][A-Z\s,&/-]{3,45}(?=\s+[A-Z][a-z]|\n)/, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function stripStrengthAndNoise(input: string): string {
  return input
    .replace(/\b\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:mg|mcg|g|ml|iu|%|meq|units?|tablets?|capsules?|pills?|packets?)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractSearchCandidates(name: string, genericName: string): string[] {
  const candidates: string[] = []
  const addCandidate = (val?: string) => {
    if (!val) return
    const cleaned = stripStrengthAndNoise(val)
      .replace(/[()[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (cleaned.length >= 2 && !candidates.some((c) => c.toLowerCase() === cleaned.toLowerCase())) {
      candidates.push(cleaned)
    }
  }

  // 1. Generic name first (full generic, then base salt-stripped word if multi-word salt)
  if (genericName) {
    addCandidate(genericName)
    const saltStripped = genericName
      .replace(/\b(tartrate|hydrochloride|hcl|sodium|calcium|potassium|besylate|maleate|succinate|fumarate|mesylate|sulfate|acetate|phosphate|citrate|pamoate|monohydrate|dihydrate|er|xr|sr|cr|dr)\b/gi, " ")
      .trim()
    addCandidate(saltStripped)
  }

  // 2. Medication name (outside parentheses first, then parenthetical aliases like "Ibuprofen (Advil, Motrin)")
  if (name) {
    const outsideParens = name.replace(/\([^)]*\)/g, " ").trim()
    addCandidate(outsideParens)

    const parenMatches = Array.from(name.matchAll(/\(([^)]+)\)/g))
    for (const m of parenMatches) {
      const innerParts = m[1].split(/[,/]/)
      for (const part of innerParts) {
        addCandidate(part)
      }
    }

    // Slash-separated combo or alternate names (e.g. "NyQuil / DayQuil")
    if (outsideParens.includes("/")) {
      for (const part of outsideParens.split("/")) {
        addCandidate(part)
      }
    }

    const saltStrippedName = outsideParens
      .replace(/\b(tartrate|hydrochloride|hcl|sodium|calcium|potassium|besylate|maleate|succinate|fumarate|mesylate|sulfate|acetate|phosphate|citrate|pamoate|er|xr|sr|cr|dr)\b/gi, " ")
      .trim()
    addCandidate(saltStrippedName)
  }

  return candidates
}

function escapeLucenePhrase(term: string): string {
  return term.replace(/["\\]/g, " ").replace(/\s+/g, " ").trim()
}

async function queryOpenFda(searchExpr: string, limit = 10): Promise<any[]> {
  const url = `${OPENFDA_URL}?search=${encodeURIComponent(searchExpr)}&limit=${limit}`
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.results) ? json.results : []
  } catch {
    return []
  }
}

async function queryDailyMedFallback(term: string): Promise<any[]> {
  try {
    const url = `${DAILYMED_SPLS_URL}?drug_name=${encodeURIComponent(term)}&pagesize=6`
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return []
    const json = await res.json()
    const spls = Array.isArray(json?.data) ? json.data : []
    if (spls.length === 0) return []

    // Fetch matching full SPLs from openFDA by set_id in ONE query
    const setIds = spls
      .map((s: any) => s?.setid)
      .filter((id: any) => typeof id === "string" && id.trim().length > 0)
      .slice(0, 6)

    if (setIds.length > 0) {
      const expr = setIds.map((id: string) => `set_id:"${escapeLucenePhrase(id)}"`).join("+OR+")
      const fdaBySetId = await queryOpenFda(expr.replace(/\+OR\+/g, " OR "), 6)
      if (fdaBySetId.length > 0) return fdaBySetId
    }

    return []
  } catch {
    return []
  }
}

function mapFdaResultToLabel(r: any, fallbackQuery: string) {
  const openfda = r?.openfda || {}
  const setId: string =
    r?.set_id ||
    (Array.isArray(openfda.spl_set_id) ? openfda.spl_set_id[0] : "") ||
    ""
  const id: string = setId || r?.id || Math.random().toString(36).slice(2)

  const genericList: string[] = Array.isArray(openfda.generic_name) ? openfda.generic_name : []
  const brandList: string[] = Array.isArray(openfda.brand_name) ? openfda.brand_name : []
  const manufacturerList: string[] = Array.isArray(openfda.manufacturer_name) ? openfda.manufacturer_name : []

  const pharmClasses = Array.from(
    new Set([
      ...(Array.isArray(openfda.pharm_class_epc) ? openfda.pharm_class_epc : []),
      ...(Array.isArray(openfda.pharm_class_moa) ? openfda.pharm_class_moa : []),
      ...(Array.isArray(openfda.pharm_class_cs) ? openfda.pharm_class_cs : []),
    ].map((c) => String(c).trim()).filter(Boolean))
  )

  const genericName = genericList.join(", ")
  const uniqueBrands = Array.from(new Set(brandList.map((b) => String(b).trim()).filter(Boolean)))
  const primaryBrand = uniqueBrands[0] || ""
  const primaryGeneric = genericList[0] || ""

  const title =
    primaryBrand && primaryGeneric && primaryBrand.toLowerCase() !== primaryGeneric.toLowerCase()
      ? `${primaryBrand} (${primaryGeneric})`
      : primaryBrand || primaryGeneric || fallbackQuery

  const manufacturer = manufacturerList[0] || "Manufacturer unlisted"
  const rawEffective = String(r?.effective_time || "")
  const effectiveDate = formatFdaEffectiveDate(rawEffective)

  const dailyMedUrl = setId
    ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${encodeURIComponent(setId)}`
    : `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(primaryGeneric || primaryBrand || fallbackQuery)}`

  const usesText = cleanLabelSectionText(r?.indications_and_usage || r?.purpose)
  const dosageAdminText = cleanLabelSectionText(r?.dosage_and_administration)
  const contraindicationsText = cleanLabelSectionText(r?.contraindications)
  const mechanismText = cleanLabelSectionText(r?.mechanism_of_action || r?.clinical_pharmacology)
  const sideEffectsText = cleanLabelSectionText(r?.adverse_reactions)
  const interactionsText = cleanLabelSectionText(r?.drug_interactions)
  const boxedWarningText = cleanLabelSectionText(r?.boxed_warning)
  const warningsText = cleanLabelSectionText(
    r?.warnings_and_cautions || r?.warnings || r?.do_not_use || r?.stop_use
  )
  const pregnancyText = cleanLabelSectionText(
    [
      ...(Array.isArray(r?.pregnancy) ? r.pregnancy : []),
      ...(Array.isArray(r?.lactation) ? r.lactation : []),
      ...(Array.isArray(r?.pregnancy_or_breast_feeding) ? r.pregnancy_or_breast_feeding : []),
      ...(Array.isArray(r?.nursing_mothers) ? r.nursing_mothers : []),
    ]
  )
  const overdosageText = cleanLabelSectionText(r?.overdosage)
  const storageText = cleanLabelSectionText(r?.storage_and_handling || r?.how_supplied)
  const patientCounselingText = cleanLabelSectionText(
    r?.information_for_patients ||
      r?.patient_medication_information ||
      r?.spl_medguide ||
      r?.spl_patient_package_insert ||
      r?.ask_doctor ||
      r?.ask_doctor_or_pharmacist
  )

  return {
    id,
    setId,
    title,
    genericName,
    brandNames: uniqueBrands,
    drugClass: pharmClasses.join("; "),
    manufacturer,
    effectiveDate,
    rawEffectiveTime: rawEffective,
    dailyMedUrl,
    usesText,
    dosageAdminText,
    contraindicationsText,
    mechanismText,
    sideEffectsText,
    interactionsText,
    boxedWarningText,
    warningsText,
    pregnancyText,
    overdosageText,
    storageText,
    patientCounselingText,
  }
}

function scoreLabelRelevance(label: ReturnType<typeof mapFdaResultToLabel>, primaryTarget: string): number {
  let score = 0
  const target = primaryTarget.toLowerCase().trim()
  const genLower = label.genericName.toLowerCase().trim()
  const brandLowers = label.brandNames.map((b) => b.toLowerCase().trim())

  // Exact single-drug match scores much higher than multi-drug combinations
  if (genLower === target) score += 100
  else if (brandLowers.includes(target)) score += 95
  else if (genLower.startsWith(target + " ") && !genLower.includes(" and ") && !genLower.includes("/")) score += 80
  else if (genLower.includes(target) && !genLower.includes(" and ")) score += 50
  else if (brandLowers.some((b) => b.startsWith(target))) score += 45

  // Completeness of clinical label sections
  if (label.usesText) score += 15
  if (label.sideEffectsText) score += 15
  if (label.mechanismText) score += 10
  if (label.interactionsText) score += 10
  if (label.warningsText || label.boxedWarningText) score += 10
  if (label.drugClass) score += 5

  return score
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawName = (searchParams.get("name") || "").trim()
  const rawGeneric = (searchParams.get("generic") || "").trim()

  if (!rawName && !rawGeneric) {
    return NextResponse.json({ error: "Missing medication name" }, { status: 400 })
  }

  const candidates = extractSearchCandidates(rawName, rawGeneric)
  if (candidates.length === 0) {
    return NextResponse.json({ labels: [], query: rawName || rawGeneric })
  }

  const rawResults: any[] = []
  const seenSetIds = new Set<string>()

  const collectResults = (items: any[]) => {
    for (const item of items) {
      const key = item?.set_id || item?.id
      if (!key || seenSetIds.has(key)) continue
      seenSetIds.add(key)
      rawResults.push(item)
    }
  }

  // Search strictly in order: generic_name first, then brand_name, then substance/DailyMed fallback
  for (const term of candidates) {
    const phrase = escapeLucenePhrase(term)
    if (!phrase) continue

    // 1) Generic name lookup first
    const byGeneric = await queryOpenFda(`openfda.generic_name:"${phrase}"`, 10)
    collectResults(byGeneric)

    // 2) Brand name lookup second
    const byBrand = await queryOpenFda(`openfda.brand_name:"${phrase}"`, 10)
    collectResults(byBrand)

    if (rawResults.length >= 6) break

    // 3) Substance name fallback
    const bySubstance = await queryOpenFda(`openfda.substance_name:"${phrase}"`, 8)
    collectResults(bySubstance)

    if (rawResults.length >= 6) break
  }

  // 4) DailyMed SPL search fallback if openFDA direct field search found nothing
  if (rawResults.length === 0) {
    for (const term of candidates.slice(0, 2)) {
      const dmResults = await queryDailyMedFallback(term)
      collectResults(dmResults)
      if (rawResults.length > 0) break
    }
  }

  const primaryTarget = candidates[0] || rawName || rawGeneric
  const mapped = rawResults
    .map((r) => mapFdaResultToLabel(r, rawName || rawGeneric))
    .filter(
      (lbl) =>
        Boolean(
          lbl.usesText ||
            lbl.sideEffectsText ||
            lbl.warningsText ||
            lbl.boxedWarningText ||
            lbl.mechanismText ||
            lbl.interactionsText
        )
    )
    .sort((a, b) => {
      const scoreDiff = scoreLabelRelevance(b, primaryTarget) - scoreLabelRelevance(a, primaryTarget)
      if (scoreDiff !== 0) return scoreDiff
      return (b.rawEffectiveTime || "").localeCompare(a.rawEffectiveTime || "")
    })

  // Deduplicate near-identical repackager entries (same title + same manufacturer) while keeping distinct manufacturers/formulations
  const deduped: typeof mapped = []
  const seenTitleMfg = new Set<string>()
  for (const lbl of mapped) {
    const key = `${lbl.title.toLowerCase()}__${lbl.manufacturer.toLowerCase()}`
    if (seenTitleMfg.has(key)) continue
    seenTitleMfg.add(key)
    deduped.push(lbl)
    if (deduped.length >= 8) break
  }

  return NextResponse.json({
    query: rawName || rawGeneric,
    labels: deduped,
  })
}
