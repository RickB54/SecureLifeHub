"use client"

import { useState, useCallback, useMemo } from "react"
import { Database as DatabaseIcon, Search, Plus, HelpCircle, Menu } from "lucide-react"
import { useSecureDatabase } from "@/hooks/use-secure-database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database, DbRecord } from "@/types/secure-database"
import { useTodo } from "@/hooks/use-todo"
import { DatabaseSidebar } from "./database-sidebar"
import { DatabaseView } from "./database-view"
import { FavoritesView } from "./favorites-view"
import { TodoView } from "./todo-view"
import { ReportsView } from "./reports-view"
import { DatabaseActions } from "./database-actions"
import { FormBuilder } from "./form-builder"
import { RecordForm } from "./record-form"

import { toast } from "sonner"
import { BottomNav } from "./bottom-nav"

interface SecureDatabaseProps {
  onOpenHelp?: (targetId?: string) => void
}

export default function SecureDatabase({ onOpenHelp }: SecureDatabaseProps) {
  const { databases, updateDatabase, addDatabase, duplicateRecord, deleteDatabases, recoverDatabases, initialized } =
    useSecureDatabase()
  
  const [currentDb, setCurrentDb] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFormBuilder, setShowFormBuilder] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DbRecord | null>(null)
  const [collapseAll, setCollapseAll] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  const currentDatabase = useMemo(() => databases.find((db) => db.title === currentDb), [databases, currentDb])

  const handleSelectDatabase = useCallback((title: string) => {
    setCurrentDb(title)
    setShowFormBuilder(false)
    setShowAddRecord(false)
    setEditingRecord(null)
  }, [])

  const handleAddRecord = () => {
    setEditingRecord(null)
    setShowAddRecord(true)
  }

  const handleEditRecord = (record: DbRecord) => {
    setEditingRecord(record)
    setShowAddRecord(true)
  }

  const handleRecordSubmit = (values: { [key: string]: any }) => {
    if (!currentDatabase) return

    const updatedRecords = [...currentDatabase.records]
    if (editingRecord) {
      const index = updatedRecords.findIndex((r) => r.id === editingRecord.id)
      if (index !== -1) {
        updatedRecords[index] = {
          ...editingRecord,
          values,
          lastUpdated: new Date().toISOString(),
        }
      }
    } else {
      const newRecord: DbRecord = {
        id: crypto.randomUUID(),
        values,
        isFavorite: false,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }
      updatedRecords.push(newRecord)
    }

    updateDatabase({ ...currentDatabase, records: updatedRecords })
    setShowAddRecord(false)
    setEditingRecord(null)
    toast.success(editingRecord ? "Entry updated" : "Entry added to kolektion")
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-t-2 border-r-2 border-indigo-500 rounded-full animate-spin"></div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400">Initializing Engine</p>
            <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Loading secure data structures...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Header Area */}
      <div className="flex h-16 shrink-0 items-center px-6 gap-4 border-b border-white/5 bg-[#111]/80 backdrop-blur-xl z-20">
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 text-gray-400">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r border-white/10 bg-[#0a0a0a] w-80">
            <DatabaseSidebar 
              databases={databases} 
              currentDb={currentDb} 
              onDatabaseSelect={(title: string) => {
                  handleSelectDatabase(title)
                  setMobileSheetOpen(false)
              }} 
              onNewDatabase={() => {
                  setShowFormBuilder(true)
                  setMobileSheetOpen(false)
              }}
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <DatabaseIcon className="h-5 w-5" />
          </div>
          <div className="truncate">
            <h2 className="text-lg font-bold tracking-tight truncate">{currentDb || "Central Database"}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-none">High Fidelity Data Environment</p>
          </div>
        </div>

        <div className="relative max-w-sm w-full hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search active collection..."
            className="h-10 pl-10 bg-white/5 border-white/5 focus:border-indigo-500/50 text-xs font-bold transition-all rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex bg-indigo-500 hover:bg-indigo-600 text-white border-none h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95"
                onClick={handleAddRecord}
                disabled={!currentDatabase || showFormBuilder || showAddRecord}
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white"
                onClick={() => onOpenHelp?.("secure-database")}
            >
                <HelpCircle className="h-5 w-5" />
            </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 shrink-0 border-r border-white/5 bg-[#111]/40">
          <DatabaseSidebar 
            databases={databases} 
            currentDb={currentDb} 
            onDatabaseSelect={handleSelectDatabase} 
            onNewDatabase={() => setShowFormBuilder(true)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <ScrollArea className="flex-1">
            <div className="p-6 md:p-8 max-w-6xl mx-auto pb-32">
                {showFormBuilder ? (
                    <FormBuilder 
                        open={showFormBuilder}
                        onOpenChange={setShowFormBuilder}
                        onDatabaseCreate={(db) => {
                            addDatabase(db)
                            setCurrentDb(db.title)
                        }}
                    />
                ) : showAddRecord && currentDatabase ? (
                    <RecordForm 
                        database={currentDatabase}
                        record={editingRecord || undefined}
                        onSubmit={handleRecordSubmit}
                        onUpdateDatabase={updateDatabase}
                    />
                ) : (
                    <DatabaseView 
                        database={currentDatabase}
                        searchQuery={searchQuery}
                        onDatabaseUpdate={updateDatabase}
                        onDuplicateRecord={duplicateRecord}
                        collapseAll={collapseAll}
                    />
                )}
            </div>
          </ScrollArea>
        </main>
      </div>
      
      <BottomNav 
        currentDatabase={currentDatabase}
        favorites={databases.flatMap(db => db.records.filter(r => r.isFavorite))}
        onSelectFavorite={(recordId: string) => {
            const db = databases.find(d => d.records.some(r => r.id === recordId))
            if (db) {
                setCurrentDb(db.title)
                const record = db.records.find(r => r.id === recordId)
                if (record) handleEditRecord(record)
            }
        }}
        onToggleCollapseAll={() => setCollapseAll(!collapseAll)}
        collapseAll={collapseAll}
        onNewDatabase={() => setShowFormBuilder(true)}
        onDeleteDatabases={deleteDatabases}
        onRecoverDatabases={recoverDatabases}
        onUseTemplate={(template: Database) => {
            addDatabase(template)
            setCurrentDb(template.title)
        }}
        allDatabases={databases}
        currentDb={currentDb}
        onUpdateDatabase={updateDatabase}
      />
    </div>
  )
}
