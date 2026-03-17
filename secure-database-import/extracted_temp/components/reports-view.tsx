"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, FileText, HelpCircle, PieChart, Plus, Printer, Save, Trash, X } from "lucide-react"
import type { Database, Record } from "@/lib/types"
import { getDatabaseColor } from "@/lib/utils"
import { useLocalStorage } from "@/lib/use-local-storage"
import { saveTestData } from "@/lib/test-data-utils"
import { HelpDialog } from "./help-dialog"
import { ReportsHelp } from "./help-content/reports-help"

interface ReportsViewProps {
  database: Database
}

type FilterOperator = "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan" | "startsWith" | "endsWith"

interface Filter {
  id: string
  field: string
  operator: FilterOperator
  value: string
}

interface SortOption {
  id: string
  field: string
  direction: "asc" | "desc"
}

interface SavedReport {
  id: string
  name: string
  description?: string
  selectedFields: string[]
  filters: Filter[]
  sortOptions: SortOption[]
  groupBy?: string
  aggregation?: {
    field: string
    function: "sum" | "avg" | "count" | "min" | "max"
  }
}

const PREDEFINED_REPORTS = [
  {
    id: "summary",
    name: "Database Summary",
    description: "Overview of all records in the database",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "by-category",
    name: "Records by Category",
    description: "Count of records grouped by category",
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    id: "recent",
    name: "Recently Added Records",
    description: "Records added in the last 30 days",
    icon: <BarChart className="h-5 w-5" />,
  },
]

const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greaterThan", label: "Greater Than" },
  { value: "lessThan", label: "Less Than" },
  { value: "startsWith", label: "Starts With" },
  { value: "endsWith", label: "Ends With" },
]

export function ReportsView({ database }: ReportsViewProps) {
  // Use useLocalStorage instead of directly accessing the database hook
  const [savedReportsMap, setSavedReportsMap] = useLocalStorage<Record<string, SavedReport[]>>(
    "customDatabaseReports",
    {},
  )

  const [activeTab, setActiveTab] = useState("predefined")
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [filters, setFilters] = useState<Filter[]>([])
  const [sortOptions, setSortOptions] = useState<SortOption[]>([])
  const [groupBy, setGroupBy] = useState<string | undefined>(undefined)
  const [aggregation, setAggregation] = useState<
    { field: string; function: "sum" | "avg" | "count" | "min" | "max" } | undefined
  >(undefined)
  const [reportResults, setReportResults] = useState<any[] | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")
  const [saveReportDialog, setSaveReportDialog] = useState(false)
  const [reportName, setReportName] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [resetConfirmDialog, setResetConfirmDialog] = useState(false)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const { toast } = useToast()

  const dbColor = getDatabaseColor(database.title)
  const printFrameRef = useRef<HTMLIFrameElement>(null)

  // Save test data on component mount
  useEffect(() => {
    // Save test data to localStorage
    saveTestData()
  }, [])

  // Load saved reports only once when component mounts or database changes
  useEffect(() => {
    if (database?.title) {
      const reports = savedReportsMap[database.title] || []
      setSavedReports(reports)
    }
  }, [database?.title, savedReportsMap])

  // Helper function to get field type
  const getFieldType = (fieldName: string): string => {
    const field = database.fields.find((f) => f.name === fieldName)
    return field?.type || "text"
  }

  // Add a new filter
  const addFilter = () => {
    if (database.fields.length === 0) return

    const newFilter: Filter = {
      id: Math.random().toString(36).substring(2, 9),
      field: database.fields[0].name,
      operator: "equals",
      value: "",
    }

    setFilters([...filters, newFilter])
  }

  // Remove a filter
  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id))
  }

  // Add a sort option
  const addSortOption = () => {
    if (database.fields.length === 0) return

    const newSort: SortOption = {
      id: Math.random().toString(36).substring(2, 9),
      field: database.fields[0].name,
      direction: "asc",
    }

    setSortOptions([...sortOptions, newSort])
  }

  // Remove a sort option
  const removeSortOption = (id: string) => {
    setSortOptions(sortOptions.filter((s) => s.id !== id))
  }

  // Toggle field selection
  const toggleFieldSelection = (fieldName: string) => {
    if (selectedFields.includes(fieldName)) {
      setSelectedFields(selectedFields.filter((f) => f !== fieldName))
    } else {
      setSelectedFields([...selectedFields, fieldName])
    }
  }

  // Apply filter to records - memoized to prevent recreation on each render
  const applyFilter = useCallback((records: Record[], filter: Filter): Record[] => {
    return records.filter((record) => {
      const value = record.values[filter.field]
      if (value === undefined || value === null) return false

      const stringValue = String(value)
      const filterValue = filter.value

      switch (filter.operator) {
        case "equals":
          return stringValue === filterValue
        case "notEquals":
          return stringValue !== filterValue
        case "contains":
          return stringValue.toLowerCase().includes(filterValue.toLowerCase())
        case "greaterThan":
          return Number(stringValue) > Number(filterValue)
        case "lessThan":
          return Number(stringValue) < Number(filterValue)
        case "startsWith":
          return stringValue.toLowerCase().startsWith(filterValue.toLowerCase())
        case "endsWith":
          return stringValue.toLowerCase().endsWith(filterValue.toLowerCase())
        default:
          return true
      }
    })
  }, [])

  // Generate report based on current settings
  const generateReport = useCallback(() => {
    if (selectedFields.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one field for your report",
        variant: "destructive",
      })
      return
    }

    try {
      let results = [...database.records]

      // Apply filters
      if (filters.length > 0) {
        filters.forEach((filter) => {
          if (filter.field && filter.operator) {
            results = applyFilter(results, filter)
          }
        })
      }

      // Apply sorting
      if (sortOptions.length > 0) {
        results.sort((a, b) => {
          for (const sort of sortOptions) {
            if (!sort.field) continue

            const aValue = a.values[sort.field]
            const bValue = b.values[sort.field]

            if (aValue === bValue) continue

            const fieldType = getFieldType(sort.field)
            let comparison = 0

            if (fieldType === "number") {
              comparison = (Number(aValue) || 0) - (Number(bValue) || 0)
            } else if (fieldType === "date") {
              const aDate = aValue ? new Date(aValue).getTime() : 0
              const bDate = bValue ? new Date(bValue).getTime() : 0
              comparison = aDate - bDate
            } else {
              comparison = String(aValue || "").localeCompare(String(bValue || ""))
            }

            return sort.direction === "asc" ? comparison : -comparison
          }
          return 0
        })
      }

      // Apply grouping and aggregation
      if (groupBy) {
        const grouped: { [key: string]: any[] } = {}

        results.forEach((record) => {
          const groupValue = String(record.values[groupBy] || "Unknown")
          if (!grouped[groupValue]) {
            grouped[groupValue] = []
          }
          grouped[groupValue].push(record)
        })

        if (aggregation && aggregation.function && aggregation.field) {
          const aggregated = Object.entries(grouped).map(([group, records]) => {
            let value = 0

            switch (aggregation.function) {
              case "sum":
                value = records.reduce((sum, r) => sum + (Number(r.values[aggregation.field!]) || 0), 0)
                break
              case "avg":
                if (records.length === 0) {
                  value = 0
                } else {
                  value =
                    records.reduce((sum, r) => sum + (Number(r.values[aggregation.field!]) || 0), 0) / records.length
                }
                break
              case "count":
                value = records.length
                break
              case "min":
                if (records.length === 0) {
                  value = 0
                } else {
                  value = Math.min(...records.map((r) => Number(r.values[aggregation.field!]) || 0))
                }
                break
              case "max":
                if (records.length === 0) {
                  value = 0
                } else {
                  value = Math.max(...records.map((r) => Number(r.values[aggregation.field!]) || 0))
                }
                break
              default:
                value = records.length
            }

            return {
              group,
              value: aggregation.function === "avg" ? Number(value.toFixed(2)) : value,
              count: records.length,
            }
          })

          setReportResults(aggregated)
        } else {
          // Just group without aggregation
          setReportResults(
            Object.entries(grouped).map(([group, records]) => ({
              group,
              count: records.length,
              // Don't include the full records array in the results to avoid display issues
              // Instead, just include the count
            })),
          )
        }
      } else {
        // No grouping, just return filtered and sorted records
        setReportResults(
          results.map((record) => {
            const result: { [key: string]: any } = { id: record.id }
            selectedFields.forEach((field) => {
              result[field] = record.values[field]
            })
            return result
          }),
        )
      }

      setShowResults(true)

      toast({
        title: "Report Generated",
        description: `Generated report with ${results.length} records`,
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "An error occurred while generating the report",
        variant: "destructive",
      })
    }
  }, [database.records, selectedFields, filters, sortOptions, groupBy, aggregation, toast, applyFilter])

  // Reset report builder
  const resetReportBuilder = useCallback(() => {
    setSelectedFields([])
    setFilters([])
    setSortOptions([])
    setGroupBy(undefined)
    setAggregation(undefined)
    setReportResults(null)
    setShowResults(false)
    setResetConfirmDialog(false)

    toast({
      title: "Report Builder Reset",
      description: "All settings have been cleared",
    })
  }, [toast])

  // Save current report
  const saveReport = useCallback(() => {
    if (!reportName) {
      toast({
        title: "Error",
        description: "Please enter a name for your report",
        variant: "destructive",
      })
      return
    }

    const newReport: SavedReport = {
      id: Math.random().toString(36).substring(2, 9),
      name: reportName,
      description: reportDescription,
      selectedFields,
      filters,
      sortOptions,
      groupBy,
      aggregation,
    }

    // Update local state
    const updatedReports = [...savedReports, newReport]
    setSavedReports(updatedReports)

    // Update localStorage
    setSavedReportsMap((prev) => ({
      ...prev,
      [database.title]: updatedReports,
    }))

    // Save test data after updating reports
    saveTestData()

    setSaveReportDialog(false)
    setReportName("")
    setReportDescription("")

    // Keep the current tab active
    setActiveTab("saved")

    toast({
      title: "Report Saved",
      description: `"${reportName}" has been saved to your reports`,
    })
  }, [
    reportName,
    reportDescription,
    selectedFields,
    filters,
    sortOptions,
    groupBy,
    aggregation,
    savedReports,
    database.title,
    setSavedReportsMap,
    toast,
    setActiveTab,
  ])

  // Load a saved report
  const loadSavedReport = useCallback(
    (report: SavedReport) => {
      setSelectedFields(report.selectedFields || [])
      setFilters(report.filters || [])
      setSortOptions(report.sortOptions || [])
      setGroupBy(report.groupBy)
      setAggregation(report.aggregation)
      setActiveTab("custom")

      toast({
        title: "Report Loaded",
        description: `"${report.name}" has been loaded`,
      })
    },
    [toast],
  )

  // Delete a saved report
  const deleteSavedReport = useCallback(
    (id: string) => {
      const updatedReports = savedReports.filter((r) => r.id !== id)
      setSavedReports(updatedReports)

      // Update localStorage
      setSavedReportsMap((prev) => ({
        ...prev,
        [database.title]: updatedReports,
      }))

      // Save test data after updating reports
      saveTestData()

      toast({
        title: "Report Deleted",
        description: "The report has been deleted",
      })
    },
    [savedReports, database.title, setSavedReportsMap, toast],
  )

  // Run a saved report
  const runSavedReport = useCallback(
    (report: SavedReport) => {
      // Load the report settings first
      setSelectedFields(report.selectedFields || [])
      setFilters(report.filters || [])
      setSortOptions(report.sortOptions || [])
      setGroupBy(report.groupBy)
      setAggregation(report.aggregation)
      setActiveTab("custom")

      // Use setTimeout to ensure state updates have completed before generating the report
      setTimeout(() => {
        // Now generate the report with the updated settings
        generateReport()
      }, 0)

      toast({
        title: "Report Running",
        description: `Running "${report.name}" report`,
      })
    },
    [generateReport, toast],
  )

  const exportReportCSV = useCallback(() => {
    if (!reportResults || reportResults.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no report results to export.",
        variant: "destructive",
      })
      return
    }

    let csvContent = ""

    try {
      // Handle different report types
      if (reportResults.length > 0 && "group" in reportResults[0]) {
        // Grouped report
        csvContent = "Group,Count,Value\n"
        reportResults.forEach((row: any) => {
          csvContent += `"${row.group || ""}",${row.count || 0},${row.value !== undefined ? row.value : ""}\n`
        })
      } else {
        // Regular report
        // Get headers from first result
        const headers = Object.keys(reportResults[0])
        csvContent = headers.join(",") + "\n"

        // Add data rows
        reportResults.forEach((row) => {
          const values = headers.map((header) => {
            const value = row[header]
            if (value === undefined || value === null) return '""'
            return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          })
          csvContent += values.join(",") + "\n"
        })
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${database.title}-report.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "The report has been exported to CSV.",
      })
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report to CSV.",
        variant: "destructive",
      })
    }
  }, [reportResults, database.title, toast])

  // Open print dialog with formatted report
  const openPrintDialog = useCallback(() => {
    if (!reportResults || reportResults.length === 0) {
      toast({
        title: "No data to print",
        description: "There are no report results to print.",
        variant: "destructive",
      })
      return
    }

    setPrintDialogOpen(true)
  }, [reportResults, toast])

  // Handle actual printing
  const handlePrint = useCallback(() => {
    if (printFrameRef.current?.contentWindow) {
      try {
        printFrameRef.current.contentWindow.focus()
        printFrameRef.current.contentWindow.print()
      } catch (error) {
        console.error("Error printing:", error)
        toast({
          title: "Print Error",
          description: "There was an error printing the report. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  // Run a predefined report
  const runPredefinedReport = useCallback(
    (reportId: string) => {
      setSelectedReport(reportId)

      // Reset previous results
      setReportResults(null)

      try {
        let results: any[] = []

        switch (reportId) {
          case "summary":
            // Database summary - count of records, fields, etc.
            let lastUpdated = "N/A"
            let firstCreated = "N/A"

            if (database.records.length > 0) {
              try {
                const lastUpdatedDate = new Date(
                  Math.max(
                    ...database.records.map((r) => new Date(r.lastUpdated || 0).getTime()).filter((t) => !isNaN(t)),
                  ),
                )

                if (!isNaN(lastUpdatedDate.getTime())) {
                  lastUpdated = lastUpdatedDate.toLocaleDateString()
                }

                const firstCreatedDate = new Date(
                  Math.min(...database.records.map((r) => new Date(r.created || 0).getTime()).filter((t) => !isNaN(t))),
                )

                if (!isNaN(firstCreatedDate.getTime())) {
                  firstCreated = firstCreatedDate.toLocaleDateString()
                }
              } catch (e) {
                console.error("Error calculating dates:", e)
              }
            }

            results = [
              { metric: "Total Records", value: database.records.length },
              { metric: "Total Fields", value: database.fields.length },
              { metric: "Last Updated", value: lastUpdated },
              { metric: "First Created", value: firstCreated },
            ]
            break

          case "by-category":
            // Find a category field (dropdown or checkbox)
            const categoryField = database.fields.find((f) => f.type === "dropdown" || f.type === "checkbox")

            if (categoryField) {
              const categories: { [key: string]: number } = {}

              database.records.forEach((record) => {
                const value = record.values[categoryField.name]

                if (Array.isArray(value)) {
                  // Handle checkbox (multiple values)
                  if (value.length === 0) {
                    categories["Uncategorized"] = (categories["Uncategorized"] || 0) + 1
                  } else {
                    value.forEach((v) => {
                      if (v) {
                        categories[v] = (categories[v] || 0) + 1
                      }
                    })
                  }
                } else if (value) {
                  // Handle dropdown (single value)
                  categories[value] = (categories[value] || 0) + 1
                } else {
                  categories["Uncategorized"] = (categories["Uncategorized"] || 0) + 1
                }
              })

              results = Object.entries(categories).map(([category, count]) => ({
                category,
                count,
              }))
            } else {
              results = [{ message: "No category field found in this database" }]
            }
            break

          case "recent":
            // Records from the last 30 days
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            results = database.records
              .filter((record) => {
                try {
                  const createdDate = new Date(record.created)
                  return !isNaN(createdDate.getTime()) && createdDate >= thirtyDaysAgo
                } catch (e) {
                  return false
                }
              })
              .map((record) => {
                const createdDate = new Date(record.created)
                const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

                return {
                  id: record.id,
                  title: record.values[database.fields[0]?.name] || "Untitled",
                  created: createdDate.toLocaleDateString(),
                  days_ago: daysAgo,
                }
              })
              .sort((a, b) => a.days_ago - b.days_ago)
            break
        }

        setReportResults(results)
        setShowResults(true)

        toast({
          title: "Report Generated",
          description: `Generated ${reportId} report with ${results.length} results`,
        })
      } catch (error) {
        console.error("Error running predefined report:", error)
        toast({
          title: "Error",
          description: "An error occurred while generating the report",
          variant: "destructive",
        })
      }
    },
    [database, toast],
  )

  // Generate print content
  const generatePrintContent = useCallback(() => {
    if (!reportResults || reportResults.length === 0) return null

    const style = `
      <style>
        body { 
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          padding: 20px; 
          line-height: 1.5;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
          font-size: 14px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        h1 { 
          font-size: 24px; 
          margin-bottom: 10px; 
          color: #333;
        }
        h2 { 
          font-size: 18px; 
          margin-bottom: 10px; 
          color: #555;
        }
        p { 
          margin-bottom: 20px; 
          color: #666;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #999;
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    `

    let content = `
      <h1>${database.title} - Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    `

    // Add table of results
    if (reportResults.length > 0 && "group" in reportResults[0]) {
      // Grouped report
      content += `
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Count</th>
              ${aggregation ? "<th>Value</th>" : ""}
            </tr>
          </thead>
          <tbody>
      `

      reportResults.forEach((row: any) => {
        content += `
          <tr>
            <td>${row.group}</td>
            <td>${row.count}</td>
            ${aggregation ? `<td>${row.value !== undefined ? row.value : "N/A"}</td>` : ""}
          </tr>
        `
      })

      content += `
          </tbody>
        </table>
      `
    } else {
      // Regular report
      if (reportResults.length === 0) {
        content += "<p>No results found</p>"
      } else {
        // Get headers from first result
        const headers = Object.keys(reportResults[0])

        content += `
          <table>
            <thead>
              <tr>
                ${headers.map((h) => `<th>${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
        `

        reportResults.forEach((row) => {
          content += `
            <tr>
              ${headers
                .map((h) => {
                  const value = row[h]
                  // Format the value for display
                  let displayValue = "N/A"
                  if (value !== undefined && value !== null) {
                    if (typeof value === "object") {
                      // Don't display full objects, just indicate it's an object
                      displayValue = "[Object]"
                    } else {
                      displayValue = String(value)
                    }
                  }
                  return `<td>${displayValue}</td>`
                })
                .join("")}
            </tr>
          `
        })

        content += `
            </tbody>
          </table>
        `
      }
    }

    content += `
      <div class="footer">
        <p>Report generated from ${database.title} database on ${new Date().toLocaleDateString()}</p>
      </div>
    `

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${database.title} - Report</title>
          ${style}
        </head>
        <body>
          ${content}
          <button onclick="window.print()" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">Print Report</button>
        </body>
      </html>
    `
  }, [reportResults, database.title, aggregation])

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Reports</h2>
            <p className="text-muted-foreground">Generate reports from your database</p>
          </div>
          <HelpDialog
            title="Reports Help"
            sections={[{ id: "overview", title: "Overview", content: <ReportsHelp /> }]}
            size="lg"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-10rem)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predefined">Predefined Reports</TabsTrigger>
            <TabsTrigger value="custom">Custom Report</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          </TabsList>

          {/* Predefined Reports Tab */}
          <TabsContent value="predefined" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREDEFINED_REPORTS.map((report) => (
                <Card
                  key={report.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${selectedReport === report.id ? `border-2 ${dbColor.border}` : ""}`}
                  onClick={() => runPredefinedReport(report.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {report.icon}
                        {report.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={dbColor.accent}
                        onClick={(e) => {
                          e.stopPropagation()
                          runPredefinedReport(report.id)
                        }}
                      >
                        Run
                      </Button>
                    </div>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Custom Report Builder Tab */}
          <TabsContent value="custom" className="space-y-6 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Custom Report Builder</h3>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setResetConfirmDialog(true)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all report settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSaveReportDialog(true)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Report
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save this report for later use</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <HelpDialog
                  title="Reports Help"
                  sections={[{ id: "overview", title: "Overview", content: <ReportsHelp /> }]}
                  trigger={
                    <Button variant="outline" size="sm">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Field Selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Select Fields</CardTitle>
                <CardDescription>Choose which fields to include in your report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4 mt-2">
                  <Checkbox
                    id="select-all-fields"
                    checked={selectedFields.length === database.fields.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFields(database.fields.map((f) => f.name))
                      } else {
                        setSelectedFields([])
                      }
                    }}
                  />
                  <Label htmlFor="select-all-fields" className="font-medium">
                    Select All Fields
                  </Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {database.fields.map((field) => (
                    <div key={field.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`field-${field.name}`}
                        checked={selectedFields.includes(field.name)}
                        onCheckedChange={() => toggleFieldSelection(field.name)}
                      />
                      <Label htmlFor={`field-${field.name}`} className="text-sm">
                        {field.name}
                      </Label>
                    </div>
                  ))}
                </div>

                {selectedFields.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Selected Fields:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedFields.map((field) => (
                        <Badge key={field} variant="secondary" className="px-2 py-1">
                          {field}
                          <button
                            className="ml-1 text-muted-foreground hover:text-foreground"
                            onClick={() => toggleFieldSelection(field)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Filters</CardTitle>
                <CardDescription>Add conditions to filter your report data</CardDescription>
              </CardHeader>
              <CardContent>
                {filters.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No filters added. Click "Add Filter" to create one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filters.map((filter, index) => (
                      <div key={filter.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <Select
                          value={filter.field || database.fields[0]?.name}
                          onValueChange={(value) => {
                            const newFilters = [...filters]
                            newFilters[index].field = value === "default" ? "" : value
                            setFilters(newFilters)
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {database.fields.map((field) => (
                              <SelectItem key={field.name} value={field.name}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={filter.operator}
                          onValueChange={(value: FilterOperator) => {
                            const newFilters = [...filters]
                            newFilters[index].operator = value
                            setFilters(newFilters)
                          }}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {FILTER_OPERATORS.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          className="flex-1"
                          placeholder="Value"
                          value={filter.value}
                          onChange={(e) => {
                            const newFilters = [...filters]
                            newFilters[index].value = e.target.value
                            setFilters(newFilters)
                          }}
                        />

                        <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="mt-4" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </CardContent>
            </Card>

            {/* Sorting */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Sort Options</CardTitle>
                <CardDescription>Define how your report data should be sorted</CardDescription>
              </CardHeader>
              <CardContent>
                {sortOptions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No sort options added. Click "Add Sort" to create one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortOptions.map((sort, index) => (
                      <div key={sort.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <Select
                          value={sort.field || database.fields[0]?.name}
                          onValueChange={(value) => {
                            const newSorts = [...sortOptions]
                            newSorts[index].field = value
                            setSortOptions(newSorts)
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {database.fields.map((field) => (
                              <SelectItem key={field.name} value={field.name}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex-1">
                          <Select
                            value={sort.direction}
                            onValueChange={(value: "asc" | "desc") => {
                              const newSorts = [...sortOptions]
                              newSorts[index].direction = value
                              setSortOptions(newSorts)
                            }}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Direction" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Ascending</SelectItem>
                              <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button variant="ghost" size="icon" onClick={() => removeSortOption(sort.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="mt-4" onClick={addSortOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sort
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Advanced Options</CardTitle>
                <CardDescription>Group and aggregate your report data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Group By */}
                  <div>
                    <Label className="text-sm font-medium">Group By</Label>
                    <Select
                      value={groupBy || ""}
                      onValueChange={(value) => setGroupBy(value === "default" ? undefined : value)}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select a field to group by (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">None</SelectItem>
                        {database.fields.map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Aggregation */}
                  {groupBy && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Aggregation</Label>
                      <div className="flex gap-2">
                        <Select
                          value={aggregation?.function || "default"}
                          onValueChange={(value) => {
                            if (value === "default") {
                              setAggregation(undefined)
                            } else if (aggregation) {
                              setAggregation({ ...aggregation, function: value as any })
                            } else {
                              const numericFields = database.fields.filter((f) => f.type === "number")
                              setAggregation({
                                function: value as any,
                                field: numericFields.length > 0 ? numericFields[0].name : database.fields[0].name,
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Function" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">None</SelectItem>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="avg">Average</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                          </SelectContent>
                        </Select>

                        {aggregation && (
                          <Select
                            value={aggregation.field}
                            onValueChange={(value) => {
                              setAggregation({ ...aggregation, field: value })
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {database.fields
                                .filter((f) => aggregation.function === "count" || f.type === "number")
                                .map((field) => (
                                  <SelectItem key={field.name} value={field.name}>
                                    {field.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                className={dbColor.accent}
                onClick={() => {
                  generateReport()
                  // Scroll to results after generation
                  setTimeout(() => {
                    const resultsElement = document.getElementById("report-results")
                    if (resultsElement) {
                      resultsElement.scrollIntoView({ behavior: "smooth" })
                    }
                  }, 100)
                }}
              >
                Run Report
              </Button>
            </div>
          </TabsContent>

          {/* Saved Reports Tab */}
          <TabsContent value="saved" className="space-y-4 mt-4">
            {savedReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't saved any reports yet.</p>
                <p className="mt-2">Create a custom report and click "Save Report" to save it for later use.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => loadSavedReport(report)}>
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={dbColor.accent}
                            onClick={() => runSavedReport(report)}
                          >
                            Run
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openPrintDialog()}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => deleteSavedReport(report.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {report.description && <CardDescription>{report.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <div>Fields: {report.selectedFields?.length || 0}</div>
                        <div>Filters: {report.filters?.length || 0}</div>
                        {report.groupBy && <div>Grouped by: {report.groupBy}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Report Results */}
        {showResults && reportResults && (
          <div id="report-results" className="mt-8 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Report Results</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "table" ? "chart" : "table")}
                >
                  {viewMode === "table" ? <BarChart className="h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  {viewMode === "table" ? "Chart View" : "Table View"}
                </Button>
                <Button variant="outline" size="sm" onClick={exportReportCSV}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={openPrintDialog}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </div>

            {/* Table View */}
            {viewMode === "table" && (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        {reportResults.length > 0 &&
                          Object.keys(reportResults[0]).map((key) => (
                            <th key={key} className="px-4 py-2 text-left font-medium">
                              {key}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportResults.map((row, i) => (
                        <tr key={i} className="border-t">
                          {Object.entries(row).map(([key, value], j) => (
                            <td key={j} className="px-4 py-2">
                              {typeof value === "object"
                                ? key === "records"
                                  ? `[${(value as any[])?.length || 0} records]`
                                  : "[Object]"
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reportResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No results found for this report.</div>
                )}
              </div>
            )}

            {/* Chart View */}
            {viewMode === "chart" && (
              <div className="border rounded-md p-4">
                {reportResults.length > 0 && "group" in reportResults[0] ? (
                  <div className="h-80 flex items-end justify-around gap-2">
                    {reportResults.map((item: any, index) => {
                      const maxValue = Math.max(...reportResults.map((r: any) => r.value || r.count))
                      const height = `${((item.value || item.count) / maxValue) * 100}%`

                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className="text-xs mb-1">{item.value || item.count}</div>
                          <div className={`w-16 ${dbColor.background} rounded-t-md`} style={{ height }}></div>
                          <div className="mt-2 text-xs text-center w-20 truncate" title={item.group}>
                            {item.group}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Chart view is only available for grouped reports.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Save Report Dialog */}
      <Dialog open={saveReportDialog} onOpenChange={setSaveReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Report</DialogTitle>
            <DialogDescription>Save this report configuration for future use</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="Enter a name for this report"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">Description (Optional)</Label>
              <Input
                id="report-description"
                placeholder="Enter a description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveReport}>Save Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetConfirmDialog} onOpenChange={setResetConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Report Builder</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all report settings? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetReportBuilder}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Print Report</DialogTitle>
            <DialogDescription>Preview your report before printing</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex-1 overflow-hidden">
            <iframe
              ref={printFrameRef}
              className="w-full h-[60vh] border rounded"
              srcDoc={generatePrintContent() || ""}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

