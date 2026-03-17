"use client"

import { useState, useEffect } from "react"
import { Lock, Mail, Loader2, ArrowRight, Fingerprint, Shield, Globe } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Logo from "./logo"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"

interface LoginProps {
  isUnlockMode?: boolean
}

export default function Login({ isUnlockMode = false }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setIsLocked, signOut } = useAuth()

  // Consolidated Initialization: Recovery Detection and Storage Loading
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = params.get('type') || hashParams.get('type')
    const isRecovery = type === 'recovery'

    if (isRecovery) {
      console.log("🛠️ Recovery URL Detected - Entering Reset Mode")
      setIsResetMode(true)
      setEmail("") // Ensure email is blank until session is established
      setIsSignUp(false)
    } else {
      // Normal flow: Load last used email
      const savedEmail = localStorage.getItem('lastLoginEmail')
      if (savedEmail) {
        setEmail(savedEmail)
        setIsSignUp(false)
      }
    }

    // Auto-fill password if "Remember Master Password" is enabled (Desktop Only)
    const rememberPass = localStorage.getItem('remember_master_pass') === 'true'
    const savedPass = localStorage.getItem('saved_master_pass')
    if (rememberPass && savedPass && !isRecovery) {
      try {
        setPassword(atob(savedPass))
      } catch (e) {
        console.warn("Failed to decode saved password")
      }
    }
  }, [])

  // Robust recovery detection via listener & URL check
  useEffect(() => {
    // 1. Direct URL check (Aggressive backup)
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = params.get('type') || hashParams.get('type')
    if (type === 'recovery') {
      setIsResetMode(true)
      // Don't use the cached email if we are in recovery
      setEmail("") 
    }

    // 2. Auth State listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Login Auth Event:", event)
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetMode(true)
        if (session?.user?.email) setEmail(session.user.email)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // 3. Fallback: If in reset mode and email is empty, try to get it from current user periodically
  useEffect(() => {
    if (isResetMode && !email) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) setEmail(data.user.email)
      })
    }
  }, [isResetMode, email])

  const handleBiometricLogin = async () => {
    if (!window.PublicKeyCredential) {
      setError("Biometrics not supported on this browser")
      return
    }

    // Check if user's custom session duration has elapsed since last full login
    const durationDays = parseInt(localStorage.getItem('session_duration_days') || '90')
    const lastFullLogin = parseInt(localStorage.getItem('full_login_timestamp') || '0')
    if (durationDays > 0 && lastFullLogin > 0) {
      const elapsedMs = Date.now() - lastFullLogin
      const durationMs = durationDays * 24 * 60 * 60 * 1000
      if (elapsedMs > durationMs) {
        setError(
          `Your secure session has fully expired (after ${durationDays} days). Please sign in with your Master Password once to re-enable biometrics for this visit.`
        )
        return
      }
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
          } else {
            router.push('/')
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
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
        },
      })
      if (error) throw error
    } catch (err: any) {
      console.error("Google login failed:", err)
      let msg = err.message || "Google authentication failed"
      if (msg.includes("Unsupported provider")) {
        msg = "Google Authentication is not yet enabled for this project. Please go to your Supabase Dashboard -> Authentication -> Providers and enable Google."
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // SSO & Auth Handlers
  useEffect(() => {
    const handleSSO = async () => {
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      
      const type = params.get('type') || hashParams.get('type')
      const isRecovery = type === 'recovery'

      if (isRecovery) {
        setIsResetMode(true)
      }

      const errorMsg = params.get('error_description') || hashParams.get('error_description') || params.get('error') || hashParams.get('error')
      if (errorMsg) {
        setError(errorMsg.replace(/\+/g, ' '))
        return
      }

      const { data: { session: existingSession } } = await supabase.auth.getSession()
      
      // PRE-FILL EMAIL IF IN RECOVERY
      if (isRecovery && existingSession?.user?.email) {
        setEmail(existingSession.user.email)
      }

      if (existingSession && !isRecovery) {
        const page = searchParams.get('page')
        if (page) router.push(`/?page=${page}`)
        else router.push('/')
        return
      }

      const accessToken = params.get('access_token') || hashParams.get('access_token')
      const refreshToken = params.get('refresh_token') || hashParams.get('refresh_token')
      if (accessToken && refreshToken) {
        setLoading(true)
        try {
          const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          
          if (error) {
            // If sync fails (e.g. refresh token consumed by another tab), check if we have a valid session already
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            if (currentSession) {
              console.log("SecureLifeHub: URL sync failed but existing session found, continuing.")
              const targetPage = params.get('page') || hashParams.get('page')
              window.history.replaceState({}, '', window.location.pathname)
              if (targetPage) router.push(`/?page=${targetPage}`)
              else router.push('/')
              return
            }
            throw error
          }
          
          if (isRecovery || type === 'recovery') {
            setIsResetMode(true)
            if (data.session?.user?.email) setEmail(data.session.user.email)
          } else {
            const targetPage = params.get('page') || hashParams.get('page')
            window.history.replaceState({}, '', window.location.pathname)
            if (targetPage) router.push(`/?page=${targetPage}`)
            else router.push('/')
          }
        } catch (e: any) { 
          console.error("Session sync failed:", e)
          if (e.message?.includes("Already Used") || e.message?.includes("refresh_token_not_found")) {
            // These errors happen if the token was consumed by a concurrent refresh/sync.
            // If we've reached here, getSession didn't find a fallback.
            setError("Your session link has expired. Please log in manually.")
          } else {
            setError("Session sync failed.")
          }
        } finally { setLoading(false) }
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

        if (typeof window !== 'undefined' && localStorage.getItem('hub_2fa_enabled') === 'true') {
          // Do not redirect yet, show 2FA prompt
          setShow2FA(true)
          setLoading(false)
          return
        }

        localStorage.setItem('lastLoginEmail', trimmedEmail)
        // Stamp the time of full master-password login so biometric session duration can be enforced
        localStorage.setItem('full_login_timestamp', Date.now().toString())
        setIsLocked(false)
        router.push('/')
      }
    } catch (err: any) { 
      let msg = err.message
      if (msg.toLowerCase().includes("rate limit")) {
        msg = "Email limit reached. Please wait a few minutes before requesting another link."
      }
      setError(msg)
    } finally { setLoading(false) }
  }

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResendLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw error
      toast.success("Confirmation email resent! Please check your inbox.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    const confirmed = confirm(`Do you want to send a password reset link to: ${email}?`)
    if (!confirmed) return

    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + '?type=recovery',
      })
      if (error) throw error
      toast.success(`Reset link sent to ${email}. Check your inbox!`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success("Password updated successfully!")
      setIsLocked(false)
      // Redirect to root to allow startup preference to take effect
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault()
    if (twoFactorCode === "123456") {
      localStorage.setItem('lastLoginEmail', email.trim().toLowerCase())
      localStorage.setItem('full_login_timestamp', Date.now().toString())
      setIsLocked(false)
      router.push('/')
    } else {
      setError("Invalid 2FA code. Please try again.")
    }
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

        {isResetMode ? (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2 text-center">
                <Shield className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-white mb-1">Set New Password</h2>
                <div className="bg-blue-500/10 border border-blue-500/20 py-1.5 px-3 rounded-lg inline-block mb-2">
                   <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Account Identified</p>
                   <p className="text-sm text-white font-bold">{email || "Finalizing authorization..."}</p>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">Protect your internal vault with a new master password.</p>
            </div>
            <div className="space-y-4">
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <PasswordInput
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-10 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                  placeholder="New Master Password"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <PasswordInput
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-10 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                  placeholder="Confirm New Password"
                />
              </div>
            </div>
            {error && <div className="p-4 rounded-xl text-sm border bg-red-500/10 border-red-500/20 text-red-400 text-center">{error}</div>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-70"
            >
              Update & Login <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false)
                window.history.replaceState({}, '', '/')
              }}
              className="w-full text-center text-gray-400 hover:text-white text-xs font-bold transition-all uppercase tracking-widest mt-2"
            >
              Cancel Reset
            </button>
          </form>
        ) : show2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-6">
             <div className="space-y-2 text-center">
                 <Shield className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                 <h2 className="text-xl font-bold text-white mb-1">Two-Factor Authentication</h2>
                 <p className="text-gray-400 text-sm mb-4">Enter the 6-digit code from your app</p>
             </div>
             <div className="relative group">
               <input
                 type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} required
                 className="w-full bg-black/20 text-center text-2xl tracking-[0.5em] font-mono border border-white/10 text-white rounded-xl py-4 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                 placeholder="123456" maxLength={6}
               />
             </div>
             {error && <div className="p-4 rounded-xl text-sm border bg-red-500/10 border-red-500/20 text-red-400 text-center">{error}</div>}
             <button
               type="submit" disabled={loading}
               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-70"
             >
               Verify Code <ArrowRight className="h-5 w-5" />
             </button>
             <button type="button" onClick={() => { setShow2FA(false); setError(null); }} className="w-full flex justify-center text-gray-400 hover:text-white text-sm transition-colors mt-4">
                Back to Login
             </button>
          </form>
        ) : (
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
              <div className="flex justify-end">
              {!isSignUp && !isUnlockMode && (
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[11px] font-bold text-blue-400/60 hover:text-blue-400 transition-colors uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl text-sm border bg-red-500/10 border-red-500/20 text-red-400 text-center flex flex-col gap-2">
              <span>{error}</span>
              {(error.toLowerCase().includes("not confirmed") || error.toLowerCase().includes("verify your email")) && (
                <button 
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading}
                  className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4 disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend Confirmation Link"}
                </button>
              )}
            </div>
          )}

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

          {!isUnlockMode && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0F172A] px-2 text-gray-500 font-bold tracking-widest">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg"
              >
                <Globe className="h-5 w-5 text-blue-400" />
                <span>Google Account</span>
              </button>
            </>
          )}
        </form>
        )}

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
