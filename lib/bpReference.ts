export const BP_REF = {
 male: {
  "18-39": { sys: {mean:117,p5:101,p25:110,p50:116,p75:123,p95:132}, dia: {mean:68,p5:51,p25:61,p50:69,p75:76,p95:84} },
  "40-59": { sys: {mean:119,p5:102,p25:112,p50:118,p75:125,p95:135}, dia: {mean:74,p5:60,p25:69,p50:74,p75:80,p95:86} },
  "60+":   { sys: {mean:121,p5:99,p25:113,p50:122,p75:130,p95:137}, dia: {mean:67,p5:49,p25:61,p50:67,p75:74,p95:82} },
 },
 female: {
  "18-39": { sys: {mean:109,p5:94,p25:102,p50:109,p75:115,p95:126}, dia: {mean:67,p5:52,p25:61,p50:67,p75:73,p95:81} },
  "40-59": { sys: {mean:115,p5:96,p25:107,p50:115,p75:124,p95:134}, dia: {mean:72,p5:57,p25:66,p50:72,p75:77,p95:84} },
  "60+":   { sys: {mean:122,p5:102,p25:114,p50:122,p75:130,p95:137}, dia: {mean:66,p5:46,p25:60,p50:67,p75:73,p95:82} },
 },
};

export type BpSex = keyof typeof BP_REF;
export type BpAgeGroup = keyof (typeof BP_REF)["male"];

export type BpGoalCategoryKey = "normal" | "elevated" | "stage1" | "stage2" | "severe";

export interface BpClassification {
  key: BpGoalCategoryKey;
  label: string;
  rangeSummary: string;
  isLowRuleOfThumb: boolean;
}

export function getBpAgeGroup(age: number): BpAgeGroup {
  if (age < 40) return "18-39";
  if (age < 60) return "40-59";
  return "60+";
}

/**
 * Classifies adult blood pressure per 2025 AHA/ACC guidelines.
 * When systolic and diastolic fall into different categories, the higher category wins.
 */
export function classifyAdultBp(sys: number, dia: number): BpClassification {
  const isLowRuleOfThumb = sys < 90 || dia < 60;

  if (sys > 180 || dia > 120) {
    return {
      key: "severe",
      label: "Severe",
      rangeSummary: "Severe range",
      isLowRuleOfThumb,
    };
  }
  if (sys >= 140 || dia >= 90) {
    return {
      key: "stage2",
      label: "Stage 2 hypertension",
      rangeSummary: "Stage 2 range",
      isLowRuleOfThumb,
    };
  }
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    return {
      key: "stage1",
      label: "Stage 1 hypertension",
      rangeSummary: "Stage 1 range",
      isLowRuleOfThumb,
    };
  }
  if (sys >= 120 && sys <= 129 && dia < 80) {
    return {
      key: "elevated",
      label: "Elevated",
      rangeSummary: "Elevated range",
      isLowRuleOfThumb,
    };
  }
  return {
    key: "normal",
    label: "Normal",
    rangeSummary: "Normal range",
    isLowRuleOfThumb,
  };
}

export function parseBpReadingValue(raw?: string | null): { sys: number; dia: number } | null {
  if (!raw || typeof raw !== "string") return null;
  const match = raw.trim().match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!match) return null;
  const sys = Number(match[1]);
  const dia = Number(match[2]);
  if (!Number.isFinite(sys) || !Number.isFinite(dia) || sys <= 0 || dia <= 0) return null;
  return { sys, dia };
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatBpReadingShortDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const trimmed = String(dateStr).trim();
  const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const monthIdx = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    if (monthIdx >= 0 && monthIdx < 12 && day >= 1 && day <= 31) {
      return `${SHORT_MONTHS[monthIdx]} ${day}`;
    }
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return "";
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}
