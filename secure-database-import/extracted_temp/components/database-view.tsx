"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Star, ChevronDown, ChevronUp, Trash2, FileDown, Pencil, ImageIcon, Copy, Printer } from "lucide-react"
import { PrintView } from "./print-record"
import { DatabasePrintButton } from "./database-print-button"
import { SortDropdown } from "./sort-dropdown"
import { SendToTodoButton } from "./send-to-todo-button"
import { NotesFieldActions } from "./notes-field-actions"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ImageGallery } from "./image-gallery"
import { useToast } from "@/components/ui/use-toast"
import type { Database, Record } from "@/lib/types"
import { getDatabaseColor, getRecordColor } from "@/lib/utils"

interface DatabaseViewProps {
  database?: Database
  searchQuery: string
  onDatabaseUpdate: (database: Database) => void
  onDuplicateRecord: (record: Record) => void
  collapseAll: boolean
  onSortChange: (sortOption: string) => void
  onToggleRecordCollapse?: (recordId: string) => void
  lastViewedRecordId?: string | null
  setLastViewedRecordId?: (recordId: string | null) => void
}

export function DatabaseView({
  database,
  searchQuery,
  onDatabaseUpdate,
  onDuplicateRecord,
  collapseAll,
  onSortChange,
  onToggleRecordCollapse,
  lastViewedRecordId,
  setLastViewedRecordId,
}: DatabaseViewProps) {
  const { toast } = useToast()
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [showGallery, setShowGallery] = useState<string | null>(null)
  const [isCollapsedState, setIsCollapsedState] = useState(false)
  const [printRecords, setPrintRecords] = useState<Record[] | null>(null)

  const recordRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Handle the collapseAll prop change
  useEffect(() => {
    if (collapseAll) {
      // When collapse is triggered, close all records
      setExpandedRecords(new Set())
    }
  }, [collapseAll])

  useEffect(() => {
    if (lastViewedRecordId && recordRefs.current[lastViewedRecordId]) {
      recordRefs.current[lastViewedRecordId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [lastViewedRecordId])

  if (!database) {
    console.log("No database provided to DatabaseView")
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground">Select a database to view records</span>
      </div>
    )
  }

  // Get the color for this database
  const dbColor = getDatabaseColor(database.title)

  // Add validation to ensure we're showing the correct database
  console.log("Displaying records for database:", database.title)
  console.log("Number of records:", database.records.length)

  if (!Array.isArray(database.records)) {
    console.error("Records is not an array:", database.records)
    return (
      <div className="text-destructive p-4">
        Error: Database records are invalid. Please restore from a valid backup.
      </div>
    )
  }

  if (database.records.length === 0) {
    return (
      <div className={`text-center p-8 rounded-lg ${dbColor.background} ${dbColor.border} border-2 ${dbColor.text}`}>
        <h3 className="text-lg font-semibold mb-2">No records found in {database.title}</h3>
        <p>Click the "Add Record" button to create one.</p>
      </div>
    )
  }

  const toggleExpand = (recordId: string) => {
    const newExpanded = new Set(expandedRecords)

    if (newExpanded.has(recordId)) {
      // If record is already expanded, collapse it
      newExpanded.delete(recordId)
    } else {
      // Expand the record
      newExpanded.add(recordId)

      // Call the onToggleRecordCollapse prop if provided
      if (onToggleRecordCollapse) {
        onToggleRecordCollapse(recordId)
      }

      // Update last viewed record if provided
      if (setLastViewedRecordId) {
        setLastViewedRecordId(recordId)
      }

      // Scroll to the record after a short delay to allow for state update
      setTimeout(() => {
        if (recordRefs.current[recordId]) {
          recordRefs.current[recordId]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }, 100)
    }

    setExpandedRecords(newExpanded)
  }

  const toggleFavorite = (record: Record) => {
    const updatedRecord = {
      ...record,
      isFavorite: !record.isFavorite,
      lastUpdated: new Date().toISOString(),
    }
    updateRecord(updatedRecord)
  }

  const updateRecord = (updatedRecord: Record) => {
    const updatedRecords = database.records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    onDatabaseUpdate({
      ...database,
      records: updatedRecords,
    })
  }

  const handleEditSave = (values: { [key: string]: any }) => {
    if (!editingRecord) return

    const updatedRecord = {
      ...editingRecord,
      values,
      lastUpdated: new Date().toISOString(),
    }
    updateRecord(updatedRecord)
    setEditingRecord(null)
  }

  const deleteRecord = (recordId: string) => {
    toast({
      title: "Delete Record",
      description: "Are you sure you want to delete this record? This action cannot be undone.",
      action: (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              onDatabaseUpdate({
                ...database,
                records: database.records.filter((r) => r.id !== recordId),
              })
              toast({
                title: "Record deleted",
                description: "The record has been permanently deleted.",
              })
            }}
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => toast({ description: "Deletion cancelled" })}>
            Cancel
          </Button>
        </div>
      ),
    })
  }

  const exportRecordToCsv = (record: Record) => {
    const headers = database.fields.map((f) => f.name).join(",")
    const values = database.fields
      .map((f) => {
        const value = record.values[f.name]
        if (Array.isArray(value)) return `"${value.join(", ")}"`
        return `"${value || ""}"`
      })
      .join(",")
    const csv = `${headers}\n${values}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `record-${record.id}.csv`
    a.click()
  }

  const printSingleRecord = (record: Record) => {
    setPrintRecords([record])
  }

  const printAllRecords = () => {
    setPrintRecords(filteredRecords)
  }

  const printEntireDatabase = () => {
    // Print all records in the database, not just filtered ones
    setPrintRecords(database.records)
  }

  const filteredRecords = database.records.filter((record) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return database.fields.some((field) => {
      const value = record.values[field.name]
      if (!value) return false
      if (Array.isArray(value)) {
        return value.some((v) => String(v).toLowerCase().includes(searchLower))
      }
      return String(value).toLowerCase().includes(searchLower)
    })
  })

  console.log("Filtered records:", filteredRecords.length)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch {
      return "Invalid date"
    }
  }

  // Check if the database has Todo integration enabled
  const todoEnabled = database.todoSettings?.enabled || false

  const updateFieldValue = (recordId: string, fieldName: string, value: string) => {
    const updatedRecords = database.records.map((r) => {
      if (r.id === recordId) {
        return {
          ...r,
          values: {
            ...r.values,
            [fieldName]: value,
          },
          lastUpdated: new Date().toISOString(),
        }
      }
      return r
    })

    onDatabaseUpdate({
      ...database,
      records: updatedRecords,
    })
  }

  return (
    <div className="space-y-4 pb-16">
      <div className={`p-4 mb-4 rounded-lg ${dbColor.background} ${dbColor.border} border-2`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-xl font-bold ${dbColor.text}`}>{database.title}</h2>
            <p className="text-sm text-muted-foreground">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""} •
              {searchQuery ? ` Filtered by: "${searchQuery}"` : " Showing all records"}
            </p>
          </div>
          <div className="flex space-x-2">
            <SortDropdown onSortChange={onSortChange} />
            {filteredRecords.length > 0 && searchQuery && (
              <DatabasePrintButton
                database={database}
                records={filteredRecords}
                buttonText="Print Filtered"
                printMode="filtered"
              />
            )}
            {database.records.length > 0 && (
              <DatabasePrintButton database={database} buttonText="Print Database" printMode="all" />
            )}
          </div>
        </div>
      </div>

      {filteredRecords.map((record) => {
        // Get a unique color for this record based on its ID
        const recordColor = getRecordColor(record.id)

        return (
          <Card
            key={record.id}
            id={`record-${record.id}`}
            ref={(el) => (recordRefs.current[record.id] = el)}
            className={`overflow-hidden border-2 ${recordColor.border} transition-shadow hover:shadow-md min-h-[120px] max-h-fit`}
          >
            <CardHeader className={`p-3 ${recordColor.background}`}>
              <div className="flex items-center justify-between">
                <div className={`font-medium truncate ${recordColor.text}`}>
                  {record.values[database.fields[0]?.name] || "Untitled"}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDate(record.lastUpdated)}
                </div>
              </div>
            </CardHeader>
            {database.displaySettings?.fields && database.displaySettings.fields.length > 0 && (
              <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                {database.displaySettings.fields.map((fieldName) => {
                  const field = database.fields.find((f) => f.name === fieldName)
                  if (!field) return null

                  const value = record.values[fieldName]
                  let displayValue = ""

                  if (Array.isArray(value)) {
                    displayValue = value.join(", ")
                  } else if (value !== undefined && value !== null) {
                    displayValue = String(value)
                  }

                  // Truncate the display value to 25 characters
                  if (displayValue.length > 25) {
                    displayValue = displayValue.slice(0, 25) + "..."
                  }

                  return (
                    <div key={fieldName} className="text-xs">
                      <span className={`font-medium ${recordColor.text}`}>{field.name}: </span>
                      <span className="text-muted-foreground break-words line-clamp-5">{displayValue || "—"}</span>
                    </div>
                  )
                })}
              </div>
            )}
            <CardContent className={`p-3 pt-0 ${recordColor.background}`}>
              <div className="flex flex-wrap gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingRecord(record)
                    // Scroll to top of page when editing
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDuplicateRecord(record)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative"
                  onClick={() => setShowGallery(record.id)}
                >
                  <ImageIcon className="h-4 w-4" />
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {Array.isArray(record.values.Gallery) ? record.values.Gallery.length : 0}
                  </Badge>
                </Button>
                {todoEnabled && <SendToTodoButton database={database} record={record} />}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFavorite(record)}>
                  <Star className={`h-4 w-4 ${record.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(record.id)}>
                  {expandedRecords.has(record.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exportRecordToCsv(record)}>
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => printSingleRecord(record)}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRecord(record.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedRecords.has(record.id) && (
                <div className={`mt-2 pt-2 border-t ${recordColor?.border || "border-gray-200 dark:border-gray-800"}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {database.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label className={`text-xs font-medium ${recordColor.text}`}>{field.name}</Label>
                        {field.type === "gallery" ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(record.values[field.name] || []).map((image: any, index: number) => (
                              <div
                                key={image.id}
                                className="relative aspect-square cursor-pointer group"
                                onClick={() => setShowGallery(record.id)}
                              >
                                <img
                                  src={image.thumbnail || "/placeholder.svg"}
                                  alt={image.caption}
                                  className="w-full h-full object-cover rounded-md"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                              </div>
                            ))}
                            {(!record.values[field.name] || record.values[field.name]?.length === 0) && (
                              <div className="text-sm text-muted-foreground">No images added yet</div>
                            )}
                          </div>
                        ) : field.type === "text" || field.type === "textarea" ? (
                          <div className="relative">
                            <div
                              className={`text-sm px-2 py-1.5 bg-background/50 rounded border ${recordColor.border} ${recordColor.text}`}
                            >
                              {field.type === "textarea" ||
                              (record.values[field.name] && record.values[field.name].length > 100) ? (
                                <ScrollArea className="max-h-[120px]">
                                  <div className="whitespace-pre-wrap line-clamp-5">
                                    {record.values[field.name] || ""}
                                  </div>
                                </ScrollArea>
                              ) : (
                                <div>{record.values[field.name] || ""}</div>
                              )}
                            </div>
                            <NotesFieldActions
                              database={database}
                              record={record}
                              fieldName={field.name}
                              value={record.values[field.name] || ""}
                              onUpdate={(fieldName, value) => updateFieldValue(record.id, fieldName, value)}
                            />
                          </div>
                        ) : (
                          <div
                            className={`relative text-sm px-2 py-1.5 bg-background/50 rounded border ${recordColor.border} ${recordColor.text}`}
                          >
                            {Array.isArray(record.values[field.name])
                              ? record.values[field.name].join(", ")
                              : record.values[field.name] || ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent className="max-w-2xl w-[95vw] h-[90vh] p-0 flex flex-col">
          {editingRecord && (
            <>
              <DialogHeader
                className={`${getRecordColor(editingRecord?.id || "")?.background || "bg-background"} -mx-6 -mt-6 px-6 py-4 border-b ${getRecordColor(editingRecord?.id || "")?.border || "border-border"}`}
              >
                <DialogTitle className={getRecordColor(editingRecord?.id || "")?.text || "text-foreground"}>
                  Edit Record
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <div className="space-y-4 py-4 px-6">
                    {database.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label className={getRecordColor(editingRecord?.id || "")?.text || "text-foreground"}>
                          {field.name}
                        </Label>
                        {field.type === "text" || field.type === "number" || field.type === "date" ? (
                          <div className="relative">
                            <Input
                              type={field.type}
                              value={editingRecord.values[field.name] || ""}
                              onChange={(e) => {
                                setEditingRecord({
                                  ...editingRecord,
                                  values: {
                                    ...editingRecord.values,
                                    [field.name]: e.target.value,
                                  },
                                })
                              }}
                              className={`border ${getRecordColor(editingRecord?.id || "")?.border || "border-border"} focus-visible:ring-offset-0 focus-visible:ring-1`}
                            />
                            {field.type === "text" && (
                              <div className="absolute right-1 top-1">
                                <NotesFieldActions
                                  database={database}
                                  record={editingRecord}
                                  fieldName={field.name}
                                  value={editingRecord.values[field.name] || ""}
                                  onUpdate={(fieldName, value) => {
                                    setEditingRecord({
                                      ...editingRecord,
                                      values: {
                                        ...editingRecord.values,
                                        [fieldName]: value,
                                      },
                                    })
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ) : field.type === "textarea" ? (
                          <div className="relative">
                            <Textarea
                              value={editingRecord.values[field.name] || ""}
                              onChange={(e) => {
                                setEditingRecord({
                                  ...editingRecord,
                                  values: {
                                    ...editingRecord.values,
                                    [field.name]: e.target.value,
                                  },
                                })
                              }}
                              className={`border ${getRecordColor(editingRecord?.id || "")?.border || "border-border"} focus-visible:ring-offset-0 focus-visible:ring-1`}
                            />
                            <div className="absolute right-1 top-1">
                              <NotesFieldActions
                                database={database}
                                record={editingRecord}
                                fieldName={field.name}
                                value={editingRecord.values[field.name] || ""}
                                onUpdate={(fieldName, value) => {
                                  setEditingRecord({
                                    ...editingRecord,
                                    values: {
                                      ...editingRecord.values,
                                      [fieldName]: value,
                                    },
                                  })
                                }}
                              />
                            </div>
                          </div>
                        ) : field.type === "checkbox" ? (
                          <div className="flex flex-wrap gap-4">
                            {field.options?.map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${editingRecord?.id || ""}-${field.name}-${option}`}
                                  checked={(editingRecord.values[field.name] || []).includes(option)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = editingRecord.values[field.name] || []
                                    const newValues = checked
                                      ? [...currentValues, option]
                                      : currentValues.filter((v: string) => v !== option)
                                    setEditingRecord({
                                      ...editingRecord,
                                      values: {
                                        ...editingRecord.values,
                                        [field.name]: newValues,
                                      },
                                    })
                                  }}
                                  className={`border ${getRecordColor(editingRecord?.id || "")?.border || "border-border"}`}
                                />
                                <Label
                                  htmlFor={`${editingRecord?.id || ""}-${field.name}-${option}`}
                                  className={getRecordColor(editingRecord?.id || "")?.text || "text-foreground"}
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : field.type === "dropdown" ? (
                          <Select
                            value={editingRecord.values[field.name] || ""}
                            onValueChange={(value) => {
                              setEditingRecord({
                                ...editingRecord,
                                values: {
                                  ...editingRecord.values,
                                  [field.name]: value,
                                },
                              })
                            }}
                          >
                            <SelectTrigger
                              className={`border ${getRecordColor(editingRecord?.id || "")?.border || "border-border"}`}
                            >
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
                        ) : null}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div
                className={`flex justify-end gap-2 p-4 border-t ${getRecordColor(editingRecord?.id || "")?.border || "border-border"} ${getRecordColor(editingRecord?.id || "")?.background || "bg-background"}`}
              >
                <Button variant="outline" onClick={() => setEditingRecord(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleEditSave(editingRecord.values)} className={dbColor.accent}>
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showGallery && (
        <ImageGallery
          recordId={showGallery}
          onClose={() => setShowGallery(null)}
          onImagesChange={(count) => {
            const updatedRecords = database.records.map((r) => {
              if (r.id === showGallery) {
                // Get the latest images from localStorage
                const recordImages = JSON.parse(localStorage.getItem("recordImages") || "{}")
                return {
                  ...r,
                  values: {
                    ...r.values,
                    Gallery: recordImages[showGallery] || [],
                  },
                  lastUpdated: new Date().toISOString(),
                }
              }
              return r
            })
            onDatabaseUpdate({
              ...database,
              records: updatedRecords,
            })
          }}
          databaseColor={dbColor}
        />
      )}
      {printRecords && (
        <Dialog open={!!printRecords} onOpenChange={() => setPrintRecords(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-6">
            <DialogHeader>
              <DialogTitle>
                {printRecords.length === 1 ? "Print Record" : `Print ${printRecords.length} Records`}
              </DialogTitle>
            </DialogHeader>
            <PrintView
              database={database}
              records={printRecords}
              printTitle={
                printRecords.length === 1
                  ? `${database.title} - ${printRecords[0].values[database.fields[0]?.name] || "Record"}`
                  : undefined
              }
              printMode={printRecords.length === database.records.length ? "all" : "selected"}
              onClose={() => setPrintRecords(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

