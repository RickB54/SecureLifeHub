"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  X,
  FileDown,
  Printer,
  Copy,
  Check,
  Search,
  Edit,
  Trash2,
  Plus,
  Loader2,
  FolderCog,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import type { DoctorOption, FacilityOption } from "./health-field-helpers"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"
import {
  DEFAULT_MED_CATEGORIES,
  MED_EXPORT_PREFS_KEY,
  UNCATEGORIZED_MED_CATEGORY,
  buildMedicationPlainText,
  downloadMedicationPDF,
  extractNormalizedMedicationData,
  getMedCategory,
  printMedicationReport,
  type MedicationExportOptions,
} from "@/lib/medication-export"

// ============================================================================
// 1. REUSABLE CATEGORY SELECT WITH "+ New category..."
// ============================================================================
interface MedicationCategorySelectProps {
  value: string
  categories: string[]
  onChange: (category: string) => void
  onCreateCategory?: (newCategory: string) => void
  label?: string
  compact?: boolean
}

export function MedicationCategorySelect({
  value,
  categories,
  onChange,
  onCreateCategory,
  label = "Category",
  compact = false,
}: MedicationCategorySelectProps) {
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName] = useState("")

  const allOptions = useMemo(() => {
    const set = new Set<string>(DEFAULT_MED_CATEGORIES as unknown as string[])
    for (const c of categories) {
      if (c && c !== UNCATEGORIZED_MED_CATEGORY) set.add(c)
    }
    if (value && value !== UNCATEGORIZED_MED_CATEGORY) set.add(value)
    return Array.from(set)
  }, [categories, value])

  const commitNew = () => {
    const clean = newName.trim()
    if (!clean) {
      setAddingNew(false)
      return
    }
    onCreateCategory?.(clean)
    onChange(clean)
    setNewName("")
    setAddingNew(false)
  }

  return (
    <div>
      {label && (
        <label className={compact ? "text-[11px] font-bold text-gray-400 uppercase mb-1.5 block" : "text-sm font-bold text-gray-400 uppercase mb-2 block"}>
          {label}
        </label>
      )}
      {addingNew ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            placeholder="Type new category name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commitNew()
              } else if (e.key === "Escape") {
                setAddingNew(false)
                setNewName("")
              }
            }}
            className="flex-1 px-3 py-2.5 bg-[#2a2a2a] border border-purple-500 rounded-xl text-sm text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={commitNew}
            className="px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingNew(false)
              setNewName("")
            }}
            className="px-2.5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <select
          value={value || ""}
          onChange={(e) => {
            if (e.target.value === "__new__") {
              setAddingNew(true)
            } else {
              onChange(e.target.value)
            }
          }}
          className={`w-full bg-[#2a2a2a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          }`}
        >
          <option value="">Uncategorized</option>
          {allOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="__new__">+ New category...</option>
        </select>
      )}
    </div>
  )
}

// ============================================================================
// 2. MANAGE CATEGORIES MODAL (Rename / Delete)
// ============================================================================
interface ManageCategoriesModalProps {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  medications: any[]
  onRenameCategory: (oldName: string, newName: string) => Promise<void>
  onDeleteCategory: (name: string) => Promise<void>
  onAddCategory: (name: string) => void
}

export function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  medications,
  onRenameCategory,
  onDeleteCategory,
  onAddCategory,
}: ManageCategoriesModalProps) {
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState("")
  const [newCatInput, setNewCatInput] = useState("")
  const [busy, setBusy] = useState(false)

  if (!isOpen) return null

  const countsByCat = medications.reduce<Record<string, number>>((acc, m) => {
    const c = getMedCategory(m)
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})

  const handleConfirmRename = async (oldName: string) => {
    const clean = renameVal.trim()
    if (!clean || clean === oldName) {
      setEditingCat(null)
      return
    }
    setBusy(true)
    try {
      await onRenameCategory(oldName, clean)
      setEditingCat(null)
      toast.success(`Renamed "${oldName}" to "${clean}"`)
    } finally {
      setBusy(false)
    }
  }

  const handleConfirmDelete = async (cat: string) => {
    const count = countsByCat[cat] || 0
    const msg =
      count > 0
        ? `Delete category "${cat}"? ${count} medication(s) will move to Uncategorized.`
        : `Delete category "${cat}"?`
    if (!confirm(msg)) return
    setBusy(true)
    try {
      await onDeleteCategory(cat)
      toast.success(`Deleted "${cat}"`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 shadow-2xl text-white space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FolderCog className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-bold">Manage Medication Categories</h3>
          </div>
          <HealthTooltip content="Close">
            <button type="button" onClick={onClose} aria-label="Close manage categories" className="p-1 text-gray-400 hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </HealthTooltip>
        </div>

        {/* Add new category */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New category name..."
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCatInput.trim()) {
                e.preventDefault()
                onAddCategory(newCatInput.trim())
                setNewCatInput("")
                toast.success("Category added")
              }
            }}
            className="flex-1 h-9 px-3 bg-[#242424] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="button"
            onClick={() => {
              if (!newCatInput.trim()) return
              onAddCategory(newCatInput.trim())
              setNewCatInput("")
              toast.success("Category added")
            }}
            className="h-9 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

        {/* Category list */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {categories.map((cat) => {
            const count = countsByCat[cat] || 0
            const isEditing = editingCat === cat
            return (
              <div
                key={cat}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirmRename(cat)
                        if (e.key === "Escape") setEditingCat(null)
                      }}
                      className="flex-1 h-8 px-2.5 bg-[#2a2a2a] border border-purple-500 rounded-md text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleConfirmRename(cat)}
                      className="px-2.5 py-1 rounded-md bg-purple-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-100 truncate">{cat}</span>
                      <span className="ml-2 text-xs text-gray-400">({count})</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <HealthTooltip content="Rename category (updates every medication using it)">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setEditingCat(cat)
                            setRenameVal(cat)
                          }}
                          aria-label={`Rename ${cat}`}
                          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-purple-300 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </HealthTooltip>
                      <HealthTooltip content="Delete category (moves its medications to Uncategorized)">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleConfirmDelete(cat)}
                          aria-label={`Delete ${cat}`}
                          className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </HealthTooltip>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-[11px] text-gray-400">
          Renaming updates every medication in that category. Deleting moves its medications to Uncategorized.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// 3. UNIFIED EXPORT DIALOG (PDF / Print / Copy as Text)
// ============================================================================
interface MedicationExportModalProps {
  isOpen: boolean
  onClose: () => void
  allMedications: any[]
  singleMedication?: any | null
  doctors: DoctorOption[]
  facilities: FacilityOption[]
  categories: string[]
}

export function MedicationExportModal({
  isOpen,
  onClose,
  allMedications,
  singleMedication = null,
  doctors,
  facilities,
  categories,
}: MedicationExportModalProps) {
  const [formatType, setFormatType] = useState<"quick" | "full">("quick")
  const [selectionMode, setSelectionMode] = useState<"all" | "by_category" | "pick">("all")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [pickedIds, setPickedIds] = useState<string[]>([])
  const [pickerSearch, setPickerSearch] = useState("")
  const [groupByCategory, setGroupByCategory] = useState(true)
  const [patientName, setPatientName] = useState("")
  const [includePrivateNotes, setIncludePrivateNotes] = useState(false)
  const [includeAdherence, setIncludeAdherence] = useState(true)
  const [includeMedInfo, setIncludeMedInfo] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load remembered preferences from localStorage on open
  useEffect(() => {
    if (!isOpen) return
    try {
      const raw = localStorage.getItem(MED_EXPORT_PREFS_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.formatType === "quick" || saved.formatType === "full") setFormatType(saved.formatType)
        if (typeof saved.groupByCategory === "boolean") setGroupByCategory(saved.groupByCategory)
        if (typeof saved.patientName === "string") setPatientName(saved.patientName)
        if (typeof saved.includePrivateNotes === "boolean") setIncludePrivateNotes(saved.includePrivateNotes)
        if (typeof saved.includeAdherence === "boolean") setIncludeAdherence(saved.includeAdherence)
        if (typeof saved.includeMedInfo === "boolean") setIncludeMedInfo(saved.includeMedInfo)
      }
    } catch {
      // ignore
    }
    // Default selection: all medications included
    setSelectionMode("all")
    setPickedIds(allMedications.map((m) => m.id))
    const allCats = Array.from(new Set([...categories, UNCATEGORIZED_MED_CATEGORY]))
    setSelectedCategories(allCats)
    setPickerSearch("")
  }, [isOpen, allMedications, categories])

  const persistPrefs = (next: Partial<MedicationExportOptions>) => {
    try {
      const payload = {
        formatType,
        groupByCategory,
        patientName,
        includePrivateNotes,
        includeAdherence,
        includeMedInfo,
        ...next,
      }
      localStorage.setItem(MED_EXPORT_PREFS_KEY, JSON.stringify(payload))
    } catch {
      // ignore
    }
  }

  // Group ALL medications by category for the picker (never excluding imported/Pill Library/unscheduled meds)
  const groupedPickerMeds = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase()
    const filtered = allMedications.filter((m) => {
      if (!q) return true
      return (
        (m.title || "").toLowerCase().includes(q) ||
        (m.item_metadata?.genericName || "").toLowerCase().includes(q) ||
        (m.item_metadata?.dosage || "").toLowerCase().includes(q) ||
        getMedCategory(m).toLowerCase().includes(q)
      )
    })

    const map = new Map<string, any[]>()
    for (const m of filtered) {
      const cat = getMedCategory(m)
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(m)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    }
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === UNCATEGORIZED_MED_CATEGORY) return 1
      if (b[0] === UNCATEGORIZED_MED_CATEGORY) return -1
      return a[0].localeCompare(b[0])
    })
  }, [allMedications, pickerSearch])

  const availableCategoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of allMedications) {
      const cat = getMedCategory(m)
      counts.set(cat, (counts.get(cat) || 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => {
      if (a[0] === UNCATEGORIZED_MED_CATEGORY) return 1
      if (b[0] === UNCATEGORIZED_MED_CATEGORY) return -1
      return a[0].localeCompare(b[0])
    })
  }, [allMedications])

  const resolvedTargetMedications = useMemo(() => {
    if (singleMedication) return [singleMedication]
    if (selectionMode === "all") return allMedications
    if (selectionMode === "by_category") {
      return allMedications.filter((m) => selectedCategories.includes(getMedCategory(m)))
    }
    return allMedications.filter((m) => pickedIds.includes(m.id))
  }, [singleMedication, selectionMode, allMedications, selectedCategories, pickedIds])

  if (!isOpen) return null

  const prepareNormalizedItems = async () => {
    if (resolvedTargetMedications.length === 0) {
      toast.error("Please select at least one medication to export.")
      return null
    }

    const medInfoByMedId: Record<string, string> = {}

    // If Full Details + Include Med Info text is checked, attempt ONE query to med_info (if table exists)
    if (formatType === "full" && includeMedInfo) {
      try {
        const ids = resolvedTargetMedications.map((m) => m.id).filter(Boolean)
        if (ids.length > 0) {
          const { data, error } = await supabase
            .from("med_info")
            .select("medication_id, content, info_text")
            .in("medication_id", ids)

          if (!error && Array.isArray(data)) {
            for (const row of data as any[]) {
              const txt = row?.content || row?.info_text || ""
              if (row?.medication_id && txt) {
                medInfoByMedId[row.medication_id] = String(txt)
              }
            }
          }
        }
      } catch {
        // med_info table does not exist — gracefully fall back to item_metadata.aiDrugInfo
      }
    }

    return resolvedTargetMedications.map((m) =>
      extractNormalizedMedicationData(m, doctors, facilities, medInfoByMedId[m.id])
    )
  }

  const buildOptions = (): MedicationExportOptions => ({
    formatType,
    groupByCategory: singleMedication ? false : groupByCategory,
    patientName,
    includePrivateNotes,
    includeAdherence,
    includeMedInfo,
  })

  const runAction = async (mode: "pdf" | "print" | "copy") => {
    setExporting(true)
    try {
      const opts = buildOptions()
      persistPrefs(opts)
      const normalized = await prepareNormalizedItems()
      if (!normalized) return

      if (mode === "pdf") {
        downloadMedicationPDF(normalized, opts)
        toast.success("PDF downloaded")
      } else if (mode === "print") {
        printMedicationReport(normalized, opts)
      } else {
        const text = buildMedicationPlainText(normalized, opts)
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Copied medication list as plain text")
      }
    } catch (err: any) {
      toast.error(err?.message || "Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 shadow-2xl text-white space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              {singleMedication ? `Export ${singleMedication.title}` : "Export / Print Medications"}
            </h3>
            <p className="text-xs text-gray-400">
              {singleMedication
                ? "Single medication report"
                : `${resolvedTargetMedications.length} of ${allMedications.length} medication(s) selected`}
            </p>
          </div>
          <HealthTooltip content="Close export dialog">
            <button type="button" onClick={onClose} aria-label="Close export dialog" className="p-1 text-gray-400 hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </HealthTooltip>
        </div>

        {/* a) Format */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Format</label>
            <FieldHelpPopover
              title="Quick Reference vs Full Details"
              content="Quick Reference prints a compact 1-page table with only refill and prescriber essentials. Full Details generates a summary table plus one complete clinical sheet per medication."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <HealthTooltip content="One compact table for pharmacy refills or handing to a doctor (hides side effects, notes, and estimates)">
              <button
                type="button"
                onClick={() => setFormatType("quick")}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  formatType === "quick"
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                }`}
              >
                <div className="text-sm font-bold">Quick Reference</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Compact 1-page table for refills or handing to a doctor</div>
              </button>
            </HealthTooltip>
            <HealthTooltip content="Complete clinical profile: 1-page summary followed by one detailed sheet per medication">
              <button
                type="button"
                onClick={() => setFormatType("full")}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  formatType === "full"
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                }`}
              >
                <div className="text-sm font-bold">Full Details</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Summary + one complete clinical sheet per medication</div>
              </button>
            </HealthTooltip>
          </div>
        </div>

        {/* b) Which medications (Meds page only) */}
        {!singleMedication && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Which Medications
            </label>
            <div className="h-8 p-0.5 bg-[#242424] border border-white/10 rounded-lg inline-flex items-center w-full sm:w-auto">
              {(
                [
                  { id: "all", label: `All (${allMedications.length})` },
                  { id: "by_category", label: "By category" },
                  { id: "pick", label: "Pick medications" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectionMode(tab.id)}
                  className={`flex-1 sm:flex-none h-full px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    selectionMode === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {selectionMode === "by_category" && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Select categories to include:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategories(availableCategoriesWithCounts.map(([c]) => c))}
                      className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {availableCategoriesWithCounts.map(([cat, count]) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/20 hover:bg-white/5 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) =>
                          setSelectedCategories((prev) =>
                            e.target.checked ? [...prev, cat] : prev.filter((c) => c !== cat)
                          )
                        }
                        className="rounded border-gray-600 text-purple-600 focus:ring-0"
                      />
                      <span className="truncate text-gray-200">{cat}</span>
                      <span className="ml-auto text-gray-500">({count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectionMode === "pick" && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search all medications..."
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-2.5 bg-[#242424] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickedIds(allMedications.map((m) => m.id))}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold shrink-0 cursor-pointer"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickedIds([])}
                    className="text-xs text-gray-400 hover:text-white shrink-0 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {groupedPickerMeds.map(([cat, meds]) => (
                    <div key={cat} className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 px-1">
                        {cat} ({meds.length})
                      </div>
                      {meds.map((m) => (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/20 hover:bg-white/5 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={pickedIds.includes(m.id)}
                            onChange={(e) =>
                              setPickedIds((prev) =>
                                e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                              )
                            }
                            className="rounded border-gray-600 text-purple-600 focus:ring-0"
                          />
                          <span className="font-medium text-white truncate">{m.title}</span>
                          {m.item_metadata?.dosage && (
                            <span className="text-gray-400 shrink-0">{m.item_metadata.dosage}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* c) Patient Name & Group by Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Patient Name (Optional)
              </label>
              <FieldHelpPopover
                title="Patient Name"
                content="Printed in the PDF/print header for your doctor or pharmacist. Saved locally on this device only — never uploaded."
              />
            </div>
            <input
              type="text"
              placeholder="Printed in header (saved on this device)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full h-9 px-3 bg-[#242424] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          {!singleMedication && (
            <div className="flex items-end pb-1.5 gap-1.5">
              <HealthTooltip content="Organize medications under category headings sorted A–Z within each category">
                <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={groupByCategory}
                    onChange={(e) => setGroupByCategory(e.target.checked)}
                    className="rounded border-gray-600 text-purple-600 focus:ring-0"
                  />
                  <span>Group by category</span>
                </label>
              </HealthTooltip>
              <FieldHelpPopover
                title="Group by Category"
                content="When ON, exported medications are grouped under their category headings (Every Day Usage, As Needed, etc.) and sorted A–Z inside each group."
              />
            </div>
          )}
        </div>

        {/* d) Full Details options */}
        {formatType === "full" && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Full Details Options
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-200">
              <div className="inline-flex items-center gap-1">
                <HealthTooltip content="Off by default so personal notes stay private unless you explicitly include them">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includePrivateNotes}
                      onChange={(e) => setIncludePrivateNotes(e.target.checked)}
                      className="rounded border-gray-600 text-purple-600 focus:ring-0"
                    />
                    <span>Include private notes</span>
                  </label>
                </HealthTooltip>
                <FieldHelpPopover
                  title="Include Private Notes"
                  content="OFF by default to protect private notes when handing a printout to a provider. Turn ON only when you want personal notes printed."
                />
              </div>
              <HealthTooltip content="Include Taken and Skipped dose log summary and recent timestamps">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeAdherence}
                    onChange={(e) => setIncludeAdherence(e.target.checked)}
                    className="rounded border-gray-600 text-purple-600 focus:ring-0"
                  />
                  <span>Include adherence</span>
                </label>
              </HealthTooltip>
              <HealthTooltip content="Include saved clinical drug reference text for the selected medications">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMedInfo}
                    onChange={(e) => setIncludeMedInfo(e.target.checked)}
                    className="rounded border-gray-600 text-purple-600 focus:ring-0"
                  />
                  <span>Include Med Info text</span>
                </label>
              </HealthTooltip>
            </div>
          </div>
        )}

        {/* e) Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-white/10">
          <HealthTooltip content="Copy a clean plain-text medication list to paste into a pharmacy or patient portal message">
            <button
              type="button"
              disabled={exporting}
              onClick={() => runAction("copy")}
              className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied!" : "Copy as text"}</span>
            </button>
          </HealthTooltip>
          <HealthTooltip content="Open a print-ready Letter view for your printer">
            <button
              type="button"
              disabled={exporting}
              onClick={() => runAction("print")}
              className="h-9 px-3.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
          </HealthTooltip>
          <HealthTooltip content="Generate and download a Letter-size PDF right in your browser">
            <button
              type="button"
              disabled={exporting}
              onClick={() => runAction("pdf")}
              className="h-9 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              <span>Download PDF</span>
            </button>
          </HealthTooltip>
        </div>
      </div>
    </div>
  )
}
