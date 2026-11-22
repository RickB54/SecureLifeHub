import { NextResponse } from "next/server"
import { getAuthenticatedSupabase } from "@/lib/supabase-server"
import { getValidAccessToken } from "@/lib/google-calendar"

export async function GET(req: Request) {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase(req)

    const accessToken = await getValidAccessToken(supabase, userId)

    // Request calendar list with fields filter for minimal egress & quota
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList?fields=items(id,summary,backgroundColor,primary,selected)",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await res.json()
    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          { error: "Google session expired. Please reconnect.", expired: true },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: data.error?.message || "Failed to load calendars" },
        { status: res.status }
      )
    }

    const calendars = (data.items || []).map((c: any) => ({
      id: c.id,
      summary: c.summary,
      backgroundColor: c.backgroundColor || "#3b82f6",
      primary: !!c.primary,
      selected: !!c.selected,
    }))

    return NextResponse.json({ calendars })
  } catch (error: any) {
    const isExpired = error.code === "TOKEN_EXPIRED"
    return NextResponse.json(
      { error: error.message || "Failed to fetch calendars", expired: isExpired },
      { status: isExpired ? 401 : 500 }
    )
  }
}
