"use client"

import { useEffect } from "react"

import { SidebarHeader } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database } from "@/lib/types"
import { getDatabaseColor } from "@/lib/utils"

interface DatabaseSidebarProps {
  databases: Database[]
  currentDb: string
  onDatabaseSelect: (title: string) => void
  onNewDatabase: () => void
}

export function DatabaseSidebar({ databases, currentDb, onDatabaseSelect, onNewDatabase }: DatabaseSidebarProps) {
  // Debug logs
  useEffect(() => {
    console.log("DatabaseSidebar mounted")
    console.log("Databases:", databases)
    console.log("Current DB:", currentDb)
  }, [databases, currentDb])

  if (!databases || databases.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No databases available. Create one using the Database Actions menu.
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <SidebarHeader className="border-b px-4 py-2">
        <h2 className="text-lg font-semibold">Your Databases ({databases.length})</h2>
      </SidebarHeader>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-2">
          {databases.map((db) => {
            console.log(`Rendering database: ${db.title}, Records: ${db.records.length}`)
            const dbColor = getDatabaseColor(db.title)
            const isSelected = currentDb === db.title

            return (
              <button
                key={db.title}
                onClick={() => {
                  console.log("Database selected:", db.title)
                  onDatabaseSelect(db.title)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1 transition-colors
                  ${
                    isSelected
                      ? `${dbColor.selected} ${dbColor.text} border ${dbColor.border}`
                      : `${dbColor.hover} border border-transparent`
                  }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${dbColor.accent}`}
                  style={{
                    minWidth: "0.75rem",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                ></div>
                <span className="truncate">{db.title}</span>
                <span
                  className={`ml-auto text-xs ${isSelected ? dbColor.text : "text-muted-foreground"}`}
                  style={{ display: "inline-block", minWidth: "1rem" }}
                >
                  {db.records.length}
                </span>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

