"use client"

import imageCompression from "browser-image-compression"
import { supabase } from "@/lib/supabase"
import {
  LabDraft,
  LabDraftPayload,
  LabExplanation,
  LabOverviewSummary,
  LabReport,
  LabResultRow,
  LabTestAlias,
  LabTrendPoint,
  LabUploadHints,
} from "./lab-results-types"
import {
  buildPreviousColumnRows,
  evaluateResultRules,
  validateAndNormalizeExtraction,
} from "./lab-results-rules"

const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10 MB

// Per-session in-memory caches (zero polling, zero refetch on tab switch)
const reportResultsCache = new Map<string, LabResultRow[]>()
const explanationCache = new Map<string, LabExplanation>()
let overviewCache: { userId: string; data: LabOverviewSummary } | null = null
let trendsCache: { userId: string; data: LabTrendPoint[] } | null = null

export function invalidateLabCaches() {
  reportResultsCache.clear()
  overviewCache = null
  trendsCache = null
}

export async function prepareLabFileForUpload(file: File): Promise<{
  processedFile: File
  mimeType: string
  base64: string
}> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (isPdf) {
    if (file.size > MAX_PDF_BYTES) {
      throw new Error(`PDF exceeds the 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB). Please split or reduce the PDF size.`)
    }
    const base64 = await fileToBase64(file)
    return { processedFile: file, mimeType: "application/pdf", base64 }
  }

  // Compress images client-side before upload (~1600px long edge, JPEG quality ~0.7)
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1600,
    initialQuality: 0.7,
    fileType: "image/jpeg",
    useWebWorker: true,
    maxSizeMB: 1.5,
  })
  const jpegFile = new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
  })
  const base64 = await fileToBase64(jpegFile)
  return { processedFile: jpegFile, mimeType: "image/jpeg", base64 }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || "")
      const commaIdx = result.indexOf(",")
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result)
    }
    reader.onerror = () => reject(new Error("Could not read file in browser memory"))
    reader.readAsDataURL(file)
  })
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function extractLabReportViaAI(params: {
  fileBase64?: string
  mimeType?: string
  pastedText?: string
  hints?: LabUploadHints
  userAliases?: LabTestAlias[]
}): Promise<LabDraftPayload> {
  const authHeader = await getAuthHeader()
  const res = await fetch("/api/lab-results-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify({
      action: "extract",
      fileBase64: params.fileBase64,
      mimeType: params.mimeType,
      pastedText: params.pastedText,
      hints: params.hints,
      userAliases: params.userAliases || [],
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || "Failed to extract lab report")
  }
  return validateAndNormalizeExtraction(data, params.userAliases || [])
}

// ==============================================================================
// DRAFTS (JSON only — never stores file binary or base64)
// ==============================================================================

export async function fetchLabDrafts(userId: string): Promise<LabDraft[]> {
  const { data, error } = await supabase
    .from("lab_drafts")
    .select("id, user_id, file_name, input_type, status, extraction_confidence, needs_review_count, date_collected, draft_json, error_message, created_at, updated_at")
    .eq("user_id", userId)
    .order("date_collected", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })

  if (error) {
    console.warn("fetchLabDrafts error:", error.message)
    return []
  }
  return (data || []) as LabDraft[]
}

export async function saveLabDraft(
  userId: string,
  draft: Omit<LabDraft, "id" | "localPreviewUrl" | "localFile" | "saveOriginalFile"> & { id?: string }
): Promise<LabDraft> {
  const payload = {
    ...(draft.id ? { id: draft.id } : {}),
    user_id: userId,
    file_name: draft.file_name,
    input_type: draft.input_type,
    status: draft.status,
    extraction_confidence: draft.extraction_confidence,
    needs_review_count: draft.needs_review_count,
    date_collected: draft.date_collected || null,
    draft_json: draft.draft_json,
    error_message: draft.error_message || null,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from("lab_drafts")
    .upsert(payload)
    .select("id, user_id, file_name, input_type, status, extraction_confidence, needs_review_count, date_collected, draft_json, error_message, created_at, updated_at")
    .single()

  if (error) throw new Error(error.message || "Failed to save draft")
  return data as LabDraft
}

export async function deleteLabDraft(userId: string, draftId: string): Promise<void> {
  await supabase.from("lab_drafts").delete().eq("id", draftId).eq("user_id", userId)
}

// ==============================================================================
// ALIASES
// ==============================================================================

export async function fetchLabAliases(userId: string): Promise<LabTestAlias[]> {
  const { data, error } = await supabase
    .from("lab_test_aliases")
    .select("id, user_id, alias_name, normalized_test_key, display_name, created_at")
    .eq("user_id", userId)
    .order("alias_name", { ascending: true })

  if (error) return []
  return (data || []) as LabTestAlias[]
}

export async function upsertLabAliases(
  userId: string,
  aliases: Array<{ alias_name: string; normalized_test_key: string; display_name: string }>
): Promise<void> {
  if (aliases.length === 0) return
  const rows = aliases.map((a) => ({
    user_id: userId,
    alias_name: a.alias_name.trim().toLowerCase(),
    normalized_test_key: a.normalized_test_key.trim(),
    display_name: a.display_name.trim(),
  }))
  await supabase.from("lab_test_aliases").upsert(rows, { onConflict: "user_id,alias_name" })
}

// ==============================================================================
// REPORTS & RESULTS (Zero select *, paginated history, lazy report details)
// ==============================================================================

export async function fetchLabReportsPage(
  userId: string,
  page = 0,
  pageSize = 10
): Promise<{ reports: LabReport[]; totalCount: number }> {
  const from = page * pageSize
  const to = from + pageSize - 1
  const { data, count, error } = await supabase
    .from("lab_reports")
    .select(
      "id, user_id, lab_name, patient_name, dob, specimen_id, ordering_physician, date_collected, date_received, date_reported, fasting, report_type, source_file_path, source_file_mime, extraction_confidence, summary_text, big_picture_json, panel_overviews_json, flagged_count, critical_count, total_results_count, created_at, updated_at",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("date_collected", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message)
  return { reports: (data || []) as LabReport[], totalCount: count || 0 }
}

export async function fetchLabReportResults(userId: string, reportId: string): Promise<LabResultRow[]> {
  const cached = reportResultsCache.get(reportId)
  if (cached) return cached

  const { data, error } = await supabase
    .from("lab_results")
    .select(
      "id, report_id, test_name, normalized_test_key, panel_name, value_numeric, value_text, comparator, unit, reference_low, reference_high, reference_text, lab_flag, flag_status, is_borderline, previous_value, previous_date, notes, is_narrative, source_kind, calculation_group, date_collected, personalized_line"
    )
    .eq("user_id", userId)
    .eq("report_id", reportId)
    .eq("source_kind", "report")
    .order("panel_name", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  const rows = (data || []) as LabResultRow[]
  reportResultsCache.set(reportId, rows)
  return rows
}

/**
 * ONE lightweight query for all Lab Trend cards on the page.
 */
export async function fetchAllLabTrends(userId: string, force = false): Promise<LabTrendPoint[]> {
  if (!force && trendsCache && trendsCache.userId === userId) {
    return trendsCache.data
  }
  const { data, error } = await supabase
    .from("lab_results")
    .select(
      "id, report_id, normalized_test_key, test_name, panel_name, value_numeric, value_text, comparator, unit, reference_low, reference_high, reference_text, flag_status, is_borderline, is_narrative, date_collected, source_kind, calculation_group"
    )
    .eq("user_id", userId)
    .order("date_collected", { ascending: true, nullsFirst: false })

  if (error) throw new Error(error.message)
  const rows = (data || []) as LabTrendPoint[]
  trendsCache = { userId, data: rows }
  return rows
}

export async function fetchLabExplanation(
  userId: string,
  normalizedTestKey: string
): Promise<LabExplanation | null> {
  const cached = explanationCache.get(normalizedTestKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from("lab_explanations")
    .select("id, user_id, normalized_test_key, what_it_is, what_abnormal_means, factors_discussed, doctor_questions, updated_at")
    .eq("user_id", userId)
    .eq("normalized_test_key", normalizedTestKey)
    .maybeSingle()

  if (error || !data) return null
  const exp = data as LabExplanation
  explanationCache.set(normalizedTestKey, exp)
  return exp
}

export async function checkDuplicateLabReport(
  userId: string,
  specimenId: string | null,
  labName: string,
  dateCollected: string | null
): Promise<{ duplicate: LabReport | null; matchType: "specimen_id" | "lab_and_date" | null }> {
  if (specimenId && specimenId.trim()) {
    const { data } = await supabase
      .from("lab_reports")
      .select("id, lab_name, specimen_id, date_collected, source_file_path")
      .eq("user_id", userId)
      .eq("specimen_id", specimenId.trim())
      .maybeSingle()
    if (data) {
      return { duplicate: data as LabReport, matchType: "specimen_id" }
    }
  }

  if (labName && dateCollected) {
    const { data } = await supabase
      .from("lab_reports")
      .select("id, lab_name, specimen_id, date_collected, source_file_path")
      .eq("user_id", userId)
      .eq("lab_name", labName.trim())
      .eq("date_collected", dateCollected)
      .maybeSingle()
    if (data) {
      return { duplicate: data as LabReport, matchType: "lab_and_date" }
    }
  }

  return { duplicate: null, matchType: null }
}

/**
 * Fetch short-lived signed URL (60s) ONLY when the user clicks "View original".
 */
export async function getOriginalLabFileSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("lab-reports")
    .createSignedUrl(filePath, 60)
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Could not open original file")
  }
  return data.signedUrl
}

/**
 * Deletes a lab report AND its stored original file (if any).
 */
export async function deleteLabReport(userId: string, report: Pick<LabReport, "id" | "source_file_path">): Promise<void> {
  if (report.source_file_path) {
    await supabase.storage.from("lab-reports").remove([report.source_file_path]).catch(() => {})
  }
  const { error } = await supabase
    .from("lab_reports")
    .delete()
    .eq("id", report.id)
    .eq("user_id", userId)
  if (error) throw new Error(error.message)
  invalidateLabCaches()
}

/**
 * Confirm & Save a reviewed draft:
 * - Optionally uploads original file to private bucket
 * - Calls AI explanation endpoint ONCE per report (current results + prev only)
 * - Saves report, results, deduplicated previous-column points, cached generic explanations
 * - Syncs Glucose (NOT A1c) into existing Glucose vital card
 * - Deletes draft row
 */
export async function confirmAndSaveLabReport(params: {
  userId: string
  draftPayload: LabDraftPayload
  localFile?: File | null
  saveOriginalFile?: boolean
  overwriteReportId?: string | null
  draftIdToDelete?: string | null
  userAliases?: LabTestAlias[]
  vitalsContext?: { latestBp?: string | null; latestBmi?: string | null }
  syncGlucoseToVital?: (entry: {
    value: string
    unit: string
    date: string
    context: string
    notes: string
  }) => Promise<void>
}): Promise<LabReport> {
  const { userId, draftPayload, localFile, saveOriginalFile = true, overwriteReportId, draftIdToDelete } = params
  const reportId = overwriteReportId || crypto.randomUUID()

  // Re-evaluate all rows cleanly
  const evaluatedResults = draftPayload.results.map((r) =>
    evaluateResultRules({ ...r, report_id: reportId, date_collected: draftPayload.report.date_collected }, params.userAliases || [])
  )

  const flaggedCount = evaluatedResults.filter(
    (r) => r.flag_status === "high" || r.flag_status === "low" || r.flag_status === "critical"
  ).length
  const criticalCount = evaluatedResults.filter((r) => r.flag_status === "critical").length

  // 1. Optional private storage upload
  let sourceFilePath: string | null = null
  let sourceFileMime: string | null = null
  if (saveOriginalFile && localFile) {
    const ext = localFile.type === "application/pdf" ? "pdf" : "jpg"
    const path = `${userId}/${reportId}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from("lab-reports")
      .upload(path, localFile, { upsert: true, contentType: localFile.type || "image/jpeg" })
    if (!uploadErr) {
      sourceFilePath = path
      sourceFileMime = localFile.type || "image/jpeg"
    }
  }

  // 2. Determine which generic test explanations are missing from lab_explanations
  const uniqueKeys = Array.from(new Set(evaluatedResults.map((r) => r.normalized_test_key)))
  const { data: existingExps } = await supabase
    .from("lab_explanations")
    .select("normalized_test_key")
    .eq("user_id", userId)
    .in("normalized_test_key", uniqueKeys)

  const existingKeySet = new Set((existingExps || []).map((e: any) => e.normalized_test_key))
  const missingTestKeys = uniqueKeys.filter((k) => !existingKeySet.has(k))

  // 3. Call explanation endpoint ONCE per report (current report + previous value/date per test ONLY)
  const authHeader = await getAuthHeader()
  let explainData: any = null
  try {
    const expRes = await fetch("/api/lab-results-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({
        action: "explain",
        report: {
          lab_name: draftPayload.report.lab_name,
          date_collected: draftPayload.report.date_collected,
          fasting: draftPayload.report.fasting,
        },
        results: evaluatedResults.map((r) => ({
          test_name: r.test_name,
          normalized_test_key: r.normalized_test_key,
          panel_name: r.panel_name,
          value_numeric: r.value_numeric,
          value_text: r.value_text,
          comparator: r.comparator,
          unit: r.unit,
          reference_low: r.reference_low,
          reference_high: r.reference_high,
          reference_text: r.reference_text,
          flag_status: r.flag_status,
          is_borderline: r.is_borderline,
          is_narrative: r.is_narrative,
          previous_value: r.previous_value,
          previous_date: r.previous_date,
        })),
        missingTestKeys,
        vitalsContext: params.vitalsContext || null,
      }),
    })
    if (expRes.ok) {
      explainData = await expRes.json()
    }
  } catch {
    // Non-fatal
  }

  // 4. If overwriting an existing report, clear its old results first
  if (overwriteReportId) {
    await supabase.from("lab_results").delete().eq("report_id", overwriteReportId).eq("user_id", userId)
  }

  // 5. Upsert lab_reports
  const reportRow = {
    id: reportId,
    user_id: userId,
    lab_name: draftPayload.report.lab_name || "Unknown Lab",
    patient_name: draftPayload.report.patient_name || null,
    dob: draftPayload.report.dob || null,
    specimen_id: draftPayload.report.specimen_id || null,
    ordering_physician: draftPayload.report.ordering_physician || null,
    date_collected: draftPayload.report.date_collected || null,
    date_received: draftPayload.report.date_received || null,
    date_reported: draftPayload.report.date_reported || null,
    fasting: draftPayload.report.fasting,
    report_type: draftPayload.report.report_type || null,
    source_file_path: sourceFilePath,
    source_file_mime: sourceFileMime,
    extraction_confidence: draftPayload.report.extraction_confidence || "medium",
    summary_text: explainData?.summary_text || null,
    big_picture_json: explainData?.big_picture || null,
    panel_overviews_json: explainData?.panel_overviews || null,
    flagged_count: flaggedCount,
    critical_count: criticalCount,
    total_results_count: evaluatedResults.length,
    updated_at: new Date().toISOString(),
  }

  const { data: savedReport, error: repErr } = await supabase
    .from("lab_reports")
    .upsert(reportRow)
    .select(
      "id, user_id, lab_name, patient_name, dob, specimen_id, ordering_physician, date_collected, date_received, date_reported, fasting, report_type, source_file_path, source_file_mime, extraction_confidence, summary_text, big_picture_json, panel_overviews_json, flagged_count, critical_count, total_results_count, created_at, updated_at"
    )
    .single()

  if (repErr) throw new Error(repErr.message || "Failed to save lab report")

  // 6. Deduplicate against existing trend points & remove superseded previous_column duplicates
  const existingTrends = await fetchAllLabTrends(userId, true).catch(() => [])
  const previousColumnRows = buildPreviousColumnRows(reportId, evaluatedResults, existingTrends)

  // If a direct result matches an older previous_column row on (test, value, date), remove the old previous_column duplicate
  const directKeys = new Set(
    evaluatedResults.map(
      (r) => `${r.normalized_test_key.toLowerCase()}::${r.value_text.replace(/\*+$/, "").trim().toLowerCase()}::${r.date_collected || ""}`
    )
  )
  const supersededIds = existingTrends
    .filter(
      (t) =>
        t.source_kind === "previous_column" &&
        directKeys.has(`${t.normalized_test_key.toLowerCase()}::${t.value_text.replace(/\*+$/, "").trim().toLowerCase()}::${t.date_collected || ""}`)
    )
    .map((t) => t.id)

  if (supersededIds.length > 0) {
    await supabase.from("lab_results").delete().eq("user_id", userId).in("id", supersededIds)
  }

  const personalizedMap: Record<string, string> = explainData?.personalized_lines || {}
  const allRowsToInsert = [...evaluatedResults, ...previousColumnRows].map((r) => ({
    user_id: userId,
    report_id: reportId,
    test_name: r.test_name,
    normalized_test_key: r.normalized_test_key,
    panel_name: r.panel_name,
    value_numeric: r.value_numeric,
    value_text: r.value_text,
    comparator: r.comparator,
    unit: r.unit,
    reference_low: r.reference_low,
    reference_high: r.reference_high,
    reference_text: r.reference_text,
    lab_flag: r.lab_flag,
    flag_status: r.flag_status,
    is_borderline: r.is_borderline,
    previous_value: r.previous_value,
    previous_date: r.previous_date,
    notes: r.notes,
    is_narrative: r.is_narrative,
    source_kind: r.source_kind || "report",
    calculation_group: r.calculation_group || null,
    date_collected: r.date_collected || draftPayload.report.date_collected || null,
    personalized_line: r.source_kind === "previous_column" ? null : personalizedMap[r.normalized_test_key] || null,
  }))

  if (allRowsToInsert.length > 0) {
    const { error: resErr } = await supabase.from("lab_results").insert(allRowsToInsert)
    if (resErr) throw new Error(resErr.message || "Failed to save lab results")
  }

  // 7. Upsert newly generated generic explanations
  if (explainData?.generic_explanations && missingTestKeys.length > 0) {
    const expRows = missingTestKeys
      .map((k) => {
        const g = explainData.generic_explanations[k]
        if (!g || !g.what_it_is) return null
        return {
          user_id: userId,
          normalized_test_key: k,
          what_it_is: g.what_it_is,
          what_abnormal_means: g.what_abnormal_means || "",
          factors_discussed: g.factors_discussed || "",
          doctor_questions: Array.isArray(g.doctor_questions) ? g.doctor_questions : [],
          updated_at: new Date().toISOString(),
        }
      })
      .filter(Boolean)

    if (expRows.length > 0) {
      await supabase.from("lab_explanations").upsert(expRows, { onConflict: "user_id,normalized_test_key" })
    }
  }

  // 8. Glucose -> existing Glucose vital card (NEVER A1c!)
  if (params.syncGlucoseToVital) {
    const glucoseRows = evaluatedResults.filter(
      (r) => r.normalized_test_key === "glucose" && r.value_numeric !== null
    )
    for (const g of glucoseRows) {
      await params.syncGlucoseToVital({
        value: String(g.value_numeric),
        unit: g.unit || "mg/dL",
        date: g.date_collected || draftPayload.report.date_collected || new Date().toISOString().slice(0, 10),
        context: draftPayload.report.fasting === true ? "Fasting" : "Random",
        notes: `source: lab report (${draftPayload.report.lab_name})`,
      })
    }
  }

  // 9. Clean up draft after confirmation
  if (draftIdToDelete) {
    await deleteLabDraft(userId, draftIdToDelete).catch(() => {})
  }

  invalidateLabCaches()
  return savedReport as LabReport
}

/**
 * Lightweight single summary query for Health Hub Overview, Dr. AI, and Doctor Visit Hub PDF.
 */
export async function fetchLabOverviewSummary(userId: string, force = false): Promise<LabOverviewSummary> {
  if (!force && overviewCache && overviewCache.userId === userId) {
    return overviewCache.data
  }

  const { data: reports, count } = await supabase
    .from("lab_reports")
    .select("id, lab_name, date_collected, flagged_count, critical_count, summary_text, big_picture_json", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("date_collected", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)

  const latest = (reports && reports[0]) as any
  let latestFlaggedResults: LabOverviewSummary["latestFlaggedResults"] = []

  if (latest?.id && (latest.flagged_count || 0) > 0) {
    const { data: flagged } = await supabase
      .from("lab_results")
      .select("test_name, value_text, unit, reference_text, flag_status, date_collected")
      .eq("user_id", userId)
      .eq("report_id", latest.id)
      .eq("source_kind", "report")
      .in("flag_status", ["high", "low", "critical"])
    latestFlaggedResults = (flagged || []) as any
  }

  const summary: LabOverviewSummary = {
    latestReportId: latest?.id || null,
    latestLabName: latest?.lab_name || null,
    latestDateCollected: latest?.date_collected || null,
    latestFlaggedCount: latest?.flagged_count || 0,
    latestCriticalCount: latest?.critical_count || 0,
    totalReports: count || 0,
    latestSummaryText: latest?.summary_text || null,
    latestChecklist: Array.isArray(latest?.big_picture_json?.doctor_checklist)
      ? latest.big_picture_json.doctor_checklist
      : [],
    latestFlaggedResults,
  }

  overviewCache = { userId, data: summary }
  return summary
}

/**
 * Lightweight Timeline query: one event per report (id, lab_name, date_collected, flagged_count).
 */
export async function fetchLabTimelineEvents(userId: string): Promise<
  Array<{ id: string; lab_name: string; date_collected: string | null; flagged_count: number }>
> {
  const { data, error } = await supabase
    .from("lab_reports")
    .select("id, lab_name, date_collected, flagged_count")
    .eq("user_id", userId)
    .order("date_collected", { ascending: false, nullsFirst: false })
    .limit(50)

  if (error) return []
  return (data || []) as any
}
