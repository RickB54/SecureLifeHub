"use client"

import { useState } from "react"
import { Home, Star, Database, ListTodo, BarChart, FileText, ChevronsUpDown, SortAsc, X, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Database as DatabaseType, DbRecord } from "@/types/secure-database"
import { FavoritesView } from "@/components/secure-database/favorites-view"
import { DatabaseActions } from "@/components/secure-database/database-actions"
import { TodoView } from "@/components/secure-database/todo-view"
import { ReportsView } from "@/components/secure-database/reports-view"
import { InsightsView } from "@/components/secure-database/insights-view"

interface BottomMenuProps {
  currentDatabase?: DatabaseType
  favorites: DbRecord[]
  onSelectFavorite: (recordId: string) => void
  onToggleCollapseAll: () => void
  collapseAll: boolean
  onNewDatabase: () => void
  onDeleteDatabases: (databaseTitles: string[]) => void
  onRecoverDatabases: (databasesToRecover: DatabaseType[]) => void
  onUseTemplate: (template: DatabaseType) => void
  allDatabases: DatabaseType[]
  currentDb?: string
  onUpdateDatabase?: (database: DatabaseType) => void
  onResetToFactory: () => void
  onHomeClick?: () => void
  onSaveReport: (dbTitle: string, report: any) => void
  onGetReports: (dbTitle: string) => any[]
  onDeleteReport: (dbTitle: string, reportId: string) => void
  onOpenHelp?: (id: string) => void
  onSortClick?: (key: string) => void
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null
}

export function BottomNav({
  currentDatabase,
  favorites,
  onSelectFavorite,
  onToggleCollapseAll,
  collapseAll,
  onNewDatabase,
  onDeleteDatabases,
  onRecoverDatabases,
  onUseTemplate,
  allDatabases,
  currentDb,
  onUpdateDatabase,
  onResetToFactory,
  onSaveReport,
  onGetReports,
  onDeleteReport,
  onOpenHelp,
  onHomeClick,
  onSortClick,
  sortConfig,
}: BottomMenuProps) {
  const [activeView, setActiveView] = useState<string | null>(null)
  const [showSortOptions, setShowSortOptions] = useState(false)

  const handleMenuItemClick = (view: string) => {
    if (activeView === view) {
      setActiveView(null)
    } else {
      setActiveView(view)
    }
  }

  const menuItems = [
    { id: "home", label: "Home", icon: Home, view: null, color: "text-blue-400" },
    { id: "favorites", label: "Starred", icon: Star, view: "favorites", color: "text-amber-400", disabled: favorites.length === 0 },
    { id: "actions", label: "Actions", icon: Database, view: "actions", color: "text-indigo-400" },
    { id: "todo", label: "Tasks", icon: ListTodo, view: "todo", color: "text-emerald-400" },
    { id: "insights", label: "Insights", icon: BarChart, view: "insights", color: "text-rose-400", disabled: !currentDatabase },
    { id: "reports", label: "Reports", icon: FileText, view: "reports", color: "text-indigo-400", disabled: !currentDatabase },
  ]

  const sortOptions = currentDatabase 
    ? Array.from(new Set([...currentDatabase.fields.map(f => f.name), "Last Updated", "Creation Date"]))
    : ["Last Updated", "Creation Date"]

  return (
    <>
      {/* Active View Overlay */}
      {activeView && (
        <div className="fixed inset-x-0 bottom-16 top-16 bg-[#0a0a0a]/95 backdrop-blur-2xl z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="h-full max-w-5xl mx-auto border-x border-white/5 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-gray-400">
                    {activeView} Environment
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveView(null)} className="text-[10px] uppercase font-black tracking-tighter">Close View</Button>
            </div>
            
            <div className="flex-1 overflow-auto">
                {activeView === "favorites" && (
                    <FavoritesView
                    favorites={favorites}
                    onSelectFavorite={(id) => {
                        onSelectFavorite(id)
                        setActiveView(null)
                    }}
                    databases={allDatabases}
                    />
                )}

                {activeView === "actions" && (
                    <DatabaseActions
                    database={currentDatabase}
                    onNewDatabase={onNewDatabase}
                    onUseTemplate={onUseTemplate}
                    onDeleteDatabases={onDeleteDatabases}
                    onRecoverDatabases={onRecoverDatabases}
                    allDatabases={allDatabases}
                    currentDb={currentDb}
                    onUpdateDatabase={onUpdateDatabase}
                    onResetToFactory={onResetToFactory}
                    onOpenHelp={onOpenHelp}
                    />
                )}

                {activeView === "todo" && (
                    <TodoView 
                        databases={allDatabases.map((db) => db.title)} 
                        onOpenHelp={onOpenHelp}
                    />
                )}

                {activeView === "insights" && currentDatabase && (
                    <InsightsView 
                        database={currentDatabase} 
                        onOpenHelp={onOpenHelp}
                    />
                )}

                {activeView === "reports" && currentDatabase && (
                    <ReportsView 
                        database={currentDatabase} 
                        onSaveReport={onSaveReport}
                        onGetReports={onGetReports}
                        onDeleteReport={onDeleteReport}
                        onOpenHelp={onOpenHelp}
                    />
                )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom menu bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 bg-[#111]/90 backdrop-blur-xl z-50 px-2">
        <div className="max-w-xl mx-auto grid grid-cols-8 h-full items-center gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => {
                if (item.id === 'home' && onHomeClick) {
                  onHomeClick()
                }
                setActiveView(item.view)
              }}
              className={`flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all duration-300 ${
                activeView === item.view 
                  ? `bg-white/10 ${item.color} scale-110 shadow-[0_0_20px_rgba(255,255,255,0.05)]` 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              } ${item.disabled ? "opacity-20 grayscale cursor-not-allowed" : "cursor-pointer"}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}

          <button
            onClick={onToggleCollapseAll}
            className={`flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all duration-300 text-gray-500 hover:text-gray-300 hover:bg-white/5 ${collapseAll ? "bg-white/5 text-gray-300" : ""}`}
          >
            <ChevronsUpDown className={`h-5 w-5 transition-transform duration-500 ${collapseAll ? "rotate-180" : ""}`} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{collapseAll ? "Expand" : "Collapse"}</span>
          </button>

          <button
            onClick={() => setShowSortOptions(!showSortOptions)}
            disabled={!currentDatabase}
            className={`flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all duration-300 ${showSortOptions ? "bg-white/10 text-amber-400" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"} disabled:opacity-0 disabled:cursor-not-allowed`}
          >
            <SortAsc className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Sort</span>
          </button>

          {showSortOptions && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[320px] bg-[#1a1c23] border border-white/10 shadow-3xl rounded-3xl p-5 z-[60] animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white italic uppercase tracking-widest">Sort Records</h3>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowSortOptions(false)} className="h-6 w-6 rounded-full hover:bg-white/5 text-gray-500">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="space-y-2">
                    {sortOptions.map((opt) => (
                        <Button 
                            key={opt}
                            variant="ghost"
                            onClick={() => {
                                onSortClick?.(opt)
                            }}
                            className={`w-full justify-start h-12 rounded-xl bg-white/2 hover:bg-white/5 text-gray-400 hover:text-white font-bold transition-all border border-transparent ${sortConfig?.key === opt ? 'border-indigo-500/50 bg-indigo-500/5 text-indigo-400' : ''}`}
                        >
                            {opt}
                        </Button>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
