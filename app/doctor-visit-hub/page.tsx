"use client"

import React from "react"
import { useRouter } from "next/navigation"
import DoctorVisitHub from "@/components/doctor-visit-hub/DoctorVisitHub"

export default function DoctorVisitHubPage() {
  const router = useRouter()

  return (
    <main className="w-full h-screen bg-slate-950 overflow-hidden">
      <DoctorVisitHub
        onClose={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back()
          } else {
            router.push("/?page=type-health-records")
          }
        }}
        onNavigateTab={(tab) => {
          if (typeof window !== "undefined") {
            localStorage.setItem("slh-health-target-tab", tab)
          }
          router.push("/?page=type-health-records")
        }}
        theme="dark"
      />
    </main>
  )
}
