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
    timeLeft: number | null
    setIsLocked: (locked: boolean) => void
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isLocked: false,
    timeLeft: null,
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
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
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
            // If we are unlocking and the current timeout is the test (5s), 
            // set it back to 5 minutes so the user has time to work.
            const saved = typeof window !== 'undefined' ? localStorage.getItem("auto_lock_timeout") : null
            if (saved === "0.0833") { // 5 seconds test value
                localStorage.setItem("auto_lock_timeout", "5")
                // Notify the rest of the app about the change
                window.dispatchEvent(new CustomEvent('autoLockTimeoutChanged', { detail: { timeout: 5 } }))
            }
        }
    }

    // Separate effect for Auto-lock Activity Listeners
    useEffect(() => {
        if (loading || isLocked) {
            setTimeLeft(null)
            return
        }

        let inactivityTimer: NodeJS.Timeout
        let countdownInterval: NodeJS.Timeout

        const getTimeoutDuration = () => {
            const saved = typeof window !== 'undefined' ? localStorage.getItem("auto_lock_timeout") : null
            if (saved === "0" || saved === "disabled") return null
            // Support fractional minutes (like 0.083 for 5 seconds)
            return (saved ? parseFloat(saved) : 15) * 60 * 1000
        }

        let currentLimit = getTimeoutDuration()
        let expiryTime = currentLimit ? Date.now() + currentLimit : null
        let isSuspended = false

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer)
            if (countdownInterval) clearInterval(countdownInterval)
            
            if (currentLimit === null || isSuspended) {
                setTimeLeft(null)
                return
            }

            const playBeep = () => {
                try {
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.5);
                } catch (e) {
                    console.warn("Audio beep failed", e);
                }
            };

            expiryTime = Date.now() + currentLimit
            
            // Start the auto-lock timer
            inactivityTimer = setTimeout(async () => {
                console.log("Vault auto-locked due to inactivity")
                playBeep();
                setLockedWithPersistence(true)
            }, currentLimit)

            // Start the visual countdown interval
            countdownInterval = setInterval(() => {
                if (expiryTime) {
                    const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000))
                    setTimeLeft(remaining)
                }
            }, 1000)
            
            // Initial set
            if (expiryTime) {
                setTimeLeft(Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000)))
            }
        }

        const events = ['mousedown', 'keydown', 'touchstart', 'click']
        
        // Throttled activity handler for mousemove
        let lastActivity = Date.now()
        const handleActivity = () => {
            const now = Date.now()
            if (now - lastActivity < 1000) return // Throttled to 1s
            lastActivity = now
            resetTimer()
        }

        const handleTimeoutChange = (e: CustomEvent) => {
            if (e.detail?.timeout !== undefined) {
                const timeoutVal = e.detail.timeout
                if (timeoutVal === 0 || timeoutVal === "disabled") {
                    currentLimit = null
                } else {
                    currentLimit = parseFloat(timeoutVal) * 60 * 1000
                }
                resetTimer()
            }
        }

        const handleSuspend = () => {
            isSuspended = true;
            resetTimer();
        }
        
        const handleResume = () => {
            isSuspended = false;
            resetTimer();
        }

        events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }))
        window.addEventListener('autoLockTimeoutChanged', handleTimeoutChange as EventListener)
        window.addEventListener('autoLockSuspend', handleSuspend)
        window.addEventListener('autoLockResume', handleResume)
        
        // Initial timer start
        resetTimer()

        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer)
            if (countdownInterval) clearInterval(countdownInterval)
            events.forEach(event => window.removeEventListener(event, handleActivity))
            window.removeEventListener('autoLockTimeoutChanged', handleTimeoutChange as EventListener)
            window.removeEventListener('autoLockSuspend', handleSuspend)
            window.removeEventListener('autoLockResume', handleResume)
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
                    if (error.message.includes("Refresh Token Not Found") || 
                        error.message.includes("invalid_refresh_token") ||
                        error.message.includes("Already Used")) {
                        console.warn("Auth session error, signing out:", error.message)
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
        timeLeft,
        setIsLocked: setLockedWithPersistence,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
