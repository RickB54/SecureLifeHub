import { NextResponse } from "next/server"
import { getAuthenticatedSupabase } from "@/lib/supabase-server"
import {
  getValidAccessToken,
  getCachedData,
  setCachedData,
  GoogleCalendarEventItem,
} from "@/lib/google-calendar"

export async function GET(req: Request) {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase(req)

    const url = new URL(req.url)
    const calendarIdsParam = url.searchParams.get("calendarIds")
    const forceRefresh = url.searchParams.get("refresh") === "true"

    if (!calendarIdsParam) {
      return NextResponse.json({ events: [], cached: false })
    }

    const calendarIds = calendarIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)

    if (calendarIds.length === 0) {
      return NextResponse.json({ events: [], cached: false })
    }

    // Cache key based on user and sorted calendar IDs
    const cacheKey = `events:${userId}:${calendarIds.slice().sort().join(",")}`

    if (!forceRefresh) {
      const cached = getCachedData<GoogleCalendarEventItem[]>(cacheKey)
      if (cached) {
        return NextResponse.json({
          events: cached.data,
          cached: true,
          cachedAt: cached.cachedAt,
          expiresAt: cached.expiresAt,
        })
      }
    }

    const accessToken = await getValidAccessToken(supabase, userId)

    // Calculate next 60 days
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    sixtyDaysLater.setHours(23, 59, 59, 999)

    const timeMin = now.toISOString()
    const timeMax = sixtyDaysLater.toISOString()

    // First, fetch calendar details for background colors and names
    const calListRes = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList?fields=items(id,summary,backgroundColor)",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const calListData = await calListRes.json()
    const calMap = new Map<string, { summary: string; backgroundColor: string }>()
    if (calListData.items) {
      for (const item of calListData.items) {
        calMap.set(item.id, {
          summary: item.summary,
          backgroundColor: item.backgroundColor || "#3b82f6",
        })
      }
    }

    // Fetch events in parallel for selected calendars with singleEvents=true and fields parameter
    const eventPromises = calendarIds.map(async (calId) => {
      try {
        const calInfo = calMap.get(calId) || {
          summary: calId === "primary" ? "Primary" : calId,
          backgroundColor: "#3b82f6",
        }

        const queryParams = new URLSearchParams({
          singleEvents: "true",
          orderBy: "startTime",
          timeMin,
          timeMax,
          maxResults: "250",
          fields: "items(id,summary,start,end,location,description,colorId,status)",
        })

        const evRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?${queryParams.toString()}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        if (!evRes.ok) {
          console.warn(`Failed to fetch events for calendar ${calId}:`, evRes.status)
          return []
        }

        const evData = await evRes.json()
        const items = evData.items || []

        return items
          .filter((e: any) => e.status !== "cancelled")
          .map((e: any): GoogleCalendarEventItem => ({
            id: e.id,
            summary: e.summary || "(No Title)",
            start: e.start || {},
            end: e.end || {},
            location: e.location,
            description: e.description,
            colorId: e.colorId,
            calendarId: calId,
            calendarName: calInfo.summary,
            calendarColor: calInfo.backgroundColor,
          }))
      } catch (err) {
        console.error(`Error fetching events for ${calId}:`, err)
        return []
      }
    })

    const results = await Promise.all(eventPromises)
    const allEvents = results.flat()

    // Sort by start time ascending
    allEvents.sort((a, b) => {
      const aTime = new Date(a.start.dateTime || a.start.date || 0).getTime()
      const bTime = new Date(b.start.dateTime || b.start.date || 0).getTime()
      return aTime - bTime
    })

    // Store in 10-minute cache
    setCachedData(cacheKey, allEvents)

    const nowMs = Date.now()
    return NextResponse.json({
      events: allEvents,
      cached: false,
      cachedAt: nowMs,
      expiresAt: nowMs + 10 * 60 * 1000,
    })
  } catch (error: any) {
    const isExpired = error.code === "TOKEN_EXPIRED"
    return NextResponse.json(
      { error: error.message || "Failed to fetch events", expired: isExpired },
      { status: isExpired ? 401 : 500 }
    )
  }
}
