"use client"

import { useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PrintView } from "./print-record"
import type { Database } from "@/lib/types"

interface DatabasePrintButtonProps {
  database: Database
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
  buttonText?: string
  printMode?: "all" | "filtered" | "selected"
  records?: Database["records"] // Optional: specific records to print, default is all
}

export function DatabasePrintButton({
  database,
  variant = "outline",
  size = "sm",
  className = "",
  showText = true,
  buttonText = "Print Database",
  printMode = "all",
  records,
}: DatabasePrintButtonProps) {
  const [showPrintDialog, setShowPrintDialog] = useState(false)

  const recordsToPrint = records || database.records
  const isSingleRecord = recordsToPrint.length === 1

  // Determine the appropriate print title based on the context
  const getPrintTitle = () => {
    if (isSingleRecord) {
      const recordTitle = recordsToPrint[0].values[database.fields[0]?.name] || "Record"
      return `${database.title} - ${recordTitle}`
    } else if (printMode === "filtered") {
      return `${database.title} - Filtered Records`
    } else {
      return `${database.title} - Complete Database`
    }
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setShowPrintDialog(true)}>
        <Printer className="h-4 w-4" />
        {showText && <span className={size === "icon" ? "sr-only" : "ml-2"}>{buttonText}</span>}
      </Button>

      {showPrintDialog && (
        <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-6">
            <DialogHeader>
              <DialogTitle>
                {isSingleRecord
                  ? "Print Record"
                  : printMode === "filtered"
                    ? "Print Filtered Records"
                    : "Print Database"}
              </DialogTitle>
            </DialogHeader>
            <PrintView
              database={database}
              records={recordsToPrint}
              printTitle={getPrintTitle()}
              printMode={printMode}
              onClose={() => setShowPrintDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

