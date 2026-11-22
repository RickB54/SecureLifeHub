import { createClient, SupabaseClient } from "@supabase/supabase-js"

export async function getAuthenticatedSupabase(req: Request): Promise<{
  supabase: SupabaseClient
  userId: string
  userEmail?: string
}> {
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.replace(/^Bearer\s+/i, "").trim()

  if (!token) {
    throw new Error("Missing authorization bearer token")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment configuration missing")
  }

  // Create a client with the user's JWT so RLS policies are applied directly
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  // Verify the token with Supabase auth
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw new Error("Invalid or expired session. Please sign in again.")
  }

  return { supabase, userId: user.id, userEmail: user.email }
}
