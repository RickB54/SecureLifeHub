import {
  LabBigPicture,
  LabBigPictureSystemGroup,
  LabConfidence,
  LabDraftPayload,
  LabExplanation,
  LabFlagStatus,
  LabResultRow,
  LabTestAlias,
  LabUploadHints,
} from "./lab-results-types"

export interface CanonicalTestDef {
  key: string
  displayName: string
  system: string
  calculationGroup?: string
  aliases: string[]
}

export const BUILTIN_CANONICAL_TESTS: CanonicalTestDef[] = [
  // Metabolic / Blood Sugar
  {
    key: "glucose",
    displayName: "Glucose",
    system: "Blood Sugar",
    aliases: ["glucose", "glucose, serum", "glucose serum", "fasting glucose", "blood glucose", "glucose, plasma"],
  },
  {
    key: "hba1c",
    displayName: "Hemoglobin A1c",
    system: "Blood Sugar",
    aliases: ["hemoglobin a1c", "hba1c", "a1c", "glycohemoglobin", "hgba1c", "hemoglobin a1c (hba1c)"],
  },
  // Kidney / Electrolytes
  {
    key: "bun",
    displayName: "BUN",
    system: "Kidney",
    aliases: ["bun", "blood urea nitrogen", "urea nitrogen"],
  },
  {
    key: "creatinine",
    displayName: "Creatinine",
    system: "Kidney",
    aliases: ["creatinine", "creatinine, serum", "serum creatinine"],
  },
  {
    key: "egfr_non_aa",
    displayName: "eGFR (Non-African American)",
    system: "Kidney",
    calculationGroup: "egfr",
    aliases: [
      "egfr if nonafricn am",
      "egfr if non-african american",
      "egfr non-african american",
      "egfr",
      "estimated gfr",
    ],
  },
  {
    key: "egfr_aa",
    displayName: "eGFR (African American)",
    system: "Kidney",
    calculationGroup: "egfr",
    aliases: ["egfr if africn am", "egfr if african american", "egfr african american"],
  },
  {
    key: "bun_creatinine_ratio",
    displayName: "BUN/Creatinine Ratio",
    system: "Kidney",
    aliases: ["bun/creatinine ratio", "bun creatinine ratio", "bun/creat ratio"],
  },
  {
    key: "sodium",
    displayName: "Sodium",
    system: "Electrolytes",
    aliases: ["sodium", "sodium, serum", "na"],
  },
  {
    key: "potassium",
    displayName: "Potassium",
    system: "Electrolytes",
    aliases: ["potassium", "potassium, serum", "k"],
  },
  {
    key: "chloride",
    displayName: "Chloride",
    system: "Electrolytes",
    aliases: ["chloride", "chloride, serum", "cl"],
  },
  {
    key: "co2",
    displayName: "Carbon Dioxide, Total",
    system: "Electrolytes",
    aliases: ["carbon dioxide, total", "carbon dioxide", "co2", "bicarbonate"],
  },
  {
    key: "calcium",
    displayName: "Calcium",
    system: "Electrolytes",
    aliases: ["calcium", "calcium, serum"],
  },
  // Liver / Proteins
  {
    key: "protein_total",
    displayName: "Protein, Total",
    system: "Liver & Proteins",
    aliases: ["protein, total", "total protein"],
  },
  {
    key: "albumin",
    displayName: "Albumin",
    system: "Liver & Proteins",
    aliases: ["albumin", "albumin, serum"],
  },
  {
    key: "globulin_total",
    displayName: "Globulin, Total",
    system: "Liver & Proteins",
    aliases: ["globulin, total", "total globulin", "globulin"],
  },
  {
    key: "ag_ratio",
    displayName: "A/G Ratio",
    system: "Liver & Proteins",
    aliases: ["a/g ratio", "albumin/globulin ratio"],
  },
  {
    key: "bilirubin_total",
    displayName: "Bilirubin, Total",
    system: "Liver",
    aliases: ["bilirubin, total", "total bilirubin", "bilirubin"],
  },
  {
    key: "alkaline_phosphatase",
    displayName: "Alkaline Phosphatase",
    system: "Liver",
    aliases: ["alkaline phosphatase", "alk phos", "alp"],
  },
  {
    key: "ast",
    displayName: "AST (SGOT)",
    system: "Liver",
    aliases: ["ast (sgot)", "ast", "aspartate aminotransferase", "sgot"],
  },
  {
    key: "alt",
    displayName: "ALT (SGPT)",
    system: "Liver",
    aliases: ["alt (sgpt)", "alt", "alanine aminotransferase", "sgpt"],
  },
  // Iron / Ferritin
  {
    key: "ferritin",
    displayName: "Ferritin",
    system: "Iron",
    aliases: ["ferritin", "ferritin, serum", "serum ferritin"],
  },
  {
    key: "iron",
    displayName: "Iron",
    system: "Iron",
    aliases: ["iron", "iron, serum", "serum iron", "iron, total"],
  },
  {
    key: "tibc",
    displayName: "Iron Binding Capacity (TIBC)",
    system: "Iron",
    aliases: ["iron bind.cap.(tibc)", "iron bind.cap (tibc)", "tibc", "total iron binding capacity"],
  },
  {
    key: "uibc",
    displayName: "UIBC",
    system: "Iron",
    aliases: ["uibc", "unsaturated iron binding capacity"],
  },
  {
    key: "iron_saturation",
    displayName: "Iron Saturation",
    system: "Iron",
    aliases: ["iron saturation", "% saturation", "transferrin saturation"],
  },
  // CBC (full CBC with differential)
  { key: "wbc", displayName: "WBC", system: "Blood Count", aliases: ["wbc", "white blood cell count", "white blood cells", "leukocytes"] },
  { key: "rbc", displayName: "RBC", system: "Blood Count", aliases: ["rbc", "red blood cell count", "red blood cells", "erythrocytes"] },
  { key: "hemoglobin", displayName: "Hemoglobin", system: "Blood Count", aliases: ["hemoglobin", "hgb", "hb"] },
  { key: "hematocrit", displayName: "Hematocrit", system: "Blood Count", aliases: ["hematocrit", "hct"] },
  { key: "mcv", displayName: "MCV", system: "Blood Count", aliases: ["mcv", "mean corpuscular volume"] },
  { key: "mch", displayName: "MCH", system: "Blood Count", aliases: ["mch", "mean corpuscular hemoglobin"] },
  { key: "mchc", displayName: "MCHC", system: "Blood Count", aliases: ["mchc", "mean corpuscular hgb conc"] },
  { key: "rdw", displayName: "RDW", system: "Blood Count", aliases: ["rdw", "red cell distribution width"] },
  { key: "platelets", displayName: "Platelets", system: "Blood Count", aliases: ["platelets", "platelet count", "plt"] },
  { key: "mpv", displayName: "MPV", system: "Blood Count", aliases: ["mpv", "mean platelet volume"] },
  { key: "neutrophils_pct", displayName: "Neutrophils %", system: "Blood Count", aliases: ["neutrophils", "neutrophils %", "neutrophils, %", "polys", "segmented neutrophils"] },
  { key: "lymphs_pct", displayName: "Lymphocytes %", system: "Blood Count", aliases: ["lymphs", "lymphocytes", "lymphocytes %", "lymphocytes, %"] },
  { key: "monocytes_pct", displayName: "Monocytes %", system: "Blood Count", aliases: ["monocytes", "monocytes %", "monocytes, %"] },
  { key: "eos_pct", displayName: "Eosinophils %", system: "Blood Count", aliases: ["eos", "eosinophils", "eosinophils %", "eosinophils, %"] },
  { key: "basos_pct", displayName: "Basophils %", system: "Blood Count", aliases: ["basos", "basophils", "basophils %", "basophils, %"] },
  { key: "neutrophils_abs", displayName: "Neutrophils (Absolute)", system: "Blood Count", aliases: ["neutrophils (absolute)", "absolute neutrophils", "neutrophils, absolute"] },
  { key: "lymphs_abs", displayName: "Lymphs (Absolute)", system: "Blood Count", aliases: ["lymphs (absolute)", "absolute lymphocytes", "lymphocytes, absolute"] },
  { key: "monocytes_abs", displayName: "Monocytes (Absolute)", system: "Blood Count", aliases: ["monocytes(absolute)", "monocytes (absolute)", "absolute monocytes", "monocytes, absolute"] },
  { key: "eos_abs", displayName: "Eos (Absolute)", system: "Blood Count", aliases: ["eos (absolute)", "absolute eosinophils", "eosinophils, absolute"] },
  { key: "baso_abs", displayName: "Baso (Absolute)", system: "Blood Count", aliases: ["baso (absolute)", "absolute basophils", "basophils, absolute"] },
  { key: "immature_granulocytes_pct", displayName: "Immature Granulocytes %", system: "Blood Count", aliases: ["immature granulocytes", "immature granulocytes %"] },
  { key: "immature_grans_abs", displayName: "Immature Grans (Abs)", system: "Blood Count", aliases: ["immature grans (abs)", "immature granulocytes (abs)", "absolute immature granulocytes"] },
  // Lipid Panel
  { key: "cholesterol_total", displayName: "Total Cholesterol", system: "Cholesterol & Heart", aliases: ["cholesterol, total", "total cholesterol", "cholesterol"] },
  { key: "triglycerides", displayName: "Triglycerides", system: "Cholesterol & Heart", aliases: ["triglycerides", "triglyceride"] },
  { key: "hdl", displayName: "HDL Cholesterol", system: "Cholesterol & Heart", aliases: ["hdl cholesterol", "hdl", "hdl-cholesterol", "hdl-c"] },
  { key: "ldl", displayName: "LDL Cholesterol", system: "Cholesterol & Heart", aliases: ["ldl cholesterol", "ldl cholesterol calc", "ldl-cholesterol", "ldl-c", "ldl", "ldl cholesterol (calc)", "ldl chol calc (nih)"] },
  { key: "non_hdl", displayName: "Non-HDL Cholesterol", system: "Cholesterol & Heart", aliases: ["non-hdl cholesterol", "non hdl cholesterol"] },
  { key: "chol_hdl_ratio", displayName: "Chol/HDL Ratio", system: "Cholesterol & Heart", aliases: ["chol/hdlc ratio", "chol/hdl ratio", "cholesterol/hdl ratio"] },
  { key: "vldl", displayName: "VLDL Cholesterol", system: "Cholesterol & Heart", aliases: ["vldl cholesterol", "vldl cholesterol cal", "vldl"] },
  // Thyroid
  { key: "tsh", displayName: "TSH", system: "Thyroid", aliases: ["tsh", "thyroid stimulating hormone", "tsh w/reflex to free t4"] },
  { key: "free_t4", displayName: "Free T4", system: "Thyroid", aliases: ["t4, free", "free t4", "t4 free(direct)", "t4, free (direct)", "thyroxine (t4) free"] },
  { key: "free_t3", displayName: "Free T3", system: "Thyroid", aliases: ["t3, free", "free t3", "triiodothyronine (t3), free", "triiodothyronine, free"] },
  // Vitamins & Nutrition
  { key: "vitamin_d", displayName: "Vitamin D, 25-Hydroxy", system: "Vitamins & Hormones", aliases: ["vitamin d, 25-hydroxy", "vitamin d", "25-hydroxy vitamin d", "vitamin d,25-oh,total,ia", "vitamin d, 25-oh, total", "25-oh vitamin d"] },
  { key: "vitamin_b12", displayName: "Vitamin B12", system: "Vitamins & Hormones", aliases: ["vitamin b12", "b12", "vitamin b-12", "cobalamin"] },
  { key: "folate", displayName: "Folate", system: "Vitamins & Hormones", aliases: ["folate", "folate, serum", "folic acid", "serum folate"] },
  // Hormones & Prostate
  { key: "psa", displayName: "PSA (Prostate Specific Antigen)", system: "Hormones & Prostate", aliases: ["psa", "psa, total", "prostate specific ag", "prostate specific ag, total", "prostate-specific antigen", "total psa"] },
  { key: "testosterone_total", displayName: "Testosterone, Total", system: "Vitamins & Hormones", aliases: ["testosterone, total", "testosterone, total, ms", "total testosterone", "testosterone", "testosterone, serum"] },
  { key: "testosterone_free", displayName: "Testosterone, Free", system: "Vitamins & Hormones", aliases: ["testosterone, free", "free testosterone", "testosterone, free (direct)", "free testosterone (direct)"] },
  // Inflammation
  { key: "crp", displayName: "C-Reactive Protein (CRP)", system: "Inflammation", aliases: ["crp", "c-reactive protein", "c-reactive protein, quant", "c reactive protein"] },
  { key: "hs_crp", displayName: "hs-CRP (High Sensitivity CRP)", system: "Inflammation", aliases: ["hs-crp", "hs crp", "c-reactive protein, cardiac", "high sensitivity crp", "cardiac crp"] },
  { key: "esr", displayName: "ESR (Sedimentation Rate)", system: "Inflammation", aliases: ["esr", "sed rate", "sedimentation rate", "sedimentation rate-westergren", "esr, westergren"] },
  // Minerals, Liver & Metabolic
  { key: "magnesium", displayName: "Magnesium", system: "Electrolytes", aliases: ["magnesium", "magnesium, serum", "mg"] },
  { key: "phosphorus", displayName: "Phosphorus", system: "Electrolytes", aliases: ["phosphorus", "phosphorus, serum", "phosphate"] },
  { key: "uric_acid", displayName: "Uric Acid", system: "Metabolic", aliases: ["uric acid", "uric acid, serum"] },
  { key: "ggt", displayName: "GGT", system: "Liver", aliases: ["ggt", "gamma-glutamyl transferase", "gamma glutamyl transferase", "ggtp"] },
  { key: "fasting_insulin", displayName: "Fasting Insulin", system: "Blood Sugar", aliases: ["insulin", "fasting insulin", "insulin, fasting", "insulin, serum"] },
  // Urinalysis
  { key: "urine_specific_gravity", displayName: "Urine Specific Gravity", system: "Urinalysis", aliases: ["specific gravity", "urine specific gravity", "sp gravity"] },
  { key: "urine_ph", displayName: "Urine pH", system: "Urinalysis", aliases: ["ph", "urine ph", "ph, urine"] },
  { key: "urine_leukocyte_esterase", displayName: "Urine Leukocyte Esterase", system: "Urinalysis", aliases: ["leukocyte esterase", "urine leukocyte esterase", "leukocytes, urine"] },
  { key: "urine_nitrite", displayName: "Urine Nitrite", system: "Urinalysis", aliases: ["nitrite", "urine nitrite", "nitrite, urine"] },
  { key: "urine_protein", displayName: "Urine Protein", system: "Urinalysis", aliases: ["urine protein", "protein, urine"] },
  { key: "urine_glucose", displayName: "Urine Glucose", system: "Urinalysis", aliases: ["urine glucose", "glucose, urine"] },
  { key: "urine_ketones", displayName: "Urine Ketones", system: "Urinalysis", aliases: ["ketones", "urine ketones", "ketones, urine"] },
  { key: "urine_blood", displayName: "Urine Occult Blood", system: "Urinalysis", aliases: ["occult blood", "urine blood", "blood, urine"] },
  { key: "urine_bilirubin", displayName: "Urine Bilirubin", system: "Urinalysis", aliases: ["urine bilirubin", "bilirubin, urine"] },
  { key: "urine_urobilinogen", displayName: "Urine Urobilinogen", system: "Urinalysis", aliases: ["urobilinogen", "urine urobilinogen"] },
]

export function cleanTestNameForLookup(raw: string): string {
  return raw
    .replace(/\s*\b0\d\b\s*$/g, "") // strip trailing LabCorp lab code superscripts like "01"
    .replace(/(?<=[A-Za-z])0\d\b/g, "") // e.g., "Glucose01" -> "Glucose"
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

export function slugifyTestKey(raw: string): string {
  const cleaned = cleanTestNameForLookup(raw)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return cleaned || "unknown_test"
}

export function normalizeTestName(
  rawTestName: string,
  userAliases: LabTestAlias[] = []
): {
  normalized_test_key: string
  display_name: string
  calculation_group: string | null
  is_unmapped: boolean
  system: string
} {
  const cleaned = cleanTestNameForLookup(rawTestName)

  // 1. User-defined aliases take priority
  for (const ua of userAliases) {
    if (cleanTestNameForLookup(ua.alias_name) === cleaned) {
      const def = BUILTIN_CANONICAL_TESTS.find((d) => d.key === ua.normalized_test_key)
      return {
        normalized_test_key: ua.normalized_test_key,
        display_name: ua.display_name || def?.displayName || rawTestName.trim(),
        calculation_group: def?.calculationGroup || null,
        is_unmapped: false,
        system: def?.system || "Other",
      }
    }
  }

  // 2. Built-in canonical dictionary
  for (const def of BUILTIN_CANONICAL_TESTS) {
    if (def.aliases.some((a) => a === cleaned)) {
      return {
        normalized_test_key: def.key,
        display_name: def.displayName,
        calculation_group: def.calculationGroup || null,
        is_unmapped: false,
        system: def.system,
      }
    }
  }

  // 3. Unrecognized test -> keep as its own test, NEVER drop
  return {
    normalized_test_key: slugifyTestKey(rawTestName),
    display_name: rawTestName.replace(/\s*\b0\d\b\s*$/g, "").trim(),
    calculation_group: cleaned.includes("egfr") ? "egfr" : null,
    is_unmapped: true,
    system: "Other",
  }
}

export function parseComparatorAndNumber(valueText: string): {
  comparator: "<" | ">" | null
  value_numeric: number | null
} {
  const t = (valueText || "").trim()
  if (!t) return { comparator: null, value_numeric: null }

  const match = t.match(/^([<>])=?\s*(-?\d+(?:\.\d+)?)$/)
  if (match) {
    const comp = match[1] === "<" ? "<" : ">"
    const num = parseFloat(match[2])
    return {
      comparator: comp,
      value_numeric: Number.isFinite(num) ? num : null,
    }
  }

  // Strip trailing asterisk (e.g. "73*")
  const plain = t.replace(/\*+$/, "").trim()
  if (/^-?\d+(?:\.\d+)?$/.test(plain)) {
    const num = parseFloat(plain)
    return { comparator: null, value_numeric: Number.isFinite(num) ? num : null }
  }

  return { comparator: null, value_numeric: null }
}

export function parseReferenceRange(referenceText: string): {
  low: number | null
  high: number | null
  hasRange: boolean
} {
  const raw = (referenceText || "")
    .replace(/^Reference\s*Range:?\s*/i, "")
    .replace(/\s*\(calc\)\s*$/i, "")
    .trim()
  if (!raw || /^(not\s*estab\.?|n\/a|none|-|—)$/i.test(raw)) {
    return { low: null, high: null, hasRange: false }
  }

  // Normalize Quest comparator phrasing: "> OR = 40" -> ">=40", "< OR = 4.0" -> "<=4.0"
  const norm = raw
    .replace(/>\s*OR\s*=\s*/gi, ">=")
    .replace(/<\s*OR\s*=\s*/gi, "<=")

  // "65-99", "0.76 - 1.27"
  const between = norm.match(/(-?\d+(?:\.\d+)?)\s*[-–to]+\s*(-?\d+(?:\.\d+)?)/i)
  if (between) {
    const low = parseFloat(between[1])
    const high = parseFloat(between[2])
    if (Number.isFinite(low) && Number.isFinite(high)) {
      return { low, high, hasRange: true }
    }
  }

  // "<200" or "<= 200"
  const lt = norm.match(/^<=?\s*(-?\d+(?:\.\d+)?)/)
  if (lt) {
    const high = parseFloat(lt[1])
    if (Number.isFinite(high)) return { low: null, high, hasRange: true }
  }

  // ">59" or ">= 60"
  const gt = norm.match(/^>=?\s*(-?\d+(?:\.\d+)?)/)
  if (gt) {
    const low = parseFloat(gt[1])
    if (Number.isFinite(low)) return { low, high: null, hasRange: true }
  }

  return { low: null, high: null, hasRange: false }
}

export function normalizePrintedFlag(labFlag?: string | null): "high" | "low" | "critical" | "normal" | null {
  const f = (labFlag || "").trim().toLowerCase()
  if (!f) return null
  if (f.includes("crit") || f === "hh" || f === "ll" || f.includes("alert") || f.includes("panic")) {
    return "critical"
  }
  if (f === "h" || f === "high" || f === "↑" || f === "hi" || f.includes("above")) {
    return "high"
  }
  if (f === "l" || f === "low" || f === "↓" || f === "lo" || f.includes("below")) {
    return "low"
  }
  if (f === "n" || f === "normal") return "normal"
  return null
}

/**
 * Enforces all 11 Extraction Rules on a single result row.
 */
export function evaluateResultRules(row: Partial<LabResultRow>, userAliases: LabTestAlias[] = []): LabResultRow {
  const rawTestName = (row.test_name || "").replace(/(?<=[A-Za-z])0\d\b/g, "").replace(/\s+\b0\d\b$/g, "").trim()
  const norm = normalizeTestName(rawTestName, userAliases)
  const valueText = (row.value_text ?? (row.value_numeric != null ? String(row.value_numeric) : "")).trim()

  const parsedVal = parseComparatorAndNumber(valueText)
  const valueNumeric = row.value_numeric != null && Number.isFinite(row.value_numeric)
    ? row.value_numeric
    : parsedVal.value_numeric
  const comparator = row.comparator ?? parsedVal.comparator

  // Detect narrative results (Rule 7)
  const isNarrative = Boolean(
    row.is_narrative ||
      (valueText.length > 0 &&
        valueNumeric === null &&
        /[a-z]{3,}/i.test(valueText) &&
        !/^(unreadable|unclear|\?+|n\/a|pending)$/i.test(valueText))
  )

  const refText = (row.reference_text || "").trim()
  const parsedRef = parseReferenceRange(refText)
  const refLow = row.reference_low != null && Number.isFinite(row.reference_low) ? row.reference_low : parsedRef.low
  const refHigh = row.reference_high != null && Number.isFinite(row.reference_high) ? row.reference_high : parsedRef.high
  const hasRange = refLow !== null || refHigh !== null

  const printedFlagNorm = normalizePrintedFlag(row.lab_flag)

  let flagStatus: LabFlagStatus = "normal"
  let isBorderline = false
  let reviewReason: string | null = null

  // Rule 2: Unreadable or missing value
  if (!valueText || /^(unreadable|unclear|\?+)$/i.test(valueText)) {
    flagStatus = "needs_review"
    reviewReason = "Value could not be read clearly."
  } else if (isNarrative) {
    // Rule 7: Narrative results are never parsed as numbers
    flagStatus = printedFlagNorm === "critical" ? "critical" : printedFlagNorm === "high" ? "high" : printedFlagNorm === "low" ? "low" : "normal"
  } else if (!hasRange) {
    // Rule 5: No range ("Not Estab." or blank) -> saved with no range and no flag, NOT needs_review
    flagStatus = printedFlagNorm && printedFlagNorm !== "normal" ? printedFlagNorm : "normal"
  } else if (valueNumeric !== null) {
    // Compute expected flag from printed range
    let computed: "normal" | "high" | "low" = "normal"
    if (comparator === "<") {
      // e.g. "<0.2" with range "0.0-1.2" -> within range; with range ">59" -> low
      if (refLow !== null && valueNumeric <= refLow && refHigh === null) computed = "low"
      else computed = "normal"
    } else if (comparator === ">") {
      // e.g. ">59" with range ">59" -> normal; with range "<200" -> high if >= 200
      if (refHigh !== null && valueNumeric >= refHigh && refLow === null) computed = "high"
      else computed = "normal"
    } else {
      if (refHigh !== null && valueNumeric > refHigh) computed = "high"
      else if (refLow !== null && valueNumeric < refLow) computed = "low"
      else computed = "normal"
    }

    // Rule 1: Lab's printed flag & range are source of truth; if they disagree -> needs_review
    if (printedFlagNorm) {
      if (printedFlagNorm === "critical") {
        flagStatus = "critical"
      } else if (printedFlagNorm !== computed) {
        flagStatus = "needs_review"
        reviewReason = `Printed flag (${row.lab_flag}) disagrees with reference range (${refText}).`
      } else {
        flagStatus = printedFlagNorm
      }
    } else {
      flagStatus = computed
      // Rule 11: Edge of range unflagged by lab -> borderline for info only, NOT flagged
      if (
        computed === "normal" &&
        comparator === null &&
        ((refHigh !== null && valueNumeric === refHigh) || (refLow !== null && valueNumeric === refLow))
      ) {
        isBorderline = true
      }
    }
  } else {
    flagStatus = "needs_review"
    reviewReason = "Value format needs review."
  }

  return {
    id: row.id,
    report_id: row.report_id,
    test_name: rawTestName || "Unnamed Test",
    normalized_test_key: row.normalized_test_key || norm.normalized_test_key,
    panel_name: (row.panel_name || "General").trim(),
    value_numeric: isNarrative ? null : valueNumeric,
    value_text: valueText,
    comparator: isNarrative ? null : comparator,
    unit: (row.unit || "").trim(),
    reference_low: hasRange ? refLow : null,
    reference_high: hasRange ? refHigh : null,
    reference_text: /^(not\s*estab\.?)$/i.test(refText) ? "" : refText,
    lab_flag: row.lab_flag ? String(row.lab_flag).trim() : null,
    flag_status: flagStatus,
    is_borderline: isBorderline,
    previous_value: row.previous_value ? String(row.previous_value).trim() : null,
    previous_date: normalizeIsoDate(row.previous_date),
    notes: row.notes ? String(row.notes).trim() : null,
    is_narrative: isNarrative,
    source_kind: row.source_kind || "report",
    calculation_group: row.calculation_group ?? norm.calculation_group,
    date_collected: normalizeIsoDate(row.date_collected),
    personalized_line: row.personalized_line || null,
    is_unmapped: norm.is_unmapped,
    review_reason: reviewReason,
  }
}

export function normalizeIsoDate(raw?: string | null): string | null {
  if (!raw) return null
  const t = String(raw).trim()
  if (!t) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const mdy = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  if (mdy) {
    const mm = mdy[1].padStart(2, "0")
    const dd = mdy[2].padStart(2, "0")
    const yyyy = mdy[3].length === 2 ? `20${mdy[3]}` : mdy[3]
    return `${yyyy}-${mm}-${dd}`
  }
  const parsed = new Date(t)
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, "0")
    const d = String(parsed.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  return null
}

/**
 * Strips any address/phone fields and validates/normalizes the full extraction JSON.
 */
export function validateAndNormalizeExtraction(
  raw: any,
  userAliases: LabTestAlias[] = []
): LabDraftPayload {
  const rep = raw?.report || {}
  const confidenceRaw = String(rep.extraction_confidence || raw?.extraction_confidence || "medium").toLowerCase()
  const extraction_confidence: LabConfidence =
    confidenceRaw === "high" || confidenceRaw === "low" ? confidenceRaw : "medium"

  const dateCollected = normalizeIsoDate(rep.date_collected)
  const rawResults: any[] = Array.isArray(raw?.results) ? raw.results : []

  const results: LabResultRow[] = rawResults
    .filter((r) => r && (r.test_name || r.value_text || r.value_numeric != null))
    .map((r) => {
      const evaluated = evaluateResultRules({ ...r, date_collected: dateCollected }, userAliases)
      return evaluated
    })

  const needsRetake = Boolean(
    raw?.needs_retake ||
      extraction_confidence === "low" ||
      (results.length === 0 && !raw?.needs_retake)
  )

  const unmappedMap = new Map<string, string>()
  for (const r of results) {
    if (r.is_unmapped) {
      unmappedMap.set(r.test_name, r.normalized_test_key)
    }
  }

  return {
    report: {
      lab_name: String(rep.lab_name || "Unknown Lab").trim(),
      patient_name: rep.patient_name ? String(rep.patient_name).trim() : null,
      dob: rep.dob ? String(rep.dob).trim() : null,
      specimen_id: rep.specimen_id ? String(rep.specimen_id).trim() : null,
      ordering_physician: rep.ordering_physician ? String(rep.ordering_physician).trim() : null,
      date_collected: dateCollected,
      date_received: normalizeIsoDate(rep.date_received),
      date_reported: normalizeIsoDate(rep.date_reported),
      fasting: typeof rep.fasting === "boolean" ? rep.fasting : null,
      report_type: rep.report_type ? String(rep.report_type).trim() : null,
      extraction_confidence,
    },
    results,
    needs_retake: needsRetake,
    retake_reason: needsRetake
      ? String(
          raw?.retake_reason ||
            "Image quality or text clarity is too low to extract reliably. Please retake or re-upload a clearer copy."
        )
      : null,
    unmapped_tests: Array.from(unmappedMap.entries()).map(([test_name, suggested_key]) => ({
      test_name,
      suggested_key,
    })),
    token_usage: raw?.token_usage || null,
  }
}

/**
 * Deduplicates previous-result column imports against existing + direct report results.
 * Direct report entries ALWAYS win over previous-column entries.
 */
export function buildPreviousColumnRows(
  reportId: string,
  directResults: LabResultRow[],
  existingPoints: Array<{ normalized_test_key: string; value_text: string; date_collected: string | null; source_kind?: string }>
): LabResultRow[] {
  const makeKey = (testKey: string, val: string, date: string | null) =>
    `${testKey.toLowerCase()}::${val.replace(/\*+$/, "").trim().toLowerCase()}::${date || ""}`

  const existingSet = new Set<string>()
  for (const ex of existingPoints) {
    existingSet.add(makeKey(ex.normalized_test_key, ex.value_text, ex.date_collected))
  }
  for (const dr of directResults) {
    existingSet.add(makeKey(dr.normalized_test_key, dr.value_text, dr.date_collected || null))
  }

  const extraRows: LabResultRow[] = []
  for (const dr of directResults) {
    if (!dr.previous_value || !dr.previous_date) continue
    const cleanPrevVal = dr.previous_value.replace(/\*+$/, "").trim()
    const key = makeKey(dr.normalized_test_key, cleanPrevVal, dr.previous_date)
    if (existingSet.has(key)) continue
    existingSet.add(key)

    const evaluated = evaluateResultRules({
      report_id: reportId,
      test_name: dr.test_name,
      normalized_test_key: dr.normalized_test_key,
      panel_name: dr.panel_name,
      value_text: cleanPrevVal,
      unit: dr.unit,
      reference_low: dr.reference_low,
      reference_high: dr.reference_high,
      reference_text: dr.reference_text,
      lab_flag: null,
      date_collected: dr.previous_date,
      source_kind: "previous_column",
      calculation_group: dr.calculation_group,
      notes: "Imported from previous-result column",
    })
    extraRows.push(evaluated)
  }

  return extraRows
}

/**
 * Safety sanitizer: ensures no explanation tells the user to start, stop, or change
 * any medication or supplement dose, or diagnoses a condition.
 */
export function sanitizeExplanationText(text: string): string {
  if (!text) return ""
  let cleaned = text.trim()
  const forbiddenPatterns: Array<[RegExp, string]> = [
    [/\b(you should|make sure to|be sure to|start taking|stop taking|discontinue|increase your dose|decrease your dose|change your dose)\b/gi, "you may want to discuss with your doctor"],
    [/\byou have (diabetes|hemochromatosis|liver disease|kidney disease|anemia|prediabetes|fatty liver)\b/gi, "this can sometimes be associated with $1, which only your doctor can evaluate"],
  ]
  for (const [pattern, replacement] of forbiddenPatterns) {
    cleaned = cleaned.replace(pattern, replacement)
  }
  return cleaned
}

/**
 * Deterministic text parser used for pasted text fallback and synthetic self-tests
 * when no Gemini API key is configured locally.
 */
export function parseLabReportTextFallback(
  rawText: string,
  hints?: LabUploadHints,
  userAliases: LabTestAlias[] = []
): LabDraftPayload {
  const text = (rawText || "").replace(/\r\n/g, "\n").trim()

  // Detect blurry / garbled / unreadable text (Rule 10)
  const alphaCount = (text.match(/[A-Za-z]/g) || []).length
  const symbolRatio = text.length > 0 ? (text.match(/[^A-Za-z0-9\s.,:/()\-<>%*]/g) || []).length / text.length : 1
  if (text.length < 25 || alphaCount < 15 || symbolRatio > 0.25) {
    return validateAndNormalizeExtraction(
      {
        report: {
          lab_name: hints?.labProvider && hints.labProvider !== "Auto-detect" ? hints.labProvider : "Unknown Lab",
          extraction_confidence: "low",
        },
        results: [],
        needs_retake: true,
        retake_reason: "The text appears garbled or unreadable. Please retake a clearer photo or paste the full lab report text.",
      },
      userAliases
    )
  }

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  // Metadata extraction (never store address or phone)
  let labName =
    hints?.labProvider && hints.labProvider !== "Auto-detect"
      ? hints.labProvider === "Other" && hints.labProviderCustom
        ? hints.labProviderCustom
        : hints.labProvider
      : /labcorp/i.test(text)
      ? "LabCorp"
      : /quest\s+diagnostics/i.test(text)
      ? "Quest Diagnostics"
      : "Unknown Lab"

  const specimenMatch = text.match(/Specimen\s*ID[:\s]+([A-Z0-9-]+)/i)
  const collectedMatch = text.match(/Date\s*Collected[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/i)
  const receivedMatch = text.match(/Date\s*Received[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/i)
  const reportedMatch = text.match(/Date\s*Reported[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/i)
  const fastingMatch = text.match(/Fasting[:\s]+(Yes|No|True|False)/i)
  const physicianMatch = text.match(/Ordering\s*(?:Physician|Provider)?[:\s]+([A-Za-z.,\s]{2,40}?)(?:\s{2,}|$|Date|Account|NPI)/im)
  const dobMatch = text.match(/DOB[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/i)
  const patientMatch = text.match(/Patient(?:\s*Name)?[:\s]+([A-Za-z,\s.-]{2,40}?)(?:\s{2,}|$|DOB|Age|Account)/im)

  let currentPanel = "General"
  const results: Partial<LabResultRow>[] = []

  const knownPanels = [
    /^Comp\.\s*Metabolic\s*Panel/i,
    /^Comprehensive\s*Metabolic\s*Panel/i,
    /^Basic\s*Metabolic\s*Panel/i,
    /^CBC\s*(?:With\s*Differential|\(includes\s*Diff)/i,
    /^Iron\s*and\s*TIBC/i,
    /^Iron\s*Panel/i,
    /^Hemoglobin\s*A1c$/i,
    /^Ferritin$/i,
    /^Lipid\s*Panel/i,
    /^Thyroid\s*(?:Panel|Cascade|Function)/i,
    /^Hered\.\s*Hemochromatosis/i,
    /^Urinalysis/i,
    /^Inflammatory\s*Markers/i,
    /^Hormone\s*Panel/i,
    /^Vitamins\s*(?:&|and)\s*Minerals/i,
  ]

  // Comprehensive header/metadata line filter — never treat these as lab tests
  const isMetadataOrHeaderLine = (ln: string): boolean => {
    if (
      /^(Test(?:\s+Name)?|TESTS|Result|Flag|Reference\s*Range|In\s*Range|Out\s*Of\s*Range|Units|Lab|LabCorp|Quest\s*Diagnostics|Patient\s*Report|Patient\s*Details|Patient\s*Name|Patient\s*ID|Alternate\s*Patient\s*ID|DOB|Date\s*of\s*Birth|Age|Sex|Gender|Specimen\s*ID|Specimen\s*Details|Accession|Requisition|Order\s*#|Control\s*ID|Account\s*(?:Number|#)|Client\s*(?:Number|#)|NPI|CLIA|Physician\s*Details|Ordering\s*(?:Physician|Provider)|Referring\s*(?:Physician|Provider)|Date\s*Collected|Collection\s*Date|Date\s*Received|Date\s*Reported|Date\s*Entered|Date\s*Created|Report\s*Date|Print\s*Date|Fasting\s*[:]|Fasting\s+(?:Yes|No|Status|True|False)|Disclaimer|Icon\s*Legend|Performing\s*Labs?|Director|Dir:|©|Copyright|All\s*Rights\s*Reserved|This\s*document|For\s*Inquiries|Phone|Tel|Fax|Address|Street|Suite|Rte:|Ordered\s*Items|General\s*Comments|Page\s*\d+\s*of\s*\d+|Final\s*Report|Status:|Comments?:)\b/i.test(
        ln
      )
    ) {
      return true
    }
    // Street address / phone-only / NPI-only lines
    if (/^\d{1,5}\s+[A-Z][A-Za-z0-9\s.,]+(?:ST|AVE|RD|BLVD|DR|LN|PKWY|WAY|SUITE|STE)\b/i.test(ln)) return true
    if (/^\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}$/.test(ln)) return true
    if (/\bNPI[:\s#]+\d{8,12}\b/i.test(ln)) return true
    if (/\b(?:Account|Specimen|Accession|Requisition|Control)\s*(?:ID|Number|#)?[:\s]+[A-Z0-9-]{4,}/i.test(ln)) return true
    return false
  }

  const QUEST_LAB_CODE_TAIL = /(?:\s+(?:0\d|AMD|SLI|QDI|Z3M|SJC|EN|RN|TB|QTE|SJC|WH|SJ|NC|CB|EZ))$/i
  const RANGE_EXPR =
    "(?:\\d+(?:\\.\\d+)?\\s*[-–]\\s*\\d+(?:\\.\\d+)?|(?:>=?|<=?|>[\\s]*OR[\\s]*=|<[\\s]*OR[\\s]*=)\\s*\\d+(?:\\.\\d+)?|Not\\s*Estab\\.?)"

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Skip headers / footers / contact / metadata lines (Rule 5)
    if (isMetadataOrHeaderLine(line)) {
      i++
      continue
    }

    // Panel header detection
    if (knownPanels.some((p) => p.test(line)) && !/\d{2}\/\d{2}\/\d{4}/.test(line)) {
      currentPanel = line.replace(/\s*\(\d+\)\s*$/, "").trim()
      i++
      continue
    }

    // Attached note / comment under previous test (Rule 8)
    if (/^(Please Note:?|\*\*.*|\* Previous Reference Interval)/i.test(line)) {
      const noteLines = [line]
      while (
        i + 1 < lines.length &&
        !isMetadataOrHeaderLine(lines[i + 1]) &&
        !knownPanels.some((p) => p.test(lines[i + 1])) &&
        !/\b(High|Low|Not Estab\.|mg\/dL|g\/dL|IU\/L|ng\/mL|mmol\/L|mIU\/L|pg\/mL|mg\/L|x10E3\/uL|%)\b/i.test(lines[i + 1]) &&
        !/^([A-Za-z][A-Za-z0-9\s(),./-]{1,35})\s{2,}([<>]?\d+(?:\.\d+)?)\b/.test(lines[i + 1])
      ) {
        i++
        noteLines.push(lines[i])
      }
      if (results.length > 0) {
        const prev = results[results.length - 1]
        prev.notes = [prev.notes, noteLines.join(" ")].filter(Boolean).join("\n")
      }
      i++
      continue
    }

    // Narrative genetic test (Rule 7): e.g. "Hereditary Hemochromatosis" followed by "NO MUTATION IDENTIFIED" + Interpretation
    if (/NO\s+MUTATION\s+IDENTIFIED|MUTATION\s+DETECTED|NEGATIVE\s+FOR/i.test(line)) {
      const testName =
        i > 0 && !/\d/.test(lines[i - 1]) && lines[i - 1].length < 60 && !isMetadataOrHeaderLine(lines[i - 1])
          ? lines[i - 1]
          : currentPanel
      const valueText = line.replace(/\s+\b0\d\b$/, "").trim()
      const noteParts: string[] = []
      while (
        i + 1 < lines.length &&
        !/^(Ferritin|Comp\.|CBC|Iron|Hemoglobin|Lipid|Thyroid)\b/i.test(lines[i + 1])
      ) {
        i++
        if (/^(Date Created|©|Page \d)/i.test(lines[i])) break
        noteParts.push(lines[i])
      }
      results.push({
        test_name: testName,
        panel_name: currentPanel,
        value_text: valueText,
        value_numeric: null,
        is_narrative: true,
        reference_text: "",
        unit: "",
        lab_flag: null,
        notes: noteParts.join("\n"),
      })
      i++
      continue
    }

    // Pattern A: LabCorp-style row with Previous Result + Date:
    // "Glucose01 101 High 101 02/10/2021 mg/dL 65-99"
    // "Bilirubin, Total 01 <0.2 0.5 02/10/2021 mg/dL 0.0-1.2"
    const labcorpMatch = line.match(
      /^([A-Za-z][A-Za-z0-9\s(),./-]{1,42}?)(?:\s*0\d)?\s+([<>]?\d+(?:\.\d+)?)\s+(High|Low|Critical|H|L)?\s*([<>]?\d+(?:\.\d+)?\*?)?\s*(\d{2}\/\d{2}\/\d{4})\s+([A-Za-z0-9/%.*-]+)?\s*((?:\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?)|(?:[<>]=?\s*\d+(?:\.\d+)?)|(?:Not\s*Estab\.?))?$/i
    )
    if (labcorpMatch) {
      results.push({
        test_name: labcorpMatch[1].trim(),
        panel_name: currentPanel,
        value_text: labcorpMatch[2].trim(),
        lab_flag: labcorpMatch[3] ? labcorpMatch[3].trim() : null,
        previous_value: labcorpMatch[4] ? labcorpMatch[4].trim() : null,
        previous_date: labcorpMatch[5] ? labcorpMatch[5].trim() : null,
        unit: labcorpMatch[6] ? labcorpMatch[6].trim() : "",
        reference_text: labcorpMatch[7] ? labcorpMatch[7].trim() : "",
      })
      i++
      continue
    }

    // Pattern B1: Quest-style single-line row (Range BEFORE unit, optional H/L flag, optional trailing lab code AMD/SLI/01):
    // "CHOLESTEROL, TOTAL  215  H  <200 mg/dL  AMD"
    // "HDL CHOLESTEROL  42  L  > OR = 40 mg/dL  AMD"
    // "TSH  2.45  0.40-4.50 mIU/L  AMD"
    const cleanedLine = line.replace(QUEST_LAB_CODE_TAIL, "").trim()
    const questSingleRe = new RegExp(
      `^([A-Za-z][A-Za-z0-9\\s(),./-]{1,44}?)\\s+([<>]?\\d+(?:\\.\\d+)?)\\s+(?:(High|Low|Critical|H|L)\\s+)?(${RANGE_EXPR})(?:\\s+([A-Za-z0-9/%.*-]+(?:\\s*\\(calc\\))?))?$`,
      "i"
    )
    const questSingleMatch = cleanedLine.match(questSingleRe)
    if (questSingleMatch) {
      results.push({
        test_name: questSingleMatch[1].trim(),
        panel_name: currentPanel,
        value_text: questSingleMatch[2].trim(),
        lab_flag: questSingleMatch[3] ? questSingleMatch[3].trim() : null,
        reference_text: questSingleMatch[4].trim(),
        unit: questSingleMatch[5] ? questSingleMatch[5].replace(/\s*\(calc\)\s*$/i, "").trim() : "",
      })
      i++
      continue
    }

    // Pattern B2: Monospace / LabCorp table row (Unit BEFORE range, separate Flag col, optional lab code):
    // "Iron   193   High   ug/dL   38-169   01"
    // "Neutrophils   64   %   Not Estab.   01"
    const monoRe = new RegExp(
      `^([A-Za-z][A-Za-z0-9\\s(),./-]{1,44}?)\\s+([<>]?\\d+(?:\\.\\d+)?)\\s+(?:(High|Low|Critical|H|L)\\s+)?([A-Za-z0-9/%.*-]+)?\\s*(${RANGE_EXPR})$`,
      "i"
    )
    const monoMatch = cleanedLine.match(monoRe)
    if (monoMatch) {
      results.push({
        test_name: monoMatch[1].trim(),
        panel_name: currentPanel,
        value_text: monoMatch[2].trim(),
        lab_flag: monoMatch[3] ? monoMatch[3].trim() : null,
        unit: monoMatch[4] ? monoMatch[4].trim() : "",
        reference_text: monoMatch[5] ? monoMatch[5].trim() : "",
      })
      i++
      continue
    }

    // Pattern B3: Qualitative Urinalysis single-line row (e.g. "Urine Protein   Negative   Negative   AMD")
    const qualMatch = cleanedLine.match(
      /^([A-Za-z][A-Za-z0-9\s(),./-]{2,40}?)\s+(Negative|Positive|Trace|Small|Moderate|Large|Clear|Cloudy|Yellow|Amber|Normal)\s+(?:(High|Low|Abnormal|A|H|L)\s+)?(Negative|Normal|Clear|Yellow)?$/i
    )
    if (qualMatch) {
      results.push({
        test_name: qualMatch[1].trim(),
        panel_name: currentPanel,
        value_text: qualMatch[2].trim(),
        value_numeric: null,
        is_narrative: true,
        lab_flag: qualMatch[3] ? qualMatch[3].trim() : null,
        reference_text: qualMatch[4] ? qualMatch[4].trim() : "",
        unit: "",
      })
      i++
      continue
    }

    // Pattern C: Messy pasted text "Test: Value unit (Range: low-high) [High/Low]"
    const messyMatch = line.match(
      /^([A-Za-z][A-Za-z0-9\s(),./-]{1,40}?)\s*[:=-]\s*([<>]?\d+(?:\.\d+)?)\s*([A-Za-z0-9/%.*-]+)?(?:\s*\(?(?:ref|range|reference\s*range)?[:\s]*((?:\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?)|(?:(?:>=?|<=?|>\s*OR\s*=|<\s*OR\s*=)\s*\d+(?:\.\d+)?)|(?:Not\s*Estab\.?))\)?)?(?:\s*\[?(High|Low|Critical|H|L)\]?)?/i
    )
    if (messyMatch && !isMetadataOrHeaderLine(messyMatch[1].trim())) {
      results.push({
        test_name: messyMatch[1].trim(),
        panel_name: currentPanel,
        value_text: messyMatch[2].trim(),
        unit: messyMatch[3] ? messyMatch[3].trim() : "",
        reference_text: messyMatch[4] ? messyMatch[4].trim() : "",
        lab_flag: messyMatch[5] ? messyMatch[5].trim() : null,
      })
      i++
      continue
    }

    // Pattern D: Quest multi-line split result:
    // Line i:   "VITAMIN D,25-OH,TOTAL,IA"
    // Line i+1: "28 L" or "1.8 ng/mL" or "3.4 H mg/L"
    // Line i+2: "Reference Range: 30-100 ng/mL" or "mg/L" (+ Line i+3 "<1.0")
    if (
      i + 1 < lines.length &&
      /^[A-Za-z][A-Za-z0-9\s(),./-]{1,48}$/.test(line) &&
      !/[:=]/.test(line) &&
      !knownPanels.some((p) => p.test(line))
    ) {
      const nextValLine = lines[i + 1].replace(QUEST_LAB_CODE_TAIL, "").trim()
      const valMatch = nextValLine.match(
        /^([<>]?\d+(?:\.\d+)?)(?:\s+(High|Low|Critical|H|L))?(?:\s+([A-Za-z0-9/%.*-]+))?(?:\s+(High|Low|Critical|H|L))?$/i
      )
      if (valMatch) {
        let unit = valMatch[3] ? valMatch[3].trim() : ""
        let labFlag = valMatch[2] || valMatch[4] || null
        let refText = ""
        let consumed = 2

        // Check line i+2 (and optionally i+3) for Reference Range or Unit
        if (i + 2 < lines.length) {
          const line2 = lines[i + 2].replace(QUEST_LAB_CODE_TAIL, "").trim()
          const refLineRe = new RegExp(
            `^(?:Reference\\s*Range:?\\s*)?(${RANGE_EXPR})(?:\\s+([A-Za-z0-9/%.*-]+))?$`,
            "i"
          )
          const m2 = line2.match(refLineRe)
          if (m2) {
            refText = m2[1].trim()
            if (!unit && m2[2]) unit = m2[2].trim()
            consumed = 3
          } else if (/^[A-Za-z0-9/%.*-]{1,14}$/.test(line2) && !isMetadataOrHeaderLine(line2)) {
            if (!unit) unit = line2
            consumed = 3
            if (i + 3 < lines.length) {
              const line3 = lines[i + 3].replace(QUEST_LAB_CODE_TAIL, "").trim()
              const m3 = line3.match(refLineRe)
              if (m3) {
                refText = m3[1].trim()
                if (!unit && m3[2]) unit = m3[2].trim()
                consumed = 4
              }
            }
          }
        }

        results.push({
          test_name: line.trim(),
          panel_name: currentPanel,
          value_text: valMatch[1].trim(),
          lab_flag: labFlag ? labFlag.trim() : null,
          unit,
          reference_text: refText,
        })
        i += consumed
        continue
      }
    }

    i++
  }

  return validateAndNormalizeExtraction(
    {
      report: {
        lab_name: labName,
        patient_name: patientMatch ? patientMatch[1].trim() : null,
        dob: dobMatch ? dobMatch[1].trim() : null,
        specimen_id: specimenMatch ? specimenMatch[1].trim() : null,
        ordering_physician: physicianMatch ? physicianMatch[1].trim() : null,
        date_collected: collectedMatch ? collectedMatch[1].trim() : null,
        date_received: receivedMatch ? receivedMatch[1].trim() : null,
        date_reported: reportedMatch ? reportedMatch[1].trim() : null,
        fasting: fastingMatch ? /yes|true/i.test(fastingMatch[1]) : null,
        report_type: hints?.reportType && hints.reportType !== "Auto-detect" ? hints.reportType : null,
        extraction_confidence: results.length > 0 ? "high" : "low",
      },
      results,
      needs_retake: results.length === 0,
      retake_reason:
        results.length === 0
          ? "This pasted text could not be parsed confidently. Try pasting the lab table rows cleanly, or use 'Add Result Manually' instead of guessing."
          : null,
    },
    userAliases
  )
}

/**
 * Generates plain-language (8th-grade reading level) explanations, panel overviews,
 * Summary card, and Big Picture strictly from saved results (no invented numbers,
 * no diagnoses, no medication/supplement dosing instructions).
 */
export function buildPlainLanguageExplanationsFallback(
  report: {
    lab_name: string
    date_collected: string | null
    fasting: boolean | null
  },
  results: LabResultRow[],
  vitalsContext?: { latestBp?: string | null; latestBmi?: string | null }
): {
  summary_text: string
  big_picture: LabBigPicture
  panel_overviews: Record<string, string>
  personalized_lines: Record<string, string>
  generic_explanations: Record<string, Omit<LabExplanation, "id" | "user_id" | "updated_at">>
} {
  const generic_explanations: Record<string, Omit<LabExplanation, "id" | "user_id" | "updated_at">> = {}
  const personalized_lines: Record<string, string> = {}

  const BUILTIN_WHAT_IT_IS: Record<string, { what: string; abnormal: string; factors: string; questions: string[] }> = {
    glucose: {
      what: "Glucose measures the amount of sugar in your blood, which your body uses for energy.",
      abnormal: "Higher blood sugar can happen after eating, during stress, or when the body has trouble moving sugar into cells; lower levels can happen after long fasting.",
      factors: "Commonly discussed factors include meal timing, carbohydrate intake, physical activity, sleep, stress, hydration, and certain medications.",
      questions: [
        "Was this level affected by fasting time or recent meals?",
        "Should we look at this together with a Hemoglobin A1c test?",
        "When should we recheck my blood sugar?",
      ],
    },
    hba1c: {
      what: "Hemoglobin A1c shows your average blood sugar level over the past 2 to 3 months.",
      abnormal: "A higher A1c means blood sugar has run above the usual range over recent months.",
      factors: "Commonly discussed factors include everyday food choices, regular movement, weight, sleep quality, stress, and current medications.",
      questions: [
        "What A1c target makes the most sense for me?",
        "How often should we repeat this test to track changes?",
        "What everyday habits would you recommend we focus on first?",
      ],
    },
    alt: {
      what: "ALT is a liver enzyme (a protein that helps chemical reactions) that doctors check to see how the liver is doing.",
      abnormal: "Higher ALT levels can happen when liver cells are irritated or working hard, such as from fat buildup, alcohol, certain medicines, or temporary illness.",
      factors: "Commonly discussed factors include alcohol use, body weight, recent intense exercise, over-the-counter pain relievers, supplements, and prescription medicines.",
      questions: [
        "What are the most likely reasons my ALT is above the reference range?",
        "Could any of my current medicines or supplements be affecting my liver enzymes?",
        "Should we recheck my liver panel or do any follow-up testing?",
      ],
    },
    ast: {
      what: "AST is an enzyme found in the liver and muscles that helps doctors check liver and muscle health.",
      abnormal: "Higher AST can be seen with liver irritation, recent heavy exercise, or muscle strain.",
      factors: "Commonly discussed factors include alcohol intake, weight, strenuous workouts before the test, and medications or supplements.",
      questions: [
        "How do my AST and ALT look together?",
        "Could recent physical activity or a medicine have raised this number?",
        "When should we repeat these liver tests?",
      ],
    },
    ferritin: {
      what: "Ferritin is a protein that shows how much iron your body has stored.",
      abnormal: "Higher ferritin can mean extra stored iron or general inflammation in the body, while lower ferritin means low iron stores.",
      factors: "Commonly discussed factors include iron supplements, iron-fortified foods, alcohol intake, liver health, and inflammation.",
      questions: [
        "Is my ferritin high because of extra iron, inflammation, or both?",
        "Should I avoid iron supplements or iron-fortified products until we review this?",
        "Should we check my iron panel again to see if it keeps trending down?",
      ],
    },
    iron: {
      what: "Serum iron measures the amount of iron circulating in your blood at the time of the test.",
      abnormal: "Higher iron can happen with recent iron intake, supplements, or higher iron absorption, while low iron can happen when iron stores are low.",
      factors: "Commonly discussed factors include time of day, recent meals, multivitamins with iron, and liver or iron-storage health.",
      questions: [
        "How does my serum iron look alongside my ferritin and iron saturation?",
        "Should I check my vitamins or foods for added iron before our next test?",
        "Does this need a repeat fasting iron panel?",
      ],
    },
    iron_saturation: {
      what: "Iron saturation shows what percentage of your iron-carrying blood proteins are currently holding iron.",
      abnormal: "Higher iron saturation means more of those carrier proteins are full, which doctors often review alongside ferritin and iron.",
      factors: "Commonly discussed factors include fasting status, iron supplements, fortified foods, and inherited iron traits.",
      questions: [
        "What does this iron saturation mean together with my ferritin level?",
        "Should we recheck a fasting iron panel?",
      ],
    },
    potassium: {
      what: "Potassium is a mineral that helps your heart, nerves, and muscles work smoothly.",
      abnormal: "Values outside the usual range can be affected by hydration, kidney function, blood-draw technique, or certain blood pressure medicines.",
      factors: "Commonly discussed factors include hydration, diet, salt substitutes, kidney health, and blood pressure medications.",
      questions: [
        "Since my potassium is right at the edge of the range, should we keep an eye on it?",
        "Could any of my medications affect potassium levels?",
      ],
    },
  }

  const flaggedRows = results.filter((r) => r.flag_status === "high" || r.flag_status === "low" || r.flag_status === "critical")
  const borderlineRows = results.filter((r) => r.is_borderline && r.flag_status === "normal")
  const normalRows = results.filter((r) => r.flag_status === "normal" && !r.is_borderline)

  for (const r of results) {
    const key = r.normalized_test_key
    const rangeNote = r.reference_text
      ? ` Your lab's range is ${r.reference_text}${r.unit ? ` ${r.unit}` : ""}.`
      : " No reference range was printed on your report."
    const info = BUILTIN_WHAT_IT_IS[key] || {
      what: `This test measures ${r.test_name}.${rangeNote} Ask your doctor what it means for you.`,
      abnormal: "A result outside the usual range can happen for many everyday or medical reasons and is best reviewed with your doctor.",
      factors: "Commonly discussed factors include hydration, sleep, recent meals, physical activity, stress, and current medications or supplements.",
      questions: [
        `What does my ${r.test_name} result mean for my overall health?`,
        "Should we monitor this test again at a future visit?",
      ],
    }

    if (!generic_explanations[key]) {
      generic_explanations[key] = {
        normalized_test_key: key,
        what_it_is: sanitizeExplanationText(info.what),
        what_abnormal_means: sanitizeExplanationText(info.abnormal),
        factors_discussed: sanitizeExplanationText(info.factors),
        doctor_questions: info.questions.map(sanitizeExplanationText),
      }
    }

    // Personalized line (b)
    if (r.flag_status === "needs_review") {
      personalized_lines[key] = "This result needs checking first before it can be explained."
      continue
    }

    if (r.is_narrative) {
      personalized_lines[key] = `Your result was "${r.value_text}". Open the full lab note below for the complete details.`
      continue
    }

    const valUnit = `${r.value_text}${r.unit ? ` ${r.unit}` : ""}`
    const rangePart = r.reference_text ? ` (reference range: ${r.reference_text}${r.unit ? ` ${r.unit}` : ""})` : " (no reference range listed)"
    let diffPart = ""
    if (r.value_numeric !== null) {
      if (r.flag_status === "high" && r.reference_high !== null && r.value_numeric > r.reference_high) {
        const diff = Math.round((r.value_numeric - r.reference_high) * 100) / 100
        diffPart = `, which is ${diff}${r.unit ? ` ${r.unit}` : ""} above the top of the range`
      } else if (r.flag_status === "low" && r.reference_low !== null && r.value_numeric < r.reference_low) {
        const diff = Math.round((r.reference_low - r.value_numeric) * 100) / 100
        diffPart = `, which is ${diff}${r.unit ? ` ${r.unit}` : ""} below the bottom of the range`
      } else if (r.is_borderline) {
        diffPart = ", which sits right at the edge of the normal range (not flagged by the lab)"
      } else if (r.reference_text) {
        diffPart = ", which is within the normal range"
      }
    }

    let prevPart = ""
    if (r.previous_value) {
      const prevNum = parseComparatorAndNumber(r.previous_value).value_numeric
      if (prevNum !== null && r.value_numeric !== null && prevNum !== r.value_numeric) {
        const dir = r.value_numeric < prevNum ? "down from" : "up from"
        prevPart = ` (${dir} ${r.previous_value}${r.previous_date ? ` on ${r.previous_date}` : ""})`
      } else {
        prevPart = ` (previous: ${r.previous_value}${r.previous_date ? ` on ${r.previous_date}` : ""})`
      }
    }

    const urgentNote =
      r.flag_status === "critical" ||
      (r.value_numeric !== null && r.reference_high !== null && r.reference_high > 0 && r.value_numeric >= r.reference_high * 2.5)
        ? " Because this value is well outside the usual range, contact your doctor promptly rather than waiting for your next routine visit."
        : ""

    personalized_lines[key] = sanitizeExplanationText(
      `Your result is ${valUnit}${rangePart}${diffPart}${prevPart}.${urgentNote}`
    )
  }

  // Panel overviews (2-3 sentences each)
  const panel_overviews: Record<string, string> = {}
  const panels = new Map<string, LabResultRow[]>()
  for (const r of results) {
    const arr = panels.get(r.panel_name) || []
    arr.push(r)
    panels.set(r.panel_name, arr)
  }
  for (const [panelName, rows] of panels.entries()) {
    const pFlagged = rows.filter((r) => r.flag_status === "high" || r.flag_status === "low" || r.flag_status === "critical")
    if (pFlagged.length === 0) {
      panel_overviews[panelName] = `This ${panelName} panel includes ${rows.length} test${rows.length === 1 ? "" : "s"}, and all results are within the lab's expected range or unflagged. That is a reassuring sign to review briefly with your doctor.`
    } else {
      const names = pFlagged.slice(0, 3).map((f) => f.test_name).join(", ")
      panel_overviews[panelName] = `This ${panelName} panel includes ${rows.length} test${rows.length === 1 ? "" : "s"}, with ${pFlagged.length} flagged out of range (${names}). The rest of the tests in this panel were within range. Reviewing these flagged items with your doctor can help clarify next steps.`
    }
  }

  // Big Picture: What's good
  const whats_good: string[] = []
  if (normalRows.length > 0) {
    whats_good.push(`${normalRows.length} test${normalRows.length === 1 ? " is" : "s are"} within the normal reference range.`)
  }
  for (const r of results) {
    if (r.previous_value && r.value_numeric !== null) {
      const prevNum = parseComparatorAndNumber(r.previous_value).value_numeric
      if (prevNum !== null && r.reference_high !== null && prevNum > r.reference_high && r.value_numeric < prevNum) {
        whats_good.push(`${r.test_name} improved from ${r.previous_value} to ${r.value_text}${r.unit ? ` ${r.unit}` : ""}.`)
      }
    }
  }

  // Big Picture: What needs attention grouped by body system
  const sysMap = new Map<string, { tests: string[]; urgent: boolean }>()
  for (const r of flaggedRows) {
    const def = BUILTIN_CANONICAL_TESTS.find((d) => d.key === r.normalized_test_key)
    const sys = def?.system || r.panel_name || "Other"
    const entry = sysMap.get(sys) || { tests: [], urgent: false }
    entry.tests.push(`${r.test_name}: ${r.value_text}${r.unit ? ` ${r.unit}` : ""} (${r.flag_status.toUpperCase()})`)
    if (
      r.flag_status === "critical" ||
      (r.value_numeric !== null && r.reference_high !== null && r.reference_high > 0 && r.value_numeric >= r.reference_high * 2.5)
    ) {
      entry.urgent = true
    }
    sysMap.set(sys, entry)
  }

  const systemWhy: Record<string, string> = {
    Liver: "Liver enzymes are reviewed together to see whether liver cells are irritated and how they are trending over time.",
    Iron: "Iron, iron saturation, and ferritin are looked at together to show both circulating iron and long-term iron stores.",
    "Blood Sugar": "Glucose and Hemoglobin A1c are reviewed together to compare a single-day sugar level with a multi-month average.",
    Kidney: "Kidney markers help show how well your kidneys filter waste and balance fluids.",
    "Blood Count": "Blood cell counts are reviewed together to check oxygen-carrying red cells, infection-fighting white cells, and platelets.",
    "Cholesterol & Heart": "Cholesterol and triglyceride numbers are reviewed together to understand overall heart health.",
  }

  const needs_attention: LabBigPictureSystemGroup[] = Array.from(sysMap.entries()).map(([system, data]) => ({
    system,
    tests: data.tests,
    why_grouped:
      (systemWhy[system] || `These ${system.toLowerCase()} tests are often reviewed together for a clearer picture.`) +
      (data.urgent ? " Contact your doctor promptly to discuss the far-out-of-range value rather than waiting for your next visit." : ""),
    urgent: data.urgent,
  }))

  // Doctor checklist (3-6 prioritized items)
  const doctor_checklist: string[] = []
  for (const grp of needs_attention.slice(0, 4)) {
    doctor_checklist.push(`Review flagged ${grp.system.toLowerCase()} result(s): ${grp.tests.join("; ")}.`)
  }
  if (borderlineRows.length > 0) {
    doctor_checklist.push(
      `Ask whether borderline value(s) at the edge of range (${borderlineRows.map((b) => `${b.test_name} ${b.value_text}`).join(", ")}) need monitoring.`
    )
  }
  if (vitalsContext?.latestBp || vitalsContext?.latestBmi) {
    const vParts = [vitalsContext.latestBp ? `BP ${vitalsContext.latestBp}` : null, vitalsContext.latestBmi ? `BMI ${vitalsContext.latestBmi}` : null].filter(Boolean)
    doctor_checklist.push(`Review these labs alongside recent vitals (${vParts.join(", ")}).`)
  }
  if (doctor_checklist.length < 3) {
    doctor_checklist.push("Ask when these panels should be repeated to track trends.")
  }

  // Where I could improve (educational, framed as "ask your doctor first")
  const where_to_improve: string[] = []
  const hasHighIron = flaggedRows.some((r) => ["ferritin", "iron", "iron_saturation"].includes(r.normalized_test_key) && r.flag_status === "high")
  const hasHighLiver = flaggedRows.some((r) => ["alt", "ast", "alkaline_phosphatase", "bilirubin_total"].includes(r.normalized_test_key) && r.flag_status === "high")
  const hasHighSugar = flaggedRows.some((r) => ["glucose", "hba1c"].includes(r.normalized_test_key) && r.flag_status === "high")

  if (hasHighIron) {
    where_to_improve.push(
      "Iron & Ferritin: Ask your doctor before taking any iron supplements, multivitamins with iron, or iron-fortified products."
    )
  }
  if (hasHighLiver) {
    where_to_improve.push(
      "Liver health: Ask your doctor first about everyday factors that can affect liver enzymes, such as alcohol intake, weight, and reviewing current medicines or supplements."
    )
  }
  if (hasHighSugar) {
    where_to_improve.push(
      "Blood sugar: Ask your doctor first about general nutrition, regular movement, and sleep habits that support steady blood sugar."
    )
  }
  if (where_to_improve.length === 0) {
    where_to_improve.push("Ask your doctor first about maintaining your current healthy habits and when to schedule your next routine labs.")
  }

  // Summary card (4-6 sentences)
  const normalPanels = Array.from(panels.entries())
    .filter(([, rows]) => rows.every((r) => r.flag_status === "normal"))
    .map(([name]) => name)
  const dateLabel = report.date_collected || "your latest report"
  const summarySentences: string[] = [
    `Your ${report.lab_name} report from ${dateLabel} includes ${results.length} lab result${results.length === 1 ? "" : "s"}.`,
    normalPanels.length > 0
      ? `All results in ${normalPanels.join(", ")} were within the expected range.`
      : `${normalRows.length} individual result${normalRows.length === 1 ? " was" : "s were"} within the normal reference range.`,
    flaggedRows.length > 0
      ? `${flaggedRows.length} result${flaggedRows.length === 1 ? " was" : "s were"} flagged outside the reference range (${flaggedRows.slice(0, 4).map((f) => f.test_name).join(", ")}).`
      : "No results were flagged outside the reference range.",
    needs_attention.some((n) => n.urgent)
      ? "At least one value is far outside the usual range, so contact your doctor promptly rather than waiting for your next routine visit."
      : "Bring the prioritized checklist below to your next appointment so your doctor can review these numbers in context.",
  ]

  return {
    summary_text: sanitizeExplanationText(summarySentences.join(" ")),
    big_picture: {
      whats_good: whats_good.map(sanitizeExplanationText),
      needs_attention: needs_attention.map((g) => ({ ...g, why_grouped: sanitizeExplanationText(g.why_grouped) })),
      doctor_checklist: doctor_checklist.slice(0, 6).map(sanitizeExplanationText),
      where_to_improve: where_to_improve.map(sanitizeExplanationText),
    },
    panel_overviews,
    personalized_lines,
    generic_explanations,
  }
}
