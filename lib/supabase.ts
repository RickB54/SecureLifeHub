import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase Config Check:", {
    urlLength: supabaseUrl ? supabaseUrl.length : 0,
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
    urlStart: supabaseUrl ? supabaseUrl.substring(0, 15) : 'N/A'
})

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables')
}

// Implement a singleton pattern to prevent multiple instances and multiple simultaneous token refreshes during Fast Refresh
const globalForSupabase = global as unknown as { supabase: SupabaseClient };

export const supabase = globalForSupabase.supabase || createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

if (process.env.NODE_ENV !== 'production') globalForSupabase.supabase = supabase;
