"use client"

import { useState } from "react"
import { SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SortDropdownProps {
  onSortChange: (sortOption: string) => void
}

export function SortDropdown({ onSortChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("lastUpdated-desc")

  const handleSelect = (newValue: string) => {
    setValue(newValue)
    onSortChange(newValue)
    setOpen(false) // Close the dropdown immediately
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SortDesc className="h-4 w-4" />
          <span className="hidden sm:inline">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={handleSelect}>
          <DropdownMenuRadioItem value="lastUpdated-desc">Last Updated (Newest First)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="lastUpdated-asc">Last Updated (Oldest First)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="created-desc">Created Date (Newest First)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="created-asc">Created Date (Oldest First)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="title-asc">Title (A-Z)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="title-desc">Title (Z-A)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="priority-desc">Priority (High to Low)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dueDate-asc">Due Date (Soonest First)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

