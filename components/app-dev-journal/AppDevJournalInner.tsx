// @ts-nocheck
"use client"

/**
 * AppDevJournalInner.tsx
 *
 * Client-only wrapper for the App Dev Journal.
 * Renders the journal's Root component inside an isolated .journal-root div.
 *
 * PATCHES (minimal, per integration requirements):
 *  1. Scoped journal CSS imported from journal-scoped.css (compiled Tailwind v4, scoped under .journal-root)
 *  2. window.scrollTo calls → redirect to #main-scroll-container (patches applied via monkey-patch on mount)
 *  3. document.documentElement.classList.toggle('journal-theme-light', ...) → toggled on the .journal-root div instead
 *
 * The original journal source in ./journal/ is UNTOUCHED.
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import App from "./journal/App"
import AgAccountTrackerModal from "./AgAccountTrackerModal"
import { journalSync } from "./sync/journalSync"

// Import scoped journal CSS (compiled Tailwind v4, scoped under .journal-root)
import "./journal-scoped.css"
import "./ag-tracker.css"

// Google OAuth client ID — left exactly as-is per integration requirements
const GOOGLE_CLIENT_ID = "15diamondbilliards.apps.googleusercontent.com"

export default function AppDevJournalInner() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isTrackerOpen, setIsTrackerOpen] = useState(false)
  const [mountKey, setMountKey] = useState(0)

  // Notify parent/shell when tracker opens or closes
  const handleOpenTracker = useCallback(() => {
    setIsTrackerOpen(true)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("slh_tracker_state_changed", { detail: { isOpen: true } }))
    }
  }, [])

  const handleCloseTracker = useCallback(() => {
    setIsTrackerOpen(false)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("slh_tracker_state_changed", { detail: { isOpen: false } }))
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener("slh_open_ag_tracker", handleOpenTracker)
    window.addEventListener("slh_close_ag_tracker", handleCloseTracker)

    const handleRemount = () => {
      setMountKey((prev) => prev + 1)
    }
    window.addEventListener("slh_remount_journal", handleRemount)

    // Mount Supabase sync interception & trigger initial reconcile on open
    journalSync.mount()
    void journalSync.reconcileOnOpen()

    // PATCH 1: Redirect window.scrollTo to #main-scroll-container
    // The journal calls window.scrollTo({ top: 0, behavior: 'smooth' }) for back-to-top.
    // Inside SLH the scrollable area is #main-scroll-container, not window.
    const originalScrollTo = window.scrollTo.bind(window)
    const patchedScrollTo = function(optionsOrX?: ScrollToOptions | number, y?: number) {
      const container = document.getElementById("main-scroll-container")
      if (container) {
        if (typeof optionsOrX === "object") {
          container.scrollTo(optionsOrX)
        } else {
          container.scrollTo(optionsOrX ?? 0, y ?? 0)
        }
      } else {
        // Fallback to original if container not found
        if (typeof optionsOrX === "object") {
          originalScrollTo(optionsOrX)
        } else {
          originalScrollTo(optionsOrX ?? 0, y ?? 0)
        }
      }
    }
    window.scrollTo = patchedScrollTo as typeof window.scrollTo

    // PATCH 2: Redirect document.documentElement.classList.toggle for journal-theme-light
    // The journal does: document.documentElement.classList.toggle('journal-theme-light', value)
    // We redirect this to the .journal-root div instead so it doesn't affect SLH's <html>.
    const rootEl = rootRef.current
    if (rootEl) {
      const originalClassList = document.documentElement.classList
      const originalToggle = originalClassList.toggle.bind(originalClassList)
      const originalAdd = originalClassList.add.bind(originalClassList)
      const originalRemove = originalClassList.remove.bind(originalClassList)

      document.documentElement.classList.toggle = function(token: string, force?: boolean) {
        if (token.startsWith("journal-")) {
          return typeof force === "boolean"
            ? rootEl.classList.toggle(token, force)
            : rootEl.classList.toggle(token)
        }
        return typeof force === "boolean"
          ? originalToggle(token, force)
          : originalToggle(token)
      }

      document.documentElement.classList.add = function(...tokens: string[]) {
        const journalTokens = tokens.filter(t => t.startsWith("journal-"))
        const otherTokens = tokens.filter(t => !t.startsWith("journal-"))
        if (journalTokens.length > 0) rootEl.classList.add(...journalTokens)
        if (otherTokens.length > 0) originalAdd(...otherTokens)
      }

      document.documentElement.classList.remove = function(...tokens: string[]) {
        const journalTokens = tokens.filter(t => t.startsWith("journal-"))
        const otherTokens = tokens.filter(t => !t.startsWith("journal-"))
        if (journalTokens.length > 0) rootEl.classList.remove(...journalTokens)
        if (otherTokens.length > 0) originalRemove(...otherTokens)
      }
    }

    return () => {
      window.removeEventListener("slh_open_ag_tracker", handleOpenTracker)
      window.removeEventListener("slh_close_ag_tracker", handleCloseTracker)
      window.removeEventListener("slh_remount_journal", handleRemount)
      journalSync.unmount()
      // Restore original window.scrollTo on unmount
      window.scrollTo = originalScrollTo as typeof window.scrollTo
      // Restore classList methods
      if (rootEl) {
        const originalClassList2 = document.documentElement.classList
        const proto = Object.getPrototypeOf(originalClassList2)
        document.documentElement.classList.toggle = proto.toggle.bind(originalClassList2)
        document.documentElement.classList.add = proto.add.bind(originalClassList2)
        document.documentElement.classList.remove = proto.remove.bind(originalClassList2)
      }
    }
  }, [])

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/*
        .journal-root is the CSS isolation boundary.
        All journal-scoped.css rules are prefixed with .journal-root
        so journal styles only apply inside this div and cannot leak into SLH.
        The journal's own bg-[#121212] + text-white sets the base theme.
      */}
      <div
        ref={rootRef}
        className="journal-root"
        style={{ isolation: "isolate" }}
      >
        <App key={mountKey} />
        <AgAccountTrackerModal
          isOpen={isTrackerOpen}
          onClose={handleCloseTracker}
        />
      </div>
    </GoogleOAuthProvider>
  )
}
