// @ts-nocheck
"use client"

import React, { useState } from "react"
import {
  X,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Zap,
  BarChart3,
  RotateCcw,
  History,
  Palette,
  Download,
  Printer,
  Clock,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Lightbulb,
} from "lucide-react"

interface AgAccountTrackerHelpModalProps {
  isOpen: boolean
  onClose: () => void
  theme?: string
}

export default function AgAccountTrackerHelpModal({
  isOpen,
  onClose,
  theme = "dark",
}: AgAccountTrackerHelpModalProps) {
  const [activeTab, setActiveTab] = useState<"workflow" | "features" | "statuses" | "tips">("workflow")

  if (!isOpen) return null

  return (
    <div
      className="ag-tracker-modal-dialog-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="AG Account Tracker Process Guide & Help"
      style={{ zIndex: 100050 }}
    >
      <div
        className={`ag-tracker-modal-dialog ag-help-dialog journal-theme-${theme}`}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(96vw, 760px)", maxHeight: "90vh" }}
      >
        {/* HEADER */}
        <div className="ag-tracker-modal-dialog-header">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                AG Account Tracker — Process Guide & Help
              </h3>
              <p className="text-xs text-gray-400">
                Step-by-step instructions and complete workflow documentation
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ag-tracker-btn ag-tracker-btn-icon"
            onClick={onClose}
            title="Close Help (Esc)"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div
          className="flex border-b border-border px-4 gap-2 pt-2"
          style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
        >
          <button
            type="button"
            className={`ag-tracker-tab pb-2 text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === "workflow" ? "active border-b-2 border-emerald-400 text-emerald-400 font-bold" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("workflow")}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>1. Step-by-Step Process</span>
          </button>

          <button
            type="button"
            className={`ag-tracker-tab pb-2 text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === "features" ? "active border-b-2 border-emerald-400 text-emerald-400 font-bold" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("features")}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>2. Feature Reference</span>
          </button>

          <button
            type="button"
            className={`ag-tracker-tab pb-2 text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === "statuses" ? "active border-b-2 border-emerald-400 text-emerald-400 font-bold" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("statuses")}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>3. Statuses & Timing</span>
          </button>

          <button
            type="button"
            className={`ag-tracker-tab pb-2 text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === "tips" ? "active border-b-2 border-emerald-400 text-emerald-400 font-bold" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("tips")}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>4. Tips & Best Practices</span>
          </button>
        </div>

        {/* BODY */}
        <div className="ag-tracker-modal-dialog-body" style={{ maxHeight: "calc(90vh - 120px)", overflowY: "auto", padding: "1.25rem" }}>
          {/* TAB 1: STEP-BY-STEP WORKFLOW */}
          {activeTab === "workflow" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-3 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-200">
                <strong>What is the AG Account Tracker?</strong>
                <p className="mt-1">
                  Antigravity AI accounts have daily token limits and rate limits that reset every 24 hours. The AG Tracker lets you cycle across up to 8+ accounts with zero downtime by tracking which account is active, when tokens exhaust, and countdowns until they recover.
                </p>
              </div>

              {/* STEP 1 */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    Check Account Readiness (Start of Sprint)
                  </h4>
                  <p className="text-gray-400">
                    Look at the top bar's <span className="text-emerald-400 font-semibold">&quot;X ready&quot;</span> badge or click <strong>Reports</strong>. Accounts with a green <em>&quot;Ready now&quot;</em> badge have rested past their reset time (default 24h) and are 100% available with full token capacity.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    Start Development &amp; Log Start Time
                  </h4>
                  <p className="text-gray-400 mb-2">
                    Click <strong>⚡ Quick Log</strong> in the top bar:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-300">
                    <li>Select the Google Account you are currently logged into.</li>
                    <li>Click the green <strong>&quot;Started using&quot;</strong> button.</li>
                  </ol>
                  <p className="mt-2 text-gray-400">
                    This stamps the exact current time into <strong>Used On</strong>, sets Status to <span className="text-emerald-400 font-semibold">&quot;In use&quot;</span>, and displays a pulsating <span className="text-emerald-400">&quot;Currently using: [Account]&quot;</span> badge in the header.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    During Prompting — Monitor Tokens
                  </h4>
                  <p className="text-gray-400">
                    If you get a warning that token quota is getting low, click <strong>Quick Log</strong> ➔ <strong>&quot;Running low&quot;</strong> to flag the account as amber <span className="text-amber-400 font-semibold">&quot;Low&quot;</span>. This gives you a visual reminder that an account switch is coming soon.
                  </p>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-red-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    Quota Exhausted — Log Out of Tokens
                  </h4>
                  <p className="text-gray-400 mb-2">
                    When Antigravity hits its daily rate limit:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-300">
                    <li>Open <strong>⚡ Quick Log</strong> and click <strong>&quot;Out of tokens&quot;</strong>.</li>
                    <li>Choose your reset duration (default 24h, 12h, 5h, or custom).</li>
                  </ol>
                  <p className="mt-2 text-gray-400">
                    Status turns red <span className="text-red-400 font-semibold">&quot;Out&quot;</span>, and the system automatically calculates the exact <strong>Next Available</strong> date and time, starting the live recovery countdown.
                  </p>
                </div>
              </div>

              {/* STEP 5 */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  5
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    Switch to the Next Available Account
                  </h4>
                  <p className="text-gray-400">
                    Click <strong>📊 Reports</strong> ➔ <strong>Next Available Report</strong>. The report ranks your accounts so you instantly see who is ready next (or ready right now!). Switch accounts in Antigravity, click <strong>&quot;Started using&quot;</strong>, and continue working without waiting!
                  </p>
                </div>
              </div>

              {/* STEP 6 */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  6
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    Complete Cycle &amp; Archive to History
                  </h4>
                  <p className="text-gray-400">
                    When you finish cycling through all accounts or start a new sprint, click <strong>🔄 New Cycle</strong>. The tracker automatically saves an archived snapshot of your entire table into <strong>History</strong> and clears the rows for your next cycle, while preserving account carryover readiness!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURES REFERENCE */}
          {activeTab === "features" && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-400 mb-1">
                    <Zap className="h-4 w-4" />
                    <span>Quick Log</span>
                  </div>
                  <p className="text-gray-400">
                    Fast 1-click status logger. Select account, hit <em>Started using</em>, <em>Out of tokens</em>, or <em>Running low</em>. Avoids manual date typing.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 font-bold text-sm text-blue-400 mb-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>Reports &amp; Analytics</span>
                  </div>
                  <p className="text-gray-400">
                    Live overview of all accounts. <strong>Used Report</strong> sorts by usage history; <strong>Next Available Report</strong> shows countdowns until recovery.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 font-bold text-sm text-sky-400 mb-1">
                    <RotateCcw className="h-4 w-4" />
                    <span>New Cycle</span>
                  </div>
                  <p className="text-gray-400">
                    Safely archives the active cycle into History and clears entries for a clean slate. Readiness data is preserved so cooldown clocks keep ticking.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-400 mb-1">
                    <History className="h-4 w-4" />
                    <span>History &amp; Restore</span>
                  </div>
                  <p className="text-gray-400">
                    Review past cycle archives with dates and row counts. Click <em>Restore</em> at any time to recover any previous cycle into your active view.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 font-bold text-sm text-pink-400 mb-1">
                    <Palette className="h-4 w-4" />
                    <span>Display Themes</span>
                  </div>
                  <p className="text-gray-400">
                    Choose between <strong>Dark</strong>, <strong>Light</strong>, <strong>OLED</strong>, and <strong>Cyberpunk</strong>. Automatically synchronized with the Journal settings.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-400 mb-1">
                    <Download className="h-4 w-4" />
                    <span>Export / Import / Print</span>
                  </div>
                  <p className="text-gray-400">
                    Export full JSON backups for safe keeping; import on other devices. Print generates clean US Letter formatted tracking sheets.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <h4 className="font-bold text-sm text-foreground mb-1">
                  Managing Custom Accounts &amp; Reset Hours
                </h4>
                <p className="text-gray-400">
                  Click any Google Account dropdown and select <strong>&quot;Manage Options...&quot;</strong>. Here you can add new Google account names, remove custom ones, and configure per-account recovery times (e.g. 5h for paid tiers, 24h for free accounts).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: STATUSES & TIMING */}
          {activeTab === "statuses" && (
            <div className="space-y-3.5 text-xs">
              <p className="text-gray-400">
                The tracker uses standardized status badges and colors to give you instant situational awareness of token availability:
              </p>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-white">In use</span>
                    <span className="font-semibold text-emerald-300">Actively developing</span>
                  </div>
                  <span className="text-gray-300">Account currently logged in and consuming tokens</span>
                </div>

                <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white">Low</span>
                    <span className="font-semibold text-amber-300">Running low on tokens</span>
                  </div>
                  <span className="text-gray-300">Approaching daily quota threshold</span>
                </div>

                <div className="p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500 text-white">Out</span>
                    <span className="font-semibold text-red-300">Quota exhausted</span>
                  </div>
                  <span className="text-gray-300">Tokens depleted; recovery clock is actively counting down</span>
                </div>

                <div className="p-2.5 rounded-lg border border-sky-500/30 bg-sky-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500 text-white">Ready now</span>
                    <span className="font-semibold text-sky-300">Available to use</span>
                  </div>
                  <span className="text-gray-300">24+ hours elapsed since last runout; ready for full duty</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card mt-3">
                <h4 className="font-bold text-sm text-foreground mb-1">
                  How Next Available Is Computed
                </h4>
                <p className="text-gray-400">
                  When you select <em>Out of tokens</em> in Quick Log, the system reads that account&apos;s recovery hours (default 24 hours, or your custom configuration) and adds it to the current time. In the table, you can also use the <strong>Quick Choice</strong> dropdown on Next Available to instantly calculate +24h, +12h, +5h, or +3 days.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TIPS & FAQ */}
          {activeTab === "tips" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="font-bold text-sm text-emerald-400 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tip 1: Seamless 24h Quota Rotation</span>
                </div>
                <p className="text-gray-400">
                  With 8 Google accounts and a 24h recovery window, cycling through 3–4 accounts per day guarantees you never hit a brick wall. By the time you reach Account 5, Account 1 has already recovered its full capacity.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="font-bold text-sm text-blue-400 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tip 2: Full-Screen Notes for Prompt History</span>
                </div>
                <p className="text-gray-400">
                  Click the ⛶ expand icon on any Notes box to open the distraction-free Full-Screen Editor. Use it to store your active project context, model preferences, or bug notes.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="font-bold text-sm text-purple-400 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tip 3: Keyboard Shortcuts &amp; Fast Navigation</span>
                </div>
                <p className="text-gray-400">
                  Press <strong>Escape</strong> at any time to close popups and modals in reverse order. In the bottom navigation, tap <strong>AG Tracker</strong> to open the modal; tap any other view (Home, Favorites, To-Do, Settings) to auto-save and switch in a single tap!
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="font-bold text-sm text-amber-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Offline &amp; Local Auto-Save</span>
                </div>
                <p className="text-gray-400">
                  All AG Tracker data is stored exclusively in your browser&apos;s local storage. It never sends your personal Google Account names to external servers. Use <em>Export JSON</em> once a week to keep offline backups of your cycles.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="p-3 border-t border-border flex items-center justify-between"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        >
          <span className="text-[11px] text-gray-400">
            AG Account Tracker • Antigravity 2.0 Multi-Account Management
          </span>
          <button
            type="button"
            className="ag-tracker-btn ag-tracker-btn-primary px-4 py-1.5 text-xs font-semibold"
            onClick={onClose}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}
