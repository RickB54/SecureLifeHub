"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    isLocked: boolean
    setIsLocked: (locked: boolean) => void
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isLocked: false,
    setIsLocked: () => { },
    signOut: async () => { },
})

export const useAuth = () => {
    return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isLocked, setIsLocked] = useState(false)
    const router = useRouter()

    // Handle initial lock state and persistence
    useEffect(() => {
        const isCurrentlyLocked = localStorage.getItem('vault_locked') === 'true'
        const bioEnabled = localStorage.getItem('biometric_enabled') === 'true'
        
        // If biometrics are enabled, we default to LOCKED on new page loads for security
        if (bioEnabled && !isCurrentlyLocked) {
           // We don't automatically lock if they just signed in, 
           // but we do if they refresh or come back later.
           // For now, let's just trust the persistent state.
        }
        
        setIsLocked(isCurrentlyLocked)
    }, [])

    const setLockedWithPersistence = (locked: boolean) => {
        setIsLocked(locked)
        if (locked) {
            localStorage.setItem('vault_locked', 'true')
        } else {
            localStorage.removeItem('vault_locked')
        }
    }

    useEffect(() => {
        let initialized = false

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth State Change:", event)
            
            // Handle refresh token expiration or invalidation
            if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
                console.warn("Session invalid or refreshed without session, clearing local auth state...")
                setSession(null)
                setUser(null)
                setIsLocked(false)
                localStorage.removeItem('vault_locked')
            } else {
                setSession(session)
                setUser(session?.user ?? null)
                // If we were locked and but a new session appeared, we might want to stay locked or unlock.
                // Usually, if they just signed in, they are unlocked.
                if (event === 'SIGNED_IN') {
                    setLockedWithPersistence(false)
                }
            }

            if (!initialized) {
                initialized = true
                setLoading(false)
            }
        })

        // Backup check if listener doesn't fire immediately with session
        const initSession = async () => {
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession()
                
                if (error) {
                    console.error("Session initialization error:", error.message)
                    if (error.message.includes("Refresh Token Not Found") || error.message.includes("invalid_refresh_token")) {
                        await supabase.auth.signOut()
                    }
                }

                if (!initialized) {
                    setSession(currentSession)
                    setUser(currentSession?.user ?? null)
                    setLoading(false)
                    initialized = true
                }
            } catch (err) {
                console.error("Fatal auth init error:", err)
                setLoading(false)
                initialized = true
            }
        }
        initSession()

        // Auto-logout/lock functionality
        let inactivityTimer: NodeJS.Timeout

        // Initial limit setup
        const getTimeoutDuration = () => {
            const saved = typeof window !== 'undefined' ? localStorage.getItem("auto_lock_timeout") : null
            if (saved === "0" || saved === "disabled") return null;
            return (saved ? parseInt(saved) : 15) * 60 * 1000
        }

        let currentLimit = getTimeoutDuration()

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer)
            if (currentLimit === null) return; // Auto-lock disabled

            inactivityTimer = setTimeout(async () => {
                console.log("User inactive, locking vault...")
                // INSTEAD of full signOut, we just lock the view.
                // This keeps the Supabase session alive so Fingerprint (WebAuthn) can "unlock" it.
                setLockedWithPersistence(true)
                router.refresh()
            }, currentLimit)
        }

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
        const handleActivity = () => resetTimer()

        const handleTimeoutChange = (e: CustomEvent) => {
            if (e.detail?.timeout !== undefined) {
                if (e.detail.timeout === 0 || e.detail.timeout === "disabled") {
                    currentLimit = null
                    console.log("Auto-lock disabled")
                } else {
                    currentLimit = e.detail.timeout * 60 * 1000
                    console.log(`Auto-lock timeout updated to ${e.detail.timeout} minutes`)
                }
                resetTimer()
            }
        }

        events.forEach(event => window.addEventListener(event, handleActivity))
        window.addEventListener('autoLockTimeoutChanged', handleTimeoutChange as EventListener)
        resetTimer()

        return () => {
            listener.subscription.unsubscribe()
            events.forEach(event => window.removeEventListener(event, handleActivity))
            window.removeEventListener('autoLockTimeoutChanged', handleTimeoutChange as EventListener)
            if (inactivityTimer) clearTimeout(inactivityTimer)
        }
    }, [])

    const signOut = async () => {
        setIsLocked(false)
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        router.refresh()
    }

    const value = {
        session,
        user,
        loading,
        isLocked,
        setIsLocked: setLockedWithPersistence,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
