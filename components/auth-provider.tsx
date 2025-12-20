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
        const setData = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) console.error("Error checking session:", error)

                setSession(session)
                setUser(session?.user ?? null)
            } catch (error) {
                console.error("Unexpected error in AuthProvider:", error)
            } finally {
                setLoading(false)
            }
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Initialize session
        setData()

        // Auto-logout functionality
        let inactivityTimer: NodeJS.Timeout

        // Initial limit setup
        const getTimeoutDuration = () => {
            const saved = typeof window !== 'undefined' ? localStorage.getItem("auto_lock_timeout") : null
            return (saved ? parseInt(saved) : 15) * 60 * 1000
        }

        let currentLimit = getTimeoutDuration()

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer)
            inactivityTimer = setTimeout(async () => {
                console.log("User inactive, logging out...")
                await supabase.auth.signOut()
                router.refresh()
            }, currentLimit)
        }

        // Listen for activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
        const handleActivity = () => resetTimer()

        // Listen for timeout settings changes
        const handleTimeoutChange = (e: CustomEvent) => {
            if (e.detail?.timeout) {
                currentLimit = e.detail.timeout * 60 * 1000
                resetTimer()
                console.log(`Auto-lock timeout updated to ${e.detail.timeout} minutes`)
            }
        }

        events.forEach(event => window.addEventListener(event, handleActivity))
        window.addEventListener('autoLockTimeoutChanged', handleTimeoutChange as EventListener)
        resetTimer() // Start timer

        return () => {
            listener.subscription.unsubscribe()
            // Clear activity listeners
            events.forEach(event => window.removeEventListener(event, handleActivity))
            window.removeEventListener('autoLockTimeoutChanged', handleTimeoutChange as EventListener)
            if (inactivityTimer) clearTimeout(inactivityTimer)
        }
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
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
