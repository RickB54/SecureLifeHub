"use client"

import { Star, ChevronRight, Database, Clock, ArrowRight } from "lucide-react"
import type { Database as DatabaseType, DbRecord } from "@/types/secure-database"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

interface FavoritesViewProps {
  favorites: DbRecord[]
  onSelectFavorite: (recordId: string) => void
  databases: DatabaseType[]
}

export function FavoritesView({ favorites, onSelectFavorite, databases }: FavoritesViewProps) {
  const getDatabaseForRecord = (recordId: string) => {
    return databases.find(db => db.records.some(r => r.id === recordId))
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full gap-6">
        <div className="w-24 h-24 bg-amber-400/10 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
            <Star className="w-12 h-12 text-amber-400 fill-current opacity-50" />
        </div>
        <div className="max-w-xs space-y-2">
            <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Star your mission-critical data</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Click the star icon on any record to pin it here for instant access across your secure hub.
            </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
        <div className="p-8 bg-gradient-to-b from-amber-400/10 to-transparent border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Starred Records</h2>
                <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
                    <Star className="h-5 w-5 text-amber-400 fill-current" />
                </div>
            </div>
            <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest leading-none">High Priority Data Stream</p>
        </div>

        <ScrollArea className="flex-1 p-6">
            <div className="max-w-xl mx-auto space-y-4">
                {favorites.map((record) => {
                    const db = getDatabaseForRecord(record.id)
                    return (
                        <button
                            key={record.id}
                            onClick={() => onSelectFavorite(record.id)}
                            className="group w-full flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-400/40 transition-all duration-300 text-left relative overflow-hidden"
                        >
                            {/* Background Number */}
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl font-black text-white/5 italic select-none group-hover:text-amber-400/10 transition-colors">
                                #{record.id.split('-')[0].substring(0, 3)}
                            </span>

                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 group-hover:scale-110 transition-transform relative z-10 shadow-lg">
                                <Database className="h-6 w-6 text-indigo-400" />
                            </div>

                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-bold text-gray-100 group-hover:text-amber-400 transition-colors truncate">
                                        {record.values[db?.fields[0].name || ""] || "Untitled Record"}
                                    </h4>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                                    <span className="flex items-center gap-1 text-indigo-400">
                                        <ChevronRight className="h-3 w-3" />
                                        {db?.title || "Unknown DB"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Pinned {format(new Date(record.created), "MMM d")}
                                    </span>
                                </div>
                            </div>

                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-amber-400 group-hover:text-black transition-all rotate-0 group-hover:rotate-45 relative z-10">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </button>
                    )
                })}
            </div>
        </ScrollArea>
    </div>
  )
}
