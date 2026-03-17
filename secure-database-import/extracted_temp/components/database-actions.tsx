"use client"

import {
  Download,
  FileDown,
  FilePlus,
  FileUp,
  Settings,
  Trash2,
  PlusCircle,
  DatabaseIcon,
  Copy,
  LayoutGrid,
  ListTodo,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PinProtectedAction } from "./pin-protected-action"
import { PinChangeDialog } from "./pin-change-dialog"
import { DeleteDatabaseDialog } from "./delete-database-dialog"
import { RecoverDatabaseDialog } from "./recover-database-dialog"
import { TemplateSelectionDialog } from "./template-selection-dialog"
import { getCurrentPin } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/types"
// Import our DatabasePrintButton component
import { DatabasePrintButton } from "./database-print-button"
import { DisplayFieldsDialog } from "./display-fields-dialog"
import { TodoSettingsDialog } from "./todo-settings-dialog"
import { HelpDialog } from "./help-dialog"
import { DatabaseHelp } from "./help-content/database-help"

interface DatabaseActionsProps {
  database?: Database
  onNewDatabase: () => void
  onUseTemplate: (template: Database) => void
  onDeleteDatabases?: (databaseTitles: string[]) => void
  onRecoverDatabases?: (databasesToRecover: Database[]) => void
  allDatabases: Database[]
  currentDb?: string
  onUpdateDatabase?: (database: Database) => void
}

export function DatabaseActions({
  database,
  onNewDatabase,
  onUseTemplate,
  onDeleteDatabases,
  onRecoverDatabases,
  allDatabases,
  currentDb,
  onUpdateDatabase,
}: DatabaseActionsProps) {
  const [showPinChange, setShowPinChange] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRecoverDialog, setShowRecoverDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showDisplayFieldsDialog, setShowDisplayFieldsDialog] = useState(false)
  const [showTodoSettingsDialog, setShowTodoSettingsDialog] = useState(false)
  const { toast } = useToast()

  const handleExport = () => {
    if (!database) return

    // Get the images for this database's records
    const allImages = JSON.parse(localStorage.getItem("recordImages") || "{}")
    const databaseImages: { [key: string]: any } = {}

    database.records.forEach((record) => {
      if (record.id && allImages[record.id]) {
        databaseImages[record.id] = allImages[record.id]
      }
    })

    // Create the backup object with both database and images
    const backupData = {
      database: database,
      images: databaseImages,
    }

    const data = JSON.stringify(backupData, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${database.title}-backup.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportAll = () => {
    const customDatabases = JSON.parse(localStorage.getItem("customDatabases") || "[]")
    const allImages = JSON.parse(localStorage.getItem("recordImages") || "{}")

    // Create backup object with all databases and their images
    const backupData = {
      databases: customDatabases,
      images: allImages,
    }

    const data = JSON.stringify(backupData, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "all-databases-backup.json"
    a.click()
    URL.revokeObjectURL(url)
    URL.revokeObjectURL(url)
  }

  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      const importedData = JSON.parse(text)
      console.log("Imported data:", importedData)

      // Handle single database backup
      if (importedData.database && typeof importedData.database === "object") {
        const currentDatabases = JSON.parse(localStorage.getItem("customDatabases") || "[]")

        // Update databases in localStorage first
        const updatedDatabases = [...currentDatabases]
        const existingIndex = updatedDatabases.findIndex((db: Database) => db.title === importedData.database.title)

        if (existingIndex !== -1) {
          // Replace existing database
          updatedDatabases[existingIndex] = importedData.database
        } else {
          // Add new database
          updatedDatabases.push(importedData.database)
        }

        localStorage.setItem("customDatabases", JSON.stringify(updatedDatabases))

        // Update images if they exist
        if (importedData.images && typeof importedData.images === "object") {
          const currentImages = JSON.parse(localStorage.getItem("recordImages") || "{}")
          const updatedImages = { ...currentImages, ...importedData.images }
          localStorage.setItem("recordImages", JSON.stringify(updatedImages))
        }

        toast({
          title: "Success",
          description: `Database "${importedData.database.title}" has been restored`,
        })

        // Force reload to refresh all states
        window.location.reload()
      }
      // Handle full backup
      else if (Array.isArray(importedData.databases)) {
        localStorage.setItem("customDatabases", JSON.stringify(importedData.databases))

        if (importedData.images && typeof importedData.images === "object") {
          localStorage.setItem("recordImages", JSON.stringify(importedData.images))
        }

        toast({
          title: "Success",
          description: "All databases have been restored",
        })

        // Force reload to refresh all states
        window.location.reload()
      }
      // Handle legacy format
      else if (Array.isArray(importedData)) {
        localStorage.setItem("customDatabases", JSON.stringify(importedData))

        toast({
          title: "Success",
          description: "Databases have been restored (legacy format)",
        })

        // Force reload to refresh all states
        window.location.reload()
      } else {
        throw new Error("Unrecognized backup format")
      }
    } catch (error) {
      console.error("Import error details:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to restore database",
        variant: "destructive",
      })
    }
  }

  const handleExportCsv = () => {
    if (!database) return
    const headers = database.fields.map((f) => f.name).join(",")
    const rows = database.records.map((record) =>
      database.fields
        .map((field) => {
          const value = record.values[field.name]
          if (Array.isArray(value)) return `"${value.join(", ")}"`
          return `"${value || ""}"`
        })
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${database.title}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    if (!database) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const style = `
      <style>
        body { font-family: system-ui; padding: 20px; }
        .record { border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; }
        .field { margin: 5px 0; }
        .label { font-weight: bold; }
        @media print {
          body { padding: 0; }
          .record { break-inside: avoid; }
        }
      </style>
    `

    const content = database.records
      .map(
        (record) => `
      <div class="record">
        ${database.fields
          .map(
            (field) => `
          <div class="field">
            <span class="label">${field.name}:</span>
            ${
              Array.isArray(record.values[field.name])
                ? record.values[field.name].join(", ")
                : record.values[field.name] || ""
            }
          </div>
        `,
          )
          .join("")}
      </div>
    `,
      )
      .join("")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${database.title}</title>
          ${style}
        </head>
        <body>
          <h1>${database.title}</h1>
          ${content}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const handleDeleteDatabases = (databaseTitles: string[]) => {
    if (databaseTitles.length === 0) return

    // Call the onDeleteDatabases callback if provided
    if (onDeleteDatabases) {
      onDeleteDatabases(databaseTitles)
    }
  }

  const handleRecoverDatabases = (databasesToRecover: Database[]) => {
    // This will be handled by the parent component
    if (onRecoverDatabases) {
      onRecoverDatabases(databasesToRecover)
    }
  }

  const handleSelectTemplate = (template: Database) => {
    if (onUseTemplate) {
      onUseTemplate(template)
    }
  }

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Database Actions</h2>
            <p className="text-muted-foreground">Manage your database</p>
          </div>
          <HelpDialog
            title="Database Help"
            sections={[{ id: "overview", title: "Overview", content: <DatabaseHelp /> }]}
            size="lg"
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
        <div className="space-y-2 px-1">
          <PinProtectedAction
            pin={getCurrentPin()}
            onConfirm={onNewDatabase}
            trigger={
              <Button variant="outline" className="w-full justify-start">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Database
              </Button>
            }
          />

          <Button variant="outline" className="w-full justify-start" onClick={() => setShowTemplateDialog(true)}>
            <Copy className="w-4 h-4 mr-2" />
            Use As Template
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={() => setShowDisplayFieldsDialog(true)}>
            <LayoutGrid className="w-4 h-4 mr-2" />
            Edit Display Fields
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={() => setShowTodoSettingsDialog(true)}>
            <ListTodo className="w-4 h-4 mr-2" />
            Todo List Settings
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={handleExportCsv} disabled={!database}>
            <FileDown className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>

          {database && (
            <DatabasePrintButton
              database={database}
              variant="outline"
              size="default"
              className="w-full justify-start"
              buttonText="Print Database"
            />
          )}

          <PinProtectedAction
            pin={getCurrentPin()}
            onConfirm={handleExport}
            trigger={
              <Button variant="outline" className="w-full justify-start" disabled={!database}>
                <Download className="w-4 h-4 mr-2" />
                Backup Database
              </Button>
            }
          />

          <PinProtectedAction
            pin={getCurrentPin()}
            onConfirm={handleExportAll}
            trigger={
              <Button variant="outline" className="w-full justify-start">
                <FilePlus className="w-4 h-4 mr-2" />
                Backup All Databases
              </Button>
            }
          />

          <Button variant="outline" className="w-full justify-start" onClick={() => setShowPinChange(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Change PIN
          </Button>

          <PinProtectedAction
            pin={getCurrentPin()}
            onConfirm={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = ".json"
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleImport(file)
              }
              input.click()
            }}
            trigger={
              <Button variant="outline" className="w-full justify-start">
                <FileUp className="w-4 h-4 mr-2" />
                Restore Database
              </Button>
            }
          />
          <Button variant="outline" className="w-full justify-start" onClick={() => setShowRecoverDialog(true)}>
            <DatabaseIcon className="w-4 h-4 mr-2" />
            Recover Original Databases
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setShowDeleteDialog(true)}>
            <DatabaseIcon className="w-4 h-4 mr-2" />
            Delete Database
          </Button>

          <PinProtectedAction
            pin={getCurrentPin()}
            onConfirm={() => {
              localStorage.removeItem("customDatabases")
              localStorage.removeItem("recordImages")
              window.location.reload()
            }}
            trigger={
              <Button variant="outline" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            }
          />
        </div>
      </ScrollArea>
      {showPinChange && <PinChangeDialog open={showPinChange} onOpenChange={setShowPinChange} />}
      {showDeleteDialog && (
        <DeleteDatabaseDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          databases={allDatabases}
          onDeleteDatabases={handleDeleteDatabases}
          currentDb={currentDb}
        />
      )}
      {showRecoverDialog && (
        <RecoverDatabaseDialog
          open={showRecoverDialog}
          onOpenChange={setShowRecoverDialog}
          currentDatabases={allDatabases}
          onRecoverDatabases={handleRecoverDatabases}
        />
      )}
      {showTemplateDialog && (
        <TemplateSelectionDialog
          open={showTemplateDialog}
          onOpenChange={setShowTemplateDialog}
          databases={allDatabases}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
      {database && (
        <DisplayFieldsDialog
          open={showDisplayFieldsDialog}
          onOpenChange={setShowDisplayFieldsDialog}
          database={database}
          onUpdateDatabase={onUpdateDatabase}
        />
      )}
      {database && (
        <TodoSettingsDialog
          open={showTodoSettingsDialog}
          onOpenChange={setShowTodoSettingsDialog}
          database={database}
          onUpdateDatabase={onUpdateDatabase}
        />
      )}
    </>
  )
}

