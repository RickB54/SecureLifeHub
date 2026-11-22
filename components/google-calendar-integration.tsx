"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  AlertCircle,
  Check,
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Shield,
  LogOut,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { GoogleCalendarItem, GoogleCalendarEventItem } from "@/lib/google-calendar"

interface GoogleCalendarIntegrationProps {
  theme: string
  existingAppointments: any[]
  onScheduleAppointment: () => void
  onEventsLoaded?: (events: GoogleCalendarEventItem[]) => void
  onConnectionChange?: (connected: boolean) => void
}

const STORAGE_KEY_SELECTED_CALS = "slh_gcal_selected_calendars"

export default function GoogleCalendarIntegration({
  theme,
  existingAppointments,
  onScheduleAppointment,
  onEventsLoaded,
  onConnectionChange,
}: GoogleCalendarIntegrationProps) {
  const { session } = useAuth()
  const accessToken = session?.access_token

  const [isConnected, setIsConnected] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [calendars, setCalendars] = useState<GoogleCalendarItem[]>([])
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SELECTED_CALS)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return []
  })

  const [events, setEvents] = useState<GoogleCalendarEventItem[]>([])
  const [cachedAt, setCachedAt] = useState<number | null>(null)

  // 1. Check connection status
  const checkStatus = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await fetch("/api/google-calendar/status", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()
      setIsConnected(!!data.connected)
      setIsExpired(!!data.expired)
      onConnectionChange?.(!!data.connected && !data.expired)
      return data
    } catch (e: any) {
      console.error("Status check failed:", e)
      setIsConnected(false)
      onConnectionChange?.(false)
      return { connected: false }
    }
  }, [accessToken, onConnectionChange])

  // 2. Fetch calendars
  const loadCalendars = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await fetch("/api/google-calendar/calendars", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()

      if (data.expired) {
        setIsExpired(true)
        toast.error("Google Calendar session expired. Please click Reconnect.")
        return
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to load calendars")
      }

      const list: GoogleCalendarItem[] = data.calendars || []
      setCalendars(list)

      // Set initial selected calendars if none selected yet
      setSelectedCalendarIds((prev) => {
        if (prev.length > 0) return prev
        const primary = list.find((c) => c.primary)
        const initial = primary ? [primary.id] : list.map((c) => c.id)
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_SELECTED_CALS, JSON.stringify(initial))
        }
        return initial
      })
    } catch (e: any) {
      setError(e.message)
    }
  }, [accessToken])

  // 3. Fetch events (Next 60 days, cached for 10 minutes)
  const loadEvents = useCallback(
    async (forceRefresh = false) => {
      if (!accessToken || selectedCalendarIds.length === 0) {
        setEvents([])
        onEventsLoaded?.([])
        return
      }

      if (forceRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          calendarIds: selectedCalendarIds.join(","),
        })
        if (forceRefresh) params.set("refresh", "true")

        const res = await fetch(`/api/google-calendar/events?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()

        if (data.expired) {
          setIsExpired(true)
          toast.error("Google Calendar session expired. Please click Reconnect.")
          return
        }

        if (!res.ok) {
          throw new Error(data.error || "Failed to load calendar events")
        }

        const loadedEvents: GoogleCalendarEventItem[] = data.events || []
        setEvents(loadedEvents)
        if (data.cachedAt) setCachedAt(data.cachedAt)
        onEventsLoaded?.(loadedEvents)

        if (forceRefresh) {
          toast.success("Calendar events refreshed")
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [accessToken, selectedCalendarIds, onEventsLoaded]
  )

  // 4. Handle OAuth connect initiation
  const handleConnect = async () => {
    if (!accessToken) {
      toast.error("Please sign in to Secure Life Hub first.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/google-calendar/auth-url", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.needsConfig) {
          setError(
            `Google OAuth credentials missing.\n\nPlease set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.\nRedirect URI: ${data.redirectUri}`
          )
          return
        }
        throw new Error(data.error || "Failed to start Google connection")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (e: any) {
      setError(e.message)
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 5. Handle OAuth Callback from URL param (?gcal_code=...)
  useEffect(() => {
    if (typeof window === "undefined" || !accessToken) return

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("gcal_code")
    const gcalError = urlParams.get("gcal_error")

    if (gcalError) {
      toast.error(`Google Calendar connection failed: ${gcalError}`)
      urlParams.delete("gcal_error")
      window.history.replaceState({}, "", `${window.location.pathname}?${urlParams.toString()}`)
      return
    }

    if (code) {
      setIsLoading(true)
      fetch("/api/google-calendar/connect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsConnected(true)
            setIsExpired(false)
            onConnectionChange?.(true)
            toast.success("Google Calendar connected successfully!")
            loadCalendars()
          } else {
            toast.error(data.error || "Failed to complete Google Calendar connection")
            setError(data.error)
          }
        })
        .catch((err) => {
          console.error("Connect code exchange failed:", err)
          toast.error("Failed to complete Google Calendar connection")
        })
        .finally(() => {
          setIsLoading(false)
          urlParams.delete("gcal_code")
          urlParams.delete("gcal_state")
          const newSearch = urlParams.toString()
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`
          )
        })
    }
  }, [accessToken, onConnectionChange, loadCalendars])

  // 6. Initial check on mount
  useEffect(() => {
    if (accessToken) {
      checkStatus().then((res) => {
        if (res?.connected && !res.expired) {
          loadCalendars()
        }
      })
    }
  }, [accessToken, checkStatus, loadCalendars])

  // 7. Load events whenever selected calendars change
  useEffect(() => {
    if (isConnected && !isExpired && selectedCalendarIds.length > 0) {
      loadEvents()
    }
  }, [isConnected, isExpired, selectedCalendarIds, loadEvents])

  // Toggle calendar selection
  const handleToggleCalendar = (calId: string) => {
    setSelectedCalendarIds((prev) => {
      let updated: string[]
      if (prev.includes(calId)) {
        updated = prev.filter((id) => id !== calId)
      } else {
        updated = [...prev, calId]
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_SELECTED_CALS, JSON.stringify(updated))
      }
      return updated
    })
  }

  // Handle Disconnect
  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Calendar? This revokes access and removes saved tokens.")) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()

      if (data.success) {
        setIsConnected(false)
        setIsExpired(false)
        setCalendars([])
        setEvents([])
        onEventsLoaded?.([])
        onConnectionChange?.(false)
        toast.success("Google Calendar disconnected")
      } else {
        throw new Error(data.error || "Failed to disconnect")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Group events by Date header (Next 60 days)
  const groupedEvents = useMemo(() => {
    const groups: { [dateStr: string]: { label: string; dateObj: Date; items: GoogleCalendarEventItem[] } } = {}

    for (const ev of events) {
      const startStr = ev.start.dateTime || ev.start.date
      if (!startStr) continue

      const d = new Date(startStr)
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

      if (!groups[dateKey]) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

        const eventDay = new Date(d)
        eventDay.setHours(0, 0, 0, 0)

        let label = d.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })

        if (eventDay.getTime() === today.getTime()) {
          label = `Today – ${label}`
        } else if (eventDay.getTime() === tomorrow.getTime()) {
          label = `Tomorrow – ${label}`
        }

        groups[dateKey] = { label, dateObj: d, items: [] }
      }

      groups[dateKey].items.push(ev)
    }

    return Object.keys(groups)
      .sort()
      .map((k) => groups[k])
  }, [events])

  // Helper format event time
  const formatEventTime = (ev: GoogleCalendarEventItem) => {
    if (ev.start.date && !ev.start.dateTime) {
      return "All Day"
    }
    if (ev.start.dateTime) {
      const start = new Date(ev.start.dateTime)
      const startStr = start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      if (ev.end?.dateTime) {
        const end = new Date(ev.end.dateTime)
        const endStr = end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        return `${startStr} – ${endStr}`
      }
      return startStr
    }
    return ""
  }

  // Not connected view
  if (!isConnected) {
    return (
      <div
        className={`rounded-3xl border p-6 md:p-8 text-center transition-all ${
          theme === "light"
            ? "bg-white border-gray-200 shadow-sm"
            : "bg-slate-900/60 border-slate-800 backdrop-blur-md"
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <CalendarIcon className="h-8 w-8" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-100">Connect Google Calendar</h3>
        <p className="text-sm max-w-md mx-auto mb-6 text-slate-400">
          Connect your Google Calendar to view upcoming events, select which calendars to display, and automatically detect scheduling conflicts when booking visits.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs md:text-sm text-amber-300 text-left max-w-lg mx-auto whitespace-pre-wrap">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Connecting...
            </span>
          ) : (
            "Connect Google Calendar"
          )}
        </button>
      </div>
    )
  }

  // Connected view
  return (
    <div
      className={`rounded-3xl border p-5 md:p-6 space-y-6 transition-all ${
        theme === "light"
          ? "bg-white border-gray-200 shadow-sm"
          : "bg-slate-900/60 border-slate-800 backdrop-blur-md"
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2">
              Google Calendar
            </h3>
            {isExpired && (
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
                Session Expired
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {selectedCalendarIds.length} of {calendars.length} calendars selected • Next 60 days
            {cachedAt && (
              <span className="opacity-70 ml-1">
                (cached {new Date(cachedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          {/* Reconnect button if expired */}
          {isExpired && (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reconnect
            </button>
          )}

          {/* Refresh on-demand */}
          <button
            onClick={() => loadEvents(true)}
            disabled={isRefreshing || isLoading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title="Refresh events (caches for 10 minutes)"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Schedule button */}
          <button
            onClick={onScheduleAppointment}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Schedule Visit
          </button>

          {/* Disconnect button */}
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Disconnect Google Calendar"
          >
            <LogOut className="h-3.5 w-3.5" /> Disconnect
          </button>
        </div>
      </div>

      {/* 2. Calendars Selector with Checkboxes */}
      <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Choose Calendars to Display
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const allIds = calendars.map((c) => c.id)
                setSelectedCalendarIds(allIds)
                if (typeof window !== "undefined") {
                  localStorage.setItem(STORAGE_KEY_SELECTED_CALS, JSON.stringify(allIds))
                }
              }}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Select All
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => {
                setSelectedCalendarIds([])
                if (typeof window !== "undefined") {
                  localStorage.setItem(STORAGE_KEY_SELECTED_CALS, JSON.stringify([]))
                }
              }}
              className="text-[11px] text-slate-400 hover:text-slate-300 font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {calendars.map((cal) => {
            const isSelected = selectedCalendarIds.includes(cal.id)
            const color = cal.backgroundColor || "#3b82f6"

            return (
              <label
                key={cal.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-slate-700"
                    : "bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-90"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleCalendar(cal.id)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-slate-200 truncate flex-1">
                  {cal.summary}
                  {cal.primary && <span className="ml-1 text-[10px] text-blue-400">(Primary)</span>}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* 3. Upcoming Events Area (Next 60 days, grouped by date, color-coded) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Upcoming Events ({events.length})
          </h4>
          <span className="text-xs text-slate-500">Next 60 days</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span>Loading calendar events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-slate-500 rounded-2xl border border-dashed border-slate-800">
            <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No upcoming events found in selected calendars.</p>
          </div>
        ) : (
          <div className="space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {groupedEvents.map((group) => (
              <div key={group.label} className="space-y-2">
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>{group.label}</span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {group.items.length} event{group.items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Event Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {group.items.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3 relative overflow-hidden"
                      style={{ borderLeftWidth: "4px", borderLeftColor: ev.calendarColor }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${ev.calendarColor}25`,
                              color: ev.calendarColor,
                            }}
                          >
                            {ev.calendarName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatEventTime(ev)}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-100 truncate">{ev.summary}</h5>
                        {ev.location && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                            {ev.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
