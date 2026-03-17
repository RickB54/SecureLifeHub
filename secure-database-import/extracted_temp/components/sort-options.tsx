"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

interface SortOptionsProps {
  onSortChange: (sortOption: string) => void
}

export function SortOptions({ onSortChange }: SortOptionsProps) {
  const [selectedSort, setSelectedSort] = useState("lastUpdated-desc")

  const handleSortChange = (value: string) => {
    setSelectedSort(value)
    onSortChange(value)
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Sort Records</SheetTitle>
        <SheetDescription>Choose how to sort your records</SheetDescription>
      </SheetHeader>

      <div className="py-4">
        <RadioGroup value={selectedSort} onValueChange={handleSortChange}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lastUpdated-desc" id="lastUpdated-desc" />
              <Label htmlFor="lastUpdated-desc">Last Updated (Newest First)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lastUpdated-asc" id="lastUpdated-asc" />
              <Label htmlFor="lastUpdated-asc">Last Updated (Oldest First)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="created-desc" id="created-desc" />
              <Label htmlFor="created-desc">Created Date (Newest First)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="created-asc" id="created-asc" />
              <Label htmlFor="created-asc">Created Date (Oldest First)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="title-asc" id="title-asc" />
              <Label htmlFor="title-asc">Title (A-Z)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="title-desc" id="title-desc" />
              <Label htmlFor="title-desc">Title (Z-A)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="priority-desc" id="priority-desc" />
              <Label htmlFor="priority-desc">Priority (High to Low)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dueDate-asc" id="dueDate-asc" />
              <Label htmlFor="dueDate-asc">Due Date (Soonest First)</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSortChange(selectedSort)}>Apply Sort</Button>
      </div>
    </>
  )
}

