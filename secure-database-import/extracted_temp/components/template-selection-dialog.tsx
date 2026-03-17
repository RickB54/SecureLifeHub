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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/types"
import { getDatabaseColor } from "@/lib/utils"

interface TemplateSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  databases: Database[]
  onSelectTemplate: (template: Database) => void
}

export function TemplateSelectionDialog({
  open,
  onOpenChange,
  databases,
  onSelectTemplate,
}: TemplateSelectionDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const { toast } = useToast()

  const handleSelectTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a database to use as a template.",
        variant: "destructive",
      })
      return
    }

    const template = databases.find((db) => db.title === selectedTemplate)
    if (!template) {
      toast({
        title: "Error",
        description: "Selected template not found.",
        variant: "destructive",
      })
      return
    }

    onSelectTemplate(template)
    setSelectedTemplate("")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSelectedTemplate("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Use Database as Template</DialogTitle>
          <DialogDescription>
            Select a database to use as a template. You'll be able to modify all fields before creating your new
            database.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {databases.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <div className="space-y-4">
                  {databases.map((db) => {
                    const dbColor = getDatabaseColor(db.title)
                    return (
                      <div
                        key={db.title}
                        className={`flex items-start space-x-2 p-3 rounded-md border-2 ${
                          selectedTemplate === db.title
                            ? `${dbColor.border} ${dbColor.background}`
                            : "border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                        }`}
                      >
                        <RadioGroupItem id={`template-${db.title}`} value={db.title} className="mt-1" />
                        <div className="flex-1">
                          <Label
                            htmlFor={`template-${db.title}`}
                            className={`font-medium ${selectedTemplate === db.title ? dbColor.text : ""}`}
                          >
                            {db.title}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {db.fields.length} field{db.fields.length !== 1 ? "s" : ""}
                          </p>
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            Fields: {db.fields.map((f) => f.name).join(", ")}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-4">No databases available to use as templates.</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSelectTemplate}
            disabled={!selectedTemplate || databases.length === 0}
            className={selectedTemplate ? getDatabaseColor(selectedTemplate).accent : ""}
          >
            Use as Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

