"use client"

import { useState } from "react"
import { Home, Star, Database, ListTodo, BarChart, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FavoritesView } from "./favorites-view"
import { DatabaseActions } from "./database-actions"
import { TodoView } from "./todo-view"
import { ReportsView } from "./reports-view"
import type { Database as DatabaseType, Record } from "@/lib/types"

interface BottomMenuProps {
  currentDatabase?: DatabaseType
  favorites: Record[]
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
}

export function BottomMenu({
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
}: BottomMenuProps) {
  const [activeView, setActiveView] = useState<string | null>(null)

  const handleMenuItemClick = (view: string) => {
    // If clicking the active view, go back to home view
    if (activeView === view) {
      setActiveView(null)
    } else {
      setActiveView(view)
    }
  }

  return (
    <>
      {/* Main content area above the bottom menu */}
      <div className="fixed inset-0 pt-16 pb-16 z-10 pointer-events-none">
        {activeView && (
          <div className="w-full h-full bg-background pointer-events-auto overflow-hidden">
            {activeView === "favorites" && (
              <div className="h-full overflow-auto">
                <FavoritesView
                  favorites={favorites}
                  onSelectFavorite={onSelectFavorite}
                  databases={allDatabases} // Add this line
                />
              </div>
            )}

            {activeView === "actions" && (
              <div className="h-full overflow-auto">
                <DatabaseActions
                  database={currentDatabase}
                  onNewDatabase={onNewDatabase}
                  onUseTemplate={onUseTemplate}
                  onDeleteDatabases={onDeleteDatabases}
                  onRecoverDatabases={onRecoverDatabases}
                  allDatabases={allDatabases}
                  currentDb={currentDb}
                  onUpdateDatabase={onUpdateDatabase}
                />
              </div>
            )}

            {activeView === "todo" && (
              <div className="h-full overflow-auto">
                <TodoView databases={allDatabases.map((db) => db.title)} />
              </div>
            )}

            {activeView === "reports" && currentDatabase && (
              <div className="h-full overflow-auto">
                <ReportsView database={currentDatabase} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom menu bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background z-20">
        <div className="grid grid-cols-6 h-full">
          <Button
            variant="ghost"
            className={`h-full rounded-none flex flex-col items-center justify-center ${
              activeView === null ? "text-primary border-t-2 border-primary" : ""
            }`}
            onClick={() => setActiveView(null)}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>

          <Button
            variant="ghost"
            className={`h-full rounded-none flex flex-col items-center justify-center ${
              activeView === "favorites" ? "text-primary border-t-2 border-primary" : ""
            }`}
            onClick={() => handleMenuItemClick("favorites")}
            disabled={favorites.length === 0}
          >
            <Star className="h-5 w-5" />
            <span className="text-xs mt-1">Favorites</span>
          </Button>

          <Button
            variant="ghost"
            className={`h-full rounded-none flex flex-col items-center justify-center ${
              activeView === "actions" ? "text-primary border-t-2 border-primary" : ""
            }`}
            onClick={() => handleMenuItemClick("actions")}
          >
            <Database className="h-5 w-5" />
            <span className="text-xs mt-1">Actions</span>
          </Button>

          <Button
            variant="ghost"
            className={`h-full rounded-none flex flex-col items-center justify-center ${
              activeView === "todo" ? "text-primary border-t-2 border-primary" : ""
            }`}
            onClick={() => handleMenuItemClick("todo")}
          >
            <ListTodo className="h-5 w-5" />
            <span className="text-xs mt-1">Todo</span>
          </Button>

          <Button
            variant="ghost"
            className={`h-full rounded-none flex flex-col items-center justify-center ${
              activeView === "reports" ? "text-primary border-t-2 border-primary" : ""
            }`}
            onClick={() => handleMenuItemClick("reports")}
            disabled={!currentDatabase}
          >
            <BarChart className="h-5 w-5" />
            <span className="text-xs mt-1">Reports</span>
          </Button>

          <Button
            variant="ghost"
            className="h-full rounded-none flex flex-col items-center justify-center"
            onClick={onToggleCollapseAll}
          >
            <ChevronsUpDown className="h-5 w-5" />
            <span className="text-xs mt-1">Collapse</span>
          </Button>
        </div>
      </div>
    </>
  )
}

