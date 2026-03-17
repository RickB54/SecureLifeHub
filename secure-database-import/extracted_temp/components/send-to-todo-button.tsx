"use client"

import { useState } from "react"
import { ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { useTodo } from "@/lib/use-todo"
import type { Database, Record } from "@/lib/types"

interface SendToTodoButtonProps {
  database: Database
  record: Record
}

export function SendToTodoButton({ database, record }: SendToTodoButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<string>("")
  const [todoTitle, setTodoTitle] = useState("")
  const { syncTodoFromRecord } = useTodo()
  const { toast } = useToast()

  // Get text and textarea fields
  const textFields = database.fields.filter((field) => field.type === "text" || field.type === "textarea")

  const handleOpen = () => {
    // Set default selected field to the first text field
    if (textFields.length > 0 && !selectedField) {
      setSelectedField(textFields[0].name)
      setTodoTitle(`${record.values[database.fields[0]?.name] || "Untitled"} - ${textFields[0].name}`)
    }
    setOpen(true)
  }

  const handleFieldChange = (fieldName: string) => {
    setSelectedField(fieldName)
    setTodoTitle(`${record.values[database.fields[0]?.name] || "Untitled"} - ${fieldName}`)
  }

  const handleSendToTodo = () => {
    if (!selectedField) {
      toast({
        title: "Error",
        description: "Please select a field to send to the To-Do list",
        variant: "destructive",
      })
      return
    }

    syncTodoFromRecord(database.title, record.id, selectedField, record.values[selectedField] || "", todoTitle)

    setOpen(false)
    toast({
      title: "Added to To-Do List",
      description: `${selectedField} has been added to your To-Do list.`,
    })
  }

  if (textFields.length === 0) {
    return null
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpen}>
        <ListTodo className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Send to To-Do List</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-10rem)]">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Field</Label>
                <RadioGroup value={selectedField} onValueChange={handleFieldChange}>
                  {textFields.map((field) => (
                    <div key={field.name} className="flex items-start space-x-2 p-2 border rounded-md">
                      <RadioGroupItem value={field.name} id={field.name} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={field.name} className="font-medium">
                          {field.name}
                        </Label>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {record.values[field.name] || ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="todoTitle">To-Do Title</Label>
                <Input id="todoTitle" value={todoTitle} onChange={(e) => setTodoTitle(e.target.value)} />
              </div>

              {selectedField && (
                <div className="space-y-2">
                  <Label>Content Preview</Label>
                  <ScrollArea className="h-[150px] border rounded-md">
                    <div className="p-3 whitespace-pre-wrap">{record.values[selectedField] || ""}</div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendToTodo}>Add to To-Do List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

