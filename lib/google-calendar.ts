import { SupabaseClient } from "@supabase/supabase-js"

export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ")

export interface GoogleCalendarItem {
  id: string
  summary: string
  backgroundColor?: string
  primary?: boolean
  selected?: boolean
}

export interface GoogleCalendarEventItem {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  location?: string
  description?: string
  colorId?: string
  calendarId: string
  calendarName: string
  calendarColor: string
}

// In-memory 10-minute cache: key -> { data, expiresAt }
interface CacheEntry<T> {
  data: T
  cachedAt: number
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const CACHE_DURATION_MS = 10 * 60 * 1000 // 10 minutes

export function getCachedData<T>(key: string): { data: T; cachedAt: number; expiresAt: number } | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry
}

export function setCachedData<T>(key: string, data: T): void {
  const now = Date.now()
  memoryCache.set(key, {
    data,
    cachedAt: now,
    expiresAt: now + CACHE_DURATION_MS,
  })
}

export function invalidateUserCache(userId: string): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(`events:${userId}:`)) {
      memoryCache.delete(key)
    }
  }
}

export function getRedirectUri(requestOrigin?: string): string {
  const baseUrl = requestOrigin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl.replace(/\/$/, "")}/api/google-calendar/callback`
}

export function getAuthUrl(redirectUri: string, userId: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in environment variables.")
  }

  const statePayload = Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64url")

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: statePayload,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from environment.")
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  const data = await response.json()
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || "Failed to exchange Google OAuth code")
  }

  return {
    access_token: data.access_token as string,
    refresh_token: (data.refresh_token as string) || null,
    expires_in: data.expires_in as number, // seconds
    scope: data.scope as string,
    token_type: (data.token_type as string) || "Bearer",
  }
}

export async function refreshGoogleToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth client credentials.")
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  })

  const data = await response.json()
  if (!response.ok || data.error) {
    const errorMsg = data.error_description || data.error || "Token refresh failed"
    const isRevoked = data.error === "invalid_grant" || errorMsg.includes("revoked")
    const err = new Error(errorMsg) as any
    err.isRevoked = isRevoked
    throw err
  }

  return {
    access_token: data.access_token as string,
    expires_in: data.expires_in as number,
  }
}

export async function getValidAccessToken(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data: tokenRow, error } = await supabase
    .from("user_google_tokens")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error || !tokenRow) {
    const err = new Error("No Google Calendar connection found for this user.") as any
    err.code = "NOT_CONNECTED"
    throw err
  }

  const now = Date.now()
  // If token is still valid for at least 60 seconds, use it
  if (tokenRow.expires_at - now > 60000) {
    return tokenRow.access_token
  }

  // Otherwise, refresh if we have a refresh_token
  if (!tokenRow.refresh_token) {
    const err = new Error("Google access token expired and no refresh token available. Please reconnect.") as any
    err.code = "TOKEN_EXPIRED"
    throw err
  }

  try {
    const refreshed = await refreshGoogleToken(tokenRow.refresh_token)
    const newExpiresAt = Date.now() + refreshed.expires_in * 1000

    // Update in Supabase
    await supabase
      .from("user_google_tokens")
      .update({
        access_token: refreshed.access_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    return refreshed.access_token
  } catch (refreshErr: any) {
    if (refreshErr.isRevoked) {
      // Delete stale token
      await supabase.from("user_google_tokens").delete().eq("user_id", userId)
    }
    const err = new Error("Google session expired. Please reconnect your Google Calendar.") as any
    err.code = "TOKEN_EXPIRED"
    throw err
  }
}

export async function revokeToken(accessTokenOrRefreshToken: string): Promise<void> {
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessTokenOrRefreshToken)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  } catch (e) {
    console.warn("Failed to revoke token at Google:", e)
  }
}
