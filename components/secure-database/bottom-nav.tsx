"use client"

import { useState } from "react"
import { Home, Star, Database, ListTodo, BarChart, FileText, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Database as DatabaseType, DbRecord } from "@/types/secure-database"
import { FavoritesView } from "./favorites-view"
import { DatabaseActions } from "./database-actions"
import { TodoView } from "./todo-view"
import { ReportsView } from "./reports-view"
import { InsightsView } from "./insights-view"

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
  onSaveReport: (dbTitle: string, report: any) => void
  onGetReports: (dbTitle: string) => any[]
  onDeleteReport: (dbTitle: string, reportId: string) => void
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
}: BottomMenuProps) {
  const [activeView, setActiveView] = useState<string | null>(null)

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
                    onSelectFavorite={onSelectFavorite}
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
                    />
                )}

                {activeView === "todo" && (
                    <TodoView databases={allDatabases.map((db) => db.title)} />
                )}

                {activeView === "insights" && currentDatabase && (
                    <InsightsView database={currentDatabase} />
                )}

                {activeView === "reports" && currentDatabase && (
                    <ReportsView 
                        database={currentDatabase} 
                        onSaveReport={onSaveReport}
                        onGetReports={onGetReports}
                        onDeleteReport={onDeleteReport}
                    />
                )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom menu bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 bg-[#111]/90 backdrop-blur-xl z-50 px-2">
        <div className="max-w-xl mx-auto grid grid-cols-7 h-full items-center gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => setActiveView(item.view)}
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
        </div>
      </div>
    </>
  )
}
