"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
})

export const useAuth = () => {
    return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let initialized = false

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth State Change:", event)
            setSession(session)
            setUser(session?.user ?? null)

            if (!initialized) {
                initialized = true
                setLoading(false)
            }
        })

        // Backup check if listener doesn't fire immediately with session
        const initSession = async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            if (!initialized) {
                setSession(currentSession)
                setUser(currentSession?.user ?? null)
                setLoading(false)
                initialized = true
            }
        }
        initSession()

        // Auto-logout functionality
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
                console.log("User inactive, logging out...")
                await supabase.auth.signOut()
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
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        router.refresh()
    }

    const value = {
        session,
        user,
        loading,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
