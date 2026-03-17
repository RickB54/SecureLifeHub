"use client"

import { useState } from "react"
import { ListTodo, Edit, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useTodo } from "@/lib/use-todo"
import type { Database, Record } from "@/lib/types"

interface NotesFieldActionsProps {
  database: Database
  record: Record
  fieldName: string
  value: string
  onUpdate: (fieldName: string, value: string) => void
}

export function NotesFieldActions({ database, record, fieldName, value, onUpdate }: NotesFieldActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showTodoDialog, setShowTodoDialog] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [todoTitle, setTodoTitle] = useState(`${record.values[database.fields[0]?.name] || "Untitled"} - ${fieldName}`)
  const { syncTodoFromRecord } = useTodo()
  const { toast } = useToast()
  const [showFullNote, setShowFullNote] = useState(false)

  const handleEdit = () => {
    try {
      onUpdate(fieldName, editValue)
      setShowEditDialog(false)
      toast({
        title: "Field Updated",
        description: `${fieldName} has been updated.`,
      })
    } catch (error) {
      console.error("Error updating field:", error)
      toast({
        title: "Error",
        description: "There was a problem updating the field. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendToTodo = () => {
    try {
      syncTodoFromRecord(database.title, record.id, fieldName, value, todoTitle)
      setShowTodoDialog(false)
      toast({
        title: "Added to To-Do List",
        description: `${fieldName} has been added to your To-Do list.`,
      })
    } catch (error) {
      console.error("Error sending to todo:", error)
      toast({
        title: "Error",
        description: "There was a problem adding to the To-Do list. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Only show for text and textarea fields
  const field = database.fields.find((f) => f.name === fieldName)
  if (!field || (field.type !== "text" && field.type !== "textarea")) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-1 top-1 opacity-70 hover:opacity-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowTodoDialog(true)}>
            <ListTodo className="h-4 w-4 mr-2" />
            Send to To-Do List
          </DropdownMenuItem>
          {value.length > 100 && (
            <DropdownMenuItem onClick={() => setShowFullNote(true)}>
              <Edit className="h-4 w-4 mr-2" />
              View Full Note
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit {fieldName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-10rem)]">
            <div className="space-y-4 py-4">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={12}
                className="w-full min-h-[200px]"
              />
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send to Todo Dialog */}
      <Dialog open={showTodoDialog} onOpenChange={setShowTodoDialog}>
        <DialogContent className="max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Send to To-Do List</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-10rem)]">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="todoTitle">To-Do Title</Label>
                <Input id="todoTitle" value={todoTitle} onChange={(e) => setTodoTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <ScrollArea className="h-[200px] border rounded-md">
                  <div className="p-3 whitespace-pre-wrap">{value}</div>
                </ScrollArea>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTodoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendToTodo}>Add to To-Do List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Full Note Dialog */}
      <Dialog open={showFullNote} onOpenChange={setShowFullNote}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{fieldName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-4 whitespace-pre-wrap">{value}</div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowFullNote(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

