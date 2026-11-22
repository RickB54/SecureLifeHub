import { NextResponse } from "next/server"
import { getAuthenticatedSupabase } from "@/lib/supabase-server"

export async function GET(req: Request) {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase(req)

    const { data, error } = await supabase
      .from("user_google_tokens")
      .select("expires_at, refresh_token, updated_at")
      .eq("user_id", userId)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ connected: false, expired: false })
    }

    const now = Date.now()
    const isExpired = now >= data.expires_at && !data.refresh_token

    return NextResponse.json({
      connected: true,
      expired: isExpired,
      lastUpdated: data.updated_at,
    })
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message }, { status: 401 })
  }
}
