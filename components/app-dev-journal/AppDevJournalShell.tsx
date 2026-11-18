"use client"

import dynamic from "next/dynamic"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import SyncStatusIndicator from "./sync/SyncStatusIndicator"

// Dynamic import with ssr:false — the journal uses localStorage, window, Web Speech API
const AppDevJournalInner = dynamic(
  () => import("./AppDevJournalInner"),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full bg-[#121212]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )}
)

interface AppDevJournalShellProps {
  setActivePage?: (page: string) => void
  theme?: string
}

export default function AppDevJournalShell({ setActivePage, theme }: AppDevJournalShellProps) {
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isTrackerOpen, setIsTrackerOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleTrackerChange = (e: any) => {
      if (typeof e.detail?.isOpen === "boolean") {
        setIsTrackerOpen(e.detail.isOpen)
      }
    }
    const handleTrackerOpen = () => setIsTrackerOpen(true)
    const handleTrackerClose = () => setIsTrackerOpen(false)

    window.addEventListener("slh_tracker_state_changed", handleTrackerChange)
    window.addEventListener("slh_open_ag_tracker", handleTrackerOpen)
    window.addEventListener("slh_close_ag_tracker", handleTrackerClose)

    return () => {
      window.removeEventListener("slh_tracker_state_changed", handleTrackerChange)
      window.removeEventListener("slh_open_ag_tracker", handleTrackerOpen)
      window.removeEventListener("slh_close_ag_tracker", handleTrackerClose)
    }
  }, [])

  const handleExitClick = () => {
    if (isTrackerOpen) {
      window.dispatchEvent(new CustomEvent("slh_close_ag_tracker"))
      setIsTrackerOpen(false)
    } else {
      setShowExitDialog(true)
    }
  }

  return (
    <>
      {/* Full-height container that fills SLH's main scroll area */}
      <div
        className="flex flex-col min-h-full bg-[#121212] text-white relative"
      >
        {/* Journal top bar — EXIT button (matches GDFT pattern) */}
        <header className="sticky top-0 flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#121212] z-40 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExitClick}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
              title={
                isTrackerOpen
                  ? "Exit AG Account Tracker and return to Journal"
                  : "Exit App Dev Journal and return to Secure Life Hub"
              }
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="tracking-wide uppercase">
                {isTrackerOpen ? "EXIT TRACKER" : "EXIT Journal"}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-widest text-violet-400 uppercase">
              {isTrackerOpen ? "AG ACCOUNT TRACKER" : "App Dev Journal"}
            </span>
          </div>
          <div className="flex items-center justify-end min-w-[90px]">
            <SyncStatusIndicator />
          </div>
        </header>

        {/* Journal app — ssr:false dynamic import */}
        <div className="flex-1">
          <AppDevJournalInner />
        </div>
      </div>

      {/* Exit confirmation dialog — same pattern as GDFT */}
      {showExitDialog && (
        <>
          <div
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setShowExitDialog(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            style={{ background: "linear-gradient(180deg, #0f172a 0%, #080d1a 100%)", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(239,68,68,0.15)" }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                <ArrowLeft className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-black italic tracking-tight text-white uppercase">
                Exit App Dev Journal?
              </h3>
              <p className="text-xs text-gray-400 mt-1 mb-6">
                You&apos;ll return to Secure Life Hub
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowExitDialog(false)}
                  className="py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitDialog(false)
                    if (setActivePage) setActivePage("dashboard")
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
