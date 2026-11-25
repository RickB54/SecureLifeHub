// Reference numbers for all Vitals cards, EXACTLY as provided. Do not change, estimate or add numbers.
// Bands are listed ascending; each band starts at `from` (inclusive unless fromExclusive) and runs
// until the next band starts, so no in-between numbers are invented. Zero network / Supabase use.

export type VitalBandTone = "green" | "yellow" | "orange" | "red"
export type CalorieActivityLevel = "sedentary" | "moderate" | "active"
export type GlucoseContextType = "Fasting" | "2 hours after eating" | "Random"

export interface VitalBand {
  key: string
  label: string
  rule: string
  from: number | null
  fromExclusive?: boolean
  tone: VitalBandTone
}

export const VITALS_FOOTER_DISCLAIMER = "Reference only, not a diagnosis or medical advice."

export const GLUCOSE_CONTEXT_OPTIONS: GlucoseContextType[] = ["Fasting", "2 hours after eating", "Random"]

// ---------- 2. WEIGHT (BMI, CDC, adults 20+) ----------
export const WEIGHT_REF = {
  adultMinAge: 20,
  imperialFactor: 703,
  healthyBmiMin: 18.5,
  healthyBmiMax: 24.9,
  bands: [
    { key: "under", label: "Underweight", rule: "Under 18.5", from: null, tone: "yellow" },
    { key: "healthy", label: "Healthy", rule: "18.5 to 24.9", from: 18.5, tone: "green" },
    { key: "over", label: "Overweight", rule: "25.0 to 29.9", from: 25.0, tone: "yellow" },
    { key: "ob1", label: "Obesity class 1", rule: "30.0 to 34.9", from: 30.0, tone: "orange" },
    { key: "ob2", label: "Obesity class 2", rule: "35.0 to 39.9", from: 35.0, tone: "orange" },
    { key: "ob3", label: "Obesity class 3 (severe)", rule: "40 or more", from: 40, tone: "red" },
  ] as VitalBand[],
  under20Message: "BMI for children and teens uses age- and sex-specific percentiles. Ask your pediatrician.",
  notes:
    "BMI is a screening tool, not a diagnosis, and cannot tell muscle from fat. A waist over 40 inches (men) or 35 inches (non-pregnant women) also raises risk. Not for pregnancy. Some guidelines use lower cutoffs for people of Asian descent; ask your doctor.",
  source: "Source: CDC.",
}

// ---------- 3. TEMPERATURE (oral; bands evaluated in °F) ----------
export const TEMPERATURE_REF = {
  bands: [
    { key: "low", label: "Low: get medical care", rule: "Under 95.0 °F (35.0 °C)", from: null, tone: "red" },
    { key: "below", label: "Below normal", rule: "95.0 to 96.9 °F (35.0 to 36.0 °C)", from: 95.0, tone: "yellow" },
    { key: "normal", label: "Normal", rule: "97.0 to 99.0 °F (36.1 to 37.2 °C)", from: 97.0, tone: "green" },
    { key: "slight", label: "Slightly high", rule: "99.1 to 100.3 °F (37.3 to 37.9 °C)", from: 99.1, tone: "yellow" },
    { key: "fever", label: "Fever", rule: "100.4 to 102.9 °F (38.0 to 39.4 °C)", from: 100.4, tone: "orange" },
    { key: "high", label: "High fever: call your doctor", rule: "103.0 to 103.9 °F (39.4 to 39.9 °C)", from: 103.0, tone: "orange" },
    { key: "very_high", label: "Very high: get care now", rule: "104.0 °F and above (40.0+ °C)", from: 104.0, tone: "red" },
  ] as VitalBand[],
  notes:
    "Rectal and ear readings run about 1 F higher than oral, forehead/skin about 1 F lower; use the same method each time. Temperature is lowest in the early morning. Older adults may not run a fever with an infection. See a doctor if a fever lasts more than 3 to 4 days, or if there is confusion, a stiff neck or trouble breathing.",
  source: "Source: Merck Manual, OpenStax.",
}

// ---------- 4. BLOOD OXYGEN (SpO2) ----------
export const SPO2_REF = {
  bands: [
    { key: "critical", label: "Seek immediate medical attention", rule: "88% or lower", from: null, tone: "red" },
    { key: "low", label: "Low: contact your provider", rule: "89 to 92%", from: 89, tone: "orange" },
    { key: "slight", label: "Slightly low: rest, warm your hands, recheck", rule: "93 to 94%", from: 93, tone: "yellow" },
    { key: "normal", label: "Normal", rule: "95 to 100%", from: 95, tone: "green" },
  ] as VitalBand[],
  notes:
    "People with lung disease such as COPD may have a different target from their doctor. Altitude lowers readings. Pulse oximeters are accurate to about 2 to 4%; cold hands, nail polish, movement and skin tone can affect them.",
  source: "Source: MedlinePlus (NIH), World Heart Federation.",
}

// ---------- 5. HEART RATE (resting bpm) ----------
export const HEART_RATE_REF = {
  teenAdultMinAge: 13,
  bands13Plus: [
    {
      key: "below60",
      label:
        "Below 60: normal for athletes and during sleep; talk to your doctor if you are not a trained athlete, especially with dizziness or fainting",
      rule: "Under 60",
      from: null,
      tone: "yellow",
    },
    { key: "normal", label: "Normal resting", rule: "60 to 100", from: 60, tone: "green" },
    { key: "above100", label: "Above 100 at rest: mention to your doctor if this is often", rule: "Above 100", from: 100, fromExclusive: true, tone: "orange" },
  ] as VitalBand[],
  byAge: [
    { key: "newborn", ageLabel: "Newborn (0 to 4 weeks)", min: 100, max: 205 },
    { key: "infant", ageLabel: "Infant (4 weeks to 1 year)", min: 100, max: 180 },
    { key: "toddler", ageLabel: "Toddler (1 to 3)", min: 98, max: 140 },
    { key: "preschool", ageLabel: "Preschool (3 to 5)", min: 80, max: 120 },
    { key: "school", ageLabel: "School age (5 to 12)", min: 75, max: 118 },
    { key: "teen_adult", ageLabel: "13 to 17 and adults", min: 60, max: 100 },
  ],
  maxHrBase: 220,
  moderatePct: [50, 70] as [number, number],
  vigorousPct: [70, 85] as [number, number],
  notes: "Check your resting rate when calm, ideally in the morning.",
  source: "Source: American Heart Association, Mayo Clinic, Cleveland Clinic.",
}

// ---------- 6. GLUCOSE (mg/dL) ----------
export const GLUCOSE_REF = {
  lowCutoff: 70,
  lowLabel: "Low blood sugar: treat as your care plan says; get help for confusion, shaking or fainting",
  lowRule: "Under 70 (any context)",
  fasting: [
    { key: "normal", label: "Normal", rule: "Under 100", from: null, tone: "green" },
    { key: "pre", label: "Prediabetes range", rule: "100 to 125", from: 100, tone: "yellow" },
    { key: "dia", label: "Diabetes range", rule: "126 and above", from: 126, tone: "orange" },
  ] as VitalBand[],
  postMeal: [
    { key: "normal", label: "Normal", rule: "Under 140", from: null, tone: "green" },
    { key: "pre", label: "Prediabetes range", rule: "140 to 199", from: 140, tone: "yellow" },
    { key: "dia", label: "Diabetes range", rule: "200 and above", from: 200, tone: "orange" },
  ] as VitalBand[],
  random: [
    { key: "under", label: "Under 200", rule: "Under 200", from: null, tone: "green" },
    {
      key: "high",
      label: "See your doctor",
      rule: "200 or above with symptoms such as great thirst or frequent urination",
      from: 200,
      tone: "orange",
    },
  ] as VitalBand[],
  a1c: [
    { key: "normal", label: "Normal", rule: "Under 5.7%", tone: "green" as VitalBandTone },
    { key: "pre", label: "Prediabetes", rule: "5.7 to 6.4%", tone: "yellow" as VitalBandTone },
    { key: "dia", label: "Diabetes", rule: "6.5% and above", tone: "orange" as VitalBandTone },
  ],
  notes: "A diagnosis needs repeat or confirming tests by a clinician. If you have diabetes, your target ranges come from your care team.",
  source: "Source: American Diabetes Association.",
}

// ---------- 7. SLEEP DURATION (hours per 24 hours) ----------
export const SLEEP_DURATION_REF = {
  byAge: [
    { key: "0-3m", ageLabel: "0 to 3 months", min: 14, max: 17 as number | null, text: "14 to 17" },
    { key: "4-12m", ageLabel: "4 to 12 months", min: 12, max: 16 as number | null, text: "12 to 16 (including naps)" },
    { key: "1-2y", ageLabel: "1 to 2 years", min: 11, max: 14 as number | null, text: "11 to 14" },
    { key: "3-5y", ageLabel: "3 to 5 years", min: 10, max: 13 as number | null, text: "10 to 13" },
    { key: "6-12y", ageLabel: "6 to 12 years", min: 9, max: 12 as number | null, text: "9 to 12" },
    { key: "13-17y", ageLabel: "13 to 17 years", min: 8, max: 10 as number | null, text: "8 to 10" },
    { key: "18-60y", ageLabel: "Adults 18 to 60 years", min: 7, max: null as number | null, text: "7 or more" },
    { key: "61-64y", ageLabel: "61 to 64 years", min: 7, max: 9 as number | null, text: "7 to 9" },
    { key: "65+y", ageLabel: "65 and older", min: 7, max: 8 as number | null, text: "7 to 8" },
  ],
  shortYellowHours: 1,
  bands: [
    { key: "within", label: "Within range", rule: "Within your age range", from: null, tone: "green" },
    { key: "short1", label: "Short by up to 1 hour", rule: "Up to 1 hour short", from: null, tone: "yellow" },
    { key: "short_more", label: "Short by more than 1 hour", rule: "More than 1 hour short", from: null, tone: "orange" },
  ] as VitalBand[],
  notes: "Quality matters too. Talk to your doctor if you regularly have trouble falling or staying asleep or feel unrefreshed.",
  source: "Source: CDC.",
}

// ---------- 8. SLEEP SCORE (device-specific, approximate) ----------
export const SLEEP_SCORE_REF = {
  leadNote: "Sleep scores come from your watch or app and are not standardized. Use your device's own scale.",
  bands: [
    { key: "poor", label: "Poor (approx.)", rule: "Under 60", from: null, tone: "orange" },
    { key: "fair", label: "Fair (approx.)", rule: "60 to 79", from: 60, tone: "yellow" },
    { key: "good", label: "Good (approx.)", rule: "80 to 89", from: 80, tone: "green" },
    { key: "excellent", label: "Excellent (approx.)", rule: "90 to 100", from: 90, tone: "green" },
  ] as VitalBand[],
  source: "Source: your watch or app (approximate common labels; scores are device-specific).",
}

// ---------- 9. WATER INTAKE ----------
export const WATER_REF = {
  adultMinAge: 19,
  foodSharePct: 20,
  male: { totalL: 3.7, totalFlOz: 125, beverageL: 3.0, beverageCups: 13, beverageFlOz: 101 },
  female: { totalL: 2.7, totalFlOz: 91, beverageL: 2.2, beverageCups: 9, beverageFlOz: 74 },
  greenPct: 100,
  yellowPct: 75,
  bands: [
    { key: "under75", label: "Under 75% of target", rule: "Under 75%", from: null, tone: "orange" },
    { key: "75to99", label: "75 to 99% of target", rule: "75 to 99%", from: 75, tone: "yellow" },
    { key: "met", label: "At or above target", rule: "100% or more", from: 100, tone: "green" },
  ] as VitalBand[],
  under19Message: "Needs depend on age; ask your pediatrician.",
  notes:
    "Needs rise with heat, exercise and illness; very active people in hot weather may need 6 L or more in total. Thirst plus drinking with meals keeps most healthy people hydrated. Coffee and tea count; alcohol does not. If your doctor has limited your fluids (for example for heart or kidney conditions), follow their limit instead.",
  source: "Source: National Academies (Institute of Medicine) 2005.",
}

// ---------- 10. CALORIE INTAKE (Dietary Guidelines for Americans 2020-2025, adults 19+) ----------
export type CalorieAgeGroup = "19-30" | "31-50" | "51+"
export const CALORIE_REF = {
  adultMinAge: 19,
  activity: {
    sedentary: { label: "Sedentary", definition: "Only light activity of daily life" },
    moderate: { label: "Moderately active", definition: "Plus walking about 1.5 to 3 miles a day at 3 to 4 mph" },
    active: { label: "Active", definition: "Plus walking more than 3 miles a day at 3 to 4 mph" },
  } as Record<CalorieActivityLevel, { label: string; definition: string }>,
  table: {
    female: {
      "19-30": { sedentary: [1800, 2000], moderate: [2000, 2200], active: [2400, 2400] },
      "31-50": { sedentary: [1800, 1800], moderate: [2000, 2000], active: [2200, 2200] },
      "51+": { sedentary: [1600, 1600], moderate: [1800, 1800], active: [2000, 2200] },
    },
    male: {
      "19-30": { sedentary: [2400, 2600], moderate: [2600, 2800], active: [3000, 3000] },
      "31-50": { sedentary: [2200, 2400], moderate: [2400, 2600], active: [2800, 3000] },
      "51+": { sedentary: [2000, 2200], moderate: [2200, 2400], active: [2400, 2800] },
    },
  } as Record<"male" | "female", Record<CalorieAgeGroup, Record<CalorieActivityLevel, [number, number]>>>,
  outsidePct: 10,
  bands: [
    { key: "inside", label: "Inside your range", rule: "Inside the range", from: null, tone: "green" },
    { key: "near", label: "Within 10% outside", rule: "Within 10% outside", from: null, tone: "yellow" },
    { key: "far", label: "More than 10% outside", rule: "More than 10% outside", from: null, tone: "orange" },
  ] as VitalBand[],
  under19Message: "Ask your doctor or dietitian.",
  notes: "Estimates for keeping your current weight, not for weight loss or gain. Not for pregnancy or breastfeeding. Individual needs vary.",
  source: "Source: Dietary Guidelines for Americans 2020-2025.",
}

// ---------- 11. STEPS ----------
export const STEPS_REF = {
  summary:
    "There is no official U.S. daily step target (federal guidance is in minutes; see Activity). A 2025 Lancet Public Health review found about 7,000 steps a day linked with 47% lower risk of death than 2,000 steps, and 4,000 steps linked with 36% lower; benefits level off around 5,000 to 7,000 for several outcomes; 10,000 is still a fine goal for more active people. These are associations from observational studies.",
  bands: [
    { key: "low", label: "Low: every extra step helps", rule: "Under 4,000", from: null, tone: "orange" },
    { key: "building", label: "Building", rule: "4,000 to 6,999", from: 4000, tone: "yellow" },
    { key: "good", label: "Good", rule: "7,000 to 9,999", from: 7000, tone: "green" },
    { key: "great", label: "Great", rule: "10,000 and above", from: 10000, tone: "green" },
  ] as VitalBand[],
  source: "Source: Lancet Public Health (2025 review).",
}

// ---------- 12. ACTIVITY (minutes) ----------
export const ACTIVITY_REF = {
  adultMinAge: 18,
  youthMinAge: 6,
  youthMaxAge: 17,
  youthDailyMins: 60,
  weeklyMin: 150,
  weeklyMax: 300,
  adultGuidance:
    "Adults: at least 150 to 300 minutes a week of moderate activity (such as brisk walking), or 75 to 150 minutes of vigorous activity, or an equivalent mix (about 1 vigorous minute counts as 2 moderate), plus muscle-strengthening on 2 or more days a week; older adults also add balance training.",
  quickGuide: "Quick guide: about 30 minutes a day, 5 days a week.",
  youthGuidance: "Ages 6 to 17: 60 or more minutes of moderate to vigorous activity every day.",
  bands: [
    { key: "low", label: "Under 75 minutes", rule: "Under 75", from: null, tone: "orange" },
    { key: "building", label: "75 to 149 minutes", rule: "75 to 149", from: 75, tone: "yellow" },
    { key: "goal", label: "Meets the 150 to 300 goal", rule: "150 to 300", from: 150, tone: "green" },
    { key: "extra", label: "Extra benefits", rule: "Over 300", from: 300, fromExclusive: true, tone: "green" },
  ] as VitalBand[],
  source: "Source: HHS Physical Activity Guidelines for Americans, 2nd edition.",
}

// ---------- Shared styles & helpers ----------
export const VITAL_TONE_STYLES: Record<VitalBandTone, { dot: string; chip: string; rowActive: string; bar: string }> = {
  green: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
    rowActive: "border-emerald-500/50 bg-emerald-500/10",
    bar: "bg-emerald-500/85",
  },
  yellow: {
    dot: "bg-yellow-400",
    chip: "bg-yellow-500/15 text-yellow-200 border-yellow-500/35",
    rowActive: "border-yellow-400/50 bg-yellow-400/10",
    bar: "bg-yellow-400/85",
  },
  orange: {
    dot: "bg-orange-500",
    chip: "bg-orange-500/15 text-orange-300 border-orange-500/35",
    rowActive: "border-orange-500/50 bg-orange-500/10",
    bar: "bg-orange-500/85",
  },
  red: {
    dot: "bg-red-600",
    chip: "bg-red-500/20 text-red-200 border-red-500/45",
    rowActive: "border-red-500/60 bg-red-950/45",
    bar: "bg-red-600/90",
  },
}

export function pickBand(bands: VitalBand[], value: number): VitalBand {
  let chosen = bands[0]
  for (const b of bands) {
    if (b.from === null) {
      chosen = b
      continue
    }
    if (b.fromExclusive ? value > b.from : value >= b.from) chosen = b
  }
  return chosen
}

export function parseNumericVital(raw?: unknown): number | null {
  if (raw === null || raw === undefined) return null
  const match = String(raw).replace(/,/g, "").trim().match(/-?\d+(\.\d+)?/)
  if (!match) return null
  const n = Number(match[0])
  return Number.isFinite(n) ? n : null
}

export function normalizeGlucoseContext(raw?: string | null): GlucoseContextType | null {
  if (!raw) return null
  const s = String(raw).trim().toLowerCase()
  if (s.includes("fast")) return "Fasting"
  if (s.includes("2 hour") || s.includes("after eat") || s.includes("post-meal") || s.includes("post meal")) return "2 hours after eating"
  if (s.includes("random")) return "Random"
  return null
}

export function formatCalorieRange(r: [number, number]): string {
  return r[0] === r[1] ? r[0].toLocaleString() : `${r[0].toLocaleString()}–${r[1].toLocaleString()}`
}
