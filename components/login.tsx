"use client"

import { useState, useEffect } from "react"
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load last used email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastLoginEmail')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  // SSO: Check for session token in URL and auto-login
  useEffect(() => {
    const handleSSO = async () => {
      // 1. Check if we ALREADY have a session. If so, just go to dashboard.
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (existingSession) {
        console.log('SSO: Active session already found, jumping to dashboard.')
        const page = searchParams.get('page') || 'dashboard'
        router.push(`/?page=${page}`)
        return
      }

      // 2. Check both search params and hash (Supabase sometimes puts tokens in hash)
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))

      const accessToken = params.get('access_token') || hashParams.get('access_token')
      const refreshToken = params.get('refresh_token') || hashParams.get('refresh_token')
      const targetPage = params.get('page') || hashParams.get('page') || 'dashboard'

      if (accessToken && refreshToken) {
        setLoading(true)
        console.log('SSO: Tokens detected in URL (Access: ' + accessToken.substring(0, 5) + '..., Refresh: ' + refreshToken.substring(0, 5) + '...)')

        try {
          // 3. Set the session from tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('SSO: Supabase setSession error:', error.message)
            // Clear tokens even on error to stop the loop
            window.history.replaceState({}, '', window.location.pathname)

            if (error.message.includes("session missing") || error.message.includes("not found")) {
              setError("Session expired or invalid. Please sign in manually.")
            } else {
              setError(`SSO Failed: ${error.message}`)
            }
            return
          }

          if (!data.session) {
            console.warn('SSO: setSession completed but no session object returned.')
            const { data: { session: recheckSession } } = await supabase.auth.getSession()
            if (!recheckSession) {
              window.history.replaceState({}, '', window.location.pathname)
              setError("Could not establish session. Please sign in manually.")
              return
            }
          }

          console.log('SSO: Login success!')

          // Pre-fill email for UI consistency
          const userSession = data.session || (await supabase.auth.getSession()).data.session
          const userEmail = userSession?.user?.email
          if (userEmail) {
            setEmail(userEmail)
            localStorage.setItem('lastLoginEmail', userEmail)
          }

          // 4. Clear tokens from URL and redirect
          window.history.replaceState({}, '', window.location.pathname)
          router.push(`/?page=${targetPage}`)

        } catch (err: any) {
          console.error('SSO: Critical catch error:', err)
          window.history.replaceState({}, '', window.location.pathname)
          setError("Session sync failed. Please sign in manually.")
        } finally {
          setLoading(false)
        }
      }
    }

    handleSSO()
  }, [router, searchParams])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setError("Check your email for the confirmation link!")
        // Save email on signup too
        localStorage.setItem('lastLoginEmail', email)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        // Save email on successful login
        localStorage.setItem('lastLoginEmail', email)
        router.push('/?page=dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="w-full max-w-md relative z-10 glass-panel rounded-2xl shadow-2xl border border-white/10 p-8 backdrop-blur-xl bg-white/5">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden shadow-lg shadow-blue-500/30">
            <Image
              src="/securelifehub-logo.jpg"
              alt="SecureLifeHub Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">SecureLifeHub</h1>
        <p className="text-gray-400">
          {isSignUp ? "Create your secure vault" : "Unlock your vault"}
        </p>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                placeholder="Email address"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-10 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                placeholder="Master Password"
              />
            </div>
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm border ${error.includes("Check")
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {isSignUp ? "Create Vault" : "Unlock Vault"}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {isSignUp
              ? "Already have a vault? Sign In"
              : "New here? Create a Vault"}
          </button>
        </div>
      </div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-4 text-gray-600 text-xs text-center w-full">
        SecureLifeHub v1.0 • Encrypted & Secure
      </div>
    </div >
  )
}
