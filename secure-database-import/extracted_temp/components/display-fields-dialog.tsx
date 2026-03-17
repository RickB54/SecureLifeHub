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
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/types"
import { getDatabaseColor } from "@/lib/utils"

interface DisplayFieldsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  database: Database
  onUpdateDatabase: (database: Database) => void
}

export function DisplayFieldsDialog({ open, onOpenChange, database, onUpdateDatabase }: DisplayFieldsDialogProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(database.displaySettings?.fields || [])
  const { toast } = useToast()
  const dbColor = getDatabaseColor(database.title)

  const handleToggleField = (fieldName: string) => {
    setSelectedFields((current) => {
      if (current.includes(fieldName)) {
        return current.filter((f) => f !== fieldName)
      }
      if (current.length >= 9) {
        toast({
          title: "Maximum fields reached",
          description: "You can only select up to 9 fields to display.",
          variant: "destructive",
        })
        return current
      }
      return [...current, fieldName]
    })
  }

  const handleSave = () => {
    if (!onUpdateDatabase) {
      toast({
        title: "Error",
        description: "Unable to save display fields. Please try again later.",
        variant: "destructive",
      })
      return
    }

    onUpdateDatabase({
      ...database,
      displaySettings: {
        fields: selectedFields,
      },
    })

    toast({
      title: "Display fields updated",
      description: "The record card layout has been updated.",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Display Fields</DialogTitle>
          <DialogDescription>
            Select up to 9 fields to display on record cards. Fields will be shown in a 3x3 grid below the title.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {database.fields.map((field) => (
                <div key={field.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`display-${field.name}`}
                    checked={selectedFields.includes(field.name)}
                    onCheckedChange={() => handleToggleField(field.name)}
                  />
                  <Label htmlFor={`display-${field.name}`} className="flex-1">
                    {field.name}
                  </Label>
                  {selectedFields.includes(field.name) && (
                    <span className="text-xs text-muted-foreground">
                      {selectedFields.indexOf(field.name) + 1} of {selectedFields.length}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground">Selected: {selectedFields.length}/9 fields</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className={dbColor.accent}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

