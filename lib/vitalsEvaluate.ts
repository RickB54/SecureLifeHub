// Pure, zero-egress evaluation of already-loaded vitals against lib/vitalsReference.ts.
import {
  VitalBand,
  VitalBandTone,
  GlucoseContextType,
  CalorieActivityLevel,
  CalorieAgeGroup,
  WEIGHT_REF,
  TEMPERATURE_REF,
  SPO2_REF,
  HEART_RATE_REF,
  GLUCOSE_REF,
  SLEEP_DURATION_REF,
  SLEEP_SCORE_REF,
  WATER_REF,
  CALORIE_REF,
  STEPS_REF,
  ACTIVITY_REF,
  pickBand,
  parseNumericVital,
  normalizeGlucoseContext,
  formatCalorieRange,
} from "./vitalsReference"

export type VerdictTone = VitalBandTone | "neutral"
export type VitalPromptField = "age" | "sex" | "height"

export interface VitalEvalContext {
  age: number | null
  infantAgeDetail: "0-4w" | "4w-3m" | "4-12m"
  sex: "" | "male" | "female"
  heightInches: number | null
  calorieActivity: CalorieActivityLevel
  glucoseOverrides: Record<string, GlucoseContextType>
}

export interface VitalTable {
  title: string
  headers: string[]
  rows: string[][]
  highlight?: number | null
}

export interface VitalEvalResult {
  vitalId: string
  helpText: string
  leadNote?: string
  blocker: string | null
  prompts: { field: VitalPromptField; text: string }[]
  bandsCaption?: string
  bands: VitalBand[]
  activeKey: string | null
  marker: string | null
  verdict: { tone: VerdictTone; chip: string; line: string } | null
  stats: { label: string; value: string; tone?: VerdictTone }[]
  tables: VitalTable[]
  showActivitySelector?: boolean
  glucoseContextPicker?: { entryKey: string; current: GlucoseContextType | null; fromLog: boolean } | null
  notes: string[]
  source: string
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const pad = (n: number) => String(n).padStart(2, "0")
const localKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function dayKeyOf(raw: unknown): string | null {
  if (!raw) return null
  const s = String(raw).trim()
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
  const hasZone = /Z$|[+-]\d{2}:?\d{2}$/.test(s)
  if (m && !hasZone) return m[1]
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : localKey(d)
}

function shortDay(key: string | null): string {
  if (!key) return ""
  const [y, mo, d] = key.split("-").map(Number)
  if (!y || !mo || !d) return ""
  return key === localKey(new Date()) ? "today" : `${MONTHS[mo - 1]} ${d}`
}

const fmt = (n: number, digits = 0) =>
  n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })

const shortLabel = (label: string) => label.split(":")[0].trim()

function dailyTotals(entries: any[], toBase: (v: number, unit: string) => number): Map<string, number> {
  const map = new Map<string, number>()
  for (const e of entries) {
    const v = parseNumericVital(e?.item_metadata?.value)
    const k = dayKeyOf(e?.item_metadata?.date)
    if (v === null || !k) continue
    map.set(k, (map.get(k) || 0) + toBase(v, String(e?.item_metadata?.unit || "").toLowerCase()))
  }
  return map
}

function lastSevenDayAverage(map: Map<string, number>): { avg: number; days: number } | null {
  const today = new Date()
  let sum = 0
  let days = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const v = map.get(localKey(d))
    if (typeof v === "number") {
      sum += v
      days++
    }
  }
  return days > 0 ? { avg: sum / days, days } : null
}

function baseResult(vitalId: string, partial: Partial<VitalEvalResult>): VitalEvalResult {
  return {
    vitalId,
    helpText: "",
    blocker: null,
    prompts: [],
    bands: [],
    activeKey: null,
    marker: null,
    verdict: null,
    stats: [],
    tables: [],
    notes: [],
    source: "",
    ...partial,
  }
}

const verdictFromBand = (b: VitalBand, chipPrefix?: string) => ({
  tone: b.tone as VerdictTone,
  chip: chipPrefix ? `${chipPrefix} · ${shortLabel(b.label)}` : shortLabel(b.label),
  line: b.label,
})

// ---------- WEIGHT (BMI) ----------
function evalWeight(entries: any[], ctx: VitalEvalContext): VitalEvalResult {
  const r = baseResult("weight", {
    helpText:
      "BMI is calculated from your latest logged weight and the height in My Profile (kg / m², or lb × 703 / in²). Bands apply to adults 20 and older (CDC).",
    bands: WEIGHT_REF.bands,
    notes: [WEIGHT_REF.notes],
    source: WEIGHT_REF.source,
  })
  if (ctx.age !== null && ctx.age < WEIGHT_REF.adultMinAge) {
    r.blocker = WEIGHT_REF.under20Message
    return r
  }
  const inches = ctx.heightInches
  if (inches === null) r.prompts.push({ field: "height", text: "Add your height to calculate BMI and your healthy weight range." })
  if (ctx.age === null) r.prompts.push({ field: "age", text: "Add your age (BMI categories are for adults 20+)." })

  const latest = entries[entries.length - 1]
  const v = latest ? parseNumericVital(latest.item_metadata?.value) : null
  const isKg = latest ? String(latest.item_metadata?.unit || "").toLowerCase().includes("kg") : false
  const unitLabel = isKg ? "kg" : "lb"

  if (inches !== null) {
    const toUnit = (lb: number) => (isKg ? lb / 2.20462 : lb)
    const minLb = (WEIGHT_REF.healthyBmiMin * inches * inches) / WEIGHT_REF.imperialFactor
    const maxLb = (WEIGHT_REF.healthyBmiMax * inches * inches) / WEIGHT_REF.imperialFactor
    r.stats.push({
      label: "Healthy weight range for your height",
      value: `${fmt(toUnit(minLb))} to ${fmt(toUnit(maxLb))} ${unitLabel}`,
    })
    if (v !== null && v > 0) {
      const lb = isKg ? v * 2.20462 : v
      const bmi = (lb * WEIGHT_REF.imperialFactor) / (inches * inches)
      const bmiRounded = Math.round(bmi * 10) / 10
      const band = pickBand(WEIGHT_REF.bands, bmiRounded)
      r.activeKey = band.key
      r.verdict = {
        tone: band.tone,
        chip: `BMI ${fmt(bmiRounded, 1)} - ${band.label}`,
        line: `BMI ${fmt(bmiRounded, 1)}: ${band.label} range.`,
      }
      r.stats.unshift({ label: "Your BMI", value: `${fmt(bmiRounded, 1)} (${band.label})`, tone: band.tone })
      let distance = "Within your healthy weight range"
      if (lb < minLb) distance = `${fmt(toUnit(minLb - lb), 1)} ${unitLabel} below the range`
      else if (lb > maxLb) distance = `${fmt(toUnit(lb - maxLb), 1)} ${unitLabel} above the range`
      r.stats.push({ label: "How far you are from it", value: distance })
    }
  }
  if (v !== null && latest) {
    r.marker = `Your latest: ${fmt(v, v % 1 ? 1 : 0)} ${unitLabel} on ${shortDay(dayKeyOf(latest.item_metadata?.date))}`
  }
  return r
}

// ---------- TEMPERATURE ----------
function evalTemperature(entries: any[]): VitalEvalResult {
  const r = baseResult("temp", {
    helpText: "Oral temperature bands, evaluated in °F and shown in both °F and °C. Readings logged in °C are converted before comparing.",
    bands: TEMPERATURE_REF.bands,
    notes: [TEMPERATURE_REF.notes],
    source: TEMPERATURE_REF.source,
  })
  const latest = entries[entries.length - 1]
  const v = latest ? parseNumericVital(latest.item_metadata?.value) : null
  if (v === null || !latest) return r
  const unit = String(latest.item_metadata?.unit || "").toLowerCase()
  const isC = (unit.includes("c") && !unit.includes("f")) || (!unit && v < 50)
  const f = Math.round((isC ? (v * 9) / 5 + 32 : v) * 10) / 10
  const c = isC ? v : ((v - 32) * 5) / 9
  const band = pickBand(TEMPERATURE_REF.bands, f)
  const display = isC ? `${fmt(c, 1)} °C (${fmt(f, 1)} °F)` : `${fmt(f, 1)} °F (${fmt(c, 1)} °C)`
  r.activeKey = band.key
  r.verdict = verdictFromBand(band)
  r.marker = `Your latest: ${display} on ${shortDay(dayKeyOf(latest.item_metadata?.date))}`
  return r
}

// ---------- BLOOD OXYGEN ----------
function evalSpo2(entries: any[]): VitalEvalResult {
  const r = baseResult("ox", {
    helpText: "Pulse oximeter (SpO2) reference bands for adults at rest.",
    bands: SPO2_REF.bands,
    notes: [SPO2_REF.notes],
    source: SPO2_REF.source,
  })
  const latest = entries[entries.length - 1]
  const v = latest ? parseNumericVital(latest.item_metadata?.value) : null
  if (v === null || !latest) return r
  const band = pickBand(SPO2_REF.bands, v)
  r.activeKey = band.key
  r.verdict = verdictFromBand(band)
  r.marker = `Your latest: ${fmt(v, v % 1 ? 1 : 0)}% on ${shortDay(dayKeyOf(latest.item_metadata?.date))}`
  return r
}

// ---------- HEART RATE ----------
function heartRateRowIndex(ctx: VitalEvalContext): number | null {
  const a = ctx.age
  if (a === null) return null
  if (a === 0) return ctx.infantAgeDetail === "0-4w" ? 0 : 1
  if (a <= 2) return 2
  if (a <= 4) return 3
  if (a <= 12) return 4
  return 5
}

function evalHeartRate(entries: any[], ctx: VitalEvalContext): VitalEvalResult {
  const r = baseResult("hr", {
    helpText:
      "Resting heart rate in beats per minute. The normal range row is picked from the age in My Profile; adults also see exercise zones based on about 220 minus age.",
    notes: [HEART_RATE_REF.notes],
    source: HEART_RATE_REF.source,
  })
  const rowIdx = heartRateRowIndex(ctx)
  if (ctx.age === null) r.prompts.push({ field: "age", text: "Add your age to pick the right normal range (showing the 13+ and adult range)." })
  r.tables.push({
    title: "Normal resting range by age (bpm)",
    headers: ["Age", "Range"],
    rows: HEART_RATE_REF.byAge.map((row) => [row.ageLabel, `${row.min} to ${row.max}`]),
    highlight: rowIdx ?? 5,
  })

  const isChild = ctx.age !== null && ctx.age < HEART_RATE_REF.teenAdultMinAge
  if (isChild && rowIdx !== null) {
    const row = HEART_RATE_REF.byAge[rowIdx]
    r.bands = [
      { key: "below", label: "Below the usual range for this age", rule: `Under ${row.min}`, from: null, tone: "yellow" },
      { key: "within", label: "Within the usual range for this age", rule: `${row.min} to ${row.max}`, from: row.min, tone: "green" },
      { key: "above", label: "Above the usual range for this age", rule: `Above ${row.max}`, from: row.max, fromExclusive: true, tone: "yellow" },
    ]
  } else {
    r.bands = HEART_RATE_REF.bands13Plus
  }

  if (ctx.age !== null && ctx.age >= 18) {
    const max = HEART_RATE_REF.maxHrBase - ctx.age
    const [m1, m2] = HEART_RATE_REF.moderatePct
    const [v1, v2] = HEART_RATE_REF.vigorousPct
    r.tables.push({
      title: `Exercise zones for age ${ctx.age} (bpm)`,
      headers: ["Zone", "Heart rate"],
      rows: [
        ["Maximum (about 220 minus age)", `about ${max}`],
        [`Moderate (${m1} to ${m2}% of max)`, `${Math.round((max * m1) / 100)} to ${Math.round((max * m2) / 100)}`],
        [`Vigorous (${v1} to ${v2}% of max)`, `${Math.round((max * v1) / 100)} to ${Math.round((max * v2) / 100)}`],
      ],
      highlight: null,
    })
  }

  const latest = entries[entries.length - 1]
  const v = latest ? parseNumericVital(latest.item_metadata?.value) : null
  if (v === null || !latest) return r
  r.marker = `Your latest: ${fmt(v)} bpm on ${shortDay(dayKeyOf(latest.item_metadata?.date))}`
  if (ctx.age === null) return r
  const band = pickBand(r.bands, v)
  r.activeKey = band.key
  r.verdict = verdictFromBand(band)
  return r
}

// ---------- GLUCOSE ----------
function evalGlucose(entries: any[], ctx: VitalEvalContext): VitalEvalResult {
  const r = baseResult("gluc", {
    helpText:
      "Glucose is compared using the reading's context (Fasting, 2 hours after eating, or Random). Pick the context when logging; for older entries without one, choose it below (saved on this device only).",
    notes: [GLUCOSE_REF.notes],
    source: GLUCOSE_REF.source,
  })
  r.tables.push({
    title: "A1C reference (lab test, not logged here)",
    headers: ["A1C", "Category"],
    rows: GLUCOSE_REF.a1c.map((b) => [b.rule, b.label]),
    highlight: null,
  })

  const latest = entries[entries.length - 1]
  const entryKey = latest ? String(latest.id || latest.item_metadata?.date || "") : ""
  const fromLog = latest ? normalizeGlucoseContext(latest.item_metadata?.context) : null
  const context: GlucoseContextType | null = fromLog || (entryKey ? ctx.glucoseOverrides[entryKey] || null : null)

  const ctxBands = context === "2 hours after eating" ? GLUCOSE_REF.postMeal : context === "Random" ? GLUCOSE_REF.random : GLUCOSE_REF.fasting
  r.bandsCaption = `${context || "Fasting"} ranges (mg/dL)`
  r.bands = [
    { key: "low", label: GLUCOSE_REF.lowLabel, rule: GLUCOSE_REF.lowRule, from: null, tone: "red" },
    ...ctxBands.map((b, i) => (i === 0 ? { ...b, from: GLUCOSE_REF.lowCutoff } : b)),
  ]

  if (latest) r.glucoseContextPicker = { entryKey, current: context, fromLog: Boolean(fromLog) }

  const raw = latest ? parseNumericVital(latest.item_metadata?.value) : null
  if (raw === null || !latest) return r
  const isMmol = String(latest.item_metadata?.unit || "").toLowerCase().includes("mmol")
  const mg = isMmol ? raw * 18 : raw
  r.marker = `Your latest: ${isMmol ? `${fmt(raw, 1)} mmol/L (${fmt(mg)} mg/dL)` : `${fmt(mg)} mg/dL`}${
    context ? ` (${context})` : ""
  } on ${shortDay(dayKeyOf(latest.item_metadata?.date))}`

  if (mg < GLUCOSE_REF.lowCutoff) {
    r.activeKey = "low"
    r.verdict = { tone: "red", chip: "Low blood sugar", line: GLUCOSE_REF.lowLabel }
    return r
  }
  if (!context) {
    r.verdict = { tone: "neutral", chip: "Pick context", line: "Choose the reading's context below to compare it." }
    return r
  }
  const band = pickBand(r.bands, mg)
  r.activeKey = band.key
  if (context === "Random") {
    r.verdict =
      band.key === "high"
        ? { tone: "orange", chip: "See your doctor", line: `Random 200 or above: ${band.rule}: see your doctor.` }
        : { tone: "green", chip: "Under 200", line: "Random reading under 200." }
  } else {
    r.verdict = { tone: band.tone, chip: band.label, line: `${context}: ${band.label}.` }
  }
  return r
}

// ---------- SLEEP DURATION ----------
function sleepRowIndex(ctx: VitalEvalContext): number | null {
  const a = ctx.age
  if (a === null) return null
  if (a === 0) return ctx.infantAgeDetail === "4-12m" ? 1 : 0
  if (a <= 2) return 2
  if (a <= 5) return 3
  if (a <= 12) return 4
  if (a <= 17) return 5
  if (a <= 60) return 6
  if (a <= 64) return 7
  return 8
}

const sleepToHours = (v: number, unit: string) => (unit.includes("min") ? v / 60 : v)

function evalSleepDuration(entries: any[], ctx: VitalEvalContext): VitalEvalResult {
  const r = baseResult("sleep", {
    helpText: "Recommended hours of sleep per 24 hours for the age in My Profile (CDC / AASM). Bands are informal: within range, short by up to 1 hour, short by more than 1 hour.",
    bands: SLEEP_DURATION_REF.bands,
    notes: [SLEEP_DURATION_REF.notes],
    source: SLEEP_DURATION_REF.source,
  })
  const idx = sleepRowIndex(ctx)
  r.tables.push({
    title: "Recommended sleep by age (hours per 24 hours)",
    headers: ["Age", "Hours"],
    rows: SLEEP_DURATION_REF.byAge.map((row) => [row.ageLabel, row.text]),
    highlight: idx,
  })
  if (idx === null) {
    r.prompts.push({ field: "age", text: "Add your age to see your recommended sleep range." })
  }
  const row = idx !== null ? SLEEP_DURATION_REF.byAge[idx] : null
  if (row) r.bandsCaption = `Your range: ${row.text} hours`

  const classify = (h: number): { key: string | null; tone: VerdictTone; label: string } => {
    if (!row) return { key: null, tone: "neutral", label: "" }
    if (h >= row.min && (row.max === null || h <= row.max)) return { key: "within", tone: "green", label: "Within range" }
    if (row.max !== null && h > row.max) return { key: null, tone: "neutral", label: "Above the range" }
    const deficit = row.min - h
    return deficit <= SLEEP_DURATION_REF.shortYellowHours
      ? { key: "short1", tone: "yellow", label: "Short by up to 1 hour" }
      : { key: "short_more", tone: "orange", label: "Short by more than 1 hour" }
  }

  const totals = dailyTotals(entries, sleepToHours)
  const avg = lastSevenDayAverage(totals)
  if (avg) {
    const c = classify(avg.avg)
    r.stats.push({
      label: `Your 7-night average (${avg.days} night${avg.days === 1 ? "" : "s"} logged)`,
      value: `${fmt(avg.avg, 1)} hrs${row ? ` vs ${row.text}` : ""}${c.label ? ` · ${c.label}` : ""}`,
      tone: c.tone,
    })
  }

  const latest = entries[entries.length - 1]
  const v = latest ? parseNumericVital(latest.item_metadata?.value) : null
  if (v === null || !latest) return r
  const h = sleepToHours(v, String(latest.item_metadata?.unit || "").toLowerCase())
  r.marker = `Your latest: ${fmt(h, 1)} hrs on ${shortDay(dayKeyOf(latest.item_metadata?.date))}`
  if (row) {
    const c = classify(h)
    r.activeKey = c.key
    r.verdict = { tone: c.tone, chip: c.label, line: `${c.label} (${row.text} hours recommended for your age).` }
  }
  return r
}

// ---------- SLEEP SCORE ----------
function evalSleepScore(entries: any[]): VitalEvalResult {
  const r = baseResult("sleep_score", {
    helpText: "Sleep scores are device-specific. These labels are approximate; compare mostly to your own 7-day average.",
    leadNote: SLEEP_SCORE_REF.leadNote,
    bands: SLEEP_SCORE_REF.bands,
    bandsCaption: "Approximate common labels (device-specific)",
    source: SLEEP_SCORE_REF.source,
  })
  const totals = new Map<string, number>()
  const counts = new Map<string, number>()
  for (const e of entries) {
    const v = parseNumericVital(e?.item_metadata?.value)
    const k = dayKeyOf(e?.item_metadata?.date)
    if (v === null || !k) continue
    totals.set(k, (totals.get(k) || 0) + v)
    counts.set(k, (counts.get(k) || 0) + 1)
  }
  const perDay = new Map<string, number>()
  totals.forEach((sum, k) => perDay.set(k, sum / (counts.get(k) || 1)))
  const avg = lastSevenDayAverage(perDay)

  const latest = entries[entries.length - 1]
  const v = latest ? parseNumericVital(latest.item_metadata?.value) : null
  if (avg) {
    r.stats.push({ label: `Your 7-day average (${avg.days} day${avg.days === 1 ? "" : "s"} logged)`, value: fmt(avg.avg, 0) })
    if (v !== null) {
      const diff = Math.round(v - avg.avg)
      r.stats.push({
        label: "Latest vs your average",
        value: diff === 0 ? "Same as your average" : `${Math.abs(diff)} ${diff > 0 ? "above" : "below"} your average`,
      })
    }
  }
  if (v === null || !latest) return r
  const band = pickBand(SLEEP_SCORE_REF.bands, v)
  r.activeKey = band.key
  r.verdict = { tone: band.tone, chip: band.label, line: `${band.label} on a typical device scale; check your device's own scale.` }
  r.marker = `Your latest: ${fmt(v)} on ${shortDay(dayKeyOf(latest.item_metadata?.date))}`
  return r
}

// ---------- WATER ----------
const ML_PER_FLOZ = 29.5735
function waterToFlOz(v: number, unit: string): number {
  const u = unit.trim()
  if (u.includes("ml")) return v / ML_PER_FLOZ
  if (u === "l" || u.includes("liter") || u.includes("litre")) return (v * 1000) / ML_PER_FLOZ
  if (u.includes("cup")) return v * 8
  return v
}
function flOzToUnit(oz: number, unit: string): { value: string; unit: string } {
  const u = unit.trim()
  if (u.includes("ml")) return { value: fmt(oz * ML_PER_FLOZ), unit: "mL" }
  if (u === "l" || u.includes("liter") || u.includes("litre")) return { value: fmt((oz * ML_PER_FLOZ) / 1000, 1), unit: "L" }
  if (u.includes("cup")) return { value: fmt(oz / 8, 1), unit: "cups" }
  return { value: fmt(oz), unit: "fl oz" }
}

function evalWater(entries: any[], ctx: VitalEvalContext): VitalEvalResult {
  const r = baseResult("water", {
    helpText:
      "Compares the beverages you logged on your latest day to the adequate beverage intake for your sex (about 20% of total water comes from food). Units (oz, mL, L, cups) are converted before comparing.",
    bands: WATER_REF.bands,
    notes: [WATER_REF.notes],
    source: WATER_REF.source,
  })
  if (ctx.age !== null && ctx.age < WATER_REF.adultMinAge) {
    r.blocker = WATER_REF.under19Message
    return r
  }
  const m = WATER_REF.male
  const f = WATER_REF.female
  const menText = `Men: ${m.totalL} L (${m.totalFlOz} fl oz) total; from beverages about ${m.beverageL.toFixed(1)} L (about ${m.beverageCups} cups, ${m.beverageFlOz} fl oz)`
  const womenText = `Women: ${f.totalL} L (${f.totalFlOz} fl oz) total; from beverages about ${f.beverageL} L (about ${f.beverageCups} cups, ${f.beverageFlOz} fl oz)`
  if (!ctx.sex) {
    r.prompts.push({ field: "sex", text: "Add your sex to compare against the right amount (showing both)." })
    r.stats.push({ label: "Adequate intake", value: menText }, { label: "Adequate intake", value: womenText })
  } else {
    r.stats.push({ label: "Your adequate intake", value: ctx.sex === "male" ? menText : womenText })
  }
  if (ctx.age === null) r.prompts.push({ field: "age", text: "Add your age (these amounts are for adults 19+)." })

  const latest = entries[entries.length - 1]
  if (!latest) return r
  const dayKey = dayKeyOf(latest.item_metadata?.date)
  const totals = dailyTotals(entries, waterToFlOz)
  const totalOz = dayKey ? totals.get(dayKey) : undefined
  if (totalOz === undefined) return r
  const unit = String(latest.item_metadata?.unit || "oz").toLowerCase()
  const shown = flOzToUnit(totalOz, unit)
  r.marker = `Your beverages ${shortDay(dayKey)}: ${shown.value} ${shown.unit}`
  if (ctx.sex) {
    const targetOz = WATER_REF[ctx.sex].beverageFlOz
    const target = flOzToUnit(targetOz, unit)
    const pct = (totalOz / targetOz) * 100
    const band = pickBand(WATER_REF.bands, Math.floor(pct))
    r.activeKey = band.key
    r.verdict = {
      tone: band.tone,
      chip: `${fmt(pct)}% of target`,
      line: `${shown.value} of about ${target.value} ${target.unit} from beverages (${fmt(pct)}%): ${band.label.toLowerCase()}.`,
    }
  }
  return r
}

// ---------- CALORIES ----------
function calorieAgeGroup(age: number): CalorieAgeGroup {
  if (age <= 30) return "19-30"
  if (age <= 50) return "31-50"
  return "51+"
}

function evalCalories(entries: any[], ctx: VitalEvalContext): VitalEvalResult {
  const r = baseResult("cal", {
    helpText:
      "Estimated calories per day to keep your current weight (Dietary Guidelines for Americans 2020-2025), from the age, sex and activity level in My Profile. Compared with the calories logged on your latest day.",
    bands: CALORIE_REF.bands,
    showActivitySelector: true,
    notes: [CALORIE_REF.notes],
    source: CALORIE_REF.source,
  })
  if (ctx.age !== null && ctx.age < CALORIE_REF.adultMinAge) {
    r.blocker = CALORIE_REF.under19Message
    r.showActivitySelector = false
    return r
  }
  if (ctx.age === null) r.prompts.push({ field: "age", text: "Add your age to find your calorie range." })
  if (!ctx.sex) r.prompts.push({ field: "sex", text: "Add your sex to find your calorie range." })

  let range: [number, number] | null = null
  if (ctx.sex) {
    const sexTable = CALORIE_REF.table[ctx.sex]
    const groups: CalorieAgeGroup[] = ["19-30", "31-50", "51+"]
    const myGroup = ctx.age !== null ? calorieAgeGroup(ctx.age) : null
    r.tables.push({
      title: `${ctx.sex === "male" ? "Men" : "Women"}: calories per day`,
      headers: ["Age", "Sedentary", "Moderate", "Active"],
      rows: groups.map((g) => [g, formatCalorieRange(sexTable[g].sedentary), formatCalorieRange(sexTable[g].moderate), formatCalorieRange(sexTable[g].active)]),
      highlight: myGroup ? groups.indexOf(myGroup) : null,
    })
    if (myGroup) {
      range = sexTable[myGroup][ctx.calorieActivity]
      r.bandsCaption = `Your range: ${formatCalorieRange(range)} kcal/day (${CALORIE_REF.activity[ctx.calorieActivity].label})`
    }
  }

  const latest = entries[entries.length - 1]
  if (!latest) return r
  const dayKey = dayKeyOf(latest.item_metadata?.date)
  const total = dayKey ? dailyTotals(entries, (v) => v).get(dayKey) : undefined
  if (total === undefined) return r
  r.marker = `Your calories ${shortDay(dayKey)}: ${fmt(total)} kcal`
  if (!range) return r
  const [lo, hi] = range
  const pctOut = CALORIE_REF.outsidePct / 100
  let key = "inside"
  if (total < lo || total > hi) key = total >= lo * (1 - pctOut) && total <= hi * (1 + pctOut) ? "near" : "far"
  const band = CALORIE_REF.bands.find((b) => b.key === key)!
  const side = total < lo ? "below" : total > hi ? "above" : ""
  r.activeKey = key
  r.verdict = {
    tone: band.tone,
    chip: key === "inside" ? "In range" : `${key === "near" ? "Slightly" : "Well"} ${side}`,
    line: `${fmt(total)} kcal vs ${formatCalorieRange(range)}: ${band.label.toLowerCase()}${side ? ` (${side})` : ""}.`,
  }
  return r
}

// ---------- STEPS ----------
function evalSteps(entries: any[]): VitalEvalResult {
  const r = baseResult("steps", {
    helpText: "Informal step tiers based on a 2025 Lancet Public Health review. There is no official U.S. daily step target.",
    leadNote: STEPS_REF.summary,
    bands: STEPS_REF.bands,
    source: STEPS_REF.source,
  })
  const totals = dailyTotals(entries, (v) => v)
  const avg = lastSevenDayAverage(totals)
  if (avg) {
    const b = pickBand(STEPS_REF.bands, avg.avg)
    r.stats.push({
      label: `Your 7-day average (${avg.days} day${avg.days === 1 ? "" : "s"} logged)`,
      value: `${fmt(avg.avg)} steps · ${shortLabel(b.label)}`,
      tone: b.tone,
    })
  }
  const latest = entries[entries.length - 1]
  if (!latest) return r
  const dayKey = dayKeyOf(latest.item_metadata?.date)
  const total = dayKey ? totals.get(dayKey) : undefined
  if (total === undefined) return r
  const band = pickBand(STEPS_REF.bands, total)
  r.activeKey = band.key
  r.verdict = verdictFromBand(band)
  r.marker = `Your steps ${shortDay(dayKey)}: ${fmt(total)}`
  return r
}

// ---------- ACTIVITY ----------
const activityToMins = (v: number, unit: string) => (unit.includes("hr") || unit.includes("hour") ? v * 60 : v)

function evalActivity(entries: any[], ctx: VitalEvalContext): VitalEvalResult {
  const r = baseResult("activity", {
    helpText:
      "Compares this week's logged activity minutes (Monday to Sunday) with the HHS goal of 150 to 300 moderate minutes a week. Ages 6 to 17 aim for 60 minutes every day.",
    notes: [ACTIVITY_REF.adultGuidance, ACTIVITY_REF.quickGuide, ACTIVITY_REF.youthGuidance],
    source: ACTIVITY_REF.source,
  })
  const totals = dailyTotals(entries, activityToMins)
  const isYouth = ctx.age !== null && ctx.age >= ACTIVITY_REF.youthMinAge && ctx.age <= ACTIVITY_REF.youthMaxAge
  const isUnderSix = ctx.age !== null && ctx.age < ACTIVITY_REF.youthMinAge

  if (ctx.age === null) r.prompts.push({ field: "age", text: "Add your age (showing the adult weekly goal)." })

  if (isYouth) {
    r.bandsCaption = "Ages 6 to 17: 60 or more minutes every day"
    const todayKey = localKey(new Date())
    const today = totals.get(todayKey) || 0
    r.stats.push({ label: "Today", value: `${fmt(today)} of ${ACTIVITY_REF.youthDailyMins} minutes` })
    if (entries.length > 0) {
      r.verdict =
        today >= ACTIVITY_REF.youthDailyMins
          ? { tone: "green", chip: "60+ min today", line: "60 or more minutes today: meets the daily goal for ages 6 to 17." }
          : { tone: "neutral", chip: `${fmt(today)}/60 min today`, line: `${fmt(today)} of 60 minutes logged today.` }
    }
    return r
  }
  if (isUnderSix) return r

  r.bands = ACTIVITY_REF.bands
  r.bandsCaption = `Weekly goal: ${ACTIVITY_REF.weeklyMin} to ${ACTIVITY_REF.weeklyMax} moderate minutes`
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
  let week = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    week += totals.get(localKey(d)) || 0
  }
  r.stats.push({ label: "This week (Mon to Sun)", value: `${fmt(week)} min vs ${ACTIVITY_REF.weeklyMin} and ${ACTIVITY_REF.weeklyMax}` })
  if (entries.length === 0) return r
  const band = pickBand(ACTIVITY_REF.bands, week)
  r.activeKey = band.key
  r.verdict = {
    tone: band.tone,
    chip: band.key === "extra" ? "Extra benefits" : `${fmt(week)} min this week`,
    line: `${fmt(week)} minutes this week: ${band.label.toLowerCase()}.`,
  }
  const latest = entries[entries.length - 1]
  const v = parseNumericVital(latest?.item_metadata?.value)
  if (v !== null) {
    const mins = activityToMins(v, String(latest.item_metadata?.unit || "").toLowerCase())
    r.marker = `Your latest: ${fmt(mins)} min on ${shortDay(dayKeyOf(latest.item_metadata?.date))}`
  }
  return r
}

export function evaluateVital(vitalId: string, entries: any[], ctx: VitalEvalContext): VitalEvalResult | null {
  switch (vitalId) {
    case "weight":
      return evalWeight(entries, ctx)
    case "temp":
      return evalTemperature(entries)
    case "ox":
      return evalSpo2(entries)
    case "hr":
      return evalHeartRate(entries, ctx)
    case "gluc":
      return evalGlucose(entries, ctx)
    case "sleep":
      return evalSleepDuration(entries, ctx)
    case "sleep_score":
      return evalSleepScore(entries)
    case "water":
      return evalWater(entries, ctx)
    case "cal":
      return evalCalories(entries, ctx)
    case "steps":
      return evalSteps(entries)
    case "activity":
      return evalActivity(entries, ctx)
    default:
      return null
  }
}
