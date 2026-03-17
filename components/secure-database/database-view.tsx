"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  Star, 
  Edit2, 
  Copy, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database as DatabaseType, DbRecord } from "@/types/secure-database"
import { format } from "date-fns"

interface DatabaseViewProps {
  database?: DatabaseType
  searchQuery: string
  onDatabaseUpdate: (db: DatabaseType) => void
  onDuplicateRecord: (record: DbRecord) => void
  collapseAll: boolean
}

export function DatabaseView({ 
  database, 
  searchQuery, 
  onDatabaseUpdate, 
  onDuplicateRecord,
  collapseAll 
}: DatabaseViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({})

  const filteredRecords = useMemo(() => {
    if (!database) return []
    if (!searchQuery) return database.records

    const query = searchQuery.toLowerCase()
    return database.records.filter(record => 
      Object.values(record.values).some(val => 
        String(val).toLowerCase().includes(query)
      )
    )
  }, [database, searchQuery])

  const toggleFavorite = (recordId: string) => {
    if (!database) return
    const updatedRecords = database.records.map(r => 
      r.id === recordId ? { ...r, isFavorite: !r.isFavorite } : r
    )
    onDatabaseUpdate({ ...database, records: updatedRecords })
  }

  const deleteRecord = (recordId: string) => {
    if (!database) return
    const updatedRecords = database.records.filter(r => r.id !== recordId)
    onDatabaseUpdate({ ...database, records: updatedRecords })
  }

  if (!database) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
            <Database className="w-8 h-8 text-indigo-400 opacity-50" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-300">No Database Selected</h3>
        <p className="text-gray-500 max-w-xs">Select a database from the sidebar or bottom menu to view and manage your records.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
             {filteredRecords.length} Records
           </Badge>
           {searchQuery && (
             <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                Filtered Results
             </Badge>
           )}
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
             <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-lg ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-200'}`}
                onClick={() => setViewMode('list')}
             >
                <List className="h-4 w-4" />
             </Button>
             <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-200'}`}
                onClick={() => setViewMode('grid')}
             >
                <LayoutGrid className="h-4 w-4" />
             </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <div 
              key={record.id}
              className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300"
            >
                <div className="flex items-center p-4 gap-4">
                     <button 
                        onClick={() => toggleFavorite(record.id)}
                        className={`transition-colors ${record.isFavorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400/50'}`}
                     >
                        <Star className={`h-5 w-5 ${record.isFavorite ? 'fill-current' : ''}`} />
                     </button>

                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-200 truncate">
                                {record.values[database.fields[0].name] || "Untitled Record"}
                            </h4>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                             <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(record.created), "MMM d, yyyy")}
                             </div>
                             {Object.entries(record.values).slice(1, 3).map(([key, value]) => (
                                 <div key={key} className="hidden sm:block truncate">
                                    <span className="text-indigo-400/50 uppercase font-black tracking-tighter mr-1">{key}:</span>
                                    {String(value)}
                                 </div>
                             ))}
                        </div>
                     </div>

                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
                            <Edit2 className="h-4 w-4" />
                         </Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-white/10 text-white shadow-2xl">
                                <DropdownMenuItem onClick={() => onDuplicateRecord(record)} className="gap-2 focus:bg-white/10 cursor-pointer">
                                    <Copy className="h-4 w-4 text-blue-400" />
                                    <span>Duplicate Record</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem onClick={() => deleteRecord(record.id)} className="gap-2 focus:bg-rose-500/20 text-rose-400 cursor-pointer">
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Record</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                     </div>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredRecords.map((record) => (
             <div 
                key={record.id}
                className="group bg-[#111] border border-white/5 rounded-3xl p-5 flex flex-col gap-4 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden"
             >
                {/* Background Glow */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

                <div className="flex items-start justify-between relative z-10">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                        <Database className="h-6 w-6 text-indigo-400" />
                    </div>
                    <button 
                        onClick={() => toggleFavorite(record.id)}
                        className={`p-2 rounded-xl transition-all ${record.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-gray-600 hover:text-amber-400/50 hover:bg-white/5'}`}
                     >
                        <Star className={`h-5 w-5 ${record.isFavorite ? 'fill-current' : ''}`} />
                     </button>
                </div>

                <div className="flex-1 relative z-10">
                    <h4 className="text-lg font-bold text-gray-100 mb-1 line-clamp-1">
                         {record.values[database.fields[0].name] || "Untitled Record"}
                    </h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-4">
                        Ref: {record.id.split('-')[0]}
                    </p>

                    <div className="space-y-2">
                        {Object.entries(record.values).slice(1, 4).map(([key, value]) => (
                             <div key={key} className="flex items-center justify-between py-1.5 border-b border-white/5">
                                <span className="text-[10px] text-gray-500 uppercase font-black">{key}</span>
                                <span className="text-[11px] text-gray-300 font-medium truncate ml-4 max-w-[120px]">{String(value)}</span>
                             </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 relative z-10 mt-2">
                    <Button variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-xs h-9 rounded-xl">View Details</Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteRecord(record.id)} className="h-9 w-9 text-gray-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
             </div>
           ))}
        </div>
      )}

      {filteredRecords.length === 0 && (
         <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-gray-600" />
            </div>
            <p className="text-gray-500 font-bold tracking-tight">No records match your search criteria</p>
            <Button variant="link" onClick={() => {}} className="text-indigo-400 text-xs mt-2">Clear filters</Button>
         </div>
      )}
    </div>
  )
}
