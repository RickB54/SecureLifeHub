"use client"

import React, { useState, useRef } from "react"
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  Loader2,
  X,
  RefreshCw,
  ClipboardPaste,
  Check,
  Sparkles,
  FileWarning,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import {
  LAB_INPUT_TYPE_OPTIONS,
  LAB_PROVIDER_OPTIONS,
  LAB_REPORT_TYPE_OPTIONS,
  LabDraft,
  LabDraftPayload,
  LabFlagStatus,
  LabReport,
  LabResultRow,
  LabTestAlias,
  LabUploadHints,
} from "@/lib/lab-results-types"
import {
  BUILTIN_CANONICAL_TESTS,
  evaluateResultRules,
  normalizeTestName,
} from "@/lib/lab-results-rules"
import {
  checkDuplicateLabReport,
  confirmAndSaveLabReport,
  deleteLabDraft,
  extractLabReportViaAI,
  prepareLabFileForUpload,
  saveLabDraft,
  upsertLabAliases,
} from "@/lib/lab-results-api"
import { HealthTooltip } from "./health-tooltip"

interface LabUploadReviewProps {
  userId: string
  drafts: LabDraft[]
  setDrafts: React.Dispatch<React.SetStateAction<LabDraft[]>>
  userAliases: LabTestAlias[]
  onAliasesUpdated: (aliases: LabTestAlias[]) => void
  onReportSaved: (report: LabReport) => void
  vitalsContext?: { latestBp?: string | null; latestBmi?: string | null }
  syncGlucoseToVital?: (entry: {
    value: string
    unit: string
    date: string
    context: string
    notes: string
  }) => Promise<void>
}

export function LabUploadReview({
  userId,
  drafts,
  setDrafts,
  userAliases,
  onAliasesUpdated,
  onReportSaved,
  vitalsContext,
  syncGlucoseToVital,
}: LabUploadReviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputMode, setInputMode] = useState<"upload" | "paste" | "manual">("upload")
  const [labProvider, setLabProvider] = useState<string>("Auto-detect")
  const [labProviderCustom, setLabProviderCustom] = useState("")
  const [reportType, setReportType] = useState<string>("Auto-detect")
  const [inputTypeHint, setInputTypeHint] = useState<string>("Auto-detect")
  const [saveOriginalDefault, setSaveOriginalDefault] = useState<boolean>(true)
  const [pastedText, setPastedText] = useState("")
  const [extractingPaste, setExtractingPaste] = useState(false)

  // Manual single-result form
  const [manualForm, setManualForm] = useState({
    lab_name: "Manual Entry",
    date_collected: new Date().toISOString().slice(0, 10),
    test_name: "",
    panel_name: "General",
    value_text: "",
    unit: "",
    reference_text: "",
    fasting: false,
  })
  const [savingManual, setSavingManual] = useState(false)

  // Active review draft modal
  const [reviewingDraftId, setReviewingDraftId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [batchConfirming, setBatchConfirming] = useState(false)
  const [duplicatePrompt, setDuplicatePrompt] = useState<{
    draft: LabDraft
    duplicate: LabReport
    matchType: "specimen_id" | "lab_and_date"
  } | null>(null)

  const reviewingDraft = drafts.find((d) => d.id === reviewingDraftId) || null

  const hints: LabUploadHints = {
    labProvider,
    labProviderCustom,
    reportType,
    inputType: inputTypeHint,
  }

  // Batch upload queue: processes one file at a time in background, saves JSON drafts
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const fileArr = Array.from(files)

    const queuedItems: LabDraft[] = fileArr.map((file) => {
      const tempId = `local-${crypto.randomUUID()}`
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
      return {
        id: tempId,
        file_name: file.name,
        input_type: isPdf ? "pdf" : "image",
        status: "queued",
        extraction_confidence: null,
        needs_review_count: 0,
        date_collected: null,
        draft_json: {
          report: {
            lab_name: "Extracting...",
            patient_name: null,
            dob: null,
            specimen_id: null,
            ordering_physician: null,
            date_collected: null,
            date_received: null,
            date_reported: null,
            fasting: null,
            report_type: null,
            extraction_confidence: "medium",
          },
          results: [],
        },
        localPreviewUrl: URL.createObjectURL(file),
        localFile: file,
        saveOriginalFile: saveOriginalDefault,
      }
    })

    setDrafts((prev) => [...queuedItems, ...prev])

    // Process one file at a time
    for (const item of queuedItems) {
      setDrafts((prev) => prev.map((d) => (d.id === item.id ? { ...d, status: "extracting" } : d)))
      try {
        const { processedFile, mimeType, base64 } = await prepareLabFileForUpload(item.localFile!)
        const extracted = await extractLabReportViaAI({
          fileBase64: base64,
          mimeType,
          hints,
          userAliases,
        })

        const needsReviewCount = extracted.results.filter((r) => r.flag_status === "needs_review").length
        const status = extracted.needs_retake ? "needs_retake" : "ready"

        const savedDraft = await saveLabDraft(userId, {
          file_name: item.file_name,
          input_type: item.input_type,
          status,
          extraction_confidence: extracted.report.extraction_confidence,
          needs_review_count: needsReviewCount,
          date_collected: extracted.report.date_collected,
          draft_json: extracted,
          error_message: extracted.retake_reason || null,
        })

        setDrafts((prev) =>
          prev
            .map((d) =>
              d.id === item.id
                ? {
                    ...savedDraft,
                    localPreviewUrl: item.localPreviewUrl,
                    localFile: processedFile,
                    saveOriginalFile: item.saveOriginalFile,
                  }
                : d
            )
            .sort((a, b) => (a.date_collected || "9999").localeCompare(b.date_collected || "9999"))
        )
      } catch (err: any) {
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === item.id
              ? { ...d, status: "error", error_message: err?.message || "Extraction failed" }
              : d
          )
        )
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleExtractPastedText = async () => {
    if (!pastedText.trim()) {
      toast.error("Paste lab report text first.")
      return
    }
    setExtractingPaste(true)
    try {
      const extracted = await extractLabReportViaAI({
        pastedText: pastedText.trim(),
        hints: { ...hints, inputType: "Pasted text" },
        userAliases,
      })
      const needsReviewCount = extracted.results.filter((r) => r.flag_status === "needs_review").length
      const status = extracted.needs_retake ? "needs_retake" : "ready"
      const savedDraft = await saveLabDraft(userId, {
        file_name: `Pasted Report (${extracted.report.date_collected || "Today"})`,
        input_type: "text",
        status,
        extraction_confidence: extracted.report.extraction_confidence,
        needs_review_count: needsReviewCount,
        date_collected: extracted.report.date_collected,
        draft_json: extracted,
        error_message: extracted.retake_reason || null,
      })
      setDrafts((prev) => [{ ...savedDraft, saveOriginalFile: false }, ...prev])
      setPastedText("")
      if (status === "needs_retake") {
        toast.error(extracted.retake_reason || "Text could not be read clearly.")
      } else {
        setReviewingDraftId(savedDraft.id)
        toast.success(`Extracted ${extracted.results.length} results — ready for review.`)
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to extract pasted text")
    } finally {
      setExtractingPaste(false)
    }
  }

  const handleSaveManualResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.test_name.trim() || !manualForm.value_text.trim()) {
      toast.error("Test name and value are required.")
      return
    }
    setSavingManual(true)
    try {
      const row = evaluateResultRules(
        {
          test_name: manualForm.test_name.trim(),
          panel_name: manualForm.panel_name.trim() || "General",
          value_text: manualForm.value_text.trim(),
          unit: manualForm.unit.trim(),
          reference_text: manualForm.reference_text.trim(),
          date_collected: manualForm.date_collected || null,
          source_kind: "manual",
        },
        userAliases
      )
      const draftPayload: LabDraftPayload = {
        report: {
          lab_name: manualForm.lab_name.trim() || "Manual Entry",
          patient_name: null,
          dob: null,
          specimen_id: null,
          ordering_physician: null,
          date_collected: manualForm.date_collected || null,
          date_received: null,
          date_reported: null,
          fasting: manualForm.fasting,
          report_type: manualForm.panel_name.trim() || "Manual",
          extraction_confidence: "high",
        },
        results: [row],
      }
      const saved = await confirmAndSaveLabReport({
        userId,
        draftPayload,
        saveOriginalFile: false,
        userAliases,
        vitalsContext,
        syncGlucoseToVital,
      })
      onReportSaved(saved)
      setManualForm((prev) => ({ ...prev, test_name: "", value_text: "", unit: "", reference_text: "" }))
      toast.success("Manual lab result saved.")
    } catch (err: any) {
      toast.error(err?.message || "Could not save manual result")
    } finally {
      setSavingManual(false)
    }
  }

  const updateDraftPayload = (draftId: string, updater: (p: LabDraftPayload) => LabDraftPayload) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== draftId) return d
        const nextPayload = updater(d.draft_json)
        const needsReviewCount = nextPayload.results.filter((r) => r.flag_status === "needs_review").length
        return {
          ...d,
          draft_json: nextPayload,
          needs_review_count: needsReviewCount,
          date_collected: nextPayload.report.date_collected,
        }
      })
    )
  }

  const executeConfirmDraft = async (draft: LabDraft, overwriteReportId?: string | null) => {
    setConfirmingId(draft.id)
    try {
      // Persist any custom alias mappings chosen during review
      const aliasRows = draft.draft_json.results
        .filter((r) => !r.is_unmapped)
        .map((r) => {
          const def = BUILTIN_CANONICAL_TESTS.find((d) => d.key === r.normalized_test_key)
          return {
            alias_name: r.test_name.trim().toLowerCase(),
            normalized_test_key: r.normalized_test_key,
            display_name: def?.displayName || r.test_name.trim(),
          }
        })
      if (aliasRows.length > 0) {
        await upsertLabAliases(userId, aliasRows).catch(() => {})
      }

      const savedReport = await confirmAndSaveLabReport({
        userId,
        draftPayload: draft.draft_json,
        localFile: draft.localFile || null,
        saveOriginalFile: draft.saveOriginalFile !== false,
        overwriteReportId,
        draftIdToDelete: draft.id.startsWith("local-") ? null : draft.id,
        userAliases,
        vitalsContext,
        syncGlucoseToVital,
      })

      if (draft.localPreviewUrl) {
        URL.revokeObjectURL(draft.localPreviewUrl)
      }
      setDrafts((prev) => prev.filter((d) => d.id !== draft.id))
      if (reviewingDraftId === draft.id) setReviewingDraftId(null)
      onReportSaved(savedReport)
      toast.success(`Saved ${savedReport.lab_name} report (${savedReport.total_results_count} results).`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to confirm report")
    } finally {
      setConfirmingId(null)
    }
  }

  const handleConfirmClick = async (draft: LabDraft) => {
    const dup = await checkDuplicateLabReport(
      userId,
      draft.draft_json.report.specimen_id,
      draft.draft_json.report.lab_name,
      draft.draft_json.report.date_collected
    )
    if (dup.duplicate && dup.matchType) {
      setDuplicatePrompt({ draft, duplicate: dup.duplicate, matchType: dup.matchType })
      return
    }
    await executeConfirmDraft(draft)
  }

  const handleDiscardDraft = async (draft: LabDraft) => {
    if (draft.localPreviewUrl) URL.revokeObjectURL(draft.localPreviewUrl)
    if (!draft.id.startsWith("local-")) {
      await deleteLabDraft(userId, draft.id).catch(() => {})
    }
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id))
    if (reviewingDraftId === draft.id) setReviewingDraftId(null)
    toast.success("Draft discarded.")
  }

  const highConfidenceDrafts = drafts.filter(
    (d) =>
      d.status === "ready" &&
      d.extraction_confidence === "high" &&
      d.needs_review_count === 0 &&
      d.draft_json.results.length > 0
  )

  const handleConfirmAllHighConfidence = async () => {
    if (highConfidenceDrafts.length === 0) return
    setBatchConfirming(true)
    let savedCount = 0
    for (const draft of highConfidenceDrafts) {
      const dup = await checkDuplicateLabReport(
        userId,
        draft.draft_json.report.specimen_id,
        draft.draft_json.report.lab_name,
        draft.draft_json.report.date_collected
      )
      if (dup.duplicate) {
        toast.info(`Skipped duplicate draft: ${draft.file_name} — review individually to overwrite.`)
        continue
      }
      await executeConfirmDraft(draft)
      savedCount++
    }
    setBatchConfirming(false)
    if (savedCount > 0) {
      toast.success(`Confirmed ${savedCount} high-confidence report${savedCount === 1 ? "" : "s"}.`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload / Paste / Manual Card */}
      <div className="rounded-2xl bg-black border border-white/15 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                inputMode === "upload" ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Upload className="h-3.5 w-3.5" /> Upload Files
            </button>
            <button
              type="button"
              onClick={() => setInputMode("paste")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                inputMode === "paste" ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <ClipboardPaste className="h-3.5 w-3.5" /> Paste Text
            </button>
            <button
              type="button"
              onClick={() => setInputMode("manual")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                inputMode === "manual" ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> Add Result Manually
            </button>
          </div>

          {inputMode === "upload" && (
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveOriginalDefault}
                onChange={(e) => setSaveOriginalDefault(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-blue-600"
              />
              <span>Store original file privately</span>
              <HealthTooltip content="Optional. Stores compressed image or PDF in your private bucket. Only loaded when you click View original.">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              </HealthTooltip>
            </label>
          )}
        </div>

        {/* Optional Hints Row (all default Auto-detect; upload works with none changed) */}
        {inputMode !== "manual" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Lab Provider (Optional)
              </label>
              <select
                value={labProvider}
                onChange={(e) => setLabProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                style={{ colorScheme: "dark" }}
              >
                {LAB_PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#121212]">
                    {opt}
                  </option>
                ))}
              </select>
              {labProvider === "Other" && (
                <input
                  value={labProviderCustom}
                  onChange={(e) => setLabProviderCustom(e.target.value)}
                  placeholder="Enter lab name..."
                  className="mt-1.5 w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Report Type (Optional)
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                style={{ colorScheme: "dark" }}
              >
                {LAB_REPORT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#121212]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Input Type (Optional)
              </label>
              <select
                value={inputTypeHint}
                onChange={(e) => {
                  const val = e.target.value
                  setInputTypeHint(val)
                  if (val === "Pasted text") setInputMode("paste")
                  else if (val === "Image" || val === "PDF") setInputMode("upload")
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                style={{ colorScheme: "dark" }}
              >
                {LAB_INPUT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#121212]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Mode 1: Batch File Upload */}
        {inputMode === "upload" && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/15 hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white/[0.02]"
          >
            <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">
              Select one or multiple lab reports (PNG, JPG, or PDF up to 10 MB)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Works with LabCorp, Quest, hospital portals, screenshots, or multi-page PDFs. Files queue in the background as drafts until you confirm.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
          </div>
        )}

        {/* Mode 2: Paste Text */}
        {inputMode === "paste" && (
          <div className="space-y-3">
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste copied text from any patient portal or lab report..."
              className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={extractingPaste || !pastedText.trim()}
                onClick={handleExtractPastedText}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                {extractingPaste ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {extractingPaste ? "Extracting..." : "Extract Results"}
              </button>
            </div>
          </div>
        )}

        {/* Mode 3: Manual Result Entry */}
        {inputMode === "manual" && (
          <form onSubmit={handleSaveManualResult} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Test Name *</label>
              <input
                required
                value={manualForm.test_name}
                onChange={(e) => setManualForm({ ...manualForm, test_name: e.target.value })}
                placeholder="e.g. Ferritin, ALT, Glucose"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Value *</label>
              <input
                required
                value={manualForm.value_text}
                onChange={(e) => setManualForm({ ...manualForm, value_text: e.target.value })}
                placeholder="e.g. 101 or <0.2"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Unit</label>
              <input
                value={manualForm.unit}
                onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                placeholder="e.g. mg/dL, ng/mL"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Reference Range</label>
              <input
                value={manualForm.reference_text}
                onChange={(e) => setManualForm({ ...manualForm, reference_text: e.target.value })}
                placeholder="e.g. 65-99, <200, >59"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Date Collected</label>
              <input
                type="date"
                value={manualForm.date_collected}
                onChange={(e) => setManualForm({ ...manualForm, date_collected: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={savingManual}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {savingManual ? "Saving..." : "Save Manual Result"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Batch Queue Panel */}
      {drafts.length > 0 && (
        <div className="rounded-2xl bg-slate-950 border border-blue-500/30 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Pending Review Queue ({drafts.length})
              </h3>
              <p className="text-[11px] text-gray-400">
                Drafts are saved as small JSON so you can close the app and review later. Nothing becomes a report until confirmed.
              </p>
            </div>
            {highConfidenceDrafts.length > 0 && (
              <button
                type="button"
                disabled={batchConfirming}
                onClick={handleConfirmAllHighConfidence}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {batchConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Confirm all high-confidence ({highConfidenceDrafts.length})
              </button>
            )}
          </div>

          <div className="space-y-2">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white truncate">{d.file_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        d.status === "ready"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : d.status === "extracting" || d.status === "queued"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : d.status === "needs_retake" || d.status === "error"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {d.status === "extracting" && <Loader2 className="h-2.5 w-2.5 inline mr-1 animate-spin" />}
                      {d.status.replace("_", " ")}
                    </span>
                    {d.needs_review_count > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {d.needs_review_count} needs review
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {d.status === "ready"
                      ? `${d.draft_json.report.lab_name} • ${d.date_collected || "No date"} • ${d.draft_json.results.length} results • ${d.extraction_confidence || "medium"} confidence`
                      : d.error_message || (d.status === "queued" ? "Waiting in queue..." : "Reading report...")}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(d.status === "ready" || d.status === "needs_retake") && (
                    <button
                      type="button"
                      onClick={() => setReviewingDraftId(d.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                    >
                      {d.status === "needs_retake" ? "Inspect / Retake" : "Review & Confirm"}
                    </button>
                  )}
                  {d.status === "error" && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode("paste")
                        setInputTypeHint("Pasted text")
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-200 text-xs font-bold cursor-pointer"
                    >
                      Use Paste Text
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDiscardDraft(d)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 cursor-pointer"
                    title="Discard draft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Editable Review Modal */}
      {reviewingDraft && (
        <div className="fixed inset-0 z-[100080] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-6xl max-h-[94vh] bg-[#111318] border border-white/15 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Review Extracted Lab Report</h3>
                <p className="text-xs text-gray-400">
                  Edit any cell, map unrecognized tests, or delete/add rows. Nothing is saved until you click Confirm &amp; Save.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewingDraftId(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reviewingDraft.draft_json.needs_retake && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/35 text-xs text-red-200 flex items-center gap-2.5">
                <FileWarning className="h-5 w-5 text-red-400 shrink-0" />
                <span>
                  {reviewingDraft.draft_json.retake_reason ||
                    "Low image clarity detected. Please retake or re-upload a sharper photo instead of guessing."}
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Original file preview from browser memory (zero Storage egress) */}
              {reviewingDraft.localPreviewUrl && (
                <div className="lg:col-span-5 rounded-2xl bg-black border border-white/10 overflow-hidden flex flex-col min-h-[300px]">
                  <div className="px-3 py-2 border-b border-white/10 text-[11px] font-bold text-gray-400 flex items-center justify-between">
                    <span>Original File (Local Preview)</span>
                    <span className="text-emerald-400">0 KB Supabase egress</span>
                  </div>
                  {reviewingDraft.input_type === "pdf" ? (
                    <iframe
                      src={reviewingDraft.localPreviewUrl}
                      title="Lab Report PDF Preview"
                      className="w-full flex-1 min-h-[420px] bg-white"
                    />
                  ) : (
                    <div className="flex-1 overflow-auto p-2 flex items-start justify-center">
                      <img
                        src={reviewingDraft.localPreviewUrl}
                        alt="Lab report preview"
                        className="max-w-full rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Right: Editable metadata + results table */}
              <div className={`${reviewingDraft.localPreviewUrl ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
                {/* Report Header Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Lab Name</label>
                    <input
                      value={reviewingDraft.draft_json.report.lab_name}
                      onChange={(e) =>
                        updateDraftPayload(reviewingDraft.id, (p) => ({
                          ...p,
                          report: { ...p.report, lab_name: e.target.value },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Date Collected</label>
                    <input
                      type="date"
                      value={reviewingDraft.draft_json.report.date_collected || ""}
                      onChange={(e) =>
                        updateDraftPayload(reviewingDraft.id, (p) => ({
                          ...p,
                          report: { ...p.report, date_collected: e.target.value || null },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-white"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Ordering Physician</label>
                    <input
                      value={reviewingDraft.draft_json.report.ordering_physician || ""}
                      onChange={(e) =>
                        updateDraftPayload(reviewingDraft.id, (p) => ({
                          ...p,
                          report: { ...p.report, ordering_physician: e.target.value || null },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Fasting</label>
                    <select
                      value={
                        reviewingDraft.draft_json.report.fasting === true
                          ? "yes"
                          : reviewingDraft.draft_json.report.fasting === false
                          ? "no"
                          : "unknown"
                      }
                      onChange={(e) =>
                        updateDraftPayload(reviewingDraft.id, (p) => ({
                          ...p,
                          report: {
                            ...p.report,
                            fasting: e.target.value === "yes" ? true : e.target.value === "no" ? false : null,
                          },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-white"
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="unknown">Unknown</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                {/* Unmapped Tests Mapping Banner */}
                {reviewingDraft.draft_json.results.some((r) => r.is_unmapped) && (
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                    <div className="text-xs font-bold text-indigo-300">
                      Unmapped Tests — map to an existing test or keep as its own trend card
                    </div>
                    <div className="space-y-1.5">
                      {reviewingDraft.draft_json.results
                        .filter((r) => r.is_unmapped)
                        .map((row, idx) => (
                          <div key={`${row.test_name}-${idx}`} className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-white font-semibold">{row.test_name}</span>
                            <span className="text-gray-400">&rarr;</span>
                            <select
                              value={row.normalized_test_key}
                              onChange={(e) => {
                                const newKey = e.target.value
                                updateDraftPayload(reviewingDraft.id, (p) => ({
                                  ...p,
                                  results: p.results.map((r) =>
                                    r.test_name === row.test_name
                                      ? { ...r, normalized_test_key: newKey, is_unmapped: newKey === row.normalized_test_key }
                                      : r
                                  ),
                                }))
                              }}
                              className="px-2 py-1 rounded-lg bg-black border border-white/15 text-white text-xs"
                              style={{ colorScheme: "dark" }}
                            >
                              <option value={row.normalized_test_key}>Keep as new test ({row.test_name})</option>
                              {BUILTIN_CANONICAL_TESTS.map((t) => (
                                <option key={t.key} value={t.key}>
                                  Map to: {t.displayName}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Editable Results Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-[10px] uppercase text-gray-400">
                      <tr>
                        <th className="p-2">Test / Panel</th>
                        <th className="p-2">Value</th>
                        <th className="p-2">Unit</th>
                        <th className="p-2">Range</th>
                        <th className="p-2">Flag</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {reviewingDraft.draft_json.results.map((row, idx) => {
                        const isNeedsReview = row.flag_status === "needs_review"
                        return (
                          <tr
                            key={idx}
                            className={isNeedsReview ? "bg-amber-500/15" : "hover:bg-white/[0.02]"}
                          >
                            <td className="p-2 space-y-1">
                              <input
                                value={row.test_name}
                                onChange={(e) => {
                                  const val = e.target.value
                                  const norm = normalizeTestName(val, userAliases)
                                  updateDraftPayload(reviewingDraft.id, (p) => ({
                                    ...p,
                                    results: p.results.map((r, i) =>
                                      i === idx
                                        ? { ...r, test_name: val, normalized_test_key: norm.normalized_test_key }
                                        : r
                                    ),
                                  }))
                                }}
                                className="w-full px-2 py-1 rounded bg-black border border-white/10 text-white font-semibold"
                              />
                              <input
                                value={row.panel_name}
                                onChange={(e) =>
                                  updateDraftPayload(reviewingDraft.id, (p) => ({
                                    ...p,
                                    results: p.results.map((r, i) =>
                                      i === idx ? { ...r, panel_name: e.target.value } : r
                                    ),
                                  }))
                                }
                                placeholder="Panel"
                                className="w-full px-2 py-0.5 rounded bg-black/60 border border-white/5 text-[10px] text-gray-400"
                              />
                              {row.review_reason && (
                                <div className="text-[10px] text-amber-300 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 shrink-0" /> {row.review_reason}
                                </div>
                              )}
                            </td>
                            <td className="p-2">
                              <input
                                value={row.value_text}
                                onChange={(e) =>
                                  updateDraftPayload(reviewingDraft.id, (p) => ({
                                    ...p,
                                    results: p.results.map((r, i) =>
                                      i === idx
                                        ? evaluateResultRules({ ...r, value_text: e.target.value, value_numeric: null }, userAliases)
                                        : r
                                    ),
                                  }))
                                }
                                className="w-24 px-2 py-1 rounded bg-black border border-white/10 text-white font-mono"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                value={row.unit}
                                onChange={(e) =>
                                  updateDraftPayload(reviewingDraft.id, (p) => ({
                                    ...p,
                                    results: p.results.map((r, i) => (i === idx ? { ...r, unit: e.target.value } : r)),
                                  }))
                                }
                                className="w-20 px-2 py-1 rounded bg-black border border-white/10 text-white"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                value={row.reference_text}
                                onChange={(e) =>
                                  updateDraftPayload(reviewingDraft.id, (p) => ({
                                    ...p,
                                    results: p.results.map((r, i) =>
                                      i === idx
                                        ? evaluateResultRules(
                                            { ...r, reference_text: e.target.value, reference_low: null, reference_high: null },
                                            userAliases
                                          )
                                        : r
                                    ),
                                  }))
                                }
                                placeholder="None"
                                className="w-24 px-2 py-1 rounded bg-black border border-white/10 text-white"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={row.flag_status}
                                onChange={(e) =>
                                  updateDraftPayload(reviewingDraft.id, (p) => ({
                                    ...p,
                                    results: p.results.map((r, i) =>
                                      i === idx ? { ...r, flag_status: e.target.value as LabFlagStatus } : r
                                    ),
                                  }))
                                }
                                className="px-2 py-1 rounded bg-black border border-white/10 text-white text-xs"
                                style={{ colorScheme: "dark" }}
                              >
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="low">Low</option>
                                <option value="critical">Critical</option>
                                <option value="needs_review">Needs Review</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateDraftPayload(reviewingDraft.id, (p) => ({
                                    ...p,
                                    results: p.results.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateDraftPayload(reviewingDraft.id, (p) => ({
                      ...p,
                      results: [
                        ...p.results,
                        evaluateResultRules(
                          {
                            test_name: "New Test",
                            panel_name: "General",
                            value_text: "",
                            unit: "",
                            reference_text: "",
                          },
                          userAliases
                        ),
                      ],
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </button>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDiscardDraft(reviewingDraft)}
                className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold cursor-pointer"
              >
                Discard Draft
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingDraftId(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  Review Later
                </button>
                <button
                  type="button"
                  disabled={confirmingId === reviewingDraft.id || reviewingDraft.draft_json.results.length === 0}
                  onClick={() => handleConfirmClick(reviewingDraft)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {confirmingId === reviewingDraft.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Confirm &amp; Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Report Warning Modal */}
      {duplicatePrompt && (
        <div className="fixed inset-0 z-[100090] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#151820] border border-amber-500/40 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Duplicate Lab Report Detected</h4>
                <p className="text-xs text-gray-300 mt-1">
                  {duplicatePrompt.matchType === "specimen_id"
                    ? `A report with Specimen ID "${duplicatePrompt.duplicate.specimen_id}" already exists.`
                    : `A ${duplicatePrompt.duplicate.lab_name} report collected on ${duplicatePrompt.duplicate.date_collected} already exists.`}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDuplicatePrompt(null)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { draft, duplicate } = duplicatePrompt
                  setDuplicatePrompt(null)
                  await executeConfirmDraft(draft, duplicate.id)
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Overwrite Existing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
