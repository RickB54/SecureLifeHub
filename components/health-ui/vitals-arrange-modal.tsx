"use client"

import React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, ArrowUp, ArrowDown, GripVertical, RotateCcw, SlidersHorizontal } from "lucide-react"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"

export interface ArrangeVitalItem {
  id: string
  title: string
  entryCount: number
  icon: React.ComponentType<{ className?: string }>
}

interface SortableVitalRowProps {
  item: ArrangeVitalItem
  isVisible: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleVisible: () => void
}

function SortableVitalRow({
  item,
  isVisible,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggleVisible,
}: SortableVitalRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const Icon = item.icon

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border transition-colors ${
        isDragging
          ? "bg-blue-500/15 border-blue-500/50 shadow-lg"
          : isVisible
          ? "bg-white/[0.03] border-white/10"
          : "bg-black/40 border-white/5 opacity-60"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <HealthTooltip content="Drag to reorder">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${item.title}`}
            className="p-1 rounded text-gray-500 hover:text-gray-200 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </HealthTooltip>

        <HealthTooltip content={isVisible ? `Hide ${item.title} on Vitals page` : `Show ${item.title} on Vitals page`}>
          <input
            type="checkbox"
            checked={isVisible}
            onChange={onToggleVisible}
            aria-label={`Show ${item.title}`}
            className="h-4 w-4 rounded border-gray-600 bg-black/60 text-blue-500 focus:ring-blue-500 cursor-pointer shrink-0"
          />
        </HealthTooltip>

        <Icon className="h-4 w-4 text-gray-400 shrink-0" />

        <span className="text-xs font-semibold text-gray-100 truncate">{item.title}</span>

        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-md border shrink-0 ${
            item.entryCount > 0
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
              : "bg-white/[0.03] border-white/10 text-gray-500"
          }`}
        >
          {item.entryCount > 0 ? `${item.entryCount}` : "Empty"}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <HealthTooltip content={`Move ${item.title} up`}>
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            aria-label={`Move ${item.title} up`}
            className="p-1 rounded-md bg-white/[0.04] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white cursor-pointer"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </HealthTooltip>
        <HealthTooltip content={`Move ${item.title} down`}>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            aria-label={`Move ${item.title} down`}
            className="p-1 rounded-md bg-white/[0.04] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white cursor-pointer"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </HealthTooltip>
      </div>
    </div>
  )
}

interface VitalsArrangeModalProps {
  isOpen: boolean
  onClose: () => void
  orderedAllIds: string[]
  customOrder: string[]
  hiddenSet: Set<string>
  entriesFirst: boolean
  itemsMap: Record<string, ArrangeVitalItem>
  onMove: (id: string, dir: "up" | "down") => void
  onSetCustomOrder: (nextOrder: string[]) => void
  onToggleHidden: (id: string) => void
  onSetEntriesFirst: (val: boolean) => void
  onReset: () => void
}

export function VitalsArrangeModal({
  isOpen,
  onClose,
  orderedAllIds,
  customOrder,
  hiddenSet,
  entriesFirst,
  itemsMap,
  onMove,
  onSetCustomOrder,
  onToggleHidden,
  onSetEntriesFirst,
  onReset,
}: VitalsArrangeModalProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!isOpen) return null

  const orderedItems = orderedAllIds.map((id) => itemsMap[id]).filter(Boolean)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeId = String(active.id)
    const overId = String(over.id)

    if (!entriesFirst) {
      const oldIdx = orderedAllIds.indexOf(activeId)
      const newIdx = orderedAllIds.indexOf(overId)
      if (oldIdx >= 0 && newIdx >= 0) {
        onSetCustomOrder(arrayMove(orderedAllIds, oldIdx, newIdx))
      }
      return
    }

    // When entriesFirst is ON, keep drag-reordering within the same group (with-entries or empty)
    const activeHas = (itemsMap[activeId]?.entryCount || 0) > 0
    const overHas = (itemsMap[overId]?.entryCount || 0) > 0
    if (activeHas !== overHas) return

    const groupIds = customOrder.filter((id) => ((itemsMap[id]?.entryCount || 0) > 0) === activeHas)
    const oldGroupIdx = groupIds.indexOf(activeId)
    const newGroupIdx = groupIds.indexOf(overId)
    if (oldGroupIdx < 0 || newGroupIdx < 0) return
    const reorderedGroup = arrayMove(groupIds, oldGroupIdx, newGroupIdx)

    let ptr = 0
    const nextBase = customOrder.map((id) => {
      if (((itemsMap[id]?.entryCount || 0) > 0) === activeHas) {
        return reorderedGroup[ptr++]
      }
      return id
    })
    onSetCustomOrder(nextBase)
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90dvh] flex flex-col bg-[#141418] border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold">Arrange Vitals</h3>
            <FieldHelpPopover
              title="Arrange & Show/Hide Vitals"
              content="Use the up/down arrows or drag handles to customize the order of your vitals. Uncheck any vital to hide it from the Vitals page. Your custom order is shared by the Vitals page, the PDF export checklist, and Expand/Collapse all, and saved only on this device."
            />
          </div>
          <HealthTooltip content="Close">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Arrange Vitals"
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </HealthTooltip>
        </div>

        {/* Entries-first toggle */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={entriesFirst}
              onChange={(e) => onSetEntriesFirst(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-black/60 text-blue-500 focus:ring-blue-500 cursor-pointer"
            />
            <span>Show vitals with entries first</span>
          </label>
          <FieldHelpPopover
            title="Show Vitals With Entries First"
            content="Places vitals that have logged readings on top and empty vitals below, while keeping your custom order inside each group."
          />
        </div>

        {/* Scrollable Vital List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {orderedItems.map((item, idx) => {
                const prevItem = idx > 0 ? orderedItems[idx - 1] : null
                const nextItem = idx < orderedItems.length - 1 ? orderedItems[idx + 1] : null
                const canMoveUp =
                  prevItem !== null &&
                  (!entriesFirst || (prevItem.entryCount > 0) === (item.entryCount > 0))
                const canMoveDown =
                  nextItem !== null &&
                  (!entriesFirst || (nextItem.entryCount > 0) === (item.entryCount > 0))

                const showEmptyDivider =
                  entriesFirst &&
                  item.entryCount === 0 &&
                  prevItem !== null &&
                  prevItem.entryCount > 0

                return (
                  <React.Fragment key={item.id}>
                    {showEmptyDivider && (
                      <div className="pt-2 pb-0.5 px-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Vitals with no entries
                      </div>
                    )}
                    <SortableVitalRow
                      item={item}
                      isVisible={!hiddenSet.has(item.id)}
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                      onMoveUp={() => onMove(item.id, "up")}
                      onMoveDown={() => onMove(item.id, "down")}
                      onToggleVisible={() => onToggleHidden(item.id)}
                    />
                  </React.Fragment>
                )
              })}
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 bg-black/30 flex items-center justify-between gap-2 shrink-0">
          <HealthTooltip content="Restore default vital order, show all vitals, and turn off entries-first">
            <button
              type="button"
              onClick={onReset}
              className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to default</span>
            </button>
          </HealthTooltip>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
