"use client"

import { Database as DatabaseIcon, Plus, ChevronRight, GripVertical } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/secure-database"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DatabaseSidebarProps {
  databases: Database[]
  currentDb: string
  onDatabaseSelect: (title: string) => void
  onNewDatabase: () => void
  onReorder?: (databases: Database[]) => void
}

export function DatabaseSidebar({ databases, currentDb, onDatabaseSelect, onNewDatabase, onReorder }: DatabaseSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = databases.findIndex((db) => (db.id || db.title) === active.id);
      const newIndex = databases.findIndex((db) => (db.id || db.title) === over?.id);

      if (onReorder) {
        onReorder(arrayMove(databases, oldIndex, newIndex));
      }
    }
  };

  if (!databases || databases.length === 0) {
    // ... same as before
    return (
      <div className="p-8 text-center bg-[#0a0a0a] h-full flex flex-col justify-center border-r border-white/5">
        <DatabaseIcon className="h-10 w-10 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest text-[10px]">No Architectures Found</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewDatabase}
          className="mt-6 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all rounded-xl font-black uppercase text-[10px] tracking-widest"
        >
          Initialize First DB
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[300px] bg-[#0d0d0d] border-r border-white/5 flex flex-col h-full animate-in slide-in-from-left duration-500">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black text-white tracking-tight">Your Databases ({databases.length})</h2>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={onNewDatabase}
                className="h-7 w-7 rounded-lg bg-white/5 text-gray-500 hover:bg-indigo-500 hover:text-white transition-all"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <div className="h-0.5 w-12 bg-indigo-500 rounded-full" />
      </div>

      <ScrollArea className="flex-1 px-1 py-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={databases.map(db => db.id || db.title)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0.5">
              {databases.map((db) => (
                <SortableDatabaseItem 
                  key={db.id || db.title}
                  db={db}
                  isSelected={currentDb === db.title}
                  onDatabaseSelect={onDatabaseSelect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>

      <div className="p-6 border-t border-white/5">
         <div className="rounded-2xl p-4 bg-white/2 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <DatabaseIcon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                    <p className="text-[10px] text-white font-black uppercase tracking-tighter">Central Hub</p>
                    <p className="text-[9px] text-gray-600 font-bold leading-none mt-0.5 whitespace-nowrap">ACTIVE ARCHITECTURE</p>
                </div>
            </div>
            <ChevronRight className="h-3 w-3 text-gray-700 group-hover:text-indigo-400 transition-colors" />
         </div>
      </div>
    </div>
  )
}

const colorDotMap: { [key: string]: string } = {
  emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
  green: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]",
  teal: "bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]",
  cyan: "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
  indigo: "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
  rose: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]",
  red: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
  amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
  blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
  pink: "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]",
  purple: "bg-purple-500 shadow-[0_0_10px_rgba(168, 85, 247, 0.3)]",
}

function SortableDatabaseItem({ db, isSelected, onDatabaseSelect }: { db: Database, isSelected: boolean, onDatabaseSelect: (title: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: db.id || db.title });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  const dotClass = colorDotMap[db.color || 'indigo']

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <button
        onClick={() => onDatabaseSelect(db.title)}
        className={`w-full group relative flex items-center gap-3 px-5 py-3.5 transition-all duration-300
          ${
            isSelected
              ? `bg-emerald-600 shadow-[0_4px_20px_rgba(16,185,129,0.2)] text-white`
              : `text-gray-500 hover:text-gray-200 hover:bg-white/2`
          }`}
      >
        {/* Drag Handle */}
        <div {...listeners} className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 transition-opacity">
            <GripVertical className="h-3 w-3" />
        </div>

        {/* Active Indicator Bar */}
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/40" />
        )}

        <div className={`w-2 h-2 rounded-full shrink-0 transition-transform duration-300 ${isSelected ? 'bg-white' : dotClass} ${isSelected ? 'scale-110' : 'group-hover:scale-125 opacity-70 group-hover:opacity-100'}`} />
        
        <span className={`flex-1 text-left truncate text-xs font-bold tracking-tight ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
          {db.title}
        </span>

        <div className={`flex items-center gap-1.5`}>
          <span className={`text-[11px] font-black font-mono transition-all duration-300
            ${isSelected 
              ? 'text-white' 
              : 'text-gray-600 group-hover:text-gray-400'
            }`}
          >
            {db.records.length}
          </span>
        </div>
      </button>
    </div>
  );
}
