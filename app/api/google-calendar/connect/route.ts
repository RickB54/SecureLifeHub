import { NextResponse } from "next/server"
import { getAuthenticatedSupabase } from "@/lib/supabase-server"
import { exchangeCodeForTokens, getRedirectUri, invalidateUserCache } from "@/lib/google-calendar"

export async function POST(req: Request) {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase(req)
    const body = await req.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Missing OAuth authorization code" }, { status: 400 })
    }

    const url = new URL(req.url)
    const redirectUri = getRedirectUri(url.origin)

    // Server-side exchange with Google (Google client secret is never exposed to client)
    const tokens = await exchangeCodeForTokens(code, redirectUri)

    const expiresAt = Date.now() + tokens.expires_in * 1000

    // Store in public.user_google_tokens with user RLS
    const { error: dbError } = await supabase.from("user_google_tokens").upsert(
      {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope,
        token_type: tokens.token_type,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    if (dbError) {
      console.error("Failed to store Google tokens in Supabase:", dbError)
      return NextResponse.json(
        { error: `Database error storing Google tokens: ${dbError.message}` },
        { status: 500 }
      )
    }

    invalidateUserCache(userId)

    return NextResponse.json({ success: true, connected: true })
  } catch (error: any) {
    console.error("Connect error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to complete Google Calendar connection" },
      { status: 500 }
    )
  }
}
