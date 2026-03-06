"use client"

import { useState, useEffect } from "react"
import { Lock, Mail, Loader2, ArrowRight, Fingerprint, Shield, Globe } from "lucide-react"
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

  // Load last used email and optional saved password from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastLoginEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setIsSignUp(false) // Force to login mode if they have been here before
    }

    // Auto-fill password if "Remember Master Password" is enabled (Desktop Only feature)
    const rememberPass = localStorage.getItem('remember_master_pass') === 'true'
    const savedPass = localStorage.getItem('saved_master_pass')
    if (rememberPass && savedPass) {
      try {
        setPassword(atob(savedPass))
      } catch (e) {
        console.warn("Failed to decode saved password")
      }
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
        
        let session = null;
        try {
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          session = refreshedSession;
        } catch (refreshErr) {
          console.warn("Refresh session failed during biometric unlock:", refreshErr);
        }

        if (!session) {
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          session = currentSession;
        }

        if (session) {
          console.log("Active session found, unlocking UI...")
          setIsLocked(false)
          const targetPage = searchParams.get("page")
          const savedStartup = localStorage.getItem("hub_startup_page")
          
          if (targetPage) {
            router.push(`/?page=${targetPage}`)
          } else if (savedStartup && savedStartup !== "dashboard") {
            router.push(`/?page=${savedStartup}`)
          } else {
            router.push('/?page=dashboard')
          }
        } else {
          console.warn("No active Supabase session found after biometric success.")
          setError("Your secure session has fully expired. Please sign in with your Master Password once to re-enable biometrics for this visit.")
          // We do NOT remove biometric_enabled here to avoid button disappearing if they just need to re-auth
        }
      }
    } catch (err: any) {
      console.error("Biometric login failed:", err)
      if (err.name === 'NotAllowedError') {
        setError("Biometric login cancelled or no passkeys found for this domain.")
      } else {
        setError("Biometric verification failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
        },
      })
      if (error) throw error
    } catch (err: any) {
      console.error("Google login failed:", err)
      setError(err.message || "Google authentication failed")
    } finally {
      setLoading(false)
    }
  }

  // SSO & Auth Handlers (Logic remains unchanged for stability)
  useEffect(() => {
    if (isUnlockMode) return;
    const handleSSO = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (existingSession) {
        const page = searchParams.get('page')
        const savedStartup = localStorage.getItem("hub_startup_page")
        if (page) router.push(`/?page=${page}`)
        else if (savedStartup && savedStartup !== "dashboard") router.push(`/?page=${savedStartup}`)
        else router.push('/?page=dashboard')
        return
      }
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = params.get('access_token') || hashParams.get('access_token')
      const refreshToken = params.get('refresh_token') || hashParams.get('refresh_token')
      if (accessToken && refreshToken) {
        setLoading(true)
        try {
          const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (error) throw error
          window.history.replaceState({}, '', window.location.pathname)
          router.push('/?page=dashboard')
        } catch (e) { setError("Session sync failed.") } finally { setLoading(false) }
      }
    }
    handleSSO()
  }, [router, searchParams, isUnlockMode])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const trimmedEmail = email.trim().toLowerCase()
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email: trimmedEmail, password, options: { emailRedirectTo: window.location.origin } })
        if (error) throw error
        setError("Check your email for the confirmation link!")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
        if (error) throw error
        localStorage.setItem('lastLoginEmail', trimmedEmail)
        router.push('/?page=dashboard')
      }
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="w-full max-w-md relative z-10 glass-panel rounded-2xl shadow-2xl border border-white/10 p-8 backdrop-blur-xl bg-white/5">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold text-white mb-2">Secure Life Hub</h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            {isUnlockMode ? "Vault is locked. Unlock below." : isSignUp ? "Create your secure vault" : "Unlock your internal vault"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            {!isUnlockMode && (
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                  placeholder="Email address"
                />
              </div>
            )}
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <PasswordInput
                value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-10 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                placeholder="Master Password"
              />
            </div>
          </div>

          {error && <div className="p-4 rounded-xl text-sm border bg-red-500/10 border-red-500/20 text-red-400 text-center">{error}</div>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{isSignUp ? "Create Vault" : "Unlock Vault"} <ArrowRight className="h-5 w-5" /></>}
          </button>


          {typeof window !== 'undefined' && localStorage.getItem('biometric_enabled') === 'true' && (
            <button
              type="button" onClick={handleBiometricLogin} disabled={loading}
              className="w-full mt-3 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 flex flex-col items-center justify-center transition-all group shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Fingerprint className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-base">Sign in with Biometrics</span>
              </div>
              <span className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Select "This Device" 📲 if asked</span>
            </button>
          )}
        </form>

        <div className="mt-6 text-center flex flex-col gap-2">
          {!isUnlockMode ? (
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-gray-400 hover:text-white text-sm transition-colors">
              {isSignUp ? "Already have a vault? Sign In" : "New here? Create a Vault"}
            </button>
          ) : (
            <button onClick={() => { signOut(); router.push('/'); }} className="text-gray-500 hover:text-red-400 text-xs transition-colors uppercase tracking-widest font-bold">
              Sign out / Change Account
            </button>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 text-gray-600 text-xs text-center w-full">SecureLifeHub v1.0 • Encrypted & Secure</div>
    </div>
  )
}
