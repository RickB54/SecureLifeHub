"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { ChevronDown, Search, Plus, Check, X } from "lucide-react"
import {
  SMART_FIELD_DEFAULTS,
  SmartFieldKey,
  SmartOptionInput,
  SmartOptionItem,
  normalizeOptionItem,
  useCustomFieldOptions,
} from "@/lib/health-field-defaults"
import { HealthTooltip } from "./health-tooltip"

export interface SmartSelectProps {
  fieldKey: SmartFieldKey | string
  value: string
  onChange: (value: string) => void
  defaults?: SmartOptionInput[]
  previousValues?: string[]
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  compact?: boolean
  allowClear?: boolean
  disabled?: boolean
  className?: string
  triggerClassName?: string
  tooltip?: string
  icon?: React.ReactNode
}

/**
 * Shared SmartSelect / ComboField used across Health Hub:
 * 1) Built-in default options for the field
 * 2) Previously used values (from loaded data + localStorage custom options with removable "x")
 * 3) Final "+ Custom..." item to type & save any new value locally
 * Rendered in a Radix Popover Portal so the list is NEVER clipped inside modals or overflow containers.
 */
export function SmartSelect({
  fieldKey,
  value,
  onChange,
  defaults,
  previousValues = [],
  name,
  label,
  placeholder = "Select or type...",
  required = false,
  compact = false,
  allowClear = false,
  disabled = false,
  className = "",
  triggerClassName = "",
  tooltip,
  icon,
}: SmartSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [addingCustom, setAddingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)

  const { customOptions, addOption, removeOption } = useCustomFieldOptions(fieldKey)

  const builtInItems = useMemo<SmartOptionItem[]>(() => {
    const raw =
      defaults !== undefined
        ? defaults
        : (SMART_FIELD_DEFAULTS as Record<string, SmartOptionInput[]>)[fieldKey] || []
    return raw.map(normalizeOptionItem)
  }, [defaults, fieldKey])

  // Build ordered deduplicated lists: (a) Built-in defaults, then (b) Used before / Custom saved in localStorage
  const { defaultList, savedAndPrevList, allVisibleItems } = useMemo(() => {
    const seen = new Set<string>()
    const defList: Array<SmartOptionItem & { isCustomRemovable: boolean; group: "default" | "saved" }> = []
    const prevList: Array<SmartOptionItem & { isCustomRemovable: boolean; group: "default" | "saved" }> = []
    const customLowSet = new Set(customOptions.map((c) => c.toLowerCase()))

    for (const item of builtInItems) {
      const k = item.value.trim().toLowerCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      defList.push({ ...item, isCustomRemovable: false, group: "default" })
    }

    // Custom options saved in localStorage (removable with "x")
    for (const c of customOptions) {
      const clean = c.trim()
      const k = clean.toLowerCase()
      if (!clean || seen.has(k)) continue
      seen.add(k)
      prevList.push({ value: clean, label: clean, isCustomRemovable: true, group: "saved" })
    }

    // Previously used values from already-loaded records (zero extra queries)
    for (const p of previousValues) {
      const clean = String(p || "").trim()
      const k = clean.toLowerCase()
      if (!clean || seen.has(k)) continue
      seen.add(k)
      prevList.push({
        value: clean,
        label: clean,
        isCustomRemovable: customLowSet.has(k),
        group: "saved",
      })
    }

    const q = search.trim().toLowerCase()
    const matches = (item: SmartOptionItem) =>
      !q || item.label.toLowerCase().includes(q) || item.value.toLowerCase().includes(q)

    const filteredDef = defList.filter(matches)
    const filteredPrev = prevList.filter(matches)
    return {
      defaultList: filteredDef,
      savedAndPrevList: filteredPrev,
      allVisibleItems: [...filteredDef, ...filteredPrev],
    }
  }, [builtInItems, customOptions, previousValues, search])

  // Resolve display label for currently selected value
  const displayLabel = useMemo(() => {
    const clean = (value || "").trim()
    if (!clean) return ""
    const matchBuiltIn = builtInItems.find(
      (b) => b.value.toLowerCase() === clean.toLowerCase() || b.label.toLowerCase() === clean.toLowerCase()
    )
    return matchBuiltIn ? matchBuiltIn.label : clean
  }, [value, builtInItems])

  useEffect(() => {
    if (open) {
      setSearch("")
      setAddingCustom(false)
      setCustomDraft("")
      setActiveIndex(0)
      window.setTimeout(() => searchInputRef.current?.focus(), 20)
    }
  }, [open])

  useEffect(() => {
    if (addingCustom) {
      window.setTimeout(() => customInputRef.current?.focus(), 20)
    }
  }, [addingCustom])

  const selectValue = (val: string) => {
    onChange(val)
    setOpen(false)
  }

  const commitCustomValue = (rawVal: string) => {
    const clean = rawVal.trim()
    if (!clean) {
      setAddingCustom(false)
      return
    }
    const isBuiltIn = builtInItems.some(
      (b) => b.value.toLowerCase() === clean.toLowerCase() || b.label.toLowerCase() === clean.toLowerCase()
    )
    if (!isBuiltIn) {
      addOption(clean)
    }
    onChange(clean)
    setAddingCustom(false)
    setCustomDraft("")
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (addingCustom) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(allVisibleItems.length - 1, prev + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(0, prev - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const chosen = allVisibleItems[activeIndex]
      if (chosen) {
        selectValue(chosen.value)
      } else if (search.trim()) {
        commitCustomValue(search)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const triggerButton = (
    <PopoverPrimitive.Trigger asChild>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={
          triggerClassName ||
          (compact
            ? `w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-left flex items-center justify-between gap-2 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer disabled:opacity-50`
            : `w-full px-3.5 py-2.5 bg-[#24242a] hover:bg-[#2a2a32] border border-white/15 rounded-xl text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-50`)
        }
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          <span className={`truncate ${displayLabel ? "text-white font-medium" : "text-gray-500"}`}>
            {displayLabel || placeholder}
          </span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {allowClear && value && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
              className="p-0.5 rounded hover:bg-white/15 text-gray-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180 text-blue-400" : ""}`} />
        </span>
      </button>
    </PopoverPrimitive.Trigger>
  )

  return (
    <div className={`space-y-1 min-w-0 ${className}`}>
      {label && (
        <label
          className={
            compact
              ? "text-slate-400 font-semibold text-xs block"
              : "text-[11px] font-bold uppercase tracking-wider text-gray-400 block"
          }
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Hidden input so native FormData forms work seamlessly */}
      {name && <input type="hidden" name={name} value={value || ""} />}

      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {tooltip ? <HealthTooltip content={tooltip}>{triggerButton}</HealthTooltip> : triggerButton}

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={12}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            style={{ width: "var(--radix-popover-trigger-width)", minWidth: "220px", maxWidth: "calc(100vw - 24px)" }}
            className="z-[100200] rounded-xl border border-white/15 bg-[#151822] text-white shadow-2xl outline-none overflow-hidden animate-in fade-in-0 zoom-in-95"
          >
            {/* Search input */}
            <div className="p-2 border-b border-white/10">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setActiveIndex(0)
                  }}
                  placeholder="Search options..."
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Scrollable Options List */}
            <div role="listbox" className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
              {/* (a) Built-in Default Options */}
              {defaultList.length > 0 && (
                <div>
                  <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                    Options
                  </div>
                  {defaultList.map((item) => {
                    const isSelected =
                      value.trim().toLowerCase() === item.value.trim().toLowerCase()
                    const flatIdx = allVisibleItems.findIndex(
                      (x) => x.value.toLowerCase() === item.value.toLowerCase()
                    )
                    return (
                      <button
                        key={`def-${item.value}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => selectValue(item.value)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/30 text-blue-100 font-semibold"
                            : flatIdx === activeIndex
                            ? "bg-white/10 text-white"
                            : "text-gray-200 hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* (b) Previously Used & Saved Custom Options (custom ones have "x" to remove) */}
              {savedAndPrevList.length > 0 && (
                <div className={defaultList.length > 0 ? "pt-1 border-t border-white/10" : ""}>
                  <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300/80">
                    Your Options &amp; Recently Used
                  </div>
                  {savedAndPrevList.map((item) => {
                    const isSelected =
                      value.trim().toLowerCase() === item.value.trim().toLowerCase()
                    const flatIdx = allVisibleItems.findIndex(
                      (x) => x.value.toLowerCase() === item.value.toLowerCase()
                    )
                    return (
                      <div
                        key={`prev-${item.value}`}
                        className={`flex items-center justify-between gap-1 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-blue-600/30 text-blue-100 font-semibold"
                            : flatIdx === activeIndex
                            ? "bg-white/10 text-white"
                            : "text-gray-200 hover:bg-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => selectValue(item.value)}
                          className="flex-1 min-w-0 text-left px-2.5 py-1.5 text-xs flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span className="truncate">{item.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                        </button>
                        {item.isCustomRemovable && (
                          <HealthTooltip content="Remove from this list (does not change existing records)">
                            <button
                              type="button"
                              aria-label={`Remove custom option ${item.label}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                removeOption(item.value)
                              }}
                              className="p-1.5 mr-0.5 rounded-md text-gray-400 hover:text-red-300 hover:bg-red-500/20 cursor-pointer shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </HealthTooltip>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Quick create from search query if no exact match */}
              {search.trim() &&
                !allVisibleItems.some(
                  (i) =>
                    i.value.toLowerCase() === search.trim().toLowerCase() ||
                    i.label.toLowerCase() === search.trim().toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={() => commitCustomValue(search)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-200 bg-purple-600/20 hover:bg-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Use &ldquo;{search.trim()}&rdquo;</span>
                  </button>
                )}
            </div>

            {/* (c) Final "+ Custom..." Action */}
            <div className="p-1.5 border-t border-white/10 bg-black/30">
              {addingCustom ? (
                <div className="flex items-center gap-1.5">
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        commitCustomValue(customDraft)
                      } else if (e.key === "Escape") {
                        e.stopPropagation()
                        setAddingCustom(false)
                        setCustomDraft("")
                      }
                    }}
                    placeholder="Type custom option..."
                    className="flex-1 h-8 px-2.5 rounded-lg bg-black/60 border border-purple-500 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => commitCustomValue(customDraft)}
                    className="h-8 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCustomDraft(search.trim())
                    setAddingCustom(true)
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-purple-300 hover:text-purple-200 hover:bg-purple-500/15 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>+ Custom...</span>
                </button>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}
