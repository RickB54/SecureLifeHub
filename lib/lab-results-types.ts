export const LAB_DISCLAIMER =
  "Educational information only, not a diagnosis. Discuss results with your doctor."

export const LAB_PROVIDER_OPTIONS = [
  "Auto-detect",
  "LabCorp",
  "Quest",
  "Hospital / Health system",
  "Other",
] as const

export const LAB_REPORT_TYPE_OPTIONS = [
  "Auto-detect",
  "Comprehensive Metabolic Panel",
  "CBC",
  "Lipid Panel",
  "Thyroid",
  "A1C",
  "Iron/Ferritin",
  "Urinalysis",
  "Vitamin/Hormone",
  "Other",
] as const

export const LAB_INPUT_TYPE_OPTIONS = [
  "Image",
  "PDF",
  "Pasted text",
] as const

export type LabFlagStatus = "normal" | "high" | "low" | "critical" | "needs_review"
export type LabConfidence = "high" | "medium" | "low"
export type LabSourceKind = "report" | "previous_column" | "manual"
export type LabDraftStatus = "queued" | "extracting" | "ready" | "needs_retake" | "saved" | "error"

export interface LabUploadHints {
  labProvider?: string
  labProviderCustom?: string
  reportType?: string
  inputType?: string
}

export interface LabResultRow {
  id?: string
  report_id?: string
  test_name: string
  normalized_test_key: string
  panel_name: string
  value_numeric: number | null
  value_text: string
  comparator: "<" | ">" | null
  unit: string
  reference_low: number | null
  reference_high: number | null
  reference_text: string
  lab_flag: string | null
  flag_status: LabFlagStatus
  is_borderline: boolean
  previous_value: string | null
  previous_date: string | null
  notes: string | null
  is_narrative: boolean
  source_kind?: LabSourceKind
  calculation_group?: string | null
  date_collected?: string | null
  personalized_line?: string | null
  /** UI-only helper during review */
  is_unmapped?: boolean
  review_reason?: string | null
}

export interface LabBigPictureSystemGroup {
  system: string
  tests: string[]
  why_grouped: string
  urgent?: boolean
}

export interface LabBigPicture {
  whats_good: string[]
  needs_attention: LabBigPictureSystemGroup[]
  doctor_checklist: string[]
  where_to_improve: string[]
}

export interface LabReport {
  id: string
  user_id?: string
  lab_name: string
  patient_name: string | null
  dob: string | null
  specimen_id: string | null
  ordering_physician: string | null
  date_collected: string | null
  date_received: string | null
  date_reported: string | null
  fasting: boolean | null
  report_type?: string | null
  source_file_path: string | null
  source_file_mime?: string | null
  extraction_confidence: LabConfidence
  summary_text?: string | null
  big_picture_json?: LabBigPicture | null
  panel_overviews_json?: Record<string, string> | null
  flagged_count: number
  critical_count: number
  total_results_count: number
  created_at?: string
  updated_at?: string
}

export interface LabTestAlias {
  id?: string
  user_id?: string
  alias_name: string
  normalized_test_key: string
  display_name: string
  created_at?: string
}

export interface LabExplanation {
  id?: string
  user_id?: string
  normalized_test_key: string
  what_it_is: string
  what_abnormal_means: string
  factors_discussed: string
  doctor_questions: string[]
  updated_at?: string
}

export interface LabDraftPayload {
  report: {
    lab_name: string
    patient_name: string | null
    dob: string | null
    specimen_id: string | null
    ordering_physician: string | null
    date_collected: string | null
    date_received: string | null
    date_reported: string | null
    fasting: boolean | null
    report_type: string | null
    extraction_confidence: LabConfidence
  }
  results: LabResultRow[]
  needs_retake?: boolean
  retake_reason?: string | null
  unmapped_tests?: Array<{
    test_name: string
    suggested_key: string
  }>
  token_usage?: {
    prompt_tokens?: number
    candidates_tokens?: number
    total_tokens?: number
  } | null
}

export interface LabDraft {
  id: string
  user_id?: string
  file_name: string
  input_type: "image" | "pdf" | "text"
  status: LabDraftStatus
  extraction_confidence: LabConfidence | null
  needs_review_count: number
  date_collected: string | null
  draft_json: LabDraftPayload
  error_message?: string | null
  created_at?: string
  updated_at?: string
  /** Browser-memory only (never persisted to Supabase) */
  localPreviewUrl?: string | null
  localFile?: File | null
  saveOriginalFile?: boolean
}

export interface LabTrendPoint {
  id: string
  report_id: string
  normalized_test_key: string
  test_name: string
  panel_name: string
  value_numeric: number | null
  value_text: string
  comparator: "<" | ">" | null
  unit: string
  reference_low: number | null
  reference_high: number | null
  reference_text: string
  flag_status: LabFlagStatus
  is_borderline: boolean
  is_narrative: boolean
  date_collected: string | null
  source_kind: LabSourceKind
  calculation_group: string | null
}

export interface LabOverviewSummary {
  latestReportId: string | null
  latestLabName: string | null
  latestDateCollected: string | null
  latestFlaggedCount: number
  latestCriticalCount: number
  totalReports: number
  latestSummaryText: string | null
  latestChecklist: string[]
  latestFlaggedResults: Array<{
    test_name: string
    value_text: string
    unit: string
    reference_text: string
    flag_status: LabFlagStatus
    date_collected: string | null
  }>
}
