// @ts-nocheck
"use client"

import React, { useEffect, useState } from "react"
import { journalSync, SyncState } from "./journalSync"
import { RefreshCw } from "lucide-react"

export default function SyncStatusIndicator() {
  const [syncState, setSyncState] = useState<SyncState>("synced")
  const [statusMessage, setStatusMessage] = useState("Synced")

  useEffect(() => {
    const unsubscribe = journalSync.subscribe((state, message) => {
      setSyncState(state)
      setStatusMessage(message)
    })
    return () => unsubscribe()
  }, [])

  const handleSyncClick = () => {
    void journalSync.syncNow()
  }

  const getDotClass = () => {
    switch (syncState) {
      case "syncing":
        return "bg-blue-400 animate-pulse ring-2 ring-blue-400/40"
      case "offline":
        return "bg-amber-400 ring-2 ring-amber-400/40"
      case "error":
        return "bg-red-400 ring-2 ring-red-400/40"
      case "synced":
      default:
        return "bg-emerald-400 ring-2 ring-emerald-400/40"
    }
  }

  const getLabelText = () => {
    switch (syncState) {
      case "syncing":
        return "Syncing…"
      case "offline":
        return "Offline"
      case "error":
        return "Sync error"
      case "synced":
      default:
        return "Synced"
    }
  }

  return (
    <button
      type="button"
      onClick={handleSyncClick}
      title={`${statusMessage} — Click to sync now`}
      aria-label="Supabase Cloud Sync Status"
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors select-none"
    >
      {syncState === "syncing" ? (
        <RefreshCw className="h-3 w-3 text-blue-400 animate-spin" />
      ) : (
        <span className={`h-2 w-2 rounded-full ${getDotClass()}`} />
      )}
      <span className="hidden sm:inline text-[11px] font-semibold text-gray-300">
        {getLabelText()}
      </span>
    </button>
  )
}
