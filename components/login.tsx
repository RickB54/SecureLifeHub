"use client"

import { useState, useEffect } from "react"
import { Lock, Mail, Loader2, ArrowRight, Fingerprint, Shield } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Logo from "./logo"
import { useAuth } from "@/components/auth-provider"

interface LoginProps {
  isUnlockMode?: boolean
}

export default function Login({ isUnlockMode = false }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setIsLocked, signOut } = useAuth()

  // Load last used email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastLoginEmail')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleBiometricLogin = async () => {
    if (!window.PublicKeyCredential) {
      setError("Biometrics not supported on this browser")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const savedId = localStorage.getItem('biometric_id')
      const allowCredentials = savedId ? [{
        id: Uint8Array.from(atob(savedId), c => c.charCodeAt(0)),
        type: 'public-key' as const
      }] : []

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          timeout: 60000,
          userVerification: "required"
        }
      })

      if (assertion) {
        // Biometric verify success on device
        console.log("Biometric verification successful")
        
        // IMPORTANT: Biometrics in this PWA is used for UNLOCKING an existing session.
        // We check if we still have a valid Supabase session.
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          console.log("Active session found, unlocking...")
          setIsLocked(false)
          // If we are on the dashboard, we stay there, otherwise we might need to redirect
          router.push("/?page=dashboard")
        } else {
          console.warn("No active session found during biometric unlock.")
          setError("Your secure session has fully expired. For your safety, please sign in with your Master Password once to re-enable biometrics for this visit.")
          localStorage.removeItem('biometric_enabled')
        }
      }
    } catch (err: any) {
      console.error("Biometric login failed:", err)
      if (err.name === 'NotAllowedError') {
        setError("Biometric login cancelled or no passkeys found for this domain. If you recently changed domains, please re-enable biometrics in Settings.")
      } else {
        setError("Biometric verification failed")
      }
    } finally {
      setLoading(false)
    }
  }

  // SSO: Check for session token in URL and auto-login
  useEffect(() => {
    const handleSSO = async () => {
      // 1. Check if we ALREADY have a session. If so, just go to dashboard.
      // Use getSession but be mindful of AuthProvider racing
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
      const trimmedEmail = email.trim().toLowerCase()
      const passwordToUse = password // Do NOT trim passwords as spaces can be part of valid credentials

      if (!trimmedEmail) {
        setError("Email is required")
        setLoading(false)
        return
      }

      if (!passwordToUse) {
        setError("Password is required")
        setLoading(false)
        return
      }

      // Basic client-side email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        setError(`Email address "${trimmedEmail}" is format-invalid.`)
        setLoading(false)
        return
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: passwordToUse,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
          }
        })
        if (error) throw error
        setError("Check your email for the confirmation link!")
        // Save email on signup too
        localStorage.setItem('lastLoginEmail', trimmedEmail)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: passwordToUse,
        })
        if (error) throw error
        // Save email on successful login
        localStorage.setItem('lastLoginEmail', trimmedEmail)
        router.push('/?page=dashboard')
      }
    } catch (err: any) {
      console.error("Auth Error:", err)
      let displayError = err.message
      if (err.message === "Invalid login credentials") {
        displayError = "Invalid email or password. Please check your credentials or ensure your account is confirmed."
      }
      setError(displayError)
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError("Please enter your email address first.")
      return
    }

    setResendLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      })
      if (error) throw error
      setError("Verification link resent! Please check your inbox.")
    } catch (err: any) {
      console.error("Resend Error:", err)
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  // Determine if we are in the middle of an SSO sync
  const isSyncing = loading && (typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('access_token') ||
      new URLSearchParams(window.location.hash.substring(1)).get('access_token')))

  if (isSyncing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] p-4">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <Logo size="lg" />
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Syncing Vault...</h2>
            <div className="flex items-center gap-2 text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Establishing secure session</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="w-full max-w-md relative z-10 glass-panel rounded-2xl shadow-2xl border border-white/10 p-8 backdrop-blur-xl bg-white/5">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold text-white mb-2">Secure Life Hub</h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            {isUnlockMode 
              ? "Vault is locked. Unlock below." 
              : isSignUp ? "Create your secure vault" : "Unlock your internal vault"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            {!isUnlockMode && (
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
            )}
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
            <div className={`p-4 rounded-xl text-sm border flex flex-col gap-2 ${error.includes("Check") || error.includes("resent")
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
              <div className="flex items-start gap-2">
                <p className="flex-1">{error}</p>
              </div>
              {(error.includes("Check") || error.includes("resent") || error.includes("confirm")) && (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="text-xs font-semibold underline underline-offset-4 hover:text-white transition-colors disabled:opacity-50 text-left w-fit"
                  >
                    {resendLoading ? "Resending..." : "Didn't receive it? Resend link"}
                  </button>
                  <p className="text-[10px] opacity-60 italic">Note: If you already confirmed your account, please try signing in with your password below.</p>
                </div>
              )}
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

          {/* Biometric Sign In Option */}
          {!isSignUp && typeof window !== 'undefined' && localStorage.getItem('biometric_enabled') === 'true' && (
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={loading}
              className="w-full mt-3 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 flex flex-col items-center justify-center transition-all group"
            >
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Sign in with Biometrics</span>
              </div>
              <span className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Select "This Device" 📲 if asked</span>
            </button>
          )}
        </form>

        <div className="mt-6 text-center flex flex-col gap-2">
          {!isUnlockMode ? (
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
          ) : (
            <button
              onClick={() => {
                signOut()
                // Router push will happen in signOut logic or here
                router.push('/')
              }}
              className="text-gray-500 hover:text-red-400 text-xs transition-colors uppercase tracking-widest font-bold"
            >
              Sign out / Change Account
            </button>
          )}
        </div>
      </div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-4 text-gray-600 text-xs text-center w-full">
        SecureLifeHub v1.0 • Encrypted & Secure
      </div>
    </div >
  )
}
