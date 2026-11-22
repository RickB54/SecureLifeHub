import { NextResponse } from "next/server"
import { getAuthenticatedSupabase } from "@/lib/supabase-server"
import { getValidAccessToken, invalidateUserCache } from "@/lib/google-calendar"

export async function POST(req: Request) {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase(req)
    const body = await req.json()
    const { start, end, calendarId = "primary" } = body

    if (!start) {
      return NextResponse.json({ error: "Start time is required" }, { status: 400 })
    }

    const accessToken = await getValidAccessToken(supabase, userId)

    // Calculate end time (default to start + 1 hour if not provided)
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60 * 1000)

    // Strictly generic title - NO medical details in Google
    const eventPayload = {
      summary: "Doctor appointment",
      start: {
        dateTime: startDate.toISOString(),
      },
      end: {
        dateTime: endDate.toISOString(),
      },
    }

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      }
    )

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Failed to create Google Calendar event" },
        { status: res.status }
      )
    }

    // Invalidate cached events so new event shows on next fetch
    invalidateUserCache(userId)

    return NextResponse.json({
      success: true,
      event: {
        id: data.id,
        summary: data.summary,
        start: data.start,
        end: data.end,
        htmlLink: data.htmlLink,
      },
    })
  } catch (error: any) {
    const isExpired = error.code === "TOKEN_EXPIRED"
    return NextResponse.json(
      { error: error.message || "Failed to create event", expired: isExpired },
      { status: isExpired ? 401 : 500 }
    )
  }
}
