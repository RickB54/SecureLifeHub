"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/types"

interface TodoSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  database: Database
  onUpdateDatabase: (database: Database) => void
}

export function TodoSettingsDialog({ open, onOpenChange, database, onUpdateDatabase }: TodoSettingsDialogProps) {
  const [enabled, setEnabled] = useState(database.todoSettings?.enabled || false)
  const [noteFields, setNoteFields] = useState<string[]>(database.todoSettings?.noteFields || [])
  const { toast } = useToast()

  // Get text and textarea fields
  const textFields = database.fields.filter((field) => field.type === "text" || field.type === "textarea")

  // Reset state when database changes
  useEffect(() => {
    setEnabled(database.todoSettings?.enabled || false)
    setNoteFields(database.todoSettings?.noteFields || [])
  }, [database])

  const handleSave = () => {
    const updatedDatabase = {
      ...database,
      todoSettings: {
        enabled,
        noteFields,
      },
    }

    onUpdateDatabase(updatedDatabase)
    onOpenChange(false)

    toast({
      title: "Settings Saved",
      description: enabled
        ? "To-Do integration has been enabled for this database."
        : "To-Do integration has been disabled for this database.",
    })
  }

  const toggleField = (fieldName: string) => {
    setNoteFields((current) =>
      current.includes(fieldName) ? current.filter((f) => f !== fieldName) : [...current, fieldName],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>To-Do List Integration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="todo-enabled" className="font-medium">
              Enable To-Do Integration
            </Label>
            <Switch id="todo-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && textFields.length > 0 && (
            <div className="space-y-3">
              <Label className="font-medium">Select fields to sync with To-Do list:</Label>

              <ScrollArea className="h-60 border rounded-md p-4">
                <div className="space-y-3">
                  {textFields.map((field) => (
                    <div key={field.name} className="flex items-start space-x-2">
                      <Checkbox
                        id={`field-${field.name}`}
                        checked={noteFields.includes(field.name)}
                        onCheckedChange={() => toggleField(field.name)}
                      />
                      <Label htmlFor={`field-${field.name}`} className="text-sm leading-tight">
                        {field.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <p className="text-sm text-muted-foreground">
                Selected fields can be sent to the To-Do list and will be automatically synced when updated.
              </p>
            </div>
          )}

          {enabled && textFields.length === 0 && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-md">
              This database doesn't have any text or textarea fields that can be synced with the To-Do list.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

