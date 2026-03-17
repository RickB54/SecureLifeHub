"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PinProtectedAction } from "./pin-protected-action"
import { getCurrentPin } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/types"
import { getDatabaseColor } from "@/lib/utils"

interface DeleteDatabaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  databases: Database[]
  onDeleteDatabases: (databaseTitles: string[]) => void
  currentDb?: string
}

export function DeleteDatabaseDialog({
  open,
  onOpenChange,
  databases,
  onDeleteDatabases,
  currentDb,
}: DeleteDatabaseDialogProps) {
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([])
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleCheckboxChange = (title: string, checked: boolean) => {
    if (checked) {
      setSelectedDatabases((prev) => [...prev, title])
    } else {
      setSelectedDatabases((prev) => prev.filter((db) => db !== title))
    }
  }

  const handleSelectAll = () => {
    if (selectedDatabases.length === databases.length) {
      setSelectedDatabases([])
    } else {
      setSelectedDatabases(databases.map((db) => db.title))
    }
  }

  const handleDelete = () => {
    if (selectedDatabases.length === 0) {
      toast({
        title: "No databases selected",
        description: "Please select at least one database to delete.",
        variant: "destructive",
      })
      return
    }

    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    // Call the onDeleteDatabases callback
    onDeleteDatabases(selectedDatabases)

    // Reset state and close dialog
    setSelectedDatabases([])
    setConfirmDialogOpen(false)
    onOpenChange(false)

    toast({
      title: "Databases deleted",
      description: `Successfully deleted ${selectedDatabases.length} database(s).`,
    })
  }

  const handleCancel = () => {
    setSelectedDatabases([])
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Database</DialogTitle>
            <DialogDescription>
              Select the databases you want to delete. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="select-all"
                checked={selectedDatabases.length === databases.length && databases.length > 0}
                onCheckedChange={() => handleSelectAll()}
              />
              <Label htmlFor="select-all" className="font-medium">
                Select All
              </Label>
            </div>

            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {databases.map((db) => {
                  const dbColor = getDatabaseColor(db.title)
                  const isSelected = selectedDatabases.includes(db.title)
                  const isCurrentDb = db.title === currentDb

                  return (
                    <div
                      key={db.title}
                      className={`flex items-start space-x-2 p-2 rounded-md ${
                        isSelected ? `${dbColor.background} ${dbColor.border} border` : ""
                      }`}
                    >
                      <Checkbox
                        id={`db-${db.title}`}
                        checked={selectedDatabases.includes(db.title)}
                        onCheckedChange={(checked) => handleCheckboxChange(db.title, !!checked)}
                        className="mt-1"
                      />
                      <Label htmlFor={`db-${db.title}`} className="flex-1">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${dbColor.accent} mr-2`}></div>
                          <span className={isSelected ? dbColor.text : ""}>{db.title}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {db.records.length} record{db.records.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {isCurrentDb && <span className="text-xs text-muted-foreground">(Currently selected)</span>}
                      </Label>
                    </div>
                  )
                })}
                {databases.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">No databases available</div>
                )}
              </div>
            </ScrollArea>

            {selectedDatabases.includes(currentDb || "") && (
              <Alert className="mt-4" variant="destructive">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  You are about to delete the currently selected database. This will cause the application to switch to
                  another database.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={selectedDatabases.length === 0}>
              Delete Selected ({selectedDatabases.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the following database(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <ScrollArea className="h-[100px] pr-4">
              <ul className="list-disc pl-5 space-y-1">
                {selectedDatabases.map((title) => {
                  const dbColor = getDatabaseColor(title)
                  return (
                    <li key={title} className={dbColor.text}>
                      {title}
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <PinProtectedAction
              pin={getCurrentPin()}
              onConfirm={handleConfirmDelete}
              trigger={<Button variant="destructive">Confirm Delete</Button>}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

