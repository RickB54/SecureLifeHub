"use client"

import { useEffect, useState, useCallback } from "react"
import { Menu, Search, Plus, HelpCircle } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { DatabaseSidebar } from "@/components/database-sidebar"
import { DatabaseView } from "@/components/database-view"
import { FormBuilder } from "@/components/form-builder"
import { RecordForm } from "@/components/record-form"
import { BottomMenu } from "@/components/bottom-menu"
import { useDatabase } from "@/lib/use-database"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database, Record } from "@/lib/types"
import { DatabasePrintButton } from "@/components/database-print-button"
import { HelpDialog } from "@/components/help-dialog"
import { AppHelp } from "@/components/help-content/app-help"
import { DatabaseHelp } from "@/components/help-content/database-help"
import { TodoHelp } from "@/components/help-content/todo-help"
import { ReportsHelp } from "@/components/help-content/reports-help"

export default function Page() {
  const { databases, updateDatabase, addDatabase, duplicateRecord, deleteDatabases, recoverDatabases, initialized } =
    useDatabase()
  const [currentDb, setCurrentDb] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFormBuilder, setShowFormBuilder] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [collapseAll, setCollapseAll] = useState(false)
  const [sortOption, setSortOption] = useState("lastUpdated-desc")
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [templateDatabase, setTemplateDatabase] = useState<Database | undefined>(undefined)
  const [printDatabase, setPrintDatabase] = useState<Database | null>(null)
  const [lastViewedRecordId, setLastViewedRecordId] = useState<string | null>(null)

  const currentDatabase = databases.find((db) => db.title === currentDb)
  const favorites = currentDatabase?.records.filter((r) => r.isFavorite) || []

  // Set the current database when initialized or when databases change
  useEffect(() => {
    if (initialized && databases.length > 0) {
      // If no database is selected, select the first one
      if (!currentDb) {
        const firstDb = databases[0].title
        console.log("Setting initial database:", firstDb)
        setCurrentDb(firstDb)
      } else {
        // Validate that the selected database still exists
        const dbExists = databases.some((db) => db.title === currentDb)
        if (!dbExists) {
          const firstDb = databases[0].title
          console.log("Selected database no longer exists, setting to:", firstDb)
          setCurrentDb(firstDb)
        }
      }
    }
  }, [initialized, databases, currentDb])

  // Debug logs
  useEffect(() => {
    console.log("Page mounted")
    console.log("Initialized:", initialized)
    console.log("Databases:", databases)
    console.log("Current DB:", currentDb)
    console.log("Current Database:", currentDatabase)
  }, [initialized, databases, currentDb, currentDatabase])

  const handleDatabaseCreate = (newDb: any) => {
    if (databases.some((db) => db.title === newDb.title)) {
      alert("A database with this name already exists")
      return
    }
    console.log("Creating new database:", newDb)
    addDatabase(newDb)

    // Force immediate selection of the new database
    setTimeout(() => {
      console.log("Setting current database to:", newDb.title)
      setCurrentDb(newDb.title)
    }, 0)

    setShowFormBuilder(false)
    setTemplateDatabase(undefined)
  }

  const handleRecordCreate = (values: { [key: string]: any }) => {
    if (!currentDatabase) return

    const now = new Date().toISOString()
    const newRecord: Record = {
      id: uuidv4(),
      values,
      created: now,
      lastUpdated: now,
      isFavorite: false,
    }

    console.log("Creating new record:", newRecord)
    updateDatabase({
      ...currentDatabase,
      records: [...currentDatabase.records, newRecord],
    })
    setShowAddRecord(false)
  }

  const handleDuplicateRecord = (record: Record) => {
    if (!currentDatabase) return
    console.log("Duplicating record:", record)
    duplicateRecord(currentDatabase.title, record)
  }

  const handleSortChange = (option: string) => {
    setSortOption(option)
    if (!currentDatabase) return

    const [field, direction] = option.split("-")
    console.log("Sorting records:", field, direction)

    const sortedRecords = [...currentDatabase.records]

    if (field === "title") {
      sortedRecords.sort((a, b) => {
        const titleField = currentDatabase.fields[0]?.name || "Title"
        const aTitle = a.values[titleField] || ""
        const bTitle = b.values[titleField] || ""
        return direction === "asc" ? aTitle.localeCompare(bTitle) : bTitle.localeCompare(aTitle)
      })
    } else if (field === "priority") {
      const priorityField = currentDatabase.fields.find((f) => f.name.toLowerCase().includes("priority"))
      if (priorityField) {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 }
        sortedRecords.sort((a, b) => {
          const aPriority = Array.isArray(a.values[priorityField.name])
            ? a.values[priorityField.name][0]
            : a.values[priorityField.name]
          const bPriority = Array.isArray(b.values[priorityField.name])
            ? b.values[priorityField.name][0]
            : b.values[priorityField.name]
          return (priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0)
        })
      }
    } else if (field === "dueDate") {
      const dueDateField = currentDatabase.fields.find((f) => f.name.toLowerCase().includes("due"))
      if (dueDateField) {
        sortedRecords.sort((a, b) => {
          const aDate = new Date(a.values[dueDateField.name] || "9999-12-31")
          const bDate = new Date(b.values[dueDateField.name] || "9999-12-31")
          return direction === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
        })
      }
    } else {
      sortedRecords.sort((a, b) => {
        const aDate = new Date(a[field] || "").getTime()
        const bDate = new Date(b[field] || "").getTime()
        return direction === "asc" ? aDate - bDate : bDate - aDate
      })
    }

    updateDatabase({
      ...currentDatabase,
      records: sortedRecords,
    })
  }

  const handleDatabaseSelect = (title: string) => {
    console.log("Selecting database:", title)
    setCurrentDb(title)
    setMobileSheetOpen(false)
  }

  const handleDeleteDatabases = (databaseTitles: string[]) => {
    // Delete the databases
    const success = deleteDatabases(databaseTitles)

    if (success) {
      // If the current database is deleted, select another one
      if (databaseTitles.includes(currentDb)) {
        // Get the updated list of databases after deletion
        const remainingDatabases = databases.filter((db) => !databaseTitles.includes(db.title))

        if (remainingDatabases.length > 0) {
          console.log("Setting current database to:", remainingDatabases[0].title)
          setCurrentDb(remainingDatabases[0].title)
        } else {
          console.log("No databases remaining, clearing current database")
          setCurrentDb("")
        }
      }
    }
  }

  const handleUseTemplate = (template: Database) => {
    setTemplateDatabase(template)
    setShowFormBuilder(true)
  }

  const handleToggleCollapseAll = useCallback(() => {
    setCollapseAll((prev) => !prev)
  }, [])

  const handleToggleRecordCollapse = useCallback((recordId: string) => {
    setLastViewedRecordId(recordId)
  }, [])

  const scrollToRecord = useCallback((recordId: string) => {
    const recordElement = document.getElementById(`record-${recordId}`)
    if (recordElement) {
      recordElement.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  if (!initialized) {
    return <div className="p-4">Loading databases...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <div className="hidden md:block">
          <SidebarProvider>
            <DatabaseSidebar
              databases={databases}
              currentDb={currentDb}
              onDatabaseSelect={handleDatabaseSelect}
              onNewDatabase={() => setShowFormBuilder(true)}
            />
          </SidebarProvider>
        </div>

        <main className="flex-1 flex flex-col">
          <div className="border-b">
            <div className="flex h-16 items-center px-4 gap-4">
              <div className="md:hidden">
                <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0">
                    <DatabaseSidebar
                      key="mobile-sidebar"
                      databases={databases}
                      currentDb={currentDb}
                      onDatabaseSelect={handleDatabaseSelect}
                      onNewDatabase={() => {
                        setShowFormBuilder(true)
                        setMobileSheetOpen(false)
                      }}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              {currentDatabase && (
                <Button onClick={() => setShowAddRecord(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Record</span>
                </Button>
              )}

              <div className="flex-1 flex justify-center gap-2">
                {currentDatabase && (
                  <DatabasePrintButton database={currentDatabase} variant="outline" size="icon" showText={false} />
                )}
                <HelpDialog
                  title="Application Help"
                  sections={[
                    { id: "app", title: "Overview", content: <AppHelp /> },
                    { id: "database", title: "Database", content: <DatabaseHelp /> },
                    { id: "todo", title: "Todo List", content: <TodoHelp /> },
                    { id: "reports", title: "Reports", content: <ReportsHelp /> },
                  ]}
                  size="xl"
                  trigger={
                    <Button variant="outline" size="icon">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  }
                />
                <ThemeToggle />
              </div>

              <div className="relative max-w-sm w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto pb-16">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <DatabaseView
                database={currentDatabase}
                searchQuery={searchQuery}
                onDatabaseUpdate={updateDatabase}
                onDuplicateRecord={handleDuplicateRecord}
                collapseAll={collapseAll}
                onSortChange={handleSortChange}
                onToggleRecordCollapse={handleToggleRecordCollapse}
                lastViewedRecordId={lastViewedRecordId}
                setLastViewedRecordId={setLastViewedRecordId}
              />
            </ScrollArea>
          </div>
        </main>
      </div>

      <BottomMenu
        currentDatabase={currentDatabase}
        favorites={favorites}
        onSelectFavorite={(recordId) => {
          const record = currentDatabase?.records.find((r) => r.id === recordId)
          if (record) setEditingRecord(record)
        }}
        onToggleCollapseAll={handleToggleCollapseAll}
        collapseAll={collapseAll}
        onNewDatabase={() => {
          setTemplateDatabase(undefined)
          setShowFormBuilder(true)
        }}
        onDeleteDatabases={handleDeleteDatabases}
        onRecoverDatabases={recoverDatabases}
        onUseTemplate={handleUseTemplate}
        allDatabases={databases}
        currentDb={currentDb}
        onUpdateDatabase={updateDatabase}
        onToggleRecordCollapse={handleToggleRecordCollapse}
        lastViewedRecordId={lastViewedRecordId}
        scrollToRecord={scrollToRecord}
        databases={databases}
      />

      <FormBuilder
        open={showFormBuilder}
        onOpenChange={(open) => {
          setShowFormBuilder(open)
          if (!open) setTemplateDatabase(undefined)
        }}
        databases={databases}
        onDatabaseCreate={handleDatabaseCreate}
        onDatabaseSelect={handleDatabaseSelect}
        templateDatabase={templateDatabase}
      />

      {currentDatabase && (
        <>
          <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
            <DialogContent className="max-w-2xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Add New Record</DialogTitle>
              </DialogHeader>
              <RecordForm database={currentDatabase} onSubmit={handleRecordCreate} onUpdateDatabase={updateDatabase} />
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
            <DialogContent className="max-w-2xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Edit Record</DialogTitle>
              </DialogHeader>
              {editingRecord && (
                <RecordForm
                  database={currentDatabase}
                  record={editingRecord}
                  onSubmit={(values) => {
                    updateDatabase({
                      ...currentDatabase,
                      records: currentDatabase.records.map((r) =>
                        r.id === editingRecord.id
                          ? {
                              ...editingRecord,
                              values,
                              lastUpdated: new Date().toISOString(),
                            }
                          : r,
                      ),
                    })
                    setEditingRecord(null)
                  }}
                  onUpdateDatabase={updateDatabase}
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

