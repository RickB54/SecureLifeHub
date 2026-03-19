"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
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
import { TemplateSelector } from "./template-selector"
import { SheetTitle } from "@/components/ui/sheet"

interface SecureDatabaseProps {
  onOpenHelp?: (targetId?: string) => void
}

export default function SecureDatabase({ onOpenHelp }: SecureDatabaseProps) {
  const { 
    databases, 
    updateDatabase, 
    addDatabase, 
    addRecord,
    updateRecord,
    duplicateRecord, 
    deleteDatabases, 
    recoverDatabases, 
    resetToFactory, 
    synchronizeBlueprints,
    saveReport,
    getReportsForDatabase,
    deleteReport,
    handleReorder,
    initialized 
  } = useSecureDatabase()

  const { addTodo } = useTodo()
  
  const [currentDb, setCurrentDb] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFormBuilder, setShowFormBuilder] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DbRecord | null>(null)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [collapseAll, setCollapseAll] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [editingSchemaDatabase, setEditingSchemaDatabase] = useState<Database | null>(null)
  const [templateDatabase, setTemplateDatabase] = useState<Database | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const currentDatabase = useMemo(() => databases.find((db) => db.title === currentDb), [databases, currentDb])

  const handleSelectDatabase = useCallback((title: string) => {
    setCurrentDb(title)
    setShowFormBuilder(false)
    setShowAddRecord(false)
    setEditingRecord(null)
    setSelectedRecordId(null)
  }, [])

  const handleTemplateSelect = (template: Database) => {
    setTemplateDatabase(template)
    setEditingSchemaDatabase(null)
    setShowFormBuilder(true)
    setShowTemplateSelector(false)
    toast.info(`Initializing Architect with ${template.title} profile. Modify fields below.`)
  }

  // Auto-sync missing blueprints on mount
  useEffect(() => {
    if (initialized) {
        synchronizeBlueprints()
    }
  }, [initialized, synchronizeBlueprints])

  const handleAddRecord = () => {
    if (!currentDatabase && databases.length > 0) {
        setCurrentDb(databases[0].title)
    }
    setEditingRecord(null)
    setShowAddRecord(true)
  }

  const handleEditRecord = (record: DbRecord) => {
    setEditingRecord(record)
    setShowAddRecord(true)
  }

  const handleRecordSubmit = async (values: { [key: string]: any }, images?: string[]) => {
    if (!currentDatabase || !currentDatabase.id) return

    if (editingRecord) {
        await updateRecord(currentDatabase.id, editingRecord.id, {
            values,
            images: images || editingRecord.images,
            isFavorite: editingRecord.isFavorite,
            isArchived: editingRecord.isArchived
        })
    } else {
        await addRecord(currentDatabase.id, {
            values,
            images: images || [],
            isFavorite: false,
            isArchived: false
        })
    }

    setShowAddRecord(false)
    setEditingRecord(null)
    toast.success(editingRecord ? "Entry updated in Kolektion" : "Entry added to Kolektion")
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
            <div className="sr-only">
                <SheetTitle>Database Navigation</SheetTitle>
            </div>
            <DatabaseSidebar 
              databases={databases} 
              currentDb={currentDb}               onDatabaseSelect={(title: string) => {
                   handleSelectDatabase(title)
                   setMobileSheetOpen(false)
               }} 
               onReorder={handleReorder}
               onNewDatabase={() => {
                   setEditingSchemaDatabase(null)
                   setTemplateDatabase(null)
                   setShowFormBuilder(true)
                   setMobileSheetOpen(false)
               }}
            />
          </SheetContent>
        </Sheet>

        <div 
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          onClick={() => {
            setCurrentDb("")
            setSelectedRecordId(null)
          }}
        >
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all">
            <DatabaseIcon className="h-5 w-5" />
          </div>
          <div className="truncate">
            <h2 className="text-lg font-bold tracking-tight truncate group-hover:text-indigo-400 transition-colors">{currentDb || "Central Database"}</h2>
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
                className="hidden sm:flex bg-white hover:bg-gray-200 text-black border-none h-10 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg active:scale-95"
                onClick={handleAddRecord}
                disabled={showFormBuilder || showAddRecord}
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
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
            onReorder={handleReorder}
            onNewDatabase={() => {
                setEditingSchemaDatabase(null)
                setTemplateDatabase(null)
                setShowFormBuilder(true)
            }}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <ScrollArea className="flex-1">
            <div className="p-6 md:p-8 max-w-6xl mx-auto pb-32">
                {showFormBuilder ? (
                     <FormBuilder 
                         open={showFormBuilder}
                         onOpenChange={(open) => {
                             setShowFormBuilder(open)
                             if (!open) {
                                 setEditingSchemaDatabase(null)
                                 setTemplateDatabase(null)
                             }
                         }}
                         onDatabaseCreate={(db) => {
                             addDatabase(db)
                             setCurrentDb(db.title)
                             setShowFormBuilder(false)
                             setTemplateDatabase(null)
                         }}
                         editingDatabase={editingSchemaDatabase || undefined}
                         templateDatabase={templateDatabase || undefined}
                         onDatabaseUpdate={(db) => {
                             updateDatabase(db)
                             setShowFormBuilder(false)
                             setEditingSchemaDatabase(null)
                         }}
                     />
                ) : showAddRecord && currentDatabase ? (
                    <RecordForm 
                        database={currentDatabase}
                        record={editingRecord || undefined}
                        onSubmit={handleRecordSubmit}
                        onCancel={() => {
                            setShowAddRecord(false)
                            setEditingRecord(null)
                        }}
                        onUpdateDatabase={updateDatabase}
                    />
                ) : (
                     <DatabaseView 
                        database={currentDatabase}
                        searchQuery={searchQuery}
                        onDatabaseUpdate={updateDatabase}
                        onDuplicateRecord={duplicateRecord}
                        onEditRecord={handleEditRecord}
                        onSelectRecord={(record) => {
                            setSelectedRecordId(record.id)
                        }}
                        initialExpandedRecordId={selectedRecordId || undefined}
                        collapseAll={collapseAll}
                        allDatabases={databases}
                        onSelectDatabase={handleSelectDatabase}
                         onAddTodo={addTodo}
                         onAddRecord={handleAddRecord}
                         onEditSchema={(db) => {
                             setEditingSchemaDatabase(db)
                             setShowFormBuilder(true)
                         }}
                         sortConfig={sortConfig}
                         onSortChange={setSortConfig}
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
                setSelectedRecordId(recordId)
                setShowAddRecord(false) // Just view, don't edit
                toast.success("Navigated to Pinned Intel")
            }
        }}
         onToggleCollapseAll={() => setCollapseAll(!collapseAll)}
         collapseAll={collapseAll}
         onNewDatabase={() => {
             setEditingSchemaDatabase(null)
             setTemplateDatabase(null)
             setShowFormBuilder(true)
         }}
        onDeleteDatabases={deleteDatabases}
        onRecoverDatabases={recoverDatabases}
        onResetToFactory={synchronizeBlueprints}
        onSaveReport={saveReport}
        onGetReports={getReportsForDatabase}
        onDeleteReport={deleteReport}
        onUseTemplate={() => setShowTemplateSelector(true)}
        allDatabases={databases}
        currentDb={currentDb}
        onUpdateDatabase={updateDatabase}
        onHomeClick={() => {
            setCurrentDb("")
            setSelectedRecordId(null)
        }}
        onOpenHelp={onOpenHelp}
        onSortClick={(key) => setSortConfig(prev => ({ key, direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }))}
        sortConfig={sortConfig}
      />

      <TemplateSelector 
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
        existingDatabases={databases}
      />
    </div>
  )
}
