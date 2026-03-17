"use client"

import { useRef, useEffect } from "react"
import { format } from "date-fns"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Database, Record } from "@/lib/types"
import { getDatabaseColor, getRecordColor } from "@/lib/utils"

interface PrintViewProps {
  database: Database
  records: Record[] // Can be a single record or multiple
  printTitle?: string // Optional custom title for the print view
  onClose?: () => void
  printMode?: "all" | "filtered" | "selected" // To indicate what we're printing
}

export function PrintView({ database, records, printTitle, onClose, printMode = "selected" }: PrintViewProps) {
  const printFrameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Generate the print content when the component mounts
    if (printFrameRef.current) {
      const doc = printFrameRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(generatePrintContent())
        doc.close()
      }
    }
  }, [records])

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch {
      return "Invalid date"
    }
  }

  const generatePrintContent = () => {
    const dbColor = getDatabaseColor(database.title)

    // CSS for print styling
    const style = `
      <style>
        @page {
          size: auto;
          margin: 10mm;
        }
        
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.5;
          color: #333;
          background: white;
          margin: 0;
          padding: 0;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }
        
        .print-header h1 {
          font-size: 24px;
          margin: 0 0 5px 0;
        }
        
        .print-header p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        
        /* Multiple records layout */
        .records-container {
          display: ${records.length > 1 ? "grid" : "block"};
          grid-template-columns: ${records.length > 1 ? "repeat(2, 1fr)" : "1fr"};
          gap: 15px;
          page-break-inside: auto;
        }
        
        /* Single record layout - two columns for fields */
        .single-record-fields {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          column-gap: 30px;
        }
        
        /* Add a divider between columns for single record */
        .single-record-fields > div:nth-child(odd):after {
          content: "";
          position: absolute;
          top: 0;
          right: -15px;
          height: 100%;
          width: 1px;
          background-color: #eee;
        }
        
        .record-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          page-break-inside: avoid;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .record-header {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          background: #f9f9f9;
        }
        
        .record-header h2 {
          font-size: 16px;
          margin: 0;
          font-weight: 600;
        }
        
        .record-header .date {
          font-size: 12px;
          color: #666;
        }
        
        .record-content {
          padding: 15px;
        }
        
        .fields-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        
        .field {
          margin-bottom: 8px;
          position: relative;
        }
        
        .field-label {
          font-size: 12px;
          font-weight: 600;
          color: #555;
          margin-bottom: 2px;
        }
        
        .field-value {
          font-size: 14px;
          padding: 4px 8px;
          background: #f5f5f5;
          border: 1px solid #eee;
          border-radius: 4px;
          min-height: 20px;
        }
        
        /* Handle long text in field values */
        .field-value.long-text {
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        /* Make notes fields span full width */
        .field.notes-field {
          grid-column: 1 / -1;
          width: 100%;
        }

        .field.notes-field .field-value {
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .print-footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
        
        .print-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin: 20px auto;
          display: block;
        }
        
        .print-button:hover {
          background: #4338ca;
        }
        
        @media print {
          .print-button {
            display: none;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .record-card {
            break-inside: avoid;
            box-shadow: none;
            border: 1px solid #ddd !important;
          }
          
          /* Ensure two-column layout continues on next page */
          .single-record-fields {
            break-inside: auto;
          }
          
          /* But each field should avoid breaks */
          .field {
            break-inside: avoid;
          }
        }
      </style>
    `

    // Generate the HTML content
    let content = `
      <div class="print-header">
        <h1>${printTitle || `${database.title} - ${records.length > 1 ? "Records" : "Record"}`}</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>${records.length} record${records.length !== 1 ? "s" : ""} ${printMode === "filtered" ? "(filtered)" : printMode === "all" ? "(all)" : ""}</p>
      </div>
    `

    // Different layout for single record vs multiple records
    if (records.length === 1) {
      // Single record - display fields in two columns
      const record = records[0]
      const recordColor = getRecordColor(record.id)

      content += `
        <div class="record-card">
          <div class="record-header">
            <h2>${record.values[database.fields[0]?.name] || "Untitled"}</h2>
            <div class="date">Last updated: ${formatDate(record.lastUpdated)}</div>
          </div>
          <div class="record-content">
            <div class="single-record-fields">
      `

      // Add each field in a layout that will create two columns
      database.fields.forEach((field) => {
        const value = record.values[field.name]
        const displayValue = Array.isArray(value) ? value.join(", ") : value || ""
        const isLongText = displayValue.length > 100 || field.type === "textarea"
        const isNotesField =
          field.name.toLowerCase().includes("note") ||
          field.name.toLowerCase().includes("notes") ||
          field.type === "textarea"

        content += `
          <div class="field ${isNotesField ? "notes-field" : ""}">
            <div class="field-label">${field.name}</div>
            <div class="field-value ${isLongText ? "long-text" : ""}">${displayValue}</div>
          </div>
        `
      })

      content += `
            </div>
          </div>
        </div>
      `
    } else {
      // Multiple records - use the existing grid layout
      content += `<div class="records-container">`

      // Add each record
      records.forEach((record) => {
        const recordColor = getRecordColor(record.id)

        content += `
          <div class="record-card">
            <div class="record-header">
              <h2>${record.values[database.fields[0]?.name] || "Untitled"}</h2>
              <div class="date">Last updated: ${formatDate(record.lastUpdated)}</div>
            </div>
            <div class="record-content">
              <div class="fields-grid">
        `

        // Add each field
        database.fields.forEach((field) => {
          const value = record.values[field.name]
          const displayValue = Array.isArray(value) ? value.join(", ") : value || ""
          const isNotesField =
            field.name.toLowerCase().includes("note") ||
            field.name.toLowerCase().includes("notes") ||
            field.type === "textarea"

          content += `
            <div class="field ${isNotesField ? "notes-field" : ""}">
              <div class="field-label">${field.name}</div>
              <div class="field-value ${displayValue.length > 100 || field.type === "textarea" ? "long-text" : ""}">${displayValue}</div>
            </div>
          `
        })

        content += `
              </div>
            </div>
          </div>
        `
      })

      content += `</div>`
    }

    content += `
      <div class="print-footer">
        <p>Printed from ${database.title} database on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <button class="print-button" onclick="window.print()">Print Records</button>
    `

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${database.title} - ${records.length > 1 ? "Records" : "Record"}</title>
          ${style}
        </head>
        <body>
          ${content}
        </body>
      </html>
    `
  }

  const handlePrint = () => {
    if (printFrameRef.current?.contentWindow) {
      try {
        printFrameRef.current.contentWindow.focus()
        printFrameRef.current.contentWindow.print()
        if (onClose) {
          setTimeout(onClose, 500)
        }
      } catch (error) {
        console.error("Error printing:", error)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <iframe ref={printFrameRef} className="w-full h-[70vh] border rounded" title="Print Preview" />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  )
}

