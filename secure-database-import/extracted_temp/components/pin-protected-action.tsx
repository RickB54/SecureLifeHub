"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getCurrentPin } from "@/lib/constants"

interface PinProtectedActionProps {
  pin: string
  onConfirm: () => void
  trigger: React.ReactNode
}

export function PinProtectedAction({ pin, onConfirm, trigger }: PinProtectedActionProps) {
  const [open, setOpen] = useState(false)
  const [enteredPin, setEnteredPin] = useState("")
  const [error, setError] = useState(false)

  const handleConfirm = () => {
    if (enteredPin === getCurrentPin()) {
      setOpen(false)
      setEnteredPin("")
      setError(false)
      onConfirm()
    } else {
      setError(true)
    }
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter PIN</DialogTitle>
            <DialogDescription>This action requires PIN verification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value)
                setError(false)
              }}
            />
            {error && <p className="text-sm text-destructive">Incorrect PIN</p>}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  setEnteredPin("")
                  setError(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

