import { NextResponse } from "next/server"
import { getAuthenticatedSupabase } from "@/lib/supabase-server"
import { revokeToken, invalidateUserCache } from "@/lib/google-calendar"

export async function POST(req: Request) {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase(req)

    // 1. Get tokens to revoke at Google
    const { data: tokenRow } = await supabase
      .from("user_google_tokens")
      .select("access_token, refresh_token")
      .eq("user_id", userId)
      .maybeSingle()

    if (tokenRow) {
      const tokenToRevoke = tokenRow.refresh_token || tokenRow.access_token
      if (tokenToRevoke) {
        await revokeToken(tokenToRevoke)
      }
    }

    // 2. Delete from public.user_google_tokens
    const { error: deleteError } = await supabase
      .from("user_google_tokens")
      .delete()
      .eq("user_id", userId)

    if (deleteError) {
      console.error("Failed to delete token record:", deleteError)
      return NextResponse.json(
        { error: `Database error removing connection: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // 3. Clear server cache
    invalidateUserCache(userId)

    return NextResponse.json({ success: true, disconnected: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to disconnect Google Calendar" },
      { status: 500 }
    )
  }
}
