"use client"

import { Database as DatabaseIcon, Plus, Layout, Folder, ChevronRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/secure-database"

interface DatabaseSidebarProps {
  databases: Database[]
  currentDb: string
  onDatabaseSelect: (title: string) => void
  onNewDatabase: () => void
}

export function DatabaseSidebar({ databases, currentDb, onDatabaseSelect, onNewDatabase }: DatabaseSidebarProps) {
  if (!databases || databases.length === 0) {
    return (
      <div className="p-8 text-center bg-[#0d0d0d] h-full flex flex-col justify-center border-r border-white/5">
        <DatabaseIcon className="h-10 w-10 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No Databases</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewDatabase}
          className="mt-6 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
        >
          Create First
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[280px] bg-[#0d0d0d] border-r border-white/5 flex flex-col h-full animate-in slide-in-from-left duration-500">
      <div className="p-6 border-b border-white/5 bg-[#111]">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Collections</h2>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={onNewDatabase}
                className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Layout className="h-5 w-5 text-indigo-400" />
             </div>
             <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Total Library</p>
                <p className="text-xl font-black text-white leading-none mt-1">{databases.length}</p>
             </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1.5">
          {databases.map((db) => {
            const isSelected = currentDb === db.title
            
            return (
              <button
                key={db.title}
                onClick={() => onDatabaseSelect(db.title)}
                className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 overflow-hidden
                  ${
                    isSelected
                      ? `bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-[1.02] z-10`
                      : `text-gray-500 hover:text-gray-200 hover:bg-white/5`
                  }`}
              >
                {/* Active Indicator */}
                {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white animate-pulse" />
                )}

                <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Folder className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-indigo-400/70 group-hover:text-indigo-400'}`} />
                </div>
                
                <span className={`flex-1 text-left truncate font-bold tracking-tight ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {db.title}
                </span>

                <div className={`flex items-center gap-1.5 ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                    <span className="text-[10px] font-mono font-black">{db.records.length}</span>
                    <ChevronRight className={`h-3 w-3 transition-transform duration-300 ${isSelected ? 'translate-x-0.5' : 'opacity-0 group-hover:opacity-100'}`} />
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/5 bg-[#111]/50 backdrop-blur-sm">
         <div className="rounded-xl p-3 bg-gradient-to-r from-indigo-500/10 to-transparent border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <DatabaseIcon className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter truncate">Engine Version</p>
                <p className="text-[10px] text-white font-bold leading-none mt-0.5">SLH-DB-2.0-STABLE</p>
            </div>
         </div>
      </div>
    </div>
  )
}
