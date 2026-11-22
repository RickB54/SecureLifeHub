import { NextResponse } from "next/server"
import { getAuthenticatedSupabase } from "@/lib/supabase-server"
import { getAuthUrl, getRedirectUri } from "@/lib/google-calendar"

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthenticatedSupabase(req)

    const url = new URL(req.url)
    const origin = url.origin
    const redirectUri = getRedirectUri(origin)

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error: "Google Calendar OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.",
          needsConfig: true,
          redirectUri,
        },
        { status: 400 }
      )
    }

    const authUrl = getAuthUrl(redirectUri, userId)
    return NextResponse.json({ url: authUrl, redirectUri })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate Google OAuth URL" },
      { status: 401 }
    )
  }
}
