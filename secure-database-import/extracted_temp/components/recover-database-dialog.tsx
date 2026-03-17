"use client"

import { useState, useEffect } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { defaultTemplates } from "@/lib/templates"
import type { Database } from "@/lib/types"
import { getDatabaseColor } from "@/lib/utils"

interface RecoverDatabaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDatabases: Database[]
  onRecoverDatabases: (databasesToRecover: Database[]) => void
}

export function RecoverDatabaseDialog({
  open,
  onOpenChange,
  currentDatabases,
  onRecoverDatabases,
}: RecoverDatabaseDialogProps) {
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([])
  const [availableTemplates, setAvailableTemplates] = useState<Database[]>([])
  const { toast } = useToast()

  // Filter out templates that already exist in current databases
  useEffect(() => {
    if (open) {
      const currentTitles = new Set(currentDatabases.map((db) => db.title))
      const filteredTemplates = defaultTemplates.filter((template) => !currentTitles.has(template.title))
      setAvailableTemplates(filteredTemplates)
      setSelectedDatabases([]) // Reset selections when dialog opens
    }
  }, [open, currentDatabases])

  const handleCheckboxChange = (title: string, checked: boolean) => {
    if (checked) {
      setSelectedDatabases((prev) => [...prev, title])
    } else {
      setSelectedDatabases((prev) => prev.filter((db) => db !== title))
    }
  }

  const handleSelectAll = () => {
    if (selectedDatabases.length === availableTemplates.length) {
      setSelectedDatabases([])
    } else {
      setSelectedDatabases(availableTemplates.map((db) => db.title))
    }
  }

  const handleRecover = () => {
    if (selectedDatabases.length === 0) {
      toast({
        title: "No databases selected",
        description: "Please select at least one database to recover.",
        variant: "destructive",
      })
      return
    }

    // Get the full database objects for the selected titles
    const databasesToRecover = defaultTemplates.filter((db) => selectedDatabases.includes(db.title))

    // Call the recovery function
    onRecoverDatabases(databasesToRecover)

    // Reset state and close dialog
    setSelectedDatabases([])
    onOpenChange(false)

    toast({
      title: "Databases recovered",
      description: `Successfully recovered ${selectedDatabases.length} database(s).`,
    })
  }

  const handleCancel = () => {
    setSelectedDatabases([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recover Original Databases</DialogTitle>
          <DialogDescription>Select the original database templates you want to recover.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {availableTemplates.length > 0 ? (
            <>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="select-all"
                  checked={selectedDatabases.length === availableTemplates.length && availableTemplates.length > 0}
                  onCheckedChange={() => handleSelectAll()}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All
                </Label>
              </div>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {availableTemplates.map((db) => {
                    const dbColor = getDatabaseColor(db.title)
                    const isSelected = selectedDatabases.includes(db.title)

                    return (
                      <div
                        key={db.title}
                        className={`flex items-center space-x-2 p-2 rounded-md ${
                          isSelected ? `${dbColor.background} ${dbColor.border} border` : ""
                        }`}
                      >
                        <Checkbox
                          id={`db-${db.title}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCheckboxChange(db.title, !!checked)}
                        />
                        <Label htmlFor={`db-${db.title}`} className="flex-1">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${dbColor.accent} mr-2`}></div>
                            <span className={isSelected ? dbColor.text : ""}>{db.title}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {db.fields.length} field{db.fields.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </>
          ) : (
            <Alert>
              <AlertDescription>
                All original database templates are already available. There are no templates to recover.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleRecover}
            disabled={selectedDatabases.length === 0 || availableTemplates.length === 0}
            className={selectedDatabases.length > 0 ? getDatabaseColor(selectedDatabases[0]).accent : ""}
          >
            Recover Selected ({selectedDatabases.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

