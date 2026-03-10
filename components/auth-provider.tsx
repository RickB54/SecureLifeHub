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

    // Separate effect for Auto-lock Activity Listeners
    useEffect(() => {
        if (loading || isLocked) return

        let inactivityTimer: NodeJS.Timeout

        const getTimeoutDuration = () => {
            const saved = typeof window !== 'undefined' ? localStorage.getItem("auto_lock_timeout") : null
            if (saved === "0" || saved === "disabled") return null
            return (saved ? parseInt(saved) : 15) * 60 * 1000
        }

        let currentLimit = getTimeoutDuration()

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer)
            if (currentLimit === null) return

            inactivityTimer = setTimeout(async () => {
                console.log("Vault auto-locked due to inactivity")
                setLockedWithPersistence(true)
            }, currentLimit)
        }

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove']
        
        // Throttled activity handler for mousemove
        let lastActivity = Date.now()
        const handleActivity = () => {
            const now = Date.now()
            if (now - lastActivity < 2000) return // Throttled to 2s
            lastActivity = now
            resetTimer()
        }

        const handleTimeoutChange = (e: CustomEvent) => {
            if (e.detail?.timeout !== undefined) {
                if (e.detail.timeout === 0 || e.detail.timeout === "disabled") {
                    currentLimit = null
                } else {
                    currentLimit = e.detail.timeout * 60 * 1000
                }
                resetTimer()
            }
        }

        events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }))
        window.addEventListener('autoLockTimeoutChanged', handleTimeoutChange as EventListener)
        
        // Initial timer start
        resetTimer()

        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer)
            events.forEach(event => window.removeEventListener(event, handleActivity))
            window.removeEventListener('autoLockTimeoutChanged', handleTimeoutChange as EventListener)
        }
    }, [isLocked, loading])

    // Auth state listener
    useEffect(() => {
        let initialized = false
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth State Change:", event)
            if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
                setSession(null)
                setUser(null)
                setIsLocked(false)
                localStorage.removeItem('vault_locked')
            } else {
                setSession(session)
                setUser(session?.user ?? null)
                if (event === 'SIGNED_IN') {
                    setLockedWithPersistence(false)
                }
                if (event === 'PASSWORD_RECOVERY') {
                    setLockedWithPersistence(true)
                }
            }
            if (!initialized) { initialized = true; setLoading(false) }
        })

        const initSession = async () => {
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession()
                if (error) {
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
                setLoading(false)
                initialized = true
            }
        }
        initSession()

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    const signOut = async () => {
        setLockedWithPersistence(false)
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
