"use client"

import React, { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DoctorVisitHub from "@/components/doctor-visit-hub/DoctorVisitHub"
import { VisitHubSectionId } from "@/components/doctor-visit-hub/doctor-visit-types"
import PinAuthScreen from "@/components/security/pin-auth-screen"
import { ensurePinReset1234 } from "@/lib/pin-security"
import { useSmartBack } from "@/hooks/use-smart-back"

function DoctorVisitHubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get("section") as VisitHubSectionId | null
  const { smartBack } = useSmartBack()

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    try {
      ensurePinReset1234()
      const raw = localStorage.getItem("hub_security_settings")
      if (!raw) return true
      const settings = JSON.parse(raw)
      const healthLock = settings["type-health-records"]
      if (!healthLock?.isLocked) return true
      return sessionStorage.getItem("slh_unlocked_type-health-records") === "true"
    } catch (e) {
      return true
    }
  })

  const [lockPin, setLockPin] = useState<string>("1234")
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try {
      ensurePinReset1234()
      const raw = localStorage.getItem("hub_security_settings")
      if (!raw) return false
      const settings = JSON.parse(raw)
      const healthLock = settings["type-health-records"]
      return !!healthLock?.isLocked
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    try {
      ensurePinReset1234()
      const raw = localStorage.getItem("hub_security_settings")
      if (raw) {
        const settings = JSON.parse(raw)
        const healthLock = settings["type-health-records"]
        if (healthLock?.isLocked) {
          setIsLocked(true)
          setLockPin(healthLock.pin || "1234")
          if (sessionStorage.getItem("slh_unlocked_type-health-records") === "true") {
            setIsUnlocked(true)
          } else {
            setIsUnlocked(false)
          }
        } else {
          setIsLocked(false)
          setIsUnlocked(true)
        }
      }
    } catch (e) {
      // ignore
    }
  }, [])

  if (isLocked && !isUnlocked) {
    return (
      <PinAuthScreen
        moduleName="Health Records"
        hashedPin={lockPin}
        theme="dark"
        onSuccess={() => {
          setIsUnlocked(true)
          try {
            sessionStorage.setItem("slh_unlocked_type-health-records", "true")
          } catch (e) {}
        }}
        onCancel={() => {
          router.replace("/?page=dashboard")
        }}
      />
    )
  }

  return (
    <main className="w-full h-screen bg-slate-950 overflow-hidden">
      <DoctorVisitHub
        initialSection={sectionParam || undefined}
        onClose={() => smartBack("/?page=type-health-records&tab=dashboard")}
        onNavigateTab={(tab) => {
          router.push(`/?page=type-health-records&tab=${tab}`)
        }}
        theme="dark"
      />
    </main>
  )
}

export default function DoctorVisitHubPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-slate-950" />}>
      <DoctorVisitHubContent />
    </Suspense>
  )
}
