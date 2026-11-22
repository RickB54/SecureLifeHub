"use client"

import React, { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DoctorVisitHub from "@/components/doctor-visit-hub/DoctorVisitHub"
import { VisitHubSectionId } from "@/components/doctor-visit-hub/doctor-visit-types"

function DoctorVisitHubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get("section") as VisitHubSectionId | null

  return (
    <main className="w-full h-screen bg-slate-950 overflow-hidden">
      <DoctorVisitHub
        initialSection={sectionParam || undefined}
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
