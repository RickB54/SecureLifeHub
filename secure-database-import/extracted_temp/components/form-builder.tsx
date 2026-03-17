"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database, Field, FieldType, Record } from "@/lib/types"

interface FormBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  databases: Database[]
  currentDatabase?: Database
  onDatabaseCreate: (database: Database) => void
  onRecordCreate?: (record: Record) => void
  onDatabaseSelect?: (title: string) => void
  templateDatabase?: Database
}

export function FormBuilder({
  open,
  onOpenChange,
  databases,
  currentDatabase,
  onDatabaseCreate,
  onRecordCreate,
  onDatabaseSelect,
  templateDatabase,
}: FormBuilderProps) {
  const [title, setTitle] = useState("")
  const [fields, setFields] = useState<Field[]>([{ name: "Title", type: "text" }])
  const [recordValues, setRecordValues] = useState<{ [key: string]: any }>({})
  const [newOption, setNewOption] = useState("")

  const isNewDatabase = !currentDatabase

  // Initialize with template if provided
  useEffect(() => {
    if (open && templateDatabase && isNewDatabase) {
      // Clone the template fields
      const clonedFields = JSON.parse(JSON.stringify(templateDatabase.fields)) as Field[]
      setFields(clonedFields)
      // Suggest a title based on the template
      setTitle(`${templateDatabase.title} Copy`)
    } else if (open && isNewDatabase && !templateDatabase) {
      // Reset to default if no template
      setTitle("")
      setFields([{ name: "Title", type: "text" }])
    }
  }, [open, templateDatabase, isNewDatabase])

  const handleAddField = () => {
    setFields([...fields, { name: "", type: "text" }])
  }

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, field: Partial<Field>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...field }
    setFields(newFields)
  }

  const handleAddOption = (index: number) => {
    if (!newOption.trim()) return

    const field = fields[index]
    const currentOptions = field.options || []

    if (currentOptions.includes(newOption.trim())) {
      alert("This option already exists")
      return
    }

    handleFieldChange(index, {
      options: [...currentOptions, newOption.trim()],
    })
    setNewOption("")
  }

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex]
    const newOptions = (field.options || []).filter((_, i) => i !== optionIndex)
    handleFieldChange(fieldIndex, { options: newOptions })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isNewDatabase) {
      if (!title || fields.some((f) => !f.name)) {
        alert("Please fill in all required fields")
        return
      }

      const invalidField = fields.find(
        (field) =>
          (field.type === "checkbox" || field.type === "dropdown") && (!field.options || field.options.length === 0),
      )

      if (invalidField) {
        alert(`Please add at least one option for the ${invalidField.name} field`)
        return
      }

      const newDatabase: Database = {
        title,
        fields,
        records: [],
      }

      onDatabaseCreate(newDatabase)
      onDatabaseSelect?.(title)
      onOpenChange(false)
    } else if (currentDatabase && onRecordCreate) {
      const now = new Date().toISOString()
      const newRecord: Record = {
        id: uuidv4(),
        values: recordValues,
        isFavorite: false,
        created: now,
        lastUpdated: now,
      }

      onRecordCreate(newRecord)
      onOpenChange(false)
    }

    setTitle("")
    setFields([{ name: "Title", type: "text" }])
    setRecordValues({})
    setNewOption("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            {isNewDatabase
              ? templateDatabase
                ? `Create New Database from Template: ${templateDatabase.title}`
                : "Create New Database"
              : "Add New Record"}
          </DialogTitle>
          <DialogDescription>
            {isNewDatabase
              ? templateDatabase
                ? "Customize the template by adding, removing, or editing fields"
                : "Define the structure of your database"
              : "Add a new record to your database"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4">
          <form id="database-form" onSubmit={handleSubmit} className="space-y-6 py-6">
            {isNewDatabase ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Database Title
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter database title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={index} className="space-y-4 rounded-lg border p-4">
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                          <label className="text-sm font-medium">
                            Field Name
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="Enter field name"
                            value={field.name}
                            onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-sm font-medium">
                            Field Type
                            <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={field.type}
                            onValueChange={(value: FieldType) => handleFieldChange(index, { type: value })}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="dropdown">Dropdown</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="gallery">Gallery</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveField(index)}
                          disabled={fields.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {(field.type === "checkbox" || field.type === "dropdown") && (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="Type an option and click Add"
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleAddOption(index)
                                  }
                                }}
                              />
                            </div>
                            <Button type="button" onClick={() => handleAddOption(index)}>
                              Add Option
                            </Button>
                          </div>

                          {(!field.options || field.options.length === 0) && (
                            <p className="text-sm text-muted-foreground">Add at least one option for this field</p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {field.options?.map((option, optionIndex) => (
                              <Badge
                                key={optionIndex}
                                variant="secondary"
                                className="px-3 py-1 text-sm flex items-center gap-2"
                              >
                                {option}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index, optionIndex)}
                                  className="hover:text-destructive focus:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove {option}</span>
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button type="button" onClick={handleAddField} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                {currentDatabase?.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-medium">
                      {field.name}
                      <span className="text-red-500">*</span>
                    </label>
                    {field.type === "checkbox" ? (
                      <div className="flex gap-2 flex-wrap">
                        {field.options?.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.name}-${option}`}
                              checked={(recordValues[field.name] || []).includes(option)}
                              onCheckedChange={(checked) => {
                                const currentValues = recordValues[field.name] || []
                                const newValues = checked
                                  ? [...currentValues, option]
                                  : currentValues.filter((v: string) => v !== option)
                                setRecordValues({
                                  ...recordValues,
                                  [field.name]: newValues,
                                })
                              }}
                            />
                            <label htmlFor={`${field.name}-${option}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                    ) : field.type === "dropdown" ? (
                      <Select
                        value={recordValues[field.name] || ""}
                        onValueChange={(value) =>
                          setRecordValues({
                            ...recordValues,
                            [field.name]: value,
                          })
                        }
                      >
                        <SelectTrigger>
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
                    ) : field.type === "textarea" ? (
                      <Textarea
                        value={recordValues[field.name] || ""}
                        onChange={(e) =>
                          setRecordValues({
                            ...recordValues,
                            [field.name]: e.target.value,
                          })
                        }
                      />
                    ) : field.type === "gallery" ? (
                      <p className="text-sm text-muted-foreground">Images can be added after creating the record</p>
                    ) : (
                      <Input
                        type={field.type}
                        value={recordValues[field.name] || ""}
                        onChange={(e) =>
                          setRecordValues({
                            ...recordValues,
                            [field.name]: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </form>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-4 border-t bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTitle("")
              setFields([{ name: "Title", type: "text" }])
              setRecordValues({})
              setNewOption("")
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button type="submit" form="database-form">
            {isNewDatabase ? "Create Database" : "Add Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

