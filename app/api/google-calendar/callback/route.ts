import { NextResponse } from "next/server"
import { getRedirectUri } from "@/lib/google-calendar"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")
  const state = url.searchParams.get("state")

  const appBaseUrl = url.origin

  if (error || !code) {
    const errorParam = encodeURIComponent(error || "missing_code")
    return NextResponse.redirect(`${appBaseUrl}/?page=type-health-records&tab=appointments&gcal_error=${errorParam}`)
  }

  // Redirect back to the Health Hub Appointments tab with code and state
  // The client component with active Supabase session will immediately complete the exchange via /api/google-calendar/connect
  const params = new URLSearchParams({
    page: "type-health-records",
    tab: "appointments",
    gcal_code: code,
  })
  if (state) params.set("gcal_state", state)

  return NextResponse.redirect(`${appBaseUrl}/?${params.toString()}`)
}
