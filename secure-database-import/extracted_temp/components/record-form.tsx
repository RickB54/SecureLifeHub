"use client"

import type React from "react"
import { useState } from "react"
import { Pencil, Plus, Trash2, Save, AlertTriangle } from "lucide-react"
import type { Database, Record, Field } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface RecordFormProps {
  database: Database
  record?: Record
  onSubmit: (values: { [key: string]: any }) => void
  onUpdateDatabase?: (updatedDatabase: Database) => void
}

export function RecordForm({ database, record, onSubmit, onUpdateDatabase }: RecordFormProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [newOption, setNewOption] = useState("")
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean
    field: string
    option: string
  } | null>(null)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const values: { [key: string]: any } = {}

    database.fields.forEach((field) => {
      if (field.type === "checkbox") {
        const selectedOptions = formData.getAll(field.name)
        values[field.name] = selectedOptions
      } else {
        values[field.name] = formData.get(field.name)
      }
    })

    onSubmit(values)
  }

  const toggleFieldEdit = (fieldName: string) => {
    setEditingField(editingField === fieldName ? null : fieldName)
    setNewOption("")
  }

  const addOptionToField = (fieldName: string) => {
    if (!newOption.trim()) {
      toast({
        title: "Error",
        description: "Option cannot be empty",
        variant: "destructive",
      })
      return
    }

    const field = database.fields.find((f) => f.name === fieldName)
    if (!field || !field.options) return

    // Check if option already exists
    if (field.options.includes(newOption.trim())) {
      toast({
        title: "Error",
        description: "This option already exists",
        variant: "destructive",
      })
      return
    }

    // Create updated database with new option
    const updatedDatabase = {
      ...database,
      fields: database.fields.map((f) => {
        if (f.name === fieldName) {
          return {
            ...f,
            options: [...(f.options || []), newOption.trim()],
          }
        }
        return f
      }),
    }

    // Update the database
    if (onUpdateDatabase) {
      onUpdateDatabase(updatedDatabase)
      toast({
        title: "Success",
        description: `Added "${newOption}" to ${fieldName} options`,
      })
      setNewOption("")
    }
  }

  const confirmDeleteOption = (fieldName: string, option: string) => {
    setDeleteConfirmDialog({
      open: true,
      field: fieldName,
      option,
    })
  }

  const deleteOptionFromField = () => {
    if (!deleteConfirmDialog) return

    const { field: fieldName, option } = deleteConfirmDialog

    const field = database.fields.find((f) => f.name === fieldName)
    if (!field || !field.options) return

    // Create updated database with option removed
    const updatedDatabase = {
      ...database,
      fields: database.fields.map((f) => {
        if (f.name === fieldName) {
          return {
            ...f,
            options: (f.options || []).filter((opt) => opt !== option),
          }
        }
        return f
      }),
    }

    // Update all records to remove this option from any that have it selected
    updatedDatabase.records = updatedDatabase.records.map((r) => {
      const values = { ...r.values }

      // If this is a checkbox field (array of values)
      if (Array.isArray(values[fieldName])) {
        values[fieldName] = values[fieldName].filter((val: string) => val !== option)
      }
      // If this is a dropdown field (single value)
      else if (values[fieldName] === option) {
        values[fieldName] = ""
      }

      return {
        ...r,
        values,
        lastUpdated: new Date().toISOString(),
      }
    })

    // Update the database
    if (onUpdateDatabase) {
      onUpdateDatabase(updatedDatabase)
      toast({
        title: "Success",
        description: `Removed "${option}" from ${fieldName} options`,
      })
      setDeleteConfirmDialog(null)
    }
  }

  const renderField = (field: Field) => {
    const value = record?.values[field.name]
    const isEditing = editingField === field.name
    const isEditableField = field.type === "dropdown" || field.type === "checkbox"

    const fieldHeader = (
      <div className="flex items-center justify-between">
        <Label htmlFor={field.name} className="text-sm font-medium">
          {field.name}
        </Label>
        {isEditableField && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.preventDefault()
              toggleFieldEdit(field.name)
            }}
          >
            {isEditing ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    )

    switch (field.type) {
      case "text":
      case "number":
      case "date":
        return (
          <div className="space-y-2">
            {fieldHeader}
            <Input type={field.type} name={field.name} defaultValue={value || ""} className="w-full" />
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            {fieldHeader}
            <Textarea name={field.name} defaultValue={value || ""} className="w-full min-h-[100px]" />
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {fieldHeader}

            {isEditing ? (
              <div className="border rounded-md p-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add new option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      addOptionToField(field.name)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option} className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field.name}-${option}`}
                          name={field.name}
                          value={option}
                          defaultChecked={(value || []).includes(option)}
                        />
                        <Label htmlFor={`${field.name}-${option}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                        onClick={(e) => {
                          e.preventDefault()
                          confirmDeleteOption(field.name, option)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {field.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.name}-${option}`}
                      name={field.name}
                      value={option}
                      defaultChecked={(value || []).includes(option)}
                    />
                    <Label htmlFor={`${field.name}-${option}`} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "dropdown":
        return (
          <div className="space-y-2">
            {fieldHeader}

            {isEditing ? (
              <div className="border rounded-md p-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add new option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      addOptionToField(field.name)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option} className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={value === option ? "default" : "outline"} className="text-xs">
                          {option}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                        onClick={(e) => {
                          e.preventDefault()
                          confirmDeleteOption(field.name, option)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Select name={field.name} defaultValue={value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )

      case "gallery":
        return (
          <div className="space-y-2">
            {fieldHeader}
            <div className="text-sm text-muted-foreground">Images can be added after creating the record</div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      <ScrollArea className="flex-1 px-4">
        <form id="record-form" onSubmit={handleSubmit} className="space-y-6 pb-6">
          {database.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {renderField(field)}
            </div>
          ))}
        </form>
      </ScrollArea>
      <div className="flex justify-end gap-2 p-4 border-t bg-background">
        <Button type="submit" form="record-form">
          {record ? "Save Changes" : "Create Record"}
        </Button>
      </div>

      {/* Confirmation Dialog for Deleting Options */}
      <Dialog open={deleteConfirmDialog?.open || false} onOpenChange={(open) => !open && setDeleteConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Option</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the option "{deleteConfirmDialog?.option}"?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-4 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This will remove the option from all records in the database that use it.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteOptionFromField}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

