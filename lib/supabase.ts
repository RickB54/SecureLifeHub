
import { createClient } from '@supabase/supabase-js'

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

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)
